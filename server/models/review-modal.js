import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional if the user is not logged in
  },
  atsScore: {
    type: Number,
    required: true
  },
  matchedKeywords: {
    type: [String],
    default: []
  },
  missingKeywords: {
    type: [String],
    default: []
  },
  keywordSuggestions: {
    type: [String],
    default: []
  },
  improvedBullets: {
    type: [String],
    default: []
  },
  resumeExcerpt: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;