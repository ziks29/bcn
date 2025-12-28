#!/bin/sh

# Exit on error
set -e

echo "Starting BCN App Entrypoint..."

# Run Prisma database sync
if [ -n "$DATABASE_URL" ]; then
  echo "Synchronizing Prisma schema with MongoDB Atlas..."
  prisma db push --schema=./prisma/schema.prisma --accept-data-loss --skip-generate
  
  # Optional: Seed data if needed (uncomment to enable)
  # echo "Seeding database..."
  # npx prisma db seed
else
  echo "WARNING: DATABASE_URL not set, skipping database sync"
fi

# Execute the main command (passed as CMD in Dockerfile)
echo "Starting application..."
exec "$@"
