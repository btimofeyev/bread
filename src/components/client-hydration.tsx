'use client'

import { useCartHydration } from '@/hooks/use-cart-hydration'

export function ClientHydration() {
  useCartHydration()
  return null
}