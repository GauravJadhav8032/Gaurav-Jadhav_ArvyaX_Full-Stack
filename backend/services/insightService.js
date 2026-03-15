const Journal = require('../models/Journal');

/**
 * Computes aggregated insights for a given userId using MongoDB aggregation.
 * @param {string} userId
 * @returns {{ totalEntries, topEmotion, mostUsedAmbience, recentKeywords }}
 */
const getUserInsights = async (userId) => {
  // Run all aggregations in parallel for performance
  const [totalResult, topEmotionResult, topAmbienceResult, recentKeywordsResult] =
    await Promise.all([
      // 1. Total entries count
      Journal.countDocuments({ userId }),

      // 2. Most frequent emotion (only analyzed entries)
      Journal.aggregate([
        { $match: { userId, emotion: { $ne: null } } },
        { $group: { _id: '$emotion', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]),

      // 3. Most used ambience
      Journal.aggregate([
        { $match: { userId } },
        { $group: { _id: '$ambience', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]),

      // 4. Recent keywords (from last 10 analyzed entries, flattened + deduplicated)
      Journal.aggregate([
        { $match: { userId, keywords: { $exists: true, $ne: [] } } },
        { $sort: { createdAt: -1 } },
        { $limit: 10 },
        { $unwind: '$keywords' },
        { $group: { _id: '$keywords' } },
        { $limit: 20 },
        { $project: { _id: 0, keyword: '$_id' } },
      ]),
    ]);

  return {
    totalEntries: totalResult,
    topEmotion: topEmotionResult[0]?._id || null,
    mostUsedAmbience: topAmbienceResult[0]?._id || null,
    recentKeywords: recentKeywordsResult.map((r) => r.keyword),
  };
};

module.exports = { getUserInsights };
