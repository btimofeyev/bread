import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminUser } from '@/lib/auth/admin-check'
import { createProductSchema, validateRequest } from '@/lib/validations/api'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const serviceSupabase = createServiceClient()

    // Verify user is authenticated and has admin privileges
    const adminCheck = await verifyAdminUser()
    if (!adminCheck.success) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
    }

    const body = await request.json()
    
    // Validate request body
    const validation = validateRequest(createProductSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const {
      name,
      description,
      price,
      cost,
      category,
      lead_time_hours,
      image_url,
      available = true
    } = validation.data

    // Create product using service client to bypass RLS
    const { data: product, error } = await serviceSupabase
      .from('products')
      .insert({
        name,
        description,
        price,
        cost,
        category,
        lead_time_hours: lead_time_hours || 48,
        image_url,
        available
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating product:', error)
      return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
    }

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error creating product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}