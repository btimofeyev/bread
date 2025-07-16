'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { OrderWithItems } from '@/types'

export function useCustomerOrders(userId: string | undefined) {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchOrders = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setError(null)
      const response = await fetch(`/api/orders/list?user_id=${userId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }

      const data = await response.json()
      setOrders(data.orders || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Set up real-time subscription for order updates
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel('customer-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${userId}`
        },
        (_payload) => {
          // Order update received - refreshing customer orders
          // Refetch orders when any order for this user changes
          fetchOrders()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, fetchOrders])

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders
  }
}