// Chấm giải thích trên trang demo: đọc #demo-hints {page, items[{sel, title, text, mode}]}, gắn chấm số vào khối khớp
// `sel`, di chuột (máy có chuột) hoặc bấm thì hiện hộp. Bấm = ghim, bấm lại / Esc / bấm ra ngoài thì đóng. Màn hẹp hộp
// hiện ở đáy màn hình. Dải DEMO: "Trang này là gì?" + nút bật / tắt chấm (nhớ bằng localStorage, lỗi thì mặc định bật).
(function () {
  var src = document.getElementById('demo-hints');
  if (!src) return;
  var data;
  try { data = JSON.parse(src.textContent); } catch (e) { return; }
  var root = document.documentElement;
  var KEY = 'demoHints';
  var hover = matchMedia('(hover: hover) and (pointer: fine)').matches;

  var pop = document.createElement('div');
  pop.className = 'hint-pop';
  pop.id = 'hint-pop';
  pop.setAttribute('role', 'dialog');
  pop.hidden = true;
  pop.innerHTML = '<p class="hint-pop-title"><span class="hint-pop-no"></span><b></b></p><div class="hint-pop-text"></div>' +
    '<button type="button" class="hint-pop-close" aria-label="Đóng giải thích">&times;</button>';
  document.body.appendChild(pop);
  var current = null, pinned = false, timer;

  var place = function (anchor) {
    pop.hidden = false;
    if (root.clientWidth < 640) { pop.classList.add('is-sheet'); pop.style.left = pop.style.top = ''; return; }
    pop.classList.remove('is-sheet');
    // clientWidth / clientHeight: không tính thanh cuộn, để hộp không lấn sang thanh cuộn và đẻ cuộn ngang
    var vw = root.clientWidth, vh = root.clientHeight;
    var r = anchor.getBoundingClientRect(), w = pop.offsetWidth, h = pop.offsetHeight;
    var left = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), vw - w - 8);
    var top = r.bottom + 8;
    if (top + h > vh - 8 && r.top - h - 8 > 8) top = r.top - h - 8;
    pop.style.left = (left + scrollX) + 'px';
    pop.style.top = (top + scrollY) + 'px';
  };
  var show = function (anchor, no, title, text, pin) {
    clearTimeout(timer);
    if (current && current !== anchor) current.setAttribute('aria-expanded', 'false');
    current = anchor; pinned = pin;
    anchor.setAttribute('aria-expanded', 'true');
    pop.querySelector('.hint-pop-no').textContent = no;
    pop.querySelector('.hint-pop-no').hidden = !no;
    pop.querySelector('b').textContent = title;
    // text: chuỗi (một đoạn), mảng chuỗi (gạch đầu dòng), hoặc mảng [nhãn, giá trị] (khung note chung, giá trị là chuỗi
    // hoặc mảng chuỗi)
    var body = pop.querySelector('.hint-pop-text');
    body.textContent = '';
    if (Array.isArray(text) && Array.isArray(text[0])) {
      var dl = document.createElement('dl');
      dl.className = 'hint-fields';
      text.forEach(function (f) {
        var dt = document.createElement('dt'), dd = document.createElement('dd');
        dt.textContent = f[0];
        if (Array.isArray(f[1])) {
          var list = document.createElement('ul');
          f[1].forEach(function (t) { var li = document.createElement('li'); li.textContent = t; list.appendChild(li); });
          dd.appendChild(list);
        } else {
          dd.textContent = f[1];
        }
        if (/^(Có|Không)\b/.test(f[1])) dd.setAttribute('data-yn', f[1].slice(0, 2) === 'Có' ? 'yes' : 'no');
        dl.appendChild(dt); dl.appendChild(dd);
      });
      body.appendChild(dl);
    } else if (Array.isArray(text)) {
      var ul = document.createElement('ul');
      text.forEach(function (t) { var li = document.createElement('li'); li.textContent = t; ul.appendChild(li); });
      body.appendChild(ul);
    } else {
      body.textContent = text;
    }
    place(anchor);
  };
  var hide = function () {
    clearTimeout(timer);
    if (current) current.setAttribute('aria-expanded', 'false');
    current = null; pinned = false; pop.hidden = true;
  };
  var bind = function (btn, get) {
    btn.setAttribute('aria-controls', 'hint-pop');
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      if (current === btn && pinned) hide(); else { var g = get(); show(btn, g[0], g[1], g[2], true); }
    });
    if (hover) {
      btn.addEventListener('mouseenter', function () { if (!pinned) { var g = get(); show(btn, g[0], g[1], g[2], false); } });
      btn.addEventListener('mouseleave', function () { if (!pinned) timer = setTimeout(hide, 200); });
    }
  };
  pop.addEventListener('mouseenter', function () { clearTimeout(timer); });
  pop.addEventListener('mouseleave', function () { if (!pinned) timer = setTimeout(hide, 200); });
  pop.querySelector('.hint-pop-close').addEventListener('click', function () { var c = current; hide(); if (c) c.focus(); });
  document.addEventListener('click', function (e) { if (current && !pop.contains(e.target)) hide(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && current) { var c = current; hide(); c.focus(); }
  });
  addEventListener('resize', function () { if (current) place(current); });

  // Gắn chấm, rồi đánh số theo thứ tự xuất hiện trên trang
  var dots = [];
  (data.items || []).forEach(function (h) {
    var el = document.querySelector(h.sel);
    if (!el) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'hint-dot';
    b.setAttribute('aria-label', 'Giải thích: ' + h.title);
    if (h.mode === 'after') {
      b.classList.add('is-inline');
      el.insertAdjacentElement('afterend', b);
    } else if (h.mode === 'append') {
      b.classList.add('is-append');
      el.appendChild(b);
    } else {
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
      b.classList.add('is-corner');
      el.appendChild(b);
    }
    dots.push({ b: b, h: h });
  });
  dots.sort(function (x, y) { return x.b.compareDocumentPosition(y.b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1; });
  dots.forEach(function (d, i) {
    d.b.textContent = i + 1;
    bind(d.b, function () { return [String(i + 1), d.h.title, d.h.text]; });
  });

  var pageBtn = document.querySelector('[data-hint-page]');
  if (pageBtn && data.page) {
    pageBtn.hidden = false;
    bind(pageBtn, function () { return ['', data.page.title, data.page.text]; });
  }
  var tog = document.querySelector('[data-hints-toggle]');
  var setOn = function (on) {
    root.classList.toggle('hints-off', !on);
    if (tog) { tog.setAttribute('aria-pressed', String(on)); tog.querySelector('b').textContent = on ? 'Bật' : 'Tắt'; }
    try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch (e) {}
    if (!on && current && current.classList.contains('hint-dot')) hide();
  };
  var saved = 'on';
  try { saved = localStorage.getItem(KEY) || 'on'; } catch (e) {}
  if (tog && dots.length) { tog.hidden = false; tog.addEventListener('click', function () { setOn(root.classList.contains('hints-off')); }); }
  setOn(saved !== 'off' || !tog);
})();
