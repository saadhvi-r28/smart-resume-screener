# 🎯 Smart Resume Screener - Complete Usage Guide

## ✅ Prerequisites (Already Done!)
- ✅ Backend running on http://localhost:3000
- ✅ Frontend running on http://localhost:8080
- ✅ MongoDB running
- ✅ Mistral AI API configured

---

## 📋 Step-by-Step Workflow

### **Step 1: Upload Resumes** 📄

1. Go to http://localhost:8080
2. Click on **"Resumes"** tab
3. Click **"Upload New Resume"** section
4. **Drag & drop** your resume PDF or **click to browse**
5. Wait for parsing to complete
6. You'll see the resume in the list with:
   - Candidate name
   - Email (e.g., saadhvi.r04@gmail.com)
   - Skills (JavaScript, Python, Java, etc.)
   - Experience (0 years for students)
   - Upload date
   - Actions (👁️ View, 🗑️ Delete)

**What Happens:**
- Resume is parsed by AI
- Skills are extracted (350+ skill database)
- Email, phone, name extracted
- Experience calculated from work history section only

---

### **Step 2: Create Job Postings** 💼

1. Click on **"Jobs"** tab
2. Fill out the job creation form:
   
   **Required Fields:**
   - **Job Title**: e.g., "Full Stack Developer"
   - **Company Name**: e.g., "Tech Corp"
   - **Experience Level**: Choose from:
     - `entry` - Entry level
     - `mid` - Mid level
     - `senior` - Senior level
     - `executive` - Executive level
   - **Location**: e.g., "Remote" or "New York, NY"
   - **Job Description**: **Minimum 50 characters!**
     - Example: "We are looking for a talented full-stack developer to join our team and build innovative web applications."
   - **Required Skills**: Comma-separated
     - Example: "JavaScript, React, Node.js, MongoDB"
   
   **Optional Fields:**
   - **Requirements** (one per line):
     ```
     - 5+ years of experience
     - Strong problem-solving skills
     - Bachelor's degree in CS
     ```

3. Click **"+ Create Job Posting"**
4. Job appears in the list with:
   - Title, Company, Location
   - Experience level badge
   - Required skills as badges
   - **"Find Matches"** button
   - **Delete** button (🗑️)

---

### **Step 3: Find AI-Powered Matches** 🤖

1. Go to **Jobs** tab
2. Click **"🔍 Find Matches"** on any job
3. **AI Analysis Happens:**
   - Mistral AI compares each resume with the job
   - Analyzes skills match (40% weight)
   - Analyzes experience match (35% weight)
   - Analyzes education match (15% weight)
   - Analyzes cultural fit (10% weight)
   - Generates overall score (1-10 scale)
   - Creates match record in database

4. Wait for success notification
5. Go to **"Matches"** tab to see results

---

### **Step 4: View Match Results** 📊

1. Click on **"Matches"** tab
2. See all candidate-job matches with:
   - **Candidate Name → Job Title**
   - **Company name**
   - **Match Score** (0-100%)
   - **Badge:**
     - 🟢 "Excellent Match" (80%+)
     - 🟡 "Good Match" (60-79%)
     - 🔵 "Average Match" (40-59%)
     - ⚪ "Low Match" (<40%)

3. Review matches to shortlist candidates

---

## 🎨 **Dashboard Overview**

Click **"Dashboard"** to see:
- 📄 Total Resumes uploaded
- 💼 Total Jobs posted
- 🤝 Total Matches created
- Recent activity

---

## 🔧 **Features Available**

### **Resume Management:**
- ✅ Upload PDF/TXT resumes
- ✅ AI parsing (skills, email, phone, name, experience)
- ✅ View detailed resume modal (👁️ button)
- ✅ Delete resumes (🗑️ button)
- ✅ Smart experience calculation (only from work history)
- ✅ Email extraction (handles formats like saadhvi.r04@gmail.com)

### **Job Management:**
- ✅ Create job postings with validation
- ✅ 50-character minimum description
- ✅ Experience level categorization
- ✅ Skills requirement matching
- ✅ Delete jobs (🗑️ button)

### **AI Matching (Powered by Mistral AI):**
- ✅ Skills matching (40% weight)
- ✅ Experience matching (35% weight)
- ✅ Education matching (15% weight)
- ✅ Cultural fit analysis (10% weight)
- ✅ 1-10 scoring scale
- ✅ Auto-shortlist recommendations

### **UI/UX:**
- ✅ Light & Dark themes (💡 button)
- ✅ Modern, responsive design
- ✅ Beautiful animations
- ✅ Color-coded skill badges
- ✅ Success/Error notifications

---

## 🧪 **Quick Test Workflow**

### **Test 1: Upload Your Resume**
```bash
# Your resume: 22BAI1335_SaadhviR_VIT.pdf
# Expected results:
- Name: Extracted from resume top
- Email: saadhvi.r04@gmail.com
- Skills: JavaScript, Python, Java, React, Node.js, etc.
- Experience: 0 years (student)
```

### **Test 2: Create a Job**
```
Title: Junior Full Stack Developer
Company: Startup Inc
Experience Level: entry
Location: Remote
Description: We are seeking a passionate junior developer to join our team and work on exciting web applications using modern technologies.
Skills: JavaScript, React, Node.js
```

### **Test 3: Run Matching**
```
1. Click "Find Matches" on the job
2. Wait for AI analysis (uses Mistral AI)
3. Go to Matches tab
4. See your match score with AI reasoning
```

---

## 🚨 **Troubleshooting**

### **"Error loading resumes"**
- Hard refresh: `Cmd + Shift + R`
- Check backend: `curl http://localhost:3000/api/resumes`

### **"Error creating job"**
- Ensure description is 50+ characters
- Check all required fields are filled

### **"No matches showing"**
- Make sure you clicked "Find Matches" on a job
- Check Matches tab after matching completes
- Hard refresh the page

### **Delete button not showing**
- Hard refresh browser: `Cmd + Shift + R`
- Clear browser cache

---

## 🎯 **Cost Optimization (Mistral AI)**

Your setup is optimized for minimal costs:
- ✅ Using `mistral-tiny-experimental` model (cheapest)
- ✅ Experimental endpoint (10-100x cheaper)
- ✅ Limited to 512 tokens per request (67% reduction)
- ✅ Temperature set to 0.1 (focused responses)

**Estimated cost per match:** ~$0.0001-0.001

---

## 📱 **Access Points**

- **Frontend:** http://localhost:8080
- **Backend API:** http://localhost:3000
- **Health Check:** http://localhost:3000/health
- **MongoDB:** localhost:27017

---

## 🔑 **Key Files**

- **Resume Parser:** `backend/src/services/ResumeParserService.js`
- **AI Matching:** `backend/src/services/LLMService.js`
- **Frontend Logic:** `frontend/app-modern.js`
- **Styling:** `frontend/styles-modern.css`

---

## 💡 **Pro Tips**

1. **Better Matching**: Upload multiple resumes and create multiple jobs to see AI comparison
2. **Theme Toggle**: Click 💡 icon to switch between light/dark mode
3. **View Details**: Click 👁️ on any resume to see full parsed data with beautiful popup
4. **Bulk Matching**: Click "Find Matches" on each job to match all resumes
5. **Filter Results**: Matches are sorted by score (highest first)

---

## 🎉 **You're All Set!**

Your Smart Resume Screener is fully functional and ready to use! Start by uploading resumes and creating job postings to see the AI matching in action! 🚀
