// Telefon menyusi, sarlavha soyasi, joriy yil
(function () {
  var tugma = document.querySelector('.menyu-tugma');
  var menyu = document.getElementById('menyu');
  var sarlavha = document.querySelector('.sarlavha');

  function yop() {
    menyu.classList.remove('ochiq');
    tugma.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('menyu-ochiq');
  }
  tugma.addEventListener('click', function () {
    // telefon menyusi sarlavha ostidan ekran oxirigacha (100dvh − sarlavha)
    menyu.style.setProperty('--menyu-h', (window.innerHeight - sarlavha.getBoundingClientRect().bottom) + 'px');
    var ochiq = menyu.classList.toggle('ochiq');
    tugma.setAttribute('aria-expanded', String(ochiq));
    document.documentElement.classList.toggle('menyu-ochiq', ochiq);
  });
  menyu.addEventListener('click', function (e) { if (e.target.closest('a')) yop(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') yop(); });

  function suril() { sarlavha.classList.toggle('surilgan', window.scrollY > 8); }
  window.addEventListener('scroll', suril, { passive: true });
  suril();

  document.getElementById('yil').textContent = new Date().getFullYear();

  // Kirish animatsiyasi tugashi yoki o'tkazib yuborilishi
  var html = document.documentElement;
  if (html.classList.contains('kirish-bor')) {
    try { sessionStorage.setItem('kirish', '1'); } catch (e) {}
    var kirish = document.querySelector('.kirish');
    var tugadi = false;
    var tugat = function () {
      if (tugadi) return;
      tugadi = true;
      html.classList.add('kirish-tugadi');
      setTimeout(function () { kirish.remove(); }, 700);
    };
    setTimeout(tugat, 3800);
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (t) {
      window.addEventListener(t, tugat, { once: true, passive: true });
    });
  }
})();

// Sozlamalar: mijoz ma'lumoti kelganda shu yerni to'ldiring
// Sozlamalar sahifaning o'zida (window.SOZLAMA) keladi — admin paneldagi «Sozlamalar»dan o'zgaradi
var SOZLAMA = Object.assign({
  telefon: '+998501765025', telegram: '', instagram: '',
  // Yandex Maps JS API 2.1 kaliti — Yandex kabinetida sayt domeniga cheklang
  yandexKalit: '868c338e-c07c-4bf9-9adc-8f86a7625381',
  jonliXarita: true,
  xarita: { lat: 40.595514, lng: 72.239171, zoom: 13 }
}, window.SOZLAMA || {});

(function () {
  var html = document.documentElement;

  // ?toldir — mijozdan keladigan ma'lumot joylarini ko'rsatadi
  var toldir = /[?&]toldir\b/.test(location.search);
  if (toldir) html.classList.add('toldir');

  // Ijtimoiy tarmoqlar
  [['ijt-tg', SOZLAMA.telegram && 'https://t.me/' + SOZLAMA.telegram],
   ['ijt-ig', SOZLAMA.instagram && 'https://instagram.com/' + SOZLAMA.instagram]].forEach(function (x) {
    var a = document.querySelector('.' + x[0]);
    if (!a) return;
    if (x[1]) { a.href = x[1]; a.hidden = false; }
    else if (toldir) a.hidden = false;
  });

  // Ulgurji ariza: matnni tayyorlab, SMS / Telegram / nusxa orqali yuborish
  var forma = document.getElementById('ariza');
  if (!forma) return;
  var xato = forma.querySelector('.ariza-xato');
  var natija = forma.querySelector('.ariza-natija');
  var matnQuti = forma.querySelector('.ariza-matn');
  var sms = forma.querySelector('.ariza-sms');
  var tg = forma.querySelector('.ariza-tg');
  var nusxa = forma.querySelector('.ariza-nusxa');
  var nusxalandi = forma.querySelector('.ariza-nusxalandi');

  // Raqam filtrlari: telefon → «+998 99 107 55 08», katta sonlar → «1 000 000»
  function telFormat(v) {
    var r = v.replace(/\D/g, '');
    if (!r) return v.trim().charAt(0) === '+' ? '+' : '';
    if (r.indexOf('998998') === 0) r = r.slice(3);                  // avtomatik +998 dan keyin yana 998 yozilsa
    if (r.length <= 9 && r.indexOf('998') !== 0) r = '998' + r;   // 991075508 → 998991075508
    if (r.indexOf('998') !== 0) return '+' + r;                     // boshqa davlat — faqat «+»
    r = r.slice(0, 12);
    var q = [r.slice(0, 3), r.slice(3, 5), r.slice(5, 8), r.slice(8, 10), r.slice(10, 12)];
    return '+' + q.filter(Boolean).join(' ');
  }
  function sonFormat(v) {
    // Guruh bo'shlig'i — NBSP (\u00A0): ko'rinishi oddiy bo'shliq, lekin filtr uni o'zinikidek taniydi,
    // shuning uchun yozish va o'chirishda son har doim to'g'ri qayta guruhlanadi: «1000000» → «1 000 000».
    return v.replace(/\d(?:[\d\u00A0]*\d)?/g, function (s) {
      var r = s.replace(/\u00A0/g, '');
      return r.length < 4 ? r : r.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
    });
  }
  function filtr(el, fn, faqatYozganda) {
    el.addEventListener('input', function (e) {
      if (faqatYozganda && e.inputType && e.inputType.indexOf('delete') === 0) return;  // o'chirishga xalaqit bermasin
      var oxirida = el.selectionStart === el.value.length;
      var yangi = fn(el.value);
      if (yangi !== el.value) {
        el.value = yangi;
        if (oxirida) el.setSelectionRange(yangi.length, yangi.length);
      }
    });
    el.addEventListener('blur', function () { el.value = fn(el.value); });
  }
  filtr(forma.elements.tel, telFormat, true);
  filtr(forma.elements.hajm, sonFormat);
  filtr(forma.elements.izoh, sonFormat);

  function yorliq(el) {
    var l = el.closest('label');
    var s = l && l.querySelector('span');
    return s ? s.textContent.trim() : el.name;
  }

  forma.addEventListener('submit', function (e) {
    e.preventDefault();
    var ism = forma.elements.ism, tel = forma.elements.tel;
    var telOk = tel.value.replace(/\D/g, '').length >= 9;
    ism.setAttribute('aria-invalid', String(!ism.value.trim()));
    tel.setAttribute('aria-invalid', String(!telOk));
    if (!ism.value.trim() || !telOk) {
      xato.hidden = false;
      (!ism.value.trim() ? ism : tel).focus();
      return;
    }
    xato.hidden = true;

    var qatorlar = [forma.querySelector('#ariza-sarlavha').textContent.trim() + ' — Shuxrat oʻgʻli', ''];
    ['ism', 'tel', 'korxona', 'manzil'].forEach(function (n) {
      var el = forma.elements[n];
      if (el.value.trim()) qatorlar.push(yorliq(el) + ': ' + el.value.trim());
    });
    var tanlangan = [].slice.call(forma.querySelectorAll('input[name="mahsulot"]:checked'))
      .map(function (c) { return c.nextElementSibling.textContent.trim(); });
    if (tanlangan.length) qatorlar.push(forma.querySelector('.tanlov legend').textContent.trim() + ' ' + tanlangan.join(', '));
    // hajm: miqdor + birlik + davr (masalan «500 kg, haftasiga»)
    var hajmEl = forma.elements.hajm, hajmMatn = hajmEl.value.trim();
    if (hajmMatn && forma.elements.birlik) {
      var tanla = function (s) { return s.options[s.selectedIndex].textContent.trim(); };
      hajmMatn += ' ' + tanla(forma.elements.birlik) + ', ' + tanla(forma.elements.davr);
    }
    if (hajmMatn) qatorlar.push(forma.querySelector('.hajm-guruh span').textContent.trim() + ': ' + hajmMatn);
    if (forma.elements.izoh.value.trim()) qatorlar.push(yorliq(forma.elements.izoh) + ': ' + forma.elements.izoh.value.trim());
    var matn = qatorlar.join('\n');

    matnQuti.textContent = matn;
    sms.href = 'sms:' + SOZLAMA.telefon + '?body=' + encodeURIComponent(matn);
    if (SOZLAMA.telegram) {
      tg.href = 'https://t.me/' + SOZLAMA.telegram + '?text=' + encodeURIComponent(matn);
      tg.hidden = false;
    }
    nusxalandi.hidden = true;

    // Avval serverga yuboramiz; ulanmasa — SMS / nusxa zaxira usuli
    var tugma = forma.querySelector('button[type=submit]');
    var yuborildi = forma.querySelector('.ariza-yuborildi');
    var korsat = function (el) { el.hidden = false; el.focus(); el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); };
    tugma.disabled = true; tugma.setAttribute('aria-busy', 'true');
    fetch('/shuxrat-ogli-v2/api/buyurtma', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ism: ism.value, tel: tel.value, korxona: forma.elements.korxona.value, manzil: forma.elements.manzil.value,
        mahsulotlar: tanlangan, hajm: hajmMatn, izoh: forma.elements.izoh.value,
        til: document.documentElement.lang, veb_sayt: forma.elements.veb_sayt ? forma.elements.veb_sayt.value : '',
      }),
    }).then(function (r) {
      if (!r.ok) throw new Error(String(r.status));
      [].forEach.call(forma.querySelectorAll('.ariza-maydonlar, .ariza-xato, button[type=submit]'), function (el) { el.hidden = true; });
      natija.hidden = true; korsat(yuborildi);
    }).catch(function () { korsat(natija); })
      .finally(function () { tugma.disabled = false; tugma.removeAttribute('aria-busy'); });
  });

  nusxa.addEventListener('click', function () {
    var matn = matnQuti.textContent;
    var tayyor = function () { nusxalandi.hidden = false; };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(matn).then(tayyor, function () { belgila(); });
    } else belgila();
    function belgila() {
      var r = document.createRange(); r.selectNodeContents(matnQuti);
      var s = getSelection(); s.removeAllRanges(); s.addRange(r);
      try { document.execCommand('copy'); tayyor(); } catch (e) {}
    }
  });
})();

// Xarita: Yandex (brend ranglarida) yoki kalitsiz brend kartochkasi
(function () {
  var quti = document.querySelector('.sotuv-xarita');
  if (!quti) return;
  var x = SOZLAMA.xarita;
  var och = quti.querySelector('.xarita-och'), yol = quti.querySelector('.xarita-yol');
  if (och) och.href = 'https://yandex.uz/maps/?pt=' + x.lng + ',' + x.lat + '&z=16&l=map';
  if (yol) yol.href = 'https://yandex.uz/maps/?rtext=~' + x.lat + ',' + x.lng + '&rtt=auto';
  // jonliXarita: false bo'lsa Yandex yuklanmaydi — faqat brend kartochkasi (Yandex belgisi xaritada majburiy, uni yashirish shartlarga zid)
  if (!SOZLAMA.yandexKalit || !SOZLAMA.jonliXarita) return;

  var til = { uz: 'uz_UZ', ru: 'ru_RU', en: 'en_US' }[document.documentElement.lang] || 'uz_UZ';
  var pin = quti.querySelector('.xarita-nuqta img').getAttribute('src').replace('belgi.svg', 'xarita-nuqta.svg');
  var yuklandi = false;
  function yukla() {
    if (yuklandi) return; yuklandi = true;
    var s = document.createElement('script');
    s.src = 'https://api-maps.yandex.ru/2.1/?apikey=' + encodeURIComponent(SOZLAMA.yandexKalit) + '&lang=' + til;
    s.onload = function () { ymaps.ready(chiz); };
    document.head.appendChild(s);
  }
  // xarita faqat ekranga yaqinlashganda yuklanadi
  if ('IntersectionObserver' in window) {
    var k = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { k.disconnect(); yukla(); } }, { rootMargin: '400px' });
    k.observe(quti);
  } else yukla();

  function chiz() {
    var el = document.createElement('div');
    el.className = 'xarita-jonli';
    quti.appendChild(el);
    var map = new ymaps.Map(el, { center: [x.lat, x.lng], zoom: x.zoom, controls: ['zoomControl'] },
      { suppressMapOpenBlock: true, yandexMapDisablePoiInteractivity: true });
    map.behaviors.disable('scrollZoom');  // sahifa aylantirilganda xarita kattalashmasin
    map.geoObjects.add(new ymaps.Placemark([x.lat, x.lng], {}, {
      iconLayout: 'default#image', iconImageHref: pin,
      iconImageSize: [48, 60], iconImageOffset: [-24, -60]
    }));
    // hamkor do'konlar (data-nuqtalar) — kichik belgilar, bosilsa nomi va manzili; xarita hammasini sig'diradi
    var nuqtalar = [];
    try { nuqtalar = JSON.parse(quti.dataset.nuqtalar || '[]'); } catch (e) {}
    var toza = function (v) { var d = document.createElement('div'); d.textContent = v || ''; return d.innerHTML; };
    nuqtalar.forEach(function (n) {
      map.geoObjects.add(new ymaps.Placemark([n.lat, n.lng], { balloonContentHeader: toza(n.nom), balloonContentBody: toza(n.matn), hintContent: toza(n.nom) },
        { preset: 'islands#blueCircleDotIcon', iconColor: '#1E3782' }));
    });
    if (nuqtalar.length) map.setBounds(map.geoObjects.getBounds(), { checkZoomRange: true, zoomMargin: 48 });
    var a = document.createElement('a');
    a.className = 'xarita-ochish'; a.href = och.href; a.target = '_blank'; a.rel = 'noopener';
    a.textContent = och.textContent;
    quti.appendChild(a);
    quti.classList.add('jonli');
    // Yandex mualliflik/shartlar havolalarida matn yo'q (logo) — ko'rinishini o'zgartirmay, ekran o'quvchi uchun nom beramiz
    var nomla = function () { el.querySelectorAll('a:not([aria-label])').forEach(function (h) { if (!h.textContent.trim()) h.setAttribute('aria-label', 'Yandex'); }); };
    nomla(); new MutationObserver(nomla).observe(el, { childList: true, subtree: true });
  }
})();

// Telefon raqamlari: telefonda — to'g'ridan-to'g'ri qo'ng'iroq oynasi; kompyuterda — raqam, nusxalash va QR
(function () {
  var oyna = document.querySelector('.qongiroq-oyna');
  if (!oyna || !oyna.showModal) return;
  var mobil = matchMedia('(pointer: coarse)').matches || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  var nusxalandi = oyna.querySelector('.qongiroq-nusxalandi');
  var raqamEl = oyna.querySelector('.qongiroq-raqam'), qr = oyna.querySelector('.qongiroq-qr');
  var asosiyHref = raqamEl.getAttribute('href'), asosiyMatn = raqamEl.textContent;
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="tel:"]');
    if (!a || mobil || a.closest('.qongiroq-oyna')) return;
    e.preventDefault();
    // boshqa raqam (masalan, masʼulning) bosilsa — oynada oʻsha raqam; QR faqat asosiy raqam uchun
    var boshqa = a.getAttribute('href') !== asosiyHref;
    raqamEl.setAttribute('href', boshqa ? a.getAttribute('href') : asosiyHref);
    raqamEl.textContent = boshqa ? (a.dataset.raqam || a.getAttribute('href').slice(4)) : asosiyMatn;
    if (qr) qr.hidden = boshqa;
    nusxalandi.hidden = true;
    oyna.showModal();
  });
  oyna.querySelector('.qongiroq-yop').addEventListener('click', function () { oyna.close(); });
  oyna.addEventListener('click', function (e) { if (e.target === oyna) oyna.close(); });  // fonga bosilsa yopiladi
  oyna.querySelector('.qongiroq-nusxa').addEventListener('click', function () {
    var raqam = oyna.querySelector('.qongiroq-raqam').textContent.trim();
    var tayyor = function () { nusxalandi.hidden = false; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(raqam).then(tayyor, function () {});
  });
})();


// Video muqovasi (data-poster) va pleyer metama'lumoti ekranga yaqinlashganda yuklanadi — bosh ekran tezroq chiqsin.
(function () {
  var v = document.querySelectorAll('video[data-poster]');
  if (!v.length) return;
  function qoy(el) {
    if (el.dataset.poster) el.poster = el.dataset.poster;
    el.removeAttribute('data-poster');
    if (el.closest('.pleyer') && el.preload === 'none') el.preload = 'metadata';
  }
  if (!('IntersectionObserver' in window)) { v.forEach(qoy); return; }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); qoy(e.target); } });
  }, { rootMargin: '600px 600px' });
  v.forEach(function (el) { io.observe(el); });
})();

// Jonli videolar (.jonli-video, filmdan qisqa ovozsiz sahnalar): ko'rinishga kirganda o'ynaydi, chiqqanda to'xtaydi.
// Kamroq harakat tanlangan yoki trafik tejash yoqilgan bo'lsa — faqat muqova kadri turadi.
// Bosh sahifadagi tovuq (.hb-tovuq) ozgina ko'rinishi bilan o'ynaydi (telefonda u ekran pastida, qisman ko'rinadi).
// ?video — ekranda video holati yozuvi (haqiqiy telefonda tekshirish uchun).
(function () {
  var v = [].slice.call(document.querySelectorAll('video.jonli-video'));
  var tekshir = /[?&]video\b/.test(location.search);
  var rm = matchMedia('(prefers-reduced-motion: reduce)').matches, tejash = !!(navigator.connection && navigator.connection.saveData);
  if (tekshir) {
    var b = document.createElement('pre');
    b.style.cssText = 'position:fixed;left:8px;right:8px;bottom:8px;z-index:99999;margin:0;padding:8px 10px;border-radius:10px;background:rgba(0,0,0,.82);color:#fff;font:12px/1.4 ui-monospace,monospace;white-space:pre-wrap;pointer-events:none';
    document.body.appendChild(b);
    setInterval(function () {
      b.textContent = 'harakatni kamaytirish: ' + rm + ' · tejash: ' + tejash + ' · IO: ' + ('IntersectionObserver' in window) + '\n' + v.map(function (el, i) {
        var r = el.getBoundingClientRect();
        return i + ': ' + (el.paused ? 'TURIBDI' : 'oynayapti') + ' t=' + el.currentTime.toFixed(1) + ' rs=' + el.readyState + ' ns=' + el.networkState +
          ' xato=' + (el.error ? el.error.code : '-') + ' kor=' + (el._korinadi ? 'ha' : 'yoq') + ' ' + (el.currentSrc || '').split('/shuxrat-ogli-v2/').pop() +
          ' ' + Math.round(r.width) + 'x' + Math.round(r.height) + (el._rad ? ' rad:' + el._rad : '');
      }).slice(0, 3).join('\n');
    }, 500);
  }
  if (!v.length || !('IntersectionObserver' in window) || rm || tejash) return;
  function oyna(el) {
    if (el.preload !== 'auto') el.preload = 'auto';
    el.muted = true;                                    // iOS: ovozsiz bo'lsagina o'zi o'ynaydi
    var p = el.play(); if (p && p.catch) p.catch(function (e) { el._rad = e && e.name; });
  }
  function kuzatgich(chegara) {
    return new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var el = e.target;
        el._korinadi = e.isIntersecting;
        if (e.isIntersecting) oyna(el);
        else if (!el.paused) el.pause();
      });
    }, { threshold: chegara });
  }
  var oddiy = kuzatgich(0.35), bosh = kuzatgich(0.01);
  // Safari ba'zan `loop`ni bajarmay oxirida to'xtab qoladi — ko'rinib turgan video tugasa yoki o'zi to'xtasa, boshidan qayta
  function qaytar() { var el = this; if (el._korinadi && !document.hidden) { if (el.ended || el.currentTime >= el.duration - 0.1) el.currentTime = 0; oyna(el); } }
  var boshlandi = false;
  function boshla() {
    if (boshlandi) return; boshlandi = true;
    v.forEach(function (el) {
      el.addEventListener('ended', qaytar);
      // biz faqat ko'rinmay qolganda to'xtatamiz — ko'rinib turganda to'xtasa (Safari tsikl oxirida), qayta boshlaymiz
      el.addEventListener('pause', function () { var el = this; setTimeout(function () { if (el.paused) qaytar.call(el); }, 60); });
      (el.closest('.hb-tovuq') ? bosh : oddiy).observe(el);
    });
  }
  // Telefon o'zi o'ynatishni to'ssa (quvvat tejash va h.k.) — ekranga birinchi tegishda ishga tushadi
  function tegish() { v.forEach(function (el) { if (el._korinadi && el.paused) oyna(el); }); }
  ['touchstart', 'touchend', 'pointerdown', 'click', 'scroll'].forEach(function (t) { addEventListener(t, tegish, { passive: true }); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) tegish(); });
  // asosiy surat birinchi yuklansin: sahifa yuklangach yoki ko'pi bilan 1,2 s dan keyin (qaysi biri oldin bo'lsa)
  if (document.readyState === 'complete') boshla();
  else { addEventListener('load', boshla, { once: true }); setTimeout(boshla, 1200); }
})();

// Kartalar: kompyuterda (sichqoncha bilan) yengil 3D egilish; telefonda va «harakatni kamaytirish»da yo'q
(function () {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.mahsulot-asosiy, .mahsulot, .taom-karta').forEach(function (el) {
    el.classList.add('egil');
    var r = null, kadr = 0, x = 0, y = 0;
    el.addEventListener('pointerenter', function () { r = el.getBoundingClientRect(); });
    el.addEventListener('pointermove', function (e) {
      if (!r) r = el.getBoundingClientRect();
      x = (e.clientX - r.left) / r.width - 0.5; y = (e.clientY - r.top) / r.height - 0.5;
      if (!kadr) kadr = requestAnimationFrame(function () { kadr = 0; el.style.setProperty('--ex', (y * -5).toFixed(2) + 'deg'); el.style.setProperty('--ey', (x * 7).toFixed(2) + 'deg'); });
    });
    el.addEventListener('pointerleave', function () { r = null; el.style.removeProperty('--ex'); el.style.removeProperty('--ey'); });
  });
})();

// Chop etish: [data-chop] tugmasi; chop etishda yopiq savol-javoblar ham ochiladi, keyin avvalgi holatiga qaytadi
document.addEventListener('click', function (e) { if (e.target.closest('[data-chop]')) { e.preventDefault(); window.print(); } });
addEventListener('beforeprint', function () { document.querySelectorAll('details:not([open])').forEach(function (d) { d.dataset.chopYopiq = '1'; d.open = true; }); });
addEventListener('afterprint', function () { document.querySelectorAll('details[data-chop-yopiq]').forEach(function (d) { d.open = false; delete d.dataset.chopYopiq; }); });

// Maydondan chiqqanda tekshiruv (Wroblewski: on blur): yozilgan majburiy maydon bo'sh yoki telefon qisqa bo'lsa — darrov qizil, tuzatilsa — qaytadi.
// Hali tegilmagan bo'sh maydon Tab bilan o'tilganda belgilanmaydi.
(function () {
  var MAYDON = 'form input[required], form textarea[required]';
  function togri(el) { return el.type === 'tel' ? el.value.replace(/\D/g, '').length >= 9 : !!el.value.trim(); }
  document.addEventListener('focusout', function (e) {
    var el = e.target;
    if (!el.matches || !el.matches(MAYDON) || (!el.value && !el.dataset.tegildi)) return;
    el.setAttribute('aria-invalid', String(!togri(el)));
  });
  document.addEventListener('input', function (e) {
    var el = e.target;
    if (!el.matches || !el.matches(MAYDON)) return;
    el.dataset.tegildi = '1';
    if (el.getAttribute('aria-invalid') === 'true' && togri(el)) el.setAttribute('aria-invalid', 'false');
  });
})();

// Tezkor aloqa tugmasi: birinchi ekrandan pastda ko'rinadi, pastki aloqa bo'limi ko'ringanda yashirinadi
(function () {
  var t = document.querySelector('.tez-aloqa'), past = document.getElementById('aloqa');
  if (!t || !past || !('IntersectionObserver' in window)) return;
  var pastda = false, kadr = 0;
  function yangila() { kadr = 0; document.documentElement.classList.toggle('tez-korin', scrollY > innerHeight * 0.8 && !pastda); }
  addEventListener('scroll', function () { if (!kadr) kadr = requestAnimationFrame(yangila); }, { passive: true });
  new IntersectionObserver(function (e) { pastda = e[0].isIntersecting; yangila(); }).observe(past);
})();
