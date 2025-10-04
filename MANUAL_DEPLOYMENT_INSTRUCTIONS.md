# Manual Deployment Instructions

## ✅ Git Repository Ready

Your code has been committed locally:
- **84 files** committed
- **18,650+ lines of code**
- Commit hash: `bb72f15`

## 📤 Step 1: Push to GitHub (Manual)

### Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `hd520-service-platform`
3. Description: `HD520 Service Platform - AI-powered maintenance assistant with training modules`
4. Visibility: Public (or Private)
5. **Do NOT** initialize with README (we already have one)
6. Click "Create repository"

### Push Your Code

After creating the repo, GitHub will show you commands. Run these:

```bash
cd /Users/nicholasdeblasio/hd520-service-platform

# Add GitHub as remote
git remote add origin https://github.com/YOUR_USERNAME/hd520-service-platform.git

# Push code
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## 🚀 Step 2: Deploy Backend to Railway

### Create Railway Account

1. Go to https://railway.app
2. Sign up with GitHub
3. Verify your email

### Deploy from GitHub

1. Click "New Project"
2. Click "Deploy from GitHub repo"
3. Click "Configure GitHub App"
4. Select your `hd520-service-platform` repository
5. Click "Deploy Now"

Railway will:
- Auto-detect Node.js project
- Install dependencies
- Build the TypeScript code

### Configure Environment Variables

1. In Railway dashboard, click on your service
2. Go to "Variables" tab
3. Click "New Variable" and add:

```
PORT=5001
NODE_ENV=production
CLIENT_URL=https://your-frontend-url.vercel.app
```

4. Generate JWT Secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and add:
```
JWT_SECRET=<paste-generated-secret>
```

5. Add your Anthropic API key:
```
ANTHROPIC_API_KEY=<your-api-key>
```

### Configure Build Settings

Railway should auto-detect, but verify:

1. Click "Settings" tab
2. **Build Command:** `cd server && npm install && npm run build`
3. **Start Command:** `cd server && npm start`
4. **Root Directory:** Leave empty or `/`

### Get Backend URL

1. Go to "Settings" → "Domains"
2. Click "Generate Domain"
3. Copy the URL (e.g., `https://your-app.up.railway.app`)

## 🌐 Step 3: Deploy Frontend to Vercel

### Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

Or deploy via web interface:

### Deploy via Vercel Dashboard

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Add New..." → "Project"
4. Import `hd520-service-platform` repository
5. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

6. Add Environment Variable:
   - **Name:** `VITE_API_URL`
   - **Value:** Your Railway backend URL (e.g., `https://your-app.up.railway.app`)

7. Click "Deploy"

### Deploy via CLI

```bash
cd /Users/nicholasdeblasio/hd520-service-platform/client
vercel --prod
```

When prompted:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name: `hd520-service-platform`
- Directory: `./`
- Override settings? **N**

Then add environment variable:
```bash
vercel env add VITE_API_URL production
```
Paste your Railway backend URL.

Redeploy:
```bash
vercel --prod
```

## 🔄 Step 4: Update CORS Configuration

After deploying frontend, update Railway backend:

1. Go to Railway dashboard → Variables
2. Update `CLIENT_URL` to your Vercel URL:
```
CLIENT_URL=https://your-app.vercel.app
```

Railway will automatically redeploy.

## ✅ Step 5: Test Deployment

1. Visit your Vercel frontend URL
2. Click "Register" and create account
3. Test features:
   - AI chatbot (requires ANTHROPIC_API_KEY)
   - Photo upload
   - Training modules
   - Trust data dashboard
   - Admin features (register with role: "admin")

## 🔍 Troubleshooting

### Backend Won't Start

**Check Logs:**
```bash
# If using Railway CLI:
railway logs
```

Or in Railway dashboard → Deployments → Click latest → View Logs

**Common Issues:**
- Missing environment variables
- Invalid ANTHROPIC_API_KEY
- Build errors (check package.json scripts)

### Frontend Can't Connect to Backend

**Verify:**
1. `VITE_API_URL` is set correctly in Vercel
2. Includes `https://` protocol
3. No trailing slash
4. Backend is running (check Railway dashboard)

**Test Backend:**
```bash
curl https://your-app.up.railway.app/api/health
```

Should return: `{"status":"ok","timestamp":"..."}`

### CORS Errors

**Fix:**
1. Verify `CLIENT_URL` in Railway matches Vercel URL exactly
2. Include protocol: `https://`
3. No trailing slash
4. Redeploy backend after changing

### Database Errors

**SQLite in Production:**
Railway supports SQLite, but data persists only if:
1. Using Railway volumes (persistent storage)
2. Or upgrade to PostgreSQL

**To use PostgreSQL:**
1. Railway dashboard → "New" → "Database" → "PostgreSQL"
2. Update code to use `DATABASE_URL` environment variable
3. Install `pg` package
4. Update database.ts to use PostgreSQL

## 📊 Alternative Deployment Options

### Frontend: Netlify

```bash
cd client
npm run build
netlify deploy --prod --dir=dist
```

Environment variable in Netlify dashboard:
- `VITE_API_URL` = Railway backend URL

### Backend: Render.com

1. Go to https://render.com
2. "New" → "Web Service"
3. Connect GitHub repository
4. **Build Command:** `cd server && npm install && npm run build`
5. **Start Command:** `cd server && npm start`
6. Add environment variables
7. Deploy

### All-in-One: Heroku

**Backend:**
```bash
heroku create hd520-backend
heroku config:set JWT_SECRET=<secret>
heroku config:set ANTHROPIC_API_KEY=<key>
git subtree push --prefix server heroku main
```

**Frontend:**
Deploy to Vercel/Netlify as usual.

## 🎯 Quick Deploy Checklist

- [ ] Create GitHub repository
- [ ] Push code to GitHub
- [ ] Create Railway account
- [ ] Deploy backend to Railway
- [ ] Add all environment variables to Railway
- [ ] Get Railway backend URL
- [ ] Deploy frontend to Vercel
- [ ] Add VITE_API_URL to Vercel
- [ ] Update CLIENT_URL in Railway
- [ ] Test authentication flow
- [ ] Test AI chatbot
- [ ] Test photo upload
- [ ] Verify all features work

## 📞 Support

If you encounter issues:
1. Check Railway logs
2. Check Vercel deployment logs
3. Verify all environment variables
4. Test backend health endpoint
5. Check browser console for errors

## 🔐 Security Reminders

✅ **Before deploying:**
- [ ] Generated new JWT_SECRET (64-byte hex)
- [ ] Valid ANTHROPIC_API_KEY
- [ ] CLIENT_URL matches frontend exactly
- [ ] No secrets committed to GitHub
- [ ] .gitignore includes .env files
- [ ] Database has proper indexes

## 🎉 You're Ready!

Your HD520 Service Platform is production-ready with:
- ✅ 14 phases completed
- ✅ All features implemented
- ✅ Documentation complete
- ✅ Test data seeded
- ✅ Ready for deployment

**Next Steps:**
1. Push to GitHub (instructions above)
2. Deploy to Railway (instructions above)
3. Deploy to Vercel (instructions above)
4. Share with your team!
