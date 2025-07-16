#!/bin/bash

# Vercel Environment Variables Setup Script
# This script helps you set up all required environment variables for Vercel deployment

echo "Setting up Vercel environment variables..."
echo "Please have your Supabase and Stripe credentials ready."
echo ""

# Read environment variables from .env.local if it exists
if [ -f .env.local ]; then
    echo "Found .env.local file. Reading values..."
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Function to add environment variable to all environments
add_env_var() {
    local var_name=$1
    local var_value=$2
    
    if [ -n "$var_value" ]; then
        echo "Adding $var_name..."
        echo "$var_value" | vercel env add "$var_name" production --yes
        echo "$var_value" | vercel env add "$var_name" preview --yes
        echo "$var_value" | vercel env add "$var_name" development --yes
    else
        echo "Skipping $var_name (no value provided)"
    fi
}

# Add all environment variables
add_env_var "NEXT_PUBLIC_SUPABASE_URL" "$NEXT_PUBLIC_SUPABASE_URL"
add_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$NEXT_PUBLIC_SUPABASE_ANON_KEY"
add_env_var "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_ROLE_KEY"
add_env_var "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" "$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
add_env_var "STRIPE_SECRET_KEY" "$STRIPE_SECRET_KEY"
add_env_var "STRIPE_WEBHOOK_SECRET" "$STRIPE_WEBHOOK_SECRET"

# For NEXT_PUBLIC_SITE_URL, we'll use the Vercel URL for now
echo "Setting NEXT_PUBLIC_SITE_URL to auto-detected Vercel URL..."
echo "https://bread-app.vercel.app" | vercel env add "NEXT_PUBLIC_SITE_URL" production --yes
echo "https://bread-app-preview.vercel.app" | vercel env add "NEXT_PUBLIC_SITE_URL" preview --yes
echo "http://localhost:3000" | vercel env add "NEXT_PUBLIC_SITE_URL" development --yes

echo ""
echo "Environment variables setup complete!"
echo "You can now run 'vercel --prod' to deploy to production."