#!/bin/bash
set -e  # zakończ, jeśli wystąpi błąd

echo "🔄 Pulling latest changes from Git..."
git pull

echo "🛑 Stopping and removing old containers..."
docker compose down

echo "🏗️ Building new images..."
docker compose build --no-cache

echo "🚀 Starting containers in detached mode..."
docker compose up -d

echo "✅ Deployment complete!"
