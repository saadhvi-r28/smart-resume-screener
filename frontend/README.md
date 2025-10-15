# Smart Resume Screener - Modern Frontend

## 🎨 Enhanced Features

### Theme System
- **Light & Dark Mode** - Toggle between themes with one click
- **Persistent Preferences** - Your theme choice is saved in localStorage
- **Smooth Transitions** - Elegant animations when switching themes
- **CSS Variables** - Dynamic theming using custom properties

### Interactive UI
- **Animated Dashboard** - Stats counters with smooth animations
- **Drag & Drop Upload** - Simply drag files to upload area
- **Toast Notifications** - Real-time feedback for all actions
- **Loading Overlays** - Visual feedback during API calls
- **Responsive Design** - Works perfectly on all screen sizes

### Smart Features
- **Real-time Updates** - Automatic data refresh
- **Form Validation** - Client-side validation before submission
- **File Type Checking** - Only allows valid resume formats
- **Size Limits** - Prevents large file uploads (max 10MB)
- **Error Handling** - Graceful error messages

## 🚀 Quick Start

1. **Start the Backend Server**
   ```bash
   cd ../
   ./start-server.sh
   ```

2. **Start the Frontend Server**
   ```bash
   cd frontend
   python3 -m http.server 8080
   ```

3. **Open in Browser**
   Navigate to: http://localhost:8080

## 📁 File Structure

```
frontend/
├── index.html           # Modern UI with theme toggle
├── styles-modern.css    # Theme-aware CSS with animations
├── app-modern.js        # Interactive JavaScript with API integration
├── index.html.backup    # Original HTML (backup)
└── styles.css.backup    # Original CSS (backup)
```

## 🎯 Usage Guide

### Dashboard
- View total resumes, jobs, matches, and average match score
- Click "Refresh Stats" to update counters
- Stats animate on load and refresh

### Upload Resumes
1. Navigate to "Resumes" section
2. Drag & drop a file OR click to browse
3. Supported formats: PDF, TXT, DOC, DOCX
4. Max file size: 10MB
5. Resume is automatically parsed by AI

### Create Jobs
1. Navigate to "Jobs" section
2. Fill in the job posting form:
   - **Title**: Job position name
   - **Company**: Company name
   - **Experience Level**: Entry/Mid/Senior
   - **Location**: Job location
   - **Description**: Detailed job description
   - **Skills**: Comma-separated list (e.g., "Python, React, Node.js")
   - **Requirements**: Optional additional requirements
3. Click "Create Job Posting"

### View Matches
1. Navigate to "Matches" section
2. View AI-powered match scores
3. Matches are color-coded:
   - **Green**: Great Match (80%+)
   - **Yellow**: Good Match (60-79%)
   - **Blue**: Possible Match (<60%)

### Theme Toggle
- Click the moon/sun icon in the top-right corner
- Theme preference is saved automatically
- Works in all sections

## 🎨 Theme Customization

### Light Theme
- Clean white backgrounds
- Dark text for readability
- Subtle shadows and borders
- Professional gradient accents

### Dark Theme
- Dark navy backgrounds
- Light text for contrast
- Vibrant accent colors
- Reduced eye strain

### Custom Colors
Edit CSS variables in `styles-modern.css`:

```css
:root {
  --primary-color: #4f46e5;      /* Primary brand color */
  --success-color: #10b981;      /* Success states */
  --warning-color: #f59e0b;      /* Warnings */
  --danger-color: #ef4444;       /* Errors */
}
```

## 🔧 API Integration

The frontend connects to the backend API at `http://localhost:3000`:

- `GET /health` - Server health check
- `GET /api/resumes` - List all resumes
- `POST /api/resumes/upload` - Upload resume
- `GET /api/jobs` - List all jobs
- `POST /api/jobs` - Create job posting
- `GET /api/matches` - Get all matches
- `POST /api/matches/find` - Find matches for a job

## 📱 Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 🎭 Animations

### Keyframe Animations
- **pulse** - Pulsing effect for stat cards
- **bounce** - Bouncing effect for icons
- **fadeIn** - Smooth fade-in for content
- **slideIn** - Slide-in for notifications

### Hover Effects
- Cards lift on hover
- Buttons scale slightly
- Links change color smoothly
- Upload area highlights on drag

## 🐛 Troubleshooting

### Styles Not Loading
- Clear browser cache (Cmd+Shift+R or Ctrl+Shift+R)
- Check that `styles-modern.css` exists
- Verify server is running on port 8080

### JavaScript Not Working
- Check browser console for errors (F12)
- Verify `app-modern.js` exists
- Ensure backend is running on port 3000

### Theme Not Switching
- Check localStorage in browser DevTools
- Clear localStorage and refresh
- Verify theme toggle button exists

### API Calls Failing
- Verify backend server is running
- Check Network tab in DevTools
- Ensure MongoDB is running
- Verify MISTRAL_API_KEY is set

## 🌟 Best Practices

1. **Always check backend is running** before using frontend
2. **Upload valid resume files** (PDF, TXT, DOC, DOCX)
3. **Provide all required job fields** when creating jobs
4. **Use specific skills** in job postings for better matches
5. **Refresh stats** after uploading or creating jobs

## 🔐 Security Notes

- File uploads are validated client-side
- API calls use fetch with error handling
- No sensitive data stored in localStorage
- CORS should be configured on backend

## 📊 Performance

- Lazy loading for large lists
- Optimized animations (GPU-accelerated)
- Minimal re-renders
- Efficient event listeners
- Responsive images and icons

## 🚀 Future Enhancements

- [ ] Resume detail view modal
- [ ] Job edit/delete functionality
- [ ] Advanced filtering and search
- [ ] Export matches to CSV
- [ ] Email notifications
- [ ] User authentication
- [ ] Analytics dashboard
- [ ] Bulk resume upload

## 📝 License

Part of the Smart Resume Screener project.

---

**Made with ❤️ using Mistral AI**
