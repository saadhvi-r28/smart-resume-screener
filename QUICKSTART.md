# Quick Start Guide - Smart Resume Screener

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js installed (v14 or higher)
- ✅ MongoDB installed and running
- ✅ Mistral AI API key

## Step-by-Step Setup

### 1. Install MongoDB (if not already installed)

```bash
# Add MongoDB tap
brew tap mongodb/brew

# Install MongoDB Community Edition
brew install mongodb-community@8.0

# Start MongoDB service
brew services start mongodb-community@8.0

# Verify MongoDB is running
pgrep -x "mongod"
```

### 2. Configure Environment Variables

```bash
# Navigate to backend directory
cd backend

# Create .env file from example
cp .env.example .env

# Edit .env file and add your Mistral API key
nano .env  # or use your preferred editor
```

**Required environment variables:**
```env
MISTRAL_API_KEY=your_actual_mistral_api_key_here
MISTRAL_MODEL=mistral-tiny-experimental
MISTRAL_API_URL=https://experimental.api.mistral.ai/v1/chat/completions
MONGODB_URI=mongodb://localhost:27017/smart-resume-screener
JWT_SECRET=your_random_secret_string_here
```

### 3. Install Dependencies

```bash
# In the backend directory
npm install
```

### 4. Start the Backend Server

```bash
# In the backend directory
npm start
```

You should see:
```
Smart Resume Screener API running on port 3000
Environment: development
Connected to MongoDB
```

### 5. Test the API

Open a new terminal and run:

```bash
# In the backend directory
node test-api.js
```

This will run automated tests on all API endpoints.

## Manual Testing with curl

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Upload Resume
```bash
curl -X POST http://localhost:3000/api/resumes/parse \
  -H "Content-Type: application/json" \
  -d '{
    "textContent": "John Doe\nSoftware Engineer\nSkills: JavaScript, Node.js, React, MongoDB"
  }'
```

### Create Job Description
```bash
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Full Stack Developer",
    "company": "Tech Corp",
    "skills": ["JavaScript", "Node.js", "React"],
    "requirements": ["3+ years experience", "Strong JS skills"]
  }'
```

### Get All Resumes
```bash
curl http://localhost:3000/api/resumes
```

### Get All Jobs
```bash
curl http://localhost:3000/api/jobs
```

## Troubleshooting

### MongoDB Connection Error

If you see `MongooseServerSelectionError`:

```bash
# Check if MongoDB is running
pgrep -x "mongod"

# If not running, start it
brew services start mongodb-community@8.0

# Check status
brew services list | grep mongodb
```

### Mistral API Error

If you get API errors:

1. Verify your API key in `.env` is correct
2. Check you have credits in your Mistral account
3. Ensure the API URL is correct for experimental endpoint
4. Check network connectivity

### Port Already in Use

If port 3000 is already in use:

```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or change PORT in .env file
```

## Project Structure

```
smart-resume-screener/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   │   └── LLMService.js (Mistral AI integration)
│   │   ├── middleware/
│   │   └── app.js
│   ├── tests/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── test-api.js (API testing script)
├── frontend/
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| POST | /api/resumes/parse | Upload and parse resume |
| GET | /api/resumes | List all resumes |
| GET | /api/resumes/:id | Get resume by ID |
| POST | /api/jobs | Create job description |
| GET | /api/jobs | List all jobs |
| GET | /api/jobs/:id | Get job by ID |
| POST | /api/match | Match resume with job |
| GET | /api/matches | Get all matches |

## Cost Optimization

The project is configured for minimal Mistral API costs:

- Uses `mistral-tiny-experimental` model (cheapest option)
- Lower `max_tokens` (512 instead of 1500)
- Lower `temperature` (0.1 for more deterministic, faster responses)
- Experimental API endpoint for reduced pricing

## Next Steps

1. ✅ Backend API is running
2. ✅ MongoDB is connected
3. ✅ Tests are passing
4. 🔄 Add your own resumes and job descriptions
5. 🔄 Integrate with frontend (if available)
6. 🔄 Deploy to production

## Getting Mistral API Key

1. Go to https://console.mistral.ai/
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env` file

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review server logs for error messages
3. Verify all environment variables are set correctly
4. Ensure MongoDB is running
5. Check Mistral API status and credits

---

**Happy Resume Screening! 🚀**
