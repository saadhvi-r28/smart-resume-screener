#!/bin/bash

# GitHub Upload Script for Smart Resume Screener
# This script will initialize git, remove sensitive files, and prepare for upload

echo "🚀 Preparing Smart Resume Screener for GitHub..."

# Navigate to project directory
cd "/Users/saadhviram/Documents/College/Companies/Unthinkable/smart-resume-screener"

# Remove any existing git repository
rm -rf .git

# Initialize new git repository
git init

# Remove sensitive files and large directories that shouldn't be uploaded
echo "🧹 Cleaning up sensitive files..."

# Remove all .env files (keep .env.example)
find . -name ".env" -not -name ".env.example" -delete

# Remove all node_modules directories
find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null

# Remove uploaded files
rm -rf backend/uploads/*
rm -rf frontend/uploads/*

# Remove logs and temporary files
find . -name "*.log" -delete
find . -name ".DS_Store" -delete
find . -name "Thumbs.db" -delete

# Add all files to git
git add .

# Create initial commit
git commit -m "Initial commit: Smart Resume Screener with Mistral AI integration

Features:
- Resume upload and parsing with AI
- Smart job matching and scoring
- Interactive dashboard with real-time stats
- CRUD operations for resumes and jobs
- Dark/Light theme support
- Email parsing with complex format support
- Comprehensive error handling and validation"

echo "✅ Git repository initialized and files committed!"
echo ""
echo "📝 Next steps:"
echo "1. Create a new repository on GitHub"
echo "2. Copy the repository URL (e.g., https://github.com/yourusername/smart-resume-screener.git)"
echo "3. Run these commands:"
echo ""
echo "   git remote add origin YOUR_GITHUB_REPO_URL"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "🔐 Remember to:"
echo "- Add your Mistral AI API key to .env file after cloning"
echo "- Install dependencies: npm install"
echo "- Set up MongoDB"
echo "- Follow setup instructions in README.md"