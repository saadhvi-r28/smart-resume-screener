# 🚀 Vercel Deployment Guide

## Prerequisites

1. **GitHub Repository**: Your code should be pushed to GitHub
2. **MongoDB Atlas**: Cloud database (free tier available)
3. **Mistral AI Account**: API key for AI features
4. **Vercel Account**: Free deployment platform

## Quick Deployment Steps

### 1. Prepare MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/smart_resume_screener`
4. Whitelist all IPs (0.0.0.0/0) for Vercel access

### 2. Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard
1. Go to [Vercel](https://vercel.com)
2. Click "Import Project"
3. Connect your GitHub account
4. Select `smart-resume-screener` repository
5. Configure environment variables (see below)
6. Click "Deploy"

#### Option B: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
cd /path/to/smart-resume-screener
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name: smart-resume-screener
# - Directory: ./
# - Override settings? No
```

### 3. Configure Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables, add:

```bash
# Required Variables
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart_resume_screener
MISTRAL_API_KEY=your_mistral_api_key_here
MISTRAL_API_URL=https://api.mistral.ai/v1/chat/completions
MISTRAL_MODEL=mistral-tiny
NODE_ENV=production

# Optional Variables
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,txt,doc,docx
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here
```

### 4. Test Deployment

1. Visit your Vercel URL (e.g., `https://smart-resume-screener.vercel.app`)
2. Test API health: `https://your-app.vercel.app/api/health`
3. Upload a resume and test functionality

## 🔧 Configuration Details

### File Structure for Vercel
```
smart-resume-screener/
├── api/
│   └── index.js          # Serverless function entry point
├── frontend/             # Static files served by Vercel
├── backend/              # Backend code (used by api/index.js)
├── vercel.json          # Vercel configuration
└── package.json         # Dependencies
```

### API Endpoints on Vercel
- Frontend: `https://your-app.vercel.app/`
- API Health: `https://your-app.vercel.app/api/health`
- Resumes: `https://your-app.vercel.app/api/resumes`
- Jobs: `https://your-app.vercel.app/api/jobs`
- Matches: `https://your-app.vercel.app/api/matches`

## 🛠️ Troubleshooting

### Common Issues:

1. **API Routes Not Working**
   - Check `vercel.json` configuration
   - Verify `api/index.js` exports correctly
   - Check environment variables

2. **Database Connection Errors**
   - Verify MongoDB Atlas connection string
   - Check IP whitelist (allow 0.0.0.0/0)
   - Test connection string locally first

3. **File Upload Issues**
   - Vercel has 4.5MB limit for serverless functions
   - Consider using Vercel Blob for larger files
   - Current config uses memory storage

4. **Build Failures**
   - Check Node.js version (≥18 required)
   - Verify all dependencies in package.json
   - Check for missing environment variables

### Performance Optimization:

1. **Cold Starts**: First request may be slower
2. **Function Timeout**: Configured for 30 seconds max
3. **Memory Usage**: Monitor in Vercel dashboard
4. **File Size**: Keep uploads under 4.5MB

## 📊 Monitoring

1. **Vercel Dashboard**: Monitor function executions
2. **MongoDB Atlas**: Monitor database usage
3. **Mistral AI Console**: Monitor API usage and costs

## 🔒 Security

1. **Environment Variables**: Never commit sensitive data
2. **CORS Configuration**: Properly configured for your domain
3. **Input Validation**: Joi validation remains active
4. **File Upload**: Limited file types and sizes

## 🚀 Custom Domain (Optional)

1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain
3. Configure DNS settings as instructed
4. SSL certificate will be automatically provisioned

Your Smart Resume Screener will be live and scalable on Vercel! 🎉