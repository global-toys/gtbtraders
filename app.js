// ===== GLOBAL TOYS & BIRTHDAY TRADERS =====

const DEFAULT_CATEGORIES = [
  { id: 'c1', name: 'Toys & Games', emoji: '🧸' },
  { id: 'c2', name: 'Balloons & Decorations', emoji: '🎈' },
  { id: 'c3', name: 'Gift Items', emoji: '🎁' },
  { id: 'c4', name: 'Birthday Supplies', emoji: '🎂' },
  { id: 'c5', name: 'Party Sets', emoji: '🎉' },
  { id: 'c6', name: 'Stationery', emoji: '✏️' },
];

const DEFAULT_PRODUCTS = [
  { id: 'p1', name: 'Premium Balloon Set (50pcs)', category: 'c2', price: 250, stock: 100, emoji: '🎈', desc: 'Colorful assorted balloons for all occasions. 50 pieces with mixed colors.', featured: true },
  { id: 'p2', name: 'Remote Control Car', category: 'c1', price: 1850, stock: 20, emoji: '🚗', desc: 'High-speed RC car with rechargeable battery. Perfect for kids aged 5+.', featured: true },
  { id: 'p3', name: 'Birthday Banner Set', category: 'c4', price: 180, stock: 60, emoji: '🎀', desc: 'Beautiful "Happy Birthday" banner with stars and confetti design.', featured: true },
  { id: 'p4', name: 'Stuffed Teddy Bear', category: 'c3', price: 650, stock: 35, emoji: '🧸', desc: 'Super soft and huggable teddy bear. Available in 3 sizes.', featured: true },
  { id: 'p5', name: 'Birthday Party Kit', category: 'c5', price: 850, stock: 25, emoji: '🎉', desc: 'All-in-one party kit with plates, cups, napkins, hats and banners for 10 guests.', featured: false },
  { id: 'p6', name: 'Wooden Building Blocks', category: 'c1', price: 480, stock: 40, emoji: '🪀', desc: 'Educational wooden blocks set with 50 pieces. Promotes creativity and motor skills.', featured: false },
  { id: 'p7', name: 'Gift Wrapping Set', category: 'c3', price: 120, stock: 80, emoji: '🎀', desc: 'Beautiful wrapping paper, ribbons and bow set. 5 rolls included.', featured: false },
  { id: 'p8', name: 'Cake Topper Set', category: 'c4', price: 95, stock: 55, emoji: '🎂', desc: 'Elegant birthday cake toppers with numbers and letters.', featured: false },
];

// State
let products   = JSON.parse(localStorage.getItem('gtbt_products')   || 'null') || [...DEFAULT_PRODUCTS];
let categories = JSON.parse(localStorage.getItem('gtbt_categories') || 'null') || [...DEFAULT_CATEGORIES];
let orders     = JSON.parse(localStorage.getItem('gtbt_orders')     || '[]');
let cart       = JSON.parse(localStorage.getItem('gtbt_cart')       || '[]');
let adminCreds = JSON.parse(localStorage.getItem('gtbt_admin')      || 'null') || { user: 'admin', pass: 'gtbt2025' };
let settings   = JSON.parse(localStorage.getItem('gtbt_settings')   || 'null') || { freeDelivery: 19999 };

function save() {
  localStorage.setItem('gtbt_products',   JSON.stringify(products));
  localStorage.setItem('gtbt_categories', JSON.stringify(categories));
  localStorage.setItem('gtbt_orders',     JSON.stringify(orders));
  localStorage.setItem('gtbt_cart',       JSON.stringify(cart));
  localStorage.setItem('gtbt_admin',      JSON.stringify(adminCreds));
  localStorage.setItem('gtbt_settings',   JSON.stringify(settings));
}

// ===== NAVIGATION =====
function showSection(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(name);
  if (el) el.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (name === 'shop') filterProducts();
  // close mobile nav
  document.getElementById('navLinks').classList.remove('open');
}

function toggleNav() {
  document.getElementById('navLinks').classList.toggle('open');
}

// ===== TOAST =====
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + type;
  setTimeout(() => { t.className = 'toast'; }, 3000);
}

// ===== HELPERS =====
function getCategoryName(id) {
  const c = categories.find(c => c.id === id);
  return c ? c.name : 'General';
}
function getCategoryEmoji(id) {
  const c = categories.find(c => c.id === id);
  return c ? c.emoji : '📦';
}

// ===== PRODUCT CARD =====
function productCardHTML(p) {
  const imgContent = p.image
    ? `<img src="${p.image}" alt="${p.name}" onerror="this.parentNode.innerHTML='<span style=font-size:72px>${p.emoji||'🎁'}</span>'">`
    : `<span style="font-size:72px">${p.emoji || '🎁'}</span>`;
  return `
    <div class="product-card" onclick="openProduct('${p.id}')">
      <div class="product-card-img">
        ${imgContent}
        ${p.featured ? '<span class="product-badge">⭐ Featured</span>' : ''}
      </div>
      <div class="product-card-body">
        <div class="product-card-cat">${getCategoryEmoji(p.category)} ${getCategoryName(p.category)}</div>
        <h3>${p.name}</h3>
        <div class="product-card-footer">
          <span class="product-price">Rs. ${p.price.toLocaleString()}</span>
          ${p.stock > 0
            ? `<button class="add-to-cart-btn" onclick="event.stopPropagation();quickAdd('${p.id}',this)">+ Cart</button>`
            : `<span class="out-of-stock-badge">Out of Stock</span>`
          }
        </div>
      </div>
    </div>`;
}

// ===== RENDER =====
function renderFeatured() {
  const featured = products.filter(p => p.featured && p.stock > 0).slice(0, 8);
  const grid = document.getElementById('featuredGrid');
  if (grid) grid.innerHTML = featured.length
    ? featured.map(productCardHTML).join('')
    : '<p style="padding:20px;color:#aaa;grid-column:1/-1">No featured products yet.</p>';
}

function renderCategories() {
  const grid = document.getElementById('categoriesGrid');
  if (!grid) return;
  grid.innerHTML = categories.map(c => {
    const count = products.filter(p => p.category === c.id).length;
    return `<div class="category-card" onclick="filterByCategory('${c.id}')">
      <span>${c.emoji}</span>
      <strong>${c.name}</strong>
      <p>${count} items</p>
    </div>`;
  }).join('');
}

function filterByCategory(catId) {
  showSection('shop');
  document.getElementById('categoryFilter').value = catId;
  filterProducts();
}

function populateCategoryFilter() {
  const sel = document.getElementById('categoryFilter');
  if (!sel) return;
  sel.innerHTML = '<option value="">All Categories</option>' +
    categories.map(c => `<option value="${c.id}">${c.emoji} ${c.name}</option>`).join('');
}

function filterProducts() {
  const catVal    = document.getElementById('categoryFilter')?.value || '';
  const sortVal   = document.getElementById('sortFilter')?.value || 'default';
  const searchVal = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();

  let filtered = [...products];
  if (catVal)    filtered = filtered.filter(p => p.category === catVal);
  if (searchVal) filtered = filtered.filter(p =>
    p.name.toLowerCase().includes(searchVal) ||
    getCategoryName(p.category).toLowerCase().includes(searchVal) ||
    (p.desc || '').toLowerCase().includes(searchVal)
  );
  if (sortVal === 'price-asc')  filtered.sort((a, b) => a.price - b.price);
  if (sortVal === 'price-desc') filtered.sort((a, b) => b.price - a.price);
  if (sortVal === 'name')       filtered.sort((a, b) => a.name.localeCompare(b.name));

  const info = document.getElementById('searchInfo');
  if (searchVal && info) {
    info.style.display = 'block';
    info.textContent = `🔍 Found ${filtered.length} result(s) for "${document.getElementById('searchInput').value}"`;
  } else if (info) {
    info.style.display = 'none';
  }

  const grid = document.getElementById('shopGrid');
  if (grid) grid.innerHTML = filtered.length
    ? filtered.map(productCardHTML).join('')
    : '<div style="padding:40px;text-align:center;color:#aaa;grid-column:1/-1;font-size:16px;font-weight:700">No products found. 😕</div>';
}

function handleSearch(val) {
  if (val.trim()) showSection('shop');
  filterProducts();
}

// ===== PRODUCT MODAL =====
let modalQty = 1;
let modalProductId = null;

function openProduct(id) {
  const p = products.find(p => p.id === id);
  if (!p) return;
  modalProductId = id;
  modalQty = 1;
  const imgContent = p.image
    ? `<img src="${p.image}" alt="${p.name}" style="width:100%;height:200px;object-fit:cover;border-radius:14px" onerror="this.outerHTML='<span style=font-size:90px>${p.emoji||'🎁'}</span>'">`
    : `<span style="font-size:90px">${p.emoji || '🎁'}</span>`;
  document.getElementById('modalContent').innerHTML = `
    <div class="product-modal-inner">
      <div class="product-modal-emoji">${imgContent}</div>
      <span class="cat-tag">${getCategoryEmoji(p.category)} ${getCategoryName(p.category)}</span>
      <h2>${p.name}</h2>
      <div class="product-modal-price">Rs. ${p.price.toLocaleString()}</div>
      ${p.desc ? `<div class="product-modal-desc">${p.desc}</div>` : ''}
      <div style="font-size:13px;color:${p.stock > 0 ? '#059669' : '#E8001C'};font-weight:800">
        ${p.stock > 0 ? `✅ In Stock (${p.stock} available)` : '❌ Out of Stock'}
      </div>
      ${p.stock > 0 ? `
      <div class="qty-row">
        <span style="font-weight:800;font-size:14px">Quantity:</span>
        <div class="qty-controls">
          <button onclick="changeModalQty(-1)">−</button>
          <span id="modalQtyDisplay">1</span>
          <button onclick="changeModalQty(1)">+</button>
        </div>
        <span style="color:var(--blue);font-weight:800;font-size:14px" id="modalSubtotal">Rs. ${p.price.toLocaleString()}</span>
      </div>
      <button class="btn-primary" style="width:100%" onclick="addToCartFromModal('${p.id}')">🛒 Add to Cart</button>
      ` : ''}
    </div>`;
  document.getElementById('productModal').classList.add('open');
}

function changeModalQty(delta) {
  const p = products.find(p => p.id === modalProductId);
  if (!p) return;
  modalQty = Math.max(1, Math.min(p.stock, modalQty + delta));
  document.getElementById('modalQtyDisplay').textContent = modalQty;
  document.getElementById('modalSubtotal').textContent = 'Rs. ' + (p.price * modalQty).toLocaleString();
}

function addToCartFromModal(id) {
  addToCart(id, modalQty);
  closeProductModal();
}

function closeModal(e) {
  if (e.target === document.getElementById('productModal')) closeProductModal();
}

function closeProductModal() {
  document.getElementById('productModal').classList.remove('open');
}

// ===== CART =====
function quickAdd(id, btn) {
  if (btn) {
    btn.textContent = '✓ Added';
    btn.style.background = '#059669';
    btn.style.color = '#fff';
    btn.style.borderColor = '#059669';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = '+ Cart';
      btn.style.background = '';
      btn.style.color = '';
      btn.style.borderColor = '';
      btn.disabled = false;
    }, 1200);
  }
  addToCart(id, 1);
}

function addToCart(id, qty = 1) {
  const p = products.find(p => p.id === id);
  if (!p || p.stock <= 0) return;
  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty = Math.min(existing.qty + qty, p.stock);
  } else {
    cart.push({ id, qty: Math.min(qty, p.stock) });
  }
  save();
  updateCartCount();
  showToast('🛒 Added to cart!', 'success');
}

function updateCartCount() {
  const count = cart.reduce((s, c) => s + c.qty, 0);
  document.getElementById('cartCount').textContent = count;
}

function updateCartUI() {
  updateCartCount();
  renderCartItems();
}

function renderCartItems() {
  const container = document.getElementById('cartItems');
  const footer    = document.getElementById('cartFooter');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `<div class="cart-empty"><p>🛒</p><strong>Your cart is empty</strong><br><span style="font-size:13px;color:#aaa;font-weight:600">Browse our products and add items!</span></div>`;
    if (footer) footer.style.display = 'none';
    return;
  }

  if (footer) footer.style.display = 'block';
  let total = 0;
  container.innerHTML = cart.map(item => {
    const p = products.find(p => p.id === item.id);
    if (!p) return '';
    const sub = p.price * item.qty;
    total += sub;
    return `<div class="cart-item">
      <div class="cart-item-emoji">${p.emoji || '🎁'}</div>
      <div class="cart-item-info">
        <h4>${p.name}</h4>
        <p>Rs. ${p.price.toLocaleString()} × ${item.qty} = Rs. ${sub.toLocaleString()}</p>
      </div>
      <div class="cart-item-controls">
        <button onclick="changeCartQty('${item.id}',-1)">−</button>
        <span>${item.qty}</span>
        <button onclick="changeCartQty('${item.id}',1)">+</button>
        <button class="cart-remove" onclick="removeFromCart('${item.id}')">🗑</button>
      </div>
    </div>`;
  }).join('');

  const totalEl = document.getElementById('cartTotal');
  if (totalEl) totalEl.textContent = 'Rs. ' + total.toLocaleString();
}

function changeCartQty(id, delta) {
  const p    = products.find(p => p.id === id);
  const item = cart.find(c => c.id === id);
  if (!item || !p) return;
  item.qty = Math.max(1, Math.min(item.qty + delta, p.stock));
  save();
  renderCartItems();
  updateCartCount();
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  save();
  renderCartItems();
  updateCartCount();
}

function toggleCart() {
  const sidebar  = document.getElementById('cartSidebar');
  const overlay  = document.getElementById('cartOverlay');
  const isOpen   = sidebar.classList.contains('open');
  sidebar.classList.toggle('open', !isOpen);
  overlay.style.display = isOpen ? 'none' : 'block';
  if (!isOpen) renderCartItems();
}

// ===== CHECKOUT =====
function proceedToCheckout() {
  if (cart.length === 0) { showToast('Your cart is empty!', 'error'); return; }
  toggleCart();
  buildOrderSummary();
  document.getElementById('checkoutModal').classList.add('open');
  document.querySelectorAll('input[name="payment"]').forEach(r => {
    r.addEventListener('change', () => {
      document.getElementById('prepayInfo').style.display =
        (r.value === 'prepay' && r.checked) ? 'block' : 'none';
    });
  });
}

function buildOrderSummary() {
  let total = 0;
  let html  = '';
  cart.forEach(item => {
    const p = products.find(p => p.id === item.id);
    if (!p) return;
    const sub = p.price * item.qty;
    total += sub;
    html += `<div class="order-summary-item"><span>${p.emoji || ''} ${p.name} ×${item.qty}</span><span>Rs. ${sub.toLocaleString()}</span></div>`;
  });
  const threshold   = settings.freeDelivery || 19999;
  const deliveryFee = total >= threshold ? 0 : 100;
  html += deliveryFee > 0
    ? `<div class="order-summary-item"><span>Delivery Fee</span><span>Rs. ${deliveryFee}</span></div>`
    : `<div class="order-summary-item"><span>Delivery Fee</span><span style="color:#059669;font-weight:800">FREE ✅</span></div>`;
  html += `<div class="order-summary-item order-summary-total"><span>Total</span><span style="color:var(--blue)">Rs. ${(total + deliveryFee).toLocaleString()}</span></div>`;
  document.getElementById('orderSummary').innerHTML = html;
}

function closeCheckoutModal(e) {
  if (!e || e.target === document.getElementById('checkoutModal')) {
    document.getElementById('checkoutModal').classList.remove('open');
  }
}

function placeOrder(e) {
  e.preventDefault();
  const name    = document.getElementById('orderName').value.trim();
  const phone   = document.getElementById('orderPhone').value.trim();
  const address = document.getElementById('orderAddress').value.trim();
  const payment = document.querySelector('input[name="payment"]:checked')?.value || 'cod';

  let total = cart.reduce((s, item) => {
    const p = products.find(p => p.id === item.id);
    return s + (p ? p.price * item.qty : 0);
  }, 0);
  const threshold   = settings.freeDelivery || 19999;
  const deliveryFee = total >= threshold ? 0 : 100;
  total += deliveryFee;

  const order = {
    id:      'ORD-' + Date.now(),
    name, phone, address, payment,
    items:   cart.map(c => ({ ...c })),
    total,
    status:  'Pending',
    date:    new Date().toLocaleString('en-NP', { timeZone: 'Asia/Kathmandu' })
  };

  orders.unshift(order);

  // Send email notification via Formspree
  fetch('https://formspree.io/f/mbdppekw', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      OrderID:  order.id,
      Name:     name,
      Phone:    phone,
      Address:  address,
      Payment:  payment === 'cod' ? 'Cash on Delivery' : 'Prepayment (eSewa/Khalti)',
      Items:    cart.map(i => {
        const p = products.find(p => p.id === i.id);
        return p ? p.name + ' x' + i.qty : '';
      }).filter(Boolean).join(', '),
      Total:    'Rs. ' + total.toLocaleString(),
      Date:     order.date
    })
  }).catch(() => {}); // silent fail — order still saves even if email fails

  // Reduce stock
  cart.forEach(item => {
    const p = products.find(p => p.id === item.id);
    if (p) p.stock = Math.max(0, p.stock - item.qty);
  });

  cart = [];
  save();
  updateCartCount();
  closeCheckoutModal();
  document.getElementById('orderName').value    = '';
  document.getElementById('orderPhone').value   = '';
  document.getElementById('orderAddress').value = '';

  showToast('🎉 Order placed! We\'ll call you to confirm.', 'success');
  setTimeout(() => {
    alert(`✅ Order Confirmed!\n\nOrder ID: ${order.id}\nName: ${name}\nPhone: ${phone}\nPayment: ${payment === 'cod' ? 'Cash on Delivery' : 'Prepayment (eSewa/Khalti)'}\nTotal: Rs. ${total.toLocaleString()}\n\nWe will call you at ${phone} to confirm your order.\n\nThank you for shopping with Global Toys & Birthday Traders! 🎁`);
  }, 400);
}

// ===== CONTACT =====
function submitContact(e) {
  e.preventDefault();
  showToast('✅ Message sent! We\'ll get back to you soon.', 'success');
  e.target.reset();
}

// ===== ADMIN =====
function showAdminLogin() {
  document.getElementById('adminLoginModal').classList.add('open');
}
function closeAdminLogin() {
  document.getElementById('adminLoginModal').classList.remove('open');
}
function adminLogin(e) {
  e.preventDefault();
  const user = document.getElementById('adminUser').value.trim();
  const pass = document.getElementById('adminPass').value;
  if (user === adminCreds.user && pass === adminCreds.pass) {
    closeAdminLogin();
    document.getElementById('adminPanel').style.display = 'flex';
    document.getElementById('adminPanel').style.flexDirection = 'column';
    renderAdminProducts();
    renderAdminOrders();
    renderAdminCategories();
    populateAdminCategorySelect();
    loadAdminSettings();
    document.getElementById('adminUser').value = '';
    document.getElementById('adminPass').value = '';
  } else {
    showToast('❌ Invalid username or password', 'error');
  }
}
function exitAdmin() {
  document.getElementById('adminPanel').style.display = 'none';
  renderFeatured();
  renderCategories();
  populateCategoryFilter();
  filterProducts();
}
function adminTab(name) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-nav-btn').forEach(b => b.classList.remove('active'));
  const tab = document.getElementById('tab-' + name);
  if (tab) tab.classList.add('active');
  document.querySelectorAll('.admin-nav-btn').forEach(b => {
    if (b.getAttribute('onclick')?.includes("'" + name + "'")) b.classList.add('active');
  });
}

// ADMIN PRODUCTS
function renderAdminProducts() {
  const search   = (document.getElementById('adminProductSearch')?.value || '').toLowerCase();
  const filtered = products.filter(p => !search || p.name.toLowerCase().includes(search));
  const container = document.getElementById('adminProductsTable');
  if (!container) return;
  if (!filtered.length) {
    container.innerHTML = '<div style="padding:24px;text-align:center;color:#aaa;font-weight:700">No products found.</div>';
    return;
  }
  container.innerHTML = filtered.map(p => `
    <div class="admin-product-row">
      <div class="admin-product-emoji">${p.emoji || '🎁'}</div>
      <div class="admin-product-info">
        <h4>${p.name}</h4>
        <p>${getCategoryName(p.category)}${p.featured ? ' • ⭐ Featured' : ''}</p>
      </div>
      <div>
        <div class="admin-product-price">Rs. ${p.price.toLocaleString()}</div>
        <div class="admin-product-stock">Stock: ${p.stock}</div>
      </div>
      <div class="admin-product-actions">
        <button class="edit-btn" onclick="openEditProduct('${p.id}')">✏️ Edit</button>
        <button class="delete-btn" onclick="deleteProduct('${p.id}')">🗑 Delete</button>
      </div>
    </div>`).join('');
}

function openAddProduct() {
  document.getElementById('productFormTitle').textContent = '+ Add New Product';
  ['pName','pPrice','pStock','pDesc','pEmoji','pImage','pEditId'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('pFeatured').checked = false;
  adminTab('add-product');
}

function openEditProduct(id) {
  const p = products.find(p => p.id === id);
  if (!p) return;
  document.getElementById('productFormTitle').textContent = '✏️ Edit Product';
  document.getElementById('pName').value     = p.name;
  document.getElementById('pCategory').value = p.category;
  document.getElementById('pPrice').value    = p.price;
  document.getElementById('pStock').value    = p.stock;
  document.getElementById('pDesc').value     = p.desc || '';
  document.getElementById('pEmoji').value    = p.emoji || '';
  document.getElementById('pImage').value    = p.image || '';
  document.getElementById('pFeatured').checked = !!p.featured;
  document.getElementById('pEditId').value   = id;
  adminTab('add-product');
}

function saveProduct(e) {
  e.preventDefault();
  const editId = document.getElementById('pEditId').value;
  const data = {
    name:     document.getElementById('pName').value.trim(),
    category: document.getElementById('pCategory').value,
    price:    parseFloat(document.getElementById('pPrice').value),
    stock:    parseInt(document.getElementById('pStock').value),
    desc:     document.getElementById('pDesc').value.trim(),
    emoji:    document.getElementById('pEmoji').value.trim(),
    image:    document.getElementById('pImage').value.trim(),
    featured: document.getElementById('pFeatured').checked,
  };
  if (editId) {
    const idx = products.findIndex(p => p.id === editId);
    if (idx !== -1) products[idx] = { ...products[idx], ...data };
    showToast('✅ Product updated!', 'success');
  } else {
    data.id = 'p' + Date.now();
    products.unshift(data);
    showToast('✅ Product added!', 'success');
  }
  save();
  adminTab('products');
  renderAdminProducts();
}

function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  products = products.filter(p => p.id !== id);
  save();
  renderAdminProducts();
  showToast('🗑 Product deleted', '');
}

function populateAdminCategorySelect() {
  const sel = document.getElementById('pCategory');
  if (sel) sel.innerHTML = categories.map(c => `<option value="${c.id}">${c.emoji} ${c.name}</option>`).join('');
}

// ADMIN ORDERS
function renderAdminOrders() {
  const container = document.getElementById('adminOrdersList');
  if (!container) return;
  if (!orders.length) {
    container.innerHTML = '<div style="padding:40px;text-align:center;color:#aaa;font-weight:700">No orders yet.</div>';
    return;
  }
  container.innerHTML = orders.map(o => {
    const itemsList = o.items.map(item => {
      const p = products.find(p => p.id === item.id);
      return p ? `${p.emoji || ''} ${p.name} ×${item.qty}` : '';
    }).filter(Boolean).join(', ');
    return `<div class="order-card">
      <div class="order-card-header">
        <div>
          <h4>${o.id}</h4>
          <p style="font-size:12px;color:#aaa;margin-top:2px;font-weight:600">${o.date}</p>
        </div>
        <span class="order-status ${o.status === 'Pending' ? 'status-pending' : 'status-confirmed'}">${o.status}</span>
      </div>
      <div style="font-size:14px;margin-bottom:6px;font-weight:800">👤 ${o.name} &nbsp;|&nbsp; 📞 ${o.phone}</div>
      <div style="font-size:13px;color:#666;margin-bottom:6px;font-weight:600">📍 ${o.address}</div>
      <div style="font-size:13px;color:#888;margin-bottom:10px;font-weight:700">💳 ${o.payment === 'cod' ? 'Cash on Delivery' : 'Prepayment'}</div>
      <div class="order-items-list">${itemsList}</div>
      <div class="order-footer">
        <div class="order-total">Rs. ${o.total.toLocaleString()}</div>
        <select onchange="updateOrderStatus('${o.id}',this.value)">
          <option ${o.status==='Pending'   ?'selected':''}>Pending</option>
          <option ${o.status==='Confirmed' ?'selected':''}>Confirmed</option>
          <option ${o.status==='Delivered' ?'selected':''}>Delivered</option>
          <option ${o.status==='Cancelled' ?'selected':''}>Cancelled</option>
        </select>
      </div>
    </div>`;
  }).join('');
}

function updateOrderStatus(id, status) {
  const o = orders.find(o => o.id === id);
  if (o) { o.status = status; save(); showToast('✅ Order status updated!', 'success'); }
}

// ADMIN CATEGORIES
function renderAdminCategories() {
  const container = document.getElementById('categoriesList');
  if (!container) return;
  container.innerHTML = categories.map(c => `
    <div class="cat-admin-item">
      <div class="cat-info">
        <span>${c.emoji}</span>
        <span>${c.name}</span>
        <span style="color:#aaa;font-size:13px;font-weight:600">(${products.filter(p => p.category === c.id).length} products)</span>
      </div>
      <div class="admin-product-actions">
        <button class="delete-btn" onclick="deleteCategory('${c.id}')">🗑 Remove</button>
      </div>
    </div>`).join('');
}

function addCategory() {
  const name = prompt('Category name:');
  if (!name) return;
  const emoji = prompt('Category emoji (e.g. 🎈):') || '📦';
  categories.push({ id: 'c' + Date.now(), name: name.trim(), emoji });
  save();
  renderAdminCategories();
  populateCategoryFilter();
  populateAdminCategorySelect();
  renderCategories();
  showToast('✅ Category added!', 'success');
}

function deleteCategory(id) {
  if (products.some(p => p.category === id)) {
    showToast('⚠️ Cannot delete: products use this category.', 'error');
    return;
  }
  if (!confirm('Delete this category?')) return;
  categories = categories.filter(c => c.id !== id);
  save();
  renderAdminCategories();
  populateCategoryFilter();
  renderCategories();
  showToast('🗑 Category removed', '');
}

// ADMIN SETTINGS
function loadAdminSettings() {
  const u = document.getElementById('setUser');
  const fd = document.getElementById('setFreeDelivery');
  if (u)  u.value  = adminCreds.user || '';
  if (fd) fd.value = settings.freeDelivery || 19999;
}

function saveSettings(e) {
  e.preventDefault();
  const newUser = document.getElementById('setUser').value.trim();
  const newPass = document.getElementById('setPass').value;
  const ann     = document.getElementById('setAnnouncement').value.trim();
  const fd      = parseInt(document.getElementById('setFreeDelivery').value) || 19999;
  if (newUser) adminCreds.user = newUser;
  if (newPass) adminCreds.pass = newPass;
  if (ann) {
    const bar = document.querySelector('.ann-scroll');
    if (bar) bar.textContent = ann;
  }
  settings.freeDelivery = fd;
  save();
  showToast('✅ Settings saved!', 'success');
}

// ===== INIT =====
function init() {
  renderFeatured();
  renderCategories();
  populateCategoryFilter();
  filterProducts();
  updateCartCount();
}

init();
