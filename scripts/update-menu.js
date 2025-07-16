const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function updateMenuData() {
  try {
    console.log('🗑️  Clearing existing products...')
    
    // Clear existing products
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all products
    
    if (deleteError) {
      console.error('Error clearing products:', deleteError)
      return
    }
    
    console.log('✅ Existing products cleared')
    console.log('📦 Inserting real menu data...')
    
    // Insert real menu products
    const products = [
      // BREADS CATEGORY
      {
        name: 'Traditional Loaf (LG)',
        description: 'Our signature large traditional sourdough loaf. Made with organic flour and natural fermentation process. Perfect for families.',
        price: 10.00,
        cost: 3.50,
        category: 'Breads',
        available: true,
        lead_time_hours: 48
      },
      {
        name: 'Fresh Milled Traditional Loaf (Md-L)',
        description: 'Medium-large traditional loaf made with fresh-milled organic flour. Available by special request based on milling schedule.',
        price: 15.00,
        cost: 5.25,
        category: 'Breads',
        available: true,
        lead_time_hours: 48
      },
      {
        name: 'French Loaves (2 CT)',
        description: 'Two traditional French-style sourdough loaves with crispy crust and airy interior. Perfect for dinner parties.',
        price: 16.00,
        cost: 5.60,
        category: 'Breads',
        available: true,
        lead_time_hours: 48
      },
      {
        name: 'Soft Dinner Rolls (12 CT)',
        description: 'Dozen soft and fluffy sourdough dinner rolls. Ideal for family meals and gatherings.',
        price: 14.00,
        cost: 4.90,
        category: 'Breads',
        available: true,
        lead_time_hours: 24
      },
      {
        name: 'Baguette (2 CT)',
        description: 'Two classic sourdough baguettes with authentic crispy crust. Great for sandwiches or serving with meals.',
        price: 16.00,
        cost: 5.60,
        category: 'Breads',
        available: true,
        lead_time_hours: 24
      },
      
      // SWEET TREATS CATEGORY
      {
        name: 'Cinnamon Rolls (6 CT)',
        description: 'Six artisan cinnamon rolls made with sourdough starter, organic cinnamon, and natural sweeteners.',
        price: 18.00,
        cost: 6.30,
        category: 'Sweet Treats',
        available: true,
        lead_time_hours: 48
      },
      {
        name: 'Cinnamon Rolls (12 CT)',
        description: 'Dozen artisan cinnamon rolls perfect for special occasions and large gatherings.',
        price: 32.00,
        cost: 11.20,
        category: 'Sweet Treats',
        available: true,
        lead_time_hours: 48
      },
      {
        name: 'Seasonal Butter Braid (LG)',
        description: 'Large seasonal butter braid made with premium organic butter and seasonal ingredients. Available based on season and special occasions.',
        price: 25.00,
        cost: 8.75,
        category: 'Sweet Treats',
        available: true,
        lead_time_hours: 72
      },
      
      // SANDWICH BREADS CATEGORY
      {
        name: 'Plain Bagels (8-10 CT)',
        description: 'Pack of 8-10 fresh sourdough bagels. Perfect for breakfast and lunch meals throughout the week.',
        price: 12.00,
        cost: 4.20,
        category: 'Sandwich Breads',
        available: true,
        lead_time_hours: 24
      },
      {
        name: 'Dozen Bagels (12 CT)',
        description: 'Full dozen sourdough bagels for families or meal prep. Can be frozen for extended freshness.',
        price: 14.50,
        cost: 5.08,
        category: 'Sandwich Breads',
        available: true,
        lead_time_hours: 24
      },
      {
        name: 'Sandwich Loaf',
        description: 'Perfect sandwich loaf with soft texture and mild sourdough flavor. Ideal for daily sandwich making.',
        price: 11.00,
        cost: 3.85,
        category: 'Sandwich Breads',
        available: true,
        lead_time_hours: 48
      },
      {
        name: 'Hamburger Buns (12 CT)',
        description: 'Dozen soft sourdough hamburger buns perfect for BBQs and family meals. Sturdy enough to hold hearty burgers.',
        price: 13.00,
        cost: 4.55,
        category: 'Sandwich Breads',
        available: true,
        lead_time_hours: 24
      }
    ]
    
    const { data, error: insertError } = await supabase
      .from('products')
      .insert(products)
    
    if (insertError) {
      console.error('Error inserting products:', insertError)
      return
    }
    
    console.log('✅ Successfully inserted', products.length, 'products')
    console.log('🎉 Real menu data update complete!')
    console.log('')
    console.log('Categories added:')
    console.log('- Breads (5 items)')
    console.log('- Sweet Treats (3 items)')
    console.log('- Sandwich Breads (4 items)')
    console.log('')
    console.log('Visit http://localhost:3001/menu to see the updated menu!')
    
  } catch (error) {
    console.error('Error updating menu data:', error)
  }
}

updateMenuData()