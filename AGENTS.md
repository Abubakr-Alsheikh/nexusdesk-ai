# NexusDesk AI - Agent Coding Guidelines

This document provides instructions for agentic coding agents operating in this repository.

## Project Overview

NexusDesk AI is an enterprise-grade microservice that ingests customer support tickets, uses an LLM to categorize and prioritize them, and saves them to a PostgreSQL database.

### Tech Stack

- **Runtime:** Node.js v20+
- **Language:** TypeScript (Strict Mode)
- **Framework:** Express.js
- **Database:** PostgreSQL via Prisma
- **Queue:** BullMQ with Redis
- **Testing:** Jest with Supertest
- **Validation:** Zod
- **AI:** OpenAI SDK

---

## Build, Lint, and Test Commands

### Development

```bash
npm run dev          # Start server with nodemon (watch mode)
npm run build        # Compile TypeScript to ./dist
npm run start        # Run production server from ./dist
```

### Database

```bash
npm run db:migrate   # Run Prisma migrations (creates tables)
npm run db:studio    # Open Prisma Studio (GUI for DB)
```

### Linting & Formatting

```bash
npm run lint         # Lint TypeScript files
npx prettier --write src/  # Format code
```

### Running Tests

```bash
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
```

Tests use Jest with mocked Prisma and BullMQ for fast, deterministic execution without external dependencies.

---

## Code Style Guidelines

### General Principles

1. **Strict Layering:** Controllers handle HTTP only. Services handle business logic. Prisma handles DB. Never put Prisma or LLM calls inside routes/controllers.
2. **Fail-Fast Initialization:** Validate all environment variables at startup using Zod (`src/config/env.ts`). Crash immediately if invalid.
3. **No `any` Types:** Use explicit TypeScript interfaces or infer from Zod schemas. ESLint enforces `@typescript-eslint/no-explicit-any: error`.
4. **No Silent Failures:** Use `catchAsync` wrapper for all controllers. All errors must flow to `errorHandler.ts`. Use `AppError` for operational errors.
5. **Deterministic AI:** AI service must use structured prompts with JSON mode and validate LLM output against Zod schemas before trusting it.

### Imports

- Use absolute imports from project root (e.g., `import { env } from '../config/env'`)
- Order: external libraries → internal modules → relative paths
- No barrel exports (index files) unless necessary

### Formatting (Prettier)

- Semi-colons: Yes
- Trailing commas: All
- Single quotes: Yes
- Print width: 80
- Tab width: 2

### Naming Conventions

- **Files:** kebab-case (e.g., `ticket.service.ts`, `app-error.ts`)
- **Classes:** PascalCase (e.g., `TicketController`, `AIService`)
- **Functions/variables:** camelCase
- **Constants:** SCREAMING_SNAKE_CASE
- **Interfaces:** PascalCase, optionally with `I` prefix (prefer without)

### Types

- Always use explicit types for function parameters and return types
- Use Zod `z.infer<>` to derive types from schemas
- Never use `any` - ESLint will error

### Error Handling

- Throw `AppError` for operational errors with HTTP status code
- Wrap async controller functions with `catchAsync` utility
- Use global `errorHandler` middleware for consistent error responses
- Log errors appropriately (use console.warn/console.error, not console.log)

### Zod Validation

- Define schemas in `src/validators/`
- Use `z.infer<>` to derive TypeScript types
- Validate request bodies in middleware using `validate` middleware
- Validate AI responses before using them (detect hallucinations)

### Project Structure

```
nexusdesk-ai/
├── src/
│   ├── server.ts          # Entry point
│   ├── app.ts             # Express configuration
│   ├── config/
│   │   ├── env.ts         # Zod environment validation
│   │   ├── redis.ts       # BullMQ/Redis configuration
│   │   └── swagger.ts     # Swagger UI configuration
│   ├── utils/
│   │   ├── AppError.ts    # Custom error class
│   │   └── catchAsync.ts  # Async wrapper
│   ├── middlewares/
│   │   ├── errorHandler.ts
│   │   └── validate.ts
│   ├── validators/
│   │   ├── ticket.schema.ts
│   │   └── ai.schema.ts
│   ├── services/
│   │   ├── ai.service.ts
│   │   ├── ticket.service.ts
│   │   ├── db.service.ts
│   │   ├── queue.service.ts   # BullMQ producer
│   │   └── worker.service.ts  # BullMQ consumer
│   ├── controllers/
│   │   └── ticket.controller.ts
│   ├── routes/
│   │   ├── index.ts
│   │   └── ticket.routes.ts
│   ├── __mocks__/
│   │   └── prisma.ts          # Jest Prisma mock
│   └── tests/
│       └── setup.ts           # Jest setup file
├── public/
│   └── index.html         # Live Triage Dashboard
├── prisma/
│   └── schema.prisma
├── .github/workflows/
│   └── ci.yml            # GitHub Actions CI/CD
├── docker-compose.yml
├── Dockerfile            # Multi-stage production build
├── jest.config.js
├── eslint.config.js
├── tsconfig.json
└── package.json
```

### Database (Prisma)

- All database operations in service layer
- Use Prisma client instance from `db.service.ts`
- Define models in `prisma/schema.prisma`
- Run migrations with `npm run db:migrate`

### Environment Variables

Required in `.env`:

```
NODE_ENV=development
PORT=3000
DB_USER=<user>
DB_PASSWORD=<password>
DB_NAME=<dbname>
DB_PORT=5432
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
AI_API_KEY=<openai-key>
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-5-nano
```

---

## Cursor/Copilot Rules

None configured. If adding, place in:

- `.cursor/rules/` for Cursor
- `.cursorrules` for Cursor (single file)
- `.github/copilot-instructions.md` for GitHub Copilot

---

## Common Tasks

### Add a new route

1. Create validator schema in `src/validators/`
2. Add controller method in appropriate controller
3. Register route in `src/routes/`
4. Mount in `src/routes/index.ts`

### Add a new service

1. Create class in `src/services/`
2. Follow naming: `XxxService` with static methods or singleton pattern
3. No direct Express types in services (Request/Response)

### Run the application

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Run migrations
npm run db:migrate

# Start dev server
npm run dev
```

### Build for production

```bash
npm run build
npm run start
```

### Docker

```bash
# Build Docker image
docker build -t nexusdesk-ai:latest .

# Run container
docker run -p 3000:3000 nexusdesk-ai:latest
```

---

## CI/CD

The project includes GitHub Actions workflows in `.github/workflows/ci.yml`:

- Runs on push to main/develop branches and PRs to main
- Quality Control: Type check, Prisma generate, Tests
- Build: Docker image build on main branch push

FINAL REQUEST (VERY IMPORTANT REQUEST):

After finishing the changes that you made or the task that asked for, update the Agents.md file and README.md to keep the context of the project updated if new feature or structure added
