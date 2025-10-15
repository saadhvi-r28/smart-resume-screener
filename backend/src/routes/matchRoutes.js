const express = require('express');
const MatchController = require('../controllers/MatchController');

const router = express.Router();
const matchController = new MatchController();

/**
 * @route GET /api/matches
 * @desc Get all matches with pagination and filtering
 * @access Public
 * @query page, limit, minScore, shortlistedOnly, sortBy, sortOrder
 */
router.get('/', matchController.getAllMatches.bind(matchController));

/**
 * @route POST /api/matches
 * @desc Match a single resume with a job description
 * @access Public
 * @body { resumeId: string, jobId: string }
 */
router.post('/', matchController.matchResumeWithJob.bind(matchController));

/**
 * @route POST /api/matches/job/:jobId/bulk
 * @desc Match all resumes with a specific job
 * @access Public
 * @query minScore, limit, forceReprocess
 */
router.post('/job/:jobId/bulk', matchController.matchAllResumesWithJob.bind(matchController));

/**
 * @route GET /api/matches/job/:jobId
 * @desc Get all matches for a specific job
 * @access Public
 * @query page, limit, minScore, shortlistedOnly, sortBy, sortOrder
 */
router.get('/job/:jobId', matchController.getJobMatches.bind(matchController));

/**
 * @route GET /api/matches/resume/:resumeId
 * @desc Get all matches for a specific resume
 * @access Public
 * @query page, limit, minScore, sortBy, sortOrder
 */
router.get('/resume/:resumeId', matchController.getResumeMatches.bind(matchController));

/**
 * @route GET /api/matches/shortlisted
 * @desc Get shortlisted candidates for all jobs or specific job
 * @access Public
 * @query jobId, page, limit
 */
router.get('/shortlisted', matchController.getShortlistedCandidates.bind(matchController));

/**
 * @route GET /api/matches/stats
 * @desc Get match statistics
 * @access Public
 * @query jobId
 */
router.get('/stats', matchController.getMatchStats.bind(matchController));

/**
 * @route PUT /api/matches/:matchId/status
 * @desc Update match status (shortlist/unshortlist)
 * @access Public
 * @body { isShortlisted: boolean, notes?: string }
 */
router.put('/:matchId/status', matchController.updateMatchStatus.bind(matchController));

module.exports = router;