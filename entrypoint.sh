#!/bin/bash

# Run database migrations
echo "Running database migrations..."
alembic upgrade head

# Start the application
echo "Starting iine application..."
exec python -m app.main
