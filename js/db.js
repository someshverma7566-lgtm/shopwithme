/**
 * js/db.js
 * Simulates a relational database using LocalStorage.
 * Handles the Users, Products, Cart, and Orders models.
 */

const DB_KEY = 'ShopWithMeDB_v2';

// Initial Mock Products — 5 per category
const mockProducts = [
  // Electronics (5)
  { id: 1,  name: "Wireless Headphones",    price: 2999,  category: "Electronics",  image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&q=100",  description: "High-quality noise-canceling wireless headphones." },
  { id: 2,  name: "Smartphone Pro Max",      price: 54999, category: "Electronics",  image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1000&q=100",  description: "Latest flagship smartphone with stunning camera and display." },
  { id: 3,  name: "Laptop UltraBook",        price: 62000, category: "Electronics",  image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1000&q=100",  description: "Thin and powerful ultrabook for professionals and students." },
  { id: 4,  name: "Bluetooth Speaker",       price: 1899,  category: "Electronics",  image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=1000&q=100",  description: "360° surround sound portable bluetooth speaker." },
  { id: 5,  name: "4K Smart TV 55\"",        price: 42999, category: "Electronics",  image: "https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=1000&q=100",  description: "Crystal clear 4K display with smart OS and voice control." },

  // Fashion (5)
  { id: 6,  name: "Formal Men's Suit",       price: 8999,  category: "Fashion",      image: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=1000&q=100",  description: "Elegant formal suit suitable for business and weddings." },
  { id: 7,  name: "Running Sneakers",        price: 3500,  category: "Fashion",      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=100",  description: "Lightweight and comfortable sneakers for daily runs." },
  { id: 8,  name: "Women's Kurti Set",       price: 1299,  category: "Fashion",      image: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=1000&q=100",  description: "Beautiful floral printed kurti with palazzo pants." },
  { id: 9,  name: "Denim Jacket",            price: 2199,  category: "Fashion",      image: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=1000&q=100",  description: "Classic blue denim jacket for all seasons." },
  { id: 10, name: "Casual Linen Shirt",      price: 899,   category: "Fashion",      image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=1000&q=100",  description: "Breathable linen shirt perfect for summer outings." },

  // Grocery (5)
  { id: 11, name: "Organic Coffee Beans",   price: 450,   category: "Grocery",      image: "https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=1000&q=100",  description: "Premium roasted organic coffee beans from Colombia." },
  { id: 12, name: "Basmati Rice 5kg",       price: 380,   category: "Grocery",      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1000&q=100",  description: "Long grain aromatic basmati rice, aged to perfection." },
  { id: 13, name: "Mixed Dry Fruits 1kg",   price: 799,   category: "Grocery",      image: "https://images.unsplash.com/photo-1596591868231-05e58b0b498b?w=1000&q=100",  description: "Premium assorted dry fruits including almonds, cashews and raisins." },
  { id: 14, name: "Cold Pressed Olive Oil", price: 650,   category: "Grocery",      image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=1000&q=100",  description: "Extra virgin cold pressed olive oil for healthy cooking." },
  { id: 15, name: "Organic Green Tea 200g", price: 299,   category: "Grocery",      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1000&q=100",  description: "Premium Japanese green tea for health and wellness." },

  // Gadgets (5)
  { id: 16, name: "Smart Watch Series 8",   price: 12999, category: "Gadgets",      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&q=100",  description: "Advanced fitness and health tracking smartwatch." },
  { id: 17, name: "Wireless Earbuds Pro",   price: 3499,  category: "Gadgets",      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1000&q=100",  description: "True wireless earbuds with active noise cancellation." },
  { id: 18, name: "Drone Mini 4K",          price: 18999, category: "Gadgets",      image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=1000&q=100",  description: "Compact 4K drone with 30 min flight time and GPS." },
  { id: 19, name: "Action Camera GoPro",    price: 22500, category: "Gadgets",      image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1000&q=100",  description: "Waterproof 4K action camera with image stabilization." },
  { id: 20, name: "VR Headset",             price: 8999,  category: "Gadgets",      image: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=1000&q=100",  description: "Immersive virtual reality headset with 3D audio." },

  // Home (5)
  { id: 21, name: "Ergonomic Chair",        price: 9500,  category: "Home",         image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1000&q=100",  description: "Premium ergonomic office chair with lumbar support." },
  { id: 22, name: "Scented Candle Set",     price: 699,   category: "Home",         image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=1000&q=100",  description: "Set of 3 luxury scented candles for home ambiance." },
  { id: 23, name: "Indoor Plant Pot Set",   price: 1299,  category: "Home",         image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=1000&q=100",  description: "Stylish ceramic plant pots, set of 3 with drainage holes." },
  { id: 24, name: "LED Desk Lamp",          price: 1499,  category: "Home",         image: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1000&q=100",  description: "Smart LED desk lamp with adjustable brightness and USB charging." },
  { id: 25, name: "Throw Blanket",          price: 849,   category: "Home",         image: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=1000&q=100",  description: "Super soft knitted throw blanket, perfect for winter evenings." },

  // Accessories (5)
  { id: 26, name: "Leather Wallet",         price: 999,   category: "Accessories",  image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000&q=100",  description: "Slim genuine leather bifold wallet with RFID protection." },
  { id: 27, name: "Aviator Sunglasses",     price: 1299,  category: "Accessories",  image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=1000&q=100",  description: "Classic polarized aviator sunglasses with UV400 protection." },
  { id: 28, name: "Canvas Backpack",        price: 1799,  category: "Accessories",  image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1000&q=100",  description: "Durable 30L canvas backpack for travel and daily use." },
  { id: 29, name: "Stainless Steel Watch",  price: 4999,  category: "Accessories",  image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=1000&q=100",  description: "Elegant stainless steel watch with minimalist design." },
  { id: 30, name: "Leather Belt",           price: 599,   category: "Accessories",  image: "https://images.unsplash.com/photo-1553013941-f7d4c0a3e4b0?w=1000&q=100",  description: "Premium genuine leather belt with classic buckle." },

  // Beauty (5)
  { id: 31, name: "Vitamin C Serum",        price: 799,   category: "Beauty",       image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1000&q=100",  description: "10% Vitamin C brightening face serum for glowing skin." },
  { id: 32, name: "Lipstick Set 6pcs",      price: 1199,  category: "Beauty",       image: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=1000&q=100",  description: "Matte finish long-lasting lipstick set in 6 vibrant shades." },
  { id: 33, name: "Moisturizing Face Cream",price: 549,   category: "Beauty",       image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=1000&q=100",  description: "Deep hydrating day cream with SPF 30 for all skin types." },
  { id: 34, name: "Hair Dryer Pro",         price: 2299,  category: "Beauty",       image: "https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=1000&q=100",  description: "Professional ionic hair dryer with 3 heat settings." },
  { id: 35, name: "Perfume Luxury Oud",     price: 3499,  category: "Beauty",       image: "https://images.unsplash.com/photo-1541643600914-78b084683702?w=1000&q=100",  description: "Long-lasting luxury oud eau de parfum, 100ml." },
  
  // Extra Electronics (5)
  { id: 36, name: "Mechanical Keyboard",    price: 8999,  category: "Electronics",  image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=1000&q=100",  description: "RGB mechanical gaming keyboard with tactile switches." },
  { id: 37, name: "Ultra-Wide Monitor",     price: 32000, category: "Electronics",  image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1000&q=100",  description: "34-inch curved ultra-wide monitor for immersive gaming." },
  { id: 38, name: "Portable SSD 1TB",       price: 7999,  category: "Electronics",  image: "https://images.unsplash.com/photo-1620050868778-0857ac08182b?w=1000&q=100",  description: "High-speed external solid state drive with USB-C." },
  { id: 39, name: "USB-C Hub Multiport",    price: 2500,  category: "Electronics",  image: "https://plus.unsplash.com/premium_photo-1681236896265-1d0ab91f61ca?w=1000&q=100",  description: "7-in-1 USB-C docking station with HDMI and ethernet." },
  { id: 40, name: "Wireless Gaming Mouse",  price: 4500,  category: "Electronics",  image: "https://images.unsplash.com/photo-1527814050087-179f376dd0e7?w=1000&q=100",  description: "Ergonomic wireless mouse with zero latency." },

  // Extra Fashion (5)
  { id: 41, name: "Men's Leather Jacket",   price: 4999,  category: "Fashion",      image: "https://images.unsplash.com/photo-1551028719-001dd5c24e8e?w=1000&q=100",  description: "Classic black biker leather jacket with zip details." },
  { id: 42, name: "Summer Floral Dress",    price: 1599,  category: "Fashion",      image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=1000&q=100",  description: "Lightweight midi dress perfect for summer days." },
  { id: 43, name: "Classic White T-Shirt",  price: 599,   category: "Fashion",      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1000&q=100",  description: "100% organic cotton classic fit white tee." },
  { id: 44, name: "Chino Pants Khaki",      price: 1299,  category: "Fashion",      image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=1000&q=100",  description: "Slim fit stretch chino pants in versatile khaki." },
  { id: 45, name: "Suede Chelsea Boots",    price: 3499,  category: "Fashion",      image: "https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=1000&q=100",  description: "Premium brown suede leather chelsea boots." },

  // Extra Grocery (5)
  { id: 46, name: "Organic Honey 500g",     price: 450,   category: "Grocery",      image: "https://images.unsplash.com/photo-1587049352847-4d4b1ed7adbf?w=1000&q=100",  description: "Pure raw unpasteurized organic forest honey." },
  { id: 47, name: "Peanut Butter Crunchy",  price: 350,   category: "Grocery",      image: "https://images.unsplash.com/photo-1588661730043-4dc9757659dc?w=1000&q=100",  description: "All-natural crunchy peanut butter with no added sugar." },
  { id: 48, name: "Almond Milk 1L",         price: 299,   category: "Grocery",      image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=1000&q=100",  description: "Unsweetened plant-based dairy-free almond milk." },
  { id: 49, name: "Granola Cereal Box",     price: 399,   category: "Grocery",      image: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=1000&q=100",  description: "Oats and honey baked granola with mixed berries." },
  { id: 50, name: "Extra Dark Chocolate",   price: 199,   category: "Grocery",      image: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=1000&q=100",  description: "85% cocoa rich dark chocolate bar." },

  // Extra Gadgets (5)
  { id: 51, name: "Smart Ring Tracker",     price: 14999, category: "Gadgets",      image: "https://images.unsplash.com/photo-1598335965416-8360d00d43e7?w=1000&q=100",  description: "Discreet health and sleep tracking smart ring." },
  { id: 52, name: "Gimbal Stabilizer",      price: 8999,  category: "Gadgets",      image: "https://images.unsplash.com/photo-1678184510009-dd773a4b002f?w=1000&q=100",  description: "3-axis motorized gimbal for smooth smartphone videos." },
  { id: 53, name: "Bluetooth Tracker Tag",  price: 1999,  category: "Gadgets",      image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bb3?w=1000&q=100",  description: "Find your keys and wallet instantly with this smart tag." },
  { id: 54, name: "Power Bank 20000mAh",    price: 2499,  category: "Gadgets",      image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=1000&q=100",  description: "High-capacity fast charging portable power bank." },
  { id: 55, name: "Smart LED Light Bulb",   price: 899,   category: "Gadgets",      image: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=1000&q=100",  description: "Wi-Fi enabled color changing smart LED bulb." },

  // Extra Home (5)
  { id: 56, name: "Bamboo Bed Sheets",      price: 2499,  category: "Home",         image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1000&q=100",  description: "Ultra-soft cooling bamboo viscose bed sheet set." },
  { id: 57, name: "Memory Foam Pillow",     price: 1299,  category: "Home",         image: "https://images.unsplash.com/photo-1584852377317-0d5bfa7b8f9e?w=1000&q=100",  description: "Contoured memory foam pillow for neck support." },
  { id: 58, name: "Modern Area Rug",        price: 4500,  category: "Home",         image: "https://images.unsplash.com/photo-1582236528751-bbbad49de3f6?w=1000&q=100",  description: "Geometric pattern plush area rug for living room." },
  { id: 59, name: "Ceramic Frying Pan",     price: 1899,  category: "Home",         image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=1000&q=100",  description: "Non-toxic non-stick ceramic coated frying pan." },
  { id: 60, name: "Essential Oil Diffuser", price: 1499,  category: "Home",         image: "https://images.unsplash.com/photo-1608510137782-b7d612fcfa2a?w=1000&q=100",  description: "Ultrasonic aromatherapy diffuser with ambient light." },

  // Extra Accessories (5)
  { id: 61, name: "Minimalist Card Holder", price: 499,   category: "Accessories",  image: "https://images.unsplash.com/photo-1605364175323-911ded5d0e2e?w=1000&q=100",  description: "Slim leather front pocket card holder wallet." },
  { id: 62, name: "Leather Crossbody Bag",  price: 2999,  category: "Accessories",  image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1000&q=100",  description: "Elegant genuine leather crossbody shoulder bag." },
  { id: 63, name: "Classic Fedora Hat",     price: 899,   category: "Accessories",  image: "https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?w=1000&q=100",  description: "Wool felt classic fedora hat with a wide brim." },
  { id: 64, name: "Silver Pendant Necklace",price: 1199,  category: "Accessories",  image: "https://images.unsplash.com/photo-1599643478524-fb5244501a35?w=1000&q=100",  description: "Sterling silver delicate chain with crystal pendant." },
  { id: 65, name: "Woven Leather Bracelet", price: 399,   category: "Accessories",  image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1000&q=100",  description: "Handwoven genuine leather multi-layer bracelet." },

  // Extra Beauty (5)
  { id: 66, name: "Hydrating Sheet Masks",  price: 499,   category: "Beauty",       image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=1000&q=100",  description: "Hyaluronic acid facial sheet masks, pack of 5." },
  { id: 67, name: "Exfoliating Body Scrub", price: 899,   category: "Beauty",       image: "https://images.unsplash.com/photo-1541643600914-78b084683702?w=1000&q=100",  description: "Coffee and coconut exfoliating body scrub." },
  { id: 68, name: "Liquid Foundation",      price: 1499,  category: "Beauty",       image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1000&q=100",  description: "Flawless coverage liquid foundation with SPF 20." },
  { id: 69, name: "Eyeshadow Palette",      price: 2199,  category: "Beauty",       image: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=1000&q=100",  description: "Highly pigmented 12-color matte eyeshadow palette." },
  { id: 70, name: "Nourishing Hair Oil",    price: 699,   category: "Beauty",       image: "https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=1000&q=100",  description: "Argan and almond hair oil for intense nourishment." },
];

function initDB() {
  // Version-based reset: if product count < 70, refresh with new data
  let db = localStorage.getItem(DB_KEY);
  if (!db) {
    db = { users: [], products: mockProducts, carts: {}, orders: [] };
    saveDB(db);
  } else {
    let parsed = JSON.parse(db);
    if (!parsed.products || parsed.products.length < 70) {
      parsed.products = mockProducts;
    }
    
    // Patch broken Beauty Images (ID 66-70)
    let patchMap = {
      66: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=1000&q=100",
      67: "https://images.unsplash.com/photo-1541643600914-78b084683702?w=1000&q=100",
      68: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1000&q=100",
      69: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=1000&q=100",
      70: "https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=1000&q=100"
    };
    parsed.products = parsed.products.map(p => {
      if (patchMap[p.id]) p.image = patchMap[p.id];
      return p;
    });

    saveDB(parsed);
  }
}

function getDB() {
  const data = localStorage.getItem(DB_KEY);
  return data ? JSON.parse(data) : null;
}

function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

// Ensure the database is initialized
initDB();

const DB = {
  // PRODUCTS
  getProducts: () => getDB().products,
  getProductById: (id) => getDB().products.find(p => p.id === parseInt(id)),
  addProduct: (product) => {
    let db = getDB();
    product.id = db.products.length ? db.products[db.products.length - 1].id + 1 : 1;
    db.products.push(product);
    saveDB(db);
    return product;
  },
  updateProduct: (id, updatedData) => {
    let db = getDB();
    const index = db.products.findIndex(p => p.id === parseInt(id));
    if (index !== -1) {
      db.products[index] = { ...db.products[index], ...updatedData };
      saveDB(db);
      return true;
    }
    return false;
  },
  deleteProduct: (id) => {
    let db = getDB();
    db.products = db.products.filter(p => p.id !== parseInt(id));
    saveDB(db);
  },

  // USERS
  getUsers: () => getDB().users,
  addUser: (user) => {
    let db = getDB();
    user.id = db.users.length ? db.users[db.users.length - 1].id + 1 : 1;
    db.users.push(user);
    saveDB(db);
    return user;
  },
  getUserByEmail: (email) => getDB().users.find(u => u.email === email),
  updateUser: (userId, updatedData) => {
    let db = getDB();
    const index = db.users.findIndex(u => u.id === parseInt(userId) || u.id === userId);
    if (index !== -1) {
      db.users[index] = { ...db.users[index], ...updatedData };
      saveDB(db);
      return db.users[index];
    }
    return null;
  },

  // CART (using guest cart if user_id is "guest")
  getCart: (userId) => {
    let db = getDB();
    if (!db.carts[userId]) {
      db.carts[userId] = [];
      saveDB(db);
    }
    return db.carts[userId];
  },
  addToCart: (userId, product, quantity = 1) => {
    let db = getDB();
    if (!db.carts[userId]) db.carts[userId] = [];
    
    let cart = db.carts[userId];
    let existingItem = cart.find(item => item.product_id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ id: Date.now(), user_id: userId, product_id: product.id, quantity, product });
    }
    saveDB(db);
  },
  updateCartQuantity: (userId, productId, quantity) => {
    let db = getDB();
    let cart = db.carts[userId];
    if (cart) {
      let item = cart.find(item => item.product_id === parseInt(productId));
      if (item) {
        item.quantity = parseInt(quantity);
        if (item.quantity <= 0) {
          db.carts[userId] = cart.filter(i => i.product_id !== parseInt(productId));
        }
      }
      saveDB(db);
    }
  },
  removeFromCart: (userId, productId) => {
    let db = getDB();
    if (db.carts[userId]) {
      db.carts[userId] = db.carts[userId].filter(item => item.product_id !== parseInt(productId));
      saveDB(db);
    }
  },
  clearCart: (userId) => {
    let db = getDB();
    db.carts[userId] = [];
    saveDB(db);
  },

  // ORDERS
  getOrders: () => getDB().orders,
  getOrdersByUser: (userId) => getDB().orders.filter(o => o.user_id === userId),
  createOrder: (userId, items, total_price, status = "Pending") => {
    let db = getDB();
    let order = {
      id: db.orders.length ? db.orders[db.orders.length - 1].id + 1 : 1,
      user_id: userId,
      items: items,
      total_price: total_price,
      status: status,
      date: new Date().toISOString()
    };
    db.orders.push(order);
    saveDB(db);
    return order;
  },
  updateOrderStatus: (orderId, status) => {
    let db = getDB();
    const order = db.orders.find(o => o.id === parseInt(orderId));
    if (order) {
      order.status = status;
      saveDB(db);
      return true;
    }
    return false;
  }
};

window.DB = DB;
