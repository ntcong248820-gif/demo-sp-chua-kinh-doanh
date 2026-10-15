// Tương tác demo, mô phỏng danh mục đang bán: popup "Tất cả bộ lọc" (OR trong nhóm, AND giữa nhóm),
// chip đã chọn bấm × để bỏ, sắp xếp Nổi bật / Mới, dải "đang bán" chen sau hàng card đầu.
// Nội dung đã render sẵn trong HTML; tắt JS trang vẫn đọc được.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const toastEl = $('.toast');
  let toastTimer;
  const toast = (msg) => {
    toastEl.textContent = msg; toastEl.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { toastEl.hidden = true; }, 3500);
  };
  document.addEventListener('click', (e) => {
    const pdp = e.target.closest('[data-pdp]');
    if (!pdp) return;
    e.preventDefault();
    toast(`Demo: trang sản phẩm "${pdp.dataset.pdp}" do Chí Hiếu làm, chưa nối link.`);
  });

  const grid = $('[data-grid]');
  if (!grid) return;
  const rail = $('[data-rail]');
  const empty = $('.empty');
  const cards = $$('.pcard', grid);
  cards.forEach((c) => { c._attrs = JSON.parse(c.dataset.attrs); });
  const modal = $('[data-filter-modal]');
  const opts = $$('.opt', modal);
  let applied = {};   // { nhóm: [giá trị] } đang áp dụng
  let draft = {};     // lựa chọn trong popup, chưa bấm "Xem kết quả"
  let sort = 'featured';
  let lastFocus;

  const matches = (card, sel) => Object.entries(sel).every(([g, vals]) =>
    !vals.length || vals.some((v) => card._attrs[g].includes(v)));
  const clone = (o) => JSON.parse(JSON.stringify(o));

  const placeRail = () => {
    const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    const visible = cards.filter((c) => !c.hidden);
    if (visible.length > cols) visible[cols - 1].after(rail); else grid.after(rail);
  };

  const renderPicked = () => {
    const box = $('.picked-dyn');
    box.innerHTML = '';
    opts.filter((o) => (applied[o.dataset.g] || []).includes(o.dataset.v)).forEach((o) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'picked';
      b.innerHTML = `${o.textContent}<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>`;
      b.setAttribute('aria-label', `Bỏ lọc ${o.textContent}`);
      b.addEventListener('click', () => {
        applied[o.dataset.g] = applied[o.dataset.g].filter((v) => v !== o.dataset.v); apply();
      });
      box.append(b);
    });
    const n = Object.values(applied).flat().length;
    const badge = $('.filter-count');
    badge.hidden = !n; badge.textContent = n;
  };

  const apply = () => {
    const key = sort === 'new' ? (c) => -Number(c.dataset.order) : (c) => Number(c.dataset.order);
    cards.sort((a, b) => key(a) - key(b));
    cards.forEach((c) => { c.hidden = !matches(c, applied); grid.append(c); });
    empty.hidden = cards.some((c) => !c.hidden);
    placeRail(); renderPicked();
  };

  const syncDraft = () => {
    opts.forEach((o) => o.setAttribute('aria-pressed', String((draft[o.dataset.g] || []).includes(o.dataset.v))));
    $('[data-result-count]').textContent = cards.filter((c) => matches(c, draft)).length;
  };
  const openModal = () => {
    lastFocus = document.activeElement; draft = clone(applied); syncDraft();
    modal.hidden = false; document.body.classList.add('modal-open'); $('.modal-close', modal).focus();
  };
  const closeModal = () => {
    modal.hidden = true; document.body.classList.remove('modal-open'); lastFocus?.focus();
  };

  $('[data-open-filter]').addEventListener('click', openModal);
  $$('[data-close-filter]').forEach((b) => b.addEventListener('click', closeModal));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });
  opts.forEach((o) => o.addEventListener('click', () => {
    const { g, v } = o.dataset; const cur = draft[g] || [];
    draft[g] = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]; syncDraft();
  }));
  $$('[data-reset-filter]').forEach((b) => b.addEventListener('click', () => {
    draft = {};
    if (modal.hidden) { applied = {}; apply(); } else syncDraft();
  }));
  $('[data-apply-filter]').addEventListener('click', () => { applied = clone(draft); closeModal(); apply(); });

  $$('.sort-btn').forEach((b) => b.addEventListener('click', () => {
    $$('.sort-btn').forEach((x) => x.classList.remove('is-active'));
    b.classList.add('is-active'); sort = b.dataset.sort; apply();
  }));
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(placeRail, 150); });
  apply();
})();
