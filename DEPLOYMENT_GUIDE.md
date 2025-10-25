# ContractorAI Deployment Guide

This guide walks you through deploying ContractorAI to production using Vercel.

---

## Prerequisites

Before deploying, ensure you have:

- [x] A Vercel account (sign up at https://vercel.com)
- [x] Git repository initialized
- [x] Supabase project configured
- [x] All environment variables ready
- [x] Stripe account (if using payments)
- [x] Domain name (optional, but recommended)

---

## Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

Or use without installing:
```bash
npx vercel
```

---

## Step 2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate via email or GitHub.

---

## Step 3: Configure Environment Variables

You'll need to add these environment variables in Vercel:

### Required Environment Variables:

**Frontend (VITE_ variables):**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key (use pk_test_ for testing)
VITE_APP_URL=https://your-domain.vercel.app
```

### Optional (for Edge Functions):
These are automatically available in Supabase Edge Functions:
```
SUPABASE_URL (auto-populated)
SUPABASE_ANON_KEY (auto-populated)
SUPABASE_SERVICE_ROLE_KEY (auto-populated)
OPENAI_API_KEY (if using AI features)
STRIPE_SECRET_KEY (for payment processing)
TWILIO_ACCOUNT_SID (for SMS)
TWILIO_AUTH_TOKEN (for SMS)
TWILIO_PHONE_NUMBER (for SMS)
RESEND_API_KEY (for emails)
```

---

## Step 4: Deploy to Vercel

### First-Time Deployment:

```bash
vercel
```

Follow the interactive prompts:
1. **Set up and deploy?** Yes
2. **Which scope?** Select your account
3. **Link to existing project?** No
4. **Project name:** contractorai (or your preferred name)
5. **Directory:** ./ (current directory)
6. **Override settings?** No

This creates a preview deployment.

### Deploy to Production:

```bash
vercel --prod
```

---

## Step 5: Add Environment Variables in Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project (contractorai)
3. Click **Settings** → **Environment Variables**
4. Add each variable:
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://your-project.supabase.co`
   - Environment: **Production** (check this box)
   - Click **Save**

5. Repeat for all required variables

6. After adding all variables, redeploy:
```bash
vercel --prod
```

---

## Step 6: Configure Custom Domain (Optional)

### Option A: Use Vercel's Free Domain
Your app is automatically available at:
```
https://contractorai.vercel.app
```

### Option B: Add Custom Domain

1. In Vercel Dashboard → **Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain: `app.contractorai.com`
4. Follow DNS configuration instructions:

**If using Namecheap/GoDaddy:**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

5. Wait for DNS propagation (5 minutes to 48 hours)
6. SSL certificate is automatic (Let's Encrypt)

---

## Step 7: Configure Supabase for Production

### Update Supabase Auth URLs:

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Set **Site URL:** `https://your-domain.vercel.app`
3. Add **Redirect URLs:**
   ```
   https://your-domain.vercel.app/**
   https://your-domain.vercel.app/onboarding
   https://your-domain.vercel.app/dashboard
   ```

### Update CORS Settings (if needed):
1. Supabase Dashboard → API Settings
2. Ensure your production domain is allowed

---

## Step 8: Update App URL in Code

Make sure `VITE_APP_URL` environment variable in Vercel is set to your production URL:
```
VITE_APP_URL=https://your-domain.vercel.app
```

---

## Step 9: Test Your Deployment

### Essential Checks:

- [ ] Site loads at production URL
- [ ] HTTPS works (lock icon in browser)
- [ ] Sign up flow works
- [ ] Login flow works
- [ ] Database read/write works
- [ ] Create customer
- [ ] Create job
- [ ] Send proposal
- [ ] Create invoice
- [ ] Upload photos
- [ ] Voice recording works
- [ ] AI features work (if enabled)
- [ ] Stripe payments work (test mode first!)
- [ ] Mobile responsive design
- [ ] All pages accessible
- [ ] No console errors

---

## Step 10: Switch Stripe to Live Mode (When Ready)

⚠️ **IMPORTANT: Only do this when fully tested!**

1. Complete Stripe account verification
2. In Stripe Dashboard, toggle from "Test mode" to "Live mode"
3. Get new API keys:
   - `pk_live_...` (publishable key)
   - `sk_live_...` (secret key)

4. Update environment variables in Vercel:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
   ```

5. Update Edge Function environment in Supabase:
   ```
   STRIPE_SECRET_KEY=sk_live_your_live_secret_key
   ```

6. Test with a real card (your own)
7. Immediately refund the test transaction

---

## Continuous Deployment

### Automatic Deployments:

Vercel automatically deploys when you push to your Git repository:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Vercel will:
1. Detect the push
2. Run build automatically
3. Deploy to production
4. Notify you when complete

### Manual Deployments:

```bash
vercel --prod
```

---

## Monitoring & Analytics

### Vercel Analytics (Built-in):
1. Go to your project in Vercel Dashboard
2. Click **Analytics** tab
3. View:
   - Page views
   - Unique visitors
   - Performance metrics
   - Core Web Vitals

### Setup Uptime Monitoring:

**UptimeRobot (Free):**
1. Sign up at https://uptimerobot.com
2. Add new monitor:
   - Type: HTTPS
   - URL: `https://your-domain.vercel.app`
   - Interval: Every 5 minutes
3. Get alerts via email/SMS if site goes down

---

## Backup Strategy

### Supabase Automatic Backups:
- Daily backups (retained for 7 days on free tier)
- Accessible in Supabase Dashboard → Database → Backups

### Manual Backup:
```bash
# Using Supabase CLI
supabase db dump -f backup-$(date +%Y%m%d).sql
```

Or download from Supabase Dashboard.

---

## Troubleshooting

### Build Fails:
```bash
# Test build locally first
npm run build

# Check for errors
npm run typecheck
```

### Environment Variables Not Working:
1. Verify variables are set in Vercel Dashboard
2. Ensure "Production" environment is checked
3. Redeploy after adding variables:
   ```bash
   vercel --prod
   ```

### 404 Errors on Refresh:
- Ensure `vercel.json` has rewrites configuration
- Ensure `_redirects` file exists in `public/` folder

### Database Connection Issues:
1. Check Supabase URL and keys are correct
2. Verify Supabase project is not paused
3. Check RLS policies allow access

### Stripe Webhook Not Working:
1. Update webhook URL in Stripe Dashboard to production URL:
   ```
   https://your-domain.vercel.app/api/stripe-webhook
   ```
   (Note: For Supabase Edge Functions, use:)
   ```
   https://qorauvwnanzmjjcszwoz.supabase.co/functions/v1/stripe-webhook
   ```

---

## Security Checklist

Before going live:

- [ ] All environment variables use production keys (not test)
- [ ] Supabase RLS policies enabled on all tables
- [ ] Stripe is in live mode (when ready)
- [ ] No sensitive data in console.logs
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Auth redirect URLs configured correctly
- [ ] CORS settings configured
- [ ] Sample/test data cleared (use "Clear All Data" button)

---

## Rollback (If Needed)

If something goes wrong:

```bash
# View previous deployments
vercel ls

# Rollback to previous deployment
vercel rollback <deployment-url>
```

Or in Vercel Dashboard:
1. Go to **Deployments** tab
2. Find working deployment
3. Click **⋯** → **Promote to Production**

---

## Support

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Stripe Docs:** https://stripe.com/docs

---

## Quick Deployment Checklist

✅ **Before First Deploy:**
- [ ] `vercel.json` created
- [ ] `public/_redirects` created
- [ ] All environment variables documented
- [ ] Supabase project ready
- [ ] Code built successfully locally (`npm run build`)

✅ **Deploy:**
- [ ] `vercel login`
- [ ] `vercel` (preview)
- [ ] Add environment variables in Vercel Dashboard
- [ ] `vercel --prod` (production)

✅ **After Deploy:**
- [ ] Update Supabase Auth URLs
- [ ] Test all features
- [ ] Configure custom domain
- [ ] Setup monitoring
- [ ] Clear test data

---

**Your ContractorAI app is now live!** 🚀

Access it at: `https://your-project.vercel.app`

Remember to test thoroughly before switching Stripe to live mode and accepting real payments.
