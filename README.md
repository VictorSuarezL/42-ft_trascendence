# ft_trascendence

# Transcendence

Proyecto Transcendence desarrollado con Docker.

## Stack

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + TypeScript
- ORM: Prisma
- Database: PostgreSQL
- Containerization: Docker + Docker Compose
- Automation: Makefile

## Architecture

```text
                         Browser
                            |
                            | HTTP
                            v
                  +-------------------+
                  |     Frontend      |
                  | React + Vite      |
                  |   localhost:5173  |
                  +---------+---------+
                            |
                            | HTTP / JSON
                            v
                  +-------------------+
                  |      Backend      |
                  | Node + Express    |
                  |   localhost:3000  |
                  +---------+---------+
                            |
                            | Prisma
                            v
                  +-------------------+
                  |    PostgreSQL     |
                  |   localhost:5432  |
                  +-------------------+
```

Todos los servicios se ejecutan mediante Docker.

## Requirements

Necesitas tener instalado:

- Docker
- Docker Compose
- Make

Comprueba las instalaciones:

```bash
docker --version
docker compose version
make --version
```

No necesitas instalar Node.js, PostgreSQL ni Prisma en tu máquina.

## First setup

Clona el repositorio:

```bash
git clone <REPOSITORY_URL>
cd transcendence
```

Después simplemente ejecuta:

```bash
make
```

Esto hará automáticamente:

1. Construirá las imágenes Docker.
2. Levantará PostgreSQL.
3. Esperará a que PostgreSQL esté disponible.
4. Aplicará las migraciones de Prisma.
5. Levantará frontend y backend.

Una vez terminado:

Frontend:

http://localhost:5173

Backend:

http://localhost:3000

Backend health check:

http://localhost:3000/health

## Make commands

### Start the project

```bash
make
```

Equivalent to:

```bash
make build
make db
make migrate
make up
```

### Build Docker images

```bash
make build
```

### Start the project

```bash
make up
```

### Stop the project

```bash
make down
```

### Restart

```bash
make restart
```

### Show running containers

```bash
make ps
```

### Show logs

```bash
make logs
```

Backend logs:

```bash
make logs-backend
```

Frontend logs:

```bash
make logs-frontend
```

### Database

Start PostgreSQL:

```bash
make db
```

Apply existing Prisma migrations:

```bash
make migrate
```

Generate Prisma Client:

```bash
make prisma-generate
```

## Creating a new database migration

When you modify:

```text
backend/prisma/schema.prisma
```

create a new migration with:

```bash
docker compose run --rm backend npx prisma migrate dev --name <migration_name>
```

For example:

```bash
docker compose run --rm backend npx prisma migrate dev --name add_users
```

This will create a new migration inside:

```text
backend/prisma/migrations/
```

The migration must be committed to Git.

After another developer pulls the changes, running:

```bash
make
```

will automatically apply the migration.

## Database

PostgreSQL runs in its own Docker container.

Default configuration:

```text
Host: localhost
Port: 5432
Database: transcendence
User: postgres
Password: postgres
```

The backend does not connect to PostgreSQL using `localhost`.

Inside Docker, the database is reachable using the Docker service name:

```text
database:5432
```

Therefore the backend uses:

```text
postgresql://postgres:postgres@database:5432/transcendence
```

## Current test flow

The project currently contains a simple end-to-end flow to verify that all services communicate correctly.

### 1. Frontend

Open:

```text
http://localhost:5173
```

The frontend contains a form with:

```text
Name
Email
```

### 2. Backend

The frontend sends:

```http
POST /users
```

with:

```json
{
  "name": "Alice",
  "email": "alice@example.com"
}
```

### 3. Prisma

The backend receives the request and executes:

```typescript
prisma.user.create(...)
```

### 4. PostgreSQL

The user is persisted in the PostgreSQL database.

### 5. Verification

Users can be retrieved with:

```http
GET /users
```

The backend should return something similar to:

```json
[
  {
    "id": 1,
    "name": "Alice",
    "email": "alice@example.com",
    "createdAt": "2026-08-08T..."
  }
]
```

## Project structure

```text
transcendence/
│
├── Makefile
├── README.md
├── docker-compose.yml
├── .env
├── .gitignore
│
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── src/
│
└── backend/
    ├── Dockerfile
    ├── package.json
    ├── tsconfig.json
    │
    ├── prisma/
    │   ├── schema.prisma
    │   └── migrations/
    │
    └── src/
        └── server.ts
```

## Development workflow

Before starting work:

```bash
git pull
make
```

Create a branch:

```bash
git checkout -b feature/<feature-name>
```

Example:

```bash
git checkout -b feature/user-authentication
```

After modifying the Prisma schema, create a migration:

```bash
docker compose run --rm backend npx prisma migrate dev --name <migration_name>
```

Then check the project:

```bash
make
```

Check the containers:

```bash
make ps
```

Check logs if something is not working:

```bash
make logs
```

## Useful Docker commands

List containers:

```bash
docker compose ps
```

Open backend shell:

```bash
docker compose exec backend sh
```

Open PostgreSQL:

```bash
docker compose exec database psql -U postgres -d transcendence
```

Exit PostgreSQL:

```text
\q
```

## Reset everything

If the database or Docker environment gets into a bad state:

```bash
make fclean
make
```

`fclean` removes Docker volumes, which means **all PostgreSQL data will be deleted**.

Use it only when you intentionally want to reset the database.

## Troubleshooting

### Backend is not running

Check:

```bash
make logs-backend
```

The backend should show:

```text
Backend running on port 3000
```

### Health check

Open:

```text
http://localhost:3000/health
```

Expected response:

```json
{
  "status": "ok"
}
```

### PostgreSQL is not ready

Check:

```bash
docker compose logs database
```

PostgreSQL should eventually report that it is ready to accept connections.

### Rebuild everything

If Docker is using an outdated image:

```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

Or simply:

```bash
make re
```

## Git

Do commit:

```text
backend/prisma/migrations/
```

Do not commit:

```text
.env
node_modules/
dist/
```

Make sure `.gitignore` contains:

```text
node_modules/
dist/
.env
```

## Team rule

The project should be reproducible using Docker.

A new developer should be able to clone the repository and run:

```bash
make
```

without installing Node.js or PostgreSQL locally.
