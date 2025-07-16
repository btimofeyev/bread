require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    db: {
      schema: 'public'
    }
  }
)

async function addCustomerColumns() {
  console.log('🔧 Adding customer info columns to orders table...')
  
  try {
    // Test if columns already exist by trying to select them
    const { error: testError } = await supabase
      .from('orders')
      .select('customer_name, customer_phone')
      .limit(1)
    
    if (!testError) {
      console.log('✅ Columns already exist!')
      return
    }
    
    console.log('📝 Columns don\'t exist, adding them manually...')
    console.log('Please run the following SQL in your Supabase SQL Editor:')
    console.log('')
    console.log('ALTER TABLE orders ADD COLUMN customer_name text;')
    console.log('ALTER TABLE orders ADD COLUMN customer_phone text;')
    console.log('')
    console.log('Then try placing an order again.')
    
  } catch (error) {
    console.error('Error:', error)
  }
}

addCustomerColumns()