const JobDescription = require('../models/JobDescription');
const Joi = require('joi');

// Validation schemas
const jobDescriptionSchema = Joi.object({
  title: Joi.string().required().trim().max(200),
  company: Joi.string().required().trim().max(200),
  department: Joi.string().trim().max(200),
  location: Joi.string().trim().max(200),
  employmentType: Joi.string().valid('full-time', 'part-time', 'contract', 'internship', 'freelance'),
  experienceLevel: Joi.string().valid('entry', 'mid', 'senior', 'executive').required(),
  salaryRange: Joi.object({
    min: Joi.number().positive(),
    max: Joi.number().positive(),
    currency: Joi.string().length(3).uppercase(),
  }),
  description: Joi.string().required().min(50),
  requirements: Joi.object({
    requiredSkills: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        category: Joi.string(),
        importance: Joi.string().valid('must-have', 'nice-to-have'),
      })
    ),
    preferredSkills: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        category: Joi.string(),
      })
    ),
    minimumExperience: Joi.number().min(0),
    educationRequirement: Joi.string(),
    certifications: Joi.array().items(Joi.string()),
  }),
  responsibilities: Joi.array().items(Joi.string()),
  benefits: Joi.array().items(Joi.string()),
  applicationDeadline: Joi.date().min('now'),
  createdBy: Joi.string().required(),
});

class JobController {
  /**
   * Create a new job description
   */
  async createJob(req, res, next) {
    try {
      // Validate request body
      const { error, value } = jobDescriptionSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation Error',
          message: error.details[0].message,
          details: error.details,
        });
      }

      // Create job description
      const jobDescription = new JobDescription(value);
      await jobDescription.save();

      res.status(201).json({
        message: 'Job description created successfully',
        jobId: jobDescription._id,
        job: jobDescription,
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all job descriptions with filtering and pagination
   */
  async getAllJobs(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        company,
        experienceLevel,
        location,
        isActive = true,
        skills,
        search,
      } = req.query;

      // Build filter query
      const filter = {};

      if (isActive !== undefined && isActive !== null) {
        filter.isActive = isActive === 'true' || isActive === true;
      }

      if (company) {
        filter.company = new RegExp(company, 'i');
      }

      if (experienceLevel) {
        filter.experienceLevel = experienceLevel;
      }

      if (location) {
        filter.location = new RegExp(location, 'i');
      }

      if (skills) {
        const skillArray = skills.split(',').map(skill => skill.trim());
        filter.$or = [
          { 'requirements.requiredSkills.name': { $in: skillArray.map(skill => new RegExp(skill, 'i')) } },
          { 'requirements.preferredSkills.name': { $in: skillArray.map(skill => new RegExp(skill, 'i')) } },
        ];
      }

      if (search) {
        filter.$or = [
          { title: new RegExp(search, 'i') },
          { company: new RegExp(search, 'i') },
          { description: new RegExp(search, 'i') },
        ];
      }

      // Execute query with pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const [jobs, total] = await Promise.all([
        JobDescription.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        JobDescription.countDocuments(filter),
      ]);

      res.json({
        jobs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
        filters: { company, experienceLevel, location, isActive, skills, search },
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get specific job description by ID
   */
  async getJobById(req, res, next) {
    try {
      const { id } = req.params;

      const job = await JobDescription.findById(id);

      if (!job) {
        return res.status(404).json({
          error: 'Job not found',
          message: `No job description found with ID: ${id}`,
        });
      }

      res.json({
        job,
        message: 'Job description retrieved successfully',
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Update job description
   */
  async updateJob(req, res, next) {
    try {
      const { id } = req.params;

      // Validate updates (allow partial updates)
      const updateSchema = jobDescriptionSchema.fork(
        ['title', 'company', 'experienceLevel', 'description', 'createdBy'],
        (schema) => schema.optional()
      );

      const { error, value } = updateSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation Error',
          message: error.details[0].message,
          details: error.details,
        });
      }

      const job = await JobDescription.findByIdAndUpdate(
        id,
        { ...value, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!job) {
        return res.status(404).json({
          error: 'Job not found',
          message: `No job description found with ID: ${id}`,
        });
      }

      res.json({
        message: 'Job description updated successfully',
        job,
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete (deactivate) job description
   */
  async deleteJob(req, res, next) {
    try {
      const { id } = req.params;

      const job = await JobDescription.findByIdAndUpdate(
        id,
        { isActive: false, updatedAt: new Date() },
        { new: true }
      );

      if (!job) {
        return res.status(404).json({
          error: 'Job not found',
          message: `No job description found with ID: ${id}`,
        });
      }

      res.json({
        message: 'Job description deleted successfully',
        jobId: id,
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get job statistics
   */
  async getJobStats(req, res, next) {
    try {
      const stats = await JobDescription.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalJobs: { $sum: 1 },
            byExperienceLevel: {
              $push: '$experienceLevel'
            },
            byCompany: {
              $push: '$company'
            },
            requiredSkills: {
              $push: '$requirements.requiredSkills'
            },
          },
        },
      ]);

      let experienceLevelStats = {};
      let companyStats = {};
      let skillStats = [];

      if (stats[0]) {
        // Experience level distribution
        experienceLevelStats = stats[0].byExperienceLevel.reduce((acc, level) => {
          acc[level] = (acc[level] || 0) + 1;
          return acc;
        }, {});

        // Company distribution (top 10)
        const companyCounts = stats[0].byCompany.reduce((acc, company) => {
          acc[company] = (acc[company] || 0) + 1;
          return acc;
        }, {});
        companyStats = Object.entries(companyCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .reduce((acc, [company, count]) => {
            acc[company] = count;
            return acc;
          }, {});

        // Most required skills
        skillStats = stats[0].requiredSkills
          .flat()
          .filter(skillArray => Array.isArray(skillArray))
          .flat()
          .reduce((acc, skill) => {
            if (skill && skill.name) {
              const existing = acc.find(s => s.name.toLowerCase() === skill.name.toLowerCase());
              if (existing) {
                existing.count++;
              } else {
                acc.push({ 
                  name: skill.name, 
                  category: skill.category || 'uncategorized',
                  count: 1 
                });
              }
            }
            return acc;
          }, [])
          .sort((a, b) => b.count - a.count)
          .slice(0, 20);
      }

      res.json({
        statistics: {
          totalJobs: stats[0]?.totalJobs || 0,
          experienceLevelDistribution: experienceLevelStats,
          topCompanies: companyStats,
          mostRequiredSkills: skillStats,
        },
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Search jobs by skills
   */
  async searchJobsBySkills(req, res, next) {
    try {
      const { skills } = req.body;

      if (!skills || !Array.isArray(skills) || skills.length === 0) {
        return res.status(400).json({
          error: 'Invalid input',
          message: 'Please provide an array of skills to search for',
        });
      }

      const skillRegexes = skills.map(skill => new RegExp(skill.trim(), 'i'));

      const jobs = await JobDescription.find({
        isActive: true,
        $or: [
          { 'requirements.requiredSkills.name': { $in: skillRegexes } },
          { 'requirements.preferredSkills.name': { $in: skillRegexes } },
        ],
      }).sort({ createdAt: -1 });

      // Calculate match scores for each job
      const jobsWithScores = jobs.map(job => {
        const allJobSkills = [
          ...(job.requirements?.requiredSkills || []),
          ...(job.requirements?.preferredSkills || []),
        ].map(skill => skill.name.toLowerCase());

        const matchedSkills = skills.filter(skill => 
          allJobSkills.some(jobSkill => 
            jobSkill.includes(skill.toLowerCase()) || skill.toLowerCase().includes(jobSkill)
          )
        );

        const matchScore = (matchedSkills.length / skills.length) * 100;

        return {
          ...job.toObject(),
          matchScore: Math.round(matchScore),
          matchedSkills,
        };
      });

      // Sort by match score
      jobsWithScores.sort((a, b) => b.matchScore - a.matchScore);

      res.json({
        jobs: jobsWithScores,
        searchCriteria: { skills },
        totalMatches: jobsWithScores.length,
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get jobs suitable for a specific experience level
   */
  async getJobsByExperienceLevel(req, res, next) {
    try {
      const { level } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const validLevels = ['entry', 'mid', 'senior', 'executive'];
      if (!validLevels.includes(level)) {
        return res.status(400).json({
          error: 'Invalid experience level',
          message: `Valid levels: ${validLevels.join(', ')}`,
        });
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const [jobs, total] = await Promise.all([
        JobDescription.find({ 
          isActive: true, 
          experienceLevel: level 
        })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        JobDescription.countDocuments({ 
          isActive: true, 
          experienceLevel: level 
        }),
      ]);

      res.json({
        jobs,
        experienceLevel: level,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = JobController;