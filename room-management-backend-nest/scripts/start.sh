#!/bin/sh

# Wait for database to be ready
echo "Waiting for database to be ready..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 1
done

echo "Database is ready! Running migrations..."

# Run database migrations
npx prisma migrate deploy

echo "Migrations completed! Starting application..."

# Start the application
exec node dist/main.js
