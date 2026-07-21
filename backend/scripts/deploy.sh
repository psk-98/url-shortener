#!/bin/sh -e

set -e

echo "Going into main dir"
cd /home/lullaby/sites/url-shortener


echo "Fetching changes"
git fetch origin trunk
git reset --hard "origin/trunk"

echo "Going into backend dir"
cd /home/lullaby/sites/url-shortener/backend

cp .docker/docker-composer.prod.yml docker-compose.yml
sudo docker compose up -d --build
