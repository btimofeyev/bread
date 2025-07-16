import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'
import type { OrderWithItems } from '@/types'

export function useRealtimeOrders(isAdmin = false) {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  const fetchOrders = useCallback(async () => {
    if (!user) return

    try {
      // Use API endpoint to fetch orders with proper RLS handling
      const params = new URLSearchParams()
      if (!isAdmin) {
        params.set('user_id', user.id)
      } else {
        params.set('admin', 'true')
      }

      const response = await fetch(`/api/orders/list?${params}`)
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
  }, [user, isAdmin])

  useEffect(() => {
    if (!user) return

    // Initial fetch
    fetchOrders()

    // Set up real-time subscription
    const subscription = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (_payload) => {
          // Order change detected - refreshing orders
          fetchOrders() // Refetch all orders when any change occurs
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user?.id, isAdmin, fetchOrders])

  return { orders, loading, refetch: fetchOrders }
}