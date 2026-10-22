// Oddiy ariza formalari (form[data-ariza-oddiy]): ism, telefon, korxona, manzil, izoh → /shuxrat-ogli-v2/api/buyurtma.
// data-mahsulot — admin «Buyurtmalar»da ko'rinadigan turi; ulanmasa — SMS / Telegram / nusxa zaxirasi.
(function () {
  document.querySelectorAll('form[data-ariza-oddiy]').forEach(function (f) {
    var tel = f.elements.tel;
    tel.addEventListener('input', function (e) {
      if (e.inputType && e.inputType.indexOf('delete') === 0) return;
      var r = tel.value.replace(/\D/g, ''); if (!r) return;
      if (r.length <= 9 && r.indexOf('998') !== 0) r = '998' + r;
      if (r.indexOf('998') !== 0) { tel.value = '+' + r; return; }
      r = r.slice(0, 12);
      tel.value = '+' + [r.slice(0, 3), r.slice(3, 5), r.slice(5, 8), r.slice(8, 10), r.slice(10, 12)].filter(Boolean).join(' ');
    });
    var xato = f.querySelector('.ariza-xato'), natija = f.querySelector('.ariza-natija'), yuborildi = f.querySelector('.ariza-yuborildi');
    var korsat = function (el) { el.hidden = false; el.focus(); el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); };
    var qiymat = function (n) { return f.elements[n] ? f.elements[n].value.trim() : ''; };
    var yorliq = function (n) { var s = f.elements[n] && f.elements[n].closest('label').querySelector('span'); return s ? s.textContent.trim() : n; };
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var ism = f.elements.ism, telOk = tel.value.replace(/\D/g, '').length >= 9;
      ism.setAttribute('aria-invalid', String(!ism.value.trim())); tel.setAttribute('aria-invalid', String(!telOk));
      if (!ism.value.trim() || !telOk) { xato.hidden = false; (!ism.value.trim() ? ism : tel).focus(); return; }
      xato.hidden = true;
      var matn = [f.dataset.bosh + ' — Shuxrat oʻgʻli', ''].concat(['ism', 'tel', 'korxona', 'manzil', 'izoh']
        .filter(function (n) { return qiymat(n); }).map(function (n) { return yorliq(n) + ': ' + qiymat(n); })).join('\n');
      f.querySelector('.ariza-matn').textContent = matn;
      f.querySelector('.ariza-sms').href = 'sms:' + SOZLAMA.telefon + '?body=' + encodeURIComponent(matn);
      var tg = f.querySelector('.ariza-tg');
      if (SOZLAMA.telegram) { tg.href = 'https://t.me/' + SOZLAMA.telegram + '?text=' + encodeURIComponent(matn); tg.hidden = false; }
      var tugma = f.querySelector('button[type=submit]');
      tugma.disabled = true; tugma.setAttribute('aria-busy', 'true');
      fetch('/shuxrat-ogli-v2/api/buyurtma', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ism: ism.value, tel: tel.value, korxona: qiymat('korxona'), manzil: qiymat('manzil'), mahsulotlar: [f.dataset.mahsulot],
          izoh: qiymat('izoh'), til: document.documentElement.lang, veb_sayt: qiymat('veb_sayt') }),
      }).then(function (r) {
        if (!r.ok) throw new Error(String(r.status));
        [].forEach.call(f.querySelectorAll('.ariza-maydonlar, button[type=submit]'), function (el) { el.hidden = true; });
        natija.hidden = true; korsat(yuborildi);
      }).catch(function () { korsat(natija); })
        .finally(function () { tugma.disabled = false; tugma.removeAttribute('aria-busy'); });
    });
    f.querySelector('.ariza-nusxa').addEventListener('click', function () {
      if (navigator.clipboard) navigator.clipboard.writeText(f.querySelector('.ariza-matn').textContent)
        .then(function () { f.querySelector('.ariza-nusxalandi').hidden = false; }, function () {});
    });
  });
})();
