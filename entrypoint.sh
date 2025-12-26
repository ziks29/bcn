#!/bin/sh

# Exit on error
set -e

echo "Starting BCN App Entrypoint..."

# Run Prisma migrations
if [ -n "$DATABASE_URL" ]; then
  echo "Synchronizing Prisma schema..."
  # Use db push instead of migrate deploy since we don't have a migrations folder yet
  prisma db push --schema=./prisma/schema.prisma --accept-data-loss --skip-generate
  
  # Optional: Seed data if needed
  # echo "Seeding database..."
  # npx prisma db seed
else
  echo "WARNING: DATABASE_URL not set, skipping migrations"
fi

# Execute the main command (passed as CMD in Dockerfile)
echo "Starting application..."
exec "$@"
