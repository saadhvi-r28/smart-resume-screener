// Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Global state
let currentSection = 'dashboard';
let currentData = {
    resumes: [],
    jobs: [],
    matches: []
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    loadDashboardData();
    initializeEventListeners();
});

// Navigation handling
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            if (section) {
                switchToSection(section);
            }
        });
    });
}

function switchToSection(section) {
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === section) {
            link.classList.add('active');
        }
    });

    // Show/hide sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.add('d-none');
    });
    document.getElementById(`${section}-section`).classList.remove('d-none');

    currentSection = section;

    // Load section-specific data
    switch (section) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'resumes':
            loadResumes();
            break;
        case 'jobs':
            loadJobs();
            break;
        case 'matches':
            loadMatches();
            break;
    }
}

// Initialize event listeners
function initializeEventListeners() {
    // Upload form
    document.getElementById('uploadForm').addEventListener('submit', handleResumeUpload);
    
    // Job form
    document.getElementById('jobForm').addEventListener('submit', handleJobSubmission);
}

// Dashboard functions
async function loadDashboardData() {
    try {
        showLoading(true);
        
        const [resumeStats, jobStats, matchStats] = await Promise.all([
            fetchData('/resumes/stats'),
            fetchData('/jobs/stats'),
            fetchData('/matches/stats')
        ]);

        // Update statistics cards
        document.getElementById('total-resumes').textContent = resumeStats.statistics.totalResumes;
        document.getElementById('total-jobs').textContent = jobStats.statistics.totalJobs;
        document.getElementById('total-matches').textContent = matchStats.statistics.totalMatches;
        document.getElementById('shortlisted-count').textContent = matchStats.statistics.shortlistedCount;

        // Load recent activity
        await loadRecentActivity();

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showToast('error', 'Failed to load dashboard data');
    } finally {
        showLoading(false);
    }
}

async function loadRecentActivity() {
    try {
        const [recentResumes, recentJobs] = await Promise.all([
            fetchData('/resumes?limit=5'),
            fetchData('/jobs?limit=5')
        ]);

        const activityContainer = document.getElementById('recent-activity');
        let activityHtml = '';

        // Recent resumes
        recentResumes.resumes.forEach(resume => {
            activityHtml += `
                <div class="d-flex align-items-center mb-2">
                    <i class="fas fa-file-alt text-primary me-3"></i>
                    <div>
                        <strong>${resume.candidateName}</strong> uploaded resume
                        <br><small class="text-muted">${formatDate(resume.uploadedAt)}</small>
                    </div>
                </div>
            `;
        });

        // Recent jobs
        recentJobs.jobs.forEach(job => {
            activityHtml += `
                <div class="d-flex align-items-center mb-2">
                    <i class="fas fa-briefcase text-success me-3"></i>
                    <div>
                        <strong>${job.title}</strong> at ${job.company} posted
                        <br><small class="text-muted">${formatDate(job.createdAt)}</small>
                    </div>
                </div>
            `;
        });

        activityContainer.innerHTML = activityHtml || '<p class="text-muted">No recent activity</p>';

    } catch (error) {
        console.error('Error loading recent activity:', error);
        document.getElementById('recent-activity').innerHTML = '<p class="text-muted">Failed to load recent activity</p>';
    }
}

// Resume functions
async function loadResumes() {
    try {
        showLoading(true);
        const data = await fetchData('/resumes');
        currentData.resumes = data.resumes;
        renderResumesTable();
    } catch (error) {
        console.error('Error loading resumes:', error);
        showToast('error', 'Failed to load resumes');
    } finally {
        showLoading(false);
    }
}

function renderResumesTable() {
    const tbody = document.querySelector('#resumes-table tbody');
    tbody.innerHTML = '';

    currentData.resumes.forEach(resume => {
        const row = document.createElement('tr');
        
        const topSkills = (resume.extractedData.skills || [])
            .slice(0, 3)
            .map(skill => skill.name)
            .join(', ');

        row.innerHTML = `
            <td>
                <strong>${resume.candidateName}</strong>
                ${resume.email ? `<br><small class="text-muted">${resume.email}</small>` : ''}
            </td>
            <td>${resume.extractedData.totalExperienceYears || 0} years</td>
            <td>
                <span class="text-truncate d-inline-block" style="max-width: 200px;" title="${topSkills}">
                    ${topSkills || 'No skills listed'}
                </span>
            </td>
            <td>${formatDate(resume.uploadedAt)}</td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    <button type="button" class="btn btn-outline-primary" onclick="viewResume('${resume._id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button type="button" class="btn btn-outline-success" onclick="findJobsForResume('${resume._id}')">
                        <i class="fas fa-search"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Job functions
async function loadJobs() {
    try {
        showLoading(true);
        const data = await fetchData('/jobs');
        currentData.jobs = data.jobs;
        renderJobsTable();
    } catch (error) {
        console.error('Error loading jobs:', error);
        showToast('error', 'Failed to load jobs');
    } finally {
        showLoading(false);
    }
}

function renderJobsTable() {
    const tbody = document.querySelector('#jobs-table tbody');
    tbody.innerHTML = '';

    currentData.jobs.forEach(job => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <strong>${job.title}</strong>
                ${job.location ? `<br><small class="text-muted">${job.location}</small>` : ''}
            </td>
            <td>${job.company}</td>
            <td><span class="badge bg-secondary">${job.experienceLevel}</span></td>
            <td>${formatDate(job.createdAt)}</td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    <button type="button" class="btn btn-outline-primary" onclick="viewJob('${job._id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button type="button" class="btn btn-outline-success" onclick="matchResumesToJob('${job._id}')">
                        <i class="fas fa-users"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Match functions
async function loadMatches() {
    try {
        showLoading(true);
        const data = await fetchData('/matches/shortlisted');
        currentData.matches = data.shortlistedCandidates;
        renderMatchesTable();
    } catch (error) {
        console.error('Error loading matches:', error);
        showToast('error', 'Failed to load matches');
    } finally {
        showLoading(false);
    }
}

function renderMatchesTable() {
    const tbody = document.querySelector('#matches-table tbody');
    tbody.innerHTML = '';

    currentData.matches.forEach(match => {
        const row = document.createElement('tr');
        
        const scoreColor = getScoreColor(match.overallScore);
        const statusBadge = getStatusBadge(match.matchStatus);

        row.innerHTML = `
            <td>
                <strong>${match.resumeId.candidateName}</strong>
                ${match.resumeId.email ? `<br><small class="text-muted">${match.resumeId.email}</small>` : ''}
            </td>
            <td>
                <strong>${match.jobId.title}</strong>
                <br><small class="text-muted">${match.jobId.company}</small>
            </td>
            <td>
                <span class="badge ${scoreColor}">${match.overallScore.toFixed(1)}/10</span>
            </td>
            <td>${statusBadge}</td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    <button type="button" class="btn btn-outline-primary" onclick="viewMatchDetails('${match._id}')">
                        <i class="fas fa-info-circle"></i>
                    </button>
                    <button type="button" class="btn btn-outline-warning" onclick="toggleShortlist('${match._id}', false)">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Modal functions
function showUploadModal() {
    const modal = new bootstrap.Modal(document.getElementById('uploadModal'));
    modal.show();
}

function showJobModal() {
    const modal = new bootstrap.Modal(document.getElementById('jobModal'));
    modal.show();
}

// Form handlers
async function handleResumeUpload(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const fileInput = document.getElementById('resumeFile');
    
    if (!fileInput.files[0]) {
        showToast('error', 'Please select a file to upload');
        return;
    }

    try {
        showProgress(true);
        
        const response = await fetch(`${API_BASE_URL}/resumes/upload`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            showToast('success', `Resume uploaded successfully for ${result.candidateName}`);
            form.reset();
            bootstrap.Modal.getInstance(document.getElementById('uploadModal')).hide();
            
            // Refresh data if on resumes section
            if (currentSection === 'resumes') {
                await loadResumes();
            }
            
            // Update dashboard stats
            if (currentSection === 'dashboard') {
                await loadDashboardData();
            }
        } else {
            throw new Error(result.message || 'Upload failed');
        }

    } catch (error) {
        console.error('Upload error:', error);
        showToast('error', error.message || 'Failed to upload resume');
    } finally {
        showProgress(false);
    }
}

async function handleJobSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    // Process form data
    const jobData = {};
    for (let [key, value] of formData.entries()) {
        if (key === 'skills') {
            // Convert skills string to array of skill objects
            jobData.requirements = {
                requiredSkills: value.split(',').map(skill => ({
                    name: skill.trim(),
                    importance: 'must-have'
                })),
                minimumExperience: parseInt(formData.get('minimumExperience') || '0')
            };
        } else if (key !== 'minimumExperience') {
            jobData[key] = value;
        }
    }

    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/jobs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jobData)
        });

        const result = await response.json();

        if (response.ok) {
            showToast('success', `Job "${result.job.title}" created successfully`);
            form.reset();
            bootstrap.Modal.getInstance(document.getElementById('jobModal')).hide();
            
            // Refresh data if on jobs section
            if (currentSection === 'jobs') {
                await loadJobs();
            }
            
            // Update dashboard stats
            if (currentSection === 'dashboard') {
                await loadDashboardData();
            }
        } else {
            throw new Error(result.message || 'Failed to create job');
        }

    } catch (error) {
        console.error('Job creation error:', error);
        showToast('error', error.message || 'Failed to create job');
    } finally {
        showLoading(false);
    }
}

// Action functions
async function matchResumesToJob(jobId) {
    if (!confirm('This will analyze all resumes against this job. Continue?')) {
        return;
    }

    try {
        showLoading(true);
        showToast('success', 'Starting bulk matching process...');

        const response = await fetch(`${API_BASE_URL}/matches/job/${jobId}/bulk`, {
            method: 'POST'
        });

        const result = await response.json();

        if (response.ok) {
            showToast('success', 
                `Matching completed! Found ${result.matches.length} matches out of ${result.statistics.processedCount} resumes processed.`
            );
            
            if (currentSection === 'matches') {
                await loadMatches();
            }
        } else {
            throw new Error(result.message || 'Matching failed');
        }

    } catch (error) {
        console.error('Bulk matching error:', error);
        showToast('error', error.message || 'Failed to perform bulk matching');
    } finally {
        showLoading(false);
    }
}

async function findJobsForResume(resumeId) {
    try {
        showLoading(true);
        
        const response = await fetchData(`/matches/resume/${resumeId}`);
        
        if (response.matches.length > 0) {
            showToast('success', `Found ${response.matches.length} job matches for this candidate`);
        } else {
            showToast('info', 'No job matches found for this candidate');
        }

    } catch (error) {
        console.error('Error finding jobs:', error);
        showToast('error', 'Failed to find job matches');
    } finally {
        showLoading(false);
    }
}

function viewResume(resumeId) {
    // In a real app, this would show a detailed resume view
    showToast('info', 'Resume details view would open here');
}

function viewJob(jobId) {
    // In a real app, this would show detailed job description
    showToast('info', 'Job details view would open here');
}

function viewMatchDetails(matchId) {
    // In a real app, this would show detailed matching analysis
    showToast('info', 'Match details with LLM analysis would open here');
}

async function toggleShortlist(matchId, isShortlisted) {
    try {
        const response = await fetch(`${API_BASE_URL}/matches/${matchId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ isShortlisted })
        });

        const result = await response.json();

        if (response.ok) {
            showToast('success', result.message);
            if (currentSection === 'matches') {
                await loadMatches();
            }
        } else {
            throw new Error(result.message || 'Failed to update status');
        }

    } catch (error) {
        console.error('Error updating shortlist status:', error);
        showToast('error', error.message || 'Failed to update status');
    }
}

// Utility functions
async function fetchData(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API request failed');
    }
    return response.json();
}

function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (show) {
        spinner.classList.remove('d-none');
    } else {
        spinner.classList.add('d-none');
    }
}

function showProgress(show) {
    const progressDiv = document.querySelector('.upload-progress');
    if (show) {
        progressDiv.classList.remove('d-none');
        // Simulate progress
        let progress = 0;
        const progressBar = progressDiv.querySelector('.progress-bar');
        const interval = setInterval(() => {
            progress += 10;
            progressBar.style.width = `${progress}%`;
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    progressDiv.classList.add('d-none');
                    progressBar.style.width = '0%';
                }, 1000);
            }
        }, 200);
    } else {
        progressDiv.classList.add('d-none');
    }
}

function showToast(type, message) {
    const toastElement = document.getElementById(type === 'error' ? 'errorToast' : 'successToast');
    const toastBody = toastElement.querySelector('.toast-body');
    toastBody.textContent = message;
    
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

function getScoreColor(score) {
    if (score >= 8) return 'bg-success';
    if (score >= 6) return 'bg-info';
    if (score >= 4) return 'bg-warning';
    return 'bg-danger';
}

function getStatusBadge(status) {
    const badges = {
        excellent: '<span class="badge bg-success">Excellent</span>',
        good: '<span class="badge bg-info">Good</span>',
        average: '<span class="badge bg-warning">Average</span>',
        poor: '<span class="badge bg-danger">Poor</span>'
    };
    return badges[status] || '<span class="badge bg-secondary">Unknown</span>';
}