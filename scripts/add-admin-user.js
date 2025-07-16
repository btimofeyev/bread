#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function addAdminUser(email) {
  try {
    console.log(`🔍 Looking for user with email: ${email}`)
    
    // First, try to find the user by email in auth.users
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ Error listing users:', listError)
      return
    }
    
    const user = users.find(u => u.email === email)
    
    if (!user) {
      console.log('❌ User not found in authentication system')
      console.log('📝 The user needs to sign up first at your application')
      return
    }
    
    console.log(`✅ Found user: ${user.email} (ID: ${user.id})`)
    
    // Check if profile exists
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('❌ Error checking profile:', profileError)
      return
    }
    
    if (!existingProfile) {
      // Create profile with admin role
      console.log('📝 Creating new profile with admin role...')
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      
      if (insertError) {
        console.error('❌ Error creating profile:', insertError)
        return
      }
      
      console.log('✅ Profile created with admin role')
    } else {
      // Update existing profile to admin role
      console.log('📝 Updating existing profile to admin role...')
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          role: 'admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
      
      if (updateError) {
        console.error('❌ Error updating profile:', updateError)
        return
      }
      
      console.log('✅ Profile updated to admin role')
    }
    
    // Verify the change
    const { data: updatedProfile } = await supabase
      .from('profiles')
      .select('email, role')
      .eq('id', user.id)
      .single()
    
    console.log('✅ Admin user setup complete!')
    console.log(`📧 Email: ${updatedProfile.email}`)
    console.log(`👑 Role: ${updatedProfile.role}`)
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Get email from command line argument or use default
const email = process.argv[2] || 'gamdedesknews@gmail.com'

console.log('🚀 Setting up admin user...')
console.log(`📧 Email: ${email}`)
console.log('')

addAdminUser(email)
  .then(() => {
    console.log('')
    console.log('🎉 Done! The user now has admin access.')
    console.log('📋 Next steps:')
    console.log('   1. User should log in to the application')
    console.log('   2. Admin dashboard will be accessible at /dashboard')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })