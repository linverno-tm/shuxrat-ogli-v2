// Faqat GitHub'dagi statik namuna uchun: admin panel ko'rinadi, lekin hech narsa saqlanmaydi.
// «Namuna» yozuvi doim ko'rinib turadi; saqlashga urinilsa, silkinib eslatadi.
(function () {
  var t = document.createElement('div');
  t.className = 'namuna-xabar'; t.setAttribute('role', 'status');
  t.textContent = 'Bu namuna: oʻzgarishlar saqlanmaydi. Haqiqiy panel sayt serverga qoʻyilgach ishlaydi.';
  document.body.appendChild(t);
  function eslat() { t.classList.remove('silkin'); void t.offsetWidth; t.classList.add('silkin'); }
  document.addEventListener('submit', function (e) { e.preventDefault(); eslat(); }, true);
  document.addEventListener('click', function (e) { if (e.target.closest('[data-yopiq]')) { e.preventDefault(); eslat(); } });
  var s = document.createElement('style');
  s.textContent =
    '.namuna-xabar{position:fixed;left:50%;bottom:20px;z-index:99;width:max-content;max-width:calc(100% - 32px);transform:translateX(-50%);padding:14px 22px;border-radius:12px;background:#172B66;color:#fff;font-weight:700;text-align:center;line-height:1.35;box-shadow:0 18px 40px -16px rgba(23,43,102,.6)}' +
    '.namuna-xabar.silkin{animation:namuna-silkin .45s}' +
    '@keyframes namuna-silkin{20%,60%{transform:translateX(calc(-50% - 6px))}40%,80%{transform:translateX(calc(-50% + 6px))}}' +
    '.mazmun{padding-bottom:110px}' +
    '@media(min-width:901px){.namuna-xabar{left:calc(50% + 130px);max-width:calc(100% - 292px)}}' +
    '@media(max-width:900px){.namuna-xabar{bottom:calc(76px + env(safe-area-inset-bottom));padding:10px 14px;font-size:13px}.mazmun{padding-bottom:190px}}' +
    '@media(prefers-reduced-motion:reduce){.namuna-xabar.silkin{animation:none}}';
  document.head.appendChild(s);
})();
