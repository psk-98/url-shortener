#!/bin/sh -e

set -e

echo "Going into main dir"
cd /home/lullaby/sites/url-shortener


echo "Fetching changes"
git fetch origin trunk
git reset --hard "origin/trunk"

echo "Going into backend dir"
cd /home/lullaby/sites/url-shortener/backend

cp /home/lullaby/sites/url-shortener/backend/.docker/docker-composer.prod.yml /home/lullaby/sites/url-shortener/backend/docker-compose.yml
sudo docker compose up -d --build
