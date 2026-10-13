// CodeAlpha Internship - Task 1: Simple E-Commerce Store Frontend
// Student: Redeemer Jerrey Kow Williams (CA/DF1/320453)

class StoreApp {
  constructor() {
    this.products = [];
    this.filteredProducts = [];
    this.cart = JSON.parse(localStorage.getItem('apex_cart') || '[]');
    this.token = localStorage.getItem('apex_token') || null;
    this.currentUser = JSON.parse(localStorage.getItem('apex_user') || 'null');
    this.activeCategory = 'All';
    this.searchQuery = '';
    this.sortBy = 'featured';

    this.init();
  }

  async init() {
    this.updateCartBadge();
    this.renderAuthStatus();
    await this.fetchProducts();
    this.renderProducts();
    this.renderCart();
  }

  // Auth Status Render
  renderAuthStatus() {
    const container = document.getElementById('authContainer');
    if (this.currentUser) {
      container.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 0.88rem; font-weight: 600;"><i class="fa-regular fa-circle-user"></i> ${this.currentUser.name}</span>
          <button class="btn btn-outline" style="padding: 6px 10px; font-size: 0.8rem;" onclick="app.logout()">
            <i class="fa-solid fa-arrow-right-from-bracket"></i>
          </button>
        </div>
      `;
    } else {
      container.innerHTML = `
        <button class="btn btn-outline" onclick="app.openAuthModal('login')">
          <i class="fa-regular fa-user"></i> Sign In
        </button>
      `;
    }
  }

  // Fetch Products from API
  async fetchProducts() {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      this.products = data.products || [];
      this.applyFilters();
    } catch (err) {
      this.showToast('Failed to load products. Check server.', 'error');
    }
  }

  applyFilters() {
    let list = [...this.products];
    if (this.activeCategory !== 'All') {
      list = list.filter(p => p.category.toLowerCase() === this.activeCategory.toLowerCase());
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    if (this.sortBy === 'price-low') list.sort((a, b) => a.price - b.price);
    else if (this.sortBy === 'price-high') list.sort((a, b) => b.price - a.price);
    else if (this.sortBy === 'rating') list.sort((a, b) => b.rating - a.rating);

    this.filteredProducts = list;
    this.renderProducts();
  }

  setCategory(category) {
    this.activeCategory = category;
    document.querySelectorAll('.category-pills .pill').forEach(btn => {
      btn.classList.toggle('active', btn.textContent.trim().toLowerCase() === category.toLowerCase());
    });
    document.getElementById('catalogSubtitle').textContent =
      category === 'All' ? 'Showing all inventory' : `Showing category: ${category}`;
    this.applyFilters();
  }

  handleSearch() {
    this.searchQuery = document.getElementById('searchInput').value;
    this.applyFilters();
  }

  handleSort(val) {
    this.sortBy = val;
    this.applyFilters();
  }

  renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (this.filteredProducts.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
          <i class="fa-solid fa-box-open" style="font-size: 3rem; color: #94a3b8; margin-bottom: 12px;"></i>
          <h3>No products found</h3>
          <p style="color: #64748b;">Try adjusting your search criteria or category filter.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = this.filteredProducts.map(p => `
      <div class="product-card">
        <div class="product-thumb" onclick="app.openProductModal('${p.id}')">
          <img src="${p.image}" alt="${p.name}" loading="lazy">
          <span class="badge-category">${p.category}</span>
        </div>
        <div class="product-info">
          <div class="product-rating">
            <i class="fa-solid fa-star"></i>
            <strong>${p.rating}</strong>
            <span>(${p.reviewsCount})</span>
          </div>
          <h3 class="product-title" onclick="app.openProductModal('${p.id}')">${p.name}</h3>
          <div class="product-bottom">
            <div class="price-box">
              <span class="price">$${p.price.toFixed(2)}</span>
              ${p.originalPrice ? `<span class="original-price">$${p.originalPrice.toFixed(2)}</span>` : ''}
            </div>
            <button class="btn btn-primary" onclick="app.addToCart('${p.id}', 1)">
              <i class="fa-solid fa-cart-plus"></i> Add
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Product Modal
  openProductModal(id) {
    const product = this.products.find(p => p.id === id);
    if (!product) return;

    const modalBody = document.getElementById('productModalBody');
    modalBody.innerHTML = `
      <div>
        <img src="${product.image}" alt="${product.name}">
      </div>
      <div>
        <span class="badge badge-accent" style="margin-bottom: 8px;">${product.category}</span>
        <h2 style="font-size: 1.5rem; margin-bottom: 8px;">${product.name}</h2>
        <div class="product-rating" style="margin-bottom: 14px;">
          <i class="fa-solid fa-star"></i> <strong>${product.rating}</strong>
          <span>(${product.reviewsCount} customer reviews)</span>
        </div>
        <div class="price" style="font-size: 1.8rem; margin-bottom: 16px; color: var(--primary);">
          $${product.price.toFixed(2)}
        </div>
        <p style="color: var(--text-muted); margin-bottom: 24px; font-size: 0.95rem;">${product.description}</p>
        
        <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 20px;">
          <label style="font-weight: 600; font-size: 0.9rem;">Qty:</label>
          <input type="number" id="modalQtyInput" min="1" max="${product.stock}" value="1" style="width: 70px; padding: 8px; border: 1px solid var(--border); border-radius: 6px;">
          <span style="font-size: 0.85rem; color: var(--success); font-weight: 600;">In Stock (${product.stock} available)</span>
        </div>

        <button class="btn btn-primary btn-block btn-lg" onclick="app.addFromModal('${product.id}')">
          <i class="fa-solid fa-cart-plus"></i> Add to Cart
        </button>
      </div>
    `;

    document.getElementById('productModal').classList.add('active');
  }

  addFromModal(id) {
    const qty = parseInt(document.getElementById('modalQtyInput').value) || 1;
    this.addToCart(id, qty);
    this.closeProductModal();
  }

  closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
  }

  // Cart Management
  addToCart(productId, quantity = 1) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = this.cart.findIndex(item => item.productId === productId);
    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += quantity;
    } else {
      this.cart.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity
      });
    }

    this.saveCart();
    this.showToast(`Added ${product.name} to cart!`, 'success');
  }

  changeQty(productId, delta) {
    const item = this.cart.find(i => i.productId === productId);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    this.saveCart();
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter(i => i.productId !== productId);
    this.saveCart();
  }

  saveCart() {
    localStorage.setItem('apex_cart', JSON.stringify(this.cart));
    this.updateCartBadge();
    this.renderCart();
  }

  updateCartBadge() {
    const totalCount = this.cart.reduce((acc, item) => acc + item.quantity, 0);
    document.getElementById('cartBadge').textContent = totalCount;
  }

  toggleCart(open) {
    document.getElementById('cartDrawer').classList.toggle('active', open);
    document.getElementById('cartOverlay').classList.toggle('active', open);
  }

  renderCart() {
    const container = document.getElementById('cartItems');
    if (this.cart.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 10px; color: var(--text-muted);">
          <i class="fa-solid fa-cart-arrow-down" style="font-size: 2.5rem; margin-bottom: 10px;"></i>
          <p>Your cart is currently empty</p>
        </div>
      `;
      this.updateCartTotals(0);
      return;
    }

    let subtotal = 0;
    container.innerHTML = this.cart.map(item => {
      const lineTotal = item.price * item.quantity;
      subtotal += lineTotal;
      return `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}">
          <div class="cart-item-details">
            <h4 class="cart-item-title">${item.name}</h4>
            <div class="cart-item-price">$${item.price.toFixed(2)}</div>
            <div class="cart-item-controls">
              <button class="qty-btn" onclick="app.changeQty('${item.productId}', -1)">-</button>
              <span style="font-weight: 600; font-size: 0.9rem;">${item.quantity}</span>
              <button class="qty-btn" onclick="app.changeQty('${item.productId}', 1)">+</button>
              <button class="btn-remove-item" onclick="app.removeFromCart('${item.productId}')">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    this.updateCartTotals(subtotal);
  }

  updateCartTotals(subtotal) {
    const tax = subtotal * 0.08;
    const shipping = subtotal === 0 ? 0 : (subtotal > 150 ? 0 : 15.00);
    const total = subtotal + tax + shipping;

    document.getElementById('cartSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('cartTax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('cartShipping').textContent = shipping === 0 ? (subtotal > 0 ? 'FREE' : '$0.00') : `$${shipping.toFixed(2)}`;
    document.getElementById('cartTotal').textContent = `$${total.toFixed(2)}`;
  }

  // Checkout
  openCheckout() {
    if (this.cart.length === 0) {
      this.showToast('Your cart is empty!', 'error');
      return;
    }
    this.toggleCart(false);

    if (this.currentUser) {
      document.getElementById('shipName').value = this.currentUser.name || '';
      document.getElementById('shipEmail').value = this.currentUser.email || '';
    }

    const subtotal = this.cart.reduce((a, b) => a + (b.price * b.quantity), 0);
    const tax = subtotal * 0.08;
    const shipping = subtotal > 150 ? 0 : 15.00;
    const total = subtotal + tax + shipping;

    document.getElementById('checkoutSummaryBox').innerHTML = `
      <div style="font-weight: 700; margin-bottom: 8px;">Order Summary (${this.cart.length} unique items)</div>
      <div style="font-size: 0.88rem; color: #475569; display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span>Subtotal</span><span>$${subtotal.toFixed(2)}</span>
      </div>
      <div style="font-size: 0.88rem; color: #475569; display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span>Tax (8%)</span><span>$${tax.toFixed(2)}</span>
      </div>
      <div style="font-size: 0.88rem; color: #475569; display: flex; justify-content: space-between; margin-bottom: 6px;">
        <span>Shipping</span><span>${shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2)}</span>
      </div>
      <div style="font-size: 1.05rem; font-weight: 700; color: #0f172a; display: flex; justify-content: space-between; border-top: 1px solid #cbd5e1; padding-top: 6px;">
        <span>Grand Total</span><span>$${total.toFixed(2)}</span>
      </div>
    `;

    document.getElementById('checkoutModal').classList.add('active');
  }

  closeCheckoutModal() {
    document.getElementById('checkoutModal').classList.remove('active');
  }

  async processCheckout(e) {
    e.preventDefault();
    const btn = document.getElementById('btnPlaceOrder');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing Order...';

    const shippingDetails = {
      name: document.getElementById('shipName').value,
      email: document.getElementById('shipEmail').value,
      address: document.getElementById('shipAddress').value,
      city: document.getElementById('shipCity').value,
      zip: document.getElementById('shipZip').value
    };

    const paymentMethod = document.getElementById('paymentMethod').value;

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          items: this.cart,
          shippingDetails,
          paymentMethod
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');

      this.cart = [];
      this.saveCart();
      this.closeCheckoutModal();
      this.showToast(`Order #${data.order.id} placed successfully!`, 'success');

      // Show confirmation alert
      alert(`🎉 Thank you, ${shippingDetails.name}!\n\nYour order #${data.order.id} has been confirmed.\nTotal: $${data.order.pricing.total}\nA confirmation receipt was sent to ${shippingDetails.email}.`);
    } catch (err) {
      this.showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Place Order Now';
    }
  }

  // Auth Modals
  openAuthModal(tab = 'login') {
    this.switchAuthTab(tab);
    document.getElementById('authModal').classList.add('active');
  }

  closeAuthModal() {
    document.getElementById('authModal').classList.remove('active');
  }

  switchAuthTab(tab) {
    const isLogin = tab === 'login';
    document.getElementById('tabLogin').classList.toggle('active', isLogin);
    document.getElementById('tabRegister').classList.toggle('active', !isLogin);
    document.getElementById('loginForm').style.display = isLogin ? 'block' : 'none';
    document.getElementById('registerForm').style.display = !isLogin ? 'block' : 'none';
  }

  async handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      this.token = data.token;
      this.currentUser = data.user;
      localStorage.setItem('apex_token', data.token);
      localStorage.setItem('apex_user', JSON.stringify(data.user));

      this.closeAuthModal();
      this.renderAuthStatus();
      this.showToast(`Welcome back, ${data.user.name}!`, 'success');
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  }

  async handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      this.token = data.token;
      this.currentUser = data.user;
      localStorage.setItem('apex_token', data.token);
      localStorage.setItem('apex_user', JSON.stringify(data.user));

      this.closeAuthModal();
      this.renderAuthStatus();
      this.showToast(`Account created! Welcome, ${data.user.name}!`, 'success');
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  }

  logout() {
    this.token = null;
    this.currentUser = null;
    localStorage.removeItem('apex_token');
    localStorage.removeItem('apex_user');
    this.renderAuthStatus();
    this.showToast('You have been logged out.', 'success');
  }

  // Orders Modal
  async openOrdersModal() {
    if (!this.token) {
      this.openAuthModal('login');
      this.showToast('Please sign in to view your orders.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      const data = await res.json();
      const list = document.getElementById('ordersList');

      if (!data.orders || data.orders.length === 0) {
        list.innerHTML = `
          <div style="text-align: center; padding: 30px; color: #64748b;">
            <i class="fa-solid fa-receipt" style="font-size: 2.5rem; margin-bottom: 10px;"></i>
            <p>No orders placed yet.</p>
          </div>
        `;
      } else {
        list.innerHTML = data.orders.map(order => `
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <strong>Order #${order.id}</strong>
              <span class="badge badge-accent">${order.status}</span>
            </div>
            <div style="font-size: 0.85rem; color: #64748b; margin-bottom: 10px;">
              Date: ${new Date(order.createdAt).toLocaleDateString()} | Total: $${order.pricing.total.toFixed(2)}
            </div>
            <div style="font-size: 0.85rem;">
              ${order.items.map(item => `<div>• ${item.quantity}x ${item.name} ($${item.price.toFixed(2)})</div>`).join('')}
            </div>
          </div>
        `).join('');
      }

      document.getElementById('ordersModal').classList.add('active');
    } catch {
      this.showToast('Failed to load orders', 'error');
    }
  }

  closeOrdersModal() {
    document.getElementById('ordersModal').classList.remove('active');
  }

  showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i>
      <span>${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }
}

const app = new StoreApp();

