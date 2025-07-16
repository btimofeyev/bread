import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthenticatedUser } from '@/lib/auth/admin-check'
import { createOrderSchema, validateRequest } from '@/lib/validations/api'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const serviceSupabase = createServiceClient()

    // Verify user is authenticated
    const authCheck = await verifyAuthenticatedUser()
    if (!authCheck.success) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    const body = await request.json()
    
    // Validate request body
    const validation = validateRequest(createOrderSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const {
      user_id,
      status = 'pending',
      payment_status = 'pending',
      total,
      cost,
      profit,
      pickup_date,
      delivery_method,
      notes,
      items
    } = validation.data

    // Ensure the user can only create orders for themselves
    if (user_id !== authCheck.user!.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Ensure pickup_date is in proper format for database
    const formattedPickupDate = pickup_date.includes('T') 
      ? pickup_date 
      : `${pickup_date}T00:00:00.000Z`

    // Create the order using the service role client to bypass RLS
    const { data: order, error: orderError } = await serviceSupabase
      .from('orders')
      .insert({
        user_id,
        status,
        payment_status,
        total,
        cost,
        profit,
        pickup_date: formattedPickupDate,
        delivery_method,
        notes,
      })
      .select()
      .single()

    if (orderError) {
      console.error('Order creation error:', orderError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // Create order items
    if (items && items.length > 0) {
      const orderItems = items.map((item: { product: { id: string; price: number }; quantity: number }) => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      }))

      const { error: itemsError } = await serviceSupabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        console.error('Order items creation error:', itemsError)
        // Try to clean up the order if items failed
        await serviceSupabase.from('orders').delete().eq('id', order.id)
        return NextResponse.json({ error: 'Failed to create order items' }, { status: 500 })
      }
    }

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in order creation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}