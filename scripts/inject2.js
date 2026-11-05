// ===== صفحه‌ها، منوی پایین و پروفایل =====
$('subjBtn').parentNode.style.display = 'none';
var mainEl = document.querySelector('main'), PG = {}, curTab = 'home';
['home', 'list', 'stat', 'prof'].forEach(function (k) { var d = document.createElement('div'); d.className = 'page'; d.id = 'pg_' + k; mainEl.appendChild(d); PG[k] = d; });
function mv(p, els) { els.forEach(function (e) { if (e) p.appendChild(e); }); }
mv(PG.home, [document.querySelector('.hero'), $('goals'), $('quote')]);
var h2s = document.querySelectorAll('main > h2');
mv(PG.list, [document.querySelector('.viewbar'), $('rows').closest('.table-wrap'), document.querySelector('.tiles')]);
mv(PG.stat, [h2s[0], $('dailyRows').closest('.table-wrap'), h2s[1], $('subRows').closest('.table-wrap')]);
function navBtn(k, label, svg) { return '<button type="button" data-tab="' + k + '"><svg viewBox="0 0 24 24" aria-hidden="true">' + svg + '</svg><span>' + label + '</span></button>'; }
document.body.insertAdjacentHTML('beforeend', '<nav class="bnav" aria-label="ناوبری">' +
  navBtn('home', 'خانه', '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h4.5v-6h4v6h4.5V10"/>') +
  navBtn('list', 'بازه‌ها', '<rect x="2" y="8" width="15" height="9" rx="2"/><circle cx="9.5" cy="12.5" r="2.4"/><path d="M17 10.5 22 8M17 12.5h5M17 14.5l5 2.5M5 17v2M14 17v2"/>') +
  navBtn('stat', 'آمار', '<path d="M18 5H6l6 7-6 7h12"/>') +
  navBtn('prof', 'پروفایل', '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>') + '</nav>');
function showTab(t) {
  curTab = t;
  Object.keys(PG).forEach(function (k) {
    PG[k].classList.toggle('on', k === t);
    var b = document.querySelector('[data-tab="' + k + '"]'); b.classList.toggle('on', k === t);
  });
  if (t === 'prof') renderProfile();
  window.scrollTo(0, 0);
}
document.querySelector('.bnav').onclick = function (e) { var b = e.target.closest('[data-tab]'); if (b) showTab(b.getAttribute('data-tab')); };
window.__navBack = function () { if (curTab !== 'home') { showTab('home'); return true; } return false; };

// ---------- پروفایل و یادداشت‌ها (آفلاین، فقط روی همین گوشی) ----------
var K_P = 'studyTimer.profile.v1', K_N = 'studyTimer.notes.v1', prof = ld(K_P, {}), notes = ld(K_N, []), pTmp = {};
function saveP() { try { localStorage.setItem(K_P, JSON.stringify(prof)); return true; } catch (e) { alert('حافظه پر است؛ عکس کوچک‌تری انتخاب کن.'); return false; } }
function saveN() { try { localStorage.setItem(K_N, JSON.stringify(notes)); } catch (e) {} }
function avHtml(cls, img) {
  img = img === undefined ? prof.avatar : img;
  return '<div class="av ' + cls + '">' + (img ? '<img src="' + img + '" alt="">' : '<span>' + esc(((prof.name || 'من').trim().charAt(0)) || '👤') + '</span>') + '</div>';
}
function userTag() { return prof.user ? '<span class="puser">@' + esc(prof.user) + '</span>' : ''; }
function noteHtml(n) {
  return '<article class="note">' + avHtml('sm') + '<div class="nb"><div class="nh"><b>' + esc(prof.name || 'من') + '</b>' + userTag() +
    '<span class="ntime">· ' + dateStr(n.t) + ' — ' + timeStr(n.t) + '</span><button class="ndel" type="button" data-id="' + n.id + '" aria-label="حذف یادداشت">🗑</button></div>' +
    '<div class="ntxt">' + esc(n.text) + '</div></div></article>';
}
function renderProfile() {
  var tot = 0, days = {};
  sessions.forEach(function (s) { tot += s.end - s.start; days[dayKey(s.start)] = 1; });
  PG.prof.innerHTML =
    '<div class="pcover"' + (prof.cover ? ' style="background-image:url(' + prof.cover + ')"' : '') + '></div>' +
    '<div class="phead">' + avHtml('big') + '<button class="tool" id="pEdit" type="button">ویرایش پروفایل</button></div>' +
    '<div class="pinfo"><div class="pname">' + esc(prof.name || 'نام خودت را انتخاب کن') + '</div>' + userTag() +
    (prof.bio ? '<p class="pbio">' + esc(prof.bio) + '</p>' : '<p class="pbio hint">بیو ننوشته‌ای؛ از «ویرایش پروفایل» اضافه کن.</p>') +
    '<div class="pstats"><span><b>' + faNum(Math.round(tot / 36e5 * 10) / 10) + '</b> ساعت مطالعه</span><span><b>' + faNum(Object.keys(days).length) + '</b> روز فعال</span><span><b>' + faNum(notes.length) + '</b> یادداشت</span></div></div>' +
    '<div class="pfeed"><div class="compose">' + avHtml('sm') + '<div><textarea id="nText" rows="2" maxlength="1000" placeholder="چه خبر؟ یک یادداشت برای خودت بنویس…"></textarea><div class="nbar"><button class="tool primary" id="nPost" type="button">ثبت یادداشت</button></div></div></div>' +
    (notes.length ? notes.map(noteHtml).join('') : '<div class="empty" style="display:block">هنوز یادداشتی نگذاشته‌ای.</div>') + '</div>';
}
document.body.insertAdjacentHTML('beforeend',
  '<dialog id="pDlg" class="wide"><h3>ویرایش پروفایل</h3><div class="pprev"><div class="pcover" id="pdCover"></div><div id="pdAv"></div></div>' +
  '<div class="row2"><button class="tool" id="pdAvBtn" type="button">عکس پروفایل</button><button class="tool" id="pdCovBtn" type="button">عکس کاور</button></div>' +
  '<input type="file" id="pdAvFile" accept="image/*" hidden><input type="file" id="pdCovFile" accept="image/*" hidden>' +
  '<div class="field" style="margin-top:14px"><label for="pdName">نام</label><input type="text" id="pdName" maxlength="30"></div>' +
  '<div class="field"><label for="pdUser">نام کاربری (انگلیسی)</label><input type="text" id="pdUser" maxlength="20" dir="ltr" placeholder="username"></div>' +
  '<div class="field"><label for="pdBio">بیو</label><textarea id="pdBio" rows="3" maxlength="160"></textarea></div>' +
  '<div class="actions"><button class="tool primary" id="pdSave" type="button">ذخیره</button><button class="tool" id="pdClear" type="button">حذف عکس‌ها</button><button class="tool" id="pdCancel" type="button">انصراف</button></div></dialog>');
function pdPrev() { $('pdCover').style.backgroundImage = pTmp.cover ? 'url(' + pTmp.cover + ')' : ''; $('pdAv').innerHTML = avHtml('big', pTmp.avatar); }
function toData(file, w, h, cb) {
  var r = new FileReader();
  r.onload = function () {
    var im = new Image();
    im.onload = function () {
      var c = document.createElement('canvas'), x, s = Math.max(w / im.width, h / im.height), dw = im.width * s, dh = im.height * s;
      c.width = w; c.height = h; x = c.getContext('2d'); x.drawImage(im, (w - dw) / 2, (h - dh) / 2, dw, dh); cb(c.toDataURL('image/jpeg', 0.85));
    };
    im.src = r.result;
  };
  r.readAsDataURL(file);
}
PG.prof.addEventListener('click', function (e) {
  if (e.target.closest('#pEdit')) {
    pTmp = { avatar: prof.avatar || '', cover: prof.cover || '' };
    $('pdName').value = prof.name || ''; $('pdUser').value = prof.user || ''; $('pdBio').value = prof.bio || '';
    pdPrev(); $('pDlg').showModal(); return;
  }
  if (e.target.closest('#nPost')) {
    var t = $('nText').value.trim(); if (!t) return;
    notes.unshift({ id: Date.now(), t: Date.now(), text: t }); saveN(); renderProfile(); return;
  }
  var d = e.target.closest('.ndel');
  if (d && confirm('این یادداشت حذف شود؟')) { notes = notes.filter(function (n) { return String(n.id) !== d.getAttribute('data-id'); }); saveN(); renderProfile(); }
});
$('pdAvBtn').onclick = function () { $('pdAvFile').click(); };
$('pdCovBtn').onclick = function () { $('pdCovFile').click(); };
$('pdAvFile').onchange = function () { var f = this.files[0], i = this; if (f) toData(f, 320, 320, function (u) { pTmp.avatar = u; pdPrev(); i.value = ''; }); };
$('pdCovFile').onchange = function () { var f = this.files[0], i = this; if (f) toData(f, 960, 320, function (u) { pTmp.cover = u; pdPrev(); i.value = ''; }); };
$('pdClear').onclick = function () { pTmp = { avatar: '', cover: '' }; pdPrev(); };
$('pdCancel').onclick = function () { $('pDlg').close(); };
$('pdSave').onclick = function () {
  prof.name = $('pdName').value.trim(); prof.user = $('pdUser').value.trim().replace(/[^A-Za-z0-9_]/g, ''); prof.bio = $('pdBio').value.trim();
  prof.avatar = pTmp.avatar; prof.cover = pTmp.cover;
  if (saveP()) { $('pDlg').close(); renderProfile(); }
};
showTab('home');
