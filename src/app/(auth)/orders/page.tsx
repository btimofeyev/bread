'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { MainLayout, PageHeader } from '@/components/layout/main-layout'
import { Badge, Card, CardContent, OrderCardSkeleton, EmptyState } from '@/components/ui'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import type { OrderWithItems } from '@/types'
import { ShoppingBag } from 'lucide-react'

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    if (!user) return

    try {
      // Use API endpoint to fetch orders with proper RLS handling
      const response = await fetch(`/api/orders/list?user_id=${user.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }

      const { orders } = await response.json()
      setOrders(orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user, fetchOrders])

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

  if (loading) {
    return (
      <MainLayout>
        <PageHeader title="My Orders" />
        <div className="p-4 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <PageHeader title="My Orders" description="Track your bread orders" />
      
      <div className="p-4">
        {orders.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No orders yet"
            description="Start browsing our menu to place your first order"
            action={{
              label: "Browse Menu",
              onClick: () => window.location.href = '/menu'
            }}
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">{order.order_number}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(order.created_at!)}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(order.status!) as 'warning' | 'info' | 'success' | 'default' | 'destructive'}>
                      {order.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.quantity}x {item.product?.name}
                        </span>
                        <span>{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="font-semibold">Total</span>
                    <span className="font-semibold">{formatCurrency(order.total)}</span>
                  </div>
                  
                  {order.pickup_date && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Pickup: {new Date(order.pickup_date).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}