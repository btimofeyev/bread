# Artisan Sourdough Web App

A beautiful, iOS-styled web application for ordering artisan sourdough bread with integrated Stripe payments and real-time order management.

## ✨ Features

### Customer Features
- **Browse Menu**: Beautiful product catalog with real organic sourdough products
- **Shopping Cart**: Persistent cart with quantity controls
- **Secure Checkout**: Order placement with customer details
- **Stripe Payments**: Secure payment processing with payment links
- **Order Tracking**: Real-time order status updates
- **User Profiles**: Account management and order history

### Admin Features
- **Dashboard**: Business metrics and analytics
- **Order Management**: Real-time order tracking and status updates
- **Menu Management**: Full CRUD operations for products
- **Real-time Updates**: Live data synchronization across all users

## 🍞 Real Menu Data

The application now features the authentic organic sourdough menu with:

### BREADS
- Traditional Loaf (LG) - $10
- Fresh Milled Traditional Loaf (Md-L) - $15
- French Loaves (2 CT) - $16
- Soft Dinner Rolls (12 CT) - $14
- Baguette (2 CT) - $16

### SWEET TREATS
- Cinnamon Rolls (6 CT) - $18
- Cinnamon Rolls (12 CT) - $32
- Seasonal Butter Braid (LG) - $25

### SANDWICH BREADS
- Plain Bagels (8-10 CT) - $12
- Dozen Bagels (12 CT) - $14.50
- Sandwich Loaf - $11
- Hamburger Buns (12 CT) - $13

## 🛠 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Supabase (Database + Auth + Real-time)
- **Payments**: Stripe API with payment links
- **State Management**: Zustand
- **UI Components**: Custom iOS-styled components
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Stripe account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd artisan-sourdough
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # Stripe
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...

   # App
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Set up Supabase database**
   - Create a new Supabase project
   - Run the migrations in `supabase/migrations/` in order:
     - `00001_initial_schema.sql`
     - `00002_rls_policies.sql`
     - `00003_seed_data.sql` (optional - placeholder data)
     - `00004_real_menu_data.sql` (recommended - real menu)

5. **Load real menu data**
   ```bash
   node scripts/update-menu.js
   ```

6. **Configure Stripe webhooks**
   - Set up webhook endpoint: `your-domain.com/api/webhook/stripe`
   - Enable events: `checkout.session.completed`, `payment_intent.payment_failed`

7. **Run the development server**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Protected routes
│   │   ├── dashboard/     # Admin dashboard
│   │   ├── orders/        # Customer orders
│   │   └── profile/       # User profile
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── checkout/          # Checkout flow
│   └── menu/              # Product catalog
├── components/            # React components
│   ├── auth/             # Auth components
│   ├── cart/             # Shopping cart
│   ├── layout/           # Layout components
│   ├── products/         # Product components
│   └── ui/               # Base UI components
├── contexts/             # React contexts
├── hooks/                # Custom hooks
├── lib/                  # Utilities
│   ├── supabase/         # Supabase client
│   └── stripe/           # Stripe configuration
├── stores/               # Zustand stores
├── types/                # TypeScript types
└── scripts/              # Utility scripts
    └── update-menu.js    # Real menu data loader
```

## 🎨 Design System

The application follows iOS design principles:

- **Typography**: System fonts with SF Pro fallbacks
- **Colors**: Warm, natural tones with high contrast
- **Spacing**: 8px grid system
- **Animations**: Smooth, purposeful micro-interactions
- **Components**: Rounded corners, subtle shadows, glass morphism

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Type checking
npm run format       # Format code with Prettier
node scripts/update-menu.js  # Load real menu data
```

### Menu Management

To update the menu with real data:
```bash
node scripts/update-menu.js
```

This script will:
- Clear existing placeholder products
- Load authentic organic sourdough menu items
- Set realistic pricing and profit margins
- Organize products into proper categories

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

Make sure to set all environment variables in your deployment platform:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_SITE_URL`

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Role-based access control (customer/admin)
- Secure API endpoints with authentication
- Input validation with Zod schemas
- CORS configuration
- Environment variable protection

## 📊 Features Overview

### MVP Features ✅

- **Authentication**: Email/password with Supabase Auth
- **Real Menu**: Authentic organic sourdough products
- **Product Catalog**: Real-time product browsing with categories
- **Shopping Cart**: Persistent cart with Zustand
- **Checkout**: Form validation and order creation
- **Payments**: Stripe payment links integration
- **Order Management**: Status tracking and updates
- **Admin Dashboard**: Business metrics and management
- **Real-time Updates**: Live data synchronization

### Menu Categories ✅

- **Breads**: Traditional loaves, French breads, dinner rolls, baguettes
- **Sweet Treats**: Cinnamon rolls, seasonal butter braids
- **Sandwich Breads**: Bagels, sandwich loaves, hamburger buns

### Future Enhancements

- Tallow products (coming soon on original menu)
- SMS notifications (Twilio)
- Advanced analytics and reporting
- Customer loyalty program
- Subscription orders
- Mobile PWA

## 🐛 Troubleshooting

### Common Issues

1. **Build errors**: Run `npm run typecheck` to identify type issues
2. **Supabase connection**: Verify environment variables and RLS policies
3. **Menu not loading**: Run `node scripts/update-menu.js` after env setup
4. **Stripe webhooks**: Check webhook URL and secret configuration
5. **Real-time not working**: Ensure Supabase subscriptions are properly set up

### Performance

- **Bundle size**: ~177KB first load JS
- **Lighthouse Score**: 90+ across all metrics
- **Real-time**: Optimized with Supabase subscriptions
- **Menu loading**: Fast category-based filtering

## 📞 Support

For issues and questions:

1. Check the troubleshooting section
2. Review environment variable setup
3. Verify database migrations are applied
4. Check Stripe webhook configuration
5. Ensure real menu data is loaded

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ using Next.js, Supabase, and Stripe.  
**Now featuring real organic sourdough menu data!** 🍞