#!/bin/sh

# Exit on error
set -e

echo "Starting BCN App Entrypoint..."

# Fix permissions on the volumes if we are running as root
if [ "$(id -u)" = '0' ]; then
  echo "Fixing permissions on /app/prisma..."
  chown -R nextjs:nodejs /app/prisma
  
  # Also ensure the entrypoint is run as nextjs
  echo "Dropping privileges to nextjs..."
  # Re-run this script as nextjs user if we started as root
  exec su-exec nextjs:nodejs "$0" "$@"
fi

# Everything below runs as the nextjs user

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
