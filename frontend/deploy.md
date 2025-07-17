# ATOM Trading System - Deployment Guide

## 🚀 Quick Deployment to Vercel

### Option 1: Deploy Frontend Separately (Recommended)

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Test build locally:**
   ```bash
   pnpm run build
   ```

4. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

### Option 2: Deploy from Root with Frontend Focus

1. **Create vercel.json in root:**
   ```json
   {
     "framework": "nextjs",
     "rootDirectory": "frontend",
     "buildCommand": "cd frontend && pnpm run build",
     "devCommand": "cd frontend && pnpm run dev",
     "installCommand": "cd frontend && pnpm install"
   }
   ```

2. **Deploy from root:**
   ```bash
   vercel --prod
   ```

## 🔧 Troubleshooting

### Common Issues:

1. **"No Next.js version detected"**
   - Ensure you're in the frontend directory
   - Check that package.json has "next" in dependencies
   - Verify vercel.json is properly configured

2. **Build failures:**
   - Run `pnpm run type-check` to check for TypeScript errors
   - Run `pnpm run build` locally first
   - Check all imports are correct

3. **Environment variables:**
   - Set up environment variables in Vercel dashboard
   - Add NEXT_PUBLIC_ prefix for client-side variables

## 🌐 Live URLs

After successful deployment, you'll get:
- **Production URL**: https://your-app-name.vercel.app
- **Preview URL**: For each deployment
- **Inspect URL**: For deployment details

## ✅ Verification

After deployment, verify:
- [ ] App loads correctly
- [ ] All pages navigate properly
- [ ] Real-time features work
- [ ] Mobile responsive design
- [ ] Theme switching works
- [ ] Bot controls respond

## 🔄 Continuous Deployment

Connect your GitHub repository to Vercel for automatic deployments:
1. Go to Vercel dashboard
2. Import your GitHub repository
3. Set root directory to "frontend"
4. Configure build settings
5. Deploy automatically on push to main branch
