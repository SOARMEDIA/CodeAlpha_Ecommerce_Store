const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./data/db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'codealpha_super_secret_jwt_key_2026';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Authentication Middleware
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Optional Auth (for users checking out as guest or logged in)
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    } catch {
      req.user = null;
    }
  }
  next();
}

// ----------------- AUTH ROUTES -----------------
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (db.findUserByEmail(email)) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: 'user-' + Date.now(),
      name,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    db.createUser(newUser);

    const token = jwt.sign({ id: newUser.id, name: newUser.name, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

app.get('/api/auth/me', authenticate, (req, res) => {
  const user = db.findUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt } });
});

// ----------------- PRODUCT ROUTES -----------------
app.get('/api/products', (req, res) => {
  let products = db.getProducts();
  const { category, search, minPrice, maxPrice, sort } = req.query;

  if (category && category !== 'All') {
    products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const term = search.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
    );
  }

  if (minPrice) products = products.filter(p => p.price >= parseFloat(minPrice));
  if (maxPrice) products = products.filter(p => p.price <= parseFloat(maxPrice));

  if (sort === 'price-low') products.sort((a, b) => a.price - b.price);
  else if (sort === 'price-high') products.sort((a, b) => b.price - a.price);
  else if (sort === 'rating') products.sort((a, b) => b.rating - a.rating);

  res.json({ count: products.length, products });
});

app.get('/api/products/:id', (req, res) => {
  const product = db.getProductById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ product });
});

// ----------------- ORDER ROUTES -----------------
app.post('/api/orders', optionalAuth, (req, res) => {
  try {
    const { items, shippingDetails, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }
    if (!shippingDetails || !shippingDetails.name || !shippingDetails.address) {
      return res.status(400).json({ error: 'Complete shipping information is required' });
    }

    let subtotal = 0;
    const validatedItems = items.map(item => {
      const prod = db.getProductById(item.productId);
      if (!prod) throw new Error(`Product with ID ${item.productId} was not found`);
      const quantity = Math.max(1, parseInt(item.quantity) || 1);
      const total = prod.price * quantity;
      subtotal += total;
      return {
        productId: prod.id,
        name: prod.name,
        image: prod.image,
        price: prod.price,
        quantity,
        total: parseFloat(total.toFixed(2))
      };
    });

    const tax = parseFloat((subtotal * 0.08).toFixed(2));
    const shipping = subtotal > 150 ? 0 : 15.00;
    const total = parseFloat((subtotal + tax + shipping).toFixed(2));

    const newOrder = {
      id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      userId: req.user ? req.user.id : null,
      userEmail: req.user ? req.user.email : shippingDetails.email,
      items: validatedItems,
      shippingDetails,
      paymentMethod: paymentMethod || 'Credit Card (Mock)',
      pricing: {
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax,
        shipping,
        total
      },
      status: 'Confirmed',
      createdAt: new Date().toISOString()
    };

    db.createOrder(newOrder);
    res.status(201).json({ message: 'Order placed successfully', order: newOrder });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Failed to place order' });
  }
});

app.get('/api/orders', authenticate, (req, res) => {
  const orders = db.getUserOrders(req.user.id);
  res.json({ count: orders.length, orders });
});

// Fallback to index.html for single page navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🛍️ CodeAlpha E-commerce Server running on http://localhost:${PORT}`);
});

