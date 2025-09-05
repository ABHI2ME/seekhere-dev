#!/bin/sh

# This script ensures the database is ready, applies migrations,
# and then starts the main application.

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Running Prisma migrations..."
# Apply database migrations
npx prisma migrate deploy

echo "Generating Prisma Client..."
# Generate the Prisma client
npx prisma generate

echo "Migrations complete. Starting the application..."
# Execute the command passed to this script (the CMD from Dockerfile)
exec "$@"