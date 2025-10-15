// Test setup and configuration
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/smart-resume-screener-test';
process.env.OPENAI_API_KEY = 'test-key';

const mongoose = require('mongoose');

// Mock OpenAI for testing
jest.mock('openai', () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{
              message: {
                content: JSON.stringify({
                  overallScore: 7.5,
                  reasoning: 'Test analysis - good match with minor gaps',
                  strengths: ['Strong technical background', 'Relevant experience'],
                  weaknesses: ['Missing some preferred skills'],
                  recommendations: ['Consider for interview'],
                  skillsScore: 8,
                  experienceScore: 7,
                  educationScore: 8
                })
              }
            }]
          })
        }
      }
    }))
  };
});

// Global test teardown
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});