# Transaction Tracker API

A REST API for managing personal financial transactions, being built as a study project to practice backend fundamentals such as routing, authentication, data persistence, and testing.

## Overview

Users can register, authenticate, and manage their financial transactions:

- Register and login with JWT authentication
- Create transactions (income or expense)
- List all transactions linked to their account
- Retrieve a specific transaction
- Delete a transaction

## Tech Stack

- Node.js
- TypeScript
- Fastify
- Prisma ORM
- PostgreSQL
- Zod
- Vitest
- @fastify/jwt
- bcrypt

## Architecture

The project follows a layered, modular structure:

```
src/
├── modules/
│   ├── auth/
│   │   ├── auth-controller.ts
│   │   ├── auth-service.ts
│   │   ├── auth-repository.ts
│   │   ├── auth-service-factory.ts
│   │   ├── auth-schemas.ts
│   │   ├── auth-routes.ts
│   │   └── in-memory-auth-repository.ts
│   └── transactions/
│       ├── transactions-controller.ts
│       ├── transactions-service.ts
│       ├── transactions-repository.ts
│       ├── transactions-service-factory.ts
│       ├── transactions-schemas.ts
│       ├── transactions-routes.ts
│       └── in-memory-transactions-repository.ts
├── middlewares/
│   └── verify-middleware.ts
├── config/
│   ├── prisma.ts
│   └── jwt.ts
├── utils/
│   ├── auth-helper.ts
│   └── app-error.ts
└── @types/
    ├── auth-interfaces.ts
    ├── transactions-interfaces.ts
    └── fastify-jwt.d.ts
```

Each module is self-contained with its own controller, service, repository, routes, and schemas. In-memory repository implementations are used for unit testing without hitting the database.

## Authentication

- JWT-based authentication with access and refresh tokens
- Access tokens expire in 20 minutes
- Refresh tokens expire in 7 days and are hashed before storage
- Passwords are hashed with bcrypt before storage
- All transaction routes are protected and require a valid Bearer token

## API Endpoints

### Auth

#### Register
`POST /auth/register`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

#### Login
`POST /auth/login`
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

#### Refresh Token
`POST /auth/refresh`
```json
{
  "refreshToken": "your-refresh-token"
}
```

#### Logout
`POST /auth/logout`

Requires `Authorization: Bearer <token>` header.

---

### Transactions

All transaction endpoints require `Authorization: Bearer <token>` header.

#### Create Transaction
`POST /transactions/create`
```json
{
  "title": "Freelance payment",
  "amount": 1500.00,
  "type": "INCOME"
}
```

#### List Transactions
`GET /transactions/list`

#### Get Transaction by ID
`GET /transactions/:id`

#### Delete Transaction
`DELETE /transactions/remove/:id`

## Database

### Table: users

| Column        | Type           | Notes          |
|---------------|----------------|----------------|
| id            | uuid           | PK             |
| name          | text           |                |
| email         | text           | unique         |
| password_hash | text           |                |
| refresh_token | text           | nullable       |
| created_at    | timestamp      |                |
| updated_at    | timestamp      |                |

### Table: transactions

| Column     | Type           | Notes                     |
|------------|----------------|---------------------------|
| id         | uuid           | PK                        |
| title      | text           |                           |
| amount     | decimal(10, 2) |                           |
| type       | enum           | `INCOME` or `EXPENSE`     |
| user_id    | uuid           | FK → users, cascade delete|
| created_at | timestamp      |                           |
| updated_at | timestamp      |                           |

## Migrations

Migrations are managed by Prisma.

Run migrations:
```bash
npx prisma migrate dev
```

## Running the Project

### Install dependencies
```bash
npm install
```

### Configure environment variables

Create a `.env` file using the `.env.example` provided:
```env
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
PORT=your_port
JWT_SECRET=your_secret
```

### Run the server
```bash
npm run dev
```

## Testing

Unit tests cover all core service behaviors using in-memory repositories, so no database connection is needed to run them.

Covers:
- User registration, login, refresh, and logout
- Transaction creation, listing, fetching by ID, and deletion
- Ownership isolation (users cannot access each other's transactions)
- Error handling (404, 401, 409)

Run tests:
```bash
npm run test
```

## What This Project Focuses On

- Building REST APIs with Fastify
- Layered architecture (controllers, services, repositories)
- Dependency injection
- JWT authentication with refresh token rotation
- Password hashing and secure credential handling
- Using Prisma ORM and managing migrations
- Writing unit tests with in-memory repositories

## Future Improvements

### Features
- [ ] Implement update transaction (`PUT /transactions/:id`)
- [ ] Implement transactions summary (`GET /transactions/summary`)
- [ ] Add filtering (by type, amount range, date)
- [ ] Add pagination to transaction listing
- [ ] Add categories for transactions
- [ ] Implement summary by category
- [ ] Add monthly financial summary

### Architecture
- [ ] Improve validation and error handling
- [ ] Add end-to-end tests with Supertest

### Security
- [ ] Implement rate limiting

### Infrastructure
- [x] Add Docker support

### Frontend
- [ ] Build a frontend client to consume the API