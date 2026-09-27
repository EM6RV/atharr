// =============================================
//  متجر أثر — لوحة التحكم
// =============================================
(function () {
  var cfg = window.ATHAR_CONFIG || {};
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); };
  var fmt = function (n) { return (Math.round(Number(n || 0) * 100) / 100) + ' د.ل'; };

  if (!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase)) { $('#noConfig').hidden = false; return; }
  var db = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

  var STATUS = {
    new: ['جديد', 'var(--new)'], confirmed: ['مؤكد', 'var(--confirmed)'], shipped: ['مع المندوب', 'var(--shipped)'],
    delivered: ['تم التسليم', 'var(--delivered)'], cancelled: ['ملغي', 'var(--cancelled)']
  };
  var CAT = {men: 'رجالي', women: 'نسائي', unisex: 'للجنسين', oud: 'عود وبخور'};

  var tt;
  function toast(m) { var el = $('#toast'); el.textContent = m; el.hidden = false; clearTimeout(tt); tt = setTimeout(function () { el.hidden = true; }, 2200); }
  function ask(text) {
    return new Promise(function (res) {
      $('#confirmText').textContent = text; $('#confirm').hidden = false;
      function done(v) { $('#confirm').hidden = true; $('#confirmYes').onclick = $('#confirmNo').onclick = null; res(v); }
      $('#confirmYes').onclick = function () { done(true); };
      $('#confirmNo').onclick = function () { done(false); };
    });
  }

  // ---------- الدخول ----------
  async function boot() {
    var s = await db.auth.getSession();
    if (!s.data.session) { showLogin(); return; }
    var a = await db.rpc('is_admin');
    if (a.error || !a.data) {
      await db.auth.signOut();
      showLogin('هذا الحساب مش مسجّل كمدير. أضفه لجدول admins زي ما في ملف README.md.');
      return;
    }
    $('#loginView').hidden = true; $('#app').hidden = false;
    loadOrders(); loadProducts(); loadSettings();
  }
  function showLogin(msg) { $('#app').hidden = true; $('#loginView').hidden = false; $('#loginMsg').textContent = msg || ''; }

  $('#loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    $('#loginBtn').disabled = true; $('#loginMsg').textContent = '';
    var r = await db.auth.signInWithPassword({email: $('#email').value.trim(), password: $('#password').value});
    $('#loginBtn').disabled = false;
    if (r.error) { $('#loginMsg').textContent = 'الإيميل أو كلمة السر غلط.'; return; }
    boot();
  });
  $('#logout').addEventListener('click', async function () { await db.auth.signOut(); showLogin(); });

  // ---------- التبويبات ----------
  $$('.tab').forEach(function (t) {
    t.addEventListener('click', function () {
      $$('.tab').forEach(function (x) { x.setAttribute('aria-selected', x === t); });
      ['orders', 'products', 'settings'].forEach(function (k) { $('#tab-' + k).hidden = k !== t.dataset.tab; });
    });
  });

  // ---------- الطلبات ----------
  var orders = [], stFilter = 'all';
  function renderStatusFilter() {
    var opts = [['all', 'الكل']].concat(Object.keys(STATUS).map(function (k) { return [k, STATUS[k][0]]; }));
    $('#statusFilter').innerHTML = opts.map(function (o) {
      var n = o[0] === 'all' ? orders.length : orders.filter(function (x) { return x.status === o[0]; }).length;
      return '<button type="button" class="chip" data-st="' + o[0] + '" aria-pressed="' + (o[0] === stFilter) + '">' + o[1] + ' (' + n + ')</button>';
    }).join('');
  }
  $('#statusFilter').addEventListener('click', function (e) { var b = e.target.closest('[data-st]'); if (!b) return; stFilter = b.dataset.st; renderOrders(); });
  $('#orderSearch').addEventListener('input', renderOrders);
  $('#refresh').addEventListener('click', loadOrders);

  async function loadOrders() {
    var r = await db.from('orders').select('*').order('created_at', {ascending: false}).limit(500);
    if (r.error) { $('#orders').innerHTML = '<p class="empty">تعذّر تحميل الطلبات: ' + esc(r.error.message) + '</p>'; return; }
    orders = r.data || [];
    renderOrders();
  }

  function renderOrders() {
    var now = new Date(), today = now.toDateString(), month = now.getMonth(), year = now.getFullYear();
    var newN = orders.filter(function (o) { return o.status === 'new'; }).length;
    $('#sNew').textContent = newN;
    $('#newCount').textContent = newN; $('#newCount').hidden = !newN;
    $('#sToday').textContent = orders.filter(function (o) { return new Date(o.created_at).toDateString() === today; }).length;
    $('#sMonth').textContent = fmt(orders.filter(function (o) { var d = new Date(o.created_at); return o.status !== 'cancelled' && d.getMonth() === month && d.getFullYear() === year; })
      .reduce(function (a, o) { return a + Number(o.total); }, 0));
    $('#sDelivered').textContent = orders.filter(function (o) { return o.status === 'delivered'; }).length;
    renderStatusFilter();

    var q = $('#orderSearch').value.trim();
    var list = orders.filter(function (o) {
      if (stFilter !== 'all' && o.status !== stFilter) return false;
      if (!q) return true;
      return [o.code, o.customer_name, o.phone, o.city].join(' ').indexOf(q) > -1;
    });
    if (!list.length) { $('#orders').innerHTML = '<p class="empty">' + (orders.length ? 'ما فيه طلبات بهذا الفلتر.' : 'ما وصل أي طلب بعد. أول ما زبون يطلب من الموقع يظهر هنا.') + '</p>'; return; }

    $('#orders').innerHTML = list.map(function (o) {
      var st = STATUS[o.status] || ['—', 'var(--line)'];
      var d = new Date(o.created_at);
      var phone = String(o.phone).replace(/\D/g, '');
      var wa = phone.indexOf('218') === 0 ? phone : '218' + phone.replace(/^0/, '');
      return '<article class="order" style="--st:' + st[1] + '">' +
        '<div><h3>' + esc(o.code || ('#' + o.id)) + ' <span class="pill">' + st[0] + '</span></h3>' +
          '<div>' + esc(o.customer_name) + ' · <span dir="ltr">' + esc(o.phone) + '</span></div>' +
          '<div class="muted">' + esc(o.city) + (o.address ? ' · ' + esc(o.address) : '') + '</div>' +
          (o.note ? '<div class="muted">ملاحظة: ' + esc(o.note) + '</div>' : '') +
          '<div class="muted" style="font-size:12px">' + d.toLocaleDateString('ar-LY') + ' · ' + d.toLocaleTimeString('ar-LY', {hour: '2-digit', minute: '2-digit'}) + '</div></div>' +
        '<div><ul>' + (o.items || []).map(function (i) { return '<li>' + esc(i.name) + ' (' + esc(i.size) + ') × ' + i.qty + ' — ' + fmt(i.total) + '</li>'; }).join('') + '</ul>' +
          '<div class="muted" style="font-size:12.5px">التوصيل: ' + fmt(o.delivery_fee) + '</div><div class="tot">' + fmt(o.total) + '</div></div>' +
        '<div class="acts"><select data-status="' + o.id + '" aria-label="حالة الطلب">' +
          Object.keys(STATUS).map(function (k) { return '<option value="' + k + '"' + (k === o.status ? ' selected' : '') + '>' + STATUS[k][0] + '</option>'; }).join('') + '</select>' +
          '<a class="ghost" style="text-align:center; text-decoration:none" href="https://wa.me/' + wa + '" target="_blank" rel="noopener">واتساب الزبون</a>' +
          '<button class="ghost danger" type="button" data-del-order="' + o.id + '">حذف</button></div>' +
      '</article>';
    }).join('');
  }

  $('#orders').addEventListener('change', async function (e) {
    var s = e.target.closest('[data-status]'); if (!s) return;
    var id = +s.dataset.status, val = s.value;
    var r = await db.from('orders').update({status: val}).eq('id', id);
    if (r.error) { toast('ما تغيّرت الحالة: ' + r.error.message); return; }
    var o = orders.find(function (x) { return x.id === id; }); if (o) o.status = val;
    renderOrders(); toast('تغيّرت الحالة إلى «' + STATUS[val][0] + '»');
  });
  $('#orders').addEventListener('click', async function (e) {
    var b = e.target.closest('[data-del-order]'); if (!b) return;
    if (!(await ask('تبي تحذف هذا الطلب نهائياً؟'))) return;
    var id = +b.dataset.delOrder;
    var r = await db.from('orders').delete().eq('id', id);
    if (r.error) { toast('ما انحذف: ' + r.error.message); return; }
    orders = orders.filter(function (x) { return x.id !== id; }); renderOrders(); toast('انحذف الطلب');
  });

  // ---------- العطور ----------
  var products = [], editing = null, newImage = null, removeImage = false;
  async function loadProducts() {
    var r = await db.from('products').select('*').order('sort').order('id');
    if (r.error) { $('#plist').innerHTML = '<p class="empty">تعذّر تحميل العطور: ' + esc(r.error.message) + '</p>'; return; }
    products = r.data || []; renderProducts();
  }
  function renderProducts() {
    $('#pCount').textContent = '(' + products.length + ')';
    if (!products.length) { $('#plist').innerHTML = '<p class="empty">ما فيه عطور. اضغط «إضافة عطر».</p>'; return; }
    $('#plist').innerHTML = products.map(function (p) {
      return '<div class="prow"><div class="thumb">' + (p.image_url ? '<img src="' + esc(p.image_url) + '" alt="">' : 'أثر') + '</div>' +
        '<div><h3>' + esc(p.name_ar) + ' <span class="muted" style="font-family:Cairo;font-size:13px">' + esc(p.name_en || '') + '</span></h3>' +
          '<div class="tags"><span class="tag">' + (CAT[p.category] || p.category) + '</span>' +
          (p.sizes || []).map(function (s) { return '<span class="tag">' + esc(s.label) + ': ' + fmt(s.price) + '</span>'; }).join('') +
          (p.active ? '' : '<span class="tag off">مخفي</span>') + '</div></div>' +
        '<label class="switch"><input type="checkbox" data-stock="' + p.id + '"' + (p.in_stock ? ' checked' : '') + '> متوفر</label>' +
        '<div class="acts"><button class="ghost" type="button" data-edit="' + p.id + '">تعديل</button></div></div>';
    }).join('');
  }
  $('#plist').addEventListener('change', async function (e) {
    var c = e.target.closest('[data-stock]'); if (!c) return;
    var id = +c.dataset.stock;
    var r = await db.from('products').update({in_stock: c.checked}).eq('id', id);
    if (r.error) { toast('ما تغيّر: ' + r.error.message); c.checked = !c.checked; return; }
    products.find(function (p) { return p.id === id; }).in_stock = c.checked;
    toast(c.checked ? 'صار متوفر' : 'صار «نفد مؤقتاً» في المتجر');
  });
  $('#plist').addEventListener('click', function (e) { var b = e.target.closest('[data-edit]'); if (b) openProduct(products.find(function (p) { return p.id === +b.dataset.edit; })); });
  $('#newProduct').addEventListener('click', function () { openProduct(null); });

  function sizeRow(s) {
    return '<div class="srow"><input placeholder="الحجم (مثلاً 50 مل)" value="' + esc(s ? s.label : '') + '" data-sl>' +
      '<input type="number" min="0" step="0.5" placeholder="السعر" value="' + (s ? s.price : '') + '" data-sp>' +
      '<button class="ghost danger" type="button" data-rm aria-label="حذف الحجم">×</button></div>';
  }
  $('#addSize').addEventListener('click', function () { $('#fSizes').insertAdjacentHTML('beforeend', sizeRow(null)); });
  $('#fSizes').addEventListener('click', function (e) { var b = e.target.closest('[data-rm]'); if (b) b.parentNode.remove(); });

  function setThumb(src) { $('#fThumb').innerHTML = src ? '<img src="' + esc(src) + '" alt="">' : 'أثر'; $('#removeImg').hidden = !src; }
  function openProduct(p) {
    editing = p; newImage = null; removeImage = false;
    $('#pTitle').textContent = p ? 'تعديل: ' + p.name_ar : 'إضافة عطر';
    $('#fNameAr').value = p ? p.name_ar : ''; $('#fNameEn').value = p ? (p.name_en || '') : '';
    $('#fCat').value = p ? p.category : 'unisex'; $('#fBadge').value = p ? (p.badge || '') : '';
    $('#fSort').value = p ? p.sort : (products.length + 1);
    $('#fTop').value = p ? (p.notes_top || '') : ''; $('#fHeart').value = p ? (p.notes_heart || '') : ''; $('#fBase').value = p ? (p.notes_base || '') : '';
    $('#fDesc').value = p ? (p.description || '') : '';
    $('#fColor').value = (p && /^#[0-9a-f]{6}$/i.test(p.color || '')) ? p.color : '#8a5a2b';
    $('#fStock').checked = p ? p.in_stock : true; $('#fActive').checked = p ? p.active : true;
    $('#fSizes').innerHTML = (p && p.sizes && p.sizes.length ? p.sizes : [{label: '50 مل', price: ''}, {label: '100 مل', price: ''}]).map(sizeRow).join('');
    $('#fImage').value = ''; setThumb(p && p.image_url);
    $('#deleteProduct').hidden = !p; $('#pMsg').textContent = '';
    $('#pModal').hidden = false; $('#fNameAr').focus();
  }
  function closeProduct() { $('#pModal').hidden = true; }
  $('#cancelP').addEventListener('click', closeProduct);
  $('#fImage').addEventListener('change', function () {
    var f = this.files[0]; if (!f) return;
    if (f.size > 5 * 1024 * 1024) { $('#pMsg').textContent = 'الصورة أكبر من 5 ميجا. صغّرها وجرّب.'; this.value = ''; return; }
    newImage = f; removeImage = false; setThumb(URL.createObjectURL(f));
  });
  $('#removeImg').addEventListener('click', function () { newImage = null; removeImage = true; $('#fImage').value = ''; setThumb(null); });

  // تصغير الصورة قبل الرفع عشان الموقع يكون سريع وما تخلص المساحة
  function shrink(file) {
    return new Promise(function (res) {
      var img = new Image();
      img.onload = function () {
        var max = 1200, w = img.width, h = img.height, k = Math.min(1, max / Math.max(w, h));
        var c = document.createElement('canvas'); c.width = Math.round(w * k); c.height = Math.round(h * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        c.toBlob(function (b) { res(b || file); }, 'image/webp', 0.85);
      };
      img.onerror = function () { res(file); };
      img.src = URL.createObjectURL(file);
    });
  }

  $('#pForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    var sizes = $$('#fSizes .srow').map(function (r) { return {label: r.querySelector('[data-sl]').value.trim(), price: Number(r.querySelector('[data-sp]').value)}; })
      .filter(function (s) { return s.label; });
    if (!$('#fNameAr').value.trim()) { $('#pMsg').textContent = 'اكتب اسم العطر.'; return; }
    if (!sizes.length || sizes.some(function (s) { return !(s.price > 0); })) { $('#pMsg').textContent = 'حط حجم واحد على الأقل، وكل حجم لازم له سعر.'; return; }
    var labels = sizes.map(function (s) { return s.label; });
    if (new Set(labels).size !== labels.length) { $('#pMsg').textContent = 'فيه حجمين بنفس الاسم.'; return; }

    $('#saveP').disabled = true; $('#pMsg').textContent = '';
    try {
      var image_url = editing ? editing.image_url : null;
      if (removeImage) image_url = null;
      if (newImage) {
        var blob = await shrink(newImage);
        var path = Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.webp';
        var up = await db.storage.from('products').upload(path, blob, {contentType: 'image/webp', upsert: false});
        if (up.error) throw up.error;
        image_url = db.storage.from('products').getPublicUrl(path).data.publicUrl;
      }
      var row = {
        name_ar: $('#fNameAr').value.trim(), name_en: $('#fNameEn').value.trim() || null, category: $('#fCat').value,
        badge: $('#fBadge').value.trim() || null, sort: Number($('#fSort').value) || 0,
        notes_top: $('#fTop').value.trim() || null, notes_heart: $('#fHeart').value.trim() || null, notes_base: $('#fBase').value.trim() || null,
        description: $('#fDesc').value.trim() || null, sizes: sizes, color: $('#fColor').value, image_url: image_url,
        in_stock: $('#fStock').checked, active: $('#fActive').checked
      };
      var r = editing ? await db.from('products').update(row).eq('id', editing.id) : await db.from('products').insert(row);
      if (r.error) throw r.error;
      closeProduct(); toast(editing ? 'انحفظت التعديلات' : 'انضاف العطر للمتجر'); loadProducts();
    } catch (err) {
      $('#pMsg').textContent = 'ما انحفظ: ' + (err.message || err);
    }
    $('#saveP').disabled = false;
  });

  $('#deleteProduct').addEventListener('click', async function () {
    if (!editing) return;
    if (!(await ask('تبي تحذف «' + editing.name_ar + '» من المتجر؟ لو تبي تخفيه مؤقتاً شيل علامة «ظاهر في المتجر» بدل الحذف.'))) return;
    var r = await db.from('products').delete().eq('id', editing.id);
    if (r.error) { $('#pMsg').textContent = 'ما انحذف: ' + r.error.message; return; }
    closeProduct(); toast('انحذف العطر'); loadProducts();
  });

  // ---------- الإعدادات ----------
  function feeRow(city, fee) {
    return '<div class="frow"><input placeholder="المدينة" value="' + esc(city || '') + '" data-fc>' +
      '<input type="number" min="0" step="1" placeholder="السعر" value="' + (fee == null ? '' : fee) + '" data-ff>' +
      '<button class="ghost danger" type="button" data-rmf aria-label="حذف المدينة">×</button></div>';
  }
  $('#addCity').addEventListener('click', function () { $('#fees').insertAdjacentHTML('beforeend', feeRow('', '')); });
  $('#fees').addEventListener('click', function (e) { var b = e.target.closest('[data-rmf]'); if (b) b.parentNode.remove(); });

  async function loadSettings() {
    var r = await db.from('settings').select('key,value');
    if (r.error) { toast('تعذّر تحميل الإعدادات'); return; }
    var store = {}, fees = {};
    (r.data || []).forEach(function (row) { if (row.key === 'store') store = row.value; if (row.key === 'delivery_fees') fees = row.value; });
    $('#stWhats').value = store.whatsapp || ''; $('#stInsta').value = store.instagram || '';
    $('#stAnn').value = store.announcement || ''; $('#stHeroT').value = store.hero_title || ''; $('#stHeroX').value = store.hero_text || '';
    $('#fees').innerHTML = Object.keys(fees).filter(function (k) { return k !== 'default'; }).map(function (k) { return feeRow(k, fees[k]); }).join('');
    $('#feeDefault').value = fees['default'] != null ? fees['default'] : '';
  }
  $('#settingsForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    var whats = $('#stWhats').value.replace(/\D/g, '');
    if (whats && whats.indexOf('218') !== 0) whats = '218' + whats.replace(/^0/, '');
    var store = {whatsapp: whats, instagram: $('#stInsta').value.trim().replace(/^@/, ''), announcement: $('#stAnn').value.trim(), hero_title: $('#stHeroT').value.trim(), hero_text: $('#stHeroX').value.trim()};
    var fees = {};
    $$('#fees .frow').forEach(function (r) { var c = r.querySelector('[data-fc]').value.trim(), f = r.querySelector('[data-ff]').value; if (c) fees[c] = Number(f) || 0; });
    fees['default'] = Number($('#feeDefault').value) || 0;
    $('#saveSettings').disabled = true;
    var r = await db.from('settings').upsert([{key: 'store', value: store}, {key: 'delivery_fees', value: fees}]);
    $('#saveSettings').disabled = false;
    if (r.error) { toast('ما انحفظت: ' + r.error.message); return; }
    $('#stWhats').value = whats; toast('انحفظت الإعدادات، وتظهر في الموقع مباشرة');
  });

  boot();
})();
