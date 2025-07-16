import { useEffect } from 'react'
import { useCartStore } from '@/stores/cart-store'

export function useCartHydration() {
  useEffect(() => {
    // Manually rehydrate the cart store on client-side
    if (typeof window !== 'undefined') {
      useCartStore.persist.rehydrate()
    }
  }, [])
}