# 🔑 HOW TO GET & ADD YOUR MISTRAL API KEY

## Step 1: Get Your Mistral API Key

1. **Go to Mistral AI Console:**
   👉 https://console.mistral.ai/

2. **Sign Up / Log In:**
   - Create a free account if you don't have one
   - Or log in with your existing account

3. **Navigate to API Keys:**
   - Look for "API Keys" in the sidebar
   - Click "Create new key" or "Generate API key"

4. **Copy Your Key:**
   - The key will look like: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Copy it immediately (you won't see it again!)

## Step 2: Add the Key to Your Project

### Option A: Using nano (Terminal Editor)

```bash
# Open the .env file
nano /Users/saadhviram/Documents/College/Companies/Unthinkable/smart-resume-screener/backend/.env

# Find this line:
MISTRAL_API_KEY=your_mistral_api_key_here

# Replace with your actual key:
MISTRAL_API_KEY=your_actual_key_here

# Save and exit:
# Press: Ctrl + X
# Then: Y
# Then: Enter
```

### Option B: Using VS Code

```bash
# Open in VS Code
code /Users/saadhviram/Documents/College/Companies/Unthinkable/smart-resume-screener/backend/.env

# Find line 12:
MISTRAL_API_KEY=your_mistral_api_key_here

# Replace with your actual key
# Save the file (Cmd + S)
```

### Option C: Using sed (One-line Command)

```bash
# Replace YOUR_KEY_HERE with your actual Mistral API key
cd /Users/saadhviram/Documents/College/Companies/Unthinkable/smart-resume-screener/backend
sed -i '' 's/your_mistral_api_key_here/YOUR_KEY_HERE/g' .env
```

## Step 3: Verify the Key is Set

```bash
# Check if the key is configured (won't show the actual key)
cd /Users/saadhviram/Documents/College/Companies/Unthinkable/smart-resume-screener/backend
grep "MISTRAL_API_KEY" .env | grep -v "your_mistral_api_key_here" && echo "✅ API Key is set!" || echo "❌ API Key not set"
```

## Step 4: Start Your Server

```bash
cd /Users/saadhviram/Documents/College/Companies/Unthinkable/smart-resume-screener
./start-server.sh
```

## 💡 Important Notes

- **Never share your API key** - it's like a password!
- **Never commit `.env` to git** - it's already in `.gitignore`
- **Free tier limits**: Mistral offers free credits to start
- **Experimental endpoint**: We're using the cheapest option for you

## 🆘 Troubleshooting

### "I don't see API Keys section in Mistral Console"
- Make sure you're logged in
- Look for "API Keys", "Settings", or "Workspace" menu
- Try refreshing the page

### "My key doesn't work"
- Make sure you copied the entire key
- Check for extra spaces before/after the key
- Verify the key is active in Mistral console

### "I get rate limit errors"
- Check your Mistral account credits
- Make sure you're on the right billing plan
- Wait a few minutes and try again

## ✅ Once Your Key is Added

Your complete `.env` file should look like this:

```env
# Environment Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/smart-resume-screener
DB_NAME=smart_resume_screener

# Mistral AI Configuration (Experimental, Cost-Saving)
MISTRAL_API_KEY=abc123youractualkey456def789
MISTRAL_MODEL=mistral-tiny-experimental
MISTRAL_API_URL=https://experimental.api.mistral.ai/v1/chat/completions

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,txt,doc,docx

# Security
JWT_SECRET=your_jwt_secret_here
...
```

## 🚀 After Adding the Key

Run these commands in order:

```bash
# 1. Start the server
./start-server.sh

# 2. In a NEW terminal, test the API
cd backend && node test-api.js
```

---

**Need help? Check the error messages - they're designed to guide you!**
