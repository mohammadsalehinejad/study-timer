// ===== تصویر نمودار مطالعه و اسکرین‌تایم =====
var PALETTE = ['#0f766e', '#f59e0b', '#6366f1', '#ef4444', '#10b981', '#ec4899', '#3b82f6', '#a855f7', '#84cc16', '#f97316'];
function pieColor(i) { return i < PALETTE.length ? PALETTE[i] : 'hsl(' + ((i * 47) % 360) + ',62%,48%)'; }
function durFa(ms) { var m = Math.round(ms / 6e4), hh = Math.floor(m / 60); m = m % 60; return hh ? faNum(hh) + ' ساعت' + (m ? ' و ' + faNum(m) + ' دقیقه' : '') : faNum(m) + ' دقیقه'; }
function dsel(pre, title) { return '<p class="dlabel">' + title + '</p><div class="row3"><div class="field"><select id="' + pre + 'D" aria-label="روز"></select></div><div class="field"><select id="' + pre + 'M" aria-label="ماه"></select></div><div class="field"><select id="' + pre + 'Y" aria-label="سال"></select></div></div>'; }
document.body.insertAdjacentHTML('beforeend',
  '<dialog id="pieDlg" class="wide"><h3>تصویر نمودار مطالعه</h3><p class="hint">بازهٔ تاریخی (شمسی) را انتخاب کن تا سهم زمان هر درس در آن بازه به‌صورت نمودار دایره‌ای و تصویر ساخته شود.</p>' +
  dsel('pf', 'از تاریخ') + dsel('pt', 'تا تاریخ') + '<div class="error" id="pieErr" role="alert"></div>' +
  '<div class="actions"><button class="tool primary" id="pieMake" type="button">ساخت تصویر</button><button class="tool" id="pieCancel" type="button">انصراف</button></div></dialog>' +
  '<dialog id="stDlg" class="wide"><h3>اسکرین‌تایم گوشی</h3><div id="stBody"></div><div class="actions"><button class="tool" id="stClose" type="button">بستن</button></div></dialog>');
function dsetup(pre, jp) {
  var y = $(pre + 'Y'), m = $(pre + 'M'), d = $(pre + 'D'), t = jParts(Date.now());
  y.innerHTML = ''; m.innerHTML = '';
  for (var i = t.year; i >= t.year - 5; i--) mkOpt(y, i, toFa(i));
  JM.forEach(function (n, i) { mkOpt(m, i + 1, n); });
  y.value = jp.year; m.value = jp.month; fd(jp.day);
  function fd(keep) { var n = jDim(+y.value, +m.value), cur = keep || +d.value || 1; d.innerHTML = ''; for (var k = 1; k <= n; k++) mkOpt(d, k, toFa(k)); d.value = Math.min(cur, n); }
  y.onchange = m.onchange = function () { fd(); };
}
function openPie() { var t = jParts(Date.now()); dsetup('pf', { year: t.year, month: t.month, day: 1 }); dsetup('pt', t); $('pieErr').textContent = ''; $('pieDlg').showModal(); }
function pieMs(pre) { return jToMs(+$(pre + 'Y').value, +$(pre + 'M').value, +$(pre + 'D').value); }
function makePie(r, names, map, total) {
  var W = 1080, M = 60, tmp = document.createElement('canvas').getContext('2d');
  function F(c, b, px) { c.font = (b ? 'bold ' : '') + px + 'px sans-serif'; }
  function wrap(t, px, mw) {
    F(tmp, 0, px); var ws = t.split(' '), ln = [], cur = '';
    ws.forEach(function (w) { var tt = cur ? cur + ' ' + w : w; if (cur && tmp.measureText(tt).width > mw) { ln.push(cur); cur = w; } else cur = tt; });
    if (cur) ln.push(cur); return ln;
  }
  var desc = 'این نمودار برای بازهٔ تاریخی ' + dateStr(r.fa) + ' تا ' + dateStr(r.fb) + ' (تقویم هجری شمسی) رسم شده است و مجموع مطالعه در این بازه ' + durFa(total) +
    ' بوده است. روش رسم: مدت همهٔ بازه‌های ثبت‌شده برای هر درس در این بازه جمع شده، سپس سهم هر درس از کل زمان به‌صورت درصد محاسبه شده و به همان نسبت از دایره (۳۶۰ درجه) به آن درس داده شده است. رنگ هر درس در «راهنمای رنگ‌ها» بالای همین توضیحات مشخص شده است.';
  var lines = wrap(desc, 28, W - 2 * M), legendTop = 800, rowH = 56, descTop = legendTop + 60 + names.length * rowH + 30, H = descTop + 50 + lines.length * 46 + 90;
  var cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  var c = cv.getContext('2d'); c.direction = 'rtl'; c.textBaseline = 'middle'; c.fillStyle = '#fff'; c.fillRect(0, 0, W, H);
  function T(t, x, y, px, b, col, al, mw) { F(c, b, px); c.fillStyle = col; c.textAlign = al; c.fillText(t, x, y, mw || 1e4); }
  T('سهم زمان مطالعه به تفکیک درس', W / 2, 90, 46, 1, '#16302c', 'center');
  T('از ' + dateStr(r.fa) + ' تا ' + dateStr(r.fb), W / 2, 150, 30, 0, '#5b6b68', 'center');
  var cx = W / 2, cy = 470, R = 280, a0 = -Math.PI / 2;
  names.forEach(function (n, i) {
    var sh = map[n] / total, a1 = a0 + sh * 2 * Math.PI;
    c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, R, a0, a1); c.closePath(); c.fillStyle = pieColor(i); c.fill();
    if (names.length > 1) { c.lineWidth = 4; c.strokeStyle = '#fff'; c.stroke(); }
    if (sh >= 0.06) { var am = (a0 + a1) / 2; T(toFa(Math.round(sh * 100)) + '٪', cx + Math.cos(am) * R * 0.65, cy + Math.sin(am) * R * 0.65, 32, 1, '#fff', 'center'); }
    a0 = a1;
  });
  T('راهنمای رنگ‌ها', W - M, legendTop, 34, 1, '#16302c', 'right');
  names.forEach(function (n, i) {
    var y = legendTop + 60 + i * rowH + rowH / 2;
    c.fillStyle = pieColor(i); c.fillRect(W - M - 30, y - 15, 30, 30);
    T(n, W - M - 46, y, 28, 0, '#16302c', 'right', 520);
    T(toFa(Math.round(map[n] / total * 1000) / 10) + '٪  ·  ' + durFa(map[n]), M, y, 26, 0, '#5b6b68', 'left', 420);
  });
  T('توضیحات', W - M, descTop, 34, 1, '#16302c', 'right');
  lines.forEach(function (l, i) { T(l, W - M, descTop + 56 + i * 46, 28, 0, '#34423f', 'right'); });
  T('ساعت مطالعه · ' + dateStr(Date.now()), W / 2, H - 40, 24, 0, '#8a9795', 'center');
  return cv;
}
$('pieCancel').onclick = function () { $('pieDlg').close(); };
$('pieMake').onclick = function () {
  var a = pieMs('pf'), b = pieMs('pt');
  if (a === null || b === null) { $('pieErr').textContent = 'تاریخ نامعتبر است.'; return; }
  if (a > b) { $('pieErr').textContent = 'تاریخ شروع باید قبل از تاریخ پایان باشد.'; return; }
  var ga = new Date(a), gb = new Date(b), from = new Date(ga.getFullYear(), ga.getMonth(), ga.getDate()).getTime(), to = new Date(gb.getFullYear(), gb.getMonth(), gb.getDate() + 1).getTime() - 1;
  var map = {}, total = 0;
  sessions.forEach(function (s) { if (s.start >= from && s.start <= to) { var n = subName(s), d = s.end - s.start; map[n] = (map[n] || 0) + d; total += d; } });
  if (!total) { $('pieErr').textContent = 'در این بازه مطالعه‌ای ثبت نشده است.'; return; }
  var names = Object.keys(map).sort(function (x, y) { return map[y] - map[x]; });
  makePie({ fa: a, fb: b }, names, map, total).toBlob(function (bl) { saveFile('study-chart-' + dayKey(Date.now()) + '.png', bl); $('pieDlg').close(); }, 'image/png');
};

// ---------- اسکرین‌تایم (فقط اندروید؛ ۷ روز اخیر) ----------
function stMsg(html) { $('stBody').innerHTML = html; }
function hm(ms) { var m = Math.round(ms / 6e4); return toFa(Math.floor(m / 60) + ':' + pad(m % 60)); }
function renderScreen(res) {
  var d = res.days, tot = 0, mx = 1;
  d.forEach(function (x) { tot += x.ms; if (x.ms > mx) mx = x.ms; });
  stMsg('<div class="stchart">' + d.map(function (x, i) {
    return '<div class="stcol' + (i === d.length - 1 ? ' today' : '') + '"><span class="stval">' + hm(x.ms) + '</span><div class="stbar" style="height:' + Math.max(1, Math.round(x.ms / mx * 140)) + 'px"></div><span class="stlab">' + weekdayStr(x.t + 432e5) + '</span></div>';
  }).join('') + '</div>' +
    '<div class="table-wrap"><table style="min-width:0"><thead><tr><th>روز هفته</th><th>تاریخ</th><th>اسکرین‌تایم</th></tr></thead><tbody>' +
    d.map(function (x) { return '<tr><td class="sub">' + weekdayStr(x.t + 432e5) + '</td><td>' + dateStr(x.t + 432e5) + '</td><td>' + durFa(x.ms) + '</td></tr>'; }).join('') +
    '</tbody><tfoot><tr><td colspan="2">مجموع ۷ روز</td><td>' + durFa(tot) + '</td></tr><tr><td colspan="2">میانگین روزانه</td><td>' + durFa(tot / d.length) + '</td></tr></tfoot></table></div>' +
    '<p class="hint">این اعداد از آمار خود اندروید گرفته می‌شود و ممکن است با برنامهٔ «Digital Wellbeing» کمی تفاوت داشته باشد. ستون قرمز امروز است.</p>');
}
function loadScreen() {
  if (!native()) { stMsg('<p class="hint">اسکرین‌تایم فقط در نسخهٔ اندروید برنامه کار می‌کند.</p>'); return; }
  stMsg('<p class="hint">در حال دریافت اطلاعات…</p>');
  plug('ScreenTime').hasAccess().then(function (r) {
    if (!r.granted) {
      stMsg('<p>برای نمایش اسکرین‌تایم، اندروید باید اجازهٔ «دسترسی به آمار استفاده» را به این برنامه بدهد. در صفحه‌ای که باز می‌شود «ساعت مطالعه» را پیدا کن و اجازه را روشن کن، سپس برگرد.</p><div class="actions"><button class="tool primary" id="stGrant" type="button">دادن دسترسی</button><button class="tool" id="stRetry" type="button">بررسی دوباره</button></div>');
      return;
    }
    return plug('ScreenTime').weekUsage().then(renderScreen);
  }).catch(function (e) { stMsg('<p class="error">خطا: ' + esc(e && e.message || e) + '</p>'); });
}
function openScreen() { $('stDlg').showModal(); loadScreen(); }
$('stBody').addEventListener('click', function (e) {
  if (e.target.closest('#stGrant')) plug('ScreenTime').openSettings();
  else if (e.target.closest('#stRetry')) loadScreen();
});
$('stClose').onclick = function () { $('stDlg').close(); };
document.addEventListener('visibilitychange', function () { if (!document.hidden && $('stDlg').open) loadScreen(); });
clk('mPie', openPie); clk('mScreen', openScreen);
