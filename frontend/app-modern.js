// Smart Resume Screener - Modern Interactive Frontend
// ===================================================

const API_BASE_URL = 'http://localhost:3000';

// Utility Functions
// =================
function getSkillName(skill) {
    // Handle both string skills and object skills with name property
    if (typeof skill === 'string') {
        return skill;
    }
    if (typeof skill === 'object' && skill.name) {
        return skill.name;
    }
    return 'Unknown';
}

function formatSkills(skills, maxDisplay = 3) {
    if (!Array.isArray(skills) || skills.length === 0) {
        return '<span class="badge" style="background: var(--bg-tertiary); color: var(--text-secondary);">No skills listed</span>';
    }
    
    const displaySkills = skills.slice(0, maxDisplay);
    const remainingCount = skills.length - maxDisplay;
    
    let html = displaySkills.map(skill => {
        const skillName = getSkillName(skill);
        return `<span class="badge badge-info">${skillName}</span>`;
    }).join(' ');
    
    if (remainingCount > 0) {
        html += ` <span class="badge" style="background: var(--bg-tertiary); color: var(--text-secondary);">+${remainingCount}</span>`;
    }
    
    return html;
}

// Theme Management
// ================
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeUI(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeUI(newTheme);
    
    showNotification('Theme Changed', `Switched to ${newTheme} mode`, 'success');
}

function updateThemeUI(theme) {
    const icon = document.getElementById('themeIcon');
    const text = document.getElementById('themeText');
    
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
        text.textContent = 'Light';
    } else {
        icon.className = 'fas fa-moon';
        text.textContent = 'Dark';
    }
}

// Notifications
// =============
function showNotification(title, message, type = 'info') {
    const container = document.getElementById('notification-container');
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    const colors = {
        success: 'var(--success-color)',
        error: 'var(--danger-color)',
        warning: 'var(--warning-color)',
        info: 'var(--info-color)'
    };
    
    notification.innerHTML = `
        <div class="notification-icon" style="color: ${colors[type]};">
            <i class="fas ${icons[type]}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <div class="notification-close">
            <i class="fas fa-times"></i>
        </div>
    `;
    
    container.appendChild(notification);
    
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
    });
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Loading Overlay
// ===============
function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

// Navigation
// ==========
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show selected section
    const section = document.getElementById(`${sectionName}-section`);
    if (section) {
        section.style.display = 'block';
        section.classList.add('fade-in');
    }
    
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Load section data
    if (sectionName === 'resumes') {
        loadResumes();
    } else if (sectionName === 'jobs') {
        loadJobs();
    } else if (sectionName === 'matches') {
        loadMatches();
    }
}

// Dashboard Stats
// ===============
async function loadStats() {
    try {
        const [resumesRes, jobsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/resumes`),
            fetch(`${API_BASE_URL}/api/jobs`)
        ]);
        
        const resumes = await resumesRes.json();
        const jobs = await jobsRes.json();
        
        // Get all matches from all jobs
        let allMatches = [];
        const jobList = jobs.jobs || [];
        
        for (const job of jobList) {
            try {
                const matchRes = await fetch(`${API_BASE_URL}/api/matches/job/${job._id}`);
                if (matchRes.ok) {
                    const matchData = await matchRes.json();
                    if (matchData.matches && Array.isArray(matchData.matches)) {
                        allMatches = allMatches.concat(matchData.matches);
                    }
                }
            } catch (err) {
                console.warn(`Could not load matches for job ${job._id}:`, err);
            }
        }
        
        animateCounter('total-resumes', resumes.pagination?.total || 0);
        animateCounter('total-jobs', jobs.pagination?.total || 0);
        animateCounter('total-matches', allMatches.length);
        
        // Calculate average match score
        if (allMatches.length > 0) {
            const avgScore = allMatches.reduce((sum, match) => sum + (match.overallScore * 10 || 0), 0) / allMatches.length;
            animateCounter('avg-match', Math.round(avgScore), '%');
        } else {
            animateCounter('avg-match', 0, '%');
        }
        
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

function animateCounter(elementId, target, suffix = '') {
    const element = document.getElementById(elementId);
    const duration = 1000;
    const steps = 50;
    const increment = target / steps;
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + suffix;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + suffix;
        }
    }, duration / steps);
}

function refreshStats() {
    showNotification('Refreshing', 'Updating dashboard statistics...', 'info');
    loadStats();
    setTimeout(() => {
        showNotification('Updated', 'Dashboard data refreshed successfully!', 'success');
    }, 1000);
}

// Resume Management
// =================
async function loadResumes() {
    const container = document.getElementById('resumes-list');
    container.innerHTML = '<div style="text-align: center; padding: 2rem;"><div class="spinner" style="margin: 0 auto;"></div></div>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/resumes`);
        const data = await response.json();
        
        if (!data.resumes || data.resumes.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <i class="fas fa-inbox" style="font-size: 3rem; opacity: 0.3; margin-bottom: 1rem;"></i>
                    <h3>No Resumes Yet</h3>
                    <p>Upload your first resume to get started!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Candidate</th>
                            <th>Email</th>
                            <th>Skills</th>
                            <th>Experience</th>
                            <th>Uploaded</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.resumes.map(resume => `
                            <tr>
                                <td>
                                    <strong>${resume.candidateName || 'Unknown'}</strong>
                                </td>
                                <td>${resume.email || 'N/A'}</td>
                                <td>
                                    ${formatSkills(resume.extractedData?.skills)}
                                </td>
                                <td>${resume.extractedData?.totalExperienceYears || resume.extractedData?.totalYearsExperience || '0'} years</td>
                                <td>${new Date(resume.uploadedAt).toLocaleDateString()}</td>
                                <td>
                                    <div style="display: flex; gap: 0.5rem;">
                                        <button class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.875rem;" onclick="viewResume('${resume._id}')" title="View Resume">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button class="btn btn-danger" style="padding: 0.5rem 1rem; font-size: 0.875rem;" onclick="deleteResume('${resume._id}', '${resume.candidateName?.replace(/'/g, "\\'")}')">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading resumes:', error);
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--danger-color);">
                <i class="fas fa-exclamation-circle" style="font-size: 2rem;"></i>
                <p>Error loading resumes. Please try again.</p>
            </div>
        `;
    }
}

// View Resume Details
// ===================
async function viewResume(resumeId) {
    const modal = document.getElementById('resumeModal');
    const modalBody = document.getElementById('modalBody');
    
    modal.style.display = 'flex';
    modalBody.innerHTML = '<div style="text-align: center; padding: 3rem;"><div class="spinner" style="margin: 0 auto;"></div><p style="margin-top: 1rem; color: var(--text-secondary);">Loading resume...</p></div>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/resumes/${resumeId}`);
        if (!response.ok) throw new Error('Failed to fetch resume');
        
        const data = await response.json();
        const resume = data.resume || data; // Handle both {resume: {...}} and direct {...} responses
        
        document.getElementById('modalTitle').innerHTML = `<i class="fas fa-file-alt" style="margin-right: 0.5rem;"></i>${resume.candidateName || 'Resume Details'}`;
        
        const hasExperience = resume.extractedData?.experience && resume.extractedData.experience.length > 0;
        const hasEducation = resume.extractedData?.education && resume.extractedData.education.length > 0;
        const hasCertifications = resume.extractedData?.certifications && resume.extractedData.certifications.length > 0;
        const hasSummary = resume.extractedData?.summary && resume.extractedData.summary.trim();
        
        modalBody.innerHTML = `
            <!-- Basic Information -->
            <div class="modal-section">
                <h3><i class="fas fa-id-card"></i> Candidate Information</h3>
                <div class="modal-info-grid">
                    <div class="modal-info-item">
                        <div class="modal-info-label">👤 Full Name</div>
                        <div class="modal-info-value">${resume.candidateName || 'Not Provided'}</div>
                    </div>
                    <div class="modal-info-item">
                        <div class="modal-info-label">📧 Email</div>
                        <div class="modal-info-value" style="font-size: 0.95rem; word-break: break-all;">${resume.email || 'Not Provided'}</div>
                    </div>
                    <div class="modal-info-item">
                        <div class="modal-info-label">💼 Experience</div>
                        <div class="modal-info-value">${resume.extractedData?.totalExperienceYears || resume.extractedData?.totalYearsExperience || 0} Years</div>
                    </div>
                    <div class="modal-info-item">
                        <div class="modal-info-label">📅 Uploaded</div>
                        <div class="modal-info-value">${new Date(resume.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    </div>
                    <div class="modal-info-item">
                        <div class="modal-info-label">📄 File Type</div>
                        <div class="modal-info-value">${(resume.fileType || 'pdf').toUpperCase()}</div>
                    </div>
                    <div class="modal-info-item">
                        <div class="modal-info-label">🎯 Total Skills</div>
                        <div class="modal-info-value">${resume.extractedData?.skills?.length || 0} Skills</div>
                    </div>
                </div>
            </div>

            <!-- Skills -->
            <div class="modal-section">
                <h3><i class="fas fa-star"></i> Skills & Competencies</h3>
                ${resume.extractedData?.skills && resume.extractedData.skills.length > 0 ? `
                    <div class="skill-list">
                        ${resume.extractedData.skills.map(skill => {
                            const skillName = getSkillName(skill);
                            const proficiency = skill.proficiencyLevel || '';
                            const category = skill.category || 'other';
                            
                            let icon = 'fa-star';
                            if (category === 'technical') icon = 'fa-code';
                            else if (category === 'soft') icon = 'fa-users';
                            else if (category === 'domain') icon = 'fa-briefcase';
                            
                            return `
                                <div class="skill-item ${category}">
                                    <i class="fas ${icon}"></i>
                                    <span>${skillName}</span>
                                    ${proficiency ? `<span class="skill-proficiency ${proficiency}">${proficiency}</span>` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : '<div class="empty-state"><i class="fas fa-info-circle" style="font-size: 2rem; opacity: 0.3; margin-bottom: 0.5rem;"></i><p>No skills information extracted from the resume</p></div>'}
            </div>

            ${hasSummary ? `
                <!-- Summary -->
                <div class="modal-section">
                    <h3><i class="fas fa-align-left"></i> Professional Summary</h3>
                    <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: 12px; line-height: 1.8; border-left: 4px solid var(--primary-color);">
                        <p style="margin: 0; color: var(--text-primary);">${resume.extractedData.summary}</p>
                    </div>
                </div>
            ` : ''}

            ${hasExperience ? `
                <!-- Experience -->
                <div class="modal-section">
                    <h3><i class="fas fa-briefcase"></i> Work Experience</h3>
                    ${resume.extractedData.experience.map(exp => `
                        <div class="experience-item">
                            <div class="item-title">${exp.title || 'Position Not Specified'}</div>
                            <div class="item-subtitle">${exp.company || 'Company Not Specified'}</div>
                            ${exp.startDate || exp.endDate ? `
                                <div class="item-duration">
                                    <i class="fas fa-calendar-alt"></i>
                                    <span>${exp.startDate || 'N/A'} - ${exp.endDate || 'Present'}</span>
                                    ${exp.duration ? `<span style="margin-left: 0.5rem; color: var(--text-secondary);">(${exp.duration})</span>` : ''}
                                </div>
                            ` : ''}
                            ${exp.description ? `<div class="item-description">${exp.description}</div>` : ''}
                            ${exp.responsibilities && exp.responsibilities.length > 0 ? `
                                <ul style="margin-top: 0.75rem; padding-left: 1.5rem; color: var(--text-primary);">
                                    ${exp.responsibilities.map(resp => `<li style="margin-bottom: 0.5rem;">${resp}</li>`).join('')}
                                </ul>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            ${hasEducation ? `
                <!-- Education -->
                <div class="modal-section">
                    <h3><i class="fas fa-graduation-cap"></i> Education</h3>
                    ${resume.extractedData.education.map(edu => `
                        <div class="education-item">
                            <div class="item-title">${edu.degree || 'Degree Not Specified'}</div>
                            <div class="item-subtitle">${edu.institution || 'Institution Not Specified'}</div>
                            ${edu.year || edu.startYear || edu.endYear ? `
                                <div class="item-duration">
                                    <i class="fas fa-calendar-alt"></i>
                                    <span>${edu.startYear || edu.year || 'N/A'} - ${edu.endYear || edu.year || 'N/A'}</span>
                                </div>
                            ` : ''}
                            ${edu.gpa ? `<div style="margin-top: 0.5rem; color: var(--success-color); font-weight: 600;">📊 GPA: ${edu.gpa}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            ${hasCertifications ? `
                <!-- Certifications -->
                <div class="modal-section">
                    <h3><i class="fas fa-certificate"></i> Certifications & Licenses</h3>
                    ${resume.extractedData.certifications.map(cert => `
                        <div class="certification-item">
                            <div class="item-title">🏆 ${cert.name || cert.title || 'Certification'}</div>
                            ${cert.issuer ? `<div class="item-subtitle">Issued by: ${cert.issuer}</div>` : ''}
                            ${cert.date || cert.year ? `
                                <div class="item-duration">
                                    <i class="fas fa-calendar-check"></i>
                                    <span>${cert.date || cert.year}</span>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            <!-- File Information -->
            <div class="modal-section" style="margin-top: 2rem; padding-top: 1.5rem; border-top: 2px dashed var(--border-color);">
                <div style="display: flex; align-items: center; gap: 1rem; color: var(--text-secondary); font-size: 0.9rem;">
                    <i class="fas fa-file-pdf" style="font-size: 1.5rem; color: var(--danger-color);"></i>
                    <div>
                        <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 0.25rem;">Original File</div>
                        <div>${resume.originalFileName || 'Unknown'}</div>
                    </div>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading resume details:', error);
        modalBody.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--danger-color);">
                <i class="fas fa-exclamation-circle" style="font-size: 2rem;"></i>
                <p>Error loading resume details. Please try again.</p>
            </div>
        `;
    }
}

function closeResumeModal() {
    const modal = document.getElementById('resumeModal');
    modal.style.display = 'none';
}

// Delete resume with confirmation
async function deleteResume(resumeId, candidateName) {
    const confirmDelete = confirm(`Are you sure you want to delete the resume for "${candidateName}"?\n\nThis action cannot be undone.`);
    
    if (!confirmDelete) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/resumes/${resumeId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete resume');
        }
        
        showNotification('Resume deleted successfully', 'success');
        loadResumes(); // Reload the list
        
    } catch (error) {
        console.error('Error deleting resume:', error);
        showNotification('Failed to delete resume. Please try again.', 'error');
    }
}

// Delete job with confirmation
async function deleteJob(jobId, jobTitle) {
    const confirmDelete = confirm(`Are you sure you want to delete the job "${jobTitle}"?\n\nThis action cannot be undone.`);
    
    if (!confirmDelete) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete job');
        }
        
        showNotification('Job deleted successfully', 'success');
        loadJobs(); // Reload the list
        
    } catch (error) {
        console.error('Error deleting job:', error);
        showNotification('Failed to delete job. Please try again.', 'error');
    }
}

// Find matches for a specific job using AI
async function findMatchesForJob(jobId) {
    try {
        showNotification('Finding Matches', 'AI is analyzing resumes for this job...', 'info');
        
        const response = await fetch(`${API_BASE_URL}/api/matches/job/${jobId}/bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                minScore: 0,
                forceReprocess: false
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to find matches');
        }
        
        const data = await response.json();
        
        showNotification(
            'Success!', 
            `Found ${data.totalMatches || 0} matches. Check the Matches tab!`, 
            'success'
        );
        
        // Refresh stats and switch to matches tab
        loadStats();
        
        // Optional: Auto-switch to matches tab after 1.5 seconds
        setTimeout(() => {
            showSection('matches');
        }, 1500);
        
    } catch (error) {
        console.error('Error finding matches:', error);
        showNotification('Error', error.message, 'error');
    }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('resumeModal');
    if (e.target === modal) {
        closeResumeModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeResumeModal();
    }
});

// Resume Upload
function setupResumeUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('resumeFile');
    
    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleResumeUpload(files[0]);
        }
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleResumeUpload(e.target.files[0]);
        }
    });
}

async function handleResumeUpload(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (file.size > maxSize) {
        showNotification('File Too Large', 'Please select a file smaller than 10MB', 'error');
        return;
    }
    
    const allowedTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
        showNotification('Invalid File Type', 'Please upload a PDF, TXT, DOC, or DOCX file', 'error');
        return;
    }
    
    showLoading();
    
    try {
        const formData = new FormData();
        formData.append('resume', file);
        
        const response = await fetch(`${API_BASE_URL}/api/resumes/upload`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Upload failed');
        }
        
        const result = await response.json();
        hideLoading();
        
        showNotification('Success!', 'Resume uploaded and parsed successfully', 'success');
        loadResumes();
        loadStats();
        
    } catch (error) {
        hideLoading();
        console.error('Upload error:', error);
        showNotification('Upload Failed', 'An error occurred while uploading the resume', 'error');
    }
}

// Job Management
// ==============
async function loadJobs() {
    const container = document.getElementById('jobs-list');
    container.innerHTML = '<div style="text-align: center; padding: 2rem;"><div class="spinner" style="margin: 0 auto;"></div></div>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/jobs`);
        const data = await response.json();
        
        if (!data.jobs || data.jobs.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <i class="fas fa-briefcase" style="font-size: 3rem; opacity: 0.3; margin-bottom: 1rem;"></i>
                    <h3>No Jobs Posted</h3>
                    <p>Create your first job posting above!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div style="display: grid; gap: 1.5rem;">
                ${data.jobs.map(job => `
                    <div class="card">
                        <div class="card-body">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                                <div>
                                    <h3 style="margin-bottom: 0.5rem; color: var(--text-primary);">${job.title}</h3>
                                    <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">
                                        <i class="fas fa-building"></i> ${job.company}
                                        ${job.location ? `<span style="margin-left: 1rem;"><i class="fas fa-map-marker-alt"></i> ${job.location}</span>` : ''}
                                    </p>
                                    <span class="badge badge-info">${job.experienceLevel}</span>
                                </div>
                                <div style="display: flex; gap: 0.5rem;">
                                    <button class="btn btn-primary" onclick="findMatchesForJob('${job._id}')">
                                        <i class="fas fa-search"></i> Find Matches
                                    </button>
                                    <button class="btn btn-danger" onclick="deleteJob('${job._id}', '${job.title?.replace(/'/g, "\\'")}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                            <p style="color: var(--text-secondary); margin-bottom: 1rem;">${job.description}</p>
                            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                                ${(job.skills || []).map(skill => {
                                    const skillName = getSkillName(skill);
                                    return `<span class="badge badge-success">${skillName}</span>`;
                                }).join('')}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading jobs:', error);
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--danger-color);">
                <i class="fas fa-exclamation-circle" style="font-size: 2rem;"></i>
                <p>Error loading jobs. Please try again.</p>
            </div>
        `;
    }
}

// Create Job
function setupJobForm() {
    const form = document.getElementById('createJobForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const jobData = {
            title: document.getElementById('jobTitle').value,
            company: document.getElementById('jobCompany').value,
            experienceLevel: document.getElementById('jobExperienceLevel').value,
            location: document.getElementById('jobLocation').value,
            description: document.getElementById('jobDescription').value,
            requirements: {
                requiredSkills: document.getElementById('jobSkills').value.split(',').map(s => ({
                    name: s.trim(),
                    importance: 'must-have'
                })),
                minimumExperience: 0
            },
            createdBy: 'system@example.com'
        };
        
        // Add responsibilities if provided
        const reqText = document.getElementById('jobRequirements').value;
        if (reqText) {
            const reqs = reqText.split('\n').filter(r => r.trim());
            jobData.responsibilities = reqs;
        }
        
        showLoading();
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/jobs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jobData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create job');
            }
            
            hideLoading();
            showNotification('Success!', 'Job posting created successfully', 'success');
            form.reset();
            loadJobs();
            loadStats();
            
        } catch (error) {
            hideLoading();
            console.error('Error creating job:', error);
            showNotification('Error', error.message, 'error');
        }
    });
}

// Matches
// =======
let currentMatches = []; // Store matches globally

async function loadMatches() {
    const container = document.getElementById('matches-list');
    container.innerHTML = '<div style="text-align: center; padding: 2rem;"><div class="spinner" style="margin: 0 auto;"></div></div>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/matches`);
        const data = await response.json();
        
        currentMatches = data.matches || []; // Store for later use
        
        if (!currentMatches || currentMatches.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <i class="fas fa-users-cog" style="font-size: 4rem; opacity: 0.3; margin-bottom: 1rem;"></i>
                    <h3>No Matches Yet</h3>
                    <p>Upload resumes and create jobs, then click "Find Matches" to see AI-powered matches!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div style="display: grid; gap: 1.5rem;">
                ${currentMatches.map((match, index) => {
                    const scorePercent = (match.overallScore * 10).toFixed(0);
                    const badgeClass = match.overallScore >= 8 ? 'success' : 
                                      match.overallScore >= 6 ? 'warning' : 
                                      match.overallScore >= 4 ? 'info' : 'secondary';
                    const badgeText = match.overallScore >= 8 ? 'Excellent Match' :
                                     match.overallScore >= 6 ? 'Good Match' :
                                     match.overallScore >= 4 ? 'Average Match' : 'Low Match';
                    
                    return `
                    <div class="card">
                        <div class="card-body">
                            <div style="display: grid; grid-template-columns: 1fr auto auto; gap: 2rem; align-items: center;">
                                <div>
                                    <h3 style="margin-bottom: 0.5rem;">${match.resumeId?.candidateName || 'Unknown'} → ${match.jobId?.title || 'Unknown Job'}</h3>
                                    <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">${match.jobId?.company || ''}</p>
                                    <div style="display: flex; gap: 0.5rem; align-items: center; margin-top: 1rem;">
                                        <span class="badge badge-${badgeClass}">${badgeText}</span>
                                        ${match.isShortlisted ? '<span class="badge badge-success"><i class="fas fa-star"></i> Shortlisted</span>' : ''}
                                    </div>
                                </div>
                                <div style="text-align: center;">
                                    <div style="font-size: 3rem; font-weight: 700; color: var(--primary-color);">
                                        ${scorePercent}%
                                    </div>
                                    <div style="color: var(--text-secondary); font-size: 0.9rem;">Match Score</div>
                                </div>
                                <div>
                                    <button class="btn btn-primary" onclick="viewMatchDetails(${index})" title="View AI Analysis">
                                        <i class="fas fa-info-circle"></i> Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `}).join('')}
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading matches:', error);
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--danger-color);">
                <i class="fas fa-exclamation-circle" style="font-size: 2rem;"></i>
                <p>Error loading matches. Please try again.</p>
            </div>
        `;
    }
}

// View detailed match analysis
function viewMatchDetails(matchIndex) {
    console.log('=== DEBUG: viewMatchDetails called ===');
    console.log('matchIndex:', matchIndex);
    console.log('currentMatches:', currentMatches);
    
    try {
        // Validate currentMatches exists
        if (!currentMatches || !Array.isArray(currentMatches)) {
            throw new Error('currentMatches is not available or not an array');
        }
        
        // Validate index
        if (matchIndex < 0 || matchIndex >= currentMatches.length) {
            throw new Error(`Invalid index ${matchIndex}. Array length: ${currentMatches.length}`);
        }
        
        // Get match from global array
        const match = currentMatches[matchIndex];
        console.log('match object:', match);
        
        // Validate match object
        if (!match || typeof match !== 'object') {
            throw new Error(`Match is null or not an object: ${typeof match}`);
        }
        
        // Get DOM elements
        const modal = document.getElementById('matchDetailsModal');
        const modalBody = document.getElementById('matchDetailsBody');
        
        if (!modal || !modalBody) {
            throw new Error('Modal elements not found in DOM');
        }
        
        // Calculate scores safely
        const overallScore = match.overallScore || 0;
        const scorePercent = Math.round(overallScore * 10);
        
        // Safe property extraction
        let candidateName = 'Unknown Candidate';
        let jobTitle = 'Unknown Job';
        let jobCompany = '';
        
        if (match.resumeId && typeof match.resumeId === 'object') {
            candidateName = match.resumeId.candidateName || candidateName;
        }
        
        if (match.jobId && typeof match.jobId === 'object') {
            jobTitle = match.jobId.title || jobTitle;
            jobCompany = match.jobId.company || '';
        }
        
        // Build modal content safely
        modalBody.innerHTML = 
            '<div style="margin-bottom: 2rem;">' +
                '<h2 style="color: var(--text-primary); margin-bottom: 0.5rem;">' +
                    candidateName + ' → ' + jobTitle +
                '</h2>' +
                '<p style="color: var(--text-secondary);">' + jobCompany + '</p>' +
            '</div>' +
            '<div style="background: linear-gradient(135deg, var(--primary-color), var(--info-color)); padding: 2rem; border-radius: 12px; text-align: center; margin-bottom: 2rem;">' +
                '<div style="font-size: 4rem; font-weight: 700; color: white; margin-bottom: 0.5rem;">' +
                    scorePercent + '%' +
                '</div>' +
                '<div style="font-size: 1.2rem; color: rgba(255,255,255,0.9);">Overall Match Score</div>' +
            '</div>' +
            '<div><h3>Match Details Loaded Successfully!</h3><p>Score: ' + overallScore + '/10</p></div>';
        
        // Show modal
        modal.style.display = 'block';
        console.log('Modal displayed successfully');
        
    } catch (error) {
        console.error('=== ERROR in viewMatchDetails ===');
        console.error('Error:', error);
        console.error('Stack:', error.stack);
        alert('Error: ' + error.message);
    }
}

function closeMatchDetailsModal() {
    const modal = document.getElementById('matchDetailsModal');
    modal.style.display = 'none';
}

// Initialize
// ==========
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Setup navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            showSection(section);
        });
    });
    
    // Setup forms and uploads
    setupResumeUpload();
    setupJobForm();
    
    // Load initial data
    loadStats();
    
    // Show welcome notification
    setTimeout(() => {
        showNotification('Welcome!', 'Smart Resume Screener is ready to use', 'success');
    }, 500);
});
