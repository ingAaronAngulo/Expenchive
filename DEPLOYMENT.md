# Cloudflare Pages Deployment Guide

## Quick Start

Your repository is ready for Cloudflare Pages! Follow these steps:

### 1. Push to GitHub

```bash
git add .
git commit -m "Add Cloudflare Pages configuration"
git push origin main
```

### 2. Connect to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** → **Create Application** → **Pages**
3. Click **Connect to Git**
4. Select your repository: `ingAaronAngulo/Expenchive`
5. Configure build settings:

### 3. Build Configuration

Use these settings in Cloudflare Pages:

- **Production branch**: `main`
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Node version**: `20` (set via environment variable or auto-detected from `.nvmrc`)

### 4. Environment Variables

Add these environment variables in Cloudflare Pages settings:

```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Important**: Get these values from your `.env.local` file or Firebase Console.

### 5. Firebase Configuration

Since you're using Firebase, you'll need to:

1. Keep Firebase Functions deployed separately via Firebase Hosting (if used)
2. Or migrate Cloud Functions to Cloudflare Workers if needed

**Current Setup**: Your Firebase functions are in `/functions` directory. These will still run on Firebase, while your frontend runs on Cloudflare Pages.

### 6. Deploy

Once configured, Cloudflare Pages will:
- Automatically deploy on every push to `main`
- Create preview deployments for pull requests
- Build and serve your app at: `https://expenchive.pages.dev`

## What's Configured

✅ **SPA Routing**: `_redirects` file handles client-side routing
✅ **Node Version**: `.nvmrc` specifies Node 20
✅ **App Icon**: Your custom icon is set up everywhere
✅ **PWA Manifest**: App can be installed on devices
✅ **Build Optimization**: TypeScript compilation + Vite build

## Troubleshooting

### Build Fails
- Check that environment variables are set correctly
- Verify Node version is 20 or higher

### Routes Don't Work
- Ensure `_redirects` file is in `public/` directory
- Cloudflare Pages should automatically use it from the build output

### Firebase Not Connecting
- Double-check all environment variables are set
- Ensure Firebase project allows your Cloudflare Pages domain in Firebase Console

## Custom Domain (Optional)

1. Go to your Cloudflare Pages project settings
2. Click **Custom Domains**
3. Add your domain
4. Update DNS records as instructed
