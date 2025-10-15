const express = require('express');
const JobController = require('../controllers/JobController');

const router = express.Router();
const jobController = new JobController();

/**
 * @route POST /api/jobs
 * @desc Create a new job description
 * @access Public
 * @body Full job description object
 */
router.post('/', jobController.createJob.bind(jobController));

/**
 * @route GET /api/jobs
 * @desc Get all job descriptions with filtering and pagination
 * @access Public
 * @query page, limit, company, experienceLevel, location, isActive, skills, search
 */
router.get('/', jobController.getAllJobs.bind(jobController));

/**
 * @route GET /api/jobs/stats
 * @desc Get job statistics
 * @access Public
 */
router.get('/stats', jobController.getJobStats.bind(jobController));

/**
 * @route POST /api/jobs/search-by-skills
 * @desc Search jobs by candidate skills
 * @access Public
 * @body { skills: string[] }
 */
router.post('/search-by-skills', jobController.searchJobsBySkills.bind(jobController));

/**
 * @route GET /api/jobs/experience/:level
 * @desc Get jobs by experience level
 * @access Public
 * @param level - entry, mid, senior, executive
 */
router.get('/experience/:level', jobController.getJobsByExperienceLevel.bind(jobController));

/**
 * @route GET /api/jobs/:id
 * @desc Get specific job description by ID
 * @access Public
 */
router.get('/:id', jobController.getJobById.bind(jobController));

/**
 * @route PUT /api/jobs/:id
 * @desc Update job description
 * @access Public
 * @body Partial job description object
 */
router.put('/:id', jobController.updateJob.bind(jobController));

/**
 * @route DELETE /api/jobs/:id
 * @desc Delete (deactivate) job description
 * @access Public
 */
router.delete('/:id', jobController.deleteJob.bind(jobController));

module.exports = router;