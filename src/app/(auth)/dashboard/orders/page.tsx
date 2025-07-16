'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { MainLayout, PageHeader } from '@/components/layout/main-layout'
import { 
  Card, 
  CardContent, 
  Badge, 
  Button, 
  LoadingSpinner, 
  EmptyState 
} from '@/components/ui'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { useRealtimeOrders } from '@/hooks/use-realtime-orders'
import type { OrderStatus, OrderWithItems } from '@/types'
import { 
  ShoppingBag, 
  AlertCircle, 
  Clock, 
  ChefHat, 
  Package, 
  CheckCircle 
} from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function AdminOrdersPage() {
  const { isAdmin, loading: authLoading, profile } = useAuth()
  const { orders, loading, refetch } = useRealtimeOrders(true)
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)

  // Show loading while auth or profile is still loading
  if (authLoading || !profile) {
    return (
      <MainLayout isAdmin>
        <PageHeader title="Orders" />
        <div className="p-4 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    )
  }

  // Only show access denied after profile is loaded and user is not admin
  if (!isAdmin) {
    return (
      <MainLayout>
        <div className="p-4 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don&apos;t have permission to access this page.</p>
        </div>
      </MainLayout>
    )
  }


  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrder(orderId)
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update order status')
      }

      toast.success('Order status updated')
      refetch() // Refresh orders
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Failed to update order status')
    } finally {
      setUpdatingOrder(null)
    }
  }

  const updatePaymentStatus = async (orderId: string, paymentStatus: 'pending' | 'paid') => {
    setUpdatingOrder(orderId)
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: paymentStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update payment status')
      }

      toast.success(`Payment marked as ${paymentStatus}`)
      refetch() // Refresh orders
    } catch (error) {
      console.error('Error updating payment:', error)
      toast.error('Failed to update payment status')
    } finally {
      setUpdatingOrder(null)
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

  const getNextStatus = (currentStatus: string): OrderStatus | null => {
    switch (currentStatus) {
      case 'pending': return 'confirmed'
      case 'confirmed': return 'baking'
      case 'baking': return 'ready'
      case 'ready': return 'completed'
      default: return null
    }
  }

  if (authLoading || loading) {
    return (
      <MainLayout isAdmin>
        <PageHeader title="Orders" />
        <div className="p-4 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout isAdmin>
      <PageHeader 
        title="Orders" 
        description="Manage customer orders"
      />

      <div className="p-4">
        {orders.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No orders yet"
            description="Orders will appear here when customers place them"
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order: OrderWithItems) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{order.order_number}</h3>
                        {order.profile?.name && (
                          <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm font-medium">
                            {order.profile.name}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.created_at ? formatDateTime(order.created_at) : 'Unknown date'}
                      </p>
                      {order.profile && (
                        <div className="mt-1">
                          <p className="text-sm text-muted-foreground">
                            📧 {order.profile.email}
                          </p>
                          {order.profile.phone && (
                            <p className="text-sm text-muted-foreground">
                              📞 {order.profile.phone}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(order.status!) as 'warning' | 'info' | 'success' | 'default' | 'destructive'} className="flex items-center gap-1">
                        {getStatusIcon(order.status!)}
                        {order.status}
                      </Badge>
                      <Badge variant={order.payment_status === 'paid' ? 'success' : 'warning'}>
                        {order.payment_status}
                      </Badge>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Items:</h4>
                    <div className="space-y-1">
                      {order.order_items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.product?.name}</span>
                          <span>{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-semibold ml-2">{formatCurrency(order.total)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Profit:</span>
                      <span className="font-semibold ml-2">{formatCurrency(order.profit)}</span>
                    </div>
                    {order.pickup_date && (
                      <div>
                        <span className="text-muted-foreground">Pickup:</span>
                        <span className="ml-2">
                          {new Date(order.pickup_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Method:</span>
                      <span className="ml-2 capitalize">{order.delivery_method}</span>
                    </div>
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <div className="mb-4">
                      <span className="text-muted-foreground text-sm">Notes:</span>
                      <p className="text-sm">{order.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {getNextStatus(order.status!) && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, getNextStatus(order.status!)!)}
                        loading={updatingOrder === order.id}
                        disabled={updatingOrder === order.id}
                      >
                        Mark as {getNextStatus(order.status!)}
                      </Button>
                    )}
                    
                    {/* Payment Status Actions */}
                    {order.payment_status === 'pending' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => updatePaymentStatus(order.id, 'paid')}
                        loading={updatingOrder === order.id}
                        disabled={updatingOrder === order.id}
                      >
                        Mark Paid
                      </Button>
                    )}
                    {order.payment_status === 'paid' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updatePaymentStatus(order.id, 'pending')}
                        loading={updatingOrder === order.id}
                        disabled={updatingOrder === order.id}
                      >
                        Mark Unpaid
                      </Button>
                    )}
                    
                    {order.status !== 'cancelled' && order.status !== 'completed' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        loading={updatingOrder === order.id}
                        disabled={updatingOrder === order.id}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}