/* Chuyển case cho vùng có nhiều trường hợp hiển thị (owner 22/10/2026). Nút nằm trong ngăn kéo bên phải, mở bằng nút
   "Đổi case" trên dải DEMO, để không chen vào giao diện trang.
   Vùng mang data-case-box="id" + data-cases='[{id,label,show:[part…],real}]', case đầu là case mở sẵn, real = case
   đúng rule. Phần tử con data-case-part="part" hiện khi part nằm trong show; phần tử bất kỳ data-case-ext="id:part" /
   "id:!part" hiện / ẩn theo part đó. data-case-class="cls:n" thêm class cho vùng khi có ≥ n part đang hiện.
   Tắt JS thì không có nút, trang giữ case thật. */
(function () {
  var TITLES = {
    promo: 'Dải máy mới / máy cũ', news: 'Bài viết liên quan', unsold: 'SP khai báo thêm',
    'pdp-promo': 'Cột phải: SP đang bán / máy cũ'
  };
  var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-case-box]'));
  var groups = [];

  boxes.forEach(function (box) {
    var id = box.getAttribute('data-case-box');
    var cases; try { cases = JSON.parse(box.getAttribute('data-cases')); } catch (e) { return; }
    if (!cases || cases.length < 2) return;
    var parts = Array.prototype.filter.call(box.querySelectorAll('[data-case-part]'), function (el) {
      return el.closest('[data-case-box]') === box;
    });
    var ext = document.querySelectorAll('[data-case-ext^="' + id + ':"]');
    var cls = (box.getAttribute('data-case-class') || '').split(':');
    // Vùng ẩn hết: để lại dòng ghi chú tại chỗ, cho biết trang thật không hiện vùng này
    var empty = document.createElement('p');
    empty.className = 'case-empty';
    empty.textContent = 'Trang thật không hiện vùng này.';
    empty.hidden = true;
    box.parentNode.insertBefore(empty, box);

    var g = { id: id, box: box, cases: cases, buttons: [] };
    g.pick = function (c) {
      parts.forEach(function (el) { el.hidden = c.show.indexOf(el.getAttribute('data-case-part')) < 0; });
      ext.forEach(function (el) {
        var rule = el.getAttribute('data-case-ext').split(':')[1], neg = rule.charAt(0) === '!';
        var on = c.show.indexOf(neg ? rule.slice(1) : rule) > -1;
        el.hidden = neg ? on : !on;
      });
      var visible = c.show.filter(function (p) {
        return parts.some(function (el) { return el.getAttribute('data-case-part') === p; });
      }).length;
      if (cls[0]) box.classList.toggle(cls[0], visible >= +(cls[1] || 1));
      var allParts = Array.prototype.every.call(box.children, function (el) {
        return el.hasAttribute('data-case-part') || el.classList.contains('hint-dot');
      });
      empty.hidden = !(allParts && !visible);
      g.buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-case') === c.id)); });
    };
    groups.push(g);
  });

  var open = document.querySelector('[data-case-open]');
  if (!groups.length || !open) { groups.forEach(function (g) { g.pick(g.cases[0]); }); return; }

  var drawer = document.createElement('aside');
  drawer.className = 'case-drawer';
  drawer.id = 'case-drawer';
  drawer.hidden = true;
  drawer.setAttribute('aria-label', 'Đổi case hiển thị');
  drawer.innerHTML = '<div class="cd-head"><b>Đổi case hiển thị</b>' +
    '<button type="button" class="cd-close" aria-label="Đóng">×</button></div>' +
    '<p class="cd-lead">Mỗi vùng có nhiều trường hợp tuỳ dữ liệu. Chọn để xem vùng đó trên trang đổi ra sao.</p>';

  groups.forEach(function (g) {
    var sec = document.createElement('section');
    sec.className = 'cd-group';
    var h = document.createElement('h3');
    h.textContent = TITLES[g.id] || g.id;
    sec.appendChild(h);
    g.cases.forEach(function (c, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'cs-btn';
      b.setAttribute('data-case', c.id);
      var real = c.real === undefined ? i === 0 : c.real;
      b.textContent = c.label + (real ? ' (case thật)' : '');
      b.addEventListener('click', function () {
        g.pick(c);
        // Cuộn tới vùng vừa đổi và nháy viền để thấy chỗ thay đổi
        var target = g.box.closest('[hidden]') ? g.box.previousElementSibling : g.box;
        target.scrollIntoView({ block: 'center', behavior: 'smooth' });
        g.box.classList.remove('case-flash'); void g.box.offsetWidth; g.box.classList.add('case-flash');
      });
      g.buttons.push(b);
      sec.appendChild(b);
    });
    drawer.appendChild(sec);
    g.pick(g.cases[0]);
  });
  document.body.appendChild(drawer);

  var ribbon = document.querySelector('.demo-ribbon');
  function setOpen(on) {
    // Ngăn bắt đầu ngay dưới dải DEMO (dải cao hơn khi màn hẹp)
    if (on && ribbon) drawer.style.top = ribbon.getBoundingClientRect().bottom + 'px';
    drawer.hidden = !on;
    open.setAttribute('aria-expanded', String(on));
  }
  open.hidden = false;
  open.setAttribute('aria-controls', 'case-drawer');
  open.setAttribute('aria-expanded', 'false');
  open.addEventListener('click', function () { setOpen(drawer.hidden); });
  drawer.querySelector('.cd-close').addEventListener('click', function () { setOpen(false); open.focus(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !drawer.hidden) setOpen(false); });
})();
