// ===== افزودنی‌ها (داخل برنامه تزریق می‌شود) =====
var K_O = 'studyTimer.opts.v1', K_G = 'studyTimer.goals.v1', O = ld(K_O, {}), goals = ld(K_G, {}), editIdx = -1, lastMin = 0, kLast = 0;
if (O.auto === undefined) O.auto = true;
function saveO() { try { localStorage.setItem(K_O, JSON.stringify(O)); } catch (e) {} }
function saveG() { try { localStorage.setItem(K_G, JSON.stringify(goals)); } catch (e) {} }
function native() { var C = window.Capacitor; return !!(C && C.isNativePlatform && C.isNativePlatform()); }
function plug(n) { var C = window.Capacitor; return C.Plugins[n] || C.registerPlugin(n); }
function saveFile(name, blob) {
  if (native()) {
    var r = new FileReader();
    r.onload = function () {
      plug('Filesystem').writeFile({ path: name, data: String(r.result).split(',')[1], directory: 'CACHE' })
        .then(function (f) { return plug('Share').share({ title: name, dialogTitle: 'ذخیره یا ارسال فایل', url: f.uri }); })
        .catch(function (e) { if (!/cancel/i.test(String(e && e.message || e))) alert('ذخیره فایل ناموفق بود: ' + (e && e.message || e)); });
    };
    r.readAsDataURL(blob);
  } else {
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }
}

// ---------- ساخت رابط (منو، دیالوگ‌ها، کارت هدف) ----------
var sb2 = $('settingsBtn'); sb2.className = 'hamb'; sb2.innerHTML = '☰'; sb2.setAttribute('aria-label', 'منو');
sb2.parentNode.insertBefore(sb2, sb2.parentNode.firstChild);
$('addBtn').parentNode.style.display = 'none';
menu.innerHTML =
  '<button class="mitem" id="mSubj" type="button" role="menuitem"><span>📚 دروس و هدف روزانه</span></button>' +
  '<button class="mitem" id="mAdd" type="button" role="menuitem"><span>➕ افزودن دستی بازه</span></button>' +
  '<button class="mitem" id="mBackup" type="button" role="menuitem"><span>⬇️ دانلود گزارش (پشتیبان)</span></button>' +
  '<button class="mitem" id="mUpload" type="button" role="menuitem"><span>⬆️ آپلود گزارش</span></button>' +
  '<button class="mitem" id="appearBtn" type="button" role="menuitem"><span>🎨 تنظیمات ظاهری</span></button>' +
  '<button class="mitem" id="mPdf" type="button" role="menuitem"><span>📄 خروجی PDF</span></button>' +
  '<button class="mitem" id="mXls" type="button" role="menuitem"><span>📊 خروجی Excel</span></button>' +
  '<label class="mitem" for="optKiosk"><span>🔒 قفل هنگام مطالعه</span><input type="checkbox" class="switch" id="optKiosk" role="switch"></label>' +
  '<button class="mitem" id="mScreen" type="button" role="menuitem"><span>📱 اسکرین‌تایم گوشی</span></button>' +
  '<button class="mitem danger" id="mClear" type="button" role="menuitem"><span>🗑 پاک کردن همه داده‌ها</span></button>';
$('presets').previousElementSibling.insertAdjacentHTML('beforebegin',
  '<div class="crow"><label for="optQuote">نمایش جملات انگیزشی</label><input type="checkbox" class="switch" id="optQuote" role="switch"></div>' +
  '<div class="crow"><label for="themeToggle">حالت شب</label><input type="checkbox" class="switch" id="themeToggle" role="switch"></div>' +
  '<div class="crow"><label for="optAuto">شب خودکار از غروب تا صبح</label><input type="checkbox" class="switch" id="optAuto" role="switch"></div><hr class="sep" style="display:block">');
var qb = $('quote');
qb.insertAdjacentHTML('afterbegin', '<button type="button" id="qClose" class="qclose" aria-label="بستن جمله">×</button>');
qb.insertAdjacentHTML('beforebegin', '<section class="goals" id="goals" hidden><h2 style="margin:0 0 6px">هدف امروز</h2><div id="goalList"></div></section>');
document.body.insertAdjacentHTML('beforeend',
  '<dialog id="mgDlg" class="wide"><h3>دروس و هدف روزانه</h3><p class="hint">نام درس را ویرایش کن یا برای هر درس هدف روزانه (به دقیقه) بگذار. خالی = بدون هدف.</p>' +
  '<div class="inline"><input type="text" id="mgNew" maxlength="40" placeholder="درس جدید…"><button class="tool primary" id="mgAdd" type="button">افزودن</button></div>' +
  '<div class="error" id="mgErr" role="alert"></div><div id="mgList"></div><p class="hint">حذف یک درس، بازه‌های ثبت‌شده را پاک نمی‌کند.</p>' +
  '<div class="actions"><button class="tool" id="mgClose" type="button">بستن</button></div></dialog>');

// ---------- منو ----------
function clk(id, fn) { $(id).onclick = fn; }
clk('mAdd', function () { $('addBtn').click(); });
clk('mBackup', function () { $('backupBtn').click(); });
clk('mUpload', function () { $('uploadBtn').click(); });
clk('appearBtn', function () { setMenu(false); syncPickers(); $('appDlg').showModal(); });
clk('mScreen', function () { alert('نمایش اسکرین‌تایم گوشی به‌زودی اضافه می‌شود.'); });
clk('mSubj', openMg); clk('mPdf', exportPdf); clk('mXls', exportXlsx);
clk('mClear', function () {
  if (!confirm('همهٔ بازه‌ها، دروس و اهداف پاک شود؟ (پروفایل و یادداشت‌ها پاک نمی‌شوند.) این کار قابل بازگشت نیست.')) return;
  sessions = []; subjects = []; goals = {}; active = null; lastSub = '';
  kioskOff(); save(); saveG(); render(); renderGoals(); tick();
});
menu.addEventListener('click', function (e) { if (e.target.closest('button.mitem')) setMenu(false); });

// ---------- جمله و تم ----------
$('qClose').onclick = function () { O.qClosed = dayKey(Date.now()); saveO(); qb.hidden = true; };
$('optQuote').onchange = function () { O.quote = this.checked; O.qClosed = ''; saveO(); renderQuote(); };
$('themeToggle').onchange = function () { ui.theme = this.checked ? 'dark' : 'light'; O.auto = false; $('optAuto').checked = false; saveO(); saveUI(); applyUI(); };
$('optAuto').onchange = function () { O.auto = this.checked; saveO(); autoTheme(); };
function sunTimes() { // تقریب طلوع و غروب برای عرض جغرافیایی ۳۵.۷ (تهران)
  var d = new Date(), doy = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5),
    dec = 23.44 * Math.sin(2 * Math.PI * (doy - 81) / 365) * Math.PI / 180, la = 35.7 * Math.PI / 180,
    w = Math.acos(Math.max(-1, Math.min(1, -Math.tan(la) * Math.tan(dec)))) * 180 / Math.PI / 15;
  return [12.15 - w, 12.15 + w];
}
function autoTheme() {
  if (!O.auto) return;
  var d = new Date(), h = d.getHours() + d.getMinutes() / 60, t = sunTimes(), night = h >= t[1] || h < t[0];
  var want = night ? 'dark' : 'light';
  if (ui.theme !== want) { ui.theme = want; saveUI(); applyUI(); }
}

// ---------- قفل هنگام مطالعه (فقط اندروید) ----------
function kioskOn() {
  if (!O.kiosk || !native() || Date.now() - kLast < 4000) return;
  kLast = Date.now(); plug('Kiosk').start().catch(function () {});
}
function kioskOff() { if (native()) plug('Kiosk').stop().catch(function () {}); }
$('optKiosk').onchange = function () {
  if (this.checked && !native()) { alert('قفل فقط در نسخهٔ اندروید کار می‌کند.'); this.checked = false; return; }
  O.kiosk = this.checked; saveO();
  if (O.kiosk && !active) alert('از این به بعد با زدن «شروع»، اندروید برنامه را «پین» می‌کند (باید تأیید کنی). برای رفتن به بقیهٔ گوشی، دکمهٔ «پایان» را بزن.');
  if (active) { if (O.kiosk) { kLast = 0; kioskOn(); } else kioskOff(); }
};
document.addEventListener('visibilitychange', function () { if (!document.hidden && active) kioskOn(); });

// ---------- ویرایش بازه ----------
function editSession(i) {
  var s = sessions[i]; if (!s) return; editIdx = i;
  fillSel($('addSub'), s.sub || '', true); initDateSelects();
  var p = jParts(s.start); $('addY').value = p.year; $('addM').value = p.month; fillDays(p.day);
  function t(ms) { var d = new Date(ms); return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  $('addStart').value = t(s.start); $('addEnd').value = t(s.end);
  $('addTitle').textContent = 'ویرایش بازه مطالعه'; $('addError').textContent = ''; updatePreview(); dlg.showModal();
}
$('rows').addEventListener('click', function (e) { var b = e.target.closest('.ed'); if (b) editSession(Number(b.getAttribute('data-i'))); });

// ---------- دروس و اهداف ----------
function openMg() { $('mgErr').textContent = ''; $('mgNew').value = ''; renderMg(); $('mgDlg').showModal(); }
function renderMg() {
  var h = '<div class="mgrow"><b>مجموع کل</b><input type="number" inputmode="numeric" min="0" data-g="__all" placeholder="هدف (دقیقه)" value="' + (goals.__all || '') + '"></div>';
  subjects.forEach(function (s, i) {
    h += '<div class="mgrow"><input type="text" maxlength="40" data-n="' + i + '" value="' + esc(s) + '"><input type="number" inputmode="numeric" min="0" data-g="' + esc(s) + '" placeholder="هدف (دقیقه)" value="' + (goals[s] || '') + '"><button class="del" type="button" data-x="' + i + '" aria-label="حذف">×</button></div>';
  });
  $('mgList').innerHTML = h;
}
function mgAdd() {
  var v = $('mgNew').value.trim(); if (!v) { $('mgErr').textContent = 'اسم درس را بنویس.'; return; }
  var b = subjects.length; addSubject(v);
  $('mgErr').textContent = subjects.length === b ? 'این درس قبلاً تعریف شده است.' : '';
  $('mgNew').value = ''; renderMg(); render();
}
$('mgAdd').onclick = mgAdd; $('mgNew').onkeydown = function (e) { if (e.key === 'Enter') mgAdd(); };
$('mgClose').onclick = function () { $('mgDlg').close(); };
$('mgList').addEventListener('click', function (e) {
  var b = e.target.closest('[data-x]'); if (!b) return;
  var i = Number(b.getAttribute('data-x'));
  if (confirm('درس «' + subjects[i] + '» حذف شود؟ بازه‌های قبلی در جدول می‌مانند.')) { delete goals[subjects[i]]; subjects.splice(i, 1); save(); saveG(); renderMg(); render(); renderGoals(); }
});
$('mgList').addEventListener('change', function (e) {
  var t = e.target, g = t.getAttribute('data-g'), n = t.getAttribute('data-n');
  if (g !== null) {
    var v = Math.max(0, Math.round(Number(t.value) || 0));
    if (v) goals[g] = v; else delete goals[g];
    saveG(); renderGoals();
  } else if (n !== null) {
    var i = Number(n), old = subjects[i], nw = t.value.trim().replace(/\s+/g, ' ');
    if (!nw || nw === old) { t.value = old; return; }
    if (subjects.some(function (x, j) { return j !== i && x.toLowerCase() === nw.toLowerCase(); })) { $('mgErr').textContent = 'این نام قبلاً وجود دارد.'; t.value = old; return; }
    $('mgErr').textContent = ''; subjects[i] = nw;
    sessions.forEach(function (s) { if (s.sub === old) s.sub = nw; });
    if (active && active.sub === old) active.sub = nw;
    if (lastSub === old) lastSub = nw;
    if (goals[old]) { goals[nw] = goals[old]; delete goals[old]; saveG(); }
    save(); renderMg(); render(); renderGoals();
  }
});
function renderGoals() {
  var box = $('goals'), keys = Object.keys(goals).filter(function (k) { return goals[k] > 0 && (k === '__all' || subjects.indexOf(k) >= 0); });
  box.hidden = !keys.length; if (!keys.length) return;
  keys.sort(function (a, b) { return a === '__all' ? -1 : b === '__all' ? 1 : 0; });
  var now = Date.now(), tk = dayKey(now), per = {}, all = 0;
  sessions.forEach(function (s) { if (dayKey(s.start) === tk) { var d = s.end - s.start; per[s.sub || ''] = (per[s.sub || ''] || 0) + d; all += d; } });
  if (active && dayKey(active.start) === tk) { var d2 = now - active.start; per[active.sub || ''] = (per[active.sub || ''] || 0) + d2; all += d2; }
  $('goalList').innerHTML = keys.map(function (k) {
    var cur = k === '__all' ? all : (per[k] || 0), g = goals[k] * 60000, p = Math.min(100, cur / g * 100);
    return '<div class="grow"><div class="gtop"><b>' + (k === '__all' ? 'مجموع کل' : esc(k)) + '</b><span>' + faNum(minutes(cur)) + ' از ' + faNum(goals[k]) + ' دقیقه (' + toFa(Math.floor(p)) + '٪)</span></div><div class="bar"><i class="' + (cur >= g ? 'done' : '') + '" style="width:' + p + '%"></i></div></div>';
  }).join('');
}
function tickExtra(now) {
  renderGoals();
  var m = Math.floor(now / 6e4); if (m !== lastMin) { lastMin = m; autoTheme(); }
}
function initExtra() {
  $('optQuote').checked = !!O.quote; $('optAuto').checked = !!O.auto; $('optKiosk').checked = !!O.kiosk;
  autoTheme(); renderGoals(); if (active) kioskOn();
}

// ---------- خروجی Excel و PDF ----------
function rep() {
  var rows = [['شماره', 'تاریخ', 'مورد مطالعه', 'ساعت شروع', 'ساعت پایان', 'مدت (دقیقه)', 'مدت (ساعت:دقیقه:ثانیه)']], dm = {}, dord = [], sm = {}, tot = 0;
  sessions.forEach(function (s, i) {
    var d = s.end - s.start, k = dayKey(s.start), n = subName(s); tot += d;
    rows.push([i + 1, dateStr(s.start), n, timeStr(s.start), timeStr(s.end), minutes(d), hmsFa(d)]);
    if (!dm[k]) { dm[k] = { w: weekdayStr(s.start), t: dateStr(s.start), c: 0, d: 0 }; dord.push(k); }
    dm[k].c++; dm[k].d += d; sm[n] = sm[n] || { c: 0, d: 0 }; sm[n].c++; sm[n].d += d;
  });
  dord.sort();
  var daily = [['روز هفته', 'تاریخ', 'تعداد بازه‌ها', 'جمع (دقیقه)', 'جمع (ساعت:دقیقه:ثانیه)']].concat(dord.map(function (k) { var g = dm[k]; return [g.w, g.t, g.c, minutes(g.d), hmsFa(g.d)]; }));
  var names = Object.keys(sm).sort(function (a, b) { return sm[b].d - sm[a].d; });
  var subs = [['مورد مطالعه', 'تعداد بازه‌ها', 'جمع (دقیقه)', 'جمع (ساعت:دقیقه:ثانیه)', 'سهم از کل']].concat(names.map(function (n) { var g = sm[n]; return [n, g.c, minutes(g.d), hmsFa(g.d), toFa(Math.round(g.d / tot * 1000) / 10) + '٪']; }));
  return { rows: rows, daily: daily, subs: subs };
}
function crc32(b) {
  var t = crc32.t; if (!t) { t = crc32.t = []; for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } }
  var x = -1; for (var i = 0; i < b.length; i++) x = t[(x ^ b[i]) & 255] ^ (x >>> 8); return (x ^ -1) >>> 0;
}
function zip(files) {
  var enc = new TextEncoder(), parts = [], cen = [], off = 0;
  files.forEach(function (f) {
    var nm = enc.encode(f.n), d = f.d, crc = crc32(d), h = new DataView(new ArrayBuffer(30)), c = new DataView(new ArrayBuffer(46));
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint32(14, crc, true); h.setUint32(18, d.length, true); h.setUint32(22, d.length, true); h.setUint16(26, nm.length, true);
    parts.push(new Uint8Array(h.buffer), nm, d);
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint32(16, crc, true); c.setUint32(20, d.length, true); c.setUint32(24, d.length, true); c.setUint16(28, nm.length, true); c.setUint32(42, off, true);
    cen.push(new Uint8Array(c.buffer), nm); off += 30 + nm.length + d.length;
  });
  var cl = 0; cen.forEach(function (x) { cl += x.length; });
  var e = new DataView(new ArrayBuffer(22));
  e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, cl, true); e.setUint32(16, off, true);
  return new Blob(parts.concat(cen, [new Uint8Array(e.buffer)]));
}
function sheetXml(rows) {
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView rightToLeft="1" workbookViewId="0"/></sheetViews><sheetData>' +
    rows.map(function (r, i) {
      return '<row r="' + (i + 1) + '">' + r.map(function (v, j) {
        var ref = String.fromCharCode(65 + j) + (i + 1);
        return typeof v === 'number' ? '<c r="' + ref + '"><v>' + v + '</v></c>' : '<c r="' + ref + '" t="inlineStr"><is><t>' + esc(v) + '</t></is></c>';
      }).join('') + '</row>';
    }).join('') + '</sheetData></worksheet>';
}
function exportXlsx() {
  if (!sessions.length) { alert('هنوز بازه‌ای برای خروجی گرفتن وجود ندارد.'); return; }
  var r = rep(), enc = new TextEncoder(), X = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', NS = 'http://schemas.openxmlformats.org/',
    names = ['بازه‌ها', 'جمع روزانه', 'جمع هر مورد'], sh = [r.rows, r.daily, r.subs], RT = NS + 'officeDocument/2006/relationships';
  var f = [
    ['[Content_Types].xml', X + '<Types xmlns="' + NS + 'package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' + sh.map(function (_, i) { return '<Override PartName="/xl/worksheets/sheet' + (i + 1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'; }).join('') + '</Types>'],
    ['_rels/.rels', X + '<Relationships xmlns="' + NS + 'package/2006/relationships"><Relationship Id="rId1" Type="' + RT + '/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
    ['xl/workbook.xml', X + '<workbook xmlns="' + NS + 'spreadsheetml/2006/main" xmlns:r="' + RT + '"><sheets>' + names.map(function (n, i) { return '<sheet name="' + n + '" sheetId="' + (i + 1) + '" r:id="rId' + (i + 1) + '"/>'; }).join('') + '</sheets></workbook>'],
    ['xl/_rels/workbook.xml.rels', X + '<Relationships xmlns="' + NS + 'package/2006/relationships">' + sh.map(function (_, i) { return '<Relationship Id="rId' + (i + 1) + '" Type="' + RT + '/worksheet" Target="worksheets/sheet' + (i + 1) + '.xml"/>'; }).join('') + '</Relationships>']
  ];
  sh.forEach(function (rows, i) { f.push(['xl/worksheets/sheet' + (i + 1) + '.xml', sheetXml(rows)]); });
  saveFile('study-report-' + dayKey(Date.now()) + '.xlsx', zip(f.map(function (x) { return { n: x[0], d: enc.encode(x[1]) }; })));
}
function makePdf(js) {
  var enc = new TextEncoder(), ch = [], off = [], len = 0, n = js.length;
  function add(x) { var u = typeof x === 'string' ? enc.encode(x) : x; ch.push(u); len += u.length; }
  add('%PDF-1.4\n');
  off[1] = len; add('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  off[2] = len; add('2 0 obj\n<< /Type /Pages /Count ' + n + ' /Kids [' + js.map(function (_, i) { return (3 + 3 * i) + ' 0 R'; }).join(' ') + '] >>\nendobj\n');
  js.forEach(function (j, i) {
    var p = 3 + 3 * i, c = 'q 595 0 0 842 0 0 cm /Im0 Do Q';
    off[p] = len; add(p + ' 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im0 ' + (p + 2) + ' 0 R >> >> /Contents ' + (p + 1) + ' 0 R >>\nendobj\n');
    off[p + 1] = len; add((p + 1) + ' 0 obj\n<< /Length ' + c.length + ' >>\nstream\n' + c + '\nendstream\nendobj\n');
    off[p + 2] = len; add((p + 2) + ' 0 obj\n<< /Type /XObject /Subtype /Image /Width 1240 /Height 1754 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + j.length + ' >>\nstream\n'); add(j); add('\nendstream\nendobj\n');
  });
  var x = len, N = 3 + 3 * n, s = 'xref\n0 ' + N + '\n0000000000 65535 f \n';
  for (var i = 1; i < N; i++) s += String(off[i]).padStart(10, '0') + ' 00000 n \n';
  add(s + 'trailer\n<< /Size ' + N + ' /Root 1 0 R >>\nstartxref\n' + x + '\n%%EOF');
  return new Blob(ch, { type: 'application/pdf' });
}
function exportPdf() {
  if (!sessions.length) { alert('هنوز بازه‌ای برای خروجی گرفتن وجود ندارد.'); return; }
  var r = rep(), W = 1240, H = 1754, M = 60, RH = 42, pages = [], cv, cx, y;
  function np() {
    if (cv) pages.push(cv.toDataURL('image/jpeg', 0.85));
    cv = document.createElement('canvas'); cv.width = W; cv.height = H; cx = cv.getContext('2d');
    cx.fillStyle = '#fff'; cx.fillRect(0, 0, W, H); cx.direction = 'rtl'; cx.textBaseline = 'middle'; y = M;
  }
  function tx(t, x, yy, b, c, al, mw) { cx.font = (b ? 'bold ' : '') + '24px sans-serif'; cx.fillStyle = c; cx.textAlign = al || 'center'; cx.fillText(String(t), x, yy, mw || 1e4); }
  function row(cells, w, head, i) {
    if (y + RH > H - M) np();
    cx.fillStyle = head ? '#0f766e' : (i % 2 ? '#eef3f2' : '#fff'); cx.fillRect(M, y, W - 2 * M, RH);
    var x = W - M;
    cells.forEach(function (c, j) { tx(typeof c === 'number' ? faNum(c) : c, x - w[j] / 2, y + RH / 2, head, head ? '#fff' : '#16302c', 'center', w[j] - 12); x -= w[j]; });
    y += RH;
  }
  function tbl(title, rows, w) {
    if (y + 4 * RH > H - M) np();
    tx(title, W - M, y + 20, true, '#0f766e', 'right'); y += 50;
    rows.forEach(function (rw, i) { row(rw, w, i === 0, i); }); y += 40;
  }
  np(); tx('گزارش مطالعه — ' + weekdayStr(Date.now()) + ' ' + dateStr(Date.now()), W - M, y + 20, true, '#16302c', 'right'); y += 70;
  tbl('جمع به تفکیک مورد مطالعه', r.subs, [420, 160, 200, 220, 120]);
  tbl('جمع روزانه', r.daily, [200, 200, 160, 240, 320]);
  tbl('فهرست بازه‌ها', r.rows, [70, 190, 290, 130, 130, 120, 190]);
  pages.push(cv.toDataURL('image/jpeg', 0.85));
  saveFile('study-report-' + dayKey(Date.now()) + '.pdf', makePdf(pages.map(function (u) { return Uint8Array.from(atob(u.split(',')[1]), function (c) { return c.charCodeAt(0); }); })));
}
