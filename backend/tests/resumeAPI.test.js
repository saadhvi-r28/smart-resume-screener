const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Resume = require('../src/models/Resume');

describe('Resume API Endpoints', () => {
  beforeEach(async () => {
    // Clear the database before each test
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
    await Resume.deleteMany({});
  });

  afterAll(async () => {
    await Resume.deleteMany({});
    await mongoose.connection.close();
  });

  describe('GET /api/resumes', () => {
    it('should return empty array when no resumes exist', async () => {
      const response = await request(app)
        .get('/api/resumes')
        .expect(200);

      expect(response.body.resumes).toEqual([]);
      expect(response.body.pagination.total).toBe(0);
    });

    it('should return resumes with pagination', async () => {
      // Create sample resumes
      const sampleResumes = [
        {
          candidateName: 'John Doe',
          originalFileName: 'john_resume.pdf',
          fileType: 'pdf',
          rawText: 'John Doe Software Engineer',
          extractedData: {
            skills: [{ name: 'JavaScript', category: 'technical' }],
            totalExperienceYears: 3
          }
        },
        {
          candidateName: 'Jane Smith',
          originalFileName: 'jane_resume.pdf',
          fileType: 'pdf',
          rawText: 'Jane Smith Data Scientist',
          extractedData: {
            skills: [{ name: 'Python', category: 'technical' }],
            totalExperienceYears: 5
          }
        }
      ];

      await Resume.insertMany(sampleResumes);

      const response = await request(app)
        .get('/api/resumes?limit=1&page=1')
        .expect(200);

      expect(response.body.resumes).toHaveLength(1);
      expect(response.body.pagination.total).toBe(2);
      expect(response.body.pagination.pages).toBe(2);
    });

    it('should filter resumes by skills', async () => {
      const resume1 = new Resume({
        candidateName: 'JavaScript Developer',
        originalFileName: 'js_dev.pdf',
        fileType: 'pdf',
        rawText: 'JavaScript expert',
        extractedData: {
          skills: [{ name: 'JavaScript', category: 'technical' }],
          totalExperienceYears: 3
        }
      });

      const resume2 = new Resume({
        candidateName: 'Python Developer',
        originalFileName: 'py_dev.pdf',
        fileType: 'pdf',
        rawText: 'Python expert',
        extractedData: {
          skills: [{ name: 'Python', category: 'technical' }],
          totalExperienceYears: 4
        }
      });

      await resume1.save();
      await resume2.save();

      const response = await request(app)
        .get('/api/resumes?skills=JavaScript')
        .expect(200);

      expect(response.body.resumes).toHaveLength(1);
      expect(response.body.resumes[0].candidateName).toBe('JavaScript Developer');
    });
  });

  describe('GET /api/resumes/:id', () => {
    it('should return specific resume by ID', async () => {
      const resume = new Resume({
        candidateName: 'Test Candidate',
        originalFileName: 'test.pdf',
        fileType: 'pdf',
        rawText: 'Test content',
        extractedData: {
          skills: [{ name: 'Testing', category: 'technical' }],
          totalExperienceYears: 2
        }
      });

      await resume.save();

      const response = await request(app)
        .get(`/api/resumes/${resume._id}`)
        .expect(200);

      expect(response.body.resume.candidateName).toBe('Test Candidate');
      expect(response.body.resume._id).toBe(resume._id.toString());
    });

    it('should return 404 for non-existent resume', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/resumes/${nonExistentId}`)
        .expect(404);

      expect(response.body.error).toBe('Resume not found');
    });
  });

  describe('PUT /api/resumes/:id', () => {
    it('should update resume data', async () => {
      const resume = new Resume({
        candidateName: 'Original Name',
        originalFileName: 'test.pdf',
        fileType: 'pdf',
        rawText: 'Test content',
        extractedData: {
          skills: [],
          totalExperienceYears: 0
        }
      });

      await resume.save();

      const updateData = {
        candidateName: 'Updated Name',
        email: 'updated@example.com'
      };

      const response = await request(app)
        .put(`/api/resumes/${resume._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.resume.candidateName).toBe('Updated Name');
      expect(response.body.resume.email).toBe('updated@example.com');
    });

    it('should reject invalid update fields', async () => {
      const resume = new Resume({
        candidateName: 'Test Name',
        originalFileName: 'test.pdf',
        fileType: 'pdf',
        rawText: 'Test content',
        extractedData: {
          skills: [],
          totalExperienceYears: 0
        }
      });

      await resume.save();

      const invalidUpdate = {
        invalidField: 'should not be allowed'
      };

      const response = await request(app)
        .put(`/api/resumes/${resume._id}`)
        .send(invalidUpdate)
        .expect(400);

      expect(response.body.error).toBe('Invalid updates');
    });
  });

  describe('DELETE /api/resumes/:id', () => {
    it('should soft delete resume', async () => {
      const resume = new Resume({
        candidateName: 'To Be Deleted',
        originalFileName: 'delete_me.pdf',
        fileType: 'pdf',
        rawText: 'Delete this',
        extractedData: {
          skills: [],
          totalExperienceYears: 0
        }
      });

      await resume.save();

      const response = await request(app)
        .delete(`/api/resumes/${resume._id}`)
        .expect(200);

      expect(response.body.message).toBe('Resume deleted successfully');

      // Verify soft delete - resume should still exist but be inactive
      const deletedResume = await Resume.findById(resume._id);
      expect(deletedResume.isActive).toBe(false);
    });
  });

  describe('GET /api/resumes/stats', () => {
    it('should return resume statistics', async () => {
      // Create sample resumes with different skills
      const resumes = [
        {
          candidateName: 'Dev 1',
          originalFileName: 'dev1.pdf',
          fileType: 'pdf',
          rawText: 'JavaScript developer',
          extractedData: {
            skills: [
              { name: 'JavaScript', category: 'technical' },
              { name: 'React', category: 'technical' }
            ],
            totalExperienceYears: 3
          }
        },
        {
          candidateName: 'Dev 2',
          originalFileName: 'dev2.pdf',
          fileType: 'pdf',
          rawText: 'Python developer',
          extractedData: {
            skills: [
              { name: 'Python', category: 'technical' },
              { name: 'Django', category: 'technical' }
            ],
            totalExperienceYears: 5
          }
        }
      ];

      await Resume.insertMany(resumes);

      const response = await request(app)
        .get('/api/resumes/stats')
        .expect(200);

      expect(response.body.statistics.totalResumes).toBe(2);
      expect(response.body.statistics.averageExperience).toBe(4);
      expect(Array.isArray(response.body.statistics.topSkills)).toBe(true);
    });
  });
});