// سماء واقعية مرسومة بالكود (procedural): سحاب بضوضاء fractal ومضاء من الشمس، ونجوم بألوانها الحقيقية ودرب التبانة وقمر.
// بيترسم مرة واحدة على canvas بدقة مخفّضة، وبعدين الحركة كلها transform خفيفة.

// ---------- Perlin noise ----------
const P = new Uint8Array(512);
(() => {
  const p = Array.from({ length: 256 }, (_, i) => i);
  let s = 1337;
  for (let i = 255; i > 0; i--) { s = (s * 16807) % 2147483647; const j = s % (i + 1); [p[i], p[j]] = [p[j], p[i]]; }
  for (let i = 0; i < 512; i++) P[i] = p[i & 255];
})();
const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = (a, b, t) => a + (b - a) * t;
function grad(h, x, y) { switch (h & 7) { case 0: return x + y; case 1: return -x + y; case 2: return x - y; case 3: return -x - y; case 4: return x; case 5: return -x; case 6: return y; default: return -y; } }
function noise(x, y) {
  const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
  x -= Math.floor(x); y -= Math.floor(y);
  const u = fade(x), v = fade(y), a = P[X] + Y, b = P[X + 1] + Y;
  return lerp(lerp(grad(P[a], x, y), grad(P[b], x - 1, y), u), lerp(grad(P[a + 1], x, y - 1), grad(P[b + 1], x - 1, y - 1), u), v);
}
function fbm(x, y, oct = 5) {
  let t = 0, amp = 0.5, f = 1;
  for (let i = 0; i < oct; i++) { t += amp * noise(x * f, y * f); f *= 2.03; amp *= 0.5; }
  return t; // تقريبًا من -0.7 لـ 0.7
}
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
let rs = 42; const rnd = () => ((rs = (rs * 16807) % 2147483647) / 2147483647);

// ---------- النهار ----------
function drawDay(cv, W, H, sun) {
  const c = cv.getContext('2d');
  // سماء: أزرق أعمق فوق وفاتح عند الأفق (Rayleigh)
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#3F8FE6'); g.addColorStop(0.45, '#7DB9F5'); g.addColorStop(0.8, '#C3E1FC'); g.addColorStop(1, '#E6F3FF');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  // هالة الشمس في الجو (Mie scattering)
  const r = Math.max(W, H);
  let h = c.createRadialGradient(sun.x, sun.y, 0, sun.x, sun.y, r * 0.75);
  h.addColorStop(0, 'rgba(255,252,235,0.95)'); h.addColorStop(0.04, 'rgba(255,246,214,0.75)'); h.addColorStop(0.15, 'rgba(255,240,205,0.32)');
  h.addColorStop(0.4, 'rgba(230,240,255,0.10)'); h.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = h; c.fillRect(0, 0, W, H);
}
function drawClouds(cv, W, H, sun, opts) {
  const c = cv.getContext('2d');
  const img = c.createImageData(W, H), d = img.data;
  const sc = opts.scale, cov = opts.cover, ox = opts.seed * 13.7, oy = opts.seed * 7.1;
  // اتجاه الضوء (ناحية الشمس) لحساب الظل جوه السحابة
  const lx = (sun.x / W - 0.5), ly = (sun.y / H - 0.5), ll = Math.hypot(lx, ly) || 1;
  const sx = (lx / ll) * 0.035, sy = (ly / ll) * 0.035;
  for (let y = 0; y < H; y++) {
    const fy = y / H;
    for (let x = 0; x < W; x++) {
      const fx = x / W;
      // كثافة أقل في نص الجزء اللي فوق (مكان العنوان) وأكتر على الأطراف وتحت
      const clear = Math.exp(-(((fx - 0.5) / 0.32) ** 2) - (((fy - 0.32) / 0.26) ** 2)) * opts.clearCenter;
      const nx = fx * sc * (W / H) + ox, ny = fy * sc + oy;
      let n = fbm(nx, ny, 6) + 0.5; // 0..1
      n = n - cov - clear + fy * opts.lowBias;
      const dens = smooth(0, 0.28, n);
      const i = (y * W + x) * 4;
      if (dens <= 0.002) { d[i + 3] = 0; continue; }
      // ظل: لو الكثافة ناحية الشمس أقل يبقى الجزء ده منوّر
      const n2 = fbm(nx + sx * sc * 10, ny + sy * sc * 10, 4) + 0.5 - cov - clear + fy * opts.lowBias;
      const lit = clamp(0.62 + (n - n2) * 3.2);
      const base = 0.80 + 0.2 * lit;                      // أبيض منوّر
      const shadow = 1 - clamp(dens * 0.55 - lit * 0.25) * 0.45; // قلب السحابة أغمق شوية
      const v = base * shadow;
      // ظلال السحاب بتميل للأزرق الرمادي، والأطراف المنوّرة دافية
      d[i] = 255 * clamp(v * (0.955 + 0.05 * lit));
      d[i + 1] = 255 * clamp(v * (0.965 + 0.035 * lit));
      d[i + 2] = 255 * clamp(v * 1.0 + 0.02);
      d[i + 3] = 255 * clamp(Math.pow(dens, 0.85) * opts.alpha);
    }
  }
  c.putImageData(img, 0, 0);
}
function drawSun(cv, S) {
  const c = cv.getContext('2d'), m = S / 2;
  let g = c.createRadialGradient(m, m, 0, m, m, m);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.07, 'rgba(255,255,250,1)'); g.addColorStop(0.11, 'rgba(255,248,220,0.9)');
  g.addColorStop(0.22, 'rgba(255,236,180,0.45)'); g.addColorStop(0.5, 'rgba(255,230,170,0.12)'); g.addColorStop(1, 'rgba(255,230,170,0)');
  c.fillStyle = g; c.fillRect(0, 0, S, S);
  // خطوط ضوء خفيفة (starburst) زي اللي بتظهر في الكاميرا
  c.save(); c.translate(m, m); c.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 12; k++) {
    c.rotate(Math.PI / 6 + (k % 2 ? 0.05 : -0.03));
    const len = m * (k % 3 === 0 ? 0.95 : 0.6);
    const lg = c.createLinearGradient(0, 0, len, 0);
    lg.addColorStop(0, 'rgba(255,250,230,0.35)'); lg.addColorStop(1, 'rgba(255,250,230,0)');
    c.fillStyle = lg; c.beginPath(); c.moveTo(0, -S * 0.006); c.lineTo(len, 0); c.lineTo(0, S * 0.006); c.fill();
  }
  c.restore();
}

// ---------- الليل ----------
const STAR_COLORS = ['#9BB0FF', '#AABFFF', '#CAD7FF', '#F8F7FF', '#FFF4EA', '#FFE5C4', '#FFD2A1'];
function drawNight(cv, W, H, dpr) {
  const c = cv.getContext('2d');
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#03050D'); g.addColorStop(0.55, '#070C1F'); g.addColorStop(1, '#101A3C');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  // درب التبانة: شريط مايل فيه ضوضاء وتراب غامق
  const img = c.getImageData(0, 0, W, H), d = img.data;
  const a = -0.5, ca = Math.cos(a), sa = Math.sin(a);
  for (let y = 0; y < H; y += 1) for (let x = 0; x < W; x += 1) {
    const u = (x - W * 0.55) * ca - (y - H * 0.45) * sa, v = (x - W * 0.55) * sa + (y - H * 0.45) * ca;
    const band = Math.exp(-((v / (Math.min(W, H) * 0.2)) ** 2));
    if (band < 0.02) continue;
    const n = fbm(u / (W * 0.18) + 5, v / (H * 0.12) + 9, 5) + 0.5;
    const dust = smooth(0.48, 0.7, fbm(u / (W * 0.1) + 20, v / (H * 0.05), 4) + 0.5);
    const glow = band * clamp(n * 1.25 - 0.2) * (1 - dust * 0.8) * 0.24;
    const i = (y * W + x) * 4;
    d[i] += 170 * glow; d[i + 1] += 175 * glow; d[i + 2] += 215 * glow;
  }
  c.putImageData(img, 0, 0);
  // النجوم: توزيع power-law (كتير صغيرين وقليل لامعين) وأكتر جوه الشريط
  const count = Math.round((W * H) / (1400 * dpr * dpr)) + 250;
  for (let k = 0; k < count; k++) {
    let x = rnd() * W, y = rnd() * H;
    if (rnd() < 0.45) { // قرّب جزء من النجوم من درب التبانة
      const t = (rnd() - 0.5) * W * 1.6, off = (rnd() + rnd() + rnd() - 1.5) * H * 0.12;
      x = W * 0.55 + t * ca + off * sa; y = H * 0.45 - t * sa + off * ca;
      if (x < 0 || x > W || y < 0 || y > H) continue;
    }
    const m = Math.pow(rnd(), 7);
    const r = (0.3 + m * 1.3) * dpr;
    c.globalAlpha = clamp(0.18 + m * 0.8 + rnd() * 0.25);
    c.fillStyle = STAR_COLORS[(rnd() * STAR_COLORS.length) | 0];
    c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill();
    if (m > 0.75) { // هالة للنجوم اللامعة بس
      const gg = c.createRadialGradient(x, y, 0, x, y, r * 7);
      gg.addColorStop(0, 'rgba(220,230,255,0.35)'); gg.addColorStop(1, 'rgba(220,230,255,0)');
      c.globalAlpha = 1; c.fillStyle = gg; c.fillRect(x - r * 7, y - r * 7, r * 14, r * 14);
    }
  }
  c.globalAlpha = 1;
  // توهج خفيف عند الأفق (ضوء المدينة)
  const hz = c.createLinearGradient(0, H * 0.7, 0, H);
  hz.addColorStop(0, 'rgba(60,80,160,0)'); hz.addColorStop(1, 'rgba(70,90,170,0.22)');
  c.fillStyle = hz; c.fillRect(0, H * 0.7, W, H * 0.3);
}
function drawMoon(cv, S) {
  const c = cv.getContext('2d'), R = S / 2;
  const img = c.createImageData(S, S), d = img.data;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const dx = (x - R + 0.5) / R, dy = (y - R + 0.5) / R, r2 = dx * dx + dy * dy;
    const i = (y * S + x) * 4;
    if (r2 > 1) { d[i + 3] = 0; continue; }
    const z = Math.sqrt(1 - r2);
    // البحار القمرية (المناطق الغامقة) + تفاصيل سطح
    const maria = smooth(0.52, 0.66, fbm(dx * 1.6 + 3.1, dy * 1.6 + 1.7, 4) + 0.5);
    const detail = fbm(dx * 9 + 11, dy * 9 + 4, 4) * 0.12;
    let v = 0.86 - maria * 0.3 + detail;
    v *= 0.55 + 0.45 * Math.pow(z, 0.6); // limb darkening
    d[i] = 255 * clamp(v * 1.0); d[i + 1] = 255 * clamp(v * 0.985); d[i + 2] = 255 * clamp(v * 0.95);
    d[i + 3] = 255 * clamp((1 - r2) * 40); // حافة ناعمة
  }
  c.putImageData(img, 0, 0);
  // فوهات
  for (let k = 0; k < 26; k++) {
    const a = rnd() * 6.283, rr = Math.sqrt(rnd()) * R * 0.85, cx = R + Math.cos(a) * rr, cy = R + Math.sin(a) * rr;
    const cr = R * (0.025 + Math.pow(rnd(), 3) * 0.12);
    const g = c.createRadialGradient(cx - cr * 0.25, cy - cr * 0.25, cr * 0.2, cx, cy, cr);
    g.addColorStop(0, 'rgba(80,78,72,0.28)'); g.addColorStop(0.8, 'rgba(80,78,72,0.12)'); g.addColorStop(1, 'rgba(255,255,250,0.18)');
    c.fillStyle = g; c.beginPath(); c.arc(cx, cy, cr, 0, 6.283); c.fill();
  }
}

// ---------- التركيب ----------
const idle = (f) => (window.requestIdleCallback ? requestIdleCallback(f, { timeout: 600 }) : setTimeout(f, 30));
export function mountSky(root) {
  if (!root) return () => {};
  const isDark = () => document.documentElement.dataset.theme === 'dark';
  const done = { day: 0, night: 0 };
  const night = root.querySelector('.night'), day = root.querySelector('.day');
  const render = (which) => {
    const W0 = root.clientWidth, H0 = root.clientHeight;
    if (!W0 || !H0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (which === 'night') {
      const q = W0 > 900 ? 0.75 : 1; // دقة النجوم لازم تبقى عالية
      const W = Math.round(W0 * dpr * q), H = Math.round(H0 * dpr * q);
      const cv = night.querySelector('canvas.bg'); cv.width = W; cv.height = H;
      rs = 42; drawNight(cv, W, H, dpr * q);
      const mc = night.querySelector('canvas.moon-cv'); const S = Math.round(mc.clientWidth * dpr) || 160;
      mc.width = S; mc.height = S; rs = 7; drawMoon(mc, S);
      done.night = W0;
    } else {
      const q = W0 > 900 ? 0.32 : 0.45; // السحاب ناعم أصلًا، دقة أقل = أسرع
      const W = Math.round(W0 * q), H = Math.round(H0 * q);
      const sun = { x: W * 0.12, y: H * 0.13 };
      const bg = day.querySelector('canvas.bg'); bg.width = W; bg.height = H; drawDay(bg, W, H, sun);
      const layers = day.querySelectorAll('canvas.cl');
      const cfg = [
        { scale: 2.2, cover: 0.52, alpha: 0.95, lowBias: 0.22, clearCenter: 0.32, seed: 1 },
        { scale: 3.4, cover: 0.6, alpha: 0.75, lowBias: 0.1, clearCenter: 0.4, seed: 4 },
      ];
      layers.forEach((cv, k) => {
        const w = Math.round(W * 1.5); cv.width = w; cv.height = H;
        drawClouds(cv, w, H, { x: sun.x + W * 0.25, y: sun.y }, cfg[k]);
      });
      const sc = day.querySelector('canvas.sun-cv'); const S = Math.round(sc.clientWidth * dpr) || 300;
      sc.width = S; sc.height = S; drawSun(sc, S);
      done.day = W0;
    }
    root.classList.add('ready-' + which);
  };
  const ensure = () => {
    const which = isDark() ? 'night' : 'day';
    const w = root.clientWidth;
    if (!done[which] || Math.abs(done[which] - w) / w > 0.2) idle(() => render(which));
  };
  ensure();
  const mo = new MutationObserver(ensure);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  let t; const onR = () => { clearTimeout(t); t = setTimeout(ensure, 300); };
  window.addEventListener('resize', onR);
  return () => { mo.disconnect(); window.removeEventListener('resize', onR); };
}
