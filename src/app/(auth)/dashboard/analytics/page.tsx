'use client'

import { useState, useMemo } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { MainLayout, PageHeader } from '@/components/layout/main-layout'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  LoadingSpinner,
  Badge
} from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import { useRealtimeOrders } from '@/hooks/use-realtime-orders'
import { useRealtimeProducts } from '@/hooks/use-realtime-products'
import { 
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Package,
  BarChart3,
  PieChart,
  AlertCircle,
  Star,
  Clock
} from 'lucide-react'

interface TimeRange {
  label: string
  days: number
}

const timeRanges: TimeRange[] = [
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 90 Days', days: 90 },
  { label: 'All Time', days: 0 }
]

export default function AnalyticsPage() {
  const { isAdmin, loading: authLoading, profile } = useAuth()
  const { orders, loading: ordersLoading } = useRealtimeOrders()
  const { products, loading: productsLoading } = useRealtimeProducts()
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>(timeRanges[1]) // Last 30 Days

  // Filter orders by time range
  const filteredOrders = useMemo(() => {
    if (selectedTimeRange.days === 0) return orders // All time
    
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - selectedTimeRange.days)
    
    return orders.filter(order => order.created_at && new Date(order.created_at) >= cutoffDate)
  }, [orders, selectedTimeRange])

  // Calculate key metrics
  const analytics = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, order) => 
      order.payment_status === 'paid' ? sum + order.total : sum, 0
    )
    
    const totalCost = filteredOrders.reduce((sum, order) => 
      order.payment_status === 'paid' ? sum + order.cost : sum, 0
    )
    
    const totalProfit = totalRevenue - totalCost
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
    
    const totalOrders = filteredOrders.length
    const paidOrders = filteredOrders.filter(o => o.payment_status === 'paid').length
    const pendingOrders = filteredOrders.filter(o => o.status === 'pending').length
    const completedOrders = filteredOrders.filter(o => o.status === 'completed').length
    
    const averageOrderValue = paidOrders > 0 ? totalRevenue / paidOrders : 0
    
    // Order status breakdown
    const statusBreakdown = {
      pending: filteredOrders.filter(o => o.status === 'pending').length,
      confirmed: filteredOrders.filter(o => o.status === 'confirmed').length,
      baking: filteredOrders.filter(o => o.status === 'baking').length,
      ready: filteredOrders.filter(o => o.status === 'ready').length,
      completed: filteredOrders.filter(o => o.status === 'completed').length,
      cancelled: filteredOrders.filter(o => o.status === 'cancelled').length,
    }
    
    // Product performance
    const productPerformance = new Map<string, { name: string, quantity: number, revenue: number }>()
    
    filteredOrders
      .filter(o => o.payment_status === 'paid')
      .forEach(order => {
        order.order_items?.forEach(item => {
          if (!item.product_id) return
          
          const existing = productPerformance.get(item.product_id) || { 
            name: item.product?.name || 'Unknown Product', 
            quantity: 0, 
            revenue: 0 
          }
          existing.quantity += item.quantity
          existing.revenue += item.price * item.quantity
          productPerformance.set(item.product_id, existing)
        })
      })
    
    const topProducts = Array.from(productPerformance.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
    
    return {
      totalRevenue,
      totalCost,
      totalProfit,
      profitMargin,
      totalOrders,
      paidOrders,
      pendingOrders,
      completedOrders,
      averageOrderValue,
      statusBreakdown,
      topProducts
    }
  }, [filteredOrders])

  // Show loading while auth or data is still loading
  if (authLoading || !profile || ordersLoading || productsLoading) {
    return (
      <MainLayout isAdmin>
        <PageHeader title="Analytics" />
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

  return (
    <MainLayout isAdmin>
      <PageHeader 
        title="Analytics" 
        description={`Business insights and performance metrics • ${analytics.totalOrders} orders in ${selectedTimeRange.label.toLowerCase()}`}
      >
        <div className="flex gap-2">
          {timeRanges.map((range) => (
            <button
              key={range.label}
              onClick={() => setSelectedTimeRange(range)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                selectedTimeRange.label === range.label
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </PageHeader>

      <div className="p-4 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-900">{formatCurrency(analytics.totalRevenue)}</p>
                  <p className="text-xs text-green-700 mt-1">
                    {analytics.paidOrders} paid orders
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Profit</p>
                  <p className="text-2xl font-bold text-blue-900">{formatCurrency(analytics.totalProfit)}</p>
                  <p className="text-xs text-blue-700 mt-1">
                    {analytics.profitMargin.toFixed(1)}% margin
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Total Orders</p>
                  <p className="text-2xl font-bold text-purple-900">{analytics.totalOrders}</p>
                  <p className="text-xs text-purple-700 mt-1">
                    {analytics.completedOrders} completed
                  </p>
                </div>
                <ShoppingBag className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600 font-medium">Avg Order Value</p>
                  <p className="text-2xl font-bold text-amber-900">{formatCurrency(analytics.averageOrderValue)}</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Per paid order
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Order Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analytics.statusBreakdown).map(([status, count]) => {
                  const percentage = analytics.totalOrders > 0 ? (count / analytics.totalOrders * 100) : 0
                  const colors = {
                    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                    confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
                    baking: 'bg-orange-100 text-orange-800 border-orange-300',
                    ready: 'bg-green-100 text-green-800 border-green-300',
                    completed: 'bg-gray-100 text-gray-800 border-gray-300',
                    cancelled: 'bg-red-100 text-red-800 border-red-300'
                  }
                  
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={colors[status as keyof typeof colors]}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {count} orders
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-10 text-right">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Top Performing Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.topProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No product data available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {analytics.topProducts.map((product, index) => (
                    <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.quantity} sold
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(product.revenue)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(product.revenue / product.quantity)} avg
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Quick Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Current Status</h4>
                <p className="text-sm text-blue-700">
                  {analytics.pendingOrders} orders pending review
                </p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">Revenue Health</h4>
                <p className="text-sm text-green-700">
                  {analytics.profitMargin > 30 ? 'Strong' : analytics.profitMargin > 20 ? 'Good' : 'Needs improvement'} profit margin ({analytics.profitMargin.toFixed(1)}%)
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2">Product Mix</h4>
                <p className="text-sm text-purple-700">
                  {products.filter(p => p.available).length} of {products.length} products available
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}