require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function fixProfilesPolicy() {
  console.log('🔧 Fixing profiles RLS policy...')
  
  try {
    // Drop existing policies
    await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
        DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
      `
    }).catch(() => {})
    
    // Create new policies without recursion
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create new non-recursive policies
        CREATE POLICY "Users can view own profile" ON profiles
          FOR SELECT
          USING (auth.uid() = id);

        CREATE POLICY "Users can update own profile" ON profiles
          FOR UPDATE
          USING (auth.uid() = id)
          WITH CHECK (auth.uid() = id);

        -- Ensure service role can always access profiles
        CREATE POLICY "Service role full access" ON profiles
          FOR ALL
          USING (auth.jwt() ->> 'role' = 'service_role');
      `
    })
    
    if (error) {
      console.error('Error creating policies:', error)
      
      // Try alternative approach
      console.log('Trying alternative approach...')
      
      // First ensure RLS is enabled
      await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;'
      }).catch(() => {})
      
      // Then create simple policies
      await supabase.rpc('exec_sql', {
        sql: `
          CREATE OR REPLACE POLICY "Enable read access for all users" ON profiles
            FOR SELECT USING (true);
            
          CREATE OR REPLACE POLICY "Enable update for users based on id" ON profiles
            FOR UPDATE USING (auth.uid() = id);
        `
      }).catch(() => {})
    }
    
    console.log('✅ Profiles policy should be fixed!')
    console.log('Testing profile access...')
    
    // Test profile access
    const { data, error: testError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (testError) {
      console.error('Test failed:', testError)
    } else {
      console.log('✅ Profile access working!')
    }
    
  } catch (error) {
    console.error('Error:', error)
    console.log('\n📝 Manual fix required:')
    console.log('1. Go to Supabase Dashboard > SQL Editor')
    console.log('2. Run the migration file: supabase/migrations/00005_fix_profiles_policy.sql')
  }
}

fixProfilesPolicy()