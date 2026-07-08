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

const DEFAULT_CONTENT = {
  heroTitle1: 'شحن ألعاب',
  heroTitle2: 'بثقة وأمان',
  heroBadge: 'متجر موثوق ومعتمد',
  heroDesc: 'أسرع وأرخص خدمة شحن لـ PUBG Mobile و Free Fire. تعبئة فورية، دعم متواصل، وأسعار تنافسية.',
  heroCardBadge: 'مدفوعات آمنة',
  heroCardTitle: 'شحن فوري - توصيل تلقائي',
  heroCardDesc: 'احصل على رصيدك فور إتمام الدفع. دعم فني متواصل.',
  heroCardPrice: 'أسعار تبدأ من 65 جنيه',
  aboutTitle: 'عن المتجر',
  features: [
    { icon: 'fa-bolt', title: 'شحن فوري', desc: 'تعبئة تلقائية فورية بعد تأكيد الدفع' },
    { icon: 'fa-shield-check', title: 'ضمان واسترجاع', desc: 'ضمان حقك كامل في حالة وجود أي مشكلة' },
    { icon: 'fa-headset', title: 'دعم فني 24/7', desc: 'فريق متخصص جاهز لمساعدتك في أي وقت' }
  ],
  contactTitle: 'اتصل بنا',
  contactAddress: 'القاهرة، مصر',
  contactPhone: '+20 100 123 4567',
  contactEmail: 'support@dolastore.com',
  footerText: 'جميع الحقوق محفوظة © 2026 Dola store'
};

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
  content: { get() { const c = DB.get('content', DEFAULT_CONTENT); if (!c.features) c.features = DEFAULT_CONTENT.features; return c; }, set(v) { DB.set('content', v); } },
  events: { get() { return DB.get('events', []); }, set(v) { DB.set('events', v); } },
  contacts: { get() { return DB.get('contacts', []); }, set(v) { DB.set('contacts', v); } },
  ads: { get() { return DB.get('ads', {}); }, set(v) { DB.set('ads', v); } },
  settings: { get() { return DB.get('settings', { siteName: 'Dola store', shipping: 25, transferNumbers: ['01012345678 (البنك الأهلي)', '01098765432 (بنك مصر)'] }); }, set(v) { DB.set('settings', v); } },
};

DB.set = DBwrap(DB.set);

function getWallet(userId) {
  const wallets = DB.wallets.get();
  let w = wallets.find(x => x.userId === userId);
  if (!w) { w = { userId, balance: 0 }; wallets.push(w); DB.wallets.set(wallets); }
  return w;
}

function formatBalance(n) { return n.toLocaleString('ar-EG') + ' جنيه'; }

let products = DB.products.get().filter(p => p.visible !== false);
let cart = [];
let currentUser = null;

const saved = sessionStorage.getItem('neon_session');
if (saved) {
  currentUser = JSON.parse(saved);
  document.body.classList.add('logged-in');
}

function saveSession() {
  if (currentUser) sessionStorage.setItem('neon_session', JSON.stringify(currentUser));
  else sessionStorage.removeItem('neon_session');
}

function renderSiteContent() {
  const c = DB.content.get();
  document.getElementById('heroTitle1').textContent = c.heroTitle1;
  document.getElementById('heroTitle2').textContent = c.heroTitle2;
  document.getElementById('heroBadgeText').textContent = c.heroBadge;
  document.getElementById('heroDesc').textContent = c.heroDesc;
  document.getElementById('heroCardBadge').textContent = c.heroCardBadge;
  document.getElementById('heroCardTitle').textContent = c.heroCardTitle;
  document.getElementById('heroCardDesc').textContent = c.heroCardDesc;
  document.getElementById('heroCardPrice').textContent = c.heroCardPrice;
  document.getElementById('aboutTitle').textContent = c.aboutTitle;
  document.getElementById('contactTitle').textContent = c.contactTitle;
  document.getElementById('footerText').innerHTML = c.footerText;
  const aboutEl = document.getElementById('aboutContent');
  aboutEl.innerHTML = (c.features || []).map(f => `
    <div class="about-card">
      <i class="fas ${f.icon} about-icon"></i>
      <h3>${f.title}</h3>
      <p>${f.desc}</p>
    </div>
  `).join('');
  const contactEl = document.getElementById('contactInfo');
  contactEl.innerHTML = `
    <p><i class="fas fa-map-marker-alt"></i> ${c.contactAddress}</p>
    <p><i class="fas fa-phone"></i> ${c.contactPhone}</p>
    <p><i class="fas fa-envelope"></i> ${c.contactEmail}</p>
  `;
  document.title = c.heroTitle1 + ' | ' + c.heroTitle2 + ' - Dola store';
}

function renderAds() {
  const ads = DB.ads.get();
  ['ad-slot-1', 'ad-slot-2', 'ad-slot-3', 'ad-slot-4'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const ad = ads[id] || { code: '', active: false };
    el.innerHTML = ad.active && ad.code ? ad.code : '';
  });
}

function renderEvents() {
  const el = document.getElementById('eventsBar');
  const events = DB.events.get().filter(e => e.active !== false);
  if (events.length === 0) { el.innerHTML = ''; return; }
  el.innerHTML = events.map(e => `
    <div class="event-banner" style="background:${e.color || '#2563eb'}">
      <i class="fas ${e.icon || 'fa-star'}"></i>
      <span><strong>${e.title}</strong>${e.desc ? ' — ' + e.desc : ''}</span>
    </div>
  `).join('');
}

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  products = DB.products.get().filter(p => p.visible !== false);
  grid.innerHTML = products.map(p => `
    <div class="product-card" data-id="${p.id}">
      <div class="product-img">
        <div class="product-img-glow" style="background: ${p.glow}"></div>
        <i class="fas ${p.icon}"></i>
      </div>
      <h3>${p.name}</h3>
      <p class="product-desc">${p.desc}</p>
      <p class="product-price">${p.price} جنيه</p>
      <button class="add-to-cart" data-id="${p.id}">
        <i class="fas fa-shopping-cart"></i> أضف للسلة
      </button>
    </div>
  `).join('');
  grid.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => addToCart(+btn.dataset.id));
  });
}

function addToCart(id) {
  if (!currentUser) { showAuthModal('login'); return; }
  const product = products.find(p => p.id === id);
  if (!product) return;
  const existing = cart.find(c => c.id === id);
  if (existing) existing.qty++;
  else cart.push({ ...product, qty: 1 });
  updateCartUI();
  openCart();
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  updateCartUI();
}

function updateCartUI() {
  const count = cart.reduce((sum, c) => sum + c.qty, 0);
  document.getElementById('cartCount').textContent = count;
  const container = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  if (cart.length === 0) {
    container.innerHTML = '<p class="cart-empty">السلة فارغة <i class="fas fa-shopping-bag"></i></p>';
    totalEl.textContent = '0 جنيه';
    return;
  }
  container.innerHTML = cart.map(c => `
    <div class="cart-item">
      <div class="cart-item-icon"><i class="fas ${c.icon}"></i></div>
      <div class="cart-item-info">
        <h4>${c.name}</h4>
        <span class="cart-item-price">${c.price} جنيه × ${c.qty}</span>
      </div>
      <button class="cart-item-remove" data-id="${c.id}"><i class="fas fa-trash"></i></button>
    </div>
  `).join('');
  container.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(+btn.dataset.id));
  });
  const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  totalEl.textContent = `${total} جنيه`;
}

function openCart() { document.getElementById('cartSidebar').classList.add('active'); document.getElementById('cartOverlay').classList.add('active'); }
function closeCart() { document.getElementById('cartSidebar').classList.remove('active'); document.getElementById('cartOverlay').classList.remove('active'); }
function openModal(id) { document.getElementById(id || 'modalOverlay').classList.add('active'); }
function closeModal(id) { document.getElementById(id || 'modalOverlay').classList.remove('active'); }

function showAuthModal(mode) {
  const m = document.getElementById('authModal');
  m.classList.add('active');
  document.getElementById('authTitle').textContent = mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب';
  document.getElementById('authSubmit').textContent = mode === 'login' ? 'دخول' : 'تسجيل';
  document.getElementById('authToggle').innerHTML = mode === 'login'
    ? 'ليس لديك حساب؟ <a href="#" id="authSwitch">إنشاء حساب</a>'
    : 'لديك حساب؟ <a href="#" id="authSwitch">تسجيل دخول</a>';
  document.getElementById('authNameGroup').style.display = mode === 'register' ? 'block' : 'none';
  m.dataset.mode = mode;
  setTimeout(() => document.getElementById('authSwitch')?.addEventListener('click', (e) => {
    e.preventDefault();
    showAuthModal(m.dataset.mode === 'login' ? 'register' : 'login');
  }), 50);
}

function closeAuth() { document.getElementById('authModal').classList.remove('active'); }

document.getElementById('authForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const mode = document.getElementById('authModal').dataset.mode;
  const email = document.getElementById('authEmail').value.trim();
  const pass = document.getElementById('authPass').value;
  const name = document.getElementById('authName').value.trim();
  if (mode === 'register') {
    if (!name) return;
    let users = DB.users.get();
    if (users.find(u => u.email === email)) { alert('البريد الإلكتروني مستخدم مسبقاً'); return; }
    const newUser = { id: Date.now(), name, email, pass, createdAt: new Date().toISOString(), banned: false };
    users.push(newUser);
    DB.users.set(users);
    currentUser = newUser;
    document.body.classList.add('logged-in');
    saveSession();
    updateUserUI();
    closeAuth();
    alert('تم إنشاء الحساب بنجاح!');
  } else {
    let users = DB.users.get();
    const user = users.find(u => u.email === email && u.pass === pass);
    if (!user) { alert('البريد أو كلمة المرور غير صحيحة'); return; }
    if (user.banned) { alert('تم حظر حسابك. تواصل مع الإدارة.'); return; }
    currentUser = user;
    document.body.classList.add('logged-in');
    saveSession();
    updateUserUI();
    closeAuth();
  }
});

function refreshBalanceBadge() {
  if (!currentUser) return;
  const badge = document.querySelector('.balance-badge');
  if (badge) {
    const wallet = getWallet(currentUser.id);
    badge.textContent = formatBalance(wallet.balance);
  }
}
setInterval(refreshBalanceBadge, 3000);

function updateUserUI() {
  const el = document.getElementById('userMenu');
  if (currentUser) {
    const wallet = getWallet(currentUser.id);
    el.innerHTML = `
      <div class="balance-badge">${formatBalance(wallet.balance)}</div>
      <div class="user-dropdown">
        <button class="user-btn"><i class="fas fa-user"></i> ${currentUser.name}</button>
        <div class="dropdown-menu">
          <a href="#" id="rechargeBtn"><i class="fas fa-wallet"></i> تعبئة رصيد</a>
          <a href="#" id="myOrdersBtn"><i class="fas fa-box"></i> طلباتي</a>
          <a href="#" id="profileBtn"><i class="fas fa-user-cog"></i> حسابي</a>
          <a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> تسجيل خروج</a>
          <a href="admin.html" class="admin-link"><i class="fas fa-crown"></i> لوحة التحكم</a>
        </div>
      </div>`;
    document.getElementById('authBtn')?.remove();
    setTimeout(() => {
      document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        currentUser = null;
        document.body.classList.remove('logged-in');
        saveSession();
        updateUserUI();
        cart = [];
        updateCartUI();
      });
      document.getElementById('rechargeBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        showRechargeModal();
      });
      document.getElementById('myOrdersBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        showOrdersModal();
      });
      document.getElementById('profileBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        showProfileModal();
      });
    }, 50);
  } else {
    el.innerHTML = `<button class="auth-btn" id="authBtn" onclick="showAuthModal('login')">
      <i class="fas fa-user"></i> دخول
    </button>`;
  }
}

function showRechargeModal() {
  const m = document.getElementById('rechargeModal');
  const settings = DB.settings.get();
  const nums = settings.transferNumbers || ['01012345678'];
  document.getElementById('transferNumbers').innerHTML = nums.map((n, i) =>
    `<div class="transfer-item"><span>${i+1}.</span> ${n}</div>`
  ).join('');
  document.getElementById('rechargeInfo').textContent = '';
  m.classList.add('active');
}

document.getElementById('rechargeForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const amount = +document.getElementById('rechargeAmount').value;
  const transferNum = document.getElementById('rechargeTransfer').value.trim();
  if (!amount || amount < 1) { alert('أدخل مبلغ صحيح'); return; }
  if (!transferNum) { alert('أدخل رقم التحويل'); return; }
  const deposits = DB.deposits.get();
  deposits.push({
    id: Date.now(),
    userId: currentUser.id,
    userName: currentUser.name,
    amount,
    transferNum,
    date: new Date().toISOString(),
    status: 'pending',
  });
  DB.deposits.set(deposits);
  document.getElementById('rechargeForm').reset();
  document.getElementById('rechargeModal').classList.remove('active');
  alert('تم إرسال طلب تعبئة الرصيد. سيتم مراجعته من الإدارة.');
});

function showOrdersModal() {
  const orders = DB.orders.get().filter(o => o.userId === currentUser.id);
  const m = document.getElementById('ordersModal');
  const c = document.getElementById('ordersList');
  m.classList.add('active');
  if (orders.length === 0) {
    c.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:40px 0">لا توجد طلبات سابقة</p>';
  } else {
    c.innerHTML = orders.map(o => `
      <div class="order-card">
        <div class="order-header">
          <span>#${o.id.toString().slice(-6)}</span>
          <span class="order-status status-${o.status}">${o.status === 'pending' ? 'قيد الانتظار' : o.status === 'shipped' ? 'تم الشحن' : 'مكتمل'}</span>
        </div>
        <div class="order-items">${o.items.map(i => `<span>${i.name} × ${i.qty}</span>`).join(', ')}</div>
        ${o.deliveryType ? `<div class="order-delivery" style="color:var(--text-secondary);font-size:0.8rem;margin-bottom:6px">
          <span>${o.deliveryType === 'id' ? 'شحن عن طريق ID' : 'شحن عن طريق أكونت'}: ${o.deliveryValue}</span>
        </div>` : ''}
        <div class="order-footer"><span>${o.total} جنيه</span><span>${new Date(o.date).toLocaleDateString('ar-SA')}</span></div>
      </div>`).join('');
  }
}

function showProfileModal() {
  const m = document.getElementById('profileModal');
  m.classList.add('active');
  document.getElementById('profileName').value = currentUser.name;
  document.getElementById('profileEmail').value = currentUser.email;
}

document.getElementById('profileForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const newName = document.getElementById('profileName').value.trim();
  const newPass = document.getElementById('profilePass').value;
  let users = DB.users.get();
  const idx = users.findIndex(u => u.id === currentUser.id);
  if (idx === -1) return;
  users[idx].name = newName;
  if (newPass) users[idx].pass = newPass;
  DB.users.set(users);
  currentUser = users[idx];
  saveSession();
  updateUserUI();
  document.getElementById('profileModal').classList.remove('active');
  alert('تم تحديث البيانات');
});

document.querySelectorAll('.modal-overlay-close').forEach(el => {
  el.addEventListener('click', (e) => { if (e.target === e.currentTarget) e.currentTarget.classList.remove('active'); });
});
document.querySelectorAll('.modal-close-btn').forEach(btn => {
  btn.addEventListener('click', () => btn.closest('.modal-overlay-close')?.classList.remove('active') || btn.closest('.modal-bg')?.classList.remove('active'));
});

document.getElementById('cartBtn').addEventListener('click', () => {
  if (!currentUser) { showAuthModal('login'); return; }
  openCart();
});
document.getElementById('cartClose').addEventListener('click', closeCart);
document.getElementById('cartOverlay').addEventListener('click', closeCart);
document.getElementById('modalClose').addEventListener('click', () => closeModal('modalOverlay'));
document.getElementById('modalOverlay').addEventListener('click', (e) => { if (e.target === e.currentTarget) closeModal('modalOverlay'); });
document.getElementById('modalDone').addEventListener('click', () => closeModal('modalOverlay'));

// Delivery method modal
document.getElementById('checkoutBtn').addEventListener('click', () => {
  if (cart.length === 0) return;
  if (!currentUser) { closeCart(); showAuthModal('login'); return; }
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const wallet = getWallet(currentUser.id);
  document.getElementById('deliveryTotal').textContent = total + ' جنيه';
  document.getElementById('deliveryWallet').textContent = formatBalance(wallet.balance);
  document.getElementById('deliveryModal').classList.add('active');
});

document.getElementById('deliveryForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const type = document.querySelector('input[name="deliveryType"]:checked');
  const value = document.getElementById('deliveryValue').value.trim();
  if (!type) { return; }
  if (!value) { alert('أدخل بيانات الشحن'); return; }

  const settings = DB.settings.get();
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const wallet = getWallet(currentUser.id);

  if (wallet.balance < total) {
    alert(`رصيدك الحالي ${formatBalance(wallet.balance)} غير كافي.\nالمبلغ المطلوب: ${formatBalance(total)}\nقم بتعبئة رصيدك أولاً من قائمة "تعبئة رصيد".`);
    return;
  }

  wallet.balance -= total;

  const orders = DB.orders.get();
  orders.push({
    id: Date.now(),
    userId: currentUser.id,
    userName: currentUser.name,
    userEmail: currentUser.email,
    items: [...cart],
    total,
    paid: total,
    deliveryType: type.value,
    deliveryValue: value,
    date: new Date().toISOString(),
    status: 'pending',
  });
  DB.orders.set(orders);
  const wAll = DB.wallets.get();
  const wFound = wAll.find(x => x.userId === currentUser.id);
  if (wFound) wFound.balance = wallet.balance;
  DB.wallets.set(wAll);

  closeCart();
  document.getElementById('deliveryModal').classList.remove('active');
  cart = [];
  updateCartUI();
  updateUserUI();
  openModal('modalOverlay');
});

document.getElementById('deliveryCancel').addEventListener('click', () => {
  document.getElementById('deliveryModal').classList.remove('active');
});

document.getElementById('contactForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('contactName').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const msg = document.getElementById('contactMessage').value.trim();
  if (!name || !email || !msg) return;
  const contacts = DB.contacts.get();
  contacts.push({ id: Date.now(), name, email, message: msg, date: new Date().toISOString(), read: false });
  DB.contacts.set(contacts);
  const btn = e.target.querySelector('button[type="submit"]');
  const orig = btn.innerHTML;
  btn.innerHTML = 'تم الإرسال <i class="fas fa-check"></i>';
  btn.style.background = '#2563eb';
  setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; e.target.reset(); }, 2000);
});

renderSiteContent();
renderAds();
renderEvents();
renderProducts();
updateUserUI();

setTimeout(async () => {
  await fbPullAll();
  renderSiteContent();
  renderAds();
  renderEvents();
  renderProducts();
  updateUserUI();
  fbListen('wallets', () => { if (currentUser) updateUserUI(); });
  fbListen('users', () => {
    if (currentUser) {
      const users = DB.users.get();
      const u = users.find(x => x.id === currentUser.id);
      if (u) { currentUser = u; sessionStorage.setItem('neon_user', JSON.stringify(currentUser)); }
    }
  });
}, 0);
