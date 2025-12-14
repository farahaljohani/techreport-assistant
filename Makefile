.PHONY: help build up down logs clean dev prod shell-backend shell-frontend

help:
	@echo "Tech Report Assistant - Docker Commands"
	@echo "========================================="
	@echo "make build          - Build Docker images"
	@echo "make up             - Start containers (dev)"
	@echo "make down           - Stop containers"
	@echo "make logs           - View logs (follow mode)"
	@echo "make clean          - Remove containers & volumes"
	@echo "make dev            - Build and start (dev)"
	@echo "make prod           - Start production"
	@echo "make shell-backend  - Shell into backend"
	@echo "make shell-frontend - Shell into frontend"

build:
	docker-compose build

up:
	docker-compose up

down:
	docker-compose down

logs:
	docker-compose logs -f

clean:
	docker-compose down -v
	docker system prune -a

dev: build up

prod:
	docker-compose -f docker-compose.prod.yml up --build -d

shell-backend:
	docker-compose exec backend bash

shell-frontend:
	docker-compose exec frontend sh
