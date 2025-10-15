const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  candidateName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  originalFileName: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
    enum: ['pdf', 'txt', 'doc', 'docx'],
  },
  rawText: {
    type: String,
    required: true,
  },
  extractedData: {
    skills: [{
      name: String,
      category: String, // technical, soft, domain-specific
      proficiencyLevel: String, // beginner, intermediate, advanced, expert
    }],
    experience: [{
      company: String,
      position: String,
      duration: String,
      description: String,
      startDate: Date,
      endDate: Date,
      isCurrent: { type: Boolean, default: false },
    }],
    education: [{
      institution: String,
      degree: String,
      fieldOfStudy: String,
      graduationYear: Number,
      gpa: String,
    }],
    certifications: [{
      name: String,
      issuer: String,
      issueDate: Date,
      expiryDate: Date,
    }],
    totalExperienceYears: Number,
    summary: String,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for efficient searching
resumeSchema.index({ candidateName: 1, email: 1 });
resumeSchema.index({ 'extractedData.skills.name': 1 });
resumeSchema.index({ uploadedAt: -1 });

module.exports = mongoose.model('Resume', resumeSchema);