.PHONY: all build up down restart lan logs logs-backend logs-frontend ps db migrate prisma-generate-local prisma-generate-docker prisma-generate prisma-format prisma-validate prisma-check prisma-sync prisma-studio prisma-studio-stop db-shell db-tables db-users db-seed clean fclean re

COMPOSE = docker compose
PRISMA_STUDIO_PORT ?= 5555
PRISMA_STUDIO_CONTAINER ?= transcendence-prisma-studio
PORT ?= 3000
FRONTEND_PORT ?= 5173

all: build db db-push up db-seed

build:
	$(COMPOSE) build

up:
	$(COMPOSE) up -d \
		--build \
		--force-recreate \
		--renew-anon-volumes

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

prisma-generate-local:
	cd backend && npx prisma generate

prisma-generate-docker:
	$(COMPOSE) exec backend npx prisma generate

prisma-generate: prisma-generate-local prisma-generate-docker

prisma-check:
	$(COMPOSE) exec backend npx prisma format
	$(COMPOSE) exec backend npx prisma validate

prisma-sync:
	$(MAKE) prisma-check
	$(COMPOSE) exec backend npx prisma db push --skip-generate
	$(MAKE) prisma-generate

prisma-studio: db
	@if docker inspect $(PRISMA_STUDIO_CONTAINER) > /dev/null 2>&1; then \
		echo "Prisma Studio is already running."; \
	else \
		$(COMPOSE) run --rm --build -d \
			--name $(PRISMA_STUDIO_CONTAINER) \
			-p 127.0.0.1:$(PRISMA_STUDIO_PORT):5555 \
			backend \
			npx prisma studio --hostname 0.0.0.0 --port 5555; \
	fi
	@echo "Prisma Studio is up on http://localhost:$(PRISMA_STUDIO_PORT)"

prisma-studio-stop:
	@if docker inspect $(PRISMA_STUDIO_CONTAINER) > /dev/null 2>&1; then \
		docker stop $(PRISMA_STUDIO_CONTAINER) > /dev/null; \
		echo "Prisma Studio stopped."; \
	else \
		echo "Prisma Studio is not running."; \
	fi

db-shell:
	$(COMPOSE) exec database psql -U postgres -d transcendence

db-tables:
	$(COMPOSE) exec database psql -U postgres -d transcendence -c '\dt'

db-users:
	$(COMPOSE) exec database psql -U postgres -d transcendence -c 'SELECT * FROM "User";'

db-push:
	$(COMPOSE) exec backend npx prisma db push

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

db-seed: db
	$(COMPOSE) exec backend npx prisma db seed

clean:
	$(COMPOSE) down

fclean:
	$(COMPOSE) down -v --remove-orphans

lan: build db db-push
	@IP=$$(ipconfig getifaddr en0); \
	if [ -z "$$IP" ]; then \
		echo "No se pudo detectar la IP de la LAN."; \
		exit 1; \
	fi; \
	set -a; \
	. ./.env; \
	if [ -f .env.lan ]; then . ./.env.lan; fi; \
	set +a; \
	echo ""; \
	echo "========================================"; \
	echo "  LAN mode"; \
	echo "========================================"; \
	echo "  App: http://$$IP"; \
	echo "========================================"; \
	echo ""; \
	FRONTEND_URL=http://$$IP \
	FORTYTWO_REDIRECT_URI=http://$$IP/api/auth/42/callback \
	$(COMPOSE) up -d


re: fclean all
