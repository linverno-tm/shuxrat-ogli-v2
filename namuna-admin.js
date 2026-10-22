// Faqat GitHub'dagi statik namuna uchun: admin panel ko'rinadi, lekin hech narsa saqlanmaydi.
(function () {
  var t = document.createElement('div');
  t.className = 'namuna-xabar'; t.setAttribute('role', 'status');
  t.textContent = 'Bu namuna: oʻzgarishlar saqlanmaydi. Haqiqiy panel sayt serverga qoʻyilgach ishlaydi.';
  document.body.appendChild(t);
  var vaqt = 0;
  function korsat() { t.classList.add('korin'); clearTimeout(vaqt); vaqt = setTimeout(function () { t.classList.remove('korin'); }, 3200); }
  document.addEventListener('submit', function (e) { e.preventDefault(); korsat(); }, true);
  document.addEventListener('click', function (e) { if (e.target.closest('[data-yopiq]')) { e.preventDefault(); korsat(); } });
  var s = document.createElement('style');
  s.textContent = '.namuna-xabar{position:fixed;left:50%;bottom:24px;z-index:99;max-width:calc(100% - 32px);transform:translate(-50%,20px);padding:14px 20px;border-radius:12px;background:#172B66;color:#fff;font-weight:700;box-shadow:0 18px 40px -16px rgba(23,43,102,.6);opacity:0;pointer-events:none;transition:opacity .2s,transform .2s}.namuna-xabar.korin{opacity:1;transform:translate(-50%,0)}@media(max-width:900px){.namuna-xabar{bottom:88px}}';
  document.head.appendChild(s);
})();
