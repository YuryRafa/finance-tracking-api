# 💸 Transactions Tracker API

A RESTful API for personal finance management built with Fastify, Prisma, and TypeScript. Track your incomes and expenses, view summaries, and manage your financial data securely.

---

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Fastify
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Language**: TypeScript
- **Auth**: JWT (access + refresh tokens)
- **Validation**: Zod
- **Testing**: Vitest
- **Docs**: Swagger UI (`@fastify/swagger`)

---

## 📁 Project Structure

```
src/
├── @types/                        # Global TypeScript interfaces
│   ├── auth-interfaces.ts
│   └── transactions-interfaces.ts
├── config/
│   ├── prisma.ts                  # Prisma client instance
│   └── jwt.ts                     # JWT Fastify plugin
├── env/
│   └── index.ts                   # Environment variable validation
├── generated/
│   └── prisma/                    # Prisma generated client
├── middlewares/
│   └── verify-middleware.ts       # JWT auth guard
├── modules/
│   ├── auth/
│   │   ├── auth-controller.ts
│   │   ├── auth-repository.ts
│   │   ├── auth-schemas.ts        # Zod schemas + OpenAPI definitions
│   │   ├── auth-service.ts
│   │   ├── auth-service-factory.ts
│   │   └── in-memory-auth-repository.ts
│   └── transactions/
│       ├── transactions-controller.ts
│       ├── transactions-repository.ts
│       ├── transactions-schemas.ts
│       ├── transactions-service.ts
│       ├── transactions-service-factory.ts
│       └── in-memory-transactions-repository.ts
├── routes/
│   ├── auth-routes.ts
│   └── transactions-routes.ts
├── utils/
│   ├── app-error.ts               # Custom error class
│   └── auth-helper.ts             # Password hashing + token generation
├── app.ts
└── server.ts
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/transactions-tracker-api.git
cd transactions-tracker-api

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/transactions_db"
JWT_SECRET="your_jwt_secret"
PORT=3000
```

### Database Setup

```bash
# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### Running the Server

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

### API Documentation

With the server running, visit:

```
http://localhost:3000/docs
```

---

## 🔐 Authentication

All transaction routes require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <accessToken>
```

Tokens are obtained via `/auth/login`. Use `/auth/refresh` to rotate them before expiry.

---

## 📡 API Endpoints

### Auth

| Method | Route            | Description                  | Auth |
|--------|------------------|------------------------------|------|
| POST   | `/auth/register` | Register a new user          | ❌   |
| POST   | `/auth/login`    | Login and receive tokens     | ❌   |
| POST   | `/auth/refresh`  | Refresh access token         | ❌   |
| POST   | `/auth/logout`   | Invalidate refresh token     | ✅   |

### Transactions

| Method | Route                        | Description                        | Auth |
|--------|------------------------------|------------------------------------|------|
| POST   | `/transactions/create`       | Create a new transaction           | ✅   |
| GET    | `/transactions/list`         | List all user transactions         | ✅   |
| GET    | `/transactions/summary`      | Get income/expense/balance summary | ✅   |
| GET    | `/transactions/:id`          | Get a transaction by ID            | ✅   |
| PUT    | `/transactions/update/:id`   | Update a transaction               | ✅   |
| DELETE | `/transactions/remove/:id`   | Delete a transaction               | ✅   |

---

## 📊 Summary Response

```json
{
  "income": 3000.00,
  "expense": 1500.00,
  "balance": 1500.00
}
```

---

## 🧪 Running Tests

```bash
npm run test
```

Tests use an in-memory repository — no database required. Both `AuthService` and `TransactionsService` are fully covered.

---

## ✅ Checklist

### Auth
- [x] Register (`POST /auth/register`)
- [x] Login (`POST /auth/login`)
- [x] Refresh token (`POST /auth/refresh`)
- [x] Logout (`POST /auth/logout`)
- [x] JWT middleware (`verifyJwt`)
- [x] Password hashing (bcrypt)
- [x] Refresh token hashing + rotation
- [ ] Email verification on register
- [ ] Revoke all sessions (logout everywhere)
- [ ] Rate limiting on auth routes
- [ ] Password reset (`POST /auth/password`)

### Transactions
- [x] Create transaction (`POST /transactions/create`)
- [x] List transactions (`GET /transactions/list`)
- [x] Get transaction by ID (`GET /transactions/:id`)
- [x] Delete transaction (`DELETE /transactions/remove/:id`)
- [x] Update transaction (`PUT /transactions/update/:id`)
- [x] Summary — income, expense, balance (`GET /transactions/summary`)
- [ ] Filter by type, date range, amount range
- [ ] Search by title
- [ ] Pagination + total count on listing
- [ ] Sort by date, amount, title

### Categories
- [ ] CRUD for categories
- [ ] Attach category to transaction
- [ ] Summary grouped by category
- [ ] Monthly summary per category

### Budgets
- [ ] Create budget per category with spending limit
- [ ] Track spent vs limit
- [ ] Alert when budget is exceeded

### Recurring Transactions
- [ ] Create recurring rules (weekly, monthly, yearly)
- [ ] Auto-generate transactions from rules
- [ ] Pause/cancel recurring transactions


### Reports
- [ ] Monthly income vs expense breakdown
- [ ] Cash flow over time
- [ ] Biggest expense categories
- [ ] Export to CSV/PDF

### Developer Experience
- [x] Repository pattern (decoupled from Prisma)
- [x] In-memory repositories for unit tests
- [x] Unit tests with Vitest — Auth + Transactions
- [x] OpenAPI/Swagger documentation
- [x] Zod validation on all inputs
- [x] Custom `AppError` class with status codes
- [x] Service factory pattern
- [ ] Integration tests with real test database
- [ ] Seed script for development data
- [ ] API versioning (`/v1/`)
- [ ] Request logging with correlation IDs
- [ ] Health check endpoint (`GET /health`)

---
