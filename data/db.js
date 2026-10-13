const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname);

function ensureFile(filename, defaultContent = []) {
  const filePath = path.join(dataDir, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultContent, null, 2), 'utf-8');
  }
  return filePath;
}

const defaultProducts = [
  {
    id: "prod-1",
    name: "Sony WH-1000XM5 Wireless Headphones",
    category: "Electronics",
    price: 349.99,
    originalPrice: 399.99,
    rating: 4.8,
    reviewsCount: 142,
    stock: 18,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    description: "Industry-leading noise cancellation with two processors and 8 microphones. Exceptional sound quality with Hi-Res Audio support. Up to 30 hours of battery life with quick charging."
  },
  {
    id: "prod-2",
    name: "Apple Watch Series 9 GPS 45mm",
    category: "Electronics",
    price: 429.00,
    originalPrice: 479.00,
    rating: 4.9,
    reviewsCount: 98,
    stock: 25,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
    description: "Powerful health insights with ECG and blood oxygen apps. Bright always-on Retina display and innovative double-tap gesture. Carbon neutral design."
  },
  {
    id: "prod-3",
    name: "Minimalist Leather Backpack",
    category: "Fashion",
    price: 119.50,
    originalPrice: 150.00,
    rating: 4.6,
    reviewsCount: 64,
    stock: 12,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
    description: "Handcrafted top-grain leather backpack featuring padded 15-inch laptop compartment, weather-resistant zipper closures, and ergonomic shoulder straps."
  },
  {
    id: "prod-4",
    name: "Mechanical Gaming Keyboard RGB",
    category: "Electronics",
    price: 89.99,
    originalPrice: 109.99,
    rating: 4.7,
    reviewsCount: 215,
    stock: 30,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
    description: "Tactile brown switches with per-key dynamic RGB backlighting. Aircraft-grade aluminum frame and detachable braided USB-C cable for high durability."
  },
  {
    id: "prod-5",
    name: "Classic Chronograph Watch",
    category: "Fashion",
    price: 185.00,
    originalPrice: 220.00,
    rating: 4.5,
    reviewsCount: 53,
    stock: 9,
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80",
    description: "Timeless stainless steel timepiece with genuine sapphire crystal lens, sub-dials for precision timing, and water resistance up to 50 meters."
  },
  {
    id: "prod-6",
    name: "Ceramic Pour-Over Coffee Maker",
    category: "Home",
    price: 38.00,
    originalPrice: 45.00,
    rating: 4.9,
    reviewsCount: 112,
    stock: 40,
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80",
    description: "Artisan-glazed heat-retention ceramic dripper. Optimized spiral ribbing extracts full-bodied richness and nuanced aromatics from your favorite beans."
  },
  {
    id: "prod-7",
    name: "Ergonomic Desk Chair",
    category: "Home",
    price: 269.00,
    originalPrice: 320.00,
    rating: 4.7,
    reviewsCount: 88,
    stock: 14,
    image: "https://images.unsplash.com/photo-1580481077195-c328a37db71a?w=600&auto=format&fit=crop&q=80",
    description: "Breathable mesh back with dynamic lumbar support, 3D adjustable armrests, and synchro-tilt mechanism for productive full-day comfort."
  },
  {
    id: "prod-8",
    name: "Polarized UV400 Sunglasses",
    category: "Fashion",
    price: 64.99,
    originalPrice: 85.00,
    rating: 4.6,
    reviewsCount: 76,
    stock: 22,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80",
    description: "Ultra-lightweight titanium frame with anti-reflective polarized lenses. 100% protection against UVA and UVB rays in a modern aviator silhouette."
  }
];

class Database {
  constructor() {
    this.usersFile = ensureFile('users.json', []);
    this.productsFile = ensureFile('products.json', defaultProducts);
    this.ordersFile = ensureFile('orders.json', []);
  }

  read(file) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      return JSON.parse(content || '[]');
    } catch {
      return [];
    }
  }

  write(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
  }

  // Users
  getUsers() { return this.read(this.usersFile); }
  findUserByEmail(email) {
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  }
  findUserById(id) {
    return this.getUsers().find(u => u.id === id);
  }
  createUser(userData) {
    const users = this.getUsers();
    users.push(userData);
    this.write(this.usersFile, users);
    return userData;
  }

  // Products
  getProducts() { return this.read(this.productsFile); }
  getProductById(id) {
    return this.getProducts().find(p => p.id === id);
  }

  // Orders
  getOrders() { return this.read(this.ordersFile); }
  getUserOrders(userId) {
    return this.getOrders().filter(o => o.userId === userId);
  }
  createOrder(orderData) {
    const orders = this.getOrders();
    orders.unshift(orderData);
    this.write(this.ordersFile, orders);
    return orderData;
  }
}

module.exports = new Database();

