'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { MainLayout, PageHeader } from '@/components/layout/main-layout'
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, LoadingSpinner } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import type { OrderWithItems } from '@/types'
import { CheckCircle, Clock, ChefHat, Package, CreditCard, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

function OrderDetailContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [order, setOrder] = useState<OrderWithItems | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const supabase = createClient()

  const orderId = params.id as string
  const paymentSuccess = searchParams.get('payment') === 'success'

  const fetchOrder = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (*)
          )
        `)
        .eq('id', orderId)
        .single()

      if (error) {
        console.error('Error fetching order:', error)
        toast.error('Order not found')
      } else {
        setOrder(data as OrderWithItems)
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      toast.error('Failed to load order')
    } finally {
      setLoading(false)
    }
  }, [orderId, supabase])

  useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  useEffect(() => {
    if (paymentSuccess && order) {
      toast.success('Payment successful! Your order has been confirmed.')
    }
  }, [paymentSuccess, order])

  const handlePayment = async () => {
    if (!order) return

    setPaymentLoading(true)
    try {
      const response = await fetch('/api/create-payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id })
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to create payment link')
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Failed to create payment link')
    } finally {
      setPaymentLoading(false)
    }
  }

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending':
        return { icon: Clock, variant: 'secondary' as const, label: 'Order Received' }
      case 'confirmed':
        return { icon: CheckCircle, variant: 'default' as const, label: 'Confirmed' }
      case 'baking':
        return { icon: ChefHat, variant: 'default' as const, label: 'Baking' }
      case 'ready':
        return { icon: Package, variant: 'success' as const, label: 'Ready for Pickup' }
      case 'completed':
        return { icon: CheckCircle, variant: 'success' as const, label: 'Completed' }
      case 'cancelled':
        return { icon: AlertCircle, variant: 'destructive' as const, label: 'Cancelled' }
      default:
        return { icon: Clock, variant: 'secondary' as const, label: status }
    }
  }

  const getPaymentStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending':
        return { icon: CreditCard, variant: 'secondary' as const, label: 'Payment Pending' }
      case 'completed':
        return { icon: CheckCircle, variant: 'success' as const, label: 'Paid' }
      case 'failed':
        return { icon: AlertCircle, variant: 'destructive' as const, label: 'Payment Failed' }
      default:
        return { icon: CreditCard, variant: 'secondary' as const, label: status }
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <PageHeader title="Order Details" />
        <div className="p-4 flex justify-center">
          <LoadingSpinner />
        </div>
      </MainLayout>
    )
  }

  if (!order) {
    return (
      <MainLayout>
        <PageHeader title="Order Not Found" />
        <div className="p-4">
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">This order could not be found.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.href = '/orders'}
              >
                View All Orders
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  const statusDisplay = getStatusDisplay(order.status || 'pending')
  const paymentDisplay = getPaymentStatusDisplay(order.payment_status || 'pending')
  const StatusIcon = statusDisplay.icon
  const PaymentIcon = paymentDisplay.icon

  return (
    <MainLayout>
      <PageHeader 
        title={`Order #${order.order_number}`}
        description={`Placed on ${formatDateTime(order.created_at)}`}
      />
      
      <div className="p-4 space-y-6">
        {/* Status Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Order Status</span>
                <StatusIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <Badge variant={statusDisplay.variant} className="mt-2">
                {statusDisplay.label}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Payment</span>
                <PaymentIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <Badge variant={paymentDisplay.variant} className="mt-2">
                {paymentDisplay.label}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.order_items?.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.product?.name || 'Unknown Product'}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} × {formatCurrency(item.price)}
                    </p>
                  </div>
                  <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center font-bold">
                  <span>Total</span>
                  <span className="text-lg">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Pickup Date</p>
              <p className="font-medium">
                {order.pickup_date ? new Date(order.pickup_date).toLocaleDateString() : 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Delivery Method</p>
              <p className="font-medium capitalize">{order.delivery_method}</p>
            </div>
            {order.notes && (
              <div>
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="font-medium">{order.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{order.customer_name || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{order.customer_email || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{order.customer_phone || 'Not provided'}</p>
            </div>
            {order.customer_address && (
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{order.customer_address}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Action */}
        {order.payment_status === 'pending' && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">
                  Complete your payment to confirm this order
                </p>
                <Button 
                  onClick={handlePayment}
                  loading={paymentLoading}
                  disabled={paymentLoading}
                  className="w-full"
                >
                  Pay Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={
      <MainLayout>
        <PageHeader title="Order Details" />
        <div className="p-4 flex justify-center">
          <LoadingSpinner />
        </div>
      </MainLayout>
    }>
      <OrderDetailContent />
    </Suspense>
  )
}