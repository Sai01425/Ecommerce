-- ====================================================================
-- Sample Data Script for E-Commerce Platform
-- Database: ecommerce_db
-- ====================================================================

USE ecommerce_db;

-- 1. Insert Default Users (Admin & Customer)
-- Admin Password: Admin@12345 (BCrypt hash)
-- Customer Password: Password@123 (BCrypt hash)
INSERT INTO users (id, name, email, password, phone, role) VALUES
(1, 'Administrator', 'admin@ecommerce.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+1-800-555-0199', 'ROLE_ADMIN'),
(2, 'John Doe', 'john@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+1-555-014-8832', 'ROLE_CUSTOMER')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Insert Shopping Carts for Users
INSERT INTO carts (id, user_id) VALUES
(1, 1),
(2, 2)
ON DUPLICATE KEY UPDATE user_id=VALUES(user_id);

-- 3. Insert Categories
INSERT INTO categories (id, name, description, image_url, active) VALUES
(1, 'Electronics', 'Next-generation smartphones, ultra-portable laptops, audio, and premium gadgets.', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80', TRUE),
(2, 'Fashion', 'Trendy casual apparel, tailored jackets, designer shirts, and everyday wear.', 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80', TRUE),
(3, 'Shoes', 'Performance running sneakers, athletic footwear, leather boots, and streetwear.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80', TRUE),
(4, 'Home Appliances', 'Smart robot vacuums, espresso machines, air fryers, and modern home essentials.', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80', TRUE),
(5, 'Beauty', 'Luxury botanical skincare, rejuvenating face serums, organic hair care, and fragrances.', 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80', TRUE),
(6, 'Accessories', 'Luxury analog watches, polarized sunglasses, genuine leather wallets, and gear.', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80', TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 4. Insert Products
INSERT INTO products (id, name, description, price, discount_percent, stock_quantity, rating, review_count, image_url, featured, trending, best_seller, category_id) VALUES
(1, 'Sony WH-1000XM5 Wireless Headphones', 'Industry-leading noise cancellation with two processors and 8 microphones. 30-hour battery life.', 399.99, 15, 45, 4.85, 1280, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', TRUE, TRUE, TRUE, 1),
(2, 'Apple iPhone 15 Pro Max (256GB)', 'Forged in titanium with A17 Pro chip and 48MP camera system with 5x optical zoom.', 1199.00, 8, 30, 4.90, 2450, 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80', TRUE, TRUE, TRUE, 1),
(3, 'Dell XPS 15 OLED Touchscreen Laptop', '15.6-inch 3.5K OLED, Intel Core i7 13th Gen, 32GB RAM, 1TB SSD, RTX 4060 graphics.', 1899.99, 12, 18, 4.75, 640, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80', TRUE, FALSE, FALSE, 1),
(4, 'Apple Watch Series 9 GPS 45mm', 'S9 chip, bright always-on retina display, precision finding, and advanced workout tracking.', 429.00, 10, 55, 4.70, 910, 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80', FALSE, TRUE, TRUE, 1),
(5, 'Vintage Denim Trucker Jacket', 'Authentic premium heavyweight denim jacket with button flap chest pockets and sherpa lining.', 89.99, 20, 65, 4.60, 420, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80', TRUE, TRUE, FALSE, 2),
(6, 'Classic Organic Cotton Oxford Shirt', 'Modern slim fit shirt tailored from breathable organic combed cotton with button-down collar.', 49.50, 15, 90, 4.55, 310, 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80', FALSE, FALSE, TRUE, 2),
(7, 'Merino Wool Turtleneck Knit Sweater', 'Ultra-soft Australian merino wool sweater designed for warm layering and comfort.', 110.00, 25, 40, 4.80, 195, 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80', TRUE, FALSE, FALSE, 2),
(8, 'Nike Air Max 270 Sport Sneaker', 'Max Air heel unit delivers responsive bounce. Breathable mesh upper with dual-density foam.', 160.00, 18, 75, 4.85, 1890, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80', TRUE, TRUE, TRUE, 3),
(9, 'Adidas Ultraboost Light Running Shoes', 'Epic energy return with lightweight Boost cushioning and Continental Natural Rubber grip.', 189.99, 20, 50, 4.78, 1420, 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80', FALSE, TRUE, TRUE, 3),
(10, 'Timberland 6-Inch Waterproof Boot', 'Classic waterproof nubuck leather boot with seam-sealed construction and rustproof hardware.', 198.00, 10, 35, 4.90, 880, 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=800&q=80', TRUE, FALSE, FALSE, 3),
(11, 'DeLonghi Magnifica S Espresso Machine', 'Bean-to-cup machine with integrated burr grinder, milk frother, and aroma selector.', 549.99, 15, 25, 4.82, 760, 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80', TRUE, TRUE, FALSE, 4),
(12, 'Roborock S8 Pro Ultra Robot Vacuum', 'Extreme 6000Pa suction, auto-cleaning dock, dual roller brushes, and 3D obstacle avoidance.', 999.00, 20, 20, 4.75, 510, 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80', TRUE, FALSE, TRUE, 4),
(13, 'Philips XXL Digital Airfryer (7.2L)', 'Rapid CombiAir circulation for crispy delicious meals with up to 90% less oil.', 229.50, 25, 45, 4.68, 940, 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&q=80', FALSE, TRUE, TRUE, 4),
(14, 'Hyaluronic Acid Hydrating Face Serum', 'Pure multi-weight hyaluronic acid with botanical peptides for deep lasting hydration.', 38.00, 10, 120, 4.88, 1540, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80', TRUE, TRUE, TRUE, 5),
(15, 'Rose Damascena Revitalizing Face Oil', 'Cold-pressed organic rosehip and Damascus rose blend to nourish and revitalize dull skin.', 52.00, 15, 80, 4.75, 610, 'https://images.unsplash.com/photo-1608248597359-0027f6acb700?auto=format&fit=crop&w=800&q=80', FALSE, TRUE, FALSE, 5),
(16, 'Eau de Parfum Velvet Santal (100ml)', 'Sensual warm fragrance featuring Australian sandalwood, cardamom, violet, and amber.', 135.00, 20, 40, 4.92, 820, 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80', TRUE, FALSE, TRUE, 5),
(17, 'Fossil Minimalist Chronograph Watch', '44mm stainless steel casing with genuine leather strap, water-resistant to 50 meters.', 145.00, 25, 55, 4.70, 680, 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80', TRUE, TRUE, TRUE, 6),
(18, 'Ray-Ban Classic Aviator Sunglasses', 'Iconic gold metal frame with crystal green polarized lenses offering 100% UV protection.', 185.00, 15, 65, 4.88, 1620, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80', TRUE, FALSE, TRUE, 6),
(19, 'Handcrafted Top-Grain Leather Bi-Fold Wallet', 'RFID protected genuine leather slim wallet with 8 card slots and dual cash dividers.', 35.00, 10, 110, 4.65, 730, 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80', FALSE, TRUE, FALSE, 6)
ON DUPLICATE KEY UPDATE name=VALUES(name);
