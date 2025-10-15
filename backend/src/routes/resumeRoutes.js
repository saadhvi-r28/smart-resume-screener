const express = require('express');
const ResumeController = require('../controllers/ResumeController');

const router = express.Router();
const resumeController = new ResumeController();

/**
 * @route POST /api/resumes/upload
 * @desc Upload and parse a new resume
 * @access Public
 */
router.post('/upload', 
  resumeController.getUploadMiddleware(),
  resumeController.uploadResume.bind(resumeController)
);

/**
 * @route GET /api/resumes
 * @desc Get all resumes with optional filtering and pagination
 * @access Public
 * @query page, limit, skills, minExperience, maxExperience, search
 */
router.get('/', resumeController.getAllResumes.bind(resumeController));

/**
 * @route GET /api/resumes/stats
 * @desc Get resume statistics
 * @access Public
 */
router.get('/stats', resumeController.getResumeStats.bind(resumeController));

/**
 * @route GET /api/resumes/:id
 * @desc Get specific resume by ID
 * @access Public
 * @query includeRawText - whether to include raw text in response
 */
router.get('/:id', resumeController.getResumeById.bind(resumeController));

/**
 * @route PUT /api/resumes/:id
 * @desc Update resume data
 * @access Public
 * @body Allowed fields: candidateName, email, phone, extractedData
 */
router.put('/:id', resumeController.updateResume.bind(resumeController));

/**
 * @route DELETE /api/resumes/:id
 * @desc Delete (deactivate) resume
 * @access Public
 */
router.delete('/:id', resumeController.deleteResume.bind(resumeController));

/**
 * @route POST /api/resumes/:id/reparse
 * @desc Reparse resume with current parsing logic
 * @access Public
 */
router.post('/:id/reparse', resumeController.reparseResume.bind(resumeController));

module.exports = router;