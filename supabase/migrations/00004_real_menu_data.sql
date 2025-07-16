-- Clear existing placeholder products
DELETE FROM products;

-- Reset the sequence if needed
-- ALTER SEQUENCE products_id_seq RESTART WITH 1;

-- Insert real organic sourdough menu products
INSERT INTO products (name, description, price, cost, category, available, lead_time_hours) VALUES

-- BREADS CATEGORY
('Traditional Loaf (LG)', 'Our signature large traditional sourdough loaf. Made with organic flour and natural fermentation process. Perfect for families.', 10.00, 3.50, 'Breads', true, 48),

('Fresh Milled Traditional Loaf (Md-L)', 'Medium-large traditional loaf made with fresh-milled organic flour. Available by special request based on milling schedule.', 15.00, 5.25, 'Breads', true, 48),

('French Loaves (2 CT)', 'Two traditional French-style sourdough loaves with crispy crust and airy interior. Perfect for dinner parties.', 16.00, 5.60, 'Breads', true, 48),

('Soft Dinner Rolls (12 CT)', 'Dozen soft and fluffy sourdough dinner rolls. Ideal for family meals and gatherings.', 14.00, 4.90, 'Breads', true, 24),

('Baguette (2 CT)', 'Two classic sourdough baguettes with authentic crispy crust. Great for sandwiches or serving with meals.', 16.00, 5.60, 'Breads', true, 24),

-- SWEET TREATS CATEGORY
('Cinnamon Rolls (6 CT)', 'Six artisan cinnamon rolls made with sourdough starter, organic cinnamon, and natural sweeteners.', 18.00, 6.30, 'Sweet Treats', true, 48),

('Cinnamon Rolls (12 CT)', 'Dozen artisan cinnamon rolls perfect for special occasions and large gatherings.', 32.00, 11.20, 'Sweet Treats', true, 48),

('Seasonal Butter Braid (LG)', 'Large seasonal butter braid made with premium organic butter and seasonal ingredients. Available based on season and special occasions.', 25.00, 8.75, 'Sweet Treats', true, 72),

-- SANDWICH BREADS CATEGORY
('Plain Bagels (8-10 CT)', 'Pack of 8-10 fresh sourdough bagels. Perfect for breakfast and lunch meals throughout the week.', 12.00, 4.20, 'Sandwich Breads', true, 24),

('Dozen Bagels (12 CT)', 'Full dozen sourdough bagels for families or meal prep. Can be frozen for extended freshness.', 14.50, 5.08, 'Sandwich Breads', true, 24),

('Sandwich Loaf', 'Perfect sandwich loaf with soft texture and mild sourdough flavor. Ideal for daily sandwich making.', 11.00, 3.85, 'Sandwich Breads', true, 48),

('Hamburger Buns (12 CT)', 'Dozen soft sourdough hamburger buns perfect for BBQs and family meals. Sturdy enough to hold hearty burgers.', 13.00, 4.55, 'Sandwich Breads', true, 24);

-- Note: Cost calculations are approximately 35% of retail price to maintain healthy profit margins
-- Lead times: 24 hours for rolls/buns, 48 hours for standard breads, 72 hours for seasonal items