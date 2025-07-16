'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MainLayout, PageHeader } from '@/components/layout/main-layout'
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/components/ui'
import { useCartStore } from '@/stores/cart-store'
import { useAuth } from '@/contexts/auth-context'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { ShoppingBag, Calendar, MapPin, MessageSquare } from 'lucide-react'

const checkoutSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  pickup_date: z.string().min(1, 'Please select a pickup date'),
  delivery_method: z.enum(['pickup', 'delivery']),
  notes: z.string().optional(),
})

type CheckoutForm = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCartStore()
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: profile?.name || '',
      phone: profile?.phone || '',
      delivery_method: 'pickup',
      notes: '',
    },
  })

  // Handle client-side mounting and cart check
  useEffect(() => {
    setMounted(true)
    
    // Redirect if cart is empty (only after mounting)
    if (items.length === 0) {
      router.push('/menu')
    }
  }, [items.length, router])

  // Don't render until mounted (prevents hydration mismatch)
  if (!mounted) {
    return (
      <MainLayout showNavigation={false}>
        <PageHeader title="Checkout" description="Loading..." />
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted rounded-lg"></div>
            <div className="h-64 bg-muted rounded-lg"></div>
          </div>
        </div>
      </MainLayout>
    )
  }

  // Show loading if cart is empty (being redirected)
  if (items.length === 0) {
    return (
      <MainLayout showNavigation={false}>
        <PageHeader title="Checkout" description="Redirecting..." />
        <div className="p-4 text-center">
          <p>Cart is empty, redirecting to menu...</p>
        </div>
      </MainLayout>
    )
  }

  const onSubmit = async (data: CheckoutForm) => {
    if (!user) {
      toast.error('Please sign in to place an order')
      router.push('/auth/login')
      return
    }

    setLoading(true)

    try {
      // Calculate totals
      const total = getTotalPrice()
      const cost = items.reduce((sum, item) => sum + (item.product.cost * item.quantity), 0)
      const profit = total - cost

      // Create order (store customer info in notes for now)
      const customerInfo = `Customer: ${data.name}\nPhone: ${data.phone}\n${data.notes ? `\nNotes: ${data.notes}` : ''}`
      
      // Create order using API endpoint to handle RLS properly
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          status: 'pending',
          payment_status: 'pending',
          total,
          cost,
          profit,
          pickup_date: data.pickup_date,
          delivery_method: data.delivery_method,
          notes: customerInfo,
          items: items.map(item => ({
            product: item.product,
            quantity: item.quantity,
          })),
        }),
      })

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json()
        throw new Error(errorData.error || 'Failed to create order')
      }

      const { order } = await orderResponse.json()

      // Skip profile update for now due to RLS policy issue
      // TODO: Fix profiles RLS policy and re-enable profile updates
      
      // Clear cart and redirect to order confirmation
      clearCart()
      toast.success('Order placed successfully! Payment can be made via CashApp, Venmo, or cash on pickup.')
      
      // Redirect directly to order page (skip Stripe for now)
      router.push(`/orders/${order.id}`)

    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 2) // 2 days from now
  const minDateString = minDate.toISOString().split('T')[0]

  return (
    <MainLayout showNavigation={false}>
      <PageHeader title="Checkout" description="Complete your order" />

      <div className="p-4 space-y-6">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{item.product.name}</span>
                    <span className="text-muted-foreground ml-2">x{item.quantity}</span>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
              <div className="border-t pt-3 flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(getTotalPrice())}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checkout Form */}
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                {...form.register('name')}
                error={form.formState.errors.name?.message}
                disabled={loading}
              />

              <Input
                label="Phone Number"
                {...form.register('phone')}
                error={form.formState.errors.phone?.message}
                disabled={loading}
              />

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Pickup Date
                </label>
                <Input
                  type="date"
                  {...form.register('pickup_date')}
                  min={minDateString}
                  error={form.formState.errors.pickup_date?.message}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Orders require at least 48 hours notice
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <MapPin className="h-4 w-4 inline mr-2" />
                  Delivery Method
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      {...form.register('delivery_method')}
                      value="pickup"
                      disabled={loading}
                    />
                    <span>Pickup (Free)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      {...form.register('delivery_method')}
                      value="delivery"
                      disabled={loading}
                    />
                    <span>Delivery (Contact for availability)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <MessageSquare className="h-4 w-4 inline mr-2" />
                  Special Instructions (Optional)
                </label>
                <textarea
                  {...form.register('notes')}
                  className="w-full p-3 border rounded-xl resize-none h-20"
                  placeholder="Any special requests or notes..."
                  disabled={loading}
                />
              </div>

              <div className="pt-4 space-y-3">
                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading}
                  size="lg"
                  className="w-full"
                >
                  Place Order
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                  className="w-full"
                >
                  Back to Cart
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}