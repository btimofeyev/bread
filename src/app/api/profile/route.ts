import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthenticatedUser } from '@/lib/auth/admin-check'
import { updateProfileSchema, validateRequest } from '@/lib/validations/api'

export async function GET(_request: NextRequest) {
  try {
    const serviceSupabase = createServiceClient()

    // Verify user is authenticated
    const authCheck = await verifyAuthenticatedUser()
    if (!authCheck.success) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    // Fetch profile using service client to bypass RLS
    const { data: profile, error } = await serviceSupabase
      .from('profiles')
      .select('*')
      .eq('id', authCheck.user!.id)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Unexpected error fetching profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const serviceSupabase = createServiceClient()

    // Verify user is authenticated
    const authCheck = await verifyAuthenticatedUser()
    if (!authCheck.success) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    const body = await request.json()
    
    // Validate request body
    const validation = validateRequest(updateProfileSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Update profile using service client to bypass RLS
    const { data: profile, error } = await serviceSupabase
      .from('profiles')
      .update({ 
        ...validation.data,
        updated_at: new Date().toISOString()
      })
      .eq('id', authCheck.user!.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Unexpected error updating profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}