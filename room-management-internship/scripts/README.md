# Migration Script

This directory contains scripts for managing Prisma database migrations.

## migrate.sh

A comprehensive script for creating and applying Prisma migrations with support for both local and remote environments.

### Usage

```bash
# Basic usage (local environment)
./scripts/migrate.sh -n "migration_name"

# Using npm script
npm run db:migrate -- -n "migration_name"

# For remote environment
./scripts/migrate.sh -n "migration_name" -e remote

# Specify a custom .env file (e.g., repo root)
./scripts/migrate.sh -n "migration_name" -E ../.env

# Provide database URL directly (highest precedence)
./scripts/migrate.sh -n "migration_name" -D "postgresql://user:pass@localhost:5432/db?schema=public"

# Force migration without confirmation
./scripts/migrate.sh -n "migration_name" -f

# Show help
./scripts/migrate.sh -h
```

### Options

- `-n, --name`: Migration name (required)
- `-e, --env`: Environment (local|remote) - defaults to local
- `-f, --force`: Force migration (skip confirmation)
- `-E, --env-file`: Path to a specific .env file (overrides auto-detection)
- `-D, --db-url`: Database URL that overrides env and inline default
- `-h, --help`: Show help message

### Examples

```bash
# Create a migration for adding user roles
./scripts/migrate.sh -n "add_user_roles"

# Create a migration for updating booking schema
./scripts/migrate.sh -n "update_booking_schema" -e remote

# Create a migration for adding notifications (force)
./scripts/migrate.sh -n "add_notifications" -f
```

### What the script does

1. **Validates inputs**: Checks migration name and environment
2. **Checks prerequisites**: Verifies Prisma CLI and database connection
3. **Shows current status**: Displays current migration status
4. **Confirms migration**: Asks for confirmation (unless forced)
5. **Creates migration**: Generates migration files
6. **Applies migration**: Applies to the specified environment
7. **Generates client**: Updates Prisma client
8. **Shows final status**: Displays updated migration status

### Environment Setup

Make sure you have:
- Node.js and npm installed
- Prisma CLI available (`npx prisma --version`)
- `.env` file with `DATABASE_URL` configured
- Or set the inline default in `scripts/migrate.sh` by editing `INLINE_DEFAULT_DATABASE_URL`
- Database accessible from your environment

### Troubleshooting

- **Database connection issues**: Check your `DATABASE_URL` in `.env`
- **Permission denied**: Make sure the script is executable (`chmod +x scripts/migrate.sh`)
- **Migration conflicts**: Review existing migrations and resolve conflicts manually
- **Remote deployment**: Ensure your remote database is accessible and credentials are correct
