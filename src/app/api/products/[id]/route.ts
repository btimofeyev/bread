import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminUser } from '@/lib/auth/admin-check'
import { updateProductSchema, validateRequest } from '@/lib/validations/api'
import type { Updates } from '@/types'

export const dynamic = 'force-dynamic'

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
    const productId = params.id

    // Validate request body
    const validation = validateRequest(updateProductSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Build update object
    const updates: Updates<'products'> & Record<string, any> = {
      updated_at: new Date().toISOString()
    }

    // Update only provided fields from validated data
    const validatedData = validation.data
    if (validatedData.name !== undefined) updates.name = validatedData.name
    if (validatedData.description !== undefined) updates.description = validatedData.description
    if (validatedData.price !== undefined) updates.price = validatedData.price
    if (validatedData.cost !== undefined) updates.cost = validatedData.cost
    if (validatedData.category !== undefined) updates.category = validatedData.category
    if (validatedData.lead_time_hours !== undefined) updates.lead_time_hours = validatedData.lead_time_hours
    if (validatedData.image_url !== undefined) updates.image_url = validatedData.image_url
    if (validatedData.available !== undefined) updates.available = validatedData.available

    // Update product using service client to bypass RLS
    const { data: product, error } = await serviceSupabase
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select()
      .single()

    if (error) {
      console.error('Error updating product:', error)
      return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Unexpected error updating product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
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

    const productId = params.id

    // Delete product using service client to bypass RLS
    const { error } = await serviceSupabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (error) {
      console.error('Error deleting product:', error)
      return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error deleting product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}