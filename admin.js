const DEFAULT_PRODUCTS = [
  { id: 1, name: '325 UC - PUBG Mobile', desc: 'شحن 325 يوسي للعبة ببجي موبايل - تعبئة فورية', price: 89, icon: 'fa-crosshairs', glow: 'rgba(255, 100, 0, 0.15)', visible: true },
  { id: 2, name: '100 جوهرة - Free Fire', desc: 'شحن 100 جوهرة للعبة فري فاير - تعبئة فورية', price: 65, icon: 'fa-fire', glow: 'rgba(255, 0, 0, 0.15)', visible: true },
  { id: 3, name: '660 UC - PUBG Mobile', desc: 'شحن 660 يوسي للعبة ببجي موبايل - تعبئة فورية', price: 165, icon: 'fa-crosshairs', glow: 'rgba(255, 100, 0, 0.15)', visible: true },
  { id: 4, name: '530 جوهرة - Free Fire', desc: 'شحن 530 جوهرة للعبة فري فاير - تعبئة فورية', price: 259, icon: 'fa-fire', glow: 'rgba(255, 0, 0, 0.15)', visible: true },
  { id: 5, name: '1800 UC - PUBG Mobile', desc: 'شحن 1800 يوسي للعبة ببجي موبايل - تعبئة فورية', price: 419, icon: 'fa-crosshairs', glow: 'rgba(255, 100, 0, 0.15)', visible: true },
  { id: 6, name: '1060 جوهرة - Free Fire', desc: 'شحن 1060 جوهرة للعبة فري فاير - تعبئة فورية', price: 449, icon: 'fa-fire', glow: 'rgba(255, 0, 0, 0.15)', visible: true },
  { id: 7, name: '3850 UC - PUBG Mobile', desc: 'شحن 3850 يوسي للعبة ببجي موبايل - تعبئة فورية', price: 849, icon: 'fa-crosshairs', glow: 'rgba(255, 100, 0, 0.15)', visible: true },
  { id: 8, name: '2180 جوهرة - Free Fire', desc: 'شحن 2180 جوهرة للعبة فري فاير - تعبئة فورية', price: 839, icon: 'fa-fire', glow: 'rgba(255, 0, 0, 0.15)', visible: true },
];

const DATA_VERSION = 'dola_v3';

function checkDataVersion() {
  const v = localStorage.getItem('neon_version');
  if (v !== DATA_VERSION) {
    localStorage.clear();
    localStorage.setItem('neon_version', DATA_VERSION);
  }
}
checkDataVersion();

const DB = {
  get(key, fallback) {
    try { const d = localStorage.getItem('neon_' + key); return d ? JSON.parse(d) : fallback; }
    catch { return fallback; }
  },
  set(key, val) { localStorage.setItem('neon_' + key, JSON.stringify(val)); },
  products: { get() { return DB.get('products', DEFAULT_PRODUCTS); }, set(v) { DB.set('products', v); } },
  users: { get() { return DB.get('users', []); }, set(v) { DB.set('users', v); } },
  orders: { get() { return DB.get('orders', []); }, set(v) { DB.set('orders', v); } },
  wallets: { get() { return DB.get('wallets', []); }, set(v) { DB.set('wallets', v); } },
  deposits: { get() { return DB.get('deposits', []); }, set(v) { DB.set('deposits', v); } },
  content: { get() { return DB.get('content', {}); }, set(v) { DB.set('content', v); } },
  events: { get() { return DB.get('events', []); }, set(v) { DB.set('events', v); } },
  contacts: { get() { return DB.get('contacts', []); }, set(v) { DB.set('contacts', v); } },
  ads: { get() { return DB.get('ads', {}); }, set(v) { DB.set('ads', v); } },
  settings: { get() { return DB.get('settings', { siteName: 'Dola store', shipping: 25, adminPass: 'admin', transferNumbers: ['01012345678 - البنك الأهلي', '01098765432 - بنك مصر'] }); }, set(v) { DB.set('settings', v); } },
};

function getWallet(userId) {
  const wallets = DB.wallets.get();
  let w = wallets.find(x => x.userId === userId);
  if (!w) { w = { userId, balance: 0 }; wallets.push(w); DB.wallets.set(wallets); }
  return w;
}

function formatBalance(n) { return n.toLocaleString('ar-EG') + ' جنيه'; }

// ===== AUTH =====
function checkAuth() { return sessionStorage.getItem('neon_admin') === '1'; }

document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const user = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value;
  const settings = DB.settings.get();
  const adminPass = settings.adminPass || 'admin';
  if (user === 'admin' && pass === adminPass) {
    sessionStorage.setItem('neon_admin', '1');
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'flex';
    loadAll();
  } else {
    document.getElementById('loginError').textContent = 'اسم المستخدم أو كلمة المرور غير صحيحة';
  }
});

document.getElementById('logoutBtn').addEventListener('click', (e) => {
  e.preventDefault();
  sessionStorage.removeItem('neon_admin');
  document.getElementById('adminLogin').style.display = 'flex';
  document.getElementById('adminDashboard').style.display = 'none';
});

if (checkAuth()) {
  document.getElementById('adminLogin').style.display = 'none';
  document.getElementById('adminDashboard').style.display = 'flex';
  loadAll();
}

// ===== NAVIGATION =====
document.querySelectorAll('.sidebar-link[data-page]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    document.querySelectorAll('.admin-page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + link.dataset.page).classList.add('active');
    const page = link.dataset.page;
    if (page === 'dashboard') loadDashboard();
    if (page === 'products') renderProducts();
    if (page === 'orders') renderOrders();
    if (page === 'deposits') renderDeposits();
    if (page === 'wallets') renderWallets();
    if (page === 'users') renderUsers();
    if (page === 'content') loadContentForm();
    if (page === 'events') renderEvents();
    if (page === 'messages') renderMessages();
    if (page === 'ads') renderAdsForm();
  });
});

// ===== PRODUCTS =====
function renderProducts() {
  const products = DB.products.get();
  const tbody = document.getElementById('productsBody');
  tbody.innerHTML = products.map(p => `
    <tr>
      <td><i class="fas ${p.icon}" style="margin-left:10px;color:${p.glow?.replace('0.15','1') || 'var(--primary)'}"></i>${p.name}<br><small style="color:var(--text-secondary)">${p.desc}</small></td>
      <td>${p.price} جنيه</td>
      <td><span class="toggle-visible ${p.visible !== false ? 'on' : 'off'}" data-id="${p.id}"><i class="fas ${p.visible !== false ? 'fa-eye' : 'fa-eye-slash'}"></i></span></td>
      <td class="actions">
        <button class="btn-admin-small" onclick="editProduct(${p.id})"><i class="fas fa-edit"></i></button>
        <button class="btn-admin-danger" onclick="deleteProduct(${p.id})"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
  tbody.querySelectorAll('.toggle-visible').forEach(el => { el.addEventListener('click', () => toggleVisibility(+el.dataset.id)); });
}

function toggleVisibility(id) {
  const products = DB.products.get();
  const p = products.find(x => x.id === id);
  if (p) { p.visible = p.visible === false ? true : false; DB.products.set(products); renderProducts(); }
}

function editProduct(id) {
  const products = DB.products.get();
  const p = products.find(x => x.id === id);
  if (!p) return;
  document.getElementById('productModalTitle').textContent = 'تعديل منتج';
  document.getElementById('prodId').value = p.id;
  document.getElementById('prodName').value = p.name;
  document.getElementById('prodDesc').value = p.desc;
  document.getElementById('prodPrice').value = p.price;
  document.getElementById('prodIcon').value = p.icon;
  document.getElementById('productModal').classList.add('active');
}

function deleteProduct(id) {
  if (!confirm('تأكيد حذف المنتج؟')) return;
  let products = DB.products.get();
  products = products.filter(p => p.id !== id);
  DB.products.set(products);
  renderProducts();
  loadDashboard();
}

document.getElementById('addProductBtn').addEventListener('click', () => {
  document.getElementById('productModalTitle').textContent = 'إضافة منتج';
  document.getElementById('prodId').value = '';
  document.getElementById('prodName').value = '';
  document.getElementById('prodDesc').value = '';
  document.getElementById('prodPrice').value = '';
  document.getElementById('prodIcon').value = '';
  document.getElementById('productModal').classList.add('active');
});

document.getElementById('productModalClose').addEventListener('click', () => { document.getElementById('productModal').classList.remove('active'); });
document.getElementById('productModal').addEventListener('click', (e) => { if (e.target === e.currentTarget) e.target.classList.remove('active'); });

document.getElementById('productForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('prodId').value;
  const name = document.getElementById('prodName').value.trim();
  const desc = document.getElementById('prodDesc').value.trim();
  const price = +document.getElementById('prodPrice').value;
  const icon = document.getElementById('prodIcon').value.trim();
  const products = DB.products.get();
  if (id) {
    const p = products.find(x => x.id === +id);
    if (p) Object.assign(p, { name, desc, price, icon });
  } else {
    const newId = products.length > 0 ? Math.max(...products.map(x => x.id)) + 1 : 1;
    const colors = ['rgba(37,99,235,0.15)', 'rgba(245,158,11,0.15)', 'rgba(16,185,129,0.15)', 'rgba(99,102,241,0.15)', 'rgba(236,72,153,0.15)'];
    products.push({ id: newId, name, desc, price, icon, glow: colors[newId % colors.length], visible: true });
  }
  DB.products.set(products);
  document.getElementById('productModal').classList.remove('active');
  renderProducts();
  loadDashboard();
});

// ===== ORDERS =====
function renderOrders() {
  const orders = DB.orders.get();
  const tbody = document.getElementById('ordersBody');
  tbody.innerHTML = orders.length === 0
    ? '<tr><td colspan="8" style="text-align:center;color:var(--text-secondary)">لا توجد طلبات</td></tr>'
    : orders.sort((a,b) => b.id - a.id).map(o => `
    <tr>
      <td>#${o.id.toString().slice(-6)}</td>
      <td>${o.userName || '—'}<br><small style="color:var(--text-secondary)">${o.userEmail || ''}</small></td>
      <td>${o.items.map(i => `${i.name} ×${i.qty}`).join(', ')}</td>
      <td>${o.deliveryType === 'id' ? '<i class="fas fa-hashtag"></i> ID' : '<i class="fas fa-user-circle"></i> أكونت'}: ${o.deliveryValue || '—'}</td>
      <td>${o.total} جنيه ${o.paid ? `<br><small style="color:var(--green)">مدفوع: ${o.paid} جنيه</small>` : ''}</td>
      <td>${new Date(o.date).toLocaleDateString('ar-SA')}</td>
      <td><span class="status-badge status-${o.status}">${o.status === 'pending' ? 'قيد الانتظار' : o.status === 'shipped' ? 'تم الشحن' : 'مكتمل'}</span></td>
      <td class="actions">
        <select onchange="updateOrderStatus(${o.id}, this.value)" style="padding:6px 10px;border-radius:6px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-family:'Cairo',sans-serif;font-size:0.8rem;outline:none">
          <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>قيد الانتظار</option>
          <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>تم الشحن</option>
          <option value="completed" ${o.status === 'completed' ? 'selected' : ''}>مكتمل</option>
        </select>
        <button class="btn-admin-danger" onclick="deleteOrder(${o.id})"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

function updateOrderStatus(id, status) {
  const orders = DB.orders.get();
  const o = orders.find(x => x.id === id);
  if (o) { o.status = status; DB.orders.set(orders); renderOrders(); loadDashboard(); }
}

function deleteOrder(id) {
  if (!confirm('تأكيد حذف الطلب؟')) return;
  let orders = DB.orders.get();
  orders = orders.filter(o => o.id !== id);
  DB.orders.set(orders);
  renderOrders();
  loadDashboard();
}

// ===== DEPOSITS =====
function renderDeposits() {
  const deposits = DB.deposits.get();
  const tbody = document.getElementById('depositsBody');
  tbody.innerHTML = deposits.length === 0
    ? '<tr><td colspan="7" style="text-align:center;color:var(--text-secondary)">لا توجد طلبات إيداع</td></tr>'
    : deposits.sort((a,b) => b.id - a.id).map(d => `
    <tr>
      <td>#${d.id.toString().slice(-6)}</td>
      <td>${d.userName || '—'}</td>
      <td>${d.amount} جنيه</td>
      <td>${d.transferNum || '—'}</td>
      <td>${new Date(d.date).toLocaleDateString('ar-SA')}</td>
      <td><span class="status-badge status-${d.status}">${d.status === 'pending' ? 'قيد المراجعة' : d.status === 'approved' ? 'تمت الموافقة' : 'مرفوض'}</span></td>
      <td class="actions">
        ${d.status === 'pending'
          ? `<button class="btn-admin-small" onclick="approveDeposit(${d.id})" style="color:var(--green)"><i class="fas fa-check"></i> موافقة</button>
             <button class="btn-admin-danger" onclick="rejectDeposit(${d.id})"><i class="fas fa-times"></i> رفض</button>`
          : `<button class="btn-admin-danger" onclick="deleteDeposit(${d.id})"><i class="fas fa-trash"></i></button>`}
      </td>
    </tr>
  `).join('');
}

function approveDeposit(id) {
  const deposits = DB.deposits.get();
  const d = deposits.find(x => x.id === id);
  if (!d) return;
  d.status = 'approved';
  DB.deposits.set(deposits);
  const wAll = DB.wallets.get();
  let wallet = wAll.find(x => x.userId === d.userId);
  if (!wallet) { wallet = { userId: d.userId, balance: 0 }; wAll.push(wallet); }
  wallet.balance += d.amount;
  DB.wallets.set(wAll);
  renderDeposits();
  renderWallets();
  loadDashboard();
}

function rejectDeposit(id) {
  const deposits = DB.deposits.get();
  const d = deposits.find(x => x.id === id);
  if (!d) return;
  d.status = 'rejected';
  DB.deposits.set(deposits);
  renderDeposits();
}

function deleteDeposit(id) {
  if (!confirm('تأكيد الحذف؟')) return;
  let deposits = DB.deposits.get();
  deposits = deposits.filter(d => d.id !== id);
  DB.deposits.set(deposits);
  renderDeposits();
}

// ===== WALLETS =====
function renderWallets() {
  const users = DB.users.get();
  const wallets = DB.wallets.get();
  const tbody = document.getElementById('walletsBody');
  tbody.innerHTML = users.length === 0
    ? '<tr><td colspan="4" style="text-align:center;color:var(--text-secondary)">لا يوجد مستخدمين</td></tr>'
    : users.map(u => {
        const w = wallets.find(x => x.userId === u.id) || { balance: 0 };
        return `<tr>
          <td>${u.name}</td>
          <td>${u.email}</td>
          <td>${formatBalance(w.balance)}</td>
          <td class="actions">
            <button class="btn-admin-small" onclick="showAddCredit(${u.id}, '${u.name}')"><i class="fas fa-plus"></i> إضافة رصيد</button>
            <button class="btn-admin-danger" onclick="deductCredit(${u.id})"><i class="fas fa-minus"></i> خصم</button>
          </td>
        </tr>`;
      }).join('');
}

function showAddCredit(id, name) {
  document.getElementById('creditUserId').value = id;
  document.getElementById('creditUserName').textContent = 'المستخدم: ' + name;
  document.getElementById('creditAmount').value = '';
  document.getElementById('creditModal').classList.add('active');
}

document.getElementById('creditModalClose').addEventListener('click', () => { document.getElementById('creditModal').classList.remove('active'); });
document.getElementById('creditModal').addEventListener('click', (e) => { if (e.target === e.currentTarget) e.target.classList.remove('active'); });

document.getElementById('creditForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const userId = +document.getElementById('creditUserId').value;
  const amount = +document.getElementById('creditAmount').value;
  if (!amount || amount < 1) return;
  const wAll = DB.wallets.get();
  let wallet = wAll.find(x => x.userId === userId);
  if (!wallet) { wallet = { userId, balance: 0 }; wAll.push(wallet); }
  wallet.balance += amount;
  DB.wallets.set(wAll);
  document.getElementById('creditModal').classList.remove('active');
  renderWallets();
  loadDashboard();
  alert('تم إضافة ' + formatBalance(amount) + ' للمستخدم');
});

function deductCredit(userId) {
  const amount = prompt('أدخل المبلغ المراد خصمه:');
  if (!amount) return;
  const val = +amount;
  if (val < 1) return;
  const wAll = DB.wallets.get();
  const wallet = wAll.find(x => x.userId === userId);
  if (!wallet) return;
  wallet.balance -= val;
  DB.wallets.set(wAll);
  renderWallets();
  loadDashboard();
}

// ===== USERS =====
function renderUsers() {
  const users = DB.users.get();
  const tbody = document.getElementById('usersBody');
  tbody.innerHTML = users.length === 0
    ? '<tr><td colspan="6" style="text-align:center;color:var(--text-secondary)">لا يوجد مستخدمين</td></tr>'
    : users.map(u => `
    <tr>
      <td>${u.id}</td>
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td>${new Date(u.createdAt).toLocaleDateString('ar-SA')}</td>
      <td>${u.banned ? '<span style="color:var(--red)">محظور</span>' : '<span style="color:var(--green)">نشط</span>'}</td>
      <td class="actions">
        ${u.banned
          ? `<button class="btn-admin-small" onclick="unbanUser(${u.id})"><i class="fas fa-check"></i> إلغاء الحظر</button>`
          : `<button class="btn-admin-danger" onclick="banUser(${u.id})"><i class="fas fa-ban"></i> حظر</button>`}
        <button class="btn-admin-danger" onclick="deleteUser(${u.id})"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

function banUser(id) {
  if (!confirm('تأكيد حظر المستخدم؟')) return;
  const users = DB.users.get();
  const u = users.find(x => x.id === id);
  if (u) { u.banned = true; DB.users.set(users); renderUsers(); }
}

function unbanUser(id) {
  const users = DB.users.get();
  const u = users.find(x => x.id === id);
  if (u) { u.banned = false; DB.users.set(users); renderUsers(); }
}

function deleteUser(id) {
  if (!confirm('تأكيد حذف المستخدم؟')) return;
  let users = DB.users.get();
  users = users.filter(u => u.id !== id);
  DB.users.set(users);
  renderUsers();
  loadDashboard();
}

// ===== DASHBOARD =====
function loadDashboard() {
  const products = DB.products.get();
  const users = DB.users.get();
  const orders = DB.orders.get();
  const revenue = orders.reduce((s, o) => s + o.total, 0);
  document.getElementById('statRevenue').textContent = revenue;
  document.getElementById('statOrders').textContent = orders.length;
  document.getElementById('statProducts').textContent = products.length;
  document.getElementById('statUsers').textContent = users.length;

  const recent = [...orders].sort((a, b) => b.id - a.id).slice(0, 5);
  const container = document.getElementById('recentOrdersList');
  container.innerHTML = recent.length === 0
    ? '<p style="color:var(--text-secondary)">لا توجد طلبات بعد</p>'
    : recent.map(o => `
      <div class="recent-order-item">
        <div class="order-info">
          <span>#${o.id.toString().slice(-6)} - ${o.userName || 'زائر'}</span>
          <span>${o.items.map(i => i.name).join(', ')} ${o.deliveryValue ? '| ' + o.deliveryValue : ''}</span>
        </div>
        <span style="color:var(--accent);font-weight:700">${o.total} جنيه</span>
      </div>
    `).join('');
}

// ===== SETTINGS =====
function loadSettings() {
  const s = DB.settings.get();
  document.getElementById('setSiteName').value = s.siteName || 'Dola store';
  document.getElementById('setShipping').value = s.shipping || 25;
  document.getElementById('setTransferNumbers').value = (s.transferNumbers || []).join('\n');
}

document.getElementById('saveSettings').addEventListener('click', () => {
  const s = DB.settings.get();
  s.siteName = document.getElementById('setSiteName').value.trim();
  s.shipping = +document.getElementById('setShipping').value;
  s.transferNumbers = document.getElementById('setTransferNumbers').value.split('\n').map(x => x.trim()).filter(x => x);
  const newPass = document.getElementById('setAdminPass').value.trim();
  if (newPass) s.adminPass = newPass;
  DB.settings.set(s);
  alert('تم حفظ الإعدادات بنجاح');
  document.getElementById('setAdminPass').value = '';
});

// ===== CONTENT =====
function loadContentForm() {
  const c = DB.content.get();
  document.getElementById('cntHeroTitle1').value = c.heroTitle1 || '';
  document.getElementById('cntHeroTitle2').value = c.heroTitle2 || '';
  document.getElementById('cntHeroBadge').value = c.heroBadge || '';
  document.getElementById('cntHeroDesc').value = c.heroDesc || '';
  document.getElementById('cntHeroCardBadge').value = c.heroCardBadge || '';
  document.getElementById('cntHeroCardTitle').value = c.heroCardTitle || '';
  document.getElementById('cntHeroCardDesc').value = c.heroCardDesc || '';
  document.getElementById('cntHeroCardPrice').value = c.heroCardPrice || '';
  document.getElementById('cntAboutTitle').value = c.aboutTitle || '';
  document.getElementById('cntContactTitle').value = c.contactTitle || '';
  document.getElementById('cntContactAddress').value = c.contactAddress || '';
  document.getElementById('cntContactPhone').value = c.contactPhone || '';
  document.getElementById('cntContactEmail').value = c.contactEmail || '';
  document.getElementById('cntFooterText').value = c.footerText || '';
  document.getElementById('cntFeatures').value = JSON.stringify(c.features || [], null, 2);
}

document.getElementById('saveContent').addEventListener('click', () => {
  const c = DB.content.get();
  c.heroTitle1 = document.getElementById('cntHeroTitle1').value.trim();
  c.heroTitle2 = document.getElementById('cntHeroTitle2').value.trim();
  c.heroBadge = document.getElementById('cntHeroBadge').value.trim();
  c.heroDesc = document.getElementById('cntHeroDesc').value.trim();
  c.heroCardBadge = document.getElementById('cntHeroCardBadge').value.trim();
  c.heroCardTitle = document.getElementById('cntHeroCardTitle').value.trim();
  c.heroCardDesc = document.getElementById('cntHeroCardDesc').value.trim();
  c.heroCardPrice = document.getElementById('cntHeroCardPrice').value.trim();
  c.aboutTitle = document.getElementById('cntAboutTitle').value.trim();
  c.contactTitle = document.getElementById('cntContactTitle').value.trim();
  c.contactAddress = document.getElementById('cntContactAddress').value.trim();
  c.contactPhone = document.getElementById('cntContactPhone').value.trim();
  c.contactEmail = document.getElementById('cntContactEmail').value.trim();
  c.footerText = document.getElementById('cntFooterText').value.trim();
  try { c.features = JSON.parse(document.getElementById('cntFeatures').value.trim()); } catch (e) { alert('خطأ في JSON: ' + e.message); return; }
  DB.content.set(c);
  alert('تم حفظ المحتوى بنجاح');
});

// ===== EVENTS =====
function renderEvents() {
  const events = DB.events.get();
  const tbody = document.getElementById('eventsBody');
  tbody.innerHTML = events.length === 0
    ? '<tr><td colspan="5" style="text-align:center;color:var(--text-secondary)">لا توجد فعاليات</td></tr>'
    : events.map(e => `
    <tr>
      <td><i class="fas ${e.icon || 'fa-star'}" style="margin-left:8px;color:${e.color || '#2563eb'}"></i>${e.title}</td>
      <td>${e.desc || '-'}</td>
      <td><span style="display:inline-block;width:24px;height:24px;border-radius:4px;background:${e.color || '#2563eb'};vertical-align:middle"></span></td>
      <td><span class="status-badge ${e.active !== false ? 'status-completed' : 'status-rejected'}">${e.active !== false ? 'نشط' : 'متوقف'}</span></td>
      <td class="actions">
        <button class="btn-admin-small" onclick="editEvent(${e.id})"><i class="fas fa-edit"></i></button>
        <button class="btn-admin-danger" onclick="deleteEvent(${e.id})"><i class="fas fa-trash"></i></button>
      </td>
    </tr>`).join('');
}

function editEvent(id) {
  const events = DB.events.get();
  const e = events.find(x => x.id === id);
  if (!e) return;
  document.getElementById('evtId').value = e.id;
  document.getElementById('evtTitle').value = e.title;
  document.getElementById('evtDesc').value = e.desc || '';
  document.getElementById('evtIcon').value = e.icon || 'fa-star';
  document.getElementById('evtColor').value = e.color || '#2563eb';
  document.getElementById('evtColorText').value = e.color || '#2563eb';
  document.getElementById('eventModalTitle').textContent = 'تعديل فعالية';
  document.getElementById('eventSubmit').textContent = 'تحديث';
  document.getElementById('eventModal').classList.add('active');
}

function deleteEvent(id) {
  if (!confirm('تأكيد الحذف؟')) return;
  let events = DB.events.get();
  events = events.filter(e => e.id !== id);
  DB.events.set(events);
  renderEvents();
}

document.getElementById('evtColor').addEventListener('input', () => {
  document.getElementById('evtColorText').value = document.getElementById('evtColor').value;
});
document.getElementById('evtColorText').addEventListener('input', () => {
  document.getElementById('evtColor').value = document.getElementById('evtColorText').value;
});

document.getElementById('addEventBtn').addEventListener('click', () => {
  document.getElementById('evtId').value = '';
  document.getElementById('evtTitle').value = '';
  document.getElementById('evtDesc').value = '';
  document.getElementById('evtIcon').value = 'fa-star';
  document.getElementById('evtColor').value = '#2563eb';
  document.getElementById('evtColorText').value = '#2563eb';
  document.getElementById('eventModalTitle').textContent = 'إضافة فعالية';
  document.getElementById('eventSubmit').textContent = 'حفظ';
  document.getElementById('eventModal').classList.add('active');
});

document.getElementById('eventModalClose').addEventListener('click', () => { document.getElementById('eventModal').classList.remove('active'); });
document.getElementById('eventModal').addEventListener('click', (e) => { if (e.target === e.currentTarget) e.target.classList.remove('active'); });

document.getElementById('eventForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const id = +document.getElementById('evtId').value || Date.now();
  const title = document.getElementById('evtTitle').value.trim();
  if (!title) return;
  const events = DB.events.get();
  const idx = events.findIndex(x => x.id === id);
  const obj = {
    id,
    title,
    desc: document.getElementById('evtDesc').value.trim(),
    icon: document.getElementById('evtIcon').value.trim() || 'fa-star',
    color: document.getElementById('evtColor').value || '#2563eb',
    active: true,
  };
  if (idx >= 0) events[idx] = obj;
  else events.push(obj);
  DB.events.set(events);
  document.getElementById('eventModal').classList.remove('active');
  renderEvents();
});

// ===== ADS =====
const AD_SLOTS = [
  { id: 'ad-slot-1', label: 'أسفل الفعاليات - قبل المنتجات' },
  { id: 'ad-slot-2', label: 'بعد المنتجات - قبل "عن المتجر"' },
  { id: 'ad-slot-3', label: 'بعد "عن المتجر" - قبل "اتصل بنا"' },
  { id: 'ad-slot-4', label: 'قبل الفوتر' },
];

function renderAdsForm() {
  const ads = DB.ads.get();
  const container = document.getElementById('adsForm');
  container.innerHTML = AD_SLOTS.map(s => {
    const ad = ads[s.id] || { code: '', active: false };
    return `
      <div class="setting-group" style="border-bottom:1px solid var(--border);padding-bottom:20px;margin-bottom:12px">
        <label style="display:flex;align-items:center;gap:10px">
          <span>${s.label}</span>
          <label class="toggle-switch">
            <input type="checkbox" class="ad-toggle" data-slot="${s.id}" ${ad.active ? 'checked' : ''} />
            <span class="toggle-slider"></span>
          </label>
          <span style="font-size:0.8rem;color:var(--text-secondary)" id="status-${s.id}">${ad.active ? 'نشط' : 'متوقف'}</span>
        </label>
        <textarea class="ad-code" data-slot="${s.id}" rows="4" style="padding:12px 14px;border-radius:10px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-family:monospace;font-size:0.85rem;outline:none;resize:vertical;direction:ltr;width:100%;margin-top:8px" placeholder="الصق كود الإعلان هنا (HTML/JS)">${ad.code || ''}</textarea>
      </div>
    `;
  }).join('<button class="btn-admin-primary" id="saveAdsBtn" style="margin-top:12px"><i class="fas fa-save"></i> حفظ الإعلانات</button>');
  document.getElementById('saveAdsBtn')?.addEventListener('click', saveAds);
  container.querySelectorAll('.ad-toggle').forEach(toggle => {
    toggle.addEventListener('change', () => {
      const slot = toggle.dataset.slot;
      const status = document.getElementById('status-' + slot);
      if (status) status.textContent = toggle.checked ? 'نشط' : 'متوقف';
    });
  });
}

function saveAds() {
  const ads = {};
  AD_SLOTS.forEach(s => {
    const toggle = document.querySelector(`.ad-toggle[data-slot="${s.id}"]`);
    const code = document.querySelector(`.ad-code[data-slot="${s.id}"]`);
    ads[s.id] = {
      active: toggle ? toggle.checked : false,
      code: code ? code.value : '',
    };
  });
  DB.ads.set(ads);
  alert('تم حفظ الإعلانات');
}

// ===== MESSAGES =====
function updateMsgBadge() {
  const msgs = DB.contacts.get();
  const unread = msgs.filter(m => !m.read).length;
  const badge = document.getElementById('msgBadge');
  if (badge) badge.textContent = unread > 0 ? unread : '';
}

function renderMessages() {
  const msgs = DB.contacts.get();
  const tbody = document.getElementById('messagesBody');
  tbody.innerHTML = msgs.length === 0
    ? '<tr><td colspan="7" style="text-align:center;color:var(--text-secondary)">لا توجد رسائل</td></tr>'
    : msgs.slice().reverse().map(m => `
    <tr style="${!m.read ? 'font-weight:700;background:rgba(37,99,235,0.04)' : ''}">
      <td>${m.id.toString().slice(-6)}</td>
      <td>${m.name}</td>
      <td><a href="mailto:${m.email}" style="color:var(--primary-light)">${m.email}</a></td>
      <td style="max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-secondary)">${m.message}</td>
      <td style="font-size:0.85rem">${new Date(m.date).toLocaleDateString('ar-SA')}</td>
      <td>${m.read ? '<span class="status-badge status-completed">مقروءة</span>' : '<span class="status-badge status-pending">جديد</span>'}</td>
      <td class="actions">
        ${!m.read ? `<button class="btn-admin-small" onclick="markRead(${m.id})" title="تحديد كمقروء"><i class="fas fa-check"></i></button>` : ''}
        <button class="btn-admin-danger" onclick="deleteMsg(${m.id})"><i class="fas fa-trash"></i></button>
      </td>
    </tr>`).join('');
  updateMsgBadge();
}

function markRead(id) {
  const msgs = DB.contacts.get();
  const m = msgs.find(x => x.id === id);
  if (!m) return;
  m.read = true;
  DB.contacts.set(msgs);
  renderMessages();
}

function deleteMsg(id) {
  if (!confirm('تأكيد الحذف؟')) return;
  let msgs = DB.contacts.get();
  msgs = msgs.filter(m => m.id !== id);
  DB.contacts.set(msgs);
  renderMessages();
}

// ===== INIT =====
function loadAll() {
  renderProducts();
  renderOrders();
  renderDeposits();
  renderWallets();
  renderUsers();
  loadDashboard();
  loadSettings();
  loadContentForm();
  renderEvents();
  renderMessages();
  renderAdsForm();
}
