// src/index.html (کد اصلی خودت) را برمی‌دارد، امکانات اندروید و قابلیت‌های جدید را به آن اضافه می‌کند و در www/index.html می‌نویسد.
const fs = require('fs');
if (!fs.existsSync('src/index.html')) { console.error('فایل src/index.html پیدا نشد!'); process.exit(1); }
let h = fs.readFileSync('src/index.html', 'utf8').replace(/\r\n/g, '\n');
function rep(a, b) {
  if (!h.includes(a)) { console.error('بخشی از فایل اصلی پیدا نشد (فایل اصلی تغییر کرده؟):\n' + a.slice(0, 100)); process.exit(1); }
  h = h.replace(a, function () { return b; });
}

rep('<meta name="viewport" content="width=device-width, initial-scale=1">', '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">');

const css = `
/* ===== Android UI ===== */
html{-webkit-tap-highlight-color:transparent;-webkit-text-size-adjust:100%}
body{padding-top:calc(16px + env(safe-area-inset-top,0px));padding-bottom:calc(56px + env(safe-area-inset-bottom,0px));overscroll-behavior-y:none}
button,.tool,.mitem{touch-action:manipulation;-webkit-user-select:none;user-select:none}
.top{justify-content:flex-start}.top h1{flex:1}
.hamb{font:inherit;font-size:1.5rem;line-height:1;width:46px;height:46px;border:1px solid var(--line);border-radius:12px;background:var(--surface);color:var(--ink);cursor:pointer}
.menu{left:auto;right:0;max-height:75vh;overflow:auto;min-width:270px}
.mitem.danger{color:var(--stop)}
.sep{display:none}
.quote{position:relative}
.qclose{position:absolute;top:8px;left:8px;width:34px;height:34px;border:0;border-radius:50%;background:var(--alt);color:var(--muted);font-size:1.3rem;line-height:1;cursor:pointer}
.goals{margin:14px 0 0;padding:16px 18px;border-radius:14px;background:var(--surface);border:1px solid var(--line)}
.grow{margin:12px 0}.gtop{display:flex;justify-content:space-between;gap:8px;font-size:.92rem}
.gtop span{color:var(--muted);font-variant-numeric:tabular-nums}
.bar{height:12px;border-radius:99px;background:var(--alt);border:1px solid var(--line);overflow:hidden;margin-top:6px}
.bar i{display:block;height:100%;background:var(--accent);border-radius:99px;transition:width .6s}
.bar i.done{background:#16a34a}
.mgrow{display:flex;gap:8px;align-items:center;margin:8px 0}.mgrow b{flex:1}
.mgrow input[type=text]{flex:1;min-width:0}
.mgrow input[type=number]{width:112px;font:inherit;padding:8px;border:1px solid var(--line);border-radius:9px;background:var(--bg);color:var(--ink)}
.ed{background:none;border:0;color:var(--muted);cursor:pointer;font:inherit;font-size:1.05rem;padding:2px 8px;border-radius:6px}
.ed:hover{color:var(--accent)}.acts{white-space:nowrap}
@media(max-width:640px){
  body{padding-left:12px;padding-right:12px}
  h1{font-size:1.2rem}
  .hero{padding:20px 16px;gap:14px;border-radius:20px}
  .todaybox{padding:10px 0 0;border-top:1px solid rgba(255,255,255,.28)!important;border-inline-start:0}
  #toggleBtn{min-height:64px;font-size:1.5rem;border-radius:18px}
  .tool{min-height:46px;font-size:.95rem;border-radius:12px}
  .viewbar{display:grid;grid-template-columns:auto 1fr;gap:8px 10px}
  .viewbar select{min-width:0;width:100%;min-height:44px}
  .tiles{grid-template-columns:1fr 1fr;gap:10px}
  select,input[type=text],input[type=time],input[type=number]{min-height:46px;font-size:1rem}
  .mitem{min-height:48px}
  .quote{padding:14px 44px}
  dialog{padding:18px;border-radius:20px}
  .actions .tool{flex:1}
  th,td{padding:9px 10px}
}
`;
rep('</style>', css + '</style>');

// ذخیرهٔ فایل (پشتیبان و CSV) از مسیر مشترک saveFile
rep('function download(name, text, type) {', 'function download(name, text, type) { return saveFile(name, new Blob([text], { type: type })); }\n  function downloadOld(name, text, type) {');
// دکمهٔ ویرایش کنار هر بازه
rep(`'</td><td><button class="del" type="button" title="حذف این بازه"`,
  `'</td><td class="acts"><button class="ed" type="button" title="ویرایش این بازه" aria-label="ویرایش بازه ' + (n + 1) + '" data-i="' + v.i + '">✎</button><button class="del" type="button" title="حذف این بازه"`);
// ذخیرهٔ ویرایش
rep(`var overlap = sessions.some(function (s) { return r.start < s.end && r.end > s.start; }) || (active && r.end > active.start);`,
  `var overlap = sessions.some(function (s, ix) { if (ix === editIdx) return false; return r.start < s.end && r.end > s.start; }) || (active && r.end > active.start);`);
rep(`sessions.push({ start: r.start, end: r.end, sub: sub });`, `if (editIdx >= 0) { sessions.splice(editIdx, 1); editIdx = -1; } sessions.push({ start: r.start, end: r.end, sub: sub });`);
rep(`$('addBtn').onclick = function () {`, `$('addBtn').onclick = function () { editIdx = -1; $('addTitle').textContent = 'اضافه کردن بازه فراموش‌شده';`);
// پیش‌فرض‌ها: تم روشن، جمله خاموش
rep(`ui.theme = (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';`, `ui.theme = 'light';`);
rep(`if (!n) { box.hidden = true; return; }`, `if (!n || !O.quote || O.qClosed === qDay) { box.hidden = true; return; }`);
// قفل هنگام شروع/پایان
rep(`save(); $('startDlg').close(); render(); tick();`, `save(); $('startDlg').close(); render(); tick(); kioskOn();`);
rep(`sessions.push({ start: active.start, end: Date.now(), sub: active.sub });`, `sessions.push({ start: active.start, end: Date.now(), sub: active.sub }); kioskOff();`);
// تیک و راه‌اندازی
rep(`if (dayKey(now) !== qDay) { renderQuote(); render(); }`, `tickExtra(now); if (dayKey(now) !== qDay) { renderQuote(); render(); }`);
rep(`load(); loadUI(); renderQuote(); render(); tick();`, `load(); loadUI(); initExtra(); renderQuote(); render(); tick();`);
rep(`// ---------- init ----------`, fs.readFileSync('scripts/inject.js', 'utf8') + '\n  // ---------- init ----------');

rep('</body>', `
<script>
(function(){
  var C = window.Capacitor;
  if (!(C && C.isNativePlatform && C.isNativePlatform())) return;
  var App = C.Plugins.App || C.registerPlugin('App');
  App.addListener('backButton', function(){
    var dlg = document.querySelector('dialog[open]');
    if (dlg) { dlg.close(); return; }
    var menu = document.getElementById('menu');
    if (menu && !menu.hidden) { menu.hidden = true; return; }
    App.minimizeApp();
  });
})();
</script>
</body>`);

fs.mkdirSync('www', { recursive: true });
fs.writeFileSync('www/index.html', h);
console.log('www/index.html ساخته شد');
