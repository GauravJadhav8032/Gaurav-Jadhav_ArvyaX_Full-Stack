const { validationResult } = require('express-validator');
const Journal = require('../models/Journal');
const { analyzeEmotion } = require('../services/llmService');
const { getUserInsights } = require('../services/insightService');

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Checks express-validator results and throws if invalid.
 */
const validateRequest = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error(
      errors
        .array()
        .map((e) => e.msg)
        .join(', ')
    );
    err.statusCode = 400;
    throw err;
  }
};

// ─── Controllers ────────────────────────────────────────────────────────────

/**
 * POST /api/journal
 * Create a new journal entry.
 */
const createEntry = async (req, res, next) => {
  try {
    validateRequest(req);
    const { userId, ambience, text } = req.body;

    const entry = await Journal.create({ userId, ambience, text });

    res.status(201).json({
      success: true,
      data: entry,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/journal/:userId
 * Retrieve all journal entries for a user (newest first), with pagination.
 * Query params: ?page=1&limit=20
 */
const getEntries = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [entries, total] = await Promise.all([
      Journal.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Journal.countDocuments({ userId }),
    ]);

    res.json({
      success: true,
      data: entries,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/journal/analyze
 * Analyzes journal text using the LLM and returns emotion, keywords, summary.
 */
const analyzeEntry = async (req, res, next) => {
  try {
    validateRequest(req);
    const { text } = req.body;

    const analysis = await analyzeEmotion(text);

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/journal/insights/:userId
 * Returns aggregated emotional insights for a user.
 */
const getInsights = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const insights = await getUserInsights(userId);

    res.json({
      success: true,
      data: insights,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createEntry, getEntries, analyzeEntry, getInsights };
