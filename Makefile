.PHONY: all build up down restart logs logs-backend logs-frontend ps db migrate prisma-generate prisma-studio db-shell db-tables db-users clean fclean re

COMPOSE = docker compose
PRISMA_STUDIO_PORT ?= 5555

all: build db db-push up

build:
	$(COMPOSE) build

up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

restart: down up

logs:
	$(COMPOSE) logs -f

logs-backend:
	$(COMPOSE) logs -f backend

logs-frontend:
	$(COMPOSE) logs -f frontend

ps:
	$(COMPOSE) ps

db:
	$(COMPOSE) up -d database
	@echo "Waiting for PostgreSQL..."
	@until $(COMPOSE) exec -T database pg_isready -U postgres -d transcendence > /dev/null 2>&1; do \
		sleep 1; \
	done
	@echo "PostgreSQL is ready."

prisma-generate:
	$(COMPOSE) run --rm backend npx prisma generate

prisma-studio: db
	$(COMPOSE) run --rm --build \
		-p 127.0.0.1:$(PRISMA_STUDIO_PORT):5555 \
		backend \
		npx prisma studio --hostname 0.0.0.0 --port 5555

db-shell:
	$(COMPOSE) exec database psql -U postgres -d transcendence

db-tables:
	$(COMPOSE) exec database psql -U postgres -d transcendence -c '\dt'

db-users:
	$(COMPOSE) exec database psql -U postgres -d transcendence -c 'SELECT * FROM "User";'

db-push:
	$(COMPOSE) run --rm backend npx prisma db push

reset-db:
	$(COMPOSE) down -v --remove-orphans
	$(COMPOSE) up -d database
	@echo "Waiting for PostgreSQL..."
	@until $(COMPOSE) exec -T database pg_isready -U postgres -d transcendence > /dev/null 2>&1; do \
		sleep 1; \
	done
	@echo "PostgreSQL is ready."
	$(COMPOSE) run --rm backend npx prisma db push
	$(COMPOSE) run --rm backend npx prisma generate

clean:
	$(COMPOSE) down

fclean:
	$(COMPOSE) down -v --remove-orphans

re: fclean all
