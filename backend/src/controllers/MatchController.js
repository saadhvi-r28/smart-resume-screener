const Resume = require('../models/Resume');
const JobDescription = require('../models/JobDescription');
const MatchResult = require('../models/MatchResult');
const LLMService = require('../services/LLMService');

class MatchController {
  constructor() {
    this.llmService = new LLMService();
  }

  /**
   * Get all matches with pagination and filtering
   */
  async getAllMatches(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        minScore,
        shortlistedOnly,
        sortBy = 'overallScore',
        sortOrder = 'desc',
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const filter = {};

      if (minScore) {
        filter.overallScore = { $gte: parseFloat(minScore) };
      }

      if (shortlistedOnly === 'true') {
        filter.isShortlisted = true;
      }

      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const [matches, totalCount] = await Promise.all([
        MatchResult.find(filter)
          .populate('resumeId', 'candidateName email extractedData.totalExperienceYears extractedData.skills')
          .populate('jobId', 'title company experienceLevel requirements.requiredSkills')
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit)),
        MatchResult.countDocuments(filter),
      ]);

      res.json({
        matches,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalItems: totalCount,
          itemsPerPage: parseInt(limit),
        },
        filters: { minScore, shortlistedOnly },
      });

    } catch (error) {
      console.error('Get all matches error:', error);
      next(error);
    }
  }

  /**
   * Match a single resume with a job description
   */
  async matchResumeWithJob(req, res, next) {
    try {
      const { resumeId, jobId } = req.body;

      if (!resumeId || !jobId) {
        return res.status(400).json({
          error: 'Missing required parameters',
          message: 'Both resumeId and jobId are required',
        });
      }

      // Fetch resume and job data
      const [resume, job] = await Promise.all([
        Resume.findById(resumeId),
        JobDescription.findById(jobId),
      ]);

      if (!resume) {
        return res.status(404).json({
          error: 'Resume not found',
          message: `No resume found with ID: ${resumeId}`,
        });
      }

      if (!job) {
        return res.status(404).json({
          error: 'Job not found',
          message: `No job found with ID: ${jobId}`,
        });
      }

      // Check if match already exists
      const existingMatch = await MatchResult.findOne({ resumeId, jobId });
      if (existingMatch) {
        return res.json({
          message: 'Match already exists',
          match: existingMatch,
          isExisting: true,
        });
      }

      // Perform LLM analysis
      const llmAnalysis = await this.llmService.compareResumeWithJob(resume, job);

      // Calculate detailed scoring
      const detailedScoring = this.calculateDetailedScoring(resume, job);

      // Create match result
      const matchResult = new MatchResult({
        jobId,
        resumeId,
        overallScore: llmAnalysis.overallScore,
        detailedScoring,
        llmAnalysis,
        matchStatus: this.llmService.determineMatchStatus(llmAnalysis.overallScore),
        isShortlisted: this.llmService.shouldShortlist(llmAnalysis.overallScore, 
          this.llmService.determineMatchStatus(llmAnalysis.overallScore)),
      });

      await matchResult.save();

      // Populate references for response
      await matchResult.populate([
        { path: 'resumeId', select: 'candidateName email extractedData.totalExperienceYears' },
        { path: 'jobId', select: 'title company experienceLevel' },
      ]);

      res.status(201).json({
        message: 'Match analysis completed successfully',
        match: matchResult,
        isNew: true,
      });

    } catch (error) {
      console.error('Match analysis error:', error);
      next(error);
    }
  }

  /**
   * Match all resumes with a specific job
   */
  async matchAllResumesWithJob(req, res, next) {
    try {
      const { jobId } = req.params;
      const { 
        minScore = 0, 
        limit = 50,
        forceReprocess = false 
      } = req.query;

      // Verify job exists
      const job = await JobDescription.findById(jobId);
      if (!job) {
        return res.status(404).json({
          error: 'Job not found',
          message: `No job found with ID: ${jobId}`,
        });
      }

      // Get all active resumes
      const resumes = await Resume.find({ isActive: true });

      if (resumes.length === 0) {
        return res.json({
          message: 'No resumes found',
          matches: [],
          processedCount: 0,
        });
      }

      const matches = [];
      let processedCount = 0;
      const errors = [];

      // Process each resume
      for (const resume of resumes.slice(0, parseInt(limit))) {
        try {
          // Check if match already exists
          let matchResult = await MatchResult.findOne({ 
            resumeId: resume._id, 
            jobId 
          });

          // Skip if match exists and not forcing reprocess
          if (matchResult && !forceReprocess) {
            if (matchResult.overallScore >= parseFloat(minScore)) {
              await matchResult.populate([
                { path: 'resumeId', select: 'candidateName email extractedData.totalExperienceYears' },
                { path: 'jobId', select: 'title company experienceLevel' },
              ]);
              matches.push(matchResult);
            }
            continue;
          }

          // Perform LLM analysis
          const llmAnalysis = await this.llmService.compareResumeWithJob(resume, job);

          // Skip if score is below threshold
          if (llmAnalysis.overallScore < parseFloat(minScore)) {
            processedCount++;
            continue;
          }

          // Calculate detailed scoring
          const detailedScoring = this.calculateDetailedScoring(resume, job);

          // Create or update match result
          const matchData = {
            overallScore: llmAnalysis.overallScore,
            detailedScoring,
            llmAnalysis,
            matchStatus: this.llmService.determineMatchStatus(llmAnalysis.overallScore),
            isShortlisted: this.llmService.shouldShortlist(llmAnalysis.overallScore, 
              this.llmService.determineMatchStatus(llmAnalysis.overallScore)),
            matchedAt: new Date(),
          };

          if (matchResult) {
            // Update existing match
            Object.assign(matchResult, matchData);
            await matchResult.save();
          } else {
            // Create new match
            matchResult = new MatchResult({
              jobId,
              resumeId: resume._id,
              ...matchData,
            });
            await matchResult.save();
          }

          // Populate references
          await matchResult.populate([
            { path: 'resumeId', select: 'candidateName email extractedData.totalExperienceYears' },
            { path: 'jobId', select: 'title company experienceLevel' },
          ]);

          matches.push(matchResult);
          processedCount++;

          // Add small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          console.error(`Error processing resume ${resume._id}:`, error);
          errors.push({
            resumeId: resume._id,
            candidateName: resume.candidateName,
            error: error.message,
          });
        }
      }

      // Sort matches by score (descending)
      matches.sort((a, b) => b.overallScore - a.overallScore);

      res.json({
        message: 'Bulk matching completed',
        job: {
          id: job._id,
          title: job.title,
          company: job.company,
        },
        matches,
        statistics: {
          totalResumes: resumes.length,
          processedCount,
          matchesFound: matches.length,
          errorCount: errors.length,
        },
        errors: errors.length > 0 ? errors : undefined,
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all matches for a specific job
   */
  async getJobMatches(req, res, next) {
    try {
      const { jobId } = req.params;
      const { 
        page = 1, 
        limit = 10, 
        minScore = 0,
        shortlistedOnly = false,
        sortBy = 'overallScore',
        sortOrder = 'desc'
      } = req.query;

      // Build filter
      const filter = { jobId };
      
      if (parseFloat(minScore) > 0) {
        filter.overallScore = { $gte: parseFloat(minScore) };
      }

      if (shortlistedOnly === 'true') {
        filter.isShortlisted = true;
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const [matches, total] = await Promise.all([
        MatchResult.find(filter)
          .populate([
            { path: 'resumeId', select: 'candidateName email extractedData.totalExperienceYears extractedData.skills' },
            { path: 'jobId', select: 'title company experienceLevel' },
          ])
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit)),
        MatchResult.countDocuments(filter),
      ]);

      res.json({
        matches,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
        filters: { minScore, shortlistedOnly, sortBy, sortOrder },
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all matches for a specific resume
   */
  async getResumeMatches(req, res, next) {
    try {
      const { resumeId } = req.params;
      const { 
        page = 1, 
        limit = 10, 
        minScore = 0,
        sortBy = 'overallScore',
        sortOrder = 'desc'
      } = req.query;

      // Build filter
      const filter = { resumeId };
      
      if (parseFloat(minScore) > 0) {
        filter.overallScore = { $gte: parseFloat(minScore) };
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const [matches, total] = await Promise.all([
        MatchResult.find(filter)
          .populate([
            { path: 'resumeId', select: 'candidateName email extractedData.totalExperienceYears' },
            { path: 'jobId', select: 'title company experienceLevel location' },
          ])
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit)),
        MatchResult.countDocuments(filter),
      ]);

      res.json({
        matches,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
        filters: { minScore, sortBy, sortOrder },
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get shortlisted candidates for all jobs or specific job
   */
  async getShortlistedCandidates(req, res, next) {
    try {
      const { jobId } = req.query;
      const { page = 1, limit = 20 } = req.query;

      const filter = { isShortlisted: true };
      if (jobId) {
        filter.jobId = jobId;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const [matches, total] = await Promise.all([
        MatchResult.find(filter)
          .populate([
            { 
              path: 'resumeId', 
              select: 'candidateName email phone extractedData.totalExperienceYears extractedData.skills extractedData.summary' 
            },
            { path: 'jobId', select: 'title company experienceLevel location' },
          ])
          .sort({ overallScore: -1, matchedAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        MatchResult.countDocuments(filter),
      ]);

      res.json({
        shortlistedCandidates: matches,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
        filters: { jobId },
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Update match status (shortlist/unshortlist)
   */
  async updateMatchStatus(req, res, next) {
    try {
      const { matchId } = req.params;
      const { isShortlisted, notes } = req.body;

      const match = await MatchResult.findByIdAndUpdate(
        matchId,
        { 
          isShortlisted: Boolean(isShortlisted),
          ...(notes && { 'llmAnalysis.notes': notes }),
          updatedAt: new Date(),
        },
        { new: true }
      ).populate([
        { path: 'resumeId', select: 'candidateName email' },
        { path: 'jobId', select: 'title company' },
      ]);

      if (!match) {
        return res.status(404).json({
          error: 'Match not found',
          message: `No match found with ID: ${matchId}`,
        });
      }

      res.json({
        message: `Candidate ${isShortlisted ? 'shortlisted' : 'removed from shortlist'} successfully`,
        match,
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get match statistics
   */
  async getMatchStats(req, res, next) {
    try {
      const { jobId } = req.query;

      const matchFilter = jobId ? { jobId } : {};

      const stats = await MatchResult.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: null,
            totalMatches: { $sum: 1 },
            averageScore: { $avg: '$overallScore' },
            shortlistedCount: {
              $sum: { $cond: [{ $eq: ['$isShortlisted', true] }, 1, 0] }
            },
            scoreDistribution: {
              $push: {
                $switch: {
                  branches: [
                    { case: { $gte: ['$overallScore', 8] }, then: 'excellent' },
                    { case: { $gte: ['$overallScore', 6] }, then: 'good' },
                    { case: { $gte: ['$overallScore', 4] }, then: 'average' },
                  ],
                  default: 'poor'
                }
              }
            },
          },
        },
      ]);

      let scoreDistribution = { excellent: 0, good: 0, average: 0, poor: 0 };
      if (stats[0]?.scoreDistribution) {
        scoreDistribution = stats[0].scoreDistribution.reduce((acc, status) => {
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, { excellent: 0, good: 0, average: 0, poor: 0 });
      }

      res.json({
        statistics: {
          totalMatches: stats[0]?.totalMatches || 0,
          averageScore: Math.round((stats[0]?.averageScore || 0) * 100) / 100,
          shortlistedCount: stats[0]?.shortlistedCount || 0,
          shortlistRate: stats[0]?.totalMatches ? 
            Math.round((stats[0].shortlistedCount / stats[0].totalMatches) * 100) : 0,
          scoreDistribution,
        },
        filters: { jobId },
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Calculate detailed scoring based on resume and job data
   */
  calculateDetailedScoring(resume, job) {
    const candidateSkills = resume.extractedData?.skills || [];
    const requiredSkills = job.requirements?.requiredSkills || [];
    const candidateExperience = resume.extractedData?.totalExperienceYears || 0;
    const requiredExperience = job.requirements?.minimumExperience || 0;

    // Skills matching
    const skillsMatch = this.calculateSkillsMatch(candidateSkills, requiredSkills);
    
    // Experience matching
    const experienceMatch = this.calculateExperienceMatch(
      candidateExperience, 
      requiredExperience,
      resume.extractedData?.experience || []
    );

    // Education matching
    const educationMatch = this.calculateEducationMatch(
      resume.extractedData?.education || [],
      job.requirements?.educationRequirement
    );

    return {
      skillsMatch,
      experienceMatch,
      educationMatch,
    };
  }

  /**
   * Calculate skills matching score
   */
  calculateSkillsMatch(candidateSkills, requiredSkills) {
    if (requiredSkills.length === 0) {
      return { score: 8, matchedSkills: [], missingSkills: [] };
    }

    const matchedSkills = [];
    const missingSkills = [];

    requiredSkills.forEach(requiredSkill => {
      const match = candidateSkills.find(candidateSkill => 
        candidateSkill.name.toLowerCase().includes(requiredSkill.name.toLowerCase()) ||
        requiredSkill.name.toLowerCase().includes(candidateSkill.name.toLowerCase())
      );

      if (match) {
        matchedSkills.push({
          skill: requiredSkill.name,
          candidateLevel: match.proficiencyLevel,
          requiredLevel: 'required',
          match: true,
        });
      } else {
        missingSkills.push(requiredSkill.name);
      }
    });

    const matchPercentage = matchedSkills.length / requiredSkills.length;
    const score = Math.min(10, matchPercentage * 8 + 2); // Scale to 2-10 range

    return {
      score: Math.round(score * 10) / 10,
      matchedSkills,
      missingSkills,
    };
  }

  /**
   * Calculate experience matching score
   */
  calculateExperienceMatch(candidateExperience, requiredExperience, experienceDetails) {
    if (requiredExperience === 0) {
      return { 
        score: 8, 
        candidateExperience, 
        requiredExperience: 0,
        relevantExperience: []
      };
    }

    let score;
    if (candidateExperience >= requiredExperience) {
      // Bonus for exceeding requirements, but cap at 10
      score = Math.min(10, 7 + (candidateExperience - requiredExperience) * 0.5);
    } else {
      // Penalty for insufficient experience
      const deficit = requiredExperience - candidateExperience;
      score = Math.max(1, 7 - deficit * 1.5);
    }

    const relevantExperience = experienceDetails.map(exp => ({
      company: exp.company || 'Unknown',
      position: exp.position || 'Unknown',
      relevanceScore: 7, // Could be enhanced with NLP analysis
    }));

    return {
      score: Math.round(score * 10) / 10,
      candidateExperience,
      requiredExperience,
      relevantExperience,
    };
  }

  /**
   * Calculate education matching score
   */
  calculateEducationMatch(candidateEducation, requiredEducation) {
    if (!requiredEducation) {
      return {
        score: 8,
        candidateEducation: 'Not specified',
        requiredEducation: 'Not specified',
        meets: true,
      };
    }

    // Simple education matching - could be enhanced
    const educationString = candidateEducation
      .map(edu => `${edu.degree} ${edu.fieldOfStudy}`.toLowerCase())
      .join(' ');

    const requiredLower = requiredEducation.toLowerCase();
    const meets = educationString.includes('bachelor') || 
                 educationString.includes('master') || 
                 educationString.includes('phd') ||
                 requiredLower.includes('high school') ||
                 requiredLower.includes('any degree');

    return {
      score: meets ? 8 : 5,
      candidateEducation: candidateEducation.length > 0 ? 
        candidateEducation[0].degree : 'Not specified',
      requiredEducation,
      meets,
    };
  }
}

module.exports = MatchController;