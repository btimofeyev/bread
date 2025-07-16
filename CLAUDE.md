# Artisan Sourdough Web App - Production Ready

## 🚀 Project Overview
iOS-styled web application for artisan sourdough ordering with complete admin dashboard.

**Tech Stack:**
- Frontend: Next.js 14, TypeScript, Tailwind CSS
- Backend: Supabase (Database + Auth), Stripe API
- State: Zustand
- UI: Lucide React, React Hot Toast

## 🎯 **PRODUCTION READY APPLICATION** ✅

### **Core Features:**
✅ Customer authentication and profiles  
✅ Product catalog with real-time updates  
✅ Shopping cart with persistence  
✅ Secure checkout with validation  
✅ Stripe payment integration  
✅ Order tracking and history  
✅ Admin dashboard with comprehensive analytics  
✅ Real-time order management  
✅ Complete menu management (CRUD + image upload)  
✅ Role-based access control  
✅ Mobile-responsive iOS design  

### **Application Status:**
- **Build**: Production ready (177KB optimized)
- **Security**: RLS policies + input validation
- **Real-time**: Live updates across all features
- **Mobile**: Fully responsive design
- **Performance**: Fast loading, no blocking issues

## 📋 **REAL MENU DATA MANAGEMENT**

### **Current Menu Structure**
The application now uses real organic sourdough menu data organized into these categories:

#### **BREADS**
- Traditional Loaf (LG) - $10
- Fresh Milled Traditional Loaf (Md-L) - $15 (by availability)
- French Loaves (2 CT.) - $16
- Soft Dinner Rolls (12 CT) - $14
- Baguette (2 CT) - $16

#### **SWEET TREATS**
- Cinnamon Rolls (6 CT) - $18
- Cinnamon Rolls (12 CT) - $32
- Seasonal Butter Braid (LG) - $25 (by availability)

#### **SANDWICH BREADS**
- Plain Bagels (8-10 CT) - $12
- Dozen Bagels (12 CT) - $14.50
- Sandwich Loaf - $11
- Hamburger Buns (12 CT) - $13

### **Adding New Products**
When adding new menu items:

1. **Cost Calculation**: Use 30-40% of retail price as cost
2. **Lead Time**: Standard 48 hours for most breads, 24 hours for rolls
3. **Categories**: Keep consistent with existing structure
4. **Descriptions**: Include key details (organic, artisan, etc.)
5. **Availability**: Mark seasonal items appropriately

### **Menu Management Instructions**

#### **For Developers:**
```sql
-- Add new product
INSERT INTO products (name, description, price, cost, category, available, lead_time_hours) 
VALUES ('Product Name', 'Description', price, cost, 'Category', true, 48);

-- Update existing product
UPDATE products 
SET price = new_price, cost = new_cost, available = true 
WHERE name = 'Product Name';

-- Seasonal availability toggle
UPDATE products 
SET available = false 
WHERE name LIKE '%Seasonal%';
```

#### **For Admins via Dashboard:**
1. Navigate to `/dashboard/menu`
2. Click "Add Product" for new items
3. Use "Edit" button to modify existing products
4. Toggle availability with "Enable/Disable" buttons
5. Calculate costs as 30-40% of retail price

### **Future Menu Expansions**
The menu includes "Coming Soon" beef tallow products:
- Plain Beef Tallow (for cooking) 8oz
- Whipped Beef Tallow
- Tallow Balms
- Tallow Soap Bar
- Zinc Itch Cream
- Zinc Sunscreen

#### **Adding Tallow Products:**
```sql
-- Example for future tallow category
INSERT INTO products (name, description, price, cost, category, available, lead_time_hours) 
VALUES 
('Plain Beef Tallow 8oz', 'Premium beef tallow for cooking', 15.00, 6.00, 'Tallow Products', false, 0),
('Tallow Soap Bar', 'Natural beef tallow soap bar', 8.00, 3.00, 'Tallow Products', false, 0);
```

### **Pricing Guidelines**
- **Breads**: $10-16 (staple items)
- **Sweet Treats**: $18-32 (premium pricing)
- **Sandwich Items**: $11-14.50 (everyday use)
- **Rolls/Buns**: $12-14 (bulk items)
- **Seasonal Items**: +$2-5 premium

### **Seasonal Product Management**
- Mark seasonal items in description
- Use availability toggle for seasonal control
- Update lead times for holiday rushes
- Consider limited quantity notifications

## 🔧 Essential Commands

```bash
# Development
npm install
npm run dev

# Production
npm run build
npm start

# Quality checks
npm run typecheck
npm run lint

# Deployment
vercel          # Deploy preview
vercel --prod   # Deploy to production
```

## 🗄️ Database Setup

```bash
# Generate types from database
npx supabase gen types typescript --local > src/types/database.ts

# Run migrations
npx supabase db push
```

## 🔑 Environment Variables

Create `.env.local` file:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 📁 Key File Locations

- **Components**: `src/components/`
- **API Routes**: `src/app/api/`
- **Database Types**: `src/types/database.ts`
- **Zustand Stores**: `src/stores/`
- **Supabase Client**: `src/lib/supabase/client.ts`

## 🚀 **DEPLOYMENT**

### **Vercel Deployment Setup**
The project is now configured for Vercel deployment with:

1. **vercel.json**: Production-ready configuration with:
   - Next.js framework settings
   - Function timeouts for API routes
   - Environment variable mappings
   - Security headers
   - Regional deployment (US East)

2. **Environment Files**:
   - `.env.production`: Template for production variables
   - Updated `.gitignore` to exclude production env files

3. **Deployment Guide**:
   - Complete instructions in `VERCEL_DEPLOYMENT.md`
   - Covers Supabase setup, Stripe configuration, and deployment steps
   - Includes troubleshooting and security checklist

### **Quick Deploy**
```bash
# Via CLI
vercel          # Preview deployment
vercel --prod   # Production deployment

# Via GitHub
# Push to repository and import in Vercel dashboard
```

## 📝 **CRITICAL: Always Update CLAUDE.md**
**IMPORTANT RULE**: Every time you make changes to the codebase, you MUST update this CLAUDE.md file with:
- What was changed and why
- Any new commands or scripts added
- Troubleshooting for new features
- Configuration updates
- New environment variables

## 👑 Admin User Management

### Adding Admin Users
Use the provided script to grant admin access to users:

```bash
# Add admin access (user must sign up first)
node scripts/add-admin-user.js user@example.com

# The script will:
# 1. Check if user exists in authentication system
# 2. Create or update their profile with admin role
# 3. Verify the changes
```

### Current Admin Users
- `btimofeyev@gmail.com` (primary admin)
- `gamedesknews@gmail.com` (secondary admin)

### Admin Features
- Access to `/dashboard` - Admin overview with analytics
- Access to `/dashboard/orders` - Order management 
- Access to `/dashboard/menu` - Product/menu management
- Access to `/dashboard/analytics` - Business analytics
- Real-time order updates and management

## 🛠️ Troubleshooting

### Quick Fixes
- **Loading Issues**: Clear browser data or use incognito mode
- **Auth Problems**: Check environment variables in `.env.local`
- **Build Errors**: Run `npm run typecheck` then `npm run build`
- **Missing Data**: Verify Supabase connection and database migrations

### Common Solutions
```bash
# Restart development server
pkill -f "next dev" && rm -rf .next && npm run dev

# Reset dependencies
rm -rf node_modules package-lock.json && npm install

# Test Supabase connection
curl https://your-project.supabase.co/rest/v1/
```

### Supabase Configuration
- **Site URL**: `http://localhost:3000`
- **Redirect URLs**: `http://localhost:3000/auth/callback`
- **RLS**: Ensure proper Row Level Security policies
- **Admin Emails**: 
  - `btimofeyev@gmail.com` (primary admin)
  - `gamedesknews@gmail.com` (secondary admin)