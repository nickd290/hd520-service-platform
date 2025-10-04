# Deployment Guide - Railway

## Prerequisites

- Railway account (https://railway.app)
- GitHub account
- Anthropic API key

## Step 1: Push to GitHub

```bash
cd /Users/nicholasdeblasio/hd520-service-platform
git init
git add .
git commit -m "Initial commit - HD520 Service Platform"
gh repo create hd520-service-platform --public --source=. --remote=origin --push
```

Or manually:
1. Create new repository on GitHub
2. Follow the instructions to push existing repository

## Step 2: Deploy Backend to Railway

### Option A: Deploy from GitHub (Recommended)

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Railway will auto-detect the Node.js project

### Option B: Deploy via Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd /Users/nicholasdeblasio/hd520-service-platform
railway init

# Deploy
railway up
```

## Step 3: Set Environment Variables

In Railway dashboard, go to your project → Variables tab:

```
PORT=5001
NODE_ENV=production
JWT_SECRET=<generate-with-command-below>
ANTHROPIC_API_KEY=<your-anthropic-key>
CLIENT_URL=<your-frontend-url>
```

Generate JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Step 4: Configure Build Settings

Railway should auto-detect, but if needed:

**Build Command:**
```
cd server && npm install && npm run build
```

**Start Command:**
```
cd server && npm start
```

**Root Directory:** `/server`

## Step 5: Deploy Frontend

### Deploy to Vercel (Recommended)

```bash
cd client
npm install -g vercel
vercel --prod
```

Set environment variable in Vercel dashboard:
- `VITE_API_URL` = Your Railway backend URL (e.g., `https://your-app.railway.app`)

### Deploy to Netlify

```bash
cd client
npm run build
netlify deploy --prod --dir=dist
```

Set environment variable in Netlify:
- `VITE_API_URL` = Your Railway backend URL

## Step 6: Update CORS

After deploying frontend, update backend environment variable:

```
CLIENT_URL=https://your-frontend-url.vercel.app
```

## Step 7: Test Deployment

1. Visit your frontend URL
2. Register a new account
3. Test AI chatbot
4. Upload a photo
5. Verify all features work

## Database

Railway will persist your SQLite database. For production, consider:
- Railway PostgreSQL addon
- Separate database service

## Monitoring

Railway provides:
- Automatic deployments on git push
- Logs and metrics
- Environment variable management
- Custom domains

## Troubleshooting

### Build Fails
- Check Node.js version (18.x required)
- Verify all dependencies in package.json
- Check build logs in Railway dashboard

### App Crashes
- Check logs: `railway logs`
- Verify environment variables
- Ensure JWT_SECRET is set
- Verify ANTHROPIC_API_KEY is valid

### CORS Errors
- Verify CLIENT_URL matches frontend URL exactly
- Include protocol (https://)
- No trailing slash

## Custom Domain

1. In Railway dashboard, go to Settings → Domains
2. Click "Generate Domain" or add custom domain
3. Update CLIENT_URL environment variable
4. Update VITE_API_URL in frontend

## Cost Optimization

Railway free tier includes:
- $5 of usage per month
- 512MB RAM
- 1GB disk

For production:
- Upgrade to Pro plan ($20/month)
- Add PostgreSQL database
- Enable auto-scaling
