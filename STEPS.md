# 📋 COMPLETE STEP-BY-STEP GUIDE

## ✅ What's Already Done

- ✅ MongoDB installed and running
- ✅ Backend configured with Mistral AI
- ✅ Server successfully running on http://localhost:3000
- ✅ API endpoints tested and working
- ✅ Database connected

---

## 🚀 STEPS TO USE YOUR PROJECT

### STEP 1: Keep Backend Server Running

**Current Status:** ✅ Server is running!

Keep the terminal window open where you ran `./start-server.sh`

If you need to restart it:
```bash
cd /Users/saadhviram/Documents/College/Companies/Unthinkable/smart-resume-screener
./start-server.sh
```

---

### STEP 2: Open Frontend Dashboard

**Option A: Simple (Open HTML directly)**
```bash
open /Users/saadhviram/Documents/College/Companies/Unthinkable/smart-resume-screener/frontend/index.html
```

**Option B: Better (Serve with HTTP server)**
```bash
# Open a NEW terminal window
cd /Users/saadhviram/Documents/College/Companies/Unthinkable/smart-resume-screener/frontend

# Start a simple HTTP server
python3 -m http.server 8080

# Then open in browser: http://localhost:8080
```

---

### STEP 3: Use the Application

Once the frontend is open:

1. **Upload Resumes**
   - Click "Upload Resume" button
   - Select PDF/TXT/DOC file
   - AI will automatically parse and extract skills

2. **Create Job Descriptions**
   - Click "Add Job" button
   - Fill in job details
   - Specify required skills

3. **View Matches**
   - Click on any resume
   - See AI-generated match scores
   - Get hiring recommendations

---

## 🧪 STEP-BY-STEP API TESTING (Alternative)

### Test 1: Check Server Health
```bash
curl http://localhost:3000/health
```
**Expected Output:**
```json
{"status":"OK","timestamp":"...","environment":"development"}
```

---

### Test 2: List Resumes
```bash
curl http://localhost:3000/api/resumes
```
**Expected Output:**
```json
{"resumes":[],"pagination":{...}}
```

---

### Test 3: List Jobs
```bash
curl http://localhost:3000/api/jobs
```
**Expected Output:**
```json
{"jobs":[],"pagination":{...}}
```

---

### Test 4: Upload a Resume (Create Test File First)

**Step 4a: Create a test resume file**
```bash
cat > /tmp/test-resume.txt << 'EOF'
John Doe
Senior Software Engineer
Email: john.doe@example.com
Phone: +1234567890

SKILLS:
JavaScript, Node.js, React, MongoDB, Python, AWS, Docker

EXPERIENCE:
Tech Corp | Senior Developer | 2020-2023
- Developed full-stack applications
- Led team of 5 developers
- Implemented microservices architecture

EDUCATION:
University of Technology
Bachelor of Computer Science | 2019
EOF
```

**Step 4b: Upload the resume**
```bash
curl -X POST http://localhost:3000/api/resumes/upload \
  -F "resume=@/tmp/test-resume.txt"
```

---

### Test 5: Create a Job

```bash
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Full Stack Developer",
    "company": "Tech Corp",
    "description": "Looking for an experienced Full Stack Developer",
    "experienceLevel": "mid",
    "requirements": {
      "requiredSkills": [
        {"name": "JavaScript", "importance": "must-have"},
        {"name": "Node.js", "importance": "must-have"},
        {"name": "React", "importance": "must-have"}
      ],
      "preferredSkills": [
        {"name": "Docker", "importance": "nice-to-have"}
      ],
      "minimumExperience": 2
    },
    "location": "Remote",
    "salaryRange": {
      "min": 80000,
      "max": 120000,
      "currency": "USD"
    },
    "createdBy": "recruiter@company.com"
  }'
```

---

### Test 6: Get AI Match (After uploading resume and creating job)

```bash
# First, get the resume ID and job ID from previous responses
# Then create a match:

curl -X POST http://localhost:3000/api/matches \
  -H "Content-Type: application/json" \
  -d '{
    "resumeId": "RESUME_ID_HERE",
    "jobId": "JOB_ID_HERE"
  }'
```

---

## 📱 USING POSTMAN/INSOMNIA (Recommended)

### Step 1: Download Postman
- Go to: https://www.postman.com/downloads/
- Install and open

### Step 2: Import Collection

Create these requests:

1. **Health Check**
   - Method: GET
   - URL: http://localhost:3000/health

2. **Upload Resume**
   - Method: POST
   - URL: http://localhost:3000/api/resumes/upload
   - Body: form-data
   - Key: `resume` (type: File)
   - Value: Select your resume file

3. **Create Job**
   - Method: POST
   - URL: http://localhost:3000/api/jobs
   - Body: raw JSON
   - Content-Type: application/json
   - Paste the JSON from Test 5 above

4. **Get Matches**
   - Method: POST
   - URL: http://localhost:3000/api/matches
   - Body: raw JSON
   - Paste: `{"resumeId": "...", "jobId": "..."}`

---

## 🎯 QUICK START WORKFLOW

### Complete Workflow in 5 Minutes:

```bash
# Terminal 1: Start Backend (already running!)
cd /Users/saadhviram/Documents/College/Companies/Unthinkable/smart-resume-screener
./start-server.sh

# Terminal 2: Start Frontend
cd /Users/saadhviram/Documents/College/Companies/Unthinkable/smart-resume-screener/frontend
python3 -m http.server 8080

# Terminal 3: Quick API Tests
curl http://localhost:3000/health
curl http://localhost:3000/api/resumes
curl http://localhost:3000/api/jobs
```

Then:
1. Open browser: http://localhost:8080
2. Upload a resume
3. Create a job
4. View AI-powered matches!

---

## 🔧 TROUBLESHOOTING STEPS

### Server Not Responding?
```bash
# Check if server is running
curl http://localhost:3000/health

# If not, restart:
./start-server.sh
```

### MongoDB Not Connected?
```bash
# Check MongoDB status
brew services list | grep mongodb

# If stopped, start it:
brew services start mongodb-community@8.0

# Then restart server:
./start-server.sh
```

### Port Already in Use?
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Restart server
./start-server.sh
```

### Frontend Not Loading?
```bash
# Try the simple HTTP server:
cd frontend
python3 -m http.server 8080

# Open: http://localhost:8080
```

---

## 📊 VERIFICATION CHECKLIST

Run these commands to verify everything:

```bash
# ✅ Check MongoDB
pgrep -x "mongod" && echo "✅ MongoDB running" || echo "❌ MongoDB not running"

# ✅ Check Backend
curl -s http://localhost:3000/health > /dev/null && echo "✅ Backend running" || echo "❌ Backend not running"

# ✅ Check API Endpoints
curl -s http://localhost:3000/api/resumes > /dev/null && echo "✅ Resumes API working" || echo "❌ Resumes API not working"

curl -s http://localhost:3000/api/jobs > /dev/null && echo "✅ Jobs API working" || echo "❌ Jobs API not working"
```

---

## 🎊 SUCCESS CRITERIA

You'll know everything is working when:

✅ Server shows: `Smart Resume Screener API running on port 3000`  
✅ Server shows: `MongoDB connected successfully`  
✅ `curl http://localhost:3000/health` returns `{"status":"OK"}`  
✅ Frontend loads in browser  
✅ You can upload resumes  
✅ You can create jobs  
✅ You see AI-generated match scores  

---

## 📞 NEXT ACTIONS

1. **For Testing:** Follow "Test 1" through "Test 6" above
2. **For UI Use:** Follow "STEP 2" to open frontend
3. **For API Development:** Use Postman as described
4. **For Production:** Review security settings in `.env`

---

**Your server is running at:** http://localhost:3000  
**Your frontend (when started):** http://localhost:8080  
**Status:** ✅ Ready to use!

🚀 **Start with STEP 2 to open the frontend!**
