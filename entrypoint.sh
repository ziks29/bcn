#!/bin/sh

# Exit on error
set -e

echo "Starting BCN App Entrypoint..."

# Run Prisma migrations
if [ -n "$DATABASE_URL" ]; then
  echo "Running Prisma migrations..."
  # Use npx to find prisma in node_modules
  # We use --schema to be explicit
  npx prisma migrate deploy --schema=./prisma/schema.prisma
  
  # Optional: Seed data if needed
  # echo "Seeding database..."
  # npx prisma db seed
else
  echo "WARNING: DATABASE_URL not set, skipping migrations"
fi

# Execute the main command (passed as CMD in Dockerfile)
echo "Starting application..."
exec "$@"
