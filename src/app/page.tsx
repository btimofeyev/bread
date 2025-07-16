'use client'

import { useAuth } from '@/contexts/auth-context'
import { useCartStore } from '@/stores/cart-store'
import { Button } from '@/components/ui'
import { NoSSR } from '@/components/no-ssr'
import { MainLayout, Container, SectionHeader } from '@/components/layout/main-layout'
import { ProductCard } from '@/components/products/product-card'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { 
  ShoppingCart, 
  Wheat, 
  Clock, 
  Heart, 
  ArrowRight,
  Sparkles,
  Package,
  X
} from 'lucide-react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useCustomerOrders } from '@/hooks/use-customer-orders'
import type { Product } from '@/types'

export default function Home() {
  const { user, loading, isAdmin } = useAuth()
  const { orders } = useCustomerOrders(user?.id)
  const { getTotalItems } = useCartStore()
  const router = useRouter()
  const cartItems = getTotalItems()
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [dismissedNotifications, setDismissedNotifications] = useState<string[]>([])

  // Get orders ready for pickup
  const readyOrders = orders.filter(order => 
    order.status === 'ready' && !dismissedNotifications.includes(order.id)
  )

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('available', true)
          .limit(3)
          .order('created_at', { ascending: false })

        if (error) throw error
        setFeaturedProducts(data || [])
      } catch (error) {
        console.error('Error fetching featured products:', error)
      } finally {
        setProductsLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  // Handle loading state with beautiful skeleton
  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen">
          {/* Hero Skeleton */}
          <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-artisan" />
            <Container className="relative z-10">
              <div className="text-center max-w-4xl mx-auto">
                <div className="animate-pulse space-y-6">
                  <div className="h-16 w-96 bg-white/20 rounded-2xl mx-auto"></div>
                  <div className="h-8 w-80 bg-white/15 rounded-xl mx-auto"></div>
                  <div className="flex gap-4 justify-center">
                    <div className="h-14 w-36 bg-white/20 rounded-2xl"></div>
                    <div className="h-14 w-36 bg-white/15 rounded-2xl"></div>
                  </div>
                </div>
              </div>
            </Container>
          </section>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout isAdmin={isAdmin}>
      <div className="min-h-screen">
        {/* Order Ready Notification */}
        {readyOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white p-4 shadow-lg"
          >
            <Container>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5" />
                  <div>
                    <p className="font-semibold">
                      {readyOrders.length === 1 
                        ? 'Your order is ready for pickup!' 
                        : `${readyOrders.length} orders are ready for pickup!`
                      }
                    </p>
                    <p className="text-sm opacity-90">
                      {readyOrders.map(order => `Order #${order.order_number}`).join(', ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/profile?tab=orders')}
                    className="text-green-600 border-white/30 hover:bg-white/10"
                  >
                    View Orders
                  </Button>
                  <button
                    onClick={() => setDismissedNotifications(prev => [
                      ...prev, 
                      ...readyOrders.map(order => order.id)
                    ])}
                    className="p-1 hover:bg-white/10 rounded"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Container>
          </motion.div>
        )}
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Background with subtle pattern */}
          <div className="absolute inset-0 bg-gradient-artisan" />
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-[url('/bread-pattern.svg')] bg-repeat opacity-10" />
          </div>
          
          {/* Floating elements */}
          <motion.div
            animate={{ y: [-20, 20, -20] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-10 opacity-20"
          >
            <Wheat className="h-16 w-16 text-wheat-600" />
          </motion.div>
          
          <motion.div
            animate={{ y: [20, -20, 20] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-32 right-16 opacity-20"
          >
            <Sparkles className="h-12 w-12 text-sourdough-600" />
          </motion.div>

          <Container className="relative z-10">
            <div className="text-center max-w-5xl mx-auto">
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
                className="mb-8"
              >
                
                <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
                  <span className="block text-gradient-artisan">Artisan</span>
                  <span className="block text-wheat-800 dark:text-wheat-200">Sourdough</span>
                </h1>
              </motion.div>

              <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-xl sm:text-2xl text-wheat-700 dark:text-wheat-300 mb-12 max-w-3xl mx-auto leading-relaxed"
              >
                Experience the authentic taste of traditional sourdough bread, 
                baked fresh daily using time-honored methods and the finest organic ingredients.
              </motion.p>

              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="flex gap-4 justify-center flex-wrap mb-16"
              >
                <Button
                  size="lg"
                  onClick={() => router.push('/menu')}
                  className="bg-gradient-to-r from-wheat-700 to-crust-700 hover:from-wheat-800 hover:to-crust-800 text-white px-8 py-4 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 h-auto"
                >
                  <Wheat className="h-5 w-5 mr-2" />
                  Explore Menu
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                
                <NoSSR>
                  {cartItems > 0 && (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => router.push('/cart')}
                      className="border-wheat-600 text-wheat-700 hover:bg-wheat-50 dark:border-wheat-400 dark:text-wheat-300 dark:hover:bg-wheat-900/20 px-8 py-4 text-lg font-semibold rounded-2xl h-auto"
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Cart ({cartItems})
                    </Button>
                  )}
                </NoSSR>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-wheat-800 dark:text-wheat-200">48h</div>
                  <div className="text-sm text-muted-foreground">Fermentation Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-wheat-800 dark:text-wheat-200">100%</div>
                  <div className="text-sm text-muted-foreground">Organic Ingredients</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-wheat-800 dark:text-wheat-200">Daily</div>
                  <div className="text-sm text-muted-foreground">Fresh Baked</div>
                </div>
              </motion.div>
            </div>
          </Container>

          {/* Scroll indicator */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <div className="w-6 h-10 border-2 border-wheat-600/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-wheat-600/70 rounded-full mt-2" />
            </div>
          </motion.div>
        </section>

        {/* Featured Products Section */}
        {!productsLoading && featuredProducts.length > 0 && (
          <section className="py-20">
            <Container>
              <SectionHeader
                title="Featured Breads"
                description="Discover our most popular artisan sourdough creations"
                action={
                  <Button
                    variant="outline"
                    onClick={() => router.push('/menu')}
                    className="group"
                  >
                    View All
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                }
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 max-w-5xl mx-auto">
                {featuredProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                  />
                ))}
              </div>
            </Container>
          </section>
        )}

        {/* Features Section */}
        <section className="py-20 bg-gradient-wheat">
          <Container>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gradient-artisan mb-4">
                Why Choose Our Sourdough?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Every loaf tells a story of tradition, quality, and passion for authentic bread-making.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Clock,
                  title: "48-Hour Fermentation",
                  description: "Traditional slow fermentation process develops complex flavors and makes our bread easier to digest."
                },
                {
                  icon: Wheat,
                  title: "Organic Ingredients", 
                  description: "We use only the finest organic flour and natural ingredients, sourced from local farms when possible."
                },
                {
                  icon: Heart,
                  title: "Handcrafted Daily",
                  description: "Each loaf is shaped by hand and baked fresh daily using traditional artisan techniques."
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="text-center p-8 rounded-3xl glass-card group hover:scale-105 transition-transform duration-300"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-wheat-100 to-sourdough-100 dark:from-wheat-900/30 dark:to-sourdough-900/30 mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-8 w-8 text-wheat-700 dark:text-wheat-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-wheat-800 dark:text-wheat-200 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        {/* About Us Section */}
        <section className="py-20 bg-gradient-sourdough">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold text-gradient-artisan mb-6">
                  Our Story
                </h2>
                <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                  <p>
                    We&apos;re a small artisan bakery passionate about creating authentic sourdough bread 
                    using traditional methods. Our journey began with a simple starter and a desire 
                    to share the incredible flavor and health benefits of real sourdough.
                  </p>
                  <p>
                    Every loaf is handcrafted with care, using only organic ingredients and a 48-hour 
                    fermentation process that develops complex flavors and makes our bread naturally 
                    easier to digest.
                  </p>
                </div>
                
                <div className="mt-8 grid grid-cols-2 gap-6">
                  <div className="text-center p-4 rounded-2xl glass-card">
                    <div className="text-2xl font-bold text-wheat-800 dark:text-wheat-200">Small Batch</div>
                    <div className="text-sm text-muted-foreground">Artisan Crafted</div>
                  </div>
                  <div className="text-center p-4 rounded-2xl glass-card">
                    <div className="text-2xl font-bold text-wheat-800 dark:text-wheat-200">Local</div>
                    <div className="text-sm text-muted-foreground">Community Focused</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: 50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="relative rounded-3xl overflow-hidden artisan-shadow-lg">
                  <div className="aspect-[4/3] bg-gradient-to-br from-wheat-200 to-sourdough-200 dark:from-wheat-800 to-sourdough-800 flex items-center justify-center">
                    {/* Placeholder for bakery image */}
                    <div className="text-center">
                      <Wheat className="h-24 w-24 text-wheat-600 dark:text-wheat-400 mx-auto mb-4" />
                      <p className="text-wheat-700 dark:text-wheat-300 font-medium">
                        Artisan Craftsmanship
                      </p>
                    </div>
                  </div>
                  
                  {/* Floating stats */}
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                    viewport={{ once: true }}
                    className="absolute top-4 right-4 bg-white/90 dark:bg-crust-900/90 backdrop-blur-sm rounded-2xl p-4 border border-wheat-200/50 dark:border-crust-700/50"
                  >
                    <div className="text-center">
                      <div className="text-lg font-bold text-wheat-800 dark:text-wheat-200">48h</div>
                      <div className="text-xs text-muted-foreground">Fermentation</div>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: 0.7, type: "spring", stiffness: 300 }}
                    viewport={{ once: true }}
                    className="absolute bottom-4 left-4 bg-white/90 dark:bg-crust-900/90 backdrop-blur-sm rounded-2xl p-4 border border-wheat-200/50 dark:border-crust-700/50"
                  >
                    <div className="text-center">
                      <div className="text-lg font-bold text-wheat-800 dark:text-wheat-200">100%</div>
                      <div className="text-xs text-muted-foreground">Organic</div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </Container>
        </section>

        {/* Benefits Section */}
        <section className="py-20">
          <Container>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gradient-artisan mb-4">
                Health Benefits of Real Sourdough
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Traditional fermentation doesn&apos;t just create incredible flavor—it transforms bread 
                into a more nutritious and digestible food.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: "🌱",
                  title: "Easier to Digest",
                  description: "Fermentation breaks down gluten and phytic acid, making nutrients more bioavailable."
                },
                {
                  icon: "💪",
                  title: "Lower Glycemic Index",
                  description: "Slow fermentation reduces the bread's impact on blood sugar levels."
                },
                {
                  icon: "🦠",
                  title: "Probiotic Benefits",
                  description: "Natural fermentation supports gut health with beneficial bacteria."
                },
                {
                  icon: "⚡",
                  title: "Enhanced Nutrition",
                  description: "Fermentation increases the availability of vitamins and minerals."
                }
              ].map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="text-center p-6 rounded-3xl glass-card group hover:scale-105 transition-transform duration-300"
                >
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {benefit.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-wheat-800 dark:text-wheat-200 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        {/* Contact CTA Section */}
        <section className="py-20 bg-gradient-warm">
          <Container>
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto"
            >
              <h2 className="text-4xl font-bold text-gradient-artisan mb-6">
                Ready to Experience Real Sourdough?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Order fresh-baked artisan bread for pickup, or get in touch with any questions.
              </p>
              
              <div className="flex gap-4 justify-center flex-wrap">
                <Button
                  size="lg"
                  onClick={() => router.push('/menu')}
                  className="bg-gradient-to-r from-wheat-700 to-crust-700 hover:from-wheat-800 hover:to-crust-800 text-white px-8 py-4 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 h-auto"
                >
                  <Wheat className="h-5 w-5 mr-2" />
                  Order Now
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push('/contact')}
                  className="border-wheat-600 text-wheat-700 hover:bg-wheat-50 dark:border-wheat-400 dark:text-wheat-300 dark:hover:bg-wheat-900/20 px-8 py-4 text-lg font-semibold rounded-2xl h-auto"
                >
                  Contact Us
                </Button>
              </div>
            </motion.div>
          </Container>
        </section>

      </div>
    </MainLayout>
  )
}