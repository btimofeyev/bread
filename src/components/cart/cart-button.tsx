'use client'

import { Button } from '@/components/ui'
import { useCartStore } from '@/stores/cart-store'
import { ShoppingCart } from 'lucide-react'

export function CartButton() {
  const { getTotalItems, toggleCart } = useCartStore()
  const totalItems = getTotalItems()

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleCart}
      className="relative"
    >
      <ShoppingCart className="h-5 w-5" />
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">
          {totalItems > 9 ? '9+' : totalItems}
        </span>
      )}
    </Button>
  )
}