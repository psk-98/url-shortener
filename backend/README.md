# URL Shortener

This project is mainly for learning [fastapi](https://fastapi.tiangolo.com), while also playing around [docker](https://www.docker.com/) and [nginx](https://nginx.org/) to improve the devops skills. 

## Development workflow

#Postgresql

```bash
cp ./.docker/docker-compose.dev.yml docker-compose.yml
cp example.dev.env .env
docker-compose up -d
uv sync
uv run fastapi dev app/main.py
```

Visit http://localhost:8000
