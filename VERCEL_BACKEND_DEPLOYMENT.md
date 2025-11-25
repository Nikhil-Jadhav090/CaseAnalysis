# 🚀 Deploy Django Backend on Vercel

## ⚠️ Important Note About Vercel + Django

While **possible**, deploying Django on Vercel has limitations:
- ❌ No persistent file storage (uploaded files won't persist)
- ❌ No background tasks/cron jobs
- ❌ Cold starts (slower first request)
- ✅ FREE and easy to setup
- ✅ Good for MVP/demos

**For production**, consider **Render** or **Railway** instead (both have free tiers with better Django support).

---

## Option 1: Deploy Backend to Vercel (Quick & Free)

### Step 1: Prepare Your Repository

✅ **Already done!** Your repo is ready with:
- `backend/vercel.json` - Vercel configuration
- `backend/build_files.sh` - Build script
- `backend/wsgi_vercel.py` - WSGI handler
- Updated `requirements.txt` with gunicorn & whitenoise

### Step 2: Deploy to Vercel

1. **Go to Vercel**: https://vercel.com/new
2. **Import your repository**: `Nikhil-Jadhav090/CaseAnalysis`
3. **Configure the project**:
   - **Project Name**: `case-analysis-backend`
   - **Root Directory**: `backend`
   - **Framework Preset**: Other
   - Click **Deploy**

### Step 3: Add Environment Variables

After deployment, go to **Settings → Environment Variables** and add:

```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
SECRET_KEY=your-django-secret-key-here
DEBUG=False
ALLOWED_HOSTS=.vercel.app,case-analysis.vercel.app
CORS_ALLOWED_ORIGINS=https://case-analysis.vercel.app
CSRF_TRUSTED_ORIGINS=https://case-analysis.vercel.app,https://case-analysis-backend.vercel.app
```

**Generate Django SECRET_KEY:**
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Step 4: Redeploy

Click **Deployments → ... → Redeploy** to apply environment variables.

Your backend will be at: `https://case-analysis-backend.vercel.app`

### Step 5: Update Frontend

1. Go to your **frontend project** on Vercel
2. **Settings → Environment Variables**
3. Add:
   ```
   VITE_API_URL=https://case-analysis-backend.vercel.app
   ```
4. Redeploy frontend

---

## Option 2: Deploy Backend to Render (RECOMMENDED) ⭐

**Why Render is better for Django:**
- ✅ Persistent file storage
- ✅ PostgreSQL database included (free tier)
- ✅ Better performance (no cold starts on paid tier)
- ✅ Background workers support

### Quick Steps:

1. **Go to**: https://render.com/
2. **New Web Service** → Connect `Nikhil-Jadhav090/CaseAnalysis`
3. **Configure**:
   ```
   Name: case-analysis-backend
   Root Directory: backend
   Build Command: pip install -r requirements.txt && python manage.py migrate
   Start Command: gunicorn core.wsgi:application --bind 0.0.0.0:$PORT
   ```
4. **Add Environment Variables** (same as above)
5. **Deploy**

URL: `https://case-analysis-backend.onrender.com`

---

## Option 3: Deploy to Railway (Also Great)

1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select repository
4. Railway auto-detects Django
5. Add environment variables
6. Deploy!

---

## Testing Your Backend

Once deployed, test these endpoints:

```bash
# Health check
curl https://your-backend-url.vercel.app/api/

# Login (should return 400 or validation error, not 500)
curl -X POST https://your-backend-url.vercel.app/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
```

---

## Troubleshooting

### Error: "Module not found"
- Check `requirements.txt` has all dependencies
- Redeploy after adding missing packages

### Error: "ALLOWED_HOSTS"
- Verify `ALLOWED_HOSTS` environment variable includes `.vercel.app`

### Error: "CORS blocked"
- Check `CORS_ALLOWED_ORIGINS` includes your frontend URL
- Ensure `CSRF_TRUSTED_ORIGINS` is set

### Files not uploading
- **Vercel limitation**: Use external storage (AWS S3, Cloudinary)
- Or switch to Render/Railway

---

## What's Next?

After backend is deployed:

1. ✅ Backend live at `https://case-analysis-backend.vercel.app`
2. ✅ Update frontend `VITE_API_URL` environment variable
3. ✅ Test full application at `https://case-analysis.vercel.app`
4. 🎉 Your app is live!

---

## Database Options

**SQLite (Default - OK for demo):**
- Already configured, works on Vercel
- ⚠️ Resets on each deployment

**PostgreSQL (Recommended for production):**
- Get free PostgreSQL from Render or Railway
- Add `DATABASE_URL` environment variable
- Install: `pip install psycopg2-binary`

---

**Need help?** Check Vercel logs in Dashboard → Deployments → View Logs
