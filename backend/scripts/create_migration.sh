#!/usr/bin/env bash

set -euo pipefail

MESSAGE="${1:-}"

if [ -z "$MESSAGE" ]; then
    echo "Usage: ./scripts/create_migration.sh \"migration message\""
    exit 1
fi

echo "Checking Alembic state..."
alembic current

echo "Creating migration: $MESSAGE"
alembic revision --autogenerate -m "$MESSAGE"

echo "Migration created successfully."
