import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminUser, verifyAuthenticatedUser } from '@/lib/auth/admin-check'

export async function GET(request: NextRequest) {
  try {
    const serviceSupabase = createServiceClient()

    // Get query parameters
    const url = new URL(request.url)
    const userId = url.searchParams.get('user_id')
    const isAdminRequest = url.searchParams.get('admin') === 'true'

    // If this is an admin request, verify admin privileges
    if (isAdminRequest) {
      const adminCheck = await verifyAdminUser()
      if (!adminCheck.success) {
        return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
      }

      // Admin can see all orders
      const { data: orders, error } = await serviceSupabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (*)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching orders:', error)
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
      }

      // Fetch profile data separately for each order
      const ordersWithProfiles = await Promise.all(
        (orders || []).map(async (order) => {
          const { data: profile } = await serviceSupabase
            .from('profiles')
            .select('id, name, email, phone')
            .eq('id', order.user_id)
            .single()
          
          return {
            ...order,
            profile
          }
        })
      )

      return NextResponse.json({ orders: ordersWithProfiles })
    }

    // For non-admin requests, verify authentication and user ownership
    const authCheck = await verifyAuthenticatedUser()
    if (!authCheck.success) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    // Ensure user can only see their own orders
    if (!userId || userId !== authCheck.user!.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Use service client to bypass RLS for complex queries
    const { data: orders, error } = await serviceSupabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          product:products (*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders:', error)
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }

    // Fetch profile data for the user
    const { data: profile } = await serviceSupabase
      .from('profiles')
      .select('id, name, email, phone')
      .eq('id', userId)
      .single()

    // Add profile to each order
    const ordersWithProfile = (orders || []).map(order => ({
      ...order,
      profile
    }))

    return NextResponse.json({ orders: ordersWithProfile })
  } catch (error) {
    console.error('Unexpected error fetching orders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}