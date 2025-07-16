# Vercel Deployment Guide

This guide will help you deploy the Artisan Sourdough Web App to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Vercel CLI installed (optional): `npm i -g vercel`
3. Production Supabase project with database set up
4. Production Stripe account with API keys

## Deployment Steps

### 1. Prepare Your Supabase Production Environment

1. Create a new Supabase project for production at https://supabase.com
2. Run the database migrations from `supabase/migrations/` in your production database
3. Set up Row Level Security (RLS) policies
4. Add your production domain to Authentication > URL Configuration
5. Set the admin user role for `btimofeyev@gmail.com` in the profiles table

### 2. Configure Stripe for Production

1. Switch to live mode in your Stripe dashboard
2. Create a new webhook endpoint for `https://your-domain.vercel.app/api/webhooks/stripe`
3. Select these events: `checkout.session.completed`, `payment_intent.succeeded`
4. Copy the webhook signing secret

### 3. Deploy to Vercel

#### Option A: Deploy via GitHub (Recommended)

1. Push your code to a GitHub repository
2. Go to https://vercel.com/new
3. Import your GitHub repository
4. Configure environment variables (see below)
5. Deploy

#### Option B: Deploy via CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (follow the prompts)
vercel

# For production deployment
vercel --prod
```

### 4. Configure Environment Variables in Vercel

Go to your project settings in Vercel and add these environment variables:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-key
STRIPE_SECRET_KEY=sk_live_your-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# App
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

### 5. Post-Deployment Configuration

1. **Update Supabase Auth Settings:**
   - Add `https://your-domain.vercel.app` to Site URL
   - Add `https://your-domain.vercel.app/auth/callback` to Redirect URLs

2. **Update Stripe Webhook:**
   - Ensure the webhook endpoint is `https://your-domain.vercel.app/api/webhooks/stripe`

3. **Test the Deployment:**
   - Visit your site and test user registration
   - Test the checkout flow with Stripe test cards
   - Verify admin dashboard access for admin users

## Custom Domain Setup

1. In Vercel project settings, go to "Domains"
2. Add your custom domain
3. Follow the DNS configuration instructions
4. Update `NEXT_PUBLIC_SITE_URL` to your custom domain
5. Update Supabase and Stripe configurations with the new domain

## Monitoring and Logs

- View deployment logs in Vercel dashboard
- Monitor function logs under "Functions" tab
- Set up alerts for errors and performance issues

## Troubleshooting

### Build Failures
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Run `npm run build` locally to test

### Authentication Issues
- Verify Supabase URLs in environment variables
- Check redirect URLs in Supabase dashboard
- Ensure cookies are enabled for your domain

### Payment Issues
- Verify Stripe webhook is receiving events
- Check webhook signing secret
- Monitor Stripe dashboard for failed payments

### Database Connection Issues
- Verify Supabase service role key
- Check RLS policies are properly configured
- Ensure database migrations have run

## Performance Optimization

The `vercel.json` file includes:
- Function timeout configurations
- Regional deployment (US East by default)
- Security headers
- API caching rules

To optimize further:
- Use Vercel Analytics to monitor performance
- Enable Vercel Speed Insights
- Consider using Vercel Edge Functions for better performance

## CI/CD Pipeline

For automatic deployments:
1. Connect your GitHub repository to Vercel
2. Each push to main branch will trigger a production deployment
3. Pull requests will create preview deployments
4. Use environment variables for different environments

## Security Checklist

- [ ] All environment variables are set in Vercel (not in code)
- [ ] Production Stripe keys are used (not test keys)
- [ ] Supabase RLS policies are enabled
- [ ] Admin email is properly configured
- [ ] HTTPS is enforced
- [ ] Security headers are configured in `vercel.json`