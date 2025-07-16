import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/types'

export function useRealtimeProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false) // Changed to false for immediate render
  const supabase = createClient()

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true })

      if (error) {
        console.error('Error fetching products:', error)
      } else {
        setProducts(data || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Initial fetch
    fetchProducts()

    // Set up real-time subscription
    const subscription = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        () => {
          fetchProducts() // Refetch all products when any change occurs
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchProducts])

  return { products, loading, refetch: fetchProducts }
}