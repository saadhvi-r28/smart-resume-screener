# 🚀 Quick Setup Guide

## For New Users Cloning from GitHub

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/smart-resume-screener.git
cd smart-resume-screener
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies (if any)
cd frontend
npm install
cd ..
```

### 3. Environment Setup
```bash
# Copy environment template
cp backend/.env.example backend/.env

# Edit the .env file and add your Mistral AI API key
nano backend/.env
# or
code backend/.env
```

### 4. Database Setup
Make sure MongoDB is running on your system:
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Ubuntu/Debian
sudo systemctl start mongod

# On Windows
net start MongoDB
```

### 5. Start the Application
```bash
# Start both backend and frontend
./start.sh

# Or start manually:
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend
cd frontend && python3 -m http.server 8080
```

### 6. Access the Application
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/docs (if available)

## 🔑 Getting Mistral AI API Key

1. Visit [Mistral AI Console](https://console.mistral.ai/)
2. Sign up for an account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env` file:
   ```
   MISTRAL_API_KEY=your_api_key_here
   ```

## 🧪 Testing the Setup

1. Upload a resume PDF
2. Create a job posting
3. Find matches between resumes and jobs
4. View detailed match analysis

## 🎯 Key Features to Test

- ✅ Resume upload and parsing
- ✅ Job creation and management
- ✅ AI-powered matching
- ✅ Dashboard statistics
- ✅ Theme switching
- ✅ Delete functionality
- ✅ Match details modal

## 🛠️ Troubleshooting

### Common Issues:

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`

2. **Mistral AI API Errors**
   - Verify API key is correct
   - Check API quota/credits

3. **File Upload Issues**
   - Ensure `uploads/` directory exists
   - Check file permissions

4. **Port Conflicts**
   - Change ports in `.env` if needed
   - Kill processes using ports 3000 or 8080

## 📞 Support

If you encounter issues:
1. Check the console for error messages
2. Verify all dependencies are installed
3. Ensure MongoDB is running
4. Check API key configuration