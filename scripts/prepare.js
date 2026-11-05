// فایل src/index.html را برمی‌دارد، امکانات مخصوص موبایل را به آن اضافه می‌کند و در www/index.html می‌نویسد.
const fs = require('fs');
const src = 'src/index.html';
if (!fs.existsSync(src)) { console.error('فایل src/index.html پیدا نشد! کد HTML برنامه را آنجا بگذار.'); process.exit(1); }
let h = fs.readFileSync(src, 'utf8');

h = h.replace('<meta name="viewport" content="width=device-width, initial-scale=1">',
  '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">');

const css = `
/* ===== Android UI ===== */
html{-webkit-tap-highlight-color:transparent;-webkit-text-size-adjust:100%}
body{padding-top:calc(16px + env(safe-area-inset-top,0px));padding-bottom:calc(56px + env(safe-area-inset-bottom,0px));overscroll-behavior-y:none}
button,.tool,.mitem{touch-action:manipulation;-webkit-user-select:none;user-select:none}
@media(max-width:640px){
  body{padding-left:12px;padding-right:12px}
  h1{font-size:1.25rem}
  .hero{padding:20px 16px;gap:14px;border-radius:20px}
  .todaybox{padding:10px 0 0;border-top:1px solid rgba(255,255,255,.28)!important;border-inline-start:0}
  #toggleBtn{min-height:64px;font-size:1.5rem;border-radius:18px}
  .toolbar{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .toolbar .chips{grid-column:1/-1}
  .tool{min-height:46px;font-size:.95rem;border-radius:12px}
  #subjBtn{grid-column:1/-1}
  .viewbar{display:grid;grid-template-columns:auto 1fr;gap:8px 10px}
  .viewbar select{min-width:0;width:100%;min-height:44px}
  .tiles{grid-template-columns:1fr 1fr;gap:10px}
  select,input[type=text],input[type=time]{min-height:46px;font-size:1rem}
  .setbtn{min-height:44px}
  .mitem{min-height:48px}
  .quote{padding:14px 16px}
  dialog{padding:18px;border-radius:20px}
  .actions .tool{flex:1}
  th,td{padding:9px 10px}
}
`;
h = h.replace('</style>', css + '</style>');

const oldFn = 'function download(name, text, type) {';
if (!h.includes(oldFn)) { console.error('تابع download پیدا نشد؛ آیا فایل اصلی تغییر کرده است؟'); process.exit(1); }
h = h.replace(oldFn, `function download(name, text, type) {
    var C = window.Capacitor;
    if (C && C.isNativePlatform && C.isNativePlatform()) { nativeSave(name, text); return; }
    return downloadWeb(name, text, type);
  }
  function nativeSave(name, text) {
    var P = window.Capacitor.Plugins, FS = P.Filesystem, SH = P.Share;
    FS.writeFile({ path: name, data: text, directory: 'CACHE', encoding: 'utf8' })
      .then(function (r) { return SH.share({ title: name, dialogTitle: 'ذخیره یا ارسال فایل', url: r.uri }); })
      .catch(function (e) { if (!/cancel/i.test(String(e && e.message || e))) alert('ذخیره فایل ناموفق بود: ' + (e && e.message || e)); });
  }
  function downloadWeb(name, text, type) {`);

const native = `
<script>
(function(){
  var C = window.Capacitor;
  if (!(C && C.isNativePlatform && C.isNativePlatform())) return;
  var App = C.Plugins && C.Plugins.App;
  if (!App) return;
  App.addListener('backButton', function(){
    var dlg = document.querySelector('dialog[open]');
    if (dlg) { dlg.close(); return; }
    var menu = document.getElementById('menu');
    if (menu && !menu.hidden) { menu.hidden = true; return; }
    App.minimizeApp();
  });
})();
</script>`;
h = h.replace('</body>', native + '\n</body>');

fs.mkdirSync('www', { recursive: true });
fs.writeFileSync('www/index.html', h);
console.log('www/index.html ساخته شد');
