-- Insert sample products
INSERT INTO products (name, description, price, cost, category, available, lead_time_hours) VALUES
('Classic Sourdough Loaf', 'Our signature sourdough with a perfect crust and tangy flavor. Made with organic flour and a 24-hour fermentation process.', 8.00, 2.50, 'Breads', true, 48),
('Whole Wheat Sourdough', 'Nutritious whole wheat sourdough with a hearty texture and nutty flavor. Perfect for sandwiches.', 9.00, 3.00, 'Breads', true, 48),
('Rosemary Olive Sourdough', 'Artisan sourdough infused with fresh rosemary and Kalamata olives. A Mediterranean delight.', 10.00, 3.50, 'Specialty Breads', true, 48),
('Cinnamon Raisin Sourdough', 'Sweet and aromatic sourdough with organic cinnamon and plump raisins. Great for breakfast.', 9.50, 3.25, 'Specialty Breads', true, 48),
('Sourdough Baguette', 'Traditional French-style baguette with sourdough starter. Crispy outside, soft inside.', 5.00, 1.50, 'Breads', true, 24),
('Sourdough Dinner Rolls (6 pack)', 'Soft and fluffy sourdough dinner rolls. Perfect for family dinners.', 6.00, 2.00, 'Rolls', true, 24),
('Sourdough Pizza Dough', 'Pre-made sourdough pizza dough. Makes two 12-inch pizzas.', 7.00, 2.00, 'Other', true, 24),
('Sourdough Starter', 'Active sourdough starter for your own baking adventures. Comes with care instructions.', 5.00, 1.00, 'Other', true, 0);

-- Note: To create an admin user, you'll need to:
-- 1. Sign up a user through the Supabase Auth UI or API
-- 2. Update their profile role to 'admin' using the Supabase dashboard or a direct SQL query:
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-admin-email@example.com';