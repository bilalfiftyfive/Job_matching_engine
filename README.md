# Job Matching Engine (NestJS + PostgreSQL)

A production-grade **Job Matching Engine POC** built with **NestJS**, **PostgreSQL**, **Prisma**, and **BullMQ**. The system asynchronously matches jobs with candidates at scale (10,000+), computes ranked results using pluggable scoring strategies, and exposes secure APIs.

---

## 🚀 Features

* Async job–candidate matching using background workers
* PostgreSQL with Prisma ORM
* High-performance candidate filtering using GIN indexes
* Batch processing & bulk upserts (idempotent)
* Pluggable scoring strategies (Open/Closed principle)
* Ranked match results with pagination
* JWT-based authentication
* Redis + BullMQ for queueing
* Swagger API documentation

---

## 🏗️ High-Level Architecture

```
Client
  ↓
REST APIs (NestJS)
  ↓            ↘
PostgreSQL      Redis (BullMQ)
                   ↓
            Background Worker
                   ↓
            Match Results Store
```

* **API Layer**: Stateless, authenticated, fast
* **Worker Layer**: Asynchronous, fault-tolerant, scalable

---

## 🧰 Tech Stack

* **Backend**: NestJS (TypeScript)
* **Database**: PostgreSQL
* **ORM**: Prisma
* **Queue**: BullMQ
* **Cache/Broker**: Redis
* **Auth**: JWT (Passport)
* **Validation**: class-validator, class-transformer
* **Docs**: Swagger

---
## 🔐 Authentication

* JWT-based authentication
* Stateless API layer
* Worker does not require auth (internal system)

### Auth APIs

* `POST /auth/register`
* `POST /auth/login`

Protected routes:

* `POST /jobs`
* `POST /jobs/:id/match`
* `GET /jobs/:id/matches`
* `GET /jobs/:id/matches/ranked`

---

## 🌐 API Endpoints

### Job APIs

* `POST /jobs` – Create job & enqueue matching
* `POST /jobs/:id/match` – Re-trigger matching
* `GET /jobs/:id/matches` – Get all matches
* `GET /jobs/:id/matches/ranked` – Ranked matches with pagination

---

## 🧪 Seeding Data

Seed 10,000 candidates for testing:

```bash
npx ts-node seed/seed-candidates.ts
```

The seed script uses batch inserts for performance.

---

## 🐳 Running Locally (Docker)

### Start Infrastructure

```bash
docker compose up -d
```

Services:

* PostgreSQL → `localhost:5432`
* Redis → `localhost:6380`

---

## ▶️ Running the Application

```bash
npm install
npx prisma migrate dev
npm run start:dev
```

Swagger UI:

```
http://localhost:3000/api
```

---

## 📈 Performance Considerations

* GIN indexes on array fields
* Cursor-based pagination (no OFFSET)
* Batch size = 500
* Bulk upserts using `ON CONFLICT`
* Stateless APIs

---

## 🔁 Reliability & Error Handling

* Automatic retries with exponential backoff
* Partial failures do not stop processing
* Invalid records are skipped
* Idempotent re-processing supported

---

## 🔮 Future Enhancements

* ElasticSearch candidate selector
* ML-based scoring strategies
* Role-based access control
* Multi-tenant support
* Metrics (Prometheus / OpenTelemetry)

---

## 📌 Summary

This project demonstrates:

* Clean, modular backend architecture
* Asynchronous, scalable processing
* High-performance PostgreSQL usage
* Extensible scoring system
* Production-ready design patterns

It can serve as a strong foundation for real-world hiring or recommendation platforms.

---

## 👨‍💻 Author

Built as a production-quality POC to demonstrate scalable backend system design using NestJS.
