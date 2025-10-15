const mongoose = require('mongoose');

const matchResultSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobDescription',
    required: true,
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true,
  },
  overallScore: {
    type: Number,
    required: true,
    min: 0,
    max: 10,
  },
  detailedScoring: {
    skillsMatch: {
      score: { type: Number, min: 0, max: 10 },
      matchedSkills: [{
        skill: String,
        candidateLevel: String,
        requiredLevel: String,
        match: Boolean,
      }],
      missingSkills: [String],
    },
    experienceMatch: {
      score: { type: Number, min: 0, max: 10 },
      candidateExperience: Number,
      requiredExperience: Number,
      relevantExperience: [{
        company: String,
        position: String,
        relevanceScore: Number,
      }],
    },
    educationMatch: {
      score: { type: Number, min: 0, max: 10 },
      candidateEducation: String,
      requiredEducation: String,
      meets: Boolean,
    },
  },
  llmAnalysis: {
    prompt: String,
    response: String,
    reasoning: String,
    strengths: [String],
    weaknesses: [String],
    recommendations: [String],
  },
  matchStatus: {
    type: String,
    enum: ['excellent', 'good', 'average', 'poor'],
    required: true,
  },
  isShortlisted: {
    type: Boolean,
    default: false,
  },
  matchedAt: {
    type: Date,
    default: Date.now,
  },
  processedBy: {
    type: String, // System identifier or user
    default: 'ai-system',
  },
}, {
  timestamps: true,
});

// Compound indexes for efficient querying
matchResultSchema.index({ jobId: 1, overallScore: -1 });
matchResultSchema.index({ resumeId: 1, matchedAt: -1 });
matchResultSchema.index({ isShortlisted: 1, overallScore: -1 });
matchResultSchema.index({ matchStatus: 1, overallScore: -1 });

// Virtual for match percentage
matchResultSchema.virtual('matchPercentage').get(function() {
  return Math.round(this.overallScore * 10);
});

module.exports = mongoose.model('MatchResult', matchResultSchema);