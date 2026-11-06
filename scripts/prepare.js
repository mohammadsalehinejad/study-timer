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
body{padding-top:calc(16px + env(safe-area-inset-top,0px));padding-bottom:calc(100px + env(safe-area-inset-bottom,0px));overscroll-behavior-y:none}
button,.tool,.mitem{touch-action:manipulation;-webkit-user-select:none;user-select:none}
.top{justify-content:flex-start}.top h1{flex:1;text-align:left}
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
.page{display:none}.page.on{display:block}
.bnav{position:fixed;left:0;right:0;bottom:0;z-index:30;display:flex;background:var(--surface);border-top:1px solid var(--line);padding-bottom:env(safe-area-inset-bottom,0px);box-shadow:0 -4px 16px rgba(0,0,0,.08)}
.bnav button{flex:1;font:inherit;font-size:.72rem;background:none;border:0;color:var(--muted);display:flex;flex-direction:column;align-items:center;gap:2px;padding:9px 4px;min-height:62px;cursor:pointer}
.bnav svg{width:26px;height:26px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.bnav button.on{color:var(--accent);font-weight:700}
.pcover{height:130px;border-radius:16px;background:linear-gradient(135deg,var(--hero1),var(--hero2)) center/cover}
.phead{display:flex;justify-content:space-between;align-items:flex-start;padding:0 16px;margin-top:-46px}
.phead .tool{margin-top:58px}
.av{border-radius:50%;background:var(--accent);color:var(--accent-ink);display:flex;align-items:center;justify-content:center;overflow:hidden;font-weight:700;flex:none;border:4px solid var(--bg)}
.av img{width:100%;height:100%;object-fit:cover}
.av.big{width:92px;height:92px;font-size:2.2rem}.av.sm{width:42px;height:42px;font-size:1.1rem;border-width:0}
.pinfo{padding:10px 16px}.pname{font-size:1.3rem;font-weight:700}
.puser{color:var(--muted);font-size:.9rem;direction:ltr;unicode-bidi:plaintext;display:inline-block}
.ntime{color:var(--muted);font-size:.85rem}
.pbio{margin:8px 0;white-space:pre-wrap}
.pstats{display:flex;gap:16px;flex-wrap:wrap;color:var(--muted);font-size:.9rem}.pstats b{color:var(--ink)}
.pfeed{background:var(--surface);border:1px solid var(--line);border-radius:14px;overflow:hidden;margin-top:8px}
.compose,.note{display:flex;gap:12px;padding:14px 16px;border-top:1px solid var(--line)}
.pfeed>:first-child{border-top:0}
.compose>div,.nb{flex:1;min-width:0}
textarea{font:inherit;width:100%;padding:10px;border:1px solid var(--line);border-radius:12px;background:var(--bg);color:var(--ink);resize:vertical}
.nbar{display:flex;justify-content:flex-end;margin-top:8px}
.nh{display:flex;gap:8px;align-items:baseline;flex-wrap:wrap}
.ntxt{white-space:pre-wrap;word-break:break-word;margin:4px 0}
.ndel{background:none;border:0;cursor:pointer;margin-inline-start:auto;opacity:.6}.ndel:hover{opacity:1}
.pprev{position:relative;margin-bottom:50px}.pprev .av{position:absolute;right:16px;bottom:-44px}
.mhead{padding:10px 12px 2px;color:var(--muted);font-size:.78rem;font-weight:700}
.msep{border:0;border-top:1px solid var(--line);margin:6px 8px}
.opt{display:flex;flex-direction:column;gap:3px;width:100%;text-align:right;font:inherit;padding:14px 16px;margin:0 0 10px;border:1px solid var(--line);border-radius:12px;background:var(--surface);color:var(--ink);cursor:pointer}
.opt b{font-size:1rem}.opt span{color:var(--muted);font-size:.85rem;opacity:.85}.opt:hover{border-color:var(--accent)}
.sjm{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.gh{margin:16px 0 4px;color:var(--muted);font-size:.9rem}
.gsec{margin:10px 0}.gname{font-weight:600;margin-bottom:4px;display:flex;align-items:center;gap:6px}
.gin{display:flex;align-items:center;gap:8px}
.gin input{font:inherit;width:76px;padding:8px;text-align:center;border:1px solid var(--line);border-radius:9px;background:var(--bg);color:var(--ink)}
.dot{width:12px;height:12px;border-radius:50%;display:inline-block}
dialog.wide{max-height:calc(100vh - 120px - env(safe-area-inset-top,0px))}
#pDlg{margin-top:calc(env(safe-area-inset-top,0px) + 56px)}
.compose textarea{min-height:150px}
.stchart{display:flex;gap:6px;height:200px;align-items:stretch;margin:12px 0;padding-top:4px}
.stcol{flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:4px;min-width:0}
.stbar{width:70%;background:var(--accent);border-radius:8px 8px 0 0;min-height:2px}
.stcol.today .stbar{background:var(--stop)}
.stval{font-size:.7rem;color:var(--muted)}.stlab{font-size:.72rem;text-align:center}
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
rep(`// ---------- init ----------`, fs.readFileSync('scripts/inject.js', 'utf8') + '\n' + fs.readFileSync('scripts/inject2.js', 'utf8') + '\n' + fs.readFileSync('scripts/inject3.js', 'utf8') + '\n  // ---------- init ----------');

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
    if (window.__navBack && window.__navBack()) return;
    App.minimizeApp();
  });
})();
</script>
</body>`);

rep('ساعت سیستم:', 'ساعت:');
h = h.replace(/(<title>)[^<]*(<\/title>)/, '$1ساعت مطالعه$2').replace(/: 'ثبت بازه.های مطالعه';/, ": 'ساعت مطالعه';");

// «مورد مطالعه» ← «درس» (به‌جز متن جمله‌های انگیزشی)
function ren(t) {
  return t.split('موارد مطالعه').join('دروس').split('مورد مطالعه').join('درس').split('همه موارد').join('همه دروس').split('بدون مورد').join('بدون درس')
    .split('یک مورد').join('یک درس').split('این مورد').join('این درس').split('موردی').join('درسی').split('مورد «').join('درس «').split('انصراف').join('لغو');
}
var qa = h.indexOf('var QUOTES_RAW = ['), qb2 = h.indexOf('var QUOTES = [];');
h = ren(h.slice(0, qa)) + h.slice(qa, qb2) + ren(h.slice(qb2));

fs.mkdirSync('www', { recursive: true });
fs.writeFileSync('www/index.html', h);
console.log('www/index.html ساخته شد');
