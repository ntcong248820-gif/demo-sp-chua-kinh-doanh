/* Nút chuyển case cho vùng có nhiều trường hợp hiển thị (owner 22/10/2026).
   Vùng mang data-case-box="id" + data-cases='[{id,label,show:[part…]}]', case đầu là case thật theo rule.
   Phần tử con data-case-part="part" hiện khi part nằm trong show; phần tử bất kỳ data-case-ext="id:part" / "id:!part"
   hiện / ẩn theo part đó. data-case-class="cls:n" thêm class cho vùng khi có ≥ n part đang hiện.
   Tắt JS thì không có thanh nút, trang giữ case thật. */
(function () {
  document.querySelectorAll('[data-case-box]').forEach(function (box) {
    var id = box.getAttribute('data-case-box');
    var cases; try { cases = JSON.parse(box.getAttribute('data-cases')); } catch (e) { return; }
    if (!cases || cases.length < 2) return;
    var parts = Array.prototype.filter.call(box.querySelectorAll('[data-case-part]'), function (el) {
      return el.closest('[data-case-box]') === box;
    });
    var ext = document.querySelectorAll('[data-case-ext^="' + id + ':"]');
    var cls = (box.getAttribute('data-case-class') || '').split(':');

    var bar = document.createElement('div');
    bar.className = 'case-switch';
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', 'Chọn case hiển thị');
    bar.innerHTML = '<span class="cs-label">Case hiển thị:</span>';
    var empty = document.createElement('p');
    empty.className = 'case-empty';
    empty.textContent = 'Trang thật không hiện vùng này.';
    empty.hidden = true;

    function pick(c) {
      parts.forEach(function (el) {
        var on = c.show.indexOf(el.getAttribute('data-case-part')) > -1;
        el.hidden = !on;
      });
      ext.forEach(function (el) {
        var rule = el.getAttribute('data-case-ext').split(':')[1], neg = rule.charAt(0) === '!';
        var on = c.show.indexOf(neg ? rule.slice(1) : rule) > -1;
        el.hidden = neg ? on : !on;
      });
      var visible = c.show.filter(function (p) {
        return parts.some(function (el) { return el.getAttribute('data-case-part') === p; });
      }).length;
      if (cls[0]) box.classList.toggle(cls[0], visible >= +(cls[1] || 1));
      // Mọi con của vùng đều là part (bỏ qua chấm giải thích) và đang ẩn → vùng trống, ghi rõ trang thật ẩn vùng
      var allParts = Array.prototype.every.call(box.children, function (el) {
        return el.hasAttribute('data-case-part') || el.classList.contains('hint-dot');
      });
      empty.hidden = !(allParts && !visible);
      Array.prototype.forEach.call(bar.querySelectorAll('button'), function (b) {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-case') === c.id));
      });
    }

    cases.forEach(function (c, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'cs-btn';
      b.setAttribute('data-case', c.id);
      b.textContent = c.label + (i === 0 ? ' (case thật)' : '');
      b.addEventListener('click', function () { pick(c); });
      bar.appendChild(b);
    });
    box.parentNode.insertBefore(bar, box);
    box.parentNode.insertBefore(empty, box);
    pick(cases[0]);
  });
})();
