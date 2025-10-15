const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Resume = require('../models/Resume');
const ResumeParserService = require('../services/ResumeParserService');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `resume_${timestamp}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'pdf,txt').split(',');
    const fileExt = path.extname(file.originalname).slice(1).toLowerCase();
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error(`File type .${fileExt} not supported. Allowed types: ${allowedTypes.join(', ')}`));
    }
  },
});

class ResumeController {
  constructor() {
    this.parserService = new ResumeParserService();
  }

  /**
   * Upload and parse a new resume
   */
  async uploadResume(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'No file uploaded',
          message: 'Please select a resume file to upload',
        });
      }

      const { originalname, filename, path: filePath } = req.file;
      const fileExt = path.extname(originalname).slice(1).toLowerCase();

      // Read file buffer
      const fileBuffer = await fs.readFile(filePath);

      // Parse resume
      const parseResult = await this.parserService.parseResume(
        fileBuffer,
        originalname,
        fileExt
      );

      // Extract candidate name from parsed data or use filename
      const candidateName = parseResult.extractedData.name || 
                            this.extractCandidateName(parseResult.extractedData, originalname);

      // Save to database
      const resume = new Resume({
        candidateName,
        email: parseResult.extractedData.email || null,
        phone: parseResult.extractedData.phone || null,
        originalFileName: originalname,
        fileType: fileExt,
        rawText: parseResult.rawText,
        extractedData: parseResult.extractedData,
      });

      await resume.save();

      // Clean up uploaded file
      try {
        await fs.unlink(filePath);
      } catch (cleanupError) {
        console.warn('Failed to clean up uploaded file:', cleanupError);
      }

      res.status(201).json({
        message: 'Resume uploaded and parsed successfully',
        resumeId: resume._id,
        candidateName: resume.candidateName,
        extractedData: resume.extractedData,
        metadata: parseResult.metadata,
      });

    } catch (error) {
      console.error('Resume upload error:', error);
      
      // Clean up file if it exists
      if (req.file?.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (cleanupError) {
          console.warn('Failed to clean up file after error:', cleanupError);
        }
      }
      
      next(error);
    }
  }

  /**
   * Get all resumes with optional filtering
   */
  async getAllResumes(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        skills,
        minExperience,
        maxExperience,
        search,
      } = req.query;

      // Build filter query
      const filter = { isActive: true };

      if (skills) {
        const skillArray = skills.split(',').map(skill => skill.trim());
        filter['extractedData.skills.name'] = { 
          $in: skillArray.map(skill => new RegExp(skill, 'i')) 
        };
      }

      if (minExperience || maxExperience) {
        filter['extractedData.totalExperienceYears'] = {};
        if (minExperience) {
          filter['extractedData.totalExperienceYears'].$gte = parseInt(minExperience);
        }
        if (maxExperience) {
          filter['extractedData.totalExperienceYears'].$lte = parseInt(maxExperience);
        }
      }

      if (search) {
        filter.$or = [
          { candidateName: new RegExp(search, 'i') },
          { 'extractedData.summary': new RegExp(search, 'i') },
          { rawText: new RegExp(search, 'i') },
        ];
      }

      // Execute query with pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const [resumes, total] = await Promise.all([
        Resume.find(filter)
          .select('-rawText') // Exclude large text field
          .sort({ uploadedAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Resume.countDocuments(filter),
      ]);

      res.json({
        resumes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
        filters: { skills, minExperience, maxExperience, search },
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get specific resume by ID
   */
  async getResumeById(req, res, next) {
    try {
      const { id } = req.params;
      const { includeRawText = false } = req.query;

      const selectFields = includeRawText ? '' : '-rawText';
      const resume = await Resume.findById(id).select(selectFields);

      if (!resume) {
        return res.status(404).json({
          error: 'Resume not found',
          message: `No resume found with ID: ${id}`,
        });
      }

      res.json({
        resume,
        message: 'Resume retrieved successfully',
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Update resume data
   */
  async updateResume(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Validate updates
      const allowedUpdates = ['candidateName', 'email', 'phone', 'extractedData'];
      const updateKeys = Object.keys(updates);
      const isValidUpdate = updateKeys.every(key => allowedUpdates.includes(key));

      if (!isValidUpdate) {
        return res.status(400).json({
          error: 'Invalid updates',
          message: `Allowed fields: ${allowedUpdates.join(', ')}`,
        });
      }

      const resume = await Resume.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).select('-rawText');

      if (!resume) {
        return res.status(404).json({
          error: 'Resume not found',
          message: `No resume found with ID: ${id}`,
        });
      }

      res.json({
        message: 'Resume updated successfully',
        resume,
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete resume
   */
  async deleteResume(req, res, next) {
    try {
      const { id } = req.params;

      const resume = await Resume.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );

      if (!resume) {
        return res.status(404).json({
          error: 'Resume not found',
          message: `No resume found with ID: ${id}`,
        });
      }

      res.json({
        message: 'Resume deleted successfully',
        resumeId: id,
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get resume statistics
   */
  async getResumeStats(req, res, next) {
    try {
      const stats = await Resume.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalResumes: { $sum: 1 },
            avgExperience: { $avg: '$extractedData.totalExperienceYears' },
            skillsDistribution: { $push: '$extractedData.skills' },
          },
        },
      ]);

      // Process skills distribution
      let allSkills = [];
      if (stats[0]?.skillsDistribution) {
        allSkills = stats[0].skillsDistribution
          .flat()
          .reduce((acc, skillArray) => {
            if (Array.isArray(skillArray)) {
              skillArray.forEach(skill => {
                const existing = acc.find(s => s.name.toLowerCase() === skill.name.toLowerCase());
                if (existing) {
                  existing.count++;
                } else {
                  acc.push({ name: skill.name, category: skill.category, count: 1 });
                }
              });
            }
            return acc;
          }, [])
          .sort((a, b) => b.count - a.count)
          .slice(0, 20);
      }

      res.json({
        statistics: {
          totalResumes: stats[0]?.totalResumes || 0,
          averageExperience: Math.round((stats[0]?.avgExperience || 0) * 10) / 10,
          topSkills: allSkills,
        },
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Reparse resume (useful for improved parsing logic)
   */
  async reparseResume(req, res, next) {
    try {
      const { id } = req.params;

      const resume = await Resume.findById(id);
      if (!resume) {
        return res.status(404).json({
          error: 'Resume not found',
          message: `No resume found with ID: ${id}`,
        });
      }

      // Re-parse the raw text with current parser
      const extractedData = await this.parserService.extractStructuredData(resume.rawText);

      // Update resume with new extracted data
      resume.extractedData = extractedData;
      await resume.save();

      res.json({
        message: 'Resume reparsed successfully',
        resumeId: id,
        extractedData,
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Extract candidate name from parsed data or filename
   */
  extractCandidateName(extractedData, fileName) {
    // Try to extract from summary or experience
    if (extractedData.summary) {
      const nameMatch = extractedData.summary.match(/\b([A-Z][a-z]+\s+[A-Z][a-z]+)\b/);
      if (nameMatch) {
        return nameMatch[1];
      }
    }

    // Try filename without extension
    const nameFromFile = path.parse(fileName).name
      .replace(/[_-]/g, ' ')
      .replace(/resume|cv/i, '')
      .trim();

    if (nameFromFile.length > 3) {
      return nameFromFile;
    }

    return 'Unknown Candidate';
  }

  /**
   * Middleware for file upload
   */
  getUploadMiddleware() {
    return upload.single('resume');
  }
}

module.exports = ResumeController;