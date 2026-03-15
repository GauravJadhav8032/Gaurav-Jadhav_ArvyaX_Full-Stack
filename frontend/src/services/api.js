import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://gaurav-jadhav-arvyax-full-stack.onrender.com";

const api = axios.create({
  baseURL: `${BASE_URL}/api/journal`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000, // 30s timeout for LLM calls
});

// ─── Response interceptor for consistent error messages ──────────────────────
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// ─── API functions ────────────────────────────────────────────────────────────

/** Create a new journal entry. */
export const createJournalEntry = (data) => api.post('/', data);

/** Get all journal entries for a user. Supports optional pagination. */
export const getJournalEntries = (userId, page = 1, limit = 20) =>
  api.get(`/${userId}`, { params: { page, limit } });

/** Analyze journal text with the LLM. */
export const analyzeEntry = (text) => api.post('/analyze', { text });

/** Get aggregated insights for a user. */
export const getInsights = (userId) => api.get(`/insights/${userId}`);
