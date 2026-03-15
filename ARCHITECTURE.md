# Architecture — AI-Assisted Journal System

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐ │
│  │ JournalForm │  │ JournalList │  │   InsightsPanel      │ │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬───────────┘ │
│         └────────────────┴─────────────────────┘            │
│                      src/services/api.js (Axios)            │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTPS REST
┌────────────────────────────▼────────────────────────────────┐
│               Node.js + Express Backend                      │
│                                                              │
│  POST /api/journal          →  journalController.createEntry │
│  GET  /api/journal/:userId  →  journalController.getEntries  │
│  POST /api/journal/analyze  →  journalController.analyzeEntry│
│  GET  /api/journal/insights →  journalController.getInsights │
│                                                              │
│  ┌──────────────────┐    ┌───────────────────────────────┐  │
│  │   llmService.js  │    │       insightService.js        │  │
│  │  (Gemini SDK)    │    │  (MongoDB Aggregation Pipelines│  │
│  └────────┬─────────┘    └──────────────┬────────────────┘  │
└───────────┼──────────────────────────────┼──────────────────┘
            │                              │
┌───────────▼──────┐          ┌────────────▼────────────────┐
│    Gemini API    │          │         MongoDB              │
│  (Gemini Flash)  │          │  Journal Collection          │
└──────────────────┘          │  indexes: userId, createdAt  │
                              └─────────────────────────────┘
```

---

## Component Responsibilities

### Frontend (React / Vite)

| File | Responsibility |
|------|---------------|
| `App.jsx` | State management, data fetching, layout |
| `services/api.js` | Centralized Axios instance, error normalization |
| `JournalForm.jsx` | Entry submission form with ambience selector |
| `JournalList.jsx` | Renders all JournalCards, loading/empty states |
| `JournalCard.jsx` | Single entry display, triggers Analyze action |
| `InsightsPanel.jsx` | Displays aggregated user stats |

### Backend (Node.js / Express)

| File | Responsibility |
|------|---------------|
| `server.js` | App bootstrap, middleware, route mounting |
| `routes/journalRoutes.js` | Route definitions + validation rules |
| `controllers/journalController.js` | HTTP layer — parse req, call services, send res |
| `services/llmService.js` | Gemini API call + JSON parsing + validation |
| `services/insightService.js` | 4 parallel MongoDB aggregation pipelines |
| `models/Journal.js` | Mongoose schema with enum validation + indexes |
| `middleware/errorHandler.js` | Global error → `{ success: false, error }` |
| `config/db.js` | Mongoose connection with `process.exit` on failure |

---

## Data Flow

### 1. Create Journal Entry
```
User submits form
  → POST /api/journal { userId, ambience, text }
  → Validated by express-validator
  → Journal.create() saves to MongoDB
  → Returns { success: true, data: entry }
  → JournalList re-fetches entries
```

### 2. Analyze Emotion
```
User clicks "Analyze" on a card
  → POST /api/journal/analyze { text }
  → llmService calls Gemini generateContent
  → Parses JSON: { emotion, keywords, summary }
  → Validates fields, strips markdown fences
  → Returns analysis to frontend
  → JournalCard merges result into local state (no reload)
  → InsightsPanel refetches to reflect new emotion data
```

### 3. Insights Aggregation
```
GET /api/journal/insights/:userId
  → 4 parallel MongoDB aggregation pipelines
    1. countDocuments → totalEntries
    2. $group + $sort → topEmotion
    3. $group + $sort → mostUsedAmbience
    4. $unwind keywords + $group → recentKeywords (deduplicated)
  → Returns { totalEntries, topEmotion, mostUsedAmbience, recentKeywords }
```

---

## Database Schema

```
Journal {
  _id:       ObjectId (auto)
  userId:    String    (required, indexed)
  ambience:  String    (enum: forest|ocean|mountain)
  text:      String    (required, max 5000 chars)
  emotion:   String    (nullable, set after LLM analysis)
  keywords:  [String]  (nullable, set after LLM analysis)
  summary:   String    (nullable, set after LLM analysis)
  createdAt: Date      (auto, indexed)
}

Indexes:
  { userId: 1 }
  { createdAt: -1 }
  { emotion: 1 }
  { userId: 1, createdAt: -1 }   ← compound for primary query
```

---

## Scalability Design

| Concern | Current Approach | Future Path |
|---------|-----------------|-------------|
| Stateless API | No session state stored | Ready for load balancer |
| DB performance | Indexed userId + createdAt | Sharding on userId |
| LLM cost | Analyze on-demand only | Cache results in DB |
| Pagination | `?page&limit` implemented | Cursor-based pagination |
| LLM reliability | try/catch, 502 on failure | Background queue (BullMQ/Redis) |
| Auth | userId header (MVP) | JWT / OAuth upgrade path |

---

## Environment Variables

| Variable | Service | Purpose |
|----------|---------|---------|
| `PORT` | backend | Express listen port (default 5000) |
| `MONGODB_URI` | backend | MongoDB connection string |
| `GEMINI_API_KEY` | backend | Gemini authentication |
| `GEMINI_MODEL` | backend | Model name (default `gemini-1.5-flash`) |
| `VITE_API_BASE_URL` | frontend | Backend URL for Axios |

---

## Required Submission Questions

### How would you scale this to 100k users?
To scale the application to handle 100k users, the architecture would need several improvements:
- **Database Scaling:** Implement database sharding in MongoDB (e.g., sharding by `userId`) to distribute the data load. Use read replicas to handle heavy analytical read queries (e.g., aggregating insights).
- **Backend Scaling:** Deploy the Node.js/Express backend horizontally across multiple instances behind a load balancer. The application is already stateless, which makes horizontal scaling straightforward.
- **Asynchronous Processing:** Offload the LLM analysis and other heavy tasks to a background job queue (e.g., BullMQ + Redis). Instead of a blocking HTTP request to the LLM, the backend would acknowledge the request and process it asynchronously, notifying the client via SSE or WebSockets when analysis is complete.
- **Caching:** Introduce a Redis caching layer to cache frequently accessed data such as user insights, minimizing the load on MongoDB.
- **CDN and Frontend Scaling:** Serve the React frontend assets globally via a CDN (like Vercel or Cloudflare Edge).

### How would you reduce LLM cost?
- **Batch Processing:** Instead of calling the LLM individually for each journal entry, we can accumulate entries and process them in batches for lower API costs and optimized token usage.
- **Selective Analysis / Opt-in:** Provide users with the option to manually request analysis rather than auto-analyzing every entry, or only analyze entries longer than a certain threshold.
- **Local / Self-hosted Models:** For basic sentiment and keyword extraction, we can switch to smaller, self-hosted open-source models (like Llama 3 8B or Mistral) running on dedicated GPU instances instead of relying strictly on Gemini's API.
- **Prompt Optimization:** Refine and compress the system prompts to use fewer input tokens.
- **Prompt Caching:** Utilize provider-level prompt caching for repeated system instructions to significantly lower input token costs.

### How would you cache repeated analysis?
- **Store LLM Results Directly:** We already store the generated LLM analysis (`emotion`, `keywords`, `summary`) directly in the MongoDB `Journal` model. If a user requests an analysis of an already analyzed entry, the backend can return the stored database result immediately, bypassing the LLM completely.
- **Semantic Caching Layer:** For high volume or highly similar requests, we can implement a semantic caching layer (using Redis + a fast embedding model). If a user submits an entry that is extremely similar or identical to a previously analyzed public or private entry, we can return the cached insight to completely save the API cost.

### How would you protect sensitive journal data?
- **Encryption at Rest:** Ensure the database uses disk-level encryption (which is standard on managed services like MongoDB Atlas).
- **Application-Level (Field-Level) Encryption:** Encrypt the sensitive `text` and `summary` fields before storing them in the database using AES-256. If possible, utilize End-to-End Encryption (E2EE) where the decryption key is derived from the user's password, so even database administrators cannot read the entries.
- **PII Scrubbing:** Before sending the data to external LLMs (like Gemini), proactively scrub any Personally Identifiable Information (PII) using local, lightweight NLP models or regex patterns.
- **Strict Data Access Controls:** Replace the MVP `userId` header authorization with robust JWT auth and role-based access controls to guarantee users can only query their own records.
- **Zero Data Retention Agreements:** Use enterprise LLM endpoints (like Google's Vertex AI API) with a zero-data-retention policy to guarantee that private user journals are never used to train future models.
