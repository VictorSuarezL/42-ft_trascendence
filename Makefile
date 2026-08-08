.PHONY: all build up down restart logs logs-backend logs-frontend ps db migrate prisma-generate db-shell db-tables db-users clean fclean re

COMPOSE = docker compose

all: build db migrate up

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

migrate:
	$(COMPOSE) run --rm backend npx prisma migrate deploy

prisma-generate:
	$(COMPOSE) run --rm backend npx prisma generate

db-shell:
	$(COMPOSE) exec database psql -U postgres -d transcendence

db-tables:
	$(COMPOSE) exec database psql -U postgres -d transcendence -c '\dt'

db-users:
	$(COMPOSE) exec database psql -U postgres -d transcendence -c 'SELECT * FROM "User";'

clean:
	$(COMPOSE) down

fclean:
	$(COMPOSE) down -v --remove-orphans

re: fclean all
