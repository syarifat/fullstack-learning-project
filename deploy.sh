#!/bin/bash

# TeleConsult Deployment Script
# Usage: ./deploy.sh [environment]
# Example: ./deploy.sh production

set -e

ENV=${1:-development}
COMPOSE_FILE="docker-compose.yml"

if [ "$ENV" = "production" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
    ENV_FILE=".env.prod"
else
    ENV_FILE=".env"
fi

echo "🚀 Deploying TeleConsult - Environment: $ENV"

# Check if env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: $ENV_FILE not found"
    echo "Copy .env.example to $ENV_FILE and configure it first"
    exit 1
fi

# Load environment variables
export $(grep -v '^#' $ENV_FILE | xargs)

echo "📦 Pulling latest images..."
docker compose -f $COMPOSE_FILE pull

echo "🔨 Building services..."
docker compose -f $COMPOSE_FILE build

echo "🛑 Stopping old containers..."
docker compose -f $COMPOSE_FILE down

echo "🗄️  Running database migrations..."
docker compose -f $COMPOSE_FILE run --rm backend npx prisma migrate deploy

echo "🚢 Starting services..."
docker compose -f $COMPOSE_FILE up -d

echo "⏳ Waiting for services to be healthy..."
sleep 10

echo "✅ Deployment complete!"
echo ""
echo "Services running:"
docker compose -f $COMPOSE_FILE ps

echo ""
echo "📊 Logs: docker compose -f $COMPOSE_FILE logs -f"
echo "🛑 Stop: docker compose -f $COMPOSE_FILE down"
echo "🔄 Restart: docker compose -f $COMPOSE_FILE restart"
