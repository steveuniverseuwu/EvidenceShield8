# 🚀 Deploy ChainGuard to Vercel

This guide will help you deploy your blockchain evidence management app to Vercel in just a few minutes.

## 📋 Prerequisites

Before deploying, make sure you have:
- [ ] A Vercel account (free at https://vercel.com)
- [ ] Your Supabase credentials ready
- [ ] Git installed (for Method 2)

---

## ⚡ Method 1: Deploy via Vercel CLI (Fastest)

### Step 1: Install Vercel CLI
```powershell
npm install -g vercel
```

### Step 2: Login to Vercel
```powershell
vercel login
```
This will open your browser for authentication.

### Step 3: Deploy to Vercel
```powershell
# Deploy to preview
vercel

# After testing, deploy to production
vercel --prod
```

### Step 4: Add Environment Variables
During deployment, Vercel will ask for environment variables. Add these:

```
VITE_SUPABASE_URL=https://qvxkthmxqsawrdaxukii.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-from-supabase
VITE_SUPABASE_PROJECT_ID=qvxkthmxqsawrdaxukii
```

**Where to find these values:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy the values

---

## 🌐 Method 2: Deploy via Vercel Dashboard (No CLI)

### Step 1: Push to GitHub (if not already)
```powershell
git init
git add .
git commit -m "Ready for Vercel deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 2: Import to Vercel
1. Go to https://vercel.com/new
2. Click "Import Project"
3. Connect your GitHub account
4. Select your repository
5. Click "Import"

### Step 3: Configure Build Settings
Vercel should auto-detect these, but verify:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 4: Add Environment Variables
Click "Environment Variables" and add:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://qvxkthmxqsawrdaxukii.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `VITE_SUPABASE_PROJECT_ID` | `qvxkthmxqsawrdaxukii` |

### Step 5: Deploy
Click "Deploy" and wait 1-2 minutes.

---

## 🎉 After Deployment

### Your app will be live at:
```
https://your-project-name.vercel.app
```

### Automatic Features You Get:
- ✅ HTTPS/SSL certificate (automatic)
- ✅ Global CDN (fast loading worldwide)
- ✅ Automatic deployments on git push
- ✅ Preview deployments for branches
- ✅ Analytics dashboard

---

## 🔧 Post-Deployment Configuration

### Add a Custom Domain (Optional)
1. Go to your project on Vercel
2. Click "Settings" → "Domains"
3. Add your domain (e.g., `chainguard.com`)
4. Follow DNS configuration steps

### Enable Analytics
1. Go to "Analytics" tab
2. Enable Web Analytics (free)
3. View traffic, performance metrics

---

## 🐛 Troubleshooting

### Build Failed?
**Check:**
- Environment variables are set correctly
- No TypeScript errors: `npm run build` locally
- Node version compatibility

**Fix:**
```powershell
# Test build locally first
npm run build

# If successful, redeploy
vercel --prod
```

### White Screen After Deployment?
**Check:**
1. Browser console for errors (F12)
2. Environment variables are set
3. Supabase URL is correct

**Fix:**
- Verify env vars in Vercel dashboard
- Check Supabase connection in Network tab

### 404 on Refresh?
This shouldn't happen with our `vercel.json` config, but if it does:
- Check `vercel.json` has the rewrites rule
- Redeploy: `vercel --prod`

---

## 📊 Monitoring Your App

### View Logs
```powershell
vercel logs
```

### Check Deployment Status
```powershell
vercel ls
```

### View Production URL
```powershell
vercel inspect
```

---

## 🔄 Updating Your Deployment

### Automatic (with GitHub)
Just push to main branch:
```powershell
git add .
git commit -m "Update feature"
git push
```
Vercel automatically deploys!

### Manual (with CLI)
```powershell
vercel --prod
```

---

## 💰 Cost Breakdown

### Free Tier Includes:
- 100 GB bandwidth/month
- Unlimited deployments
- 6,000 build minutes/month
- Custom domains

### Your App Usage (Estimate):
- **Frontend**: ~2-5 MB per visit
- **Expected**: 1,000-5,000 visits/month easily within free tier
- **Backend**: On Supabase (separate, also free tier)

---

## 🎯 Next Steps After Deployment

1. **Test everything**:
   - Login functionality
   - Upload evidence
   - Blockchain verification
   - Audit trail

2. **Share your app**:
   - Copy the Vercel URL
   - Share with team/users

3. **Monitor performance**:
   - Check Vercel Analytics
   - Monitor Supabase usage

4. **Set up custom domain** (optional):
   - Buy domain from Namecheap/GoDaddy
   - Add to Vercel settings

---

## 📚 Useful Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Supabase + Vercel Guide](https://supabase.com/docs/guides/getting-started/quickstarts/vercel)

---

## ✅ Deployment Checklist

Before deploying, verify:
- [ ] `npm run build` works locally
- [ ] Environment variables are ready
- [ ] Supabase backend is working
- [ ] Git repository is up to date (if using GitHub method)
- [ ] No sensitive data in code (check .env is in .gitignore)

---

## 🆘 Need Help?

If deployment fails:
1. Check the error message in Vercel dashboard
2. Test build locally: `npm run build`
3. Verify environment variables
4. Check Vercel deployment logs

---

## 🎊 Success!

Once deployed, you'll have:
- **Live URL**: `https://your-app.vercel.app`
- **Automatic HTTPS**
- **Global CDN**
- **Auto-deployments** on git push

Your blockchain evidence management system is now live! 🚀
