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
  var CAT_LABEL = {men:'رجالي', women:'نسائي', unisex:'للجنسين', oud:'عود وبخور'};
  var P = [];
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); };
  var fmt = function (n) { return (Math.round(Number(n) * 100) / 100) + ' د.ل'; };
  var byId = function (id) { return P.find(function (p) { return String(p.id) === String(id); }); };
  var sizeOf = function (p, label) { return (p.sizes || []).find(function (s) { return s.label === label; }); };
  // التخفيض: كل حجم ممكن يكون فيه old = السعر قبل التخفيض
  var onSale = function (z) { return z && Number(z.old) > Number(z.price); };
  var priceHTML = function (z) { return z ? (onSale(z) ? '<del class="was">' + fmt(z.old) + '</del>' : '') + fmt(z.price) : ''; };
  var badgeOf = function (p) {
    if (p.badge) return '<span class="badge">' + esc(p.badge) + '</span>';
    var z = (p.sizes || []).filter(onSale)[0];
    return z ? '<span class="badge sale">تخفيض ' + Math.round((1 - z.price / z.old) * 100) + '%</span>' : '';
  };
  var minPrice = function (p) { return Math.min.apply(null, (p.sizes && p.sizes.length ? p.sizes : [{price: 0}]).map(function (z) { return Number(z.price) || 0; })); };
  var hexA = function (hex, a) {
    var h = String(hex || '#8a5a2b').replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&');
    var n = parseInt(h, 16); if (isNaN(n)) return 'rgba(225,161,11,' + a + ')';
    return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')';
  };

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
    cart = cart.filter(function (c) { var p = byId(c.id); return p && sizeOf(p, c.size) && p.in_stock !== false; });
    save();
    P.forEach(function (p) { sizeSel[p.id] = (p.sizes && p.sizes[0] && p.sizes[0].label) || ''; });
    applyStore();
    renderFilters(); renderGrid(); renderRail(); renderCart(); renderFinder(); startShowcase();
  }

  function waLink(text) { return 'https://wa.me/' + String(STORE.whatsapp).replace(/\D/g, '') + (text ? '?text=' + encodeURIComponent(text) : ''); }

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
    var wa = waLink('السلام عليكم، عندي استفسار عن عطور أثر');
    $('#waFloat').href = wa; $('#waFloat').hidden = false; $('#fWa').href = wa;
    if (STORE.instagram) $('#fIg').href = 'https://instagram.com/' + String(STORE.instagram).replace(/^@/, ''); else $('#fIg').hidden = true;
  }

  // ---------- شريط المكونات ----------
  var notes = ['عود','عنبر','مسك','جاوي','زعفران','ورد طائفي','صندل','فانيليا','زهر البرتقال','لبان','جلد','هيل'];
  var t = notes.map(function (n) { return '<span>' + n + '<i>✦</i></span>'; }).join('');
  $('#track').innerHTML = t + t;

  // ---------- رسم الزجاجة (لو ما فيه صورة) ----------
  var gid = 0;
  function bottle(p) {
    var c = p.color || '#8a5a2b', g = 'g' + (++gid);
    return '<svg viewBox="0 0 120 190" aria-hidden="true"><defs><linearGradient id="' + g + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + esc(c) + '"/><stop offset="1" stop-color="#140805"/></linearGradient></defs>' +
      '<rect x="44" y="4" width="32" height="26" rx="3" fill="#E1A10B"/><rect x="40" y="26" width="40" height="8" rx="2" fill="#b67f08"/>' +
      '<rect x="14" y="36" width="92" height="148" rx="10" fill="url(#' + g + ')" stroke="rgba(240,196,90,.55)" stroke-width="1.5"/>' +
      '<rect x="22" y="44" width="8" height="120" rx="4" fill="rgba(255,255,255,.12)"/>' +
      '<rect x="30" y="92" width="60" height="50" rx="2" fill="#200F09" opacity=".82"/>' +
      '<text x="60" y="118" text-anchor="middle" font-family="Aref Ruqaa, serif" font-size="20" fill="#E1A10B">أثر</text>' +
      '<text x="60" y="133" text-anchor="middle" font-family="Cormorant Garamond, serif" font-size="7.5" letter-spacing="2" fill="#F0C45A">ATHAR</text></svg>';
  }
  // صورة العطر، ولو تعطلت ترجع الزجاجة المرسومة
  function visual(p, lazy) {
    if (!p.image_url) return bottle(p);
    return '<img src="' + esc(p.image_url) + '" alt="' + esc(p.name_ar) + '"' + (lazy ? ' loading="lazy"' : '') + ' decoding="async" referrerpolicy="no-referrer" data-fb="' + p.id + '">';
  }
  document.addEventListener('error', function (e) {
    var img = e.target;
    if (img.tagName !== 'IMG' || !img.dataset.fb) return;
    var p = byId(img.dataset.fb); if (!p) return;
    var span = document.createElement('span'); span.innerHTML = bottle(p);
    img.replaceWith(span.firstChild);
  }, true);

  function accords(p) { return [p.notes_top, p.notes_heart, p.notes_base].filter(Boolean).join(' · '); }

  // ---------- الكرت ----------
  function card(p) {
    var s = sizeOf(p, sizeSel[p.id]) || (p.sizes || [])[0] || {label:'', price:0};
    var out = p.in_stock === false;
    return '<article class="card reveal' + (out ? ' out' : '') + '">' +
      '<button type="button" class="stage" data-open="' + p.id + '" aria-label="تفاصيل ' + esc(p.name_ar) + '" style="--tint:' + hexA(p.color, .38) + '">' +
        '<span class="glow"></span><span class="ring"></span><span class="shadow"></span>' +
        (out ? '<span class="badge soldout">نفد مؤقتاً</span>' : badgeOf(p)) +
        visual(p, true) +
        '<span class="peek" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg></span>' +
      '</button>' +
      '<div class="body">' +
        '<div class="meta"><span class="en">' + esc(p.name_en || '') + '</span>' + (CAT_LABEL[p.category] ? '<span class="cat">' + CAT_LABEL[p.category] + '</span>' : '') + '</div>' +
        '<h3 data-open="' + p.id + '">' + esc(p.name_ar) + '</h3>' +
        '<div class="accords">' + esc(accords(p)) + '</div>' +
        '<div class="row"><div class="sizes">' + (p.sizes || []).map(function (z) {
          return '<button type="button" class="size" data-id="' + p.id + '" data-size="' + esc(z.label) + '" aria-pressed="' + (z.label === s.label) + '">' + esc(z.label) + '</button>';
        }).join('') + '</div><span class="price">' + priceHTML(s) + '</span></div>' +
        '<button type="button" class="btn add" data-add="' + p.id + '"' + (out ? ' disabled' : '') + '>' + (out ? 'غير متوفر حالياً' : 'أضف للسلة') + '</button>' +
      '</div></article>';
  }

  // ---------- الفلاتر والبحث والترتيب ----------
  var active = 'all', query = '', sortBy = '';
  function inCat(p, cat) {
    if (cat === 'all') return true;
    if (cat === 'unisex') return p.category === 'unisex' || p.category === 'oud';
    return p.category === cat;
  }
  function renderFilters() {
    $('#filters').innerHTML = CATS.filter(function (c) { return c[0] === 'all' || P.some(function (p) { return inCat(p, c[0]); }); }).map(function (c) {
      var n = P.filter(function (p) { return inCat(p, c[0]); }).length;
      return '<button type="button" class="chip" data-cat="' + c[0] + '" aria-pressed="' + (c[0] === active) + '">' + c[1] + '<span class="n">' + n + '</span></button>';
    }).join('');
  }
  $('#filters').addEventListener('click', function (e) {
    var b = e.target.closest('.chip'); if (!b) return;
    active = b.dataset.cat; renderFilters(); renderGrid();
  });
  var norm = function (s) { return String(s || '').toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي'); };
  $('#q').addEventListener('input', function () { query = norm(this.value.trim()); renderGrid(); });
  $('#sort').addEventListener('change', function () { sortBy = this.value; renderGrid(); });

  function renderGrid() {
    var list = P.filter(function (p) {
      if (!inCat(p, active)) return false;
      if (!query) return true;
      return norm([p.name_ar, p.name_en, accords(p)].join(' ')).indexOf(query) > -1;
    });
    if (sortBy === 'low') list = list.slice().sort(function (a, b) { return minPrice(a) - minPrice(b); });
    if (sortBy === 'high') list = list.slice().sort(function (a, b) { return minPrice(b) - minPrice(a); });
    if (sortBy === 'az') list = list.slice().sort(function (a, b) { return String(a.name_ar).localeCompare(b.name_ar, 'ar'); });
    $('#resultCount').textContent = list.length + ' عطر';
    if (!list.length) { $('#grid').innerHTML = '<p class="loading">ما لقينا عطر بهذا الاسم. جرّب كلمة ثانية.</p>'; return; }
    $('#grid').innerHTML = list.map(card).join('');
    observe('#grid .reveal');
  }

  function renderRail() {
    var best = P.filter(function (p) { return p.badge && /طلب|مميز|best/i.test(p.badge) && p.in_stock !== false; });
    if (best.length < 2) { $('#best').hidden = true; return; }
    $('#best').hidden = false;
    $('#rail').innerHTML = best.map(card).join('');
    observe('#rail .reveal');
  }

  function onCardsClick(e) {
    var z = e.target.closest('.size');
    if (z) { sizeSel[z.dataset.id] = z.dataset.size; refreshCards(z.dataset.id); return; }
    var a = e.target.closest('[data-add]');
    if (a && !a.disabled) { add(a.dataset.add, sizeSel[a.dataset.add]); return; }
    var o = e.target.closest('[data-open]');
    if (o) openQV(o.dataset.open);
  }
  $('#grid').addEventListener('click', onCardsClick);
  $('#rail').addEventListener('click', onCardsClick);

  // تحديث الكرت بدون إعادة رسم كل الشبكة
  function refreshCards(id) {
    var p = byId(id); if (!p) return;
    var s = sizeOf(p, sizeSel[id]);
    document.querySelectorAll('.size[data-id="' + id + '"]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.size === sizeSel[id]); });
    document.querySelectorAll('[data-add="' + id + '"]').forEach(function (b) { var pr = b.closest('.body, .info'); if (pr) { var el = pr.querySelector('.price'); if (el && s) el.innerHTML = priceHTML(s); } });
  }

  // ---------- ظهور تدريجي ----------
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (en) {
    en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
  }, {rootMargin: '0px 0px -40px 0px'}) : null;
  function observe(sel) { document.querySelectorAll(sel).forEach(function (el, i) { if (!io) { el.classList.add('in'); return; } el.style.transitionDelay = Math.min(i % 8, 6) * 45 + 'ms'; io.observe(el); }); }
  observe('.reveal');

  // ---------- العرض السريع ----------
  var qvId = null;
  function openQV(id) {
    var p = byId(id); if (!p) return;
    qvId = p.id;
    var s = sizeOf(p, sizeSel[p.id]) || (p.sizes || [])[0] || {label:'', price:0};
    var out = p.in_stock === false;
    var pyr = [['الافتتاحية', p.notes_top], ['القلب', p.notes_heart], ['القاعدة', p.notes_base]].filter(function (x) { return x[1]; });
    $('#qvBox').innerHTML =
      '<button class="x" type="button" data-close aria-label="إغلاق">×</button>' +
      '<div class="stage" style="--tint:' + hexA(p.color, .42) + '"><span class="glow"></span><span class="ring"></span><span class="shadow"></span>' +
        badgeOf(p) + visual(p, false) + '</div>' +
      '<div class="info">' +
        (p.name_en ? '<span class="en">' + esc(p.name_en) + '</span>' : '') +
        '<h3 id="qvName">' + esc(p.name_ar) + '</h3>' +
        (CAT_LABEL[p.category] ? '<div class="meta" style="justify-content:flex-start"><span class="cat">' + CAT_LABEL[p.category] + '</span></div>' : '') +
        (p.description ? '<p class="desc">' + esc(p.description) + '</p>' : '') +
        (pyr.length ? '<dl class="pyramid">' + pyr.map(function (x) { return '<div><dt>' + x[0] + '</dt><dd>' + esc(x[1]) + '</dd></div>'; }).join('') + '</dl>' : '') +
        '<div class="row"><div class="sizes">' + (p.sizes || []).map(function (z) {
          return '<button type="button" class="size" data-id="' + p.id + '" data-size="' + esc(z.label) + '" aria-pressed="' + (z.label === s.label) + '">' + esc(z.label) + '</button>';
        }).join('') + '</div><span class="price">' + priceHTML(s) + '</span></div>' +
        '<button type="button" class="btn add" data-add="' + p.id + '"' + (out ? ' disabled' : '') + '>' + (out ? 'غير متوفر حالياً' : 'أضف للسلة') + '</button>' +
        '<a class="btn btn-line" style="margin-top:4px" target="_blank" rel="noopener" href="' + esc(waLink('السلام عليكم، أبي أسأل عن عطر ' + p.name_ar)) + '">اسأل عنه في واتساب</a>' +
      '</div>';
    $('#qv').hidden = false; document.body.style.overflow = 'hidden';
    setTimeout(function () { var x = $('#qvBox .x'); if (x) x.focus(); }, 30);
  }
  function closeQV() { $('#qv').hidden = true; document.body.style.overflow = ''; qvId = null; }
  $('#qv').addEventListener('click', function (e) {
    if (e.target.closest('[data-close]')) { closeQV(); return; }
    var z = e.target.closest('.size');
    if (z) { sizeSel[z.dataset.id] = z.dataset.size; refreshCards(z.dataset.id); return; }
    var a = e.target.closest('[data-add]');
    if (a && !a.disabled) { add(a.dataset.add, sizeSel[a.dataset.add]); closeQV(); openCart(); }
  });

  // ---------- العرض المتحرك في الواجهة ----------
  function startShowcase() {
    var list = P.filter(function (p) { return p.image_url && p.in_stock !== false; });
    var feat = list.filter(function (p) { return p.badge; }).concat(list.filter(function (p) { return !p.badge; })).slice(0, 8);
    if (!feat.length) feat = P.slice(0, 5);
    if (!feat.length) return;
    var i = 0, img = $('#showImg'), cap = $('#showCap');
    function show() {
      var p = feat[i % feat.length];
      img.classList.add('out');
      setTimeout(function () {
        if (p.image_url) { img.src = p.image_url; img.alt = p.name_ar; img.hidden = false; }
        else { img.hidden = true; }
        $('#showName').textContent = p.name_ar;
        $('#showPrice').textContent = 'من ' + fmt(minPrice(p));
        $('#showAdd').dataset.id = p.id;
        cap.hidden = false;
        img.onload = function () { img.classList.remove('out'); };
        if (img.complete) img.classList.remove('out');
      }, 450);
      i++;
    }
    show();
    if (feat.length > 1 && !matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(show, 4200);
    $('#showAdd').onclick = function () { add(this.dataset.id); };
    img.onclick = function () { openQV($('#showAdd').dataset.id); };
    img.style.cursor = 'pointer';
  }

  function add(id, size) {
    var p = byId(id); if (!p || p.in_stock === false) return;
    size = size || sizeSel[p.id] || (p.sizes[0] && p.sizes[0].label);
    var ex = cart.find(function (c) { return String(c.id) === String(id) && c.size === size; });
    if (ex) ex.qty = Math.min(20, ex.qty + 1); else cart.push({id: p.id, size: size, qty: 1});
    save(); renderCart();
    var ct = $('#count'); ct.classList.remove('bump'); void ct.offsetWidth; ct.classList.add('bump');
    toast('أُضيف ' + p.name_ar + ' للسلة ✓');
  }
  var tt;
  function toast(m) { var el = $('#toast'); el.textContent = m; el.hidden = false; clearTimeout(tt); tt = setTimeout(function () { el.hidden = true; }, 1900); }

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
        return '<div class="item"><div class="th">' + visual(p, true) + '</div><div><h4>' + esc(p.name_ar) + '</h4><small>' + esc(c.size) + '</small></div><span class="price">' + fmt(pr) + '</span>' +
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
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { if (!$('#qv').hidden) closeQV(); else closeCart(); } });

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
    $('#wa').href = waLink(msg);
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
    var t = [p.notes_top, p.notes_heart, p.notes_base, p.name_ar, p.name_en].join(' ');
    if (p.category === 'oud' || /عود|جاوي|لبان|بخور/.test(t)) return 'oud';
    if (/جلد|تبغ|فيتيفر|خشب|أرز|صندل|باتشولي/.test(t)) return 'woody';
    if (/عنبر|فانيليا|قرفة|كراميل|تونكا|برالين|تمر|توفي|عسل/.test(t)) return 'sweet';
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
      if (p.badge) s += 0.5;
      return {p: p, s: s + Math.random() * 0.3};
    }).sort(function (a, b) { return b.s - a.s; })[0].p;
    $('#result').innerHTML = '<div class="thumb">' + visual(best, false) + '</div><div><strong>' + esc(best.name_ar) + '</strong> ' + (best.name_en ? '<span class="latin" style="color:var(--dim)">' + esc(best.name_en) + '</span>' : '') +
      '<p>' + esc(accords(best) || CAT_LABEL[best.category] || '') + (accords(best) ? '. ' : ' · ') + 'من ' + fmt(minPrice(best)) + '.</p>' +
      '<div style="display:flex; gap:8px; margin-top:10px; flex-wrap:wrap"><button type="button" class="btn" style="padding:9px 18px; font-size:14px" data-add-rec="' + best.id + '">أضف للسلة</button>' +
      '<button type="button" class="btn btn-line" style="padding:9px 18px; font-size:14px" data-open-rec="' + best.id + '">التفاصيل</button></div></div>';
  });
  $('#result').addEventListener('click', function (e) {
    var b = e.target.closest('[data-add-rec]'); if (b) add(b.dataset.addRec);
    var o = e.target.closest('[data-open-rec]'); if (o) openQV(o.dataset.openRec);
  });

  load();
})();
