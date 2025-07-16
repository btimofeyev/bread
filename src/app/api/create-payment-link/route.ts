import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'
import { verifyAuthenticatedUser } from '@/lib/auth/admin-check'
import type { OrderItem, Product } from '@/types'
import { createPaymentLinkSchema, validateRequest } from '@/lib/validations/api'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const authCheck = await verifyAuthenticatedUser()
    if (!authCheck.success) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    const body = await request.json()

    // Validate request body
    const validation = validateRequest(createPaymentLinkSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { orderId } = validation.data

    const supabase = createClient()

    // Get the order with items
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          product:products (*)
        )
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Ensure user can only create payment links for their own orders
    if (order.user_id !== authCheck.user!.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Create line items for Stripe
    const lineItems = order.order_items.map((item: OrderItem & { product: Product | null }) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product?.name || 'Unknown Product',
          description: item.product?.description || undefined,
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }))

    // Create Stripe payment link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: lineItems,
      metadata: {
        orderId: order.id,
        orderNumber: order.order_number,
      },
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/orders/${order.id}?payment=success`,
        },
      },
    })

    // Update order with payment link ID
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        stripe_payment_link_id: paymentLink.id,
        payment_status: 'pending',
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Error updating order:', updateError)
    }

    return NextResponse.json({
      paymentUrl: paymentLink.url,
      paymentLinkId: paymentLink.id,
    })

  } catch (error) {
    console.error('Error creating payment link:', error)
    return NextResponse.json(
      { error: 'Failed to create payment link' },
      { status: 500 }
    )
  }
}