// Admin paneldagi barcha <select> lar o'rniga brend uslubidagi o'z ro'yxatimiz.
// Asl <select> forma uchun yashirin qoladi (qiymat shu orqali yuboriladi); klaviatura: ↑ ↓ Home End Enter Esc, harf bilan qidirish.
(function () {
  var ochiq = null;
  function yop() { if (ochiq) { ochiq.root.classList.remove('ochiq'); ochiq.btn.setAttribute('aria-expanded', 'false'); ochiq = null; } }
  document.addEventListener('click', function (e) { if (ochiq && !ochiq.root.contains(e.target)) yop(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && ochiq) { var b = ochiq.btn; yop(); b.focus(); } });

  var n = 0;
  document.querySelectorAll('select:not([multiple]):not([data-oddiy])').forEach(function (sel) {
    var id = 'tanlov-' + (++n);
    var root = document.createElement('div');
    root.className = 'tanlov-ro';
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'tanlov-tugma';
    btn.setAttribute('aria-haspopup', 'listbox'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', id);
    var lbl = sel.closest('label'), yorliq = lbl && lbl.querySelector('span');
    if (sel.getAttribute('aria-label')) btn.setAttribute('aria-label', sel.getAttribute('aria-label'));
    else if (yorliq) btn.setAttribute('aria-label', yorliq.textContent.trim());
    var matn = document.createElement('span'); matn.className = 'tanlov-matn';
    btn.appendChild(matn);
    btn.insertAdjacentHTML('beforeend', '<svg viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1.5l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>');
    var ro = document.createElement('ul');
    ro.className = 'tanlov-royxat'; ro.id = id; ro.setAttribute('role', 'listbox'); ro.tabIndex = -1;
    var bandlar = [].map.call(sel.options, function (o, i) {
      var li = document.createElement('li');
      li.setAttribute('role', 'option'); li.textContent = o.textContent; li.dataset.i = i;
      li.addEventListener('click', function () { tanla(i); yop(); btn.focus(); });
      li.addEventListener('mousemove', function () { belgila(i); });
      ro.appendChild(li); return li;
    });
    var faol = sel.selectedIndex;
    function belgila(i) {
      faol = i;
      bandlar.forEach(function (b, j) { b.classList.toggle('faol', j === i); });
      if (bandlar[i]) bandlar[i].scrollIntoView({ block: 'nearest' });
    }
    function chiz() {
      matn.textContent = sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].textContent : '';
      bandlar.forEach(function (b, j) { b.setAttribute('aria-selected', String(j === sel.selectedIndex)); });
    }
    function tanla(i) {
      if (sel.selectedIndex !== i) { sel.selectedIndex = i; sel.dispatchEvent(new Event('change', { bubbles: true })); }
      chiz();
    }
    function och() {
      yop(); ochiq = { root: root, btn: btn };
      root.classList.add('ochiq'); btn.setAttribute('aria-expanded', 'true');
      var r = btn.getBoundingClientRect();
      root.classList.toggle('tepaga', innerHeight - r.bottom < 260 && r.top > innerHeight - r.bottom);
      belgila(sel.selectedIndex);
    }
    btn.addEventListener('click', function () { root.classList.contains('ochiq') ? yop() : och(); });
    var izla = '', izlaT = 0;
    btn.addEventListener('keydown', function (e) {
      var ochilgan = root.classList.contains('ochiq');
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!ochilgan) { och(); return; }
        belgila(Math.max(0, Math.min(bandlar.length - 1, faol + (e.key === 'ArrowDown' ? 1 : -1))));
      } else if (e.key === 'Home' && ochilgan) { e.preventDefault(); belgila(0); }
      else if (e.key === 'End' && ochilgan) { e.preventDefault(); belgila(bandlar.length - 1); }
      else if ((e.key === 'Enter' || e.key === ' ') && ochilgan) { e.preventDefault(); tanla(faol); yop(); }
      else if (e.key === 'Tab' && ochilgan) { yop(); }
      else if (e.key.length === 1 && /\S/.test(e.key)) {
        clearTimeout(izlaT); izla += e.key.toLowerCase(); izlaT = setTimeout(function () { izla = ''; }, 700);
        var t = bandlar.findIndex(function (b) { return b.textContent.toLowerCase().indexOf(izla) === 0; });
        if (t >= 0) { if (ochilgan) belgila(t); else tanla(t); }
      }
    });
    sel.addEventListener('change', chiz);
    sel.classList.add('tanlov-asl'); sel.tabIndex = -1; sel.setAttribute('aria-hidden', 'true');
    sel.parentNode.insertBefore(root, sel);
    root.appendChild(btn); root.appendChild(ro); root.appendChild(sel);
    chiz();
  });
})();

// Fayl tanlash: brauzerning «Choose File» o'rniga o'zbekcha quti; asl input ustida shaffof turadi (bosish, sudrab tashlash, klaviatura ishlaydi)
(function () {
  document.querySelectorAll('input[type=file]:not([hidden])').forEach(function (inp) {
    var quti = document.createElement('span');
    quti.className = 'fayl-tanla';
    quti.innerHTML = '<span class="fayl-tanla-tugma"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4m0 0L7 9m5-5 5 5M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Fayl tanlash</span><span class="fayl-tanla-nom">yoki shu yerga sudrab tashlang</span>';
    var nom = quti.querySelector('.fayl-tanla-nom');
    inp.parentNode.insertBefore(quti, inp);
    quti.appendChild(inp);
    inp.addEventListener('change', function () {
      var f = inp.files && inp.files[0];
      quti.classList.toggle('tanlangan', !!f);
      nom.textContent = f ? f.name + ' · ' + (f.size > 1048576 ? (f.size / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(f.size / 1024)) + ' KB') : 'yoki shu yerga sudrab tashlang';
    });
    ['dragenter', 'dragover'].forEach(function (t) { inp.addEventListener(t, function () { quti.classList.add('ustida'); }); });
    ['dragleave', 'drop'].forEach(function (t) { inp.addEventListener(t, function () { quti.classList.remove('ustida'); }); });
  });
})();
