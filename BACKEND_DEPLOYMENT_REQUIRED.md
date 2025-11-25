# ⚠️ IMPORTANT: Backend Not Deployed

Your frontend is live at **https://case-analysis.vercel.app/** but cannot fetch data because the backend is only running locally.

## 🚨 Current Problem

- ✅ Frontend deployed on Vercel
- ❌ Backend still on `localhost:8000` (not accessible from internet)
- ❌ API calls failing with network errors

## ✅ Quick Fix Solution

Deploy your backend to Render (FREE platform):

### Step 1: Sign up on Render
1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"

### Step 2: Connect Repository
1. Select `Nikhil-Jadhav090/CaseAnalysis`
2. Click "Connect"

### Step 3: Configure Service
```
Name: case-analysis-backend
Root Directory: backend
Environment: Python 3
Region: Choose closest to you
Branch: main

Build Command:
pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate

Start Command:
gunicorn core.wsgi:application --bind 0.0.0.0:$PORT
```

### Step 4: Add Environment Variables
Click "Advanced" → "Add Environment Variable":

```
GEMINI_API_KEY=<your_actual_gemini_key>
DJANGO_SECRET_KEY=<generate_new_secret_key>
DEBUG=False
ALLOWED_HOSTS=case-analysis.vercel.app,.onrender.com
CSRF_TRUSTED_ORIGINS=https://case-analysis.vercel.app,https://case-analysis-backend.onrender.com
DATABASE_URL=<Render will auto-provide if you add PostgreSQL>
```

**To generate a new Django secret key:**
```python
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Step 5: Deploy
1. Click "Create Web Service"
2. Wait 5-10 minutes for deployment
3. Your backend will be at: `https://case-analysis-backend.onrender.com`

### Step 6: Update Frontend Environment Variable
1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Select your project `case-analysis`
3. Go to Settings → Environment Variables
4. Add new variable:
   ```
   Name: VITE_API_URL
   Value: https://case-analysis-backend.onrender.com
   ```
5. Redeploy frontend (automatic after adding env var)

## 🎉 Done!

Your application will be fully functional at https://case-analysis.vercel.app/

---

## Alternative: Quick Demo Without Backend

If you want to test the frontend without deploying backend, I can create a mock API mode. Let me know!

## Need Help?

**Backend deployment issues:**
- Check Render logs for errors
- Ensure all environment variables are set
- Verify `requirements.txt` has all dependencies

**Frontend still not connecting:**
- Verify `VITE_API_URL` is set in Vercel
- Check browser console for exact error
- Ensure backend CORS allows your frontend domain
