'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout, PageHeader } from '@/components/layout/main-layout'
import { Button, EmptyState } from '@/components/ui'
import { useCartStore } from '@/stores/cart-store'
import { useAuth } from '@/contexts/auth-context'
import { formatCurrency } from '@/lib/utils'
import { Minus, Plus, Trash2, ShoppingBag, LogIn } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function CartPage() {
  const { 
    items, 
    updateQuantity, 
    removeItem, 
    getTotalPrice,
    getTotalItems,
    clearCart
  } = useCartStore()
  const { user } = useAuth()
  const router = useRouter()
  const [isClearing, setIsClearing] = useState(false)

  const handleClearCart = () => {
    setIsClearing(true)
    clearCart()
    setTimeout(() => setIsClearing(false), 500)
  }

  const handleCheckout = () => {
    if (!user) {
      router.push('/auth/login?redirect=/checkout')
    } else {
      router.push('/checkout')
    }
  }

  if (items.length === 0) {
    return (
      <MainLayout>
        <PageHeader title="Shopping Cart" />
        <div className="p-4">
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Add some delicious bread to get started"
            action={{
              label: "Browse Menu",
              onClick: () => window.location.href = "/menu"
            }}
          />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <PageHeader 
        title={`Shopping Cart (${getTotalItems()} items)`}
        description="Review your order before checkout"
      >
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleClearCart}
          disabled={isClearing}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Cart
        </Button>
      </PageHeader>

      <div className="p-4 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.product.id} className="bg-card rounded-lg p-6 shadow-sm border">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {item.product.image_url ? (
                        <Image
                          src={item.product.image_url}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg">{item.product.name}</h3>
                      <p className="text-muted-foreground text-sm mt-1">
                        {item.product.description}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {item.product.lead_time_hours}hr lead time
                      </p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-medium min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(item.product.price)} each
                            </p>
                            <p className="font-semibold text-lg">
                              {formatCurrency(item.product.price * item.quantity)}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeItem(item.product.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg p-6 shadow-sm border sticky top-4">
              <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal ({getTotalItems()} items)</span>
                  <span>{formatCurrency(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Taxes</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(getTotalPrice())}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mt-6">
                <Button 
                  onClick={handleCheckout}
                  className="w-full"
                  size="lg"
                >
                  {!user ? (
                    <>
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In to Checkout
                    </>
                  ) : (
                    'Proceed to Checkout'
                  )}
                </Button>
                
                {!user && (
                  <p className="text-xs text-muted-foreground text-center">
                    You need to sign in to place an order
                  </p>
                )}
                <Link href="/menu" className="block">
                  <Button 
                    variant="outline" 
                    className="w-full"
                  >
                    Continue Shopping
                  </Button>
                </Link>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Pickup Information:</strong><br />
                  Orders require 24-72 hours lead time depending on items.
                  You&apos;ll receive confirmation with pickup details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}