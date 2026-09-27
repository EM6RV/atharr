// =============================================
//  متجر أثر — واجهة المتجر
// =============================================
(function () {
  var cfg = window.ATHAR_CONFIG || {};
  var LIVE = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase);
  var db = LIVE ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;

  // بيانات تجريبية تظهر فقط لو الموقع مش مربوط بقاعدة البيانات
  var DEMO_PRODUCTS = [
    {id:1, name_ar:'عود الليل', name_en:'Midnight Oud', category:'oud', badge:'الأكثر طلباً', notes_top:'زعفران، هيل', notes_heart:'ورد طائفي', notes_base:'عود، عنبر', sizes:[{label:'50 مل',price:220},{label:'100 مل',price:350}], color:'#5a2410', in_stock:true},
    {id:2, name_ar:'عنبر الصحراء', name_en:'Desert Amber', category:'unisex', notes_top:'بيرغموت', notes_heart:'زعفران، قرفة', notes_base:'عنبر، فانيليا', sizes:[{label:'50 مل',price:185},{label:'100 مل',price:295}], color:'#c9861a', in_stock:true},
    {id:3, name_ar:'جاوي', name_en:'Jawi Incense', category:'oud', badge:'روح ليبية', notes_top:'لبان', notes_heart:'جاوي (بنزوين)', notes_base:'صندل، مسك', sizes:[{label:'50 مل',price:175},{label:'100 مل',price:280}], color:'#8a5a2b', in_stock:true},
    {id:4, name_ar:'جلد وتبغ', name_en:'Leather & Tobacco', category:'men', notes_top:'فلفل أسود', notes_heart:'تبغ، هيل', notes_base:'جلد، فيتيفر', sizes:[{label:'50 مل',price:195},{label:'100 مل',price:310}], color:'#4a2a1a', in_stock:true},
    {id:5, name_ar:'مسك الحرير', name_en:'Silk Musk', category:'women', notes_top:'كمثرى', notes_heart:'ياسمين، بودرة', notes_base:'مسك أبيض', sizes:[{label:'50 مل',price:160},{label:'100 مل',price:255}], color:'#d9bf9c', in_stock:true},
    {id:6, name_ar:'زهر الليمون', name_en:'Neroli Blossom', category:'women', badge:'جديد', notes_top:'زهر البرتقال، ليمون', notes_heart:'نيرولي', notes_base:'مسك، خشب أبيض', sizes:[{label:'50 مل',price:150},{label:'100 مل',price:240}], color:'#e0b04f', in_stock:true}
  ];
  var STORE = {whatsapp:'218910000000', instagram:'athar.ly', announcement:'توصيل لكل المدن الليبية · الدفع عند الاستلام', hero_title:'خلّي أثرك', hero_text:''};
  var FEES = {'طرابلس':15,'بنغازي':15,'مصراتة':20,'الزاوية':20,'البيضاء':25,'سبها':35,'طبرق':30,'درنة':25,'سرت':25,'default':30};

  var CATS = [['all','الكل'],['men','رجالي'],['women','نسائي'],['unisex','للجنسين'],['oud','عود وبخور']];
  var P = [];
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); };
  var fmt = function (n) { return (Math.round(Number(n) * 100) / 100) + ' د.ل'; };
  var byId = function (id) { return P.find(function (p) { return String(p.id) === String(id); }); };
  var sizeOf = function (p, label) { return (p.sizes || []).find(function (s) { return s.label === label; }); };

  var sizeSel = {};
  var cart = [];
  try { cart = JSON.parse(localStorage.getItem('athar-cart-v2') || '[]') || []; } catch (e) { cart = []; }
  function save() { try { localStorage.setItem('athar-cart-v2', JSON.stringify(cart)); } catch (e) {} }

  $('#yr').textContent = new Date().getFullYear();

  // ---------- تحميل البيانات ----------
  async function load() {
    if (LIVE) {
      try {
        var r1 = await db.from('settings').select('key,value');
        if (!r1.error) (r1.data || []).forEach(function (row) {
          if (row.key === 'store') STORE = Object.assign(STORE, row.value);
          if (row.key === 'delivery_fees') FEES = row.value;
        });
        var r2 = await db.from('products').select('*').eq('active', true).order('sort').order('id');
        if (r2.error) throw r2.error;
        P = r2.data || [];
      } catch (e) {
        $('#grid').innerHTML = '<p class="loading">تعذّر تحميل العطور. حدّث الصفحة بعد شوي.</p>';
        return;
      }
    } else {
      P = DEMO_PRODUCTS;
    }
    // تنظيف السلة من منتجات انحذفت أو تغيّرت أحجامها
    cart = cart.filter(function (c) { var p = byId(c.id); return p && sizeOf(p, c.size) && p.in_stock !== false; });
    save();
    P.forEach(function (p) { sizeSel[p.id] = (p.sizes && p.sizes[0] && p.sizes[0].label) || ''; });
    applyStore();
    renderFilters(); renderGrid(); renderCart(); renderFinder();
  }

  function applyStore() {
    if (STORE.announcement) { $('#announce').textContent = STORE.announcement; $('#announce').hidden = false; }
    if (STORE.hero_title) {
      var words = STORE.hero_title.trim().split(/\s+/);
      var last = words.pop();
      $('#heroTitle').innerHTML = (words.length ? esc(words.join(' ')) + ' ' : '') + '<span class="gold">' + esc(last) + '</span>';
    }
    if (STORE.hero_text) $('#heroText').textContent = STORE.hero_text;
    var cities = Object.keys(FEES).filter(function (k) { return k !== 'default'; });
    $('#cCity').innerHTML = '<option value="">اختر مدينتك</option>' + cities.map(function (c) { return '<option>' + esc(c) + '</option>'; }).join('') + '<option>مدينة أخرى</option>';
  }

  // ---------- شريط المكونات ----------
  var notes = ['عود','عنبر','مسك','جاوي','زعفران','ورد طائفي','صندل','فانيليا','زهر البرتقال','لبان','جلد','هيل'];
  var t = notes.map(function (n) { return '<span>' + n + '<i>✦</i></span>'; }).join('');
  $('#track').innerHTML = t + t;

  // ---------- المنتجات ----------
  var active = 'all';
  function renderFilters() {
    $('#filters').innerHTML = CATS.map(function (c) { return '<button type="button" class="chip" data-cat="' + c[0] + '" aria-pressed="' + (c[0] === active) + '">' + c[1] + '</button>'; }).join('');
  }
  $('#filters').addEventListener('click', function (e) {
    var b = e.target.closest('.chip'); if (!b) return;
    active = b.dataset.cat; renderFilters(); renderGrid();
  });

  function bottle(p) {
    var c = p.color || '#8a5a2b', g = 'g' + p.id;
    return '<svg viewBox="0 0 120 190" aria-hidden="true"><defs><linearGradient id="' + g + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + esc(c) + '"/><stop offset="1" stop-color="#140805"/></linearGradient></defs>' +
      '<rect x="44" y="4" width="32" height="26" rx="3" fill="#E1A10B"/><rect x="40" y="26" width="40" height="8" rx="2" fill="#b67f08"/>' +
      '<rect x="14" y="36" width="92" height="148" rx="10" fill="url(#' + g + ')" stroke="rgba(240,196,90,.55)" stroke-width="1.5"/>' +
      '<rect x="22" y="44" width="8" height="120" rx="4" fill="rgba(255,255,255,.12)"/>' +
      '<rect x="30" y="92" width="60" height="50" rx="2" fill="#200F09" opacity=".82"/>' +
      '<text x="60" y="118" text-anchor="middle" font-family="Aref Ruqaa, serif" font-size="20" fill="#E1A10B">أثر</text>' +
      '<text x="60" y="133" text-anchor="middle" font-family="Cormorant Garamond, serif" font-size="7.5" letter-spacing="2" fill="#F0C45A">ATHAR</text></svg>';
  }

  function inCat(p, cat) {
    if (cat === 'all') return true;
    if (cat === 'unisex') return p.category === 'unisex' || p.category === 'oud';
    return p.category === cat;
  }

  function renderGrid() {
    var list = P.filter(function (p) { return inCat(p, active); });
    if (!list.length) { $('#grid').innerHTML = '<p class="loading">ما فيه عطور في هذا القسم حالياً.</p>'; return; }
    $('#grid').innerHTML = list.map(function (p) {
      var s = sizeOf(p, sizeSel[p.id]) || (p.sizes || [])[0] || {label:'', price:0};
      var out = p.in_stock === false;
      var visual = p.image_url
        ? '<img src="' + esc(p.image_url) + '" alt="' + esc(p.name_ar) + '" loading="lazy">'
        : bottle(p);
      return '<article class="card' + (out ? ' out' : '') + '">' +
        '<div class="visual" style="background:radial-gradient(70% 80% at 50% 30%,' + esc(p.color || '#8a5a2b') + '33,transparent 70%)">' +
          (out ? '<span class="badge">نفد مؤقتاً</span>' : (p.badge ? '<span class="badge">' + esc(p.badge) + '</span>' : '')) + visual + '</div>' +
        '<div class="body">' + (p.name_en ? '<span class="en">' + esc(p.name_en) + '</span>' : '') + '<h3>' + esc(p.name_ar) + '</h3>' +
          '<dl class="pyramid">' +
            (p.notes_top ? '<dt>الافتتاحية</dt><dd>' + esc(p.notes_top) + '</dd>' : '') +
            (p.notes_heart ? '<dt>القلب</dt><dd>' + esc(p.notes_heart) + '</dd>' : '') +
            (p.notes_base ? '<dt>القاعدة</dt><dd>' + esc(p.notes_base) + '</dd>' : '') + '</dl>' +
          (p.description ? '<p style="margin:0;color:var(--dim);font-size:13.5px">' + esc(p.description) + '</p>' : '') +
          '<div class="row"><div class="sizes">' + (p.sizes || []).map(function (z) {
            return '<button type="button" class="size" data-id="' + p.id + '" data-size="' + esc(z.label) + '" aria-pressed="' + (z.label === s.label) + '">' + esc(z.label) + '</button>';
          }).join('') + '</div><span class="price">' + fmt(s.price) + '</span></div>' +
          '<button type="button" class="btn add" data-add="' + p.id + '"' + (out ? ' disabled style="opacity:.5;cursor:not-allowed"' : '') + '>' + (out ? 'غير متوفر حالياً' : 'أضف للسلة') + '</button>' +
        '</div></article>';
    }).join('');
  }
  $('#grid').addEventListener('click', function (e) {
    var z = e.target.closest('.size');
    if (z) { sizeSel[z.dataset.id] = z.dataset.size; renderGrid(); return; }
    var a = e.target.closest('[data-add]');
    if (a && !a.disabled) add(a.dataset.add, sizeSel[a.dataset.add]);
  });

  function add(id, size) {
    var p = byId(id); if (!p) return;
    size = size || (p.sizes[0] && p.sizes[0].label);
    var ex = cart.find(function (c) { return String(c.id) === String(id) && c.size === size; });
    if (ex) ex.qty = Math.min(20, ex.qty + 1); else cart.push({id: p.id, size: size, qty: 1});
    save(); renderCart();
    toast('أُضيف ' + p.name_ar + ' للسلة');
  }
  var tt;
  function toast(m) { var el = $('#toast'); el.textContent = m; el.hidden = false; clearTimeout(tt); tt = setTimeout(function () { el.hidden = true; }, 1800); }

  // ---------- السلة ----------
  function currentFee() {
    var city = $('#cCity').value;
    if (!city) return null;
    return FEES[city] != null ? Number(FEES[city]) : Number(FEES['default'] || 0);
  }
  function renderCart() {
    var n = cart.reduce(function (a, c) { return a + c.qty; }, 0);
    $('#count').textContent = n;
    var sub = 0;
    if (!cart.length) {
      $('#items').innerHTML = '<p class="empty">السلة فاضية. اختر عطرك من المجموعة.</p>';
    } else {
      $('#items').innerHTML = cart.map(function (c, i) {
        var p = byId(c.id), s = sizeOf(p, c.size), pr = s.price * c.qty; sub += pr;
        return '<div class="item"><div><h4>' + esc(p.name_ar) + '</h4><small>' + esc(c.size) + '</small></div><span class="price">' + fmt(pr) + '</span>' +
          '<div class="qty"><button type="button" data-dec="' + i + '" aria-label="إنقاص">−</button><span>' + c.qty + '</span><button type="button" data-inc="' + i + '" aria-label="زيادة">+</button></div></div>';
      }).join('');
    }
    var fee = currentFee();
    $('#subtotal').textContent = fmt(sub);
    $('#feeVal').textContent = fee == null ? 'اختر المدينة' : fmt(fee);
    $('#total').textContent = fmt(sub + (fee || 0));
  }
  $('#cCity').addEventListener('change', renderCart);
  $('#items').addEventListener('click', function (e) {
    var d = e.target.closest('[data-dec]'), u = e.target.closest('[data-inc]');
    if (u) { var c = cart[+u.dataset.inc]; c.qty = Math.min(20, c.qty + 1); }
    if (d) { var i = +d.dataset.dec; cart[i].qty--; if (cart[i].qty <= 0) cart.splice(i, 1); }
    if (d || u) { save(); renderCart(); }
  });

  function openCart() { $('#drawer').classList.add('open'); $('#drawer').setAttribute('aria-hidden', 'false'); $('#scrim').hidden = false; }
  function closeCart() { $('#drawer').classList.remove('open'); $('#drawer').setAttribute('aria-hidden', 'true'); $('#scrim').hidden = true; }
  $('#openCart').addEventListener('click', openCart);
  $('#closeCart').addEventListener('click', closeCart);
  $('#scrim').addEventListener('click', closeCart);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeCart(); });

  // ---------- تأكيد الطلب ----------
  var sending = false;
  $('#checkout').addEventListener('submit', async function (e) {
    e.preventDefault();
    if (sending) return;
    var name = $('#cName').value.trim(), phone = $('#cPhone').value.trim(), city = $('#cCity').value;
    var address = $('#cAddress').value.trim(), note = $('#cNote').value.trim();
    var fn = $('#formNote');
    if (!cart.length) { fn.textContent = 'أضف عطراً واحداً على الأقل قبل تأكيد الطلب.'; return; }
    if (!name || !phone || !city) { fn.textContent = 'اكتب اسمك ورقم هاتفك واختر مدينتك.'; return; }

    var order;
    sending = true; $('#send').textContent = 'جاري إرسال الطلب…';
    try {
      if (LIVE) {
        var r = await db.rpc('place_order', {
          p_name: name, p_phone: phone, p_city: city, p_address: address, p_note: note,
          p_items: cart.map(function (c) { return {id: c.id, size: c.size, qty: c.qty}; })
        });
        if (r.error) throw r.error;
        order = r.data;
      } else {
        var items = cart.map(function (c) { var p = byId(c.id), s = sizeOf(p, c.size); return {name: p.name_ar, size: c.size, qty: c.qty, total: s.price * c.qty}; });
        var sub = items.reduce(function (a, i) { return a + i.total; }, 0), fee = currentFee() || 0;
        order = {code: 'تجريبي', items: items, subtotal: sub, delivery_fee: fee, total: sub + fee};
      }
    } catch (err) {
      fn.textContent = 'ما قدرنا نسجل الطلب: ' + (err.message || 'خطأ في الاتصال') + '. جرّب مرة ثانية.';
      sending = false; $('#send').textContent = 'أكّد الطلب عبر واتساب';
      return;
    }

    var lines = order.items.map(function (i) { return '• ' + i.name + ' (' + i.size + ') × ' + i.qty + ' = ' + fmt(i.total); });
    var msg = 'طلب جديد من متجر أثر\nرقم الطلب: ' + order.code + '\n' + lines.join('\n') +
      '\nالعطور: ' + fmt(order.subtotal) + '\nالتوصيل: ' + fmt(order.delivery_fee) + '\nالمجموع: ' + fmt(order.total) +
      '\n\nالاسم: ' + name + '\nالهاتف: ' + phone + '\nالمدينة: ' + city + (address ? '\nالعنوان: ' + address : '') + (note ? '\nملاحظات: ' + note : '') +
      '\nالدفع عند الاستلام';
    $('#msg').textContent = msg;
    $('#orderCode').textContent = order.code;
    $('#wa').href = 'https://wa.me/' + String(STORE.whatsapp).replace(/\D/g, '') + '?text=' + encodeURIComponent(msg);
    $('#waNum').textContent = '+' + String(STORE.whatsapp).replace(/\D/g, '');
    $('#after').hidden = false;
    fn.textContent = 'تم تسجيل طلبك ✓ اضغط «افتح واتساب» وأرسل الرسالة لتأكيده.';
    cart = []; save(); renderCart();
    sending = false; $('#send').textContent = 'أكّد الطلب عبر واتساب';
  });

  $('#copy').addEventListener('click', function () {
    var txt = $('#msg').textContent;
    try { navigator.clipboard.writeText(txt).then(function () { toast('نُسخ الطلب'); }, selectMsg); } catch (e) { selectMsg(); }
  });
  function selectMsg() { var r = document.createRange(); r.selectNodeContents($('#msg')); var s = getSelection(); s.removeAllRanges(); s.addRange(r); toast('حدد النص وانسخه'); }

  // ---------- مستشار العطور ----------
  var Q = {who:[['men','لي (رجالي)'],['women','لها (نسائي)'],['all','ما يفرق']], when:[['day','الدوام والنهار'],['night','السهرات والمناسبات']], like:[['oud','عود وبخور'],['sweet','دافئ وحلو'],['woody','خشبي وجلدي'],['fresh','منعش وزهري']]};
  var ans = {};
  function family(p) {
    var t = [p.notes_top, p.notes_heart, p.notes_base, p.name_ar].join(' ');
    if (p.category === 'oud' || /عود|جاوي|لبان|بخور/.test(t)) return 'oud';
    if (/جلد|تبغ|فيتيفر|خشب|أرز|صندل/.test(t)) return 'woody';
    if (/عنبر|فانيليا|قرفة|كراميل|تونكا/.test(t)) return 'sweet';
    return 'fresh';
  }
  function renderFinder() {
    document.querySelectorAll('.opts').forEach(function (box) {
      var k = box.dataset.q;
      box.innerHTML = Q[k].map(function (o) { return '<button type="button" class="chip" data-k="' + k + '" data-v="' + o[0] + '" aria-pressed="false">' + o[1] + '</button>'; }).join('');
    });
  }
  document.querySelector('.finder-body').addEventListener('click', function (e) {
    var b = e.target.closest('[data-k]'); if (!b) return;
    ans[b.dataset.k] = b.dataset.v;
    document.querySelectorAll('[data-k="' + b.dataset.k + '"]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
    if (!(ans.who && ans.when && ans.like)) return;
    var pool = P.filter(function (p) { return p.in_stock !== false; });
    if (!pool.length) return;
    var best = pool.map(function (p) {
      var f = family(p), s = 0;
      if (f === ans.like) s += 3;
      if ((f === 'oud' || f === 'woody' || f === 'sweet') === (ans.when === 'night')) s += 2;
      if (ans.who === 'all' || p.category === ans.who || p.category === 'unisex' || p.category === 'oud') s += 2; else s -= 3;
      return {p: p, s: s};
    }).sort(function (a, b) { return b.s - a.s; })[0].p;
    var from = Math.min.apply(null, (best.sizes || [{price: 0}]).map(function (z) { return z.price; }));
    $('#result').innerHTML = '<strong>' + esc(best.name_ar) + '</strong> ' + (best.name_en ? '<span class="latin" style="color:var(--dim)">' + esc(best.name_en) + '</span>' : '') +
      '<p>' + esc([best.notes_top, best.notes_heart, best.notes_base].filter(Boolean).join(' · ')) + '. من ' + fmt(from) + '.</p>' +
      '<button type="button" class="btn" style="margin-top:12px" data-add-rec="' + best.id + '">أضف للسلة</button>';
  });
  $('#result').addEventListener('click', function (e) { var b = e.target.closest('[data-add-rec]'); if (b) add(b.dataset.addRec); });

  load();
})();
