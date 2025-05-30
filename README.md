<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Mock API Server (JSONPlaceholder Clone)

This project is a backend API that replicates the behavior and structure of <https://jsonplaceholder.typicode.com>, with extended support for full REST operations, JWT-based authentication, structured user data storage in PostgreSQL, and containerized deployment with Docker.

## Features

- **Users Module**: CRUD operations for users, mimicking the `/users` endpoint of JSONPlaceholder.
- **Authentication**: JWT-based authentication with registration (`/auth/register`) and login (`/auth/login`) endpoints. Password hashing using bcryptjs.
- **Database**: PostgreSQL for data storage, managed with TypeORM.
- **Containerization**: Docker and Docker Compose for easy setup and deployment.
- **Data Seeding**: Initial user data (from JSONPlaceholder) can be seeded into the database.
- **Input Validation**: DTOs with `class-validator` for request payload validation.

## Prerequisites

- [Docker](https://www.docker.com/get-started) installed and running.
- [Docker Compose](https://docs.docker.com/compose/install/) installed.
- A terminal or command prompt.

## Project Setup and Usage

1.  **Clone the Repository (if applicable)**
    If you haven't already, clone the repository to your local machine.

    ```bash
    # git clone <repository-url>
    # cd mock-api-server
    ```

2.  **Create Environment File**
    Navigate to the `mock-api-server` project directory. Create a `.env` file by copying the example or creating a new one. This file will store your database credentials and JWT secret.

    Example `.env` content:

    ```env
    DATABASE_HOST=db
    DATABASE_PORT=5432
    DATABASE_USERNAME=postgres
    DATABASE_PASSWORD=postgres
    DATABASE_NAME=mock_api

    JWT_SECRET=yourSuperSecretKeyForDevelopment
    JWT_EXPIRATION_TIME=3600s
    ```

    **Important**: Replace `yourSuperSecretKeyForDevelopment` with a strong, unique secret for your JWT tokens.

3.  **Build and Run with Docker Compose**
    From the `mock-api-server` directory, run the following command to build the Docker images and start the application and database containers:

    ```bash
    docker-compose up --build -d
    ```

    The `-d` flag runs the containers in detached mode (in the background).
    The application will be accessible at `http://localhost:3000`.

4.  **Seed the Database (Initial Data)**
    Once the containers are up and running (especially the database), you can seed the database with initial user data. Execute the following command:

    ```bash
    docker-compose exec app npm run seed
    ```

    This will populate the `users` table with data from JSONPlaceholder.

5.  **Stopping the Application**
    To stop the running Docker containers, use:
    ```bash
    docker-compose down
    ```
    To stop and remove volumes (like the database data), use:
    ```bash
    docker-compose down -v
    ```

## API Endpoints

All responses are in JSON format.

### Authentication (`/auth`)

- `POST /auth/register`
  - Registers a new user.
  - **Body**: `CreateUserDto` (includes `name`, `username`, `email`, `password`, `address`, `phone`, `website`, `company`).
  - **Response**: The created user object (excluding password).
- `POST /auth/login`
  - Logs in an existing user.
  - **Body**: `LoginDto` (includes `email`, `password`).
  - **Response**: `{ accessToken: string }`.
- `GET /auth/profile`
  - **Protected**: Requires JWT Bearer token in Authorization header.
  - Returns the profile of the currently authenticated user (excluding password).
- `GET /auth/admin/test`
  - Smoke test for the auth module.
  - **Response**: `Auth module is working!`

### Users (`/users`)

- `POST /users`
  - Creates a new user.
  - **Body**: `CreateUserDto`.
  - **Response**: The created user object.
  - _Note: For authenticated user creation, consider using `/auth/register` or protecting this route._
- `GET /users`
  - Retrieves a list of all users.
- `GET /users/:id`
  - Retrieves a specific user by their ID.
- `PATCH /users/:id`
  - Updates a specific user by their ID.
  - **Body**: `UpdateUserDto` (all fields optional).
- `DELETE /users/:id`
  - Deletes a specific user by their ID.
  - **Response**: `204 No Content` on success.
- `GET /users/admin/test`
  - Smoke test for the users module.
  - **Response**: `Users module is working!`

## Running Tests (Inside Docker Container or Locally)

The standard NestJS test scripts are available:

```bash
# To run tests inside the running 'app' container:
docker-compose exec app npm run test       # Unit tests
docker-compose exec app npm run test:e2e    # End-to-end tests
docker-compose exec app npm run test:cov   # Test coverage

# Or, if you have Node.js and npm installed locally and dependencies installed (npm install):
npm run test
npm run test:e2e
npm run test:cov
```

## Original NestJS README Content

(The original NestJS README content about generic NestJS commands, resources, and support follows below.)

---

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation (Original - for local development without Docker)

```bash
$ npm install
```

## Running the app (Original - for local development without Docker)

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test (Original - for local development without Docker)

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
