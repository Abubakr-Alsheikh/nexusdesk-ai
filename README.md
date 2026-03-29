# NexusDesk AI 🚀

> **Enterprise-Grade AI Support Ticket Triage Microservice**

NexusDesk AI is a standalone microservice designed to solve the "Manual Triage Bottleneck" in large SaaS customer support teams. It ingests unstructured support tickets, utilizes a Large Language Model (LLM) to extract context, and automatically assigns categories and priorities before persisting the data to a PostgreSQL database.

---

## 🏗️ Architectural Overview

This project follows a **Strict Layered Architecture** to ensure maintainability, testability, and separation of concerns.

- **Controller Layer:** Handles HTTP requests/responses and delegates to services.
- **Service Layer (Business Logic):** Orchestrates the AI analysis and database interactions.
- **Validation Layer (Zod):** Enforces a "Security-First" approach by validating all incoming data and environment variables at runtime.
- **Data Layer (Prisma):** Provides type-safe database access with PostgreSQL.
- **AI Engine:** A deterministic LLM wrapper that enforces JSON Mode and validates AI hallucinations against a Zod schema.
- **Background Worker (BullMQ):** Processes AI analysis asynchronously via Redis queue for fast API responses.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js (v20+)
- **Language:** TypeScript (Strict Mode)
- **Framework:** Express.js
- **Database:** PostgreSQL 16 (via Docker)
- **Queue:** BullMQ with Redis (Background Job Processing)
- **ORM:** Prisma
- **Testing:** Jest with Supertest (Mocked Prisma & Redis)
- **Validation:** Zod (Request, AI Output, and Env validation)
- **AI:** OpenAI-compatible API (configurable - supports OpenAI, OpenRouter, Anthropic via Proxy, Ollama, etc.)
- **Logging:** Pino (structured JSON logging)
- **Observability:** Correlation ID tracking from API to background worker

---

## 🚀 Getting Started

### 1. Prerequisites

- [Docker](https://www.docker.com/) & Docker Compose
- [Node.js v20+](https://nodejs.org/)
- An OpenAI API Key (or OpenRouter/other OpenAI-compatible provider)

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/your-username/nexusdesk-ai.git
cd nexusdesk-ai

# Install dependencies
npm install
```

### 3. Environment Configuration

Copy the template and fill in your secrets:

```bash
cp .env.example .env
```

_Note: Ensure `DATABASE_URL` matches the credentials in your `docker-compose.yml`._

#### AI Configuration

| Variable      | Description                      | Default                     |
| ------------- | -------------------------------- | --------------------------- |
| `AI_API_KEY`  | API key for your AI provider     | (required)                  |
| `AI_BASE_URL` | Base URL for the AI API          | `https://api.openai.com/v1` |
| `AI_MODEL`    | Model to use for ticket analysis | `gpt-5-nano`                |

**Example for OpenRouter:**

```env
AI_API_KEY=sk-or-v1-your-openrouter-key
AI_BASE_URL=https://openrouter.ai/api/v1
AI_MODEL=google/gemini-flash-1.5
```

### 4. Infrastructure & Database Setup

```bash
# Start PostgreSQL and Redis containers
docker-compose up -d

# Generate Prisma Client & Run Migrations
npx prisma migrate dev --name init_schema
```

### 5. Start the Service

```bash
# Development mode (Nodemon)
npm run dev
```

---

## 📡 API Documentation

### Swagger UI

Interactive API documentation is available at **http://localhost:3000/docs**

- Try out endpoints directly from the browser
- View request/response schemas
- Access JSON spec at `/docs.json`

### Live Triage Dashboard

A real-time dashboard to see AI-powered ticket triage in action:

**URL:** http://localhost:3000/

Features:

- Submit new tickets and watch AI categorize them instantly
- View all tickets with assigned category and priority
- Auto-refreshes every 10 seconds

---

## 📡 API Documentation

### Authentication

All ticket endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

#### **Sign Up**

`POST /api/v1/auth/signup`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response (201 Created):**

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "...",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2023-10-27T..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### **Login**

`POST /api/v1/auth/login`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "...",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### **Create a Support Ticket**

`POST /api/v1/tickets`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "title": "Payment failing at checkout",
  "description": "I tried to upgrade to the Pro plan three times, but my card is being rejected with an error 500."
}
```

**Response (201 Created):**

```json
{
  "status": "success",
  "data": {
    "ticket": {
      "id": "...",
      "title": "Payment failing at checkout",
      "status": "PENDING",
      "category": null,
      "priority": null,
      "createdAt": "2023-10-27T..."
    }
  }
}
```

> **Note:** The ticket is created instantly with `PENDING` status. AI analysis happens asynchronously in the background via BullMQ/Redis worker.
> The `userId` is automatically derived from the JWT token - users can only see and create their own tickets.

---

## 🛡️ Enterprise Design Patterns Used

- **Fail-Fast Initialization:** The application validates all environment variables on startup. If a required key is missing, the process terminates immediately with a clear error.
- **Centralized Error Handling:** Uses a global Express middleware and a custom `AppError` class to handle operational vs. programming errors consistently.
- **Background Job Processing:** Uses BullMQ with Redis for async AI analysis - API returns instantly while AI processing happens in background with retry logic.
- **Deterministic AI Guardrails:** We use OpenAI's **JSON Mode** coupled with a **Zod validator** to ensure the LLM never returns invalid categories or priorities.
- **Containerization:** Full Docker support for reproducible development and deployment environments.
- **CI/CD Pipeline:** GitHub Actions automates linting, type checking, testing, and Docker image builds.
- **JWT Authentication:** Stateless JWT-based auth with bcrypt password hashing to secure ticket endpoints.
- **Structured Logging:** Uses **Pino** for machine-readable JSON logs in production and pretty-printed logs in development.
- **Request Tracing:** Correlation IDs track requests from API through the background worker for full end-to-end traceability.

---

## 🐳 Docker

```bash
# Build the production Docker image
docker build -t nexusdesk-ai:latest .

# Run the container
docker run -p 3000:3000 nexusdesk-ai:latest
```

---

## 📈 Future Roadmap

- **Vector Search:** Implement **pgvector** to detect duplicate tickets or find similar past resolutions.
- **Real-time Updates:** Replace polling with WebSockets for instant ticket updates in dashboard.
- **Role-based Access Control:** Add admin/user roles for ticket management.
