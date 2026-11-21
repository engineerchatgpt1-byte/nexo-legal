// NEXO — الموقع (اتجاه D). JavaScript عادي + Supabase، من غير أي framework علشان يفتح بسرعة.
import { createClient } from './vendor/supabase.js';

const SUPABASE_URL = 'https://okzitsbqkohgozuwdewh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_6U1RsmsvDeBUUQgirfALFA_Ox0nxeyp';
const EMAIL_DOMAIN = 'users.nexosubs.app';
const sb = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: true, autoRefreshToken: true } });

const app = document.getElementById('app');
const LOGOS = ['chatgpt', 'claude', 'linkedin', 'gemini', 'grok', 'higgsfield'];
const CATS = { ai: 'ذكاء اصطناعي', design: 'تصميم', career: 'شغل وكارير', productivity: 'إنتاجية' };
const STATUS = {
  pending_payment: ['بانتظار الدفع', ''],
  payment_review: ['جارٍ مراجعة الدفع', 'blue'],
  payment_rejected: ['الدفع محتاج مراجعة منك', 'red'],
  paid: ['تم الدفع — جاهز للتفعيل', 'blue'],
  activating: ['قيد التفعيل', 'blue'],
  awaiting_customer: ['مستنيين ردّك', 'orange'],
  activated: ['تم التفعيل', 'green'],
  issue: ['فيه مشكلة', 'red'],
  refunded: ['تم الاسترداد', ''],
  cancelled: ['ملغي', ''],
  expired: ['انتهت مهلة الدفع', ''],
};

// ---------------- أدوات ----------------
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const egp = (n) => `${Number(n).toLocaleString('en-US')} ج.م`;
const qs = (sel, root = document) => root.querySelector(sel);
let toastTimer;
function toast(msg, err = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `show${err ? ' err' : ''}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.className = ''), 3800);
}
const X_MARK = (stroke = '#FFFFFF', size = 28) => `<svg width="${size}" height="${size}" viewBox="0 0 30 30" aria-hidden="true"><path d="M5 5L25 25M25 5L5 25" stroke="${stroke}" stroke-width="4.2" stroke-linecap="round"/><circle cx="15" cy="15" r="4.4" fill="#FF7A1F"/></svg>`;
const ICON = {
  back: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
  check: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2F55F0" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>',
  tick: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2F55F0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>',
  orders: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/></svg>',
  user: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
  menu: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  send: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 3L3 10.5l7 2.5 2.5 7z"/></svg>',
  image: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/></svg>',
};
function darken(hex, amt = 0.82) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return '#10131F';
  const n = parseInt(m[1], 16);
  const mix = (c, t) => Math.round(c * (1 - amt) + t * amt);
  const r = mix((n >> 16) & 255, 7), g = mix((n >> 8) & 255, 9), b = mix(n & 255, 15);
  return `rgb(${r},${g},${b})`;
}
function logo(p, cls = '') {
  if (LOGOS.includes(p.slug)) return `<img class="${cls}" src="assets/logos/${p.slug}.png" alt="" width="84" height="84" loading="lazy">`;
  return `<span class="lt ${cls}" style="background:${esc(p.brand_color || '#2F55F0')}" aria-hidden="true">${esc((p.name || '?')[0])}</span>`;
}
const normPhone = (v) => {
  let s = String(v || '').trim().replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[\s\-()]/g, '');
  if (s.startsWith('+20')) s = '0' + s.slice(3);
  if (s.startsWith('0020')) s = '0' + s.slice(4);
  if (s.startsWith('20') && s.length === 12) s = '0' + s.slice(2);
  if (s.length === 10 && s.startsWith('1')) s = '0' + s;
  return s;
};
const validPhone = (v) => /^01[0125][0-9]{8}$/.test(normPhone(v));
const e164 = (v) => '+20' + normPhone(v).slice(1);
const fmtTime = (d) => { const h = d.getHours() % 12 || 12; return `${h}:${String(d.getMinutes()).padStart(2, '0')} ${d.getHours() < 12 ? 'ص' : 'م'}`; };
const fmtDay = (d) => {
  const t = new Date(); t.setHours(0, 0, 0, 0);
  const x = new Date(d); x.setHours(0, 0, 0, 0);
  const diff = Math.round((t - x) / 864e5);
  if (diff === 0) return 'النهارده';
  if (diff === 1) return 'امبارح';
  return x.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: x.getFullYear() === t.getFullYear() ? undefined : 'numeric' });
};
async function fnError(error, data) {
  if (data && data.code) return data.code;
  try { const j = await error?.context?.json?.(); return j?.code || 'server'; } catch { return 'server'; }
}

// ---------------- الحالة ----------------
const state = { session: null, profile: null, products: null, cleanup: [] };
function cleanupView() { state.cleanup.forEach((f) => { try { f(); } catch {} }); state.cleanup = []; }

async function loadProducts() {
  if (state.products) return state.products;
  const { data, error } = await sb.from('products')
    .select('id, slug, name, tagline, description, category, brand_color, is_featured, sort_order, plans(id, name, duration_label, duration_days, price_egp, compare_at_price_egp, delivery_eta, what_you_get, warranty_text, required_fields, is_active, sort_order)')
    .eq('is_active', true).order('sort_order');
  if (error) throw error;
  state.products = (data || []).map((p) => ({ ...p, plans: (p.plans || []).filter((x) => x.is_active).sort((a, b) => a.sort_order - b.sort_order) })).filter((p) => p.plans.length);
  return state.products;
}
async function loadProfile() {
  if (!state.session) return (state.profile = null);
  const { data } = await sb.from('profiles').select('full_name, username, role').eq('id', state.session.user.id).maybeSingle();
  state.profile = data;
}

// ---------------- الهيدر والفوتر ----------------
function header() {
  const logged = !!state.session;
  return `
<header class="site-head" id="head">
  <div class="wrap bar">
    <a class="brand" href="#/" aria-label="NEXO — الرئيسية">${X_MARK()}<b>NEXO</b></a>
    <nav class="nav" aria-label="القائمة الرئيسية">
      <a href="#/" data-scroll="collection">الاشتراكات</a>
      <a href="#/" data-scroll="how">إزاي بتشتغل</a>
      <a href="#/" data-scroll="faq">الأسئلة الشائعة</a>
    </nav>
    <div class="head-actions">
      ${logged
        ? `<a class="icon-btn" href="#/orders" aria-label="طلباتي">${ICON.orders}</a>
           <button class="icon-btn" id="accBtn" aria-label="الحساب" aria-haspopup="true" aria-expanded="false">${ICON.user}</button>`
        : `<a class="plain hide-m" href="#/login">دخول</a>
           <a class="btn btn-white btn-sm" href="#/" data-scroll="collection">ابدأ الآن</a>`}
      <button class="icon-btn menu-btn" id="menuBtn" aria-label="القائمة" aria-expanded="false">${ICON.menu}</button>
    </div>
  </div>
  <div class="drawer" id="drawer"><div class="wrap">
    <a href="#/" data-scroll="collection">الاشتراكات</a>
    <a href="#/" data-scroll="how">إزاي بتشتغل</a>
    <a href="#/" data-scroll="faq">الأسئلة الشائعة</a>
    ${logged ? '<a href="#/orders">طلباتي</a><a href="#" data-logout>تسجيل الخروج</a>' : '<a href="#/login">تسجيل الدخول</a><a href="#/signup">حساب جديد</a>'}
  </div></div>
</header>`;
}
function footer() {
  return `
<footer class="site-foot">
  <div class="wrap foot-top">
    <div style="display:flex;flex-direction:column;gap:12px;max-width:300px">
      <span class="brand">${X_MARK('#FFFFFF', 26)}<b style="color:#fff">NEXO</b></span>
      <span>اشتراكاتك العالمية، بعملتك المحلية.</span>
    </div>
    <nav aria-label="الاشتراكات"><b>الاشتراكات</b>${(state.products || []).slice(0, 5).map((p) => `<a href="#/p/${esc(p.slug)}">${esc(p.name)}</a>`).join('')}</nav>
    <nav aria-label="NEXO"><b>NEXO</b><a href="#/" data-scroll="how">إزاي بتشتغل</a><a href="#/" data-scroll="faq">الأسئلة الشائعة</a><a href="#/orders">طلباتي</a></nav>
    <nav aria-label="قانوني"><b>قانوني</b><a href="privacy.html">سياسة الخصوصية</a></nav>
  </div>
  <div class="wrap foot-bot"><span>© ${new Date().getFullYear()} NEXO. All rights reserved.</span><span class="en" style="letter-spacing:.2em">CAIRO · EGYPT</span></div>
</footer>`;
}
function bindChrome() {
  const head = qs('#head');
  const onScroll = () => head && head.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  state.cleanup.push(() => window.removeEventListener('scroll', onScroll));
  onScroll();
  qs('#menuBtn')?.addEventListener('click', (e) => {
    const d = qs('#drawer'); d.classList.toggle('open');
    e.currentTarget.setAttribute('aria-expanded', d.classList.contains('open'));
  });
  document.querySelectorAll('[data-scroll]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.dataset.scroll;
    qs('#drawer')?.classList.remove('open');
    if (route().name === 'home') { e.preventDefault(); qs('#' + id)?.scrollIntoView({ behavior: 'smooth' }); }
    else { sessionStorage.setItem('scrollTo', id); }
  }));
  document.querySelectorAll('[data-logout]').forEach((a) => a.addEventListener('click', async (e) => { e.preventDefault(); await sb.auth.signOut(); location.hash = '#/'; }));
  const accBtn = qs('#accBtn');
  if (accBtn) accBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const old = qs('.acc-menu');
    if (old) { old.remove(); accBtn.setAttribute('aria-expanded', 'false'); return; }
    const m = document.createElement('div');
    m.className = 'acc-menu';
    m.innerHTML = `<div class="hd"><b>${esc(state.profile?.full_name || 'حسابي')}</b><span class="en">@${esc(state.profile?.username || '')}</span></div>
      <a href="#/orders">طلباتي</a><button type="button" data-logout>تسجيل الخروج</button>`;
    qs('#head').appendChild(m);
    accBtn.setAttribute('aria-expanded', 'true');
    m.querySelector('[data-logout]').addEventListener('click', async () => { await sb.auth.signOut(); location.hash = '#/'; });
    const close = () => { m.remove(); accBtn.setAttribute('aria-expanded', 'false'); document.removeEventListener('click', close); };
    setTimeout(() => document.addEventListener('click', close), 0);
  });
}
function shell(inner, { withFooter = true } = {}) {
  app.innerHTML = header() + `<main id="main">${inner}</main>` + (withFooter ? footer() : '');
  bindChrome();
  window.scrollTo(0, 0);
}
const loadingView = () => shell('<div class="loading"><span class="spin" aria-label="جاري التحميل"></span></div>', { withFooter: false });

// ---------------- الرئيسية ----------------
const perLabel = (d) => d >= 360 ? 'سنة' : d >= 85 && d <= 95 ? '3 شهور' : d >= 175 && d <= 185 ? '6 شهور' : 'شهر';
function cardStats(p) {
  const cheapest = p.plans.reduce((a, b) => (b.price_egp < a.price_egp ? b : a));
  const deal = p.plans.filter((x) => x.compare_at_price_egp > x.price_egp)
    .map((x) => ({ x, pct: Math.round((1 - x.price_egp / x.compare_at_price_egp) * 100) }))
    .sort((a, b) => b.pct - a.pct)[0];
  return { cheapest, deal };
}
const STORE_ICON = {
  bolt: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>',
  shield: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
  user: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
  search: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
};
function productCard(p) {
  const { cheapest, deal } = cardStats(p);
  const multi = p.plans.length > 1;
  const [whole] = String(Number(cheapest.price_egp).toLocaleString('en-US')).split('.');
  const eta = (cheapest.delivery_eta || 'خلال ساعتين').replace(' في مواعيد العمل', '');
  return `<article class="acard">
    <a class="aimg" href="#/p/${esc(p.slug)}" tabindex="-1" aria-hidden="true" style="--b:${esc(p.brand_color || '#2F55F0')}">
      ${p.is_featured ? '<span class="abadge best">الأكثر طلبًا</span>' : ''}
      ${logo(p)}
    </a>
    <div class="ainfo">
      <span class="acat">${esc(CATS[p.category] || 'اشتراك')}</span>
      <h3 class="attl"><a href="#/p/${esc(p.slug)}">${esc(p.name)}</a></h3>
      <p class="asub">${esc(p.tagline)}</p>
      ${deal ? `<div class="adeal"><span>خصم ${deal.pct}%</span>وفّر ${egp(deal.x.compare_at_price_egp - deal.x.price_egp)}${multi ? ` في ${esc(deal.x.duration_label || deal.x.name)}` : ''}</div>` : ''}
      <div class="aprice">${multi ? '<span class="from">يبدأ من</span>' : ''}<b>${whole}</b><span class="cur">ج.م</span><span class="per">/ ${perLabel(cheapest.duration_days)}</span></div>
      ${deal && !multi ? `<span class="awas">السعر قبل الخصم: <s>${egp(deal.x.compare_at_price_egp)}</s></span>` : ''}
      ${multi ? `<div class="aplans">${p.plans.map((x) => `<span>${esc(x.duration_label || x.name)}</span>`).join('')}</div>` : ''}
      <ul class="aperks">
        <li class="ok">${STORE_ICON.bolt}تفعيل ${esc(eta)}</li>
        <li>${STORE_ICON.shield}${esc(cheapest.warranty_text || 'ضمان طول مدة الاشتراك')}</li>
        <li>${STORE_ICON.user}على حسابك أنت</li>
      </ul>
      <a class="btn btn-buy" href="#/p/${esc(p.slug)}">اطلب الآن</a>
    </div>
  </article>`;
}
function gridMark(products) {
  // 3 صفوف مربعات بتتحرك باستمرار (زي شريط The Engineer for CV) والأيقونات ماشية مع مربعاتها
  const n = products.length || 1;
  const rows = [
    { pat: [0, -1, -1, 2, -1, -1, 3, -1, 1, -1], dir: '', dur: 34 },
    { pat: [-1, 1, -1, -1, 3, -1, 0, -1, -1, 2], dir: 'rev', dur: 40 },
    { pat: [2, -1, 0, -1, -1, 1, -1, -1, 3, -1], dir: '', dur: 30 },
  ];
  const tile = (k, j) => {
    const p = k >= 0 ? products[k % n] : null;
    return p ? `<div class="mt lit">${logo(p)}</div>` : `<div class="mt f${(j % 3) + 1}"></div>`;
  };
  return `<div class="grid-mark" aria-hidden="true">
    ${rows.map((r) => {
      const set = r.pat.map(tile).join('');
      return `<div class="mrow"><div class="mtrack ${r.dir}" style="--dur:${r.dur}s">${set}${set}</div></div>`;
    }).join('')}
  </div>`;
}
async function homeView() {
  loadingView();
  let products = [];
  try { products = await loadProducts(); } catch { toast('مقدرناش نحمّل الاشتراكات. جرّب تاني.', true); }
  const cats = ['all', ...Object.keys(CATS).filter((c) => products.some((p) => p.category === c))];
  shell(`
<section class="dark hero">
  <div class="wrap">
    <span class="eyebrow">NEXO SUBSCRIPTIONS</span>
    <h1>اشتراكاتك العالمية<br><span>بعملتك المحلية</span></h1>
    <p class="lead">اشتراكات رسمية في ${products.slice(0, 4).map((p) => esc(p.name.split(' ')[0])).join('، ')}، بالجنيه المصري، مفعّلة على حسابك وبمتابعة فريق حقيقي.</p>
    <div class="ctas">
      <a class="btn btn-blue" href="#/" data-scroll="collection">اختار اشتراكك</a>
      <a class="btn btn-ghost-d" href="#/" data-scroll="how">شوف إزاي بتشتغل ${ICON.back}</a>
    </div>
    ${gridMark(products)}
    <div class="facts">
      <div><div class="k">ACTIVATION</div><div class="v">خلال ساعتين</div><div class="s">في مواعيد العمل من تأكيد الدفع</div></div>
      <div><div class="k">PAYMENT</div><div class="v">بالجنيه المصري</div><div class="s">InstaPay أو Vodafone Cash</div></div>
      <div><div class="k">SUPPORT</div><div class="v">فريق حقيقي</div><div class="s">شات مخصص لكل طلب</div></div>
    </div>
  </div>
</section>

<section class="store" id="collection">
  <div class="wrap">
    <div class="store-top">
      <div><span class="eyebrow">THE COLLECTION</span><h2 class="h2">كل الاشتراكات</h2></div>
      <label class="ssearch">${STORE_ICON.search}<span class="sr">ابحث في الاشتراكات</span><input id="q" type="search" placeholder="ابحث عن اشتراك… ChatGPT، Canva" autocomplete="off"></label>
    </div>
    <div class="store-body">
      <aside class="sfilters" aria-label="الفلاتر">
        <div class="fgroup"><b>التصنيف</b>
          ${cats.map((c, i) => `<label class="fopt"><input type="radio" name="cat" value="${c}" ${i === 0 ? 'checked' : ''}><span>${c === 'all' ? 'كل الاشتراكات' : CATS[c]}</span><em>${c === 'all' ? products.length : products.filter((p) => p.category === c).length}</em></label>`).join('')}
        </div>
        <div class="fgroup"><b>العروض</b><label class="fopt chk"><input type="checkbox" id="onlyDeals"><span>عليها خصم</span></label></div>
        <div class="fgroup trust"><b>مع كل اشتراك</b><span>${STORE_ICON.bolt}تفعيل خلال ساعتين</span><span>${STORE_ICON.shield}ضمان طول المدة</span><span>${STORE_ICON.user}دفع بالجنيه المصري</span></div>
      </aside>
      <div class="sresults">
        <div class="sbar"><span id="count" aria-live="polite"></span>
          <label class="ssort">ترتيب حسب:
            <select id="sort"><option value="featured">الأكثر طلبًا</option><option value="low">السعر: من الأقل</option><option value="high">السعر: من الأعلى</option><option value="deal">أكبر خصم</option></select>
          </label>
        </div>
        <div class="agrid" id="cards"></div>
      </div>
    </div>
  </div>
</section>

<section class="sec sec-soft">
  <div class="wrap split">
    <div class="txt">
      <span class="eyebrow">ORDER TRACKING</span>
      <h2 class="h2">كل خطوة قدامك.<br>لحظة بلحظة.</h2>
      <p>من لحظة الطلب لحد التفعيل، بتشوف حالة طلبك وبيوصلك إشعار مع كل تحديث. ولو محتاج حاجة، بتكتب للفريق في شات الطلب نفسه.</p>
      <ul class="dots"><li>صفحة متابعة لكل طلب</li><li>شات مباشر مع فريق NEXO</li><li>إشعار مع كل تحديث لحد التفعيل</li></ul>
    </div>
    <div class="vis">
      <div class="phone"><div class="scr">
        <div style="padding:20px 18px 14px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #ECEEF3">
          ${products[0] ? logo(products[0]).replace('class=""', 'style="width:40px;height:40px;border-radius:11px"') : ''}
          <div style="flex:1"><div style="font-size:15px;font-weight:600">${esc(products[0]?.name || 'ChatGPT Plus')}</div><div class="en" style="font-size:12px;color:#5B6480">NX-10012</div></div>
          <span class="status orange">جاري التفعيل</span>
        </div>
        <div style="padding:16px 18px;display:flex;flex-direction:column;gap:10px;background:#F7F8FB">
          <span style="align-self:center;font-size:12px;color:#5B6480;background:#fff;border:1px solid #ECEEF3;padding:5px 12px;border-radius:999px">تم تأكيد الدفع</span>
          <div class="bub them" style="max-width:88%"><span class="who">فريق NEXO</span>تم تأكيد الدفع. ابعتلنا الإيميل المسجّل علشان نبدأ التفعيل.</div>
          <div class="bub me ltr" style="max-width:88%">ahmed.k@gmail.com</div>
          <div class="bub them" style="max-width:88%"><span class="who">فريق NEXO</span>تمام، بدأنا التفعيل وهيوصلك إشعار أول ما يخلص.</div>
        </div>
      </div></div>
    </div>
  </div>
</section>

<section class="sec" id="how">
  <div class="wrap">
    <span class="eyebrow">HOW IT WORKS</span>
    <h2 class="h2" style="margin-bottom:40px">أربع خطوات. ولا تعقيد.</h2>
    <ol class="steps">
      <li><span class="n">01</span><span class="t">اختار</span><span class="d">الاشتراك والمدة. السعر واضح، ومن غير حساب لحد ما تطلب.</span></li>
      <li><span class="n">02</span><span class="t">ادفع</span><span class="d">InstaPay أو Vodafone Cash، واكتب رقم العملية في صفحة الطلب.</span></li>
      <li><span class="n">03</span><span class="t">نفعّل</span><span class="d">الفريق يأكد الدفع ويفعّل على إيميلك خلال ساعتين في مواعيد العمل.</span></li>
      <li class="last"><span class="n">04</span><span class="t">اشتغل</span><span class="d">اشتراكك شغال، وعليه ضمان طول مدته.</span></li>
    </ol>
  </div>
</section>

<section class="sec sec-soft" id="faq">
  <div class="wrap mid faq">
    <span class="eyebrow">FAQ</span>
    <h2 class="h2" style="margin-bottom:20px">الأسئلة الشائعة</h2>
    <details><summary>الاشتراك بيتفعّل على حسابي أنا؟</summary><p>أيوه. بتبعتلنا الإيميل المسجّل في الخدمة من شات الطلب، والتفعيل بيتم عليه.</p></details>
    <details><summary>التفعيل بياخد قد إيه؟</summary><p>خلال ساعتين في مواعيد العمل من تأكيد الدفع، وبيوصلك إشعار أول ما يتم.</p></details>
    <details><summary>لازم أعمل حساب؟</summary><p>بس وقت الطلب. بتسجّل باسم مستخدم ورقم واتساب، وبتأكد الرقم برسالة واتساب واحدة.</p></details>
    <details><summary>بدفع إزاي؟</summary><p>بتحوّل المبلغ بـ InstaPay أو Vodafone Cash على الرقم اللي بيظهر في صفحة الطلب، وبتكتب رقم العملية. صورة الإيصال اختيارية.</p></details>
    <details><summary>لو حصلت مشكلة في الاشتراك؟</summary><p>الاشتراك عليه ضمان طول مدته. اكتبلنا في شات الطلب والفريق هيحلها معاك.</p></details>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="cta-band">
      <svg class="x" viewBox="0 0 30 30" aria-hidden="true"><path d="M5 5L25 25M25 5L5 25" stroke="#FFFFFF" stroke-width="4.2" stroke-linecap="round"/></svg>
      <h2>اشتراكك الجاي من NEXO.</h2>
      <p>من غير فيزا، من غير كارت دولي، ومن غير ما تستنى حد يرد عليك.</p>
      <a class="btn btn-white" href="#/" data-scroll="collection">اختار اشتراكك</a>
    </div>
  </div>
</section>`);
  const applyStore = () => {
    const q = qs('#q').value.trim().toLowerCase();
    const cat = qs('input[name=cat]:checked')?.value || 'all';
    const deals = qs('#onlyDeals').checked;
    const sort = qs('#sort').value;
    let list = products.filter((p) => (cat === 'all' || p.category === cat)
      && (!deals || cardStats(p).deal)
      && (!q || `${p.name} ${p.tagline} ${CATS[p.category] || ''}`.toLowerCase().includes(q)));
    const price = (p) => cardStats(p).cheapest.price_egp;
    if (sort === 'low') list.sort((a, b) => price(a) - price(b));
    else if (sort === 'high') list.sort((a, b) => price(b) - price(a));
    else if (sort === 'deal') list.sort((a, b) => (cardStats(b).deal?.pct || 0) - (cardStats(a).deal?.pct || 0));
    else list.sort((a, b) => (b.is_featured - a.is_featured) || (a.sort_order - b.sort_order));
    qs('#count').textContent = `${list.length} ${list.length === 1 ? 'اشتراك' : list.length <= 10 ? 'اشتراكات' : 'اشتراك'}`;
    qs('#cards').innerHTML = list.map(productCard).join('') || '<p class="empty">مفيش اشتراكات بالمواصفات دي. جرّب كلمة تانية أو شيل الفلتر.</p>';
  };
  ['#q', '#sort', '#onlyDeals'].forEach((s2) => qs(s2).addEventListener('input', applyStore));
  document.querySelectorAll('input[name=cat]').forEach((r) => r.addEventListener('change', applyStore));
  applyStore();
  const to = sessionStorage.getItem('scrollTo');
  if (to) { sessionStorage.removeItem('scrollTo'); setTimeout(() => qs('#' + to)?.scrollIntoView(), 50); }
}

// ---------------- صفحة الخدمة ----------------
async function productView(slug) {
  loadingView();
  let products;
  try { products = await loadProducts(); } catch { return shell('<p class="empty">مقدرناش نحمّل الصفحة. جرّب تاني.</p>'); }
  const p = products.find((x) => x.slug === slug);
  if (!p) return shell('<div class="wrap"><p class="empty">الاشتراك ده مش موجود. <a class="link" href="#/">ارجع للاشتراكات</a></p></div>');
  document.title = `${p.name} — NEXO`;
  let sel = p.plans.find((x) => x.compare_at_price_egp) || p.plans[0];
  const planHtml = (x) => {
    const save = x.compare_at_price_egp ? x.compare_at_price_egp - x.price_egp : 0;
    return `<label class="plan"><input type="radio" name="plan" value="${x.id}" ${x.id === sel.id ? 'checked' : ''}>
      <span class="lbl"><span style="display:block;font-weight:600">${esc(x.duration_label || x.name)}</span>${save > 0 ? `<span class="save">وفّر ${egp(save)}</span>` : ''}</span>
      <span class="pr">${egp(x.price_egp)}${x.compare_at_price_egp ? `<span class="was">${egp(x.compare_at_price_egp)}</span>` : ''}</span></label>`;
  };
  const infoHtml = (x) => `
    <div class="mini-facts">
      <div><div class="k">ACTIVATION</div><div class="v">${esc(x.delivery_eta || 'خلال ساعتين في مواعيد العمل')}</div></div>
      <div><div class="k">WARRANTY</div><div class="v">${esc(x.warranty_text || 'ضمان طول المدة')}</div></div>
      <div><div class="k">ACCOUNT</div><div class="v">على حسابك أنت</div></div>
    </div>
    <div><span class="eyebrow">WHAT YOU GET</span><h2 style="margin:8px 0 0;font-size:30px">هتاخد إيه</h2>
      <ul class="checks">${(x.what_you_get || []).map((w) => `<li>${ICON.check}${esc(w)}</li>`).join('')}<li>${ICON.check}متابعة وشات مع فريق NEXO طول مدة الطلب</li></ul></div>
    ${(x.required_fields || []).length ? `<div><span class="eyebrow">WE'LL NEED</span><h2 style="margin:8px 0 12px;font-size:24px">هنحتاج منك</h2>
      <ul class="checks">${x.required_fields.map((f) => `<li>${ICON.check}${esc(f.label)}</li>`).join('')}</ul></div>` : ''}
    <div class="panel" style="background:var(--soft);border:0"><span class="eyebrow">AFTER YOU ORDER</span><h2 style="margin:8px 0 18px;font-size:24px">بعد ما تطلب</h2>
      <ol class="steps" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr))">
        <li style="background:#fff;border:0"><span class="n" style="font-size:28px">01</span><span class="t" style="font-size:16px">حوّل المبلغ</span><span class="d" style="font-size:14px">InstaPay أو فودافون كاش، واكتب رقم العملية.</span></li>
        <li style="background:#fff;border:0"><span class="n" style="font-size:28px">02</span><span class="t" style="font-size:16px">الفريق يأكد</span><span class="d" style="font-size:14px">ولو محتاج حاجة منك هيكتبلك في شات الطلب.</span></li>
        <li style="background:#fff;border:0"><span class="n" style="font-size:28px;color:var(--orange)">03</span><span class="t" style="font-size:16px">اشتغل</span><span class="d" style="font-size:14px">إشعار بالتفعيل وتاريخ انتهاء الاشتراك.</span></li>
      </ol></div>`;
  shell(`
<section class="p-hero" style="background:${darken(p.brand_color, 0.86)}">
  <div class="wrap">
    <nav class="crumb" aria-label="مسار الصفحة"><a href="#/">الاشتراكات</a> <span aria-hidden="true">/</span> <span>${esc(p.name)}</span></nav>
    <div class="row">
      ${logo(p, 'logo')}
      <div style="flex:1 1 300px;min-width:0">
        <span class="eyebrow" style="color:#FFB27A">${p.is_featured ? 'BESTSELLER · ' : ''}${esc((p.category || '').toUpperCase())}</span>
        <h1>${esc(p.name)}</h1>
        <p>${esc(p.tagline)}</p>
      </div>
    </div>
  </div>
</section>
<div class="wrap p-main">
  <div class="info" id="info">${infoHtml(sel)}</div>
  <aside class="order-box" aria-label="اطلب الاشتراك">
    <fieldset style="border:0;margin:0;padding:0;display:flex;flex-direction:column;gap:10px">
      <legend class="eyebrow" style="color:var(--muted-d);margin-bottom:12px;padding:0">CHOOSE YOUR PLAN</legend>
      ${p.plans.map(planHtml).join('')}
    </fieldset>
    <div class="total"><span style="color:var(--muted-d)">الإجمالي</span><b id="total">${egp(sel.price_egp)}</b></div>
    <button class="btn btn-blue btn-block" id="orderBtn">اطلب الاشتراك</button>
    <p style="margin:0;text-align:center;font-size:13px;color:var(--muted-d)">${state.session ? 'هتكمّل بيانات الطلب في الخطوة الجاية' : 'هتعمل حساب سريع برقم الواتساب في الخطوة الجاية'}</p>
  </aside>
</div>`);
  document.querySelectorAll('input[name=plan]').forEach((r) => r.addEventListener('change', () => {
    sel = p.plans.find((x) => x.id === r.value);
    qs('#total').textContent = egp(sel.price_egp);
    qs('#info').innerHTML = infoHtml(sel);
  }));
  qs('#orderBtn').addEventListener('click', () => {
    const next = `#/checkout/${sel.id}`;
    if (!state.session) { sessionStorage.setItem('afterLogin', next); location.hash = '#/login?reason=order'; return; }
    location.hash = next;
  });
}

// ---------------- الدخول والتسجيل ----------------
function authPage(inner) { shell(`<div class="page"><div class="wrap narrow">${inner}</div></div>`, { withFooter: false }); }
function goAfterLogin() {
  const next = sessionStorage.getItem('afterLogin');
  sessionStorage.removeItem('afterLogin');
  location.hash = next || '#/';
}
function loginView(params) {
  if (state.session) return goAfterLogin();
  authPage(`<div class="panel">
    <h1>أهلًا بيك</h1>
    <p class="hint">${params.get('reason') === 'order' ? 'سجّل دخولك أو اعمل حساب جديد علشان تكمل طلبك.' : 'سجّل دخولك علشان تتابع طلباتك.'}</p>
    <form id="f" novalidate>
      <div class="field"><label for="u">اسم المستخدم</label><input id="u" class="ltr" autocomplete="username" autocapitalize="none" required></div>
      <div class="field"><label for="pw">كلمة المرور</label><input id="pw" type="password" class="ltr" autocomplete="current-password" required></div>
      <div class="row-between" style="margin-bottom:18px"><span></span><a class="link" href="#/forgot" style="font-size:14px">نسيت كلمة المرور؟</a></div>
      <button class="btn btn-blue btn-block" type="submit">دخول</button>
    </form>
    <p class="alt">مالكش حساب؟ <a class="link" href="#/signup">اعمل حساب جديد</a></p>
  </div>`);
  qs('#f').addEventListener('submit', async (e) => {
    e.preventDefault();
    const u = qs('#u').value.trim().toLowerCase(), pw = qs('#pw').value;
    if (!u || !pw) return toast('اكتب اسم المستخدم وكلمة المرور', true);
    const b = e.submitter; b.disabled = true;
    const { error } = await sb.auth.signInWithPassword({ email: `${u}@${EMAIL_DOMAIN}`, password: pw });
    b.disabled = false;
    if (error) return toast(error.message?.includes('Invalid') ? 'اسم المستخدم أو كلمة المرور غلط' : 'حصلت مشكلة، جرّب تاني', true);
    goAfterLogin();
  });
}
function signupView() {
  if (state.session) return goAfterLogin();
  authPage(`<div class="panel" id="sp">
    <h1>حساب جديد</h1>
    <p class="hint">بياناتك بتفضل خاصة بيك، ورقم الواتساب بنأكده برسالة واحدة.</p>
    <form id="f" novalidate>
      <div class="field"><label for="n">الاسم بالكامل</label><input id="n" autocomplete="name" required><span class="err" data-for="n"></span></div>
      <div class="field"><label for="u">اسم المستخدم</label><input id="u" class="ltr" autocomplete="username" autocapitalize="none" required><span class="note">حروف إنجليزي صغيرة وأرقام و _ (من 3 لـ 20)</span><span class="err" data-for="u"></span></div>
      <div class="field"><label for="w">رقم الواتساب</label><input id="w" class="ltr" inputmode="tel" autocomplete="tel" placeholder="01xxxxxxxxx" required><span class="err" data-for="w"></span></div>
      <div class="field"><label for="pw">كلمة المرور</label><input id="pw" type="password" class="ltr" autocomplete="new-password" required><span class="err" data-for="pw"></span></div>
      <div class="field"><label for="pw2">تأكيد كلمة المرور</label><input id="pw2" type="password" class="ltr" autocomplete="new-password" required><span class="err" data-for="pw2"></span></div>
      <label class="check" style="margin-bottom:18px"><input type="checkbox" id="agree"> موافق على <a class="link" href="privacy.html" target="_blank" rel="noopener">سياسة الخصوصية</a></label>
      <button class="btn btn-blue btn-block" type="submit">تأكيد الرقم وإنشاء الحساب</button>
    </form>
    <p class="alt">عندك حساب؟ <a class="link" href="#/login">سجّل دخول</a></p>
  </div>`);
  qs('#f').addEventListener('submit', async (e) => {
    e.preventDefault();
    const v = { n: qs('#n').value.trim(), u: qs('#u').value.trim().toLowerCase(), w: qs('#w').value, pw: qs('#pw').value, pw2: qs('#pw2').value };
    const errs = {};
    if (v.n.length < 3) errs.n = 'اكتب اسمك بالكامل';
    if (!/^[a-z0-9_]{3,20}$/.test(v.u)) errs.u = 'من 3 لـ 20 حرف: حروف إنجليزي صغيرة وأرقام و _ فقط';
    if (!validPhone(v.w)) errs.w = 'رقم مصري صحيح من 11 رقم يبدأ بـ 010 أو 011 أو 012 أو 015';
    if (v.pw.length < 8) errs.pw = 'كلمة المرور 8 أحرف على الأقل';
    if (v.pw2 !== v.pw) errs.pw2 = 'كلمتين المرور مش متطابقين';
    document.querySelectorAll('.err').forEach((el) => (el.textContent = errs[el.dataset.for] || ''));
    if (Object.keys(errs).length) return;
    if (!qs('#agree').checked) return toast('لازم توافق على سياسة الخصوصية', true);
    const b = e.submitter; b.disabled = true;
    const { data, error } = await sb.functions.invoke('phone-verify', { body: { action: 'start', whatsapp: e164(v.w), username: v.u, full_name: v.n } });
    b.disabled = false;
    if (error || !data?.ok) {
      const code = await fnError(error, data);
      return toast({ whatsapp_taken: 'رقم الواتساب ده مسجّل بحساب تاني', username_taken: 'اسم المستخدم ده مستخدم قبل كده', too_many: 'طلبت أكواد كتير، استنى ساعة وجرّب تاني', invalid_input: 'راجع رقم الواتساب' }[code] || 'حصلت مشكلة، جرّب تاني', true);
    }
    verifyStep(v, data);
  });
}
function verifyStep(v, ver) {
  const panel = qs('#sp');
  const msg = `مرحبًا NEXO 👋 أنا ${v.n}، برجاء تأكيد رقمي في التطبيق\nكود: ${ver.code}`;
  const waUrl = `https://wa.me/${ver.wa_number}?text=${encodeURIComponent(msg)}`;
  const local = ver.wa_number.startsWith('20') ? '0' + ver.wa_number.slice(2) : '+' + ver.wa_number;
  panel.innerHTML = `
    <h1>تأكيد رقم الواتساب</h1>
    <p class="hint">ابعت الرسالة من رقمك <b class="ltr" style="display:inline-block">${esc(normPhone(v.w))}</b> على واتساب، وهنأكد حسابك تلقائيًا.</p>
    <div class="code-box"><div style="font-size:13px;color:var(--muted)">كود التأكيد</div><div class="code">${esc(ver.code)}</div><div class="to">هيتبعت لرقم NEXO: <span class="ltr" style="display:inline-block">${esc(local)}</span></div></div>
    <a class="btn btn-blue btn-block" href="${waUrl}" target="_blank" rel="noopener">افتح واتساب وابعت الكود</a>
    <div class="wait" id="wt"><span class="spin"></span>مستنيين رسالتك… هيتأكد تلقائيًا</div>
    <p class="alt" style="font-size:13px">لازم الرسالة تتبعت من نفس الرقم اللي سجّلت بيه. الكود صالح 15 دقيقة.</p>`;
  let done = false;
  const check = async () => {
    if (done) return;
    const { data } = await sb.functions.invoke('phone-verify', { body: { action: 'status', id: ver.id } });
    if (data?.verified) {
      done = true;
      qs('#wt').innerHTML = '<span class="spin"></span>تم التأكيد، بنعمل حسابك…';
      const r = await sb.functions.invoke('signup', { body: { full_name: v.n, username: v.u, whatsapp: e164(v.w), password: v.pw, verification_id: ver.id } });
      if (r.error || !r.data?.ok) {
        const code = await fnError(r.error, r.data);
        done = false;
        return toast({ username_taken: 'اسم المستخدم ده مستخدم قبل كده', whatsapp_taken: 'رقم الواتساب ده مسجّل بحساب تاني', not_verified: 'التأكيد انتهى، ابدأ من جديد' }[code] || 'حصلت مشكلة في إنشاء الحساب', true);
      }
      await sb.auth.signInWithPassword({ email: `${v.u}@${EMAIL_DOMAIN}`, password: v.pw });
      toast('أهلًا بيك في NEXO 👋');
      goAfterLogin();
    } else if (data?.expired) {
      done = true;
      qs('#wt').innerHTML = 'الكود انتهت صلاحيته. <a class="link" href="#/signup" onclick="location.reload()">ابدأ من جديد</a>';
    }
  };
  const t = setInterval(check, 3000);
  const vis = () => document.visibilityState === 'visible' && check();
  document.addEventListener('visibilitychange', vis);
  state.cleanup.push(() => { clearInterval(t); document.removeEventListener('visibilitychange', vis); });
}
function forgotView() {
  authPage(`<div class="panel">
    <h1>نسيت كلمة المرور؟</h1>
    <p class="hint">اكتب اسم المستخدم ورقم الواتساب، وفريق NEXO هيتواصل معاك على واتساب بكلمة مرور مؤقتة.</p>
    <form id="f" novalidate>
      <div class="field"><label for="u">اسم المستخدم</label><input id="u" class="ltr" autocapitalize="none" required></div>
      <div class="field"><label for="w">رقم الواتساب</label><input id="w" class="ltr" inputmode="tel" placeholder="01xxxxxxxxx" required></div>
      <button class="btn btn-blue btn-block" type="submit">ابعت الطلب</button>
    </form>
    <p class="alt"><a class="link" href="#/login">رجوع لتسجيل الدخول</a></p>
  </div>`);
  qs('#f').addEventListener('submit', async (e) => {
    e.preventDefault();
    const u = qs('#u').value.trim().toLowerCase(), w = qs('#w').value;
    if (!u || !validPhone(w)) return toast('اكتب اسم المستخدم ورقم واتساب صحيح', true);
    e.submitter.disabled = true;
    const { error } = await sb.rpc('request_password_reset', { p_username: u, p_whatsapp: e164(w) });
    if (error) { e.submitter.disabled = false; return toast('حصلت مشكلة، جرّب تاني', true); }
    qs('.panel').innerHTML = '<h1>تم استلام طلبك</h1><p class="hint">لو البيانات صحيحة، فريق NEXO هيبعتلك كلمة مرور مؤقتة على واتساب في أقرب وقت.</p><a class="btn btn-blue btn-block" href="#/login">رجوع لتسجيل الدخول</a>';
  });
}

// ---------------- الطلب ----------------
const ERR = {
  missing_field: 'كمّل البيانات المطلوبة', invalid_email: 'الإيميل مكتوب غلط',
  too_many_open_orders: 'عندك طلبات كتير مستنية الدفع. ادفع أو الغي واحد منهم الأول.',
  plan_unavailable: 'الخطة دي مش متاحة دلوقتي', order_expired: 'مهلة الدفع خلصت. اعمل طلب جديد.',
  order_not_payable: 'الطلب ده مش مستني دفع', duplicate_reference: 'رقم العملية ده اتسجّل قبل كده. راجعه تاني.',
  invalid_reference: 'اكتب رقم العملية صح', invalid_sender: 'اكتب الرقم اللي حوّلت منه (11 رقم)',
  order_not_cancellable: 'الطلب ده ما ينفعش يتلغي دلوقتي',
};
const friendly = (e) => { const m = e?.message || ''; const k = Object.keys(ERR).find((x) => m.includes(x)); return k ? ERR[k] : 'حصلت مشكلة. اتأكد من النت وجرّب تاني.'; };
function needLogin(next) { sessionStorage.setItem('afterLogin', next); location.hash = '#/login?reason=order'; }

async function checkoutView(planId) {
  if (!state.session) return needLogin(`#/checkout/${planId}`);
  loadingView();
  const products = await loadProducts().catch(() => []);
  const p = products.find((x) => x.plans.some((y) => y.id === planId));
  const plan = p?.plans.find((y) => y.id === planId);
  if (!plan) return shell('<div class="wrap"><p class="empty">الخطة دي مش متاحة. <a class="link" href="#/">ارجع للاشتراكات</a></p></div>');
  const fields = plan.required_fields || [];
  shell(`<div class="page"><div class="wrap mid"><div class="panel">
    <div class="ohead" style="margin-bottom:24px">${logo(p)}<div class="m"><h1>${esc(p.name)}</h1><span class="no" style="font-family:var(--ar)">${esc(plan.duration_label || plan.name)}</span></div><b style="font-size:22px">${egp(plan.price_egp)}</b></div>
    <form id="f" novalidate>
      ${fields.length ? '<h2 style="font-size:18px;margin:0 0 12px">بيانات التفعيل</h2>' : ''}
      ${fields.map((f) => `<div class="field"><label for="f_${esc(f.key)}">${esc(f.label)}</label><input id="f_${esc(f.key)}" data-key="${esc(f.key)}" ${f.type === 'email' ? 'type="email" class="ltr" autocomplete="email"' : ''} required></div>`).join('')}
      <p class="note" style="color:var(--muted);font-size:14px;margin:4px 0 20px">بعد ما تأكد الطلب هتظهرلك بيانات التحويل، وعندك مهلة تحوّل فيها المبلغ.</p>
      <button class="btn btn-blue btn-block" type="submit">تأكيد الطلب</button>
    </form>
  </div></div></div>`, { withFooter: false });
  qs('#f').addEventListener('submit', async (e) => {
    e.preventDefault();
    const inputs = {};
    for (const el of document.querySelectorAll('[data-key]')) {
      const val = el.value.trim();
      if (!val) return toast('كمّل البيانات المطلوبة', true);
      if (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return toast('الإيميل مكتوب غلط', true);
      inputs[el.dataset.key] = val;
    }
    e.submitter.disabled = true;
    const { data, error } = await sb.rpc('create_order', { p_plan_id: planId, p_inputs: inputs });
    if (error) { e.submitter.disabled = false; return toast(friendly(error), true); }
    location.hash = `#/order/${data.id}`;
  });
}

const ORDER_COLS = 'id, order_no, product_name, plan_label, price_egp, status, payment_method, customer_inputs, expires_at, created_at, payments(reject_reason, created_at)';
const effective = (o) => (o.status === 'pending_payment' && new Date(o.expires_at) < new Date()) ? 'expired' : o.status;
const canPay = (o) => ['pending_payment', 'payment_rejected'].includes(effective(o));
const statusChip = (s) => `<span class="status ${STATUS[s]?.[1] || ''}">${esc(STATUS[s]?.[0] || s)}</span>`;
const productOf = (o) => (state.products || []).find((p) => o.product_name?.startsWith(p.name)) || { name: o.product_name, slug: '', brand_color: '#2F55F0' };

async function ordersView() {
  if (!state.session) return needLogin('#/orders');
  loadingView();
  await loadProducts().catch(() => {});
  const { data, error } = await sb.from('orders').select(ORDER_COLS).eq('customer_id', state.session.user.id).order('created_at', { ascending: false }).limit(50);
  shell(`<div class="page"><div class="wrap mid">
    <h1 style="margin:0 0 20px;font-size:32px">طلباتي</h1>
    ${error ? '<p class="empty">مقدرناش نحمّل طلباتك. جرّب تاني.</p>'
      : !data.length ? '<div class="panel empty">لسه مالكش طلبات. <a class="link" href="#/">اختار اشتراكك</a></div>'
      : `<div class="olist">${data.map((o) => `<a class="orow" href="#/order/${o.id}">${logo(productOf(o))}<span class="m"><b>${esc(o.product_name)} · ${esc(o.plan_label)}</b><span class="en">${esc(o.order_no)}</span> · <span>${egp(o.price_egp)}</span></span>${statusChip(effective(o))}</a>`).join('')}</div>`}
  </div></div>`, { withFooter: false });
}

function timeline(s) {
  const steps = [['تم استلام الطلب', ['pending_payment']], ['مراجعة الدفع', ['payment_review', 'payment_rejected']], ['جاري التفعيل', ['paid', 'activating', 'awaiting_customer']], ['تم التفعيل', ['activated']]];
  const idx = steps.findIndex(([, ss]) => ss.includes(s));
  if (idx < 0) return '';
  return `<ol class="timeline">${steps.map(([t], i) => `<li class="${i < idx || s === 'activated' ? 'done' : i === idx ? 'now' : ''}"><span class="d">${i < idx || s === 'activated' ? ICON.tick : ''}</span>${t}</li>`).join('')}</ol>`;
}

async function orderView(id) {
  if (!state.session) return needLogin(`#/order/${id}`);
  loadingView();
  await loadProducts().catch(() => {});
  const { data: o, error } = await sb.from('orders').select(ORDER_COLS).eq('id', id).maybeSingle();
  if (error || !o) return shell('<div class="wrap"><p class="empty">الطلب ده مش موجود. <a class="link" href="#/orders">طلباتي</a></p></div>');
  const s = effective(o);
  const reject = (o.payments || []).sort((a, b) => b.created_at.localeCompare(a.created_at))[0]?.reject_reason;
  shell(`<div class="page"><div class="wrap">
    <a class="link" href="#/orders" style="display:inline-flex;gap:6px;align-items:center;margin-bottom:16px">طلباتي</a>
    <div class="two">
      <div style="display:flex;flex-direction:column;gap:20px">
        <div class="panel">
          <div class="ohead">${logo(productOf(o))}<div class="m"><h1>${esc(o.product_name)} · ${esc(o.plan_label)}</h1><span class="no">${esc(o.order_no)}</span></div>${statusChip(s)}</div>
          <div class="row-between" style="margin-top:18px;padding-top:16px;border-top:1px solid var(--line)"><span style="color:var(--muted)">الإجمالي</span><b style="font-size:24px">${egp(o.price_egp)}</b></div>
          ${timeline(s)}
          ${s === 'payment_rejected' && reject ? `<p style="margin:16px 0 0;padding:12px 14px;border-radius:12px;background:#FDECEC;color:var(--danger)">سبب رفض الدفع: ${esc(reject)}</p>` : ''}
        </div>
        ${canPay(o) ? '<div class="panel" id="pay"><div class="loading" style="padding:20px 0"><span class="spin"></span></div></div>' : ''}
        ${s === 'pending_payment' ? '<button class="btn btn-ghost" id="cancel" style="align-self:flex-start">إلغاء الطلب</button>' : ''}
      </div>
      <div><h2 style="margin:0 0 12px;font-size:20px">شات الطلب</h2><div class="chat" id="chat"></div></div>
    </div>
  </div></div>`, { withFooter: false });
  if (canPay(o)) paymentPanel(o);
  qs('#cancel')?.addEventListener('click', async () => {
    if (!confirm('متأكد إنك عاوز تلغي الطلب؟')) return;
    const { error: e } = await sb.rpc('cancel_order', { p_order_id: o.id });
    if (e) return toast(friendly(e), true);
    toast('تم إلغاء الطلب'); orderView(o.id);
  });
  chatPanel(o);
}

async function paymentPanel(o) {
  const box = qs('#pay');
  const { data } = await sb.from('app_settings').select('value').eq('key', 'payment_methods').maybeSingle();
  const methods = (data?.value || []).filter((m) => m.enabled !== false);
  const mins = Math.max(0, Math.round((new Date(o.expires_at) - new Date()) / 60000));
  box.innerHTML = `
    <h2 style="margin:0 0 4px;font-size:20px">ادفع ${egp(o.price_egp)}</h2>
    <p style="margin:0;color:var(--muted);font-size:14px">${o.status === 'payment_rejected' ? 'راجع بيانات التحويل وابعتها تاني.' : `حوّل المبلغ على واحد من دول، واكتب رقم العملية.${mins ? ` المهلة المتبقية: ${mins >= 60 ? Math.floor(mins / 60) + ' ساعة ' : ''}${mins % 60} دقيقة.` : ''}`}</p>
    <form id="pf" novalidate>
      <div class="pay-m" role="radiogroup" aria-label="طريقة الدفع">${methods.map((m, i) => `
        <label class="pm"><input type="radio" name="m" value="${esc(m.key)}" ${i === 0 ? 'checked' : ''}>
          <b>${esc(m.label)}</b><span class="acc">${esc(m.account)}</span><span class="hold">${esc(m.holder || '')}</span>
          <button type="button" class="copy" data-copy="${esc(m.account)}">نسخ الرقم</button></label>`).join('')}</div>
      <div class="field"><label for="ref">رقم العملية</label><input id="ref" class="ltr" required><span class="note">بيظهر في رسالة التأكيد بعد التحويل</span></div>
      <div class="field"><label for="snd">الرقم اللي حوّلت منه</label><input id="snd" class="ltr" inputmode="tel" placeholder="01xxxxxxxxx" required></div>
      <div class="field"><label for="rc">صورة الإيصال (اختياري)</label><input id="rc" type="file" accept="image/png,image/jpeg" style="padding:12px 16px"></div>
      <button class="btn btn-blue btn-block" type="submit">ابعت بيانات التحويل</button>
    </form>`;
  box.querySelectorAll('[data-copy]').forEach((b) => b.addEventListener('click', async (e) => {
    e.preventDefault();
    try { await navigator.clipboard.writeText(b.dataset.copy); toast('اتنسخ الرقم'); } catch { toast(b.dataset.copy); }
  }));
  qs('#pf').addEventListener('submit', async (e) => {
    e.preventDefault();
    const method = box.querySelector('input[name=m]:checked')?.value;
    const ref = qs('#ref').value.trim(), snd = normPhone(qs('#snd').value);
    if (!method || ref.length < 4) return toast('اكتب رقم العملية صح', true);
    if (!/^01[0125][0-9]{8}$/.test(snd)) return toast('اكتب الرقم اللي حوّلت منه (11 رقم)', true);
    const file = qs('#rc').files[0];
    if (file && file.size > 5 * 1024 * 1024) return toast('الصورة أكبر من 5 ميجا', true);
    e.submitter.disabled = true;
    let path = null;
    if (file) {
      const ext = file.type === 'image/png' ? 'png' : 'jpg';
      path = `${state.session.user.id}/${o.order_no}-${Date.now()}.${ext}`;
      const up = await sb.storage.from('receipts').upload(path, file, { contentType: file.type });
      if (up.error) { e.submitter.disabled = false; return toast('الصورة ما اترفعتش، جرّب تاني', true); }
    }
    const { error } = await sb.rpc('submit_payment', { p_order_id: o.id, p_method: method, p_reference: ref, p_sender: snd, p_receipt_path: path });
    if (error) { e.submitter.disabled = false; return toast(friendly(error), true); }
    toast('تم استلام بيانات التحويل، والفريق بيراجعها');
    orderView(o.id);
  });
}

// ---------------- الشات ----------------
const urlCache = new Map();
async function signed(path) {
  const c = urlCache.get(path);
  if (c && c.until > Date.now()) return c.url;
  const { data } = await sb.storage.from('chat').createSignedUrl(path, 6 * 3600);
  if (data?.signedUrl) urlCache.set(path, { url: data.signedUrl, until: Date.now() + 5 * 3600e3 });
  return data?.signedUrl;
}
function chatPanel(o) {
  const box = qs('#chat');
  const me = state.session.user.id;
  const byId = new Map();
  box.innerHTML = `<div class="msgs" id="msgs" aria-live="polite"><div class="loading" style="padding:40px 0"><span class="spin"></span></div></div>
    <form id="cf"><label class="attach" title="إرسال صورة"><input type="file" accept="image/png,image/jpeg" hidden id="cimg">${ICON.image}<span class="sr">إرسال صورة</span></label>
    <textarea id="ct" rows="1" placeholder="اكتب رسالتك…" aria-label="رسالتك" maxlength="2000"></textarea>
    <button class="send" type="submit" aria-label="إرسال">${ICON.send}</button></form>`;
  const list = qs('#msgs');
  const render = () => {
    const atBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 80;
    const msgs = [...byId.values()].sort((a, b) => a.id - b.id);
    list.innerHTML = '';
    if (!msgs.length) list.innerHTML = '<p class="empty" style="padding:24px">اكتب رسالتك هنا وفريق NEXO هيرد في أقرب وقت.</p>';
    let lastDay = '';
    for (const m of msgs) {
      const d = new Date(m.created_at);
      const day = d.toDateString();
      if (day !== lastDay) { const el = document.createElement('div'); el.className = 'day'; el.textContent = fmtDay(d); list.appendChild(el); lastDay = day; }
      if (m.kind === 'system') { const el = document.createElement('div'); el.className = 'sys'; el.textContent = `${m.body} · ${fmtTime(d)}`; list.appendChild(el); continue; }
      const mine = m.sender_id === me;
      const el = document.createElement('div');
      el.className = `bub ${mine ? 'me' : 'them'}${m._pending ? ' pending' : ''}`;
      if (!mine) { const w = document.createElement('span'); w.className = 'who'; w.textContent = m.sender_role === 'customer' ? (m.sender_name || 'العميل') : 'فريق NEXO'; el.appendChild(w); }
      if (m.kind === 'image' && (m.attachment_path || m._url)) {
        const img = document.createElement('img'); img.alt = 'صورة'; img.loading = 'lazy';
        if (m._url) img.src = m._url; else signed(m.attachment_path).then((u) => u && (img.src = u));
        img.addEventListener('click', () => { const lb = document.createElement('div'); lb.className = 'lightbox'; lb.innerHTML = `<img src="${img.src}" alt="">`; lb.onclick = () => lb.remove(); document.body.appendChild(lb); });
        el.appendChild(img);
      } else el.appendChild(document.createTextNode(m.body || ''));
      const t = document.createElement('span'); t.className = 'tm'; t.textContent = m._pending ? 'بيتبعت…' : fmtTime(d); el.appendChild(t);
      list.appendChild(el);
    }
    if (atBottom || msgs.length < 3) list.scrollTop = list.scrollHeight;
  };
  const add = (rows) => { let n = false; for (const r of rows) if (!byId.has(r.id)) { byId.set(r.id, r); n = true; } if (n) { render(); sb.rpc('mark_chat_read', { p_order_id: o.id }).then(() => {}, () => {}); } };
  const maxId = () => Math.max(0, ...[...byId.keys()].filter((k) => k > 0));
  const fetchNew = async () => {
    let q = sb.from('messages').select('*').eq('order_id', o.id);
    if (maxId()) q = q.gt('id', maxId());
    const { data } = await q.order('id').limit(1000);
    if (data) { if (!byId.size && !data.length) render(); add(data); }
  };
  fetchNew().then(() => (list.scrollTop = list.scrollHeight));
  const ch = sb.channel(`chat-${o.id}-${Date.now()}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `order_id=eq.${o.id}` }, (p) => add([p.new]))
    .subscribe((st) => st === 'SUBSCRIBED' && fetchNew());
  const poll = setInterval(fetchNew, 10000);
  const vis = () => document.visibilityState === 'visible' && fetchNew();
  document.addEventListener('visibilitychange', vis);
  state.cleanup.push(() => { clearInterval(poll); sb.removeChannel(ch); document.removeEventListener('visibilitychange', vis); });

  const ta = qs('#ct');
  ta.addEventListener('input', () => { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 140) + 'px'; });
  ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey && window.matchMedia('(pointer:fine)').matches) { e.preventDefault(); qs('#cf').requestSubmit(); } });
  let seq = 0;
  const sendRow = async (row, tmp) => {
    byId.set(tmp.id, tmp); render(); list.scrollTop = list.scrollHeight;
    const { data, error } = await sb.from('messages').insert(row).select().single();
    byId.delete(tmp.id);
    if (error) { render(); return toast('الرسالة ما اتبعتتش، جرّب تاني', true); }
    add([data]);
  };
  qs('#cf').addEventListener('submit', (e) => {
    e.preventDefault();
    const body = ta.value.trim();
    if (!body) return;
    ta.value = ''; ta.style.height = 'auto';
    sendRow({ order_id: o.id, sender_id: me, kind: 'text', body }, { id: -(++seq), sender_id: me, kind: 'text', body, created_at: new Date().toISOString(), _pending: true });
  });
  qs('#cimg').addEventListener('change', async (e) => {
    const f = e.target.files[0]; e.target.value = '';
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) return toast('الصورة أكبر من 5 ميجا', true);
    const ext = f.type === 'image/png' ? 'png' : 'jpg';
    const path = `${o.id}/${me}-${Date.now()}.${ext}`;
    const tmp = { id: -(++seq), sender_id: me, kind: 'image', _url: URL.createObjectURL(f), created_at: new Date().toISOString(), _pending: true };
    byId.set(tmp.id, tmp); render(); list.scrollTop = list.scrollHeight;
    const up = await sb.storage.from('chat').upload(path, f, { contentType: f.type });
    if (up.error) { byId.delete(tmp.id); render(); return toast('الصورة ما اتبعتتش', true); }
    byId.delete(tmp.id);
    sendRow({ order_id: o.id, sender_id: me, kind: 'image', attachment_path: path }, { ...tmp, id: -(++seq) });
  });
}

// ---------------- الراوتر ----------------
function route() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [path, query = ''] = raw.split('?');
  const parts = path.split('/').filter(Boolean);
  const params = new URLSearchParams(query);
  if (!parts.length) return { name: 'home', params };
  return { name: parts[0], arg: decodeURIComponent(parts[1] || ''), params };
}
async function render() {
  cleanupView();
  document.title = 'NEXO — اشتراكات البرامج بالجنيه المصري';
  const r = route();
  switch (r.name) {
    case 'home': return homeView();
    case 'p': return productView(r.arg);
    case 'login': return loginView(r.params);
    case 'signup': return signupView();
    case 'forgot': return forgotView();
    case 'checkout': return checkoutView(r.arg);
    case 'orders': return ordersView();
    case 'order': return orderView(r.arg);
    default: location.hash = '#/';
  }
}

(async () => {
  const { data } = await sb.auth.getSession();
  state.session = data.session;
  await loadProfile();
  sb.auth.onAuthStateChange(async (event, session) => {
    const changed = (state.session?.user?.id || null) !== (session?.user?.id || null);
    state.session = session;
    if (changed) { await loadProfile(); if (event === 'SIGNED_OUT') render(); }
  });
  window.addEventListener('hashchange', render);
  render();
})();
