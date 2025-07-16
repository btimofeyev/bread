# Artisan Sourdough Web App
## Product Requirements Document (PRD) & Execution Plan

---

## 📋 Executive Summary

**Product Vision**: A streamlined, iOS-styled web application that enables customers to easily order artisan sourdough products while providing the baker with efficient order management and payment processing through Stripe.

**Core Problem**: Manual order management through text messages and paper forms creates inefficiency, payment confusion, and missed orders.

**Solution**: A beautiful, intuitive web app that automates ordering, payments, and order tracking while maintaining the personal touch of artisan baking.

---

## 🎯 Product Goals & Success Metrics

### Primary Goals
1. **Reduce order management time** by 80%
2. **Increase order accuracy** to 99%+
3. **Automate payment collection** with Stripe
4. **Improve customer experience** with self-service ordering

### Success Metrics
- **Order Volume**: 25% increase in weekly orders within 3 months
- **Payment Collection**: 95% of orders paid before pickup
- **Customer Satisfaction**: 4.8+ star rating
- **Time Savings**: 10+ hours/week saved on order management
- **Revenue Growth**: 30% increase in monthly revenue

---

## 👥 Target Users

### Primary Users
**Customers** (Age 25-55, health-conscious, values artisan products)
- Busy professionals who want fresh bread
- Health-conscious families seeking organic options
- Food enthusiasts who appreciate craft products

**Baker/Owner** (Solo entrepreneur)
- Needs efficient order management
- Wants to focus on baking, not admin
- Requires clear financial tracking

### User Personas

**"Busy Professional Sarah"**
- 32, marketing manager, Moses Lake
- Values convenience and quality
- Orders weekly for family
- Prefers mobile ordering

**"Artisan Baker Tim"**
- Business owner, focused on craft
- Wants simple tools that work
- Needs clear order tracking
- Values customer relationships

---

## ✨ Core Features & User Stories

### MVP Features (Phase 1)

#### Customer Features
```
AS A customer
I WANT TO browse available breads with photos and descriptions
SO THAT I can make informed choices

AS A customer  
I WANT TO add items to cart and see total pricing
SO THAT I can plan my order budget

AS A customer
I WANT TO pay securely with Stripe payment links
SO THAT I don't have to handle cash or remember to Venmo

AS A customer
I WANT TO receive order confirmations and pickup notifications
SO THAT I know when my bread is ready

AS A customer
I WANT TO specify pickup preferences and special requests
SO THAT my order meets my needs
```

#### Baker Dashboard Features
```
AS A baker
I WANT TO see all orders in one place with status tracking
SO THAT I can manage my baking schedule efficiently

AS A baker
I WANT TO update order statuses (pending → baking → ready)
SO THAT customers know when to pick up

AS A baker
I WANT TO see payment status for each order
SO THAT I know which orders are paid

AS A baker
I WANT TO manage menu availability in real-time
SO THAT customers only order what I can make

AS A baker
I WANT TO see profit margins and financial summaries
SO THAT I can track business performance
```

### Future Features (Phase 2)
- SMS notifications via Twilio
- Subscription orders (weekly bread delivery)
- Customer loyalty program
- Advanced analytics and reporting
- Mobile app (PWA)

---

## 🎨 Design Requirements

### iOS Design Language
**Visual Style**: Clean, minimalist, Apple-inspired aesthetics
- **Typography**: SF Pro Display/Text (or similar web fonts)
- **Color Palette**: Warm, natural tones with high contrast
- **Spacing**: Generous whitespace, 8px grid system
- **Animations**: Smooth, purposeful micro-interactions
- **Components**: Rounded corners, subtle shadows, glass morphism

### Key Design Principles
1. **Simplicity**: Every screen has one primary action
2. **Clarity**: Clear typography and visual hierarchy
3. **Consistency**: Uniform patterns across all screens
4. **Accessibility**: WCAG 2.1 AA compliance
5. **Mobile-First**: Responsive design that works on all devices

### UI Components
- **Cards**: Product cards, order cards with subtle shadows
- **Buttons**: Rounded, gradient backgrounds, clear CTAs
- **Forms**: Clean inputs with floating labels
- **Navigation**: Tab-based navigation with icons
- **Modals**: Smooth slide-up animations for cart/details

---

## 🏗️ Technical Architecture

### Frontend Stack
```javascript
// Core Technologies
- React 18 with TypeScript
- Next.js 14 (App Router)
- Tailwind CSS for styling
- Framer Motion for animations
- React Hook Form for form handling
- Zustand for state management

// Key Libraries
- @stripe/stripe-js for payment integration
- date-fns for date handling
- react-hot-toast for notifications
- lucide-react for icons
```

### Backend Stack
```javascript
// Core Technologies
- Supabase (Database + Auth + Real-time)
- Next.js API Routes (Serverless functions)
- TypeScript
- Stripe API for payments
- Supabase Edge Functions for webhooks

// Key Libraries
- @supabase/supabase-js for database/auth
- @supabase/auth-helpers-nextjs for Next.js integration
- zod for validation
- stripe for payment processing
- @supabase/auth-ui-react for auth components
```

### Supabase Database Schema
```sql
-- Authentication handled by Supabase Auth
-- Custom profiles table extending auth.users
CREATE TABLE profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  name text,
  phone text,
  role text default 'customer' check (role in ('customer', 'admin')),
  address text,
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now())
);

-- Products table
CREATE TABLE products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price decimal(10,2) not null,
  cost decimal(10,2) not null,
  category text not null,
  available boolean default true,
  image_url text,
  lead_time_hours integer default 48,
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now())
);

-- Orders table
CREATE TABLE orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  order_number text unique not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'baking', 'ready', 'completed', 'cancelled')),
  payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  total decimal(10,2) not null,
  cost decimal(10,2) not null,
  profit decimal(10,2) not null,
  pickup_date date,
  delivery_method text,
  notes text,
  stripe_payment_link_id text,
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now())
);

-- Order items table
CREATE TABLE order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  quantity integer not null,
  price decimal(10,2) not null,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Customer favorites for quick reordering
CREATE TABLE customer_favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc', now()),
  unique(user_id, product_id)
);

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_favorites ENABLE ROW LEVEL SECURITY;

-- Customers can only see their own data
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin can see everything
CREATE POLICY "Admin full access orders" ON orders FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Products are public for reading, admin only for modifications
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Admin can modify products" ON products FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Indexes for performance
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_pickup_date ON orders(pickup_date);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
```

### Architecture Diagram
```
Frontend (Next.js)
    ↓ Direct connection
Supabase (Database + Auth + Real-time)
    ↓ Webhooks
Stripe API (Payments)
    ↓ Edge Functions
Supabase Edge Functions (Webhook handlers)
```

---

## 💳 Stripe Integration Strategy

### Payment Flow
1. **Customer completes order** → Generate Stripe payment link
2. **Stripe payment link sent** → Customer pays securely
3. **Webhook confirms payment** → Order status updated to "paid"
4. **Baker notification** → Order ready for fulfillment

### Stripe Implementation
```javascript
// Create payment link for order
const paymentLink = await stripe.paymentLinks.create({
  line_items: orderItems.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: { name: item.name },
      unit_amount: item.price * 100,
    },
    quantity: item.quantity,
  })),
  metadata: { orderId: order.id },
  after_completion: {
    type: 'redirect',
    redirect: { url: `${process.env.FRONTEND_URL}/order-success` }
  }
});

// Webhook handler for payment confirmation
app.post('/webhook/stripe', (req, res) => {
  const event = stripe.webhooks.constructEvent(req.body, signature, secret);
  
  if (event.type === 'checkout.session.completed') {
    const orderId = event.data.object.metadata.orderId;
    updateOrderPaymentStatus(orderId, 'paid');
    sendOrderConfirmation(orderId);
  }
});
```

---

## 📱 User Experience Flow

### Customer Journey
```
1. Landing Page
   ↓
2. Browse Menu (filtered by category)
   ↓
3. Add Items to Cart
   ↓
4. Checkout Form (name, phone, pickup preferences)
   ↓
5. Stripe Payment Link
   ↓
6. Payment Confirmation
   ↓
7. Order Tracking Page
   ↓
8. Pickup Notification
```

### Baker Workflow
```
1. Dashboard Overview
   ↓
2. Review New Orders
   ↓
3. Update Order Status (confirmed → baking → ready)
   ↓
4. Manage Menu Availability
   ↓
5. Track Daily/Weekly Performance
```

---

## 🚀 Implementation Timeline

### Phase 1: MVP (6-8 weeks)

### Week 1-2: Supabase Setup & Authentication
- [ ] Supabase project setup and configuration
- [ ] Database schema creation with RLS policies
- [ ] Supabase Auth integration (email, Google, Apple)
- [ ] Admin role assignment and protection
- [ ] Basic API functions using Supabase client
- [ ] Stripe integration with Edge Functions

#### Week 3-4: Frontend Core Features
- [ ] iOS-styled design system with auth components
- [ ] Product catalog with real-time availability
- [ ] Shopping cart with favorites system
- [ ] User profile management
- [ ] Order history and quick reorder functionality
- [ ] Stripe payment integration

#### Week 5-6: Admin Dashboard & Real-time Features
- [ ] Admin dashboard with role-based access
- [ ] Real-time order management with Supabase subscriptions
- [ ] Status update system with customer notifications
- [ ] Menu management interface
- [ ] Customer analytics and order patterns
- [ ] Financial tracking with profit calculations

#### Week 7-8: Polish & Advanced Features
- [ ] Real-time notifications for both users and admin
- [ ] Advanced order filtering and search
- [ ] Export functionality for order data
- [ ] Performance optimization and caching
- [ ] User testing and feedback implementation
- [ ] Production deployment with Vercel + Supabase

### Phase 2: Enhancements (4-6 weeks)
- [ ] SMS notifications integration
- [ ] Advanced analytics dashboard
- [ ] Customer order history
- [ ] Subscription/recurring orders
- [ ] Mobile PWA features

---

## 🔧 Development Setup

### Prerequisites
```bash
# Required software
Node.js 18+
PostgreSQL 14+
Git
Stripe CLI (for webhook testing)
```

### Project Structure
```
artisan-sourdough/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── (auth)/            # Auth-protected routes
│   │   │   ├── dashboard/     # Admin dashboard
│   │   │   ├── orders/        # Customer order history
│   │   │   └── profile/       # User profile
│   │   ├── auth/              # Auth pages (login/signup)
│   │   ├── menu/              # Public menu pages
│   │   └── api/               # API routes (minimal with Supabase)
│   ├── components/            # Reusable UI components
│   │   ├── auth/             # Auth-related components
│   │   ├── admin/            # Admin dashboard components
│   │   ├── ui/               # Base UI components (iOS-styled)
│   │   └── layout/           # Layout components
│   ├── lib/                  # Utilities and configurations
│   │   ├── supabase/         # Supabase client and helpers
│   │   ├── stripe/           # Stripe integration
│   │   └── utils/            # Helper functions
│   ├── hooks/                # Custom React hooks
│   ├── types/                # TypeScript definitions
│   └── stores/               # Zustand stores for state management
├── supabase/                 # Supabase configuration
│   ├── migrations/           # Database migrations
│   ├── functions/            # Edge functions
│   └── config.toml           # Supabase config
├── public/                   # Static assets
└── package.json
```

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 🎯 MVP Scope Definition

### Included in MVP
✅ **Customer authentication system** (Supabase Auth)
✅ **Customer ordering system** with favorites and history
✅ **Quick reorder functionality**
✅ **Real-time order tracking**
✅ **Stripe payment processing**
✅ **Admin dashboard** with role-based access
✅ **Real-time order management**
✅ **Menu management with live updates**
✅ **Customer analytics and insights**
✅ **Mobile-responsive iOS design**
✅ **Email notifications** (via Supabase)

### Excluded from MVP (Phase 2)
❌ SMS notifications (Twilio integration)
❌ Push notifications
❌ Subscription/recurring orders
❌ Advanced inventory management
❌ Multi-location support
❌ Customer loyalty/points system
❌ Advanced reporting/exports
❌ Third-party integrations (calendar, etc.)
❌ Mobile app (PWA in Phase 2)

---

## 🔒 Security & Compliance

### Security Measures
- **API Rate Limiting**: Prevent abuse
- **Input Validation**: Joi schema validation
- **SQL Injection Protection**: Prisma ORM
- **HTTPS Enforcement**: SSL certificates
- **Environment Variables**: Secure credential storage
- **CORS Configuration**: Restrict cross-origin requests

### Data Privacy
- **Minimal Data Collection**: Only order-necessary information
- **Secure Payment Processing**: Stripe handles all card data
- **Data Retention Policy**: Delete old orders after 1 year
- **User Consent**: Clear privacy policy

---

## 📊 Analytics & Monitoring

### Key Metrics to Track
- **Order Conversion Rate**: Visitors → Orders
- **Average Order Value**: Revenue per order
- **Payment Success Rate**: Successful payments / total attempts
- **Customer Retention**: Repeat customer percentage
- **Popular Products**: Best-selling items
- **Peak Order Times**: Busiest ordering periods

### Monitoring Tools
- **Application Performance**: Vercel Analytics
- **Error Tracking**: Sentry
- **Payment Monitoring**: Stripe Dashboard
- **Database Performance**: PostgreSQL logs
- **User Behavior**: Simple analytics (no tracking)

---

## 🚀 Launch Strategy

### Pre-Launch (2 weeks before)
1. **Beta Testing**: 10 close customers test the system
2. **Baker Training**: Familiarize with dashboard features
3. **Content Creation**: Product photos and descriptions
4. **Payment Testing**: Verify Stripe integration works
5. **Performance Testing**: Load testing with expected traffic

### Launch Week
1. **Soft Launch**: Announce to existing customer base
2. **Social Media**: Instagram/Facebook posts with photos
3. **Local Marketing**: Word-of-mouth in Moses Lake community
4. **Customer Support**: Monitor for issues and feedback
5. **Analytics Review**: Track early adoption metrics

### Post-Launch (First Month)
1. **Daily Monitoring**: Check for errors and user feedback
2. **Customer Interviews**: Understand user experience
3. **Performance Optimization**: Address any slow loading
4. **Feature Prioritization**: Plan Phase 2 based on feedback
5. **Success Measurement**: Evaluate against initial goals

---

## 💰 Cost Estimate

### Development Costs
- **Frontend Development**: 120 hours × $75 = $9,000
- **Backend Development**: 80 hours × $75 = $6,000
- **Design & UX**: 40 hours × $60 = $2,400
- **Testing & QA**: 20 hours × $50 = $1,000
- **Project Management**: 20 hours × $60 = $1,200
- **Total Development**: **$19,600**

### Ongoing Costs (Monthly)
- **Hosting (Vercel)**: $20/month (Pro plan for better performance)
- **Supabase**: $25/month (Pro plan for auth + database + edge functions)
- **Stripe Processing**: 2.9% + $0.30 per transaction
- **Domain & SSL**: $2/month
- **Total Monthly**: **~$47/month + transaction fees**

### Break-Even Analysis
- **Average Order Value**: $15
- **Stripe Fee per Order**: $0.74
- **Monthly Fixed Costs**: $47
- **Break-even Orders**: ~4 orders/month (very achievable)

### Cost Comparison vs Current System
- **Current**: Paper forms + manual tracking + payment chasing = ~10 hours/week
- **New System**: Automated everything = ~1 hour/week
- **Time Savings Value**: 9 hours/week × $25/hour = $225/week = $900/month
- **ROI**: $900 saved - $47 costs = $853/month net benefit

---

## 🔄 Maintenance & Support

### Regular Maintenance
- **Weekly**: Review order data and customer feedback
- **Monthly**: Update menu items and pricing
- **Quarterly**: Performance optimization and security updates
- **Annually**: Feature planning and major updates

### Support Strategy
- **Customer Support**: Email support with 24-hour response
- **Technical Issues**: Monitor error logs and fix promptly
- **Payment Issues**: Direct line to resolve Stripe problems
- **Feature Requests**: Quarterly review and prioritization

---

## 📈 Success Measurement

### 30-Day Goals
- [ ] 50+ orders processed through the system
- [ ] 95%+ payment success rate
- [ ] 4.5+ customer satisfaction rating
- [ ] 80% reduction in manual order management time

### 90-Day Goals
- [ ] 200+ total orders
- [ ] 25% increase in weekly order volume
- [ ] 98% order accuracy rate
- [ ] Customer retention rate of 60%+

### 6-Month Goals
- [ ] 500+ total orders
- [ ] Break-even on development costs
- [ ] 30% increase in monthly revenue
- [ ] Phase 2 features planned and prioritized

---

## ✅ Next Steps

### Immediate Actions (This Week)
1. **Approve PRD**: Finalize requirements and scope
2. **Set up Development Environment**: Install tools and dependencies
3. **Create Stripe Account**: Set up payment processing
4. **Design Wireframes**: Create basic UI mockups
5. **Initialize Repositories**: Set up GitHub projects

### Week 1 Actions
1. **Backend Setup**: Express server and database
2. **Stripe Integration**: Payment link creation
3. **Basic API Endpoints**: Products and orders
4. **Frontend Setup**: Next.js with Tailwind CSS
5. **Design System**: Create reusable components

---

## 📞 Contact & Resources

### Key Stakeholders
- **Product Owner**: Baker/Business Owner
- **Lead Developer**: [To be assigned]
- **Designer**: [To be assigned]

### Technical Resources
- **Stripe Documentation**: https://stripe.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **Prisma Documentation**: https://www.prisma.io/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

---

*This PRD serves as the foundation for building a successful artisan sourdough ordering system. Regular reviews and updates will ensure the product meets evolving business needs and customer expectations.*