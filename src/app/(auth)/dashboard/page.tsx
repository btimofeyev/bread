'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRealtimeOrders } from '@/hooks/use-realtime-orders'
import { MainLayout, PageHeader } from '@/components/layout/main-layout'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  LoadingSpinner,
  Button,
  Badge
} from '@/components/ui'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import type { OrderWithItems, OrderStatus } from '@/types'
import { 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  Package,
  ChefHat,
  Users,
  Calendar,
  Activity,
  Plus
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalProfit: number
  pendingOrders: number
  ordersToday: number
  revenueToday: number
  profitToday: number
  avgOrderValue: number
  profitMargin: number
  ordersThisWeek: number
  revenueThisWeek: number
  completedToday: number
  bakingOrders: number
  readyOrders: number
}

export default function AdminDashboardPage() {
  const { isAdmin, loading: authLoading, profile } = useAuth()
  const { orders, loading: ordersLoading, refetch } = useRealtimeOrders(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)

  useEffect(() => {
    if (orders && orders.length >= 0) {
      calculateStats(orders)
    }
  }, [orders])

  // Show loading while auth or profile is still loading
  if (authLoading || !profile) {
    return (
      <MainLayout isAdmin>
        <PageHeader title="Dashboard" />
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

  const calculateStats = (ordersList: OrderWithItems[]) => {
    const today = new Date().toISOString().split('T')[0]
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const totalOrders = ordersList.length
    const totalRevenue = ordersList.reduce((sum, order) => sum + order.total, 0)
    const totalProfit = ordersList.reduce((sum, order) => sum + order.profit, 0)
    
    const todaysOrders = ordersList.filter(order => 
      order.created_at?.startsWith(today)
    )
    const ordersToday = todaysOrders.length
    const revenueToday = todaysOrders.reduce((sum, order) => sum + order.total, 0)
    const profitToday = todaysOrders.reduce((sum, order) => sum + order.profit, 0)
    const completedToday = todaysOrders.filter(order => order.status === 'completed').length

    const thisWeekOrders = ordersList.filter(order => 
      order.created_at && order.created_at >= weekAgo
    )
    const ordersThisWeek = thisWeekOrders.length
    const revenueThisWeek = thisWeekOrders.reduce((sum, order) => sum + order.total, 0)

    const pendingOrders = ordersList.filter(order => order.status === 'pending').length
    const bakingOrders = ordersList.filter(order => order.status === 'baking').length
    const readyOrders = ordersList.filter(order => order.status === 'ready').length

    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

    setStats({
      totalOrders,
      totalRevenue,
      totalProfit,
      pendingOrders,
      ordersToday,
      revenueToday,
      profitToday,
      avgOrderValue,
      profitMargin,
      ordersThisWeek,
      revenueThisWeek,
      completedToday,
      bakingOrders,
      readyOrders
    })
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

      toast.success(`Order marked as ${newStatus}`)
      refetch()
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
      refetch()
    } catch (error) {
      console.error('Error updating payment:', error)
      toast.error('Failed to update payment status')
    } finally {
      setUpdatingOrder(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
      case 'confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'baking': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      case 'ready': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800'
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

  const recentOrders = orders
    .filter(order => order.status !== 'completed' && order.status !== 'cancelled')
    .sort((a, b) => {
      if (!a.created_at || !b.created_at) return 0
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    .slice(0, 5)


  if (ordersLoading && !stats) {
    return (
      <MainLayout isAdmin>
        <PageHeader title="Dashboard" />
        <div className="p-4 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout isAdmin>
      <PageHeader 
        title="Bakery Dashboard" 
        description={`Welcome back, ${profile.name || 'Baker'}! Here's your business overview.`}
      />

      <div className="p-4 space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Orders Today</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats?.ordersToday || 0}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    {stats?.completedToday || 0} completed
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">Revenue Today</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {formatCurrency(stats?.revenueToday || 0)}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Profit: {formatCurrency(stats?.profitToday || 0)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">Active Orders</p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                    {(stats?.pendingOrders || 0) + (stats?.bakingOrders || 0) + (stats?.readyOrders || 0)}
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    {stats?.bakingOrders || 0} baking, {stats?.readyOrders || 0} ready
                  </p>
                </div>
                <Activity className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Avg Order Value</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {formatCurrency(stats?.avgOrderValue || 0)}
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">
                    {stats?.profitMargin?.toFixed(1) || 0}% margin
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <ShoppingCart className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-xl font-bold">{stats?.totalOrders || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Total Profit</p>
              <p className="text-xl font-bold">{formatCurrency(stats?.totalProfit || 0)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">This Week</p>
              <p className="text-xl font-bold">{stats?.ordersThisWeek || 0}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders Management */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Active Orders ({recentOrders.length})
              </CardTitle>
              <Link href="/dashboard/orders">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentOrders.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No active orders</p>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{order.order_number}</span>
                        {order.profile?.name && (
                          <span className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            {order.profile.name}
                          </span>
                        )}
                        <Badge className={getStatusColor(order.status!)} variant="secondary">
                          {order.status}
                        </Badge>
                        {order.payment_status === 'paid' && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Paid
                          </Badge>
                        )}
                      </div>
                      <span className="font-bold">{formatCurrency(order.total)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{order.created_at ? formatDateTime(order.created_at) : 'Unknown date'}</span>
                      <span>{order.order_items?.length || 0} items</span>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {getNextStatus(order.status!) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateOrderStatus(order.id, getNextStatus(order.status!)!)}
                          loading={updatingOrder === order.id}
                          disabled={updatingOrder === order.id}
                          className="text-xs"
                        >
                          Mark {getNextStatus(order.status!)}
                        </Button>
                      )}
                      {order.payment_status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updatePaymentStatus(order.id, 'paid')}
                          loading={updatingOrder === order.id}
                          disabled={updatingOrder === order.id}
                          className="text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                        >
                          Mark Paid
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick Actions & Analytics */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3">
                <Link href="/dashboard/orders">
                  <Button variant="outline" className="w-full justify-start">
                    <Package className="h-4 w-4 mr-2" />
                    Manage All Orders
                  </Button>
                </Link>
                <Link href="/dashboard/analytics">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </Link>
                <Link href="/dashboard/menu">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Update Menu
                  </Button>
                </Link>
                <Link href="/menu">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    View Customer Menu
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Today's Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Today&apos;s Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">New Orders:</span>
                  <span className="font-medium">{stats?.ordersToday || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Completed:</span>
                  <span className="font-medium text-green-600">{stats?.completedToday || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Revenue:</span>
                  <span className="font-medium">{formatCurrency(stats?.revenueToday || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Profit:</span>
                  <span className="font-medium text-green-600">{formatCurrency(stats?.profitToday || 0)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm font-medium">Orders in progress:</span>
                  <span className="font-bold">{recentOrders.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}