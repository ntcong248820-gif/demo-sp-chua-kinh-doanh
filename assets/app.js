// Tương tác demo: lọc trạng thái, sắp xếp, chèn dải "Đang bán" sau hàng card đầu, nút nhận tin, toast.
// Nội dung đã render sẵn trong HTML; tắt JS trang vẫn đọc được đầy đủ.
(() => {
  const toastEl = document.querySelector('.toast');
  let toastTimer;
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 3500);
  };

  // Link sang trang sản phẩm: phần đó Chí Hiếu demo riêng.
  document.addEventListener('click', (e) => {
    const pdp = e.target.closest('[data-pdp]');
    if (pdp) {
      e.preventDefault();
      toast(`Demo: trang sản phẩm "${pdp.dataset.pdp}" do Chí Hiếu làm, chưa nối link.`);
      return;
    }
    const nt = e.target.closest('button[data-notify]');
    if (nt) {
      const on = nt.getAttribute('aria-pressed') !== 'true';
      nt.setAttribute('aria-pressed', String(on));
      toast(on ? `Demo: sẽ báo bạn khi ${nt.dataset.notify} mở bán.` : 'Đã bỏ nhận tin.');
    }
  });

  const grid = document.querySelector('[data-grid]');
  if (!grid) return;
  const rail = document.querySelector('[data-rail]');
  const empty = document.querySelector('.empty');
  const cards = [...grid.querySelectorAll('.pcard')];
  let status = 'all';
  let sort = 'fans';

  // Đặt dải cross-sell ngay sau hàng card đầu tiên đang hiện.
  const placeRail = () => {
    const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    const visible = cards.filter((c) => !c.hidden);
    if (visible.length > cols) visible[cols - 1].after(rail);
    else grid.after(rail);
  };

  const apply = () => {
    const key = { fans: (c) => -Number(c.dataset.fans), launch: (c) => c.dataset.launch, price: (c) => Number(c.dataset.price) }[sort];
    cards.sort((a, b) => (key(a) > key(b) ? 1 : key(a) < key(b) ? -1 : 0));
    cards.forEach((c) => { c.hidden = status !== 'all' && c.dataset.status !== status; grid.append(c); });
    empty.hidden = cards.some((c) => !c.hidden);
    placeRail();
  };

  document.querySelectorAll('.seg').forEach((b) => b.addEventListener('click', () => {
    document.querySelectorAll('.seg').forEach((x) => { x.classList.remove('is-active'); x.setAttribute('aria-pressed', 'false'); });
    b.classList.add('is-active'); b.setAttribute('aria-pressed', 'true');
    status = b.dataset.status; apply();
  }));
  document.querySelectorAll('.sort-btn').forEach((b) => b.addEventListener('click', () => {
    document.querySelectorAll('.sort-btn').forEach((x) => x.classList.remove('is-active'));
    b.classList.add('is-active'); sort = b.dataset.sort; apply();
  }));
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(placeRail, 150); });
  apply();

  // Form nhận tin: chỉ kiểm định dạng, không gửi dữ liệu đi đâu.
  const form = document.querySelector('[data-notify-form]');
  if (form) {
    const phone = form.querySelector('#nt-phone');
    const err = form.querySelector('#nt-err');
    const valid = () => /^0\d{9}$/.test(phone.value.replace(/\s/g, ''));
    phone.addEventListener('blur', () => {
      if (!phone.value) return;
      err.hidden = valid();
      phone.setAttribute('aria-invalid', String(!valid()));
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!valid()) {
        err.hidden = false; phone.setAttribute('aria-invalid', 'true'); phone.focus(); return;
      }
      err.hidden = true; phone.setAttribute('aria-invalid', 'false');
      toast('Demo: đăng ký hợp lệ. Bản demo không lưu số điện thoại.');
      form.reset();
    });
  }
})();
