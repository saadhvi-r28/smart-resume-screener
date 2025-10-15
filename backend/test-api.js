/**
 * Test Script for Smart Resume Screener API
 * This script tests all major endpoints to verify the system is working
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

async function testHealthCheck() {
  try {
    logInfo('Testing health check endpoint...');
    const response = await axios.get(`${BASE_URL}/health`);
    
    if (response.status === 200) {
      logSuccess('Health check passed');
      console.log('  Response:', response.data);
      return true;
    }
  } catch (error) {
    logError(`Health check failed: ${error.message}`);
    if (error.response) {
      console.log('  Status:', error.response.status);
      console.log('  Data:', error.response.data);
    }
    return false;
  }
}

async function testResumeUpload() {
  try {
    logInfo('Testing resume upload endpoint...');
    
    // Create a sample resume text
    const sampleResumeText = `
John Doe
Senior Software Engineer
Email: john.doe@example.com
Phone: +1234567890

SKILLS:
- JavaScript, Node.js, React, MongoDB
- Python, Machine Learning
- AWS, Docker, Kubernetes

EXPERIENCE:
Tech Corp | Senior Developer | 2020-2023
- Developed full-stack applications using Node.js and React
- Led team of 5 developers
- Implemented microservices architecture

EDUCATION:
University of Technology
Bachelor of Computer Science | 2019
`;

    const response = await axios.post(`${BASE_URL}/api/resumes/upload`, {
      textContent: sampleResumeText
    });

    if (response.status === 201 || response.status === 200) {
      logSuccess('Resume upload/parse test passed');
      console.log('  Response:', JSON.stringify(response.data, null, 2));
      return response.data.resume || response.data;
    }
  } catch (error) {
    logError(`Resume upload failed: ${error.message}`);
    if (error.response) {
      console.log('  Status:', error.response.status);
      console.log('  Data:', error.response.data);
    }
    return null;
  }
}

async function testJobDescriptionCreation() {
  try {
    logInfo('Testing job description creation...');
    
    const jobData = {
      title: 'Full Stack Developer',
      company: 'Innovative Tech Solutions',
      description: 'We are looking for a talented Full Stack Developer to join our team.',
      requirements: [
        'Strong proficiency in JavaScript/Node.js',
        'Experience with React and modern frontend frameworks',
        'Knowledge of MongoDB and database design',
        'Understanding of REST APIs',
        'Experience with cloud platforms (AWS/Azure)',
        'Excellent problem-solving skills'
      ],
      skills: ['JavaScript', 'Node.js', 'React', 'MongoDB', 'AWS', 'Docker'],
      location: 'Remote',
      type: 'Full-time',
      experienceLevel: 'mid'  // Required field: entry, mid, senior, executive
    };

    const response = await axios.post(`${BASE_URL}/api/jobs`, jobData);

    if (response.status === 201 || response.status === 200) {
      logSuccess('Job description creation test passed');
      console.log('  Job ID:', response.data._id || response.data.id);
      return response.data;
    }
  } catch (error) {
    logError(`Job description creation failed: ${error.message}`);
    if (error.response) {
      console.log('  Status:', error.response.status);
      console.log('  Data:', error.response.data);
    }
    return null;
  }
}

async function testResumeJobMatching(resumeId, jobId) {
  try {
    logInfo('Testing resume-job matching...');
    
    if (!resumeId || !jobId) {
      logWarning('Skipping matching test - missing resume or job ID');
      return null;
    }

    const response = await axios.post(`${BASE_URL}/api/matches`, {
      resumeId: resumeId,
      jobId: jobId
    });

    if (response.status === 200 || response.status === 201) {
      logSuccess('Resume-job matching test passed');
      console.log('  Match Score:', response.data.matchScore || 'N/A');
      console.log('  Analysis:', JSON.stringify(response.data, null, 2));
      return response.data;
    }
  } catch (error) {
    logError(`Resume-job matching failed: ${error.message}`);
    if (error.response) {
      console.log('  Status:', error.response.status);
      console.log('  Data:', error.response.data);
    }
    return null;
  }
}

async function testListResumes() {
  try {
    logInfo('Testing list resumes endpoint...');
    
    const response = await axios.get(`${BASE_URL}/api/resumes`);

    if (response.status === 200) {
      logSuccess('List resumes test passed');
      console.log(`  Found ${response.data.length || 0} resume(s)`);
      return response.data;
    }
  } catch (error) {
    logError(`List resumes failed: ${error.message}`);
    if (error.response) {
      console.log('  Status:', error.response.status);
      console.log('  Data:', error.response.data);
    }
    return null;
  }
}

async function testListJobs() {
  try {
    logInfo('Testing list jobs endpoint...');
    
    const response = await axios.get(`${BASE_URL}/api/jobs`);

    if (response.status === 200) {
      logSuccess('List jobs test passed');
      console.log(`  Found ${response.data.length || 0} job(s)`);
      return response.data;
    }
  } catch (error) {
    logError(`List jobs failed: ${error.message}`);
    if (error.response) {
      console.log('  Status:', error.response.status);
      console.log('  Data:', error.response.data);
    }
    return null;
  }
}

async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  log('Smart Resume Screener API Test Suite', 'blue');
  console.log('='.repeat(60) + '\n');

  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Health Check
  totalTests++;
  if (await testHealthCheck()) passedTests++;
  console.log('');

  // Test 2: Resume Upload
  totalTests++;
  const resume = await testResumeUpload();
  if (resume) passedTests++;
  console.log('');

  // Test 3: Job Description Creation
  totalTests++;
  const job = await testJobDescriptionCreation();
  if (job) passedTests++;
  console.log('');

  // Test 4: Resume-Job Matching
  totalTests++;
  if (resume && job) {
    const resumeId = resume._id || resume.id;
    const jobId = job._id || job.id;
    if (await testResumeJobMatching(resumeId, jobId)) passedTests++;
  } else {
    logWarning('Skipping matching test - prerequisites failed');
  }
  console.log('');

  // Test 5: List Resumes
  totalTests++;
  if (await testListResumes()) passedTests++;
  console.log('');

  // Test 6: List Jobs
  totalTests++;
  if (await testListJobs()) passedTests++;
  console.log('');

  // Summary
  console.log('='.repeat(60));
  log(`Test Results: ${passedTests}/${totalTests} tests passed`, 
    passedTests === totalTests ? 'green' : 'yellow');
  console.log('='.repeat(60) + '\n');

  if (passedTests === totalTests) {
    logSuccess('All tests passed! Your API is working correctly.');
  } else {
    logWarning(`${totalTests - passedTests} test(s) failed. Please check the errors above.`);
  }

  process.exit(passedTests === totalTests ? 0 : 1);
}

// Check if server is running
async function checkServerRunning() {
  try {
    await axios.get(`${BASE_URL}/health`, { timeout: 2000 });
    return true;
  } catch (error) {
    logError('Server is not running or not responding!');
    logInfo('Please start the server first with: npm start');
    logInfo('Then run this test script again.');
    return false;
  }
}

// Main execution
(async () => {
  const serverRunning = await checkServerRunning();
  if (serverRunning) {
    await runAllTests();
  } else {
    process.exit(1);
  }
})();
