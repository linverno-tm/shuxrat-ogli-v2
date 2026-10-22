// «Joʻja buyurtmasi»: hisoblagich va ariza (src/components/JojaSahifa.astro).
// Koʻrsatkichlar — broylerda oʻrtacha oraliq: 38–42 kun, ozuqa 4–4,5 kg/bosh (start 0,25 / oʻsish 1,25 / yakuniy 2,75),
// tirik vazn 2,2–2,6 kg, saqlanish 95–97 %, 1 m² ga 10–12 bosh. Natija doim oraliq koʻrinishida.
(function () {
  var f = document.getElementById('joja-forma');
  if (!f) return;
  var y = f.querySelector('[data-yozuv]').dataset;
  var surgich = document.querySelector('[data-son-surgich]'), sonEl = document.querySelector('[data-son]'), sanaEl = document.querySelector('[data-sana]');
  var til = document.documentElement.lang || 'uz';
  var nbsp = ' ';
  function son(v) { return Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, nbsp); }
  function kasr(v) { return (Math.round(v * 10) / 10).toString().replace('.', til === 'en' ? '.' : ','); }
  function tonna(kg) { return kg >= 1000 ? kasr(kg / 1000) + nbsp + y.tonna : son(kg) + nbsp + 'kg'; }
  // oraliq: «10–11,3 t» (birlik bir marta); birliklar har xil bo'lsa — «800 kg–1,1 t»
  function oraliq(a, b, fn) {
    var x = fn(a), z = fn(b);
    if (x === z) return x;
    var bx = x.split(nbsp), bz = z.split(nbsp);
    return bx.length === 2 && bz.length === 2 && bx[1] === bz[1] ? bx[0] + '–' + bz[0] + nbsp + bx[1] : x + '–' + z;
  }
  // o'zbekcha oy nomlari brauzerlarda to'liq yo'q — o'zimiz yozamiz
  var OYLAR = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
  function sanaMatn(d) { return til === 'uz' ? d.getDate() + '-' + OYLAR[d.getMonth()] : d.toLocaleDateString(til, { day: 'numeric', month: 'long' }); }
  // bir oy ichida: «6–10-dekabr», «6–10 декабря», «December 6–10»; aks holda ikki to'liq sana
  function sanaOraliq(a, b) {
    if (a.getMonth() !== b.getMonth()) return sanaMatn(a) + ' – ' + sanaMatn(b);
    if (til === 'en') return a.toLocaleDateString('en', { month: 'long' }) + ' ' + a.getDate() + '–' + b.getDate();
    return a.getDate() + '–' + sanaMatn(b);
  }
  function qoy(k, v) { var e = document.querySelector('[data-n="' + k + '"]'); if (e) e.textContent = v; }

  // standart sana — bir haftadan keyin
  var bugun = new Date(); bugun.setHours(0, 0, 0, 0);
  var hafta = new Date(bugun.getTime() + 7 * 864e5);
  sanaEl.min = bugun.toISOString().slice(0, 10);
  if (!sanaEl.value) sanaEl.value = new Date(hafta.getTime() - hafta.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);

  function nechta() { var n = parseInt(sonEl.value.replace(/\D/g, ''), 10); return isFinite(n) ? n : 0; }
  var xulosa = f.querySelector('[data-xulosa]');
  function hisobla() {
    var n = Math.max(0, nechta());
    if (n < 50) { ['soyish', 'ozuqa', 'vazn', 'joy', 'b1', 'b2', 'b3'].forEach(function (k) { qoy(k, '—'); }); xulosa.textContent = ''; return; }
    var s = sanaEl.value ? new Date(sanaEl.value + 'T00:00') : null;
    qoy('soyish', s ? sanaOraliq(new Date(s.getTime() + 38 * 864e5), new Date(s.getTime() + 42 * 864e5)) : '38–42');
    qoy('ozuqa', oraliq(n * 4, n * 4.5, tonna));
    qoy('vazn', oraliq(n * 0.95 * 2.2, n * 0.97 * 2.6, tonna));
    qoy('joy', oraliq(n / 12, n / 10, function (v) { return son(v) + nbsp + y.m2; }));
    qoy('b1', tonna(n * 0.25)); qoy('b2', tonna(n * 1.25)); qoy('b3', tonna(n * 2.75));
    xulosa.textContent = y.mahsulot + ': ' + son(n) + nbsp + y.boshBirlik + (s ? ' · ' + y.sana + ': ' + sanaMatn(s) : '');
  }
  surgich.addEventListener('input', function () { sonEl.value = son(+surgich.value); hisobla(); });
  sonEl.addEventListener('input', function () {
    var n = nechta(); sonEl.value = n ? son(n) : '';
    if (n >= 50 && n <= 20000) surgich.value = n;
    hisobla();
  });
  sanaEl.addEventListener('change', hisobla);
  hisobla();

  // telefon: «+998 90 123 45 67»
  var tel = f.elements.tel;
  tel.addEventListener('input', function (e) {
    if (e.inputType && e.inputType.indexOf('delete') === 0) return;
    var r = tel.value.replace(/\D/g, '');
    if (!r) return;
    if (r.length <= 9 && r.indexOf('998') !== 0) r = '998' + r;
    if (r.indexOf('998') !== 0) { tel.value = '+' + r; return; }
    r = r.slice(0, 12);
    tel.value = '+' + [r.slice(0, 3), r.slice(3, 5), r.slice(5, 8), r.slice(8, 10), r.slice(10, 12)].filter(Boolean).join(' ');
  });

  var xato = f.querySelector('.ariza-xato'), natija = f.querySelector('.ariza-natija'), yuborildi = f.querySelector('.ariza-yuborildi');
  var korsat = function (el) { el.hidden = false; el.focus(); el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); };
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var ism = f.elements.ism, telOk = tel.value.replace(/\D/g, '').length >= 9, n = nechta();
    ism.setAttribute('aria-invalid', String(!ism.value.trim())); tel.setAttribute('aria-invalid', String(!telOk));
    if (!ism.value.trim() || !telOk || n < 50) { xato.hidden = false; (!ism.value.trim() ? ism : !telOk ? tel : sonEl).focus(); return; }
    xato.hidden = true;
    var hajm = son(n).replace(/ /g, ' ') + ' ' + y.boshBirlik;
    var sana = sanaEl.value ? y.sana + ': ' + sanaMatn(new Date(sanaEl.value + 'T00:00')) : '';
    var izoh = [sana, f.elements.izoh.value.trim()].filter(Boolean).join('. ');
    var matn = [y.bosh + ' — Shuxrat oʻgʻli', '', ism.value.trim(), tel.value.trim(), f.elements.manzil.value.trim(),
      y.mahsulot + ': ' + hajm, izoh].filter(Boolean).join('\n');
    f.querySelector('.ariza-matn').textContent = matn;
    f.querySelector('.ariza-sms').href = 'sms:' + SOZLAMA.telefon + '?body=' + encodeURIComponent(matn);
    var tg = f.querySelector('.ariza-tg');
    if (SOZLAMA.telegram) { tg.href = 'https://t.me/' + SOZLAMA.telegram + '?text=' + encodeURIComponent(matn); tg.hidden = false; }
    var tugma = f.querySelector('button[type=submit]');
    tugma.disabled = true; tugma.setAttribute('aria-busy', 'true');
    fetch('/shuxrat-ogli-v2/api/buyurtma', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ism: ism.value, tel: tel.value, manzil: f.elements.manzil.value, mahsulotlar: [y.mahsulot], hajm: hajm, izoh: izoh, til: til, veb_sayt: f.elements.veb_sayt.value }),
    }).then(function (r) {
      if (!r.ok) throw new Error(String(r.status));
      [].forEach.call(f.querySelectorAll('.ariza-maydonlar, .joja-xulosa, button[type=submit]'), function (el) { el.hidden = true; });
      natija.hidden = true; korsat(yuborildi);
    }).catch(function () { korsat(natija); })
      .finally(function () { tugma.disabled = false; tugma.removeAttribute('aria-busy'); });
  });
  f.querySelector('.ariza-nusxa').addEventListener('click', function () {
    var m = f.querySelector('.ariza-matn').textContent;
    if (navigator.clipboard) navigator.clipboard.writeText(m).then(function () { f.querySelector('.ariza-nusxalandi').hidden = false; }, function () {});
  });
})();
