// ===== نمودارها و گروه‌های منو =====
var PALETTE = ['#0f766e', '#f59e0b', '#6366f1', '#ef4444', '#10b981', '#ec4899', '#3b82f6', '#a855f7', '#84cc16', '#f97316'];
function pieColor(i) { return i < PALETTE.length ? PALETTE[i] : hsl((i * 47) % 360, 62, 48); }
function nextColor(used) { for (var i = 0; i < PALETTE.length; i++) if (used.indexOf(PALETTE[i]) < 0) return PALETTE[i]; return hsl((used.length * 47) % 360, 62, 48); }
function durFa(ms) { var m = Math.round(ms / 6e4), hh = Math.floor(m / 60); m = m % 60; return hh ? faNum(hh) + ' ساعت' + (m ? ' و ' + faNum(m) + ' دقیقه' : '') : faNum(m) + ' دقیقه'; }
function dec(v) { return toFa(String(Math.round(v * 100) / 100)).replace('.', '٫'); }
function nice(mx, n) { var raw = mx / n || 1, p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p; }
function dailyGoal() { if (goals.__all > 0) return goals.__all; var s = 0; subjects.forEach(function (n) { s += goals[n] || 0; }); return s; }

// ---------- پنجرهٔ انتخاب (گروه‌های منو) ----------
function choice(id, title, items) {
  document.body.insertAdjacentHTML('beforeend', '<dialog id="' + id + '"><h3>' + title + '</h3>' + items.map(function (it, i) {
    return '<button type="button" class="opt" data-i="' + i + '"><b>' + it[0] + '</b><span>' + it[1] + '</span></button>';
  }).join('') + '<div class="actions"><button class="tool" type="button" data-x="1">لغو</button></div></dialog>');
  var d = $(id);
  d.onclick = function (e) {
    if (e.target.closest('[data-x]')) { d.close(); return; }
    var b = e.target.closest('.opt'); if (b) { d.close(); items[+b.getAttribute('data-i')][2](); }
  };
}
choice('bkDlg', 'دانلود و آپلود گزارش', [
  ['دانلود گزارش', 'ذخیرهٔ نسخهٔ پشتیبان همهٔ اطلاعات در یک فایل', function () { $('backupBtn').click(); }],
  ['آپلود گزارش', 'بازگردانی اطلاعات از یک فایل پشتیبان', function () { $('uploadBtn').click(); }]]);
choice('expDlg', 'خروجی pdf و excel', [
  ['خروجی PDF', 'گزارش کامل مطالعه به‌صورت فایل PDF قابل چاپ', exportPdf],
  ['خروجی Excel', 'جدول بازه‌ها و جمع‌ها در فایل xlsx برای ویرایش', exportXlsx]]);
clk('mBk', function () { $('bkDlg').showModal(); });
clk('mExp', function () { $('expDlg').showModal(); });

// ---------- انتخاب بازهٔ تاریخی ----------
function dsel(pre, title) { return '<p class="dlabel">' + title + '</p><div class="row3"><div class="field"><select id="' + pre + 'D" aria-label="روز"></select></div><div class="field"><select id="' + pre + 'M" aria-label="ماه"></select></div><div class="field"><select id="' + pre + 'Y" aria-label="سال"></select></div></div>'; }
function rngDlg(id, title, hint, pa, pb, ok, err, cn) {
  return '<dialog id="' + id + '" class="wide"><h3>' + title + '</h3><p class="hint">' + hint + '</p>' + dsel(pa, 'از تاریخ') + dsel(pb, 'تا تاریخ') +
    '<div class="error" id="' + err + '" role="alert"></div><div class="actions"><button class="tool primary" id="' + ok + '" type="button">ساخت تصویر</button><button class="tool" id="' + cn + '" type="button">لغو</button></div></dialog>';
}
document.body.insertAdjacentHTML('beforeend',
  rngDlg('pieDlg', 'نمودار دایره‌ای مطالعه', 'بازهٔ تاریخی را انتخاب کن تا سهم زمان هر درس به‌صورت نمودار دایره‌ای و تصویر ساخته شود.', 'pf', 'pt', 'pieMake', 'pieErr', 'pieCancel') +
  rngDlg('lnDlg', 'نمودار خطی پیشرفت و تعهد', 'بازهٔ تاریخی (حداکثر ۹۲ روز) را انتخاب کن تا نمودار پیشرفت مطالعه و نمودار تعهد به هدفگذاری در یک تصویر ساخته شود.', 'lf', 'lt', 'lnMake', 'lnErr', 'lnCancel'));
function dsetup(pre, jp) {
  var y = $(pre + 'Y'), m = $(pre + 'M'), d = $(pre + 'D'), t = jParts(Date.now());
  y.innerHTML = ''; m.innerHTML = '';
  for (var i = t.year; i >= t.year - 5; i--) mkOpt(y, i, toFa(i));
  JM.forEach(function (n, i) { mkOpt(m, i + 1, n); });
  y.value = jp.year; m.value = jp.month; fd(jp.day);
  function fd(keep) { var n = jDim(+y.value, +m.value), cur = keep || +d.value || 1; d.innerHTML = ''; for (var k = 1; k <= n; k++) mkOpt(d, k, toFa(k)); d.value = Math.min(cur, n); }
  y.onchange = m.onchange = function () { fd(); };
}
function openRange(dlg, pa, pb, err) { var t = jParts(Date.now()); dsetup(pa, { year: t.year, month: t.month, day: 1 }); dsetup(pb, t); $(err).textContent = ''; $(dlg).showModal(); }
function rangeOf(pa, pb, el) {
  var a = jToMs(+$(pa + 'Y').value, +$(pa + 'M').value, +$(pa + 'D').value), b = jToMs(+$(pb + 'Y').value, +$(pb + 'M').value, +$(pb + 'D').value);
  if (a === null || b === null) { el.textContent = 'تاریخ نامعتبر است.'; return null; }
  if (a > b) { el.textContent = 'تاریخ شروع باید قبل از تاریخ پایان باشد.'; return null; }
  var ga = new Date(a), gb = new Date(b);
  return { fa: a, fb: b, from: new Date(ga.getFullYear(), ga.getMonth(), ga.getDate()).getTime(), to: new Date(gb.getFullYear(), gb.getMonth(), gb.getDate() + 1).getTime() - 1 };
}
clk('mPie', function () { openRange('pieDlg', 'pf', 'pt', 'pieErr'); });
clk('mLine', function () { openRange('lnDlg', 'lf', 'lt', 'lnErr'); });
$('pieCancel').onclick = function () { $('pieDlg').close(); };
$('lnCancel').onclick = function () { $('lnDlg').close(); };

// ---------- ابزار رسم ----------
function TT(c, t, x, y, px, b, col, al, mw) { c.font = (b ? 'bold ' : '') + px + 'px sans-serif'; c.fillStyle = col; c.textAlign = al; c.fillText(t, x, y, mw || 1e4); }
function newCv(W, H) { var cv = document.createElement('canvas'); cv.width = W; cv.height = H; var c = cv.getContext('2d'); c.direction = 'rtl'; c.textBaseline = 'middle'; c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); return { cv: cv, c: c }; }
function outPng(cv, done) { cv.toBlob(function (bl) { saveFile('study-chart-' + dayKey(Date.now()) + '.png', bl); if (done) done(); }, 'image/png'); }
function grid(c, x0, y0, x1, y1, top, tk, fmt) {
  c.lineWidth = 1.5;
  for (var i = 0; i <= tk; i++) { var y = y1 - (y1 - y0) * i / tk; c.strokeStyle = i ? '#e3e8e7' : '#9aa7a4'; c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke(); TT(c, fmt(top * i / tk), x0 - 12, y, 22, 0, '#5b6b68', 'right'); }
}
function xlabs(c, days, X, y) { var sk = Math.ceil(days.length / 15); days.forEach(function (d, i) { if (i % sk === 0) TT(c, toFa(d.l), X(i), y, 22, 0, '#5b6b68', 'center'); }); }
function dayList(from, to) {
  var a = [], d = new Date(from), m = {};
  sessions.forEach(function (s) { var k = dayKey(s.start); m[k] = (m[k] || 0) + s.end - s.start; });
  while (d.getTime() <= to) { a.push({ t: d.getTime(), v: m[dayKey(d.getTime())] || 0, l: jParts(d.getTime() + 432e5).day }); d.setDate(d.getDate() + 1); }
  return a;
}

// ---------- نمودار دایره‌ای ----------
function makePie(r, names, map, total) {
  var W = 1080, M = 60, legendTop = 790, rowH = 56, descTop = legendTop + 60 + names.length * rowH + 30, H = descTop + 56 + 46 + 90, o = newCv(W, H), c = o.c;
  TT(c, 'سهم زمان مطالعه به تفکیک درس', W / 2, 90, 46, 1, '#16302c', 'center');
  TT(c, 'از ' + dateStr(r.fa) + ' تا ' + dateStr(r.fb), W / 2, 150, 30, 0, '#5b6b68', 'center');
  var cx = W / 2, cy = 470, R = 280, a0 = -Math.PI / 2;
  names.forEach(function (n, i) {
    var sh = map[n] / total, a1 = a0 + sh * 2 * Math.PI;
    c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, R, a0, a1); c.closePath(); c.fillStyle = subColor(n, i); c.fill();
    if (names.length > 1) { c.lineWidth = 4; c.strokeStyle = '#fff'; c.stroke(); }
    if (sh >= 0.06) { var am = (a0 + a1) / 2; TT(c, toFa(Math.round(sh * 100)) + '٪', cx + Math.cos(am) * R * 0.65, cy + Math.sin(am) * R * 0.65, 32, 1, '#fff', 'center'); }
    a0 = a1;
  });
  TT(c, 'راهنمای رنگ‌ها', W - M, legendTop, 34, 1, '#16302c', 'right');
  names.forEach(function (n, i) {
    var y = legendTop + 60 + i * rowH + rowH / 2;
    c.fillStyle = subColor(n, i); c.fillRect(W - M - 30, y - 15, 30, 30);
    TT(c, n, W - M - 46, y, 28, 0, '#16302c', 'right', 520);
    TT(c, toFa(Math.round(map[n] / total * 1000) / 10) + '٪  ·  ' + durFa(map[n]), M, y, 26, 0, '#5b6b68', 'left', 420);
  });
  TT(c, 'هر برش = سهم یک درس از کل زمان مطالعهٔ این بازه (مجموع: ' + durFa(total) + ').', W - M, descTop + 56, 27, 0, '#34423f', 'right', W - 2 * M);
  return o.cv;
}
$('pieMake').onclick = function () {
  var r = rangeOf('pf', 'pt', $('pieErr')); if (!r) return;
  var map = {}, total = 0;
  sessions.forEach(function (s) { if (s.start >= r.from && s.start <= r.to) { var n = subName(s), d = s.end - s.start; map[n] = (map[n] || 0) + d; total += d; } });
  if (!total) { $('pieErr').textContent = 'در این بازه مطالعه‌ای ثبت نشده است.'; return; }
  var names = Object.keys(map).sort(function (x, y) { return map[y] - map[x]; });
  outPng(makePie(r, names, map, total), function () { $('pieDlg').close(); });
};

// ---------- نمودار خطی پیشرفت + نمودار تعهد به هدفگذاری ----------
function makeProgress(r, days, G) {
  var W = 1080, H = 1320, o = newCv(W, H), c = o.c, x0 = 120, x1 = W - 60, n = days.length, R = W - 60;
  TT(c, 'پیشرفت و تعهد مطالعه', W / 2, 80, 46, 1, '#16302c', 'center');
  TT(c, 'از ' + dateStr(r.fa) + ' تا ' + dateStr(r.fb), W / 2, 135, 30, 0, '#5b6b68', 'center');
  // نمودار ۱: خطی
  TT(c, 'نمودار خطی پیشرفت مطالعه', R, 215, 34, 1, '#16302c', 'right');
  var y0 = 285, y1 = 575, vals = days.map(function (d) { return d.v / 36e5; }), mx = Math.max.apply(null, vals), st = nice(mx, 4), top = st * Math.max(1, Math.ceil(mx / st - 1e-9)), tk = Math.round(top / st);
  grid(c, x0, y0, x1, y1, top, tk, dec);
  TT(c, 'ساعت', x0 - 12, y0 - 24, 22, 0, '#5b6b68', 'right');
  var X = function (i) { return n === 1 ? (x0 + x1) / 2 : x0 + (x1 - x0) * i / (n - 1); }, Y = function (v) { return y1 - (y1 - y0) * v / top; };
  c.beginPath(); c.moveTo(X(0), y1); vals.forEach(function (v, i) { c.lineTo(X(i), Y(v)); }); c.lineTo(X(n - 1), y1); c.closePath(); c.fillStyle = 'rgba(15,118,110,.13)'; c.fill();
  c.beginPath(); vals.forEach(function (v, i) { if (i) c.lineTo(X(i), Y(v)); else c.moveTo(X(i), Y(v)); });
  c.strokeStyle = '#0f766e'; c.lineWidth = 5; c.lineJoin = 'round'; c.stroke();
  if (n <= 31) vals.forEach(function (v, i) { c.beginPath(); c.arc(X(i), Y(v), 7, 0, 7); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 4; c.stroke(); });
  xlabs(c, days, X, y1 + 30);
  var tot = 0, best = 0; days.forEach(function (d) { tot += d.v; if (d.v > best) best = d.v; });
  TT(c, 'هر نقطه = مطالعهٔ یک روز · میانگین: ' + durFa(tot / n) + ' در روز · بیشترین: ' + durFa(best), R, 650, 26, 0, '#34423f', 'right', W - 120);
  // نمودار ۲: تعهد به هدفگذاری
  TT(c, 'نمودار تعهد به هدفگذاری', R, 745, 34, 1, '#16302c', 'right');
  var b0 = 815, b1 = 1075;
  if (!G) {
    TT(c, 'هدف روزانه تعریف نشده است؛ از منوی «هدف‌گذاری» آن را تعیین کن.', W / 2, 940, 28, 0, '#5b6b68', 'center', W - 120);
  } else {
    var pc = days.map(function (d) { return d.v / (G * 6e4) * 100; }), pm = Math.max.apply(null, pc), t2 = Math.max(100, Math.ceil(pm / 25) * 25), k2 = t2 / 25;
    grid(c, x0, b0, x1, b1, t2, k2, function (v) { return toFa(Math.round(v)) + '٪'; });
    var Y2 = function (v) { return b1 - (b1 - b0) * Math.min(v, t2) / t2; }, XB = function (i) { return x0 + (x1 - x0) * (i + 0.5) / n; }, bw = (x1 - x0) / n * 0.62, hit = 0;
    c.setLineDash([12, 8]); c.strokeStyle = '#f59e0b'; c.lineWidth = 3; c.beginPath(); c.moveTo(x0, Y2(100)); c.lineTo(x1, Y2(100)); c.stroke(); c.setLineDash([]);
    pc.forEach(function (p, i) {
      if (p >= 100) hit++;
      c.fillStyle = p >= 100 ? '#16a34a' : '#0f766e'; c.fillRect(XB(i) - bw / 2, Y2(p), bw, b1 - Y2(p));
      if (n <= 16) TT(c, toFa(Math.round(p)) + '٪', XB(i), Y2(p) - 16, 20, 0, '#34423f', 'center');
    });
    xlabs(c, days, XB, b1 + 30);
    TT(c, 'درصد انجام هدف روزانه (' + durFa(G * 6e4) + ') · خط‌چین = ۱۰۰٪ · ' + faNum(hit) + ' از ' + faNum(n) + ' روز به هدف رسید', R, 1150, 26, 0, '#34423f', 'right', W - 120);
  }
  TT(c, 'ساعت مطالعه · ' + dateStr(Date.now()), W / 2, H - 40, 24, 0, '#8a9795', 'center');
  return o.cv;
}
$('lnMake').onclick = function () {
  var r = rangeOf('lf', 'lt', $('lnErr')); if (!r) return;
  var days = dayList(r.from, r.to);
  if (days.length > 92) { $('lnErr').textContent = 'حداکثر ۹۲ روز را می‌توان انتخاب کرد.'; return; }
  if (!days.some(function (d) { return d.v > 0; })) { $('lnErr').textContent = 'در این بازه مطالعه‌ای ثبت نشده است.'; return; }
  outPng(makeProgress(r, days, dailyGoal()), function () { $('lnDlg').close(); });
};
