## Description

Example NestJS service, which demonstrates backend development skills.

## Project setup

```bash
# If you don't have `pnpm` already installed
$ corepack enable

$ pnpm install

$ cp .example.env .env
# Write env vars into .env
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

```

## Run the project using Docker Compose

```bash
$ docker compose build

$ docker compose up

```

## Run tests

```bash
# unit tests
$ pnpm run test

# test coverage
$ pnpm run test:cov
```

## API Endpoints

Private endpoints require `Authorization: Bearer ...` header.

Public:

- GET /health - Check application health
- POST /auth/login - Login and get access token
- POST /users - Create new user

Private:

- GET /users - Get all users in DB
- GET /users/{id} - Get user by his ID
- PATCH /users/{id} - Update user
- DELETE /users{id} - Delete user
