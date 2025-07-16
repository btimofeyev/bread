'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { MainLayout, PageHeader } from '@/components/layout/main-layout'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Badge, LoadingSpinner, EmptyState } from '@/components/ui'
import { toast } from 'react-hot-toast'
import { LogOut, User, ShoppingBag, Clock, CheckCircle, AlertCircle, Package, ChefHat } from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { useCustomerOrders } from '@/hooks/use-customer-orders'
import Link from 'next/link'

function ProfileContent() {
  const searchParams = useSearchParams()
  const { user, profile, signOut, updateProfile, loading } = useAuth()
  const { orders, loading: ordersLoading } = useCustomerOrders(user?.id)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [updating, setUpdating] = useState(false)
  
  // Get initial tab from URL params
  const initialTab = searchParams.get('tab') === 'orders' ? 'orders' : 'profile'
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>(initialTab)

  // Update form fields when profile data loads
  useEffect(() => {
    if (profile) {
      setName(profile.name || '')
      setPhone(profile.phone || '')
      setAddress(profile.address || '')
    }
  }, [profile])

  // Helper function to get status badge style and icon
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending':
        return { 
          icon: Clock, 
          variant: 'secondary' as const, 
          label: 'Order Received',
          description: 'Your order has been received and is being reviewed'
        }
      case 'confirmed':
        return { 
          icon: CheckCircle, 
          variant: 'default' as const, 
          label: 'Confirmed',
          description: 'Your order has been confirmed and payment is processed'
        }
      case 'baking':
        return { 
          icon: ChefHat, 
          variant: 'default' as const, 
          label: 'Baking',
          description: 'Your fresh bread is being baked with care'
        }
      case 'ready':
        return { 
          icon: Package, 
          variant: 'success' as const, 
          label: 'Ready for Pickup',
          description: 'Your order is ready! Please come pick it up'
        }
      case 'completed':
        return { 
          icon: CheckCircle, 
          variant: 'success' as const, 
          label: 'Completed',
          description: 'Order completed successfully'
        }
      case 'cancelled':
        return { 
          icon: AlertCircle, 
          variant: 'destructive' as const, 
          label: 'Cancelled',
          description: 'This order has been cancelled'
        }
      default:
        return { 
          icon: Clock, 
          variant: 'secondary' as const, 
          label: status,
          description: ''
        }
    }
  }

  const getPaymentStatusDisplay = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'pending':
        return { variant: 'secondary' as const, label: 'Payment Pending' }
      case 'processing':
        return { variant: 'default' as const, label: 'Processing Payment' }
      case 'completed':
        return { variant: 'success' as const, label: 'Paid' }
      case 'failed':
        return { variant: 'destructive' as const, label: 'Payment Failed' }
      case 'refunded':
        return { variant: 'secondary' as const, label: 'Refunded' }
      default:
        return { variant: 'secondary' as const, label: paymentStatus }
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)

    try {
      const { error } = await updateProfile({
        name,
        phone,
        address,
      })

      if (error) {
        toast.error('Failed to update profile')
      } else {
        toast.success('Profile updated successfully')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setUpdating(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <PageHeader title="Profile" />
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted rounded-xl" />
            <div className="h-48 bg-muted rounded-xl" />
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <PageHeader title="Profile" description="Manage your account and view your orders" />
      
      <div className="p-4 space-y-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'profile'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <User className="h-4 w-4 inline mr-2" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'orders'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShoppingBag className="h-4 w-4 inline mr-2" />
            My Orders ({orders.length})
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <>
            {/* Profile Info */}
            <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={updating}
              />
              <Input
                label="Email"
                value={user?.email || ''}
                disabled
                className="opacity-50"
              />
              <Input
                label="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={updating}
              />
              <Input
                label="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={updating}
              />
              <Button 
                type="submit" 
                className="w-full" 
                loading={updating}
                disabled={updating}
              >
                Update Profile
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent className="pt-6">
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
            </Card>
          </>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <>
            {ordersLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : orders.length === 0 ? (
              <EmptyState
                icon={ShoppingBag}
                title="No orders yet"
                description="You haven't placed any orders yet. Start browsing our delicious breads!"
                action={{
                  label: "Browse Menu",
                  onClick: () => window.location.href = "/menu"
                }}
              />
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const statusDisplay = getStatusDisplay(order.status || 'pending')
                  const paymentDisplay = getPaymentStatusDisplay(order.payment_status || 'pending')
                  const StatusIcon = statusDisplay.icon

                  return (
                    <Card key={order.id} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">Order #{order.order_number}</h3>
                              <Badge variant={statusDisplay.variant} className="flex items-center gap-1">
                                <StatusIcon className="h-3 w-3" />
                                {statusDisplay.label}
                              </Badge>
                              <Badge variant={paymentDisplay.variant}>
                                {paymentDisplay.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {statusDisplay.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{formatCurrency(order.total)}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.created_at ? formatDateTime(order.created_at) : 'Unknown date'}
                            </p>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-2 mb-4">
                          <h4 className="font-medium text-sm">Items:</h4>
                          {order.order_items?.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.quantity}x {item.product?.name || 'Unknown Product'}</span>
                              <span>{formatCurrency(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Pickup Information */}
                        <div className="border-t pt-4 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Pickup Date:</span>
                            <span>{order.pickup_date ? new Date(order.pickup_date).toLocaleDateString() : 'Not set'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Delivery Method:</span>
                            <span className="capitalize">{order.delivery_method}</span>
                          </div>
                          {order.notes && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Notes:</span>
                              <span className="text-right max-w-xs">{order.notes}</span>
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        <div className="border-t pt-4 mt-4">
                          <Link href={`/orders/${order.id}`}>
                            <Button variant="outline" className="w-full">
                              View Order Details
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <MainLayout>
        <PageHeader title="Profile" />
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted rounded-xl" />
            <div className="h-48 bg-muted rounded-xl" />
          </div>
        </div>
      </MainLayout>
    }>
      <ProfileContent />
    </Suspense>
  )
}