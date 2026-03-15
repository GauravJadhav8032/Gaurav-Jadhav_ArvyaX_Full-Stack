const express = require('express');
const { body } = require('express-validator');
const {
  createEntry,
  getEntries,
  analyzeEntry,
  getInsights,
} = require('../controllers/journalController');

const router = express.Router();

// ─── Validation Rules ────────────────────────────────────────────────────────

const createEntryValidation = [
  body('userId').notEmpty().withMessage('userId is required').trim(),
  body('ambience')
    .isIn(['forest', 'ocean', 'mountain'])
    .withMessage('ambience must be one of: forest, ocean, mountain'),
  body('text')
    .notEmpty()
    .withMessage('text is required')
    .isLength({ max: 5000 })
    .withMessage('text cannot exceed 5000 characters')
    .trim(),
];

const analyzeValidation = [
  body('text')
    .notEmpty()
    .withMessage('text is required')
    .isLength({ min: 5, max: 5000 })
    .withMessage('text must be between 5 and 5000 characters')
    .trim(),
];

// ─── Routes ──────────────────────────────────────────────────────────────────

// POST /api/journal — Create a journal entry
router.post('/', createEntryValidation, createEntry);

// IMPORTANT: /insights/:userId must come BEFORE /:userId to prevent
// Express matching "insights" as a userId parameter.
// GET /api/journal/insights/:userId — Get aggregated user insights
router.get('/insights/:userId', getInsights);

// GET /api/journal/:userId — Get all entries for a user
router.get('/:userId', getEntries);

// POST /api/journal/analyze — Analyze journal text with LLM
router.post('/analyze', analyzeValidation, analyzeEntry);

module.exports = router;
