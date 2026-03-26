# NexusDesk AI 🚀
>
> **Enterprise-Grade AI Support Ticket Triage Microservice**

NexusDesk AI is a standalone microservice designed to solve the "Manual Triage Bottleneck" in large SaaS customer support teams. It ingests unstructured support tickets, utilizes a Large Language Model (LLM) to extract context, and automatically assigns categories and priorities before persisting the data to a PostgreSQL database.

---

## 🏗️ Architectural Overview

This project follows a **Strict Layered Architecture** to ensure maintainability, testability, and separation of concerns.

* **Controller Layer:** Handles HTTP requests/responses and delegates to services.
* **Service Layer (Business Logic):** Orchestrates the AI analysis and database interactions.
* **Validation Layer (Zod):** Enforces a "Security-First" approach by validating all incoming data and environment variables at runtime.
* **Data Layer (Prisma):** Provides type-safe database access with PostgreSQL.
* **AI Engine:** A deterministic LLM wrapper that enforces JSON Mode and validates AI hallucinations against a Zod schema.

---

## 🛠️ Tech Stack

* **Runtime:** Node.js (v20+)
* **Language:** TypeScript (Strict Mode)
* **Framework:** Express.js
* **Database:** PostgreSQL 16 (via Docker)
* **ORM:** Prisma
* **Validation:** Zod (Request, AI Output, and Env validation)
* **AI:** OpenAI GPT-5-mini (Structured Outputs)

---

## 🚀 Getting Started

### 1. Prerequisites

* [Docker](https://www.docker.com/) & Docker Compose
* [Node.js v20+](https://nodejs.org/)
* An OpenAI API Key

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

*Note: Ensure `DATABASE_URL` matches the credentials in your `docker-compose.yml`.*

### 4. Infrastructure & Database Setup

```bash
# Start the PostgreSQL container
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

### **Create a Support Ticket**

`POST /api/v1/tickets`

**Request Body:**

```json
{
  "title": "Payment failing at checkout",
  "description": "I tried to upgrade to the Pro plan three times, but my card is being rejected with an error 500.",
  "userId": "550e8400-e29b-41d4-a716-446655440000"
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
      "category": "BILLING",
      "priority": "CRITICAL",
      "createdAt": "2023-10-27T..."
    }
  }
}
```

---

## 🛡️ Enterprise Design Patterns Used

* **Fail-Fast Initialization:** The application validates all environment variables on startup. If a required key is missing, the process terminates immediately with a clear error.
* **Centralized Error Handling:** Uses a global Express middleware and a custom `AppError` class to handle operational vs. programming errors consistently.
* **Non-Blocking AI Integration:** Utilizes asynchronous programming to handle LLM latency without blocking the main event loop.
* **Deterministic AI Guardrails:** We use OpenAI's **JSON Mode** coupled with a **Zod validator** to ensure the LLM never returns invalid categories or priorities.
* **Containerization:** Full Docker support for reproducible development and deployment environments.

---

## 📈 Future Roadmap

* **Event-Driven Processing:** Integrate **BullMQ/Redis** to move AI analysis to background workers, reducing API latency.
* **Vector Search:** Implement **pgvector** to detect duplicate tickets or find similar past resolutions.
* **Authentication:** Add JWT-based security to protect ticket retrieval endpoints.
* **Unit Testing:** Implement a full suite of Jest tests with Prisma and LLM mocking.
