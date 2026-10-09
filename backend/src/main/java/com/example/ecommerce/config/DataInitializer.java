package com.example.ecommerce.config;

import com.example.ecommerce.entity.Cart;
import com.example.ecommerce.entity.Category;
import com.example.ecommerce.entity.Product;
import com.example.ecommerce.entity.Role;
import com.example.ecommerce.entity.User;
import com.example.ecommerce.repository.CartRepository;
import com.example.ecommerce.repository.CategoryRepository;
import com.example.ecommerce.repository.ProductRepository;
import com.example.ecommerce.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.name:Administrator}")
    private String adminName;

    @Value("${app.admin.email:admin@ecommerce.com}")
    private String adminEmail;

    @Value("${app.admin.password:Admin@12345}")
    private String adminPassword;

    public DataInitializer(UserRepository userRepository,
                           CategoryRepository categoryRepository,
                           ProductRepository productRepository,
                           CartRepository cartRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.cartRepository = cartRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        initUsers();
        initCategoriesAndProducts();
    }

    private void initUsers() {
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = new User(
                    adminName,
                    adminEmail,
                    passwordEncoder.encode(adminPassword),
                    "+1-800-555-0199",
                    Role.ROLE_ADMIN
            );
            userRepository.save(admin);
            cartRepository.save(new Cart(admin));
            logger.info("Default Admin account initialized: {}", adminEmail);
        }

        String demoUserEmail = "john@example.com";
        if (!userRepository.existsByEmail(demoUserEmail)) {
            User customer = new User(
                    "John Doe",
                    demoUserEmail,
                    passwordEncoder.encode("Password@123"),
                    "+1-555-014-8832",
                    Role.ROLE_CUSTOMER
            );
            userRepository.save(customer);
            cartRepository.save(new Cart(customer));
            logger.info("Default Customer account initialized: {}", demoUserEmail);
        }
    }

    private void initCategoriesAndProducts() {
        if (categoryRepository.count() > 0) {
            return;
        }

        logger.info("Seeding categories and showcase products...");

        Map<String, Category> catMap = new HashMap<>();

        // Categories
        Category catElectronics = new Category(
                "Electronics",
                "Next-generation smartphones, ultra-portable laptops, high-fidelity wireless audio, and premium gadgets.",
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"
        );
        Category catFashion = new Category(
                "Fashion",
                "Trendy casual apparel, tailored jackets, designer shirts, and comfortable everyday wear for men and women.",
                "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80"
        );
        Category catShoes = new Category(
                "Shoes",
                "Performance running sneakers, athletic footwear, leather boots, and stylish streetwear.",
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"
        );
        Category catHome = new Category(
                "Home Appliances",
                "Smart robot vacuums, espresso machines, air fryers, and modern home essentials.",
                "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80"
        );
        Category catBeauty = new Category(
                "Beauty",
                "Luxury botanical skincare, rejuvenating face serums, organic hair care, and wellness fragrances.",
                "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80"
        );
        Category catAccessories = new Category(
                "Accessories",
                "Luxury analog watches, polarized sunglasses, genuine leather wallets, and travel gear.",
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"
        );

        catMap.put("Electronics", categoryRepository.save(catElectronics));
        catMap.put("Fashion", categoryRepository.save(catFashion));
        catMap.put("Shoes", categoryRepository.save(catShoes));
        catMap.put("Home Appliances", categoryRepository.save(catHome));
        catMap.put("Beauty", categoryRepository.save(catBeauty));
        catMap.put("Accessories", categoryRepository.save(catAccessories));

        // Electronics Products
        productRepository.save(new Product(
                "Sony WH-1000XM5 Wireless Headphones",
                "Industry-leading noise cancellation with two processors and 8 microphones. Exceptional sound quality engineered to perfection with 30-hour battery life and ultra-comfortable design.",
                BigDecimal.valueOf(399.99),
                15,
                45,
                BigDecimal.valueOf(4.85),
                1280,
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
                catMap.get("Electronics"),
                true, true, true
        ));

        productRepository.save(new Product(
                "Apple iPhone 15 Pro Max (256GB)",
                "Forged in titanium featuring the groundbreaking A17 Pro chip, customizable Action button, and the most powerful iPhone camera system ever with 5x optical zoom.",
                BigDecimal.valueOf(1199.00),
                8,
                30,
                BigDecimal.valueOf(4.90),
                2450,
                "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80",
                catMap.get("Electronics"),
                true, true, true
        ));

        productRepository.save(new Product(
                "Dell XPS 15 OLED Touchscreen Laptop",
                "15.6-inch 3.5K OLED InfinityEdge display, Intel Core i7 13th Gen, 32GB DDR5 RAM, 1TB NVMe SSD, and NVIDIA GeForce RTX 4060 graphics.",
                BigDecimal.valueOf(1899.99),
                12,
                18,
                BigDecimal.valueOf(4.75),
                640,
                "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80",
                catMap.get("Electronics"),
                true, false, false
        ));

        productRepository.save(new Product(
                "Apple Watch Series 9 GPS 45mm",
                "Powerful S9 chip with magical double tap gesture, brightest display yet, advanced health sensors including ECG and blood oxygen tracking.",
                BigDecimal.valueOf(429.00),
                10,
                55,
                BigDecimal.valueOf(4.70),
                910,
                "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80",
                catMap.get("Electronics"),
                false, true, true
        ));

        // Fashion Products
        productRepository.save(new Product(
                "Vintage Denim Trucker Jacket",
                "Authentic 100% premium heavyweight denim jacket with button flap chest pockets, sherpa collar lining, and timeless rugged style.",
                BigDecimal.valueOf(89.99),
                20,
                65,
                BigDecimal.valueOf(4.60),
                420,
                "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80",
                catMap.get("Fashion"),
                true, true, false
        ));

        productRepository.save(new Product(
                "Classic Organic Cotton Oxford Shirt",
                "Tailored modern slim fit shirt woven from breathable combed organic cotton. Features mother-of-pearl buttons and a button-down collar.",
                BigDecimal.valueOf(49.50),
                15,
                90,
                BigDecimal.valueOf(4.55),
                310,
                "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
                catMap.get("Fashion"),
                false, false, true
        ));

        productRepository.save(new Product(
                "Merino Wool Turtleneck Knit Sweater",
                "Luxuriously soft ultra-fine Australian merino wool sweater designed for warm layering, elegant drape, and everyday comfort.",
                BigDecimal.valueOf(110.00),
                25,
                40,
                BigDecimal.valueOf(4.80),
                195,
                "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80",
                catMap.get("Fashion"),
                true, false, false
        ));

        // Shoes Products
        productRepository.save(new Product(
                "Nike Air Max 270 Sport Sneaker",
                "Large Max Air heel unit delivers responsive cushioning all day. Lightweight breathable knit mesh upper with dual-density foam midsole.",
                BigDecimal.valueOf(160.00),
                18,
                75,
                BigDecimal.valueOf(4.85),
                1890,
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
                catMap.get("Shoes"),
                true, true, true
        ));

        productRepository.save(new Product(
                "Adidas Ultraboost Light Running Shoes",
                "Experience epic energy return with lightweight Boost cushioning and Continental Natural Rubber outsole for extraordinary grip.",
                BigDecimal.valueOf(189.99),
                20,
                50,
                BigDecimal.valueOf(4.78),
                1420,
                "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80",
                catMap.get("Shoes"),
                false, true, true
        ));

        productRepository.save(new Product(
                "Timberland 6-Inch Waterproof Leather Boot",
                "Original waterproof yellow boot crafted with premium nubuck leather, seam-sealed construction, and PrimaLoft insulation.",
                BigDecimal.valueOf(198.00),
                10,
                35,
                BigDecimal.valueOf(4.90),
                880,
                "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=800&q=80",
                catMap.get("Shoes"),
                true, false, false
        ));

        // Home Appliances Products
        productRepository.save(new Product(
                "De'Longhi Magnifica S Espresso Machine",
                "Compact bean-to-cup coffee machine with integrated burr grinder, traditional milk frother, and custom aroma settings.",
                BigDecimal.valueOf(549.99),
                15,
                25,
                BigDecimal.valueOf(4.82),
                760,
                "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80",
                catMap.get("Home Appliances"),
                true, true, false
        ));

        productRepository.save(new Product(
                "Roborock S8 Pro Ultra Robot Vacuum",
                "All-in-one docking station with auto mop washing, hot air drying, and dust emptying. 6000Pa extreme suction and Reactive 3D obstacle avoidance.",
                BigDecimal.valueOf(999.00),
                20,
                20,
                BigDecimal.valueOf(4.75),
                510,
                "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80",
                catMap.get("Home Appliances"),
                true, false, true
        ));

        productRepository.save(new Product(
                "Philips XXL Digital Airfryer (7.2L)",
                "Rapid CombiAir technology for crispy, tender meals using up to 90% less oil. Built-in food thermometer and connected NutriU app.",
                BigDecimal.valueOf(229.50),
                25,
                45,
                BigDecimal.valueOf(4.68),
                940,
                "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&q=80",
                catMap.get("Home Appliances"),
                false, true, true
        ));

        // Beauty Products
        productRepository.save(new Product(
                "Hyaluronic Acid Hydrating Face Serum",
                "Intensive multi-molecular moisture serum enriched with pure hyaluronic acid, niacinamide, and botanical peptides for luminous skin.",
                BigDecimal.valueOf(38.00),
                10,
                120,
                BigDecimal.valueOf(4.88),
                1540,
                "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
                catMap.get("Beauty"),
                true, true, true
        ));

        productRepository.save(new Product(
                "Rose Damascena Revitalizing Face Oil",
                "Pure cold-pressed organic rosehip and damask rose oil blend designed to restore elasticity, calm redness, and boost radiant glow.",
                BigDecimal.valueOf(52.00),
                15,
                80,
                BigDecimal.valueOf(4.75),
                610,
                "https://images.unsplash.com/photo-1608248597359-0027f6acb700?auto=format&fit=crop&w=800&q=80",
                catMap.get("Beauty"),
                false, true, false
        ));

        productRepository.save(new Product(
                "Eau de Parfum 'Velvet Santal' (100ml)",
                "Sophisticated unisex scent opening with cardamon and violet leaves, melting into rich sandalwood, cedarwood, and warm amber resin.",
                BigDecimal.valueOf(135.00),
                20,
                40,
                BigDecimal.valueOf(4.92),
                820,
                "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80",
                catMap.get("Beauty"),
                true, false, true
        ));

        // Accessories Products
        productRepository.save(new Product(
                "Fossil Minimalist Chronograph Watch",
                "44mm stainless steel case with blue sunray dial, brown genuine leather strap, quartz chronograph movement, and 50m water resistance.",
                BigDecimal.valueOf(145.00),
                25,
                55,
                BigDecimal.valueOf(4.70),
                680,
                "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80",
                catMap.get("Accessories"),
                true, true, true
        ));

        productRepository.save(new Product(
                "Ray-Ban Classic Aviator Sunglasses",
                "Iconic gold metal teardrop frame with polarized G-15 green crystal lenses offering 100% UV protection and exceptional clarity.",
                BigDecimal.valueOf(185.00),
                15,
                65,
                BigDecimal.valueOf(4.88),
                1620,
                "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
                catMap.get("Accessories"),
                true, false, true
        ));

        productRepository.save(new Product(
                "Handcrafted Top-Grain Leather Bi-Fold Wallet",
                "RFID blocking slim wallet with 8 card slots, dual currency compartments, and quick-access ID window in rich espresso brown leather.",
                BigDecimal.valueOf(35.00),
                10,
                110,
                BigDecimal.valueOf(4.65),
                730,
                "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
                catMap.get("Accessories"),
                false, true, false
        ));

        logger.info("Sample catalog seeded with 18 high-quality products across 6 categories!");
    }
}
