// Sana: brauzer taqvimi o'rniga o'zbekcha taqvim (kun.oy.yil). Qiymat asl nom bilan YYYY-MM-DD ko'rinishida yuboriladi.
// Admin panelda va saytdagi «Joʻja buyurtmasi»da ishlatiladi; min bo'lsa — undan oldingi kunlar tanlanmaydi.
(function () {
  var Y = {
    uz: { oy: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'], kun: ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'], bugun: 'Bugun', tozala: 'Tozalash', tanla: 'Sana tanlang', old: 'Oldingi oy', key: 'Keyingi oy' },
    ru: { oy: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'], kun: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'], bugun: 'Сегодня', tozala: 'Очистить', tanla: 'Выберите дату', old: 'Предыдущий месяц', key: 'Следующий месяц' },
    en: { oy: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], kun: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'], bugun: 'Today', tozala: 'Clear', tanla: 'Choose a date', old: 'Previous month', key: 'Next month' },
  }[document.documentElement.lang] || null;
  if (!Y) Y = { oy: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'], kun: ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'], bugun: 'Bugun', tozala: 'Tozalash', tanla: 'Sana tanlang', old: 'Oldingi oy', key: 'Keyingi oy' };
  var OYLAR = Y.oy, KUNLAR = Y.kun;
  function ikki(n) { return (n < 10 ? '0' : '') + n; }
  function iso(d) { return d.getFullYear() + '-' + ikki(d.getMonth() + 1) + '-' + ikki(d.getDate()); }
  function oqi(s) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ''); return m ? new Date(+m[1], m[2] - 1, +m[3]) : null; }
  var ochiq = null;
  function yop() { if (ochiq) { ochiq.classList.remove('ochiq'); ochiq.querySelector('.tanlov-tugma').setAttribute('aria-expanded', 'false'); ochiq = null; } }
  document.addEventListener('click', function (e) { if (ochiq && !ochiq.contains(e.target)) yop(); });

  document.querySelectorAll('input[type=date]').forEach(function (inp) {
    var root = document.createElement('div'); root.className = 'tanlov-ro sana-ro';
    var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'tanlov-tugma';
    btn.setAttribute('aria-haspopup', 'dialog'); btn.setAttribute('aria-expanded', 'false');
    var lbl = inp.closest('label'), yorliq = lbl && lbl.querySelector('span');
    if (yorliq) btn.setAttribute('aria-label', yorliq.textContent.trim());
    btn.innerHTML = '<span class="tanlov-matn"></span><svg viewBox="0 0 24 24" aria-hidden="true" style="width:18px;height:18px"><rect x="3.5" y="5" width="17" height="15" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3.5 10h17M8 3v4M16 3v4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    var matn = btn.querySelector('.tanlov-matn');
    var oyna = document.createElement('div'); oyna.className = 'tanlov-royxat taqvim'; oyna.setAttribute('role', 'dialog');
    oyna.innerHTML = '<div class="taqvim-bosh"><button type="button" data-q="-1" aria-label="' + Y.old + '">‹</button><b></b><button type="button" data-q="1" aria-label="' + Y.key + '">›</button></div>' +
      '<div class="taqvim-kunlar">' + KUNLAR.map(function (k) { return '<span>' + k + '</span>'; }).join('') + '</div><div class="taqvim-panjara"></div>' +
      '<div class="taqvim-past"><button type="button" data-a="bugun">' + Y.bugun + '</button>' + (inp.required ? '' : '<button type="button" data-a="tozala">' + Y.tozala + '</button>') + '</div>';
    var sarlavha = oyna.querySelector('b'), panjara = oyna.querySelector('.taqvim-panjara');
    var korish = new Date(), faol = new Date();
    function chizTugma() {
      var d = oqi(inp.value);
      matn.textContent = d ? ikki(d.getDate()) + '.' + ikki(d.getMonth() + 1) + '.' + d.getFullYear() : Y.tanla;
      root.classList.toggle('bosh', !d);
    }
    function chiz() {
      sarlavha.textContent = OYLAR[korish.getMonth()] + ' ' + korish.getFullYear();
      var siljish = (new Date(korish.getFullYear(), korish.getMonth(), 1).getDay() + 6) % 7;
      var soni = new Date(korish.getFullYear(), korish.getMonth() + 1, 0).getDate();
      var tanl = inp.value, bugun = iso(new Date()), f = iso(faol), h = '';
      for (var i = 0; i < siljish; i++) h += '<span></span>';
      for (var k = 1; k <= soni; k++) {
        var s = iso(new Date(korish.getFullYear(), korish.getMonth(), k));
        h += '<button type="button" tabindex="-1" data-s="' + s + '"' + (inp.min && s < inp.min ? ' disabled' : '') + (s === tanl ? ' aria-pressed="true"' : '') +
          (s === bugun ? ' class="bugun"' : '') + (s === f ? ' data-faol' : '') + '>' + k + '</button>';
      }
      panjara.innerHTML = h;
    }
    function tanla(s) { if (s && inp.min && s < inp.min) return; inp.value = s; inp.dispatchEvent(new Event('change', { bubbles: true })); chizTugma(); yop(); btn.focus(); }
    function och() {
      yop(); ochiq = root; root.classList.add('ochiq'); btn.setAttribute('aria-expanded', 'true');
      faol = oqi(inp.value) || new Date(); korish = new Date(faol.getFullYear(), faol.getMonth(), 1);
      var r = btn.getBoundingClientRect();
      root.classList.toggle('tepaga', innerHeight - r.bottom < 380 && r.top > innerHeight - r.bottom);
      chiz();
    }
    function sur(kun) {
      faol = new Date(faol.getFullYear(), faol.getMonth(), faol.getDate() + kun);
      korish = new Date(faol.getFullYear(), faol.getMonth(), 1); chiz();
    }
    btn.addEventListener('click', function () { root.classList.contains('ochiq') ? yop() : och(); });
    btn.addEventListener('keydown', function (e) {
      var o = root.classList.contains('ochiq');
      var q = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
      if (q && !o) { if (e.key === 'ArrowDown') { e.preventDefault(); och(); } }
      else if (q) { e.preventDefault(); sur(q); }
      else if ((e.key === 'PageUp' || e.key === 'PageDown') && o) {
        e.preventDefault(); faol = new Date(faol.getFullYear(), faol.getMonth() + (e.key === 'PageUp' ? -1 : 1), faol.getDate()); sur(0);
      }
      else if ((e.key === 'Enter' || e.key === ' ') && o) { e.preventDefault(); tanla(iso(faol)); }
      else if (e.key === 'Escape' && o) { e.preventDefault(); yop(); }
      else if (e.key === 'Tab' && o) yop();
    });
    oyna.addEventListener('click', function (e) {
      var t = e.target.closest('button'); if (!t) return;
      if (t.dataset.s) tanla(t.dataset.s);
      else if (t.dataset.q) { korish = new Date(korish.getFullYear(), korish.getMonth() + +t.dataset.q, 1); faol = new Date(korish); chiz(); }
      else if (t.dataset.a === 'bugun') tanla(iso(new Date()));
      else if (t.dataset.a === 'tozala') tanla('');
    });
    inp.type = 'hidden';
    inp.parentNode.insertBefore(root, inp);
    root.appendChild(btn); root.appendChild(oyna); root.appendChild(inp);
    chizTugma();
  });
})();
