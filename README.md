# AI-Assisted Journal System

A full-stack journaling platform where users record reflections after immersive nature sessions. An LLM analyzes emotional tone and the system surfaces aggregated insights.

## Tech Stack

| Layer      | Technology                  |
|------------|-----------------------------|
| Frontend   | React 18 + Vite, Axios      |
| Backend    | Node.js, Express            |
| Database   | MongoDB with Mongoose       |
| AI         | Gemini API (`gemini-1.5-flash`) |
| Deployment | Frontend → Vercel, Backend → Render, DB → MongoDB Atlas |

---

## Project Structure

```
ai-journal-system/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── controllers/
│   │   └── journalController.js  # Route handlers
│   ├── middleware/
│   │   └── errorHandler.js       # Global error handler
│   ├── models/
│   │   └── Journal.js            # Mongoose schema
│   ├── routes/
│   │   └── journalRoutes.js      # Express router
│   ├── services/
│   │   ├── llmService.js         # Gemini integration
│   │   └── insightService.js     # Aggregation logic
│   ├── server.js                 # App entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── JournalForm.jsx
    │   │   ├── JournalList.jsx
    │   │   ├── JournalCard.jsx
    │   │   └── InsightsPanel.jsx
    │   ├── services/api.js       # Axios API layer
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env.example
    └── package.json
```

---

## Prerequisites

- **Node.js** v18 or higher
- **MongoDB** — local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier)
- **Gemini API key** — [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

---

## Quick Start

### 1. Clone & install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment variables

**Backend** — copy `.env.example` to `.env` and fill in values:

```bash
cp backend/.env.example backend/.env
```

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai_journal
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=gemini-1.5-flash
```

**Frontend** — copy `.env.example` to `.env`:

```bash
cp frontend/.env.example frontend/.env
```

```env
VITE_API_BASE_URL=http://localhost:5000
```

### 3. Run locally

Open **two terminals**:

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# → http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev
# → http://localhost:5173
```

---

## API Reference

### `POST /api/journal`
Create a journal entry.

```json
// Request
{ "userId": "user1", "ambience": "forest", "text": "I felt calm today." }

// Response
{ "success": true, "data": { "_id": "...", "userId": "user1", ... } }
```

### `GET /api/journal/:userId`
Retrieve all entries for a user. Supports `?page=1&limit=20`.

### `POST /api/journal/analyze`
Analyze journal text with Gemini.

```json
// Request
{ "text": "I felt calm listening to the rain." }

// Response
{ "success": true, "data": { "emotion": "calm", "keywords": ["rain","nature"], "summary": "..." } }
```

### `GET /api/journal/insights/:userId`
Get aggregated emotional insights.

```json
{ "success": true, "data": {
  "totalEntries": 8,
  "topEmotion": "calm",
  "mostUsedAmbience": "forest",
  "recentKeywords": ["rain","peace","focus"]
}}
```

### `GET /health`
Server health check.

---

## Deployment

### Backend → Render
1. Create new **Web Service** on [render.com](https://render.com)
2. Set root directory to `backend/`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all `.env` variables in the Render environment settings

### Frontend → Vercel
1. Import repo in [vercel.com](https://vercel.com)
2. Set root directory to `frontend/`
3. Add env var: `VITE_API_BASE_URL=https://your-backend.onrender.com`

### Database → MongoDB Atlas
1. Create free M0 cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Allow IP `0.0.0.0/0` in Network Access (or Render's static IP)
3. Copy connection string to `MONGODB_URI`

---

## Error Response Format

All APIs return a consistent envelope:

```json
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "error": "descriptive error message" }
```

---

## Required Submission Questions

Answers to the specific scalability, cost reduction, caching, and security review questions requested for the submission can be found at the end of the [ARCHITECTURE.md](./ARCHITECTURE.md) file.
