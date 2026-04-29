# Transaction Tracker API

A simple REST API for managing financial transactions, built as a study project to practice backend fundamentals such as routing, data persistence, session handling, and testing.

## Overview

This project implements a basic financial ledger where users can:

- Create transactions (credit or debit)
- List all transactions linked to a session
- Retrieve a specific transaction
- Get a summary (balance)

The API uses a session-based approach with cookies to isolate user data.

## Tech Stack

- Node.js
- TypeScript
- Fastify
- Knex.js
- SQLite
- Zod
- Vitest
- Supertest

## Architecture Notes

The project follows a simple and modular structure:

- Routes layer handles HTTP logic
- Database layer uses Knex for queries and migrations
- Middleware enforces session validation
- Environment validation ensures correct configuration using Zod
- Tests validate all core behaviors

## Session Handling

- A `sessionId` is generated and stored in cookies on the first transaction creation
- All subsequent requests must include this cookie
- Transactions are scoped by `session_id`

This avoids implementing full authentication while still simulating user isolation.

## API Endpoints

### Create Transaction
`POST /transactions/create`

```json
{
  "title": "Salary",
  "amount": 5000,
  "type": "credit"
}
```

### List Transactions
`GET /transactions`

### Get Transaction by ID
`GET /transactions/:id`

### Get Summary
`GET /transactions/summary`

Returns the total balance (credits - debits)

## Database

### Table: transactions

| Column      | Type       |
|------------|-----------|
| id         | uuid      |
| title      | text      |
| amount     | decimal   |
| created_at | timestamp |
| session_id | uuid      |

## Migrations

Migrations are used to:

- Create the `transactions` table
- Add the `session_id` column

Run migrations with:

```bash
npm run knex migrate:latest
```

Rollback:

```bash
npm run knex migrate:rollback --all
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
DATABASE_URL=your_database_file
PORT=your_port
```

### Run the server

```bash
npm run dev
```

## Testing

This project includes end-to-end tests covering all main flows:

- Transaction creation
- Listing transactions
- Fetching by ID
- Summary calculation

Run tests with:

```bash
npm run test
```

## What This Project Focuses On

This project was built to practice:

- Building REST APIs with Fastify
- Structuring a backend project
- Using query builders (Knex)
- Managing database migrations
- Handling sessions with cookies
- Writing automated tests

## Future Improvements

### Features
- [ ] Implement update transaction (`PUT /transactions/:id`)
- [ ] Implement delete transaction (`DELETE /transactions/:id`)
- [ ] Add filtering (by type, amount range, date)
- [ ] Add pagination to transaction listing
- [ ] Add categories for transactions
- [ ] Implement summary by category
- [ ] Add monthly financial summary

### Architecture
- [ ] Refactor to layered architecture (controllers, services, repositories)
- [ ] Improve validation and error handling

### Security
- [ ] Add authentication (JWT or OAuth)
- [ ] Implement rate limiting

### Infrastructure
- [ ] Add Docker support
- [ ] Replace SQLite with PostgreSQL

### Frontend
- [ ] Build a frontend client to consume the API
