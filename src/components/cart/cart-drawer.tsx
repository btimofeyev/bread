'use client'

import { Button, Modal } from '@/components/ui'
import { useCartStore } from '@/stores/cart-store'
import { formatCurrency } from '@/lib/utils'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export function CartDrawer() {
  const { 
    items, 
    isOpen, 
    setCartOpen, 
    updateQuantity, 
    removeItem, 
    getTotalPrice,
    getTotalItems 
  } = useCartStore()
  const router = useRouter()

  const handleCheckout = () => {
    setCartOpen(false)
    router.push('/checkout')
  }

  if (items.length === 0) {
    return (
      <Modal 
        isOpen={isOpen} 
        onClose={() => setCartOpen(false)}
        title="Your Cart"
        size="md"
      >
        <div className="text-center py-8">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
          <p className="text-muted-foreground mb-6">
            Add some delicious bread to get started
          </p>
          <Button onClick={() => setCartOpen(false)}>
            Continue Shopping
          </Button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => setCartOpen(false)}
      title={`Cart (${getTotalItems()} items)`}
      size="md"
    >
      <div className="space-y-4">
        {/* Cart Items */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {items.map((item) => (
            <div key={item.product.id} className="flex gap-3 p-3 border rounded-lg">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                {item.product.image_url ? (
                  <Image
                    src={item.product.image_url}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">
                  {item.product.name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(item.product.price)} each
                </p>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="h-6 w-6 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-medium min-w-[1.5rem] text-center">
                      {item.quantity}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="h-6 w-6 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">
                      {formatCurrency(item.product.price * item.quantity)}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeItem(item.product.id)}
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total</span>
            <span>{formatCurrency(getTotalPrice())}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button 
            onClick={handleCheckout}
            className="w-full"
            size="lg"
          >
            Proceed to Checkout
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setCartOpen(false)}
            className="w-full"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </Modal>
  )
}