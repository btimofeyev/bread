'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { MainLayout, PageHeader } from '@/components/layout/main-layout'
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, LoadingSpinner } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import type { OrderWithItems } from '@/types'
import { CheckCircle, Clock, ChefHat, Package, CreditCard, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function OrderDetailPage() {
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
  }, [orderId])

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    }
  }, [orderId, fetchOrder])

  useEffect(() => {
    if (paymentSuccess) {
      toast.success('Payment successful! Your order has been confirmed.')
    }
  }, [paymentSuccess])

  const handlePayNow = async () => {
    if (!order) return

    setPaymentLoading(true)
    try {
      const response = await fetch('/api/create-payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      })

      const data = await response.json()

      if (response.ok) {
        window.location.href = data.paymentUrl
      } else {
        toast.error(data.error || 'Failed to create payment link')
      }
    } catch (error) {
      console.error('Error creating payment link:', error)
      toast.error('Failed to process payment')
    } finally {
      setPaymentLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'confirmed': return <CheckCircle className="h-4 w-4" />
      case 'baking': return <ChefHat className="h-4 w-4" />
      case 'ready': return <Package className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'cancelled': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'confirmed': return 'info'
      case 'baking': return 'info'
      case 'ready': return 'success'
      case 'completed': return 'default'
      case 'cancelled': return 'destructive'
      default: return 'default'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'paid': return 'success'
      case 'failed': return 'destructive'
      case 'refunded': return 'default'
      default: return 'default'
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <PageHeader title="Order Details" />
        <div className="p-4 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    )
  }

  if (!order) {
    return (
      <MainLayout>
        <PageHeader title="Order Not Found" />
        <div className="p-4 text-center">
          <p className="text-muted-foreground">This order could not be found.</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <PageHeader title={`Order ${order.order_number}`} />

      <div className="p-4 space-y-6">
        {/* Order Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Order Status</span>
              <Badge variant={getStatusColor(order.status!) as 'warning' | 'info' | 'success' | 'default' | 'destructive'} className="flex items-center gap-1">
                {getStatusIcon(order.status!)}
                {order.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Order Date</span>
                <p className="font-medium">{formatDateTime(order.created_at!)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Payment Status</span>
                <div className="flex items-center gap-2">
                  <Badge variant={getPaymentStatusColor(order.payment_status!) as 'warning' | 'info' | 'success' | 'default' | 'destructive'}>
                    {order.payment_status}
                  </Badge>
                </div>
              </div>
              {order.pickup_date && (
                <div>
                  <span className="text-muted-foreground">Pickup Date</span>
                  <p className="font-medium">
                    {new Date(order.pickup_date).toLocaleDateString()}
                  </p>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Delivery Method</span>
                <p className="font-medium capitalize">{order.delivery_method}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Action */}
        {order.payment_status === 'pending' && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <h3 className="font-medium">Payment Required</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete your payment to confirm this order
                  </p>
                </div>
                <Button 
                  onClick={handlePayNow}
                  loading={paymentLoading}
                  disabled={paymentLoading}
                >
                  Pay Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{item.product?.name}</span>
                    <span className="text-muted-foreground ml-2">x{item.quantity}</span>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
              <div className="border-t pt-3 flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {order.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Special Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{order.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}