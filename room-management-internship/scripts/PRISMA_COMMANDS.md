# Prisma Migrations – Copy/Paste Cheat Sheet

Use these commands directly in the terminal from `room-management-internship/`.

## Local (PostgreSQL)

Set the database URL (choose one):

```bash
# Option A: Export for the session
export DATABASE_URL="postgresql://postgres:2003@localhost:5432/room_management2"

# Option B: Load from repo root .env (if exists)
set -a; [ -f ../.env ] && source ../.env; set +a
```

Create DB if missing and generate client:

```bash
npx prisma db push --create-db --skip-generate
npx prisma generate
```

Create a new migration and apply to local:

```bash
# Replace MIGRATION_NAME with yours (letters, numbers, _, -)
npx prisma migrate dev --name MIGRATION_NAME --create-db
```

Check status:

```bash
npx prisma migrate status
```

Reset local DB (DANGEROUS – wipes data):

```bash
npx prisma migrate reset --force
```

## Remote (Production/Staging)

Set the remote DB URL:

```bash
export DATABASE_URL="postgresql://USER:PASS@HOST:5432/DBNAME?schema=public"
```

Create migration files without applying (optional safety):

```bash
npx prisma migrate dev --name MIGRATION_NAME --create-only
```

Deploy migrations to remote:

```bash
npx prisma migrate deploy
```

Generate client:

```bash
npx prisma generate
```

## Useful Diagnostics

```bash
npx prisma --version
npx prisma db pull --print
```

## Notes

- Always run commands from `room-management-internship/` where `schema.prisma` lives.
- For local, ensure Postgres is running and the user has rights to create DBs.
- Replace `MIGRATION_NAME` with a clear, kebab/underscore name.

