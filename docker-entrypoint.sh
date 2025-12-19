#!/bin/sh
set -e

echo "Starting container entrypoint..."

# If DATABASE_URL is set, try to run migrations (use deploy in production)
if [ -n "$DATABASE_URL" ]; then
  echo "DATABASE_URL present, running prisma migrate deploy and generate"
  npx prisma migrate deploy || true
  npx prisma generate || true
else
  echo "No DATABASE_URL set; skipping migrations"
fi

echo "Starting Next.js"
exec npm run start
