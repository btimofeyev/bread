import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { User } from '@supabase/supabase-js'

interface AdminCheckResult {
  success: boolean
  user: User | null
  error?: string
  status?: number
}

export async function verifyAdminUser(): Promise<AdminCheckResult> {
  try {
    const supabase = createClient()
    const serviceSupabase = createServiceClient()

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return {
        success: false,
        user: null,
        error: 'Unauthorized',
        status: 401
      }
    }

    // Check user profile for admin role
    const { data: profile, error: profileError } = await serviceSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      return {
        success: false,
        user: null,
        error: 'Failed to verify user permissions',
        status: 500
      }
    }

    // Check if user has admin role
    if (profile?.role !== 'admin') {
      return {
        success: false,
        user: null,
        error: 'Admin access required',
        status: 403
      }
    }

    return {
      success: true,
      user
    }
  } catch (error) {
    console.error('Error in admin verification:', error)
    return {
      success: false,
      user: null,
      error: 'Internal server error',
      status: 500
    }
  }
}

export async function verifyAuthenticatedUser(): Promise<AdminCheckResult> {
  try {
    const supabase = createClient()

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return {
        success: false,
        user: null,
        error: 'Unauthorized',
        status: 401
      }
    }

    return {
      success: true,
      user
    }
  } catch (error) {
    console.error('Error in user authentication:', error)
    return {
      success: false,
      user: null,
      error: 'Internal server error',
      status: 500
    }
  }
}