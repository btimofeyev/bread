import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminUser } from '@/lib/auth/admin-check'
import { updateOrderSchema, validateRequest } from '@/lib/validations/api'
import type { Updates } from '@/types'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const serviceSupabase = createServiceClient()

    // Verify user is authenticated and has admin privileges
    const adminCheck = await verifyAdminUser()
    if (!adminCheck.success) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
    }

    const body = await request.json()
    const orderId = params.id

    // Validate request body
    const validation = validateRequest(updateOrderSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { status, payment_status } = validation.data

    // Build update object
    const updates: Updates<'orders'> & Record<string, any> = {
      updated_at: new Date().toISOString()
    }

    if (status !== undefined) {
      updates.status = status
    }
    
    if (payment_status !== undefined) {
      updates.payment_status = payment_status
    }

    // Update order using service client to bypass RLS
    const { data: order, error } = await serviceSupabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single()

    if (error) {
      console.error('Error updating order:', error)
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Unexpected error updating order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}