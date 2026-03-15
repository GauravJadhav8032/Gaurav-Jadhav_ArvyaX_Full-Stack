const mongoose = require('mongoose');

const JournalSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, 'userId is required'],
      trim: true,
    },
    ambience: {
      type: String,
      required: [true, 'ambience is required'],
      enum: {
        values: ['forest', 'ocean', 'mountain'],
        message: 'ambience must be one of: forest, ocean, mountain',
      },
    },
    text: {
      type: String,
      required: [true, 'text is required'],
      trim: true,
      maxlength: [5000, 'text cannot exceed 5000 characters'],
    },
    // Fields populated after LLM analysis
    emotion: {
      type: String,
      default: null,
    },
    keywords: {
      type: [String],
      default: [],
    },
    summary: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: false,
    },
  }
);

// Indexes for query performance (as defined in TRD)
JournalSchema.index({ userId: 1 });
JournalSchema.index({ createdAt: -1 });
JournalSchema.index({ emotion: 1 });
// Compound index for the most common query: user entries sorted by date
JournalSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Journal', JournalSchema);
