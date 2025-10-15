const mongoose = require('mongoose');

const jobDescriptionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  company: {
    type: String,
    required: true,
    trim: true,
  },
  department: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    trim: true,
  },
  employmentType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
    default: 'full-time',
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'executive'],
    required: true,
  },
  salaryRange: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'USD' },
  },
  description: {
    type: String,
    required: true,
  },
  requirements: {
    requiredSkills: [{
      name: String,
      category: String,
      importance: { type: String, enum: ['must-have', 'nice-to-have'], default: 'must-have' },
    }],
    preferredSkills: [{
      name: String,
      category: String,
    }],
    minimumExperience: Number, // in years
    educationRequirement: String,
    certifications: [String],
  },
  responsibilities: [String],
  benefits: [String],
  applicationDeadline: Date,
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: String, // Could be HR email or user ID
    required: true,
  },
}, {
  timestamps: true,
});

// Indexes for efficient searching
jobDescriptionSchema.index({ title: 1, company: 1 });
jobDescriptionSchema.index({ 'requirements.requiredSkills.name': 1 });
jobDescriptionSchema.index({ experienceLevel: 1 });
jobDescriptionSchema.index({ isActive: 1, createdAt: -1 });

module.exports = mongoose.model('JobDescription', jobDescriptionSchema);