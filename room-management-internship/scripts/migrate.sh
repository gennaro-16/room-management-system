#!/bin/bash

# Prisma Migration Script
#
# INLINE DATABASE URL PLACEHOLDER (optional):
#   If you want to hardcode a default database URL here, set it below.
#   Precedence order for DATABASE_URL used by Prisma:
#     1) --db-url flag
#     2) Loaded from .env / parent .env
#     3) INLINE_DEFAULT_DATABASE_URL (below)
#
# Example:
# INLINE_DEFAULT_DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public"
INLINE_DEFAULT_DATABASE_URL="postgresql://postgres:2003@localhost:5432/room_management3"
# Usage: ./scripts/migrate.sh -n "migration_name" [options]
# Options:
#   -n, --name     Migration name (required)
#   -e, --env      Environment (local|remote) - defaults to local
#   -f, --force    Force migration (skip confirmation)
#   -h, --help     Show help

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
MIGRATION_NAME=""
ENVIRONMENT="local"
CLI_DATABASE_URL=""
AUTO_CREATE_DB=true
FORCE=false
HELP=false

# Function to display help
show_help() {
    echo -e "${BLUE}Prisma Migration Script${NC}"
    echo ""
    echo "Usage: $0 -n \"migration_name\" [options]"
    echo ""
    echo "Options:"
    echo "  -n, --name     Migration name (required)"
    echo "  -e, --env      Environment (local|remote) - defaults to local"
    echo "  -f, --force    Force migration (skip confirmation)"
    echo "  -D, --db-url   Database URL (overrides inline default)"
    echo "  -C, --create-db  Attempt to create DB if missing (local only; default on)"
    echo "  -h, --help     Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -n \"add_user_roles\""
    echo "  $0 -n \"update_booking_schema\" -e remote"
    echo "  $0 -n \"add_notifications\" -f"
    echo "  $0 -n \"deploy_prod\" -e remote"
    echo "  $0 -n \"hotfix\" -D \"postgresql://user:pass@localhost:5432/db?schema=public\""
    echo ""
}

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Prisma is installed
check_prisma() {
    if ! command -v npx &> /dev/null; then
        print_error "npx is not installed. Please install Node.js and npm."
        exit 1
    fi
    
    if ! npx prisma --version &> /dev/null; then
        print_error "Prisma CLI is not available. Please install Prisma."
        exit 1
    fi
}

# Function to load environment (simplified for local development)
load_environment() {
    # Always use the inline DATABASE_URL for local development
    if [ -z "$CLI_DATABASE_URL" ]; then
        export DATABASE_URL="$INLINE_DEFAULT_DATABASE_URL"
        print_status "Using inline DATABASE_URL for local development"
    fi
}

# Function to establish DATABASE_URL (simplified)
establish_database_url() {
    if [ -n "$CLI_DATABASE_URL" ]; then
        export DATABASE_URL="$CLI_DATABASE_URL"
        print_status "DATABASE_URL set from --db-url flag"
    else
        export DATABASE_URL="$INLINE_DEFAULT_DATABASE_URL"
        print_status "DATABASE_URL set from inline default"
    fi
}

# Function to validate migration name
validate_migration_name() {
    if [ -z "$MIGRATION_NAME" ]; then
        print_error "Migration name is required. Use -n or --name option."
        show_help
        exit 1
    fi
    
    # Check if migration name contains only valid characters
    if [[ ! "$MIGRATION_NAME" =~ ^[a-zA-Z0-9_-]+$ ]]; then
        print_error "Migration name can only contain letters, numbers, hyphens, and underscores."
        exit 1
    fi
}

# Function to check database connection
check_database_connection() {
    print_status "Checking database connection..."
    
    if npx prisma db pull --print &> /dev/null; then
        print_success "Database connection successful"
    else
        if [ "$ENVIRONMENT" = "local" ] && [ "$AUTO_CREATE_DB" = true ]; then
            print_warning "Cannot connect. Attempting to create database (local)..."
            ensure_database_exists
            if npx prisma db pull --print &> /dev/null; then
                print_success "Database connection successful after creation"
                return
            fi
        fi
        print_error "Cannot connect to database. Ensure DATABASE_URL is correct and DB is reachable."
        exit 1
    fi
}

# Ensure database exists (local only)
ensure_database_exists() {
    # Use prisma db push to create tables and skip generating client
    if npx prisma db push --skip-generate &> /dev/null; then
        print_success "Database schema created/updated"
    else
        print_warning "Database schema creation failed."
    fi
}

# Function to create migration
create_migration() {
    print_status "Creating migration: $MIGRATION_NAME"
    
    if npx prisma migrate dev --name "$MIGRATION_NAME" --create-only; then
        print_success "Migration created successfully"
    else
        print_error "Failed to create migration"
        exit 1
    fi
}

# Function to apply migration
apply_migration() {
    print_status "Applying migration to $ENVIRONMENT database..."
    
    if [ "$ENVIRONMENT" = "remote" ]; then
        if npx prisma migrate deploy; then
            print_success "Migration applied to remote database"
        else
            print_error "Failed to apply migration to remote database"
            exit 1
        fi
    else
        if npx prisma migrate dev --name "$MIGRATION_NAME"; then
            print_success "Migration applied to local database"
        else
            print_error "Failed to apply migration to local database"
            exit 1
        fi
    fi
}

# Function to generate Prisma client
generate_client() {
    print_status "Generating Prisma client..."
    
    if npx prisma generate; then
        print_success "Prisma client generated successfully"
    else
        print_error "Failed to generate Prisma client"
        exit 1
    fi
}

# Function to show migration status
show_migration_status() {
    print_status "Current migration status:"
    npx prisma migrate status
}

# Function to confirm migration
confirm_migration() {
    if [ "$FORCE" = true ]; then
        return 0
    fi
    
    echo ""
    print_warning "This will create and apply a migration named: $MIGRATION_NAME"
    print_warning "Environment: $ENVIRONMENT"
    echo ""
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Migration cancelled by user"
        exit 0
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -n|--name)
            MIGRATION_NAME="$2"
            shift 2
            ;;
        -e|--env)
            ENVIRONMENT="$2"
            if [[ "$ENVIRONMENT" != "local" && "$ENVIRONMENT" != "remote" ]]; then
                print_error "Environment must be 'local' or 'remote'"
                exit 1
            fi
            shift 2
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -D|--db-url)
            CLI_DATABASE_URL="$2"
            shift 2
            ;;
        -C|--create-db)
            # Accept optional true/false, default to true if omitted
            if [[ "$2" == "true" || "$2" == "false" ]]; then
                AUTO_CREATE_DB=$2
                shift 2
            else
                AUTO_CREATE_DB=true
                shift
            fi
            ;;
        -h|--help)
            HELP=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Show help if requested
if [ "$HELP" = true ]; then
    show_help
    exit 0
fi

# Main execution
main() {
    echo -e "${BLUE}🚀 Prisma Migration Script${NC}"
    echo "=================================="
    
    # Validate inputs
    validate_migration_name
    
    # Check prerequisites
    check_prisma
    load_environment
    establish_database_url
    check_database_connection
    
    # Show current status
    show_migration_status
    
    # Confirm migration
    confirm_migration
    
    # Create and apply migration
    if [ "$ENVIRONMENT" = "local" ]; then
        # For local, we can create and apply in one command
        print_status "Creating and applying migration to local database..."
        if npx prisma migrate dev --name "$MIGRATION_NAME"; then
            print_success "Migration created and applied successfully"
        else
            print_error "Failed to create and apply migration"
            exit 1
        fi
    else
        # For remote, create first, then deploy
        create_migration
        apply_migration
    fi
    
    # Generate Prisma client
    generate_client
    
    # Show final status
    echo ""
    print_success "Migration process completed successfully!"
    show_migration_status
    
    echo ""
    print_status "Next steps:"
    echo "1. Review the generated migration files in prisma/migrations/"
    echo "2. Test your application with the new schema"
    echo "3. If everything works, commit the migration files to version control"
}

# Run main function
main
