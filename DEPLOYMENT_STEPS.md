# 🚀 Quick Deployment Guide

## Problem: Your frontend is deployed but can't connect to the backend

**Current Status:**
- ✅ Frontend deployed: https://case-analysis.vercel.app/
- ❌ Backend not deployed (still running locally at http://127.0.0.1:8000)

## Solution: Deploy Backend First

### Option 1: Deploy Backend to Render (FREE) ⭐ RECOMMENDED

1. **Go to Render**: https://render.com
2. **Sign up** and click "New +" → "Web Service"
3. **Connect GitHub** repository: `Nikhil-Jadhav090/CaseAnalysis`
4. **Configure:**
   - Name: `case-analysis-backend`
   - Root Directory: `backend`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt && python manage.py migrate`
   - Start Command: `gunicorn core.wsgi:application --bind 0.0.0.0:$PORT`
   - Plan: **Free**

5. **Add Environment Variables:**
   ```
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ALLOWED_HOSTS=case-analysis.vercel.app,case-analysis-backend.onrender.com
   DATABASE_URL=(Render provides this automatically if you add PostgreSQL)
   DJANGO_SECRET_KEY=your-secret-key-here-generate-a-new-one
   DEBUG=False
   ```

6. **Create & Deploy** - Wait 5-10 minutes

7. **Your backend URL** will be: `https://case-analysis-backend.onrender.com`

### Option 2: Deploy Backend to Railway (Easier)

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway auto-detects Django
5. Add environment variables (same as above)
6. Deploy!

## Update Frontend to Use Backend

After backend is deployed, update Vercel environment variable:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   ```
   VITE_API_URL=https://case-analysis-backend.onrender.com
   ```
3. Redeploy frontend (Vercel will auto-redeploy)

## Quick Test Without Backend (Demo Mode)

If you want to test the frontend without deploying backend, I can create a mock API mode. Let me know!

## Files Updated

- ✅ `frontend/src/config.js` - Created API configuration
- ✅ `frontend/src/context/AuthContext.jsx` - Uses dynamic API URL
- ⏳ Other pages need updating to use config.js

## Next Steps

1. Choose a backend platform (Render recommended)
2. Deploy backend with environment variables
3. Update `VITE_API_URL` in Vercel
4. Push remaining API updates to GitHub

**Do you want me to:**
- A) Update all remaining files to use the API config?
- B) Create a mock/demo mode for frontend-only deployment?
- C) Help you deploy the backend step-by-step?
