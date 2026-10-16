// Tương tác demo v3: nút "Lọc" xổ panel ngay dưới nút (như danh mục đang bán), 2 nhóm Thương hiệu / Loại sản phẩm
// (OR trong nhóm, AND giữa nhóm),
// chip đã chọn có × để bỏ, sắp xếp Nổi bật / Có tin mới, lưới gập 2 hàng + "Xem thêm".
// Nội dung đã render sẵn; tắt JS trang vẫn đọc được.
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

  // Infobox dài: gập còn phần đầu + "Xem thêm" như danh mục đang bán. Chỉ gập khi bài dài hơn khung đủ đáng kể;
  // tắt JS thì bài hiện đủ. Thu gọn lại thì cuộn về đầu bài để không lạc chỗ đọc.
  const art = $('.ib-article');
  const ibBtn = $('[data-ib-toggle]');
  if (art && ibBtn) {
    art.classList.add('is-collapsed');
    if (art.scrollHeight > art.clientHeight + 80) {
      ibBtn.hidden = false; ibBtn.setAttribute('aria-expanded', 'false');
      ibBtn.addEventListener('click', () => {
        const open = art.classList.toggle('is-collapsed') === false;
        ibBtn.setAttribute('aria-expanded', String(open));
        ibBtn.firstElementChild.textContent = open ? 'Thu gọn' : 'Xem thêm';
        if (!open) art.closest('section').scrollIntoView({ block: 'start' });
      });
    } else {
      art.classList.remove('is-collapsed');
    }
  }

  const grid = $('[data-grid]');
  if (!grid) return;
  const empty = $('.empty', grid.parentElement);
  const count = $('[data-visible-count]');
  const cards = $$('.pcard', grid);
  cards.forEach((c) => { c._attrs = JSON.parse(c.dataset.attrs); });
  const modal = $('[data-filter-modal]');
  const opts = modal ? $$('.opt', modal) : [];
  let applied = {};   // { nhóm: [giá trị] } đang áp dụng
  let draft = {};     // lựa chọn trong popup, chưa bấm "Xem kết quả"
  let sort = 'featured';
  let lastFocus;
  const moreBtn = $('[data-more]');
  let expanded = false;

  // Gập lưới còn 2 hàng (lưới 2 cột: 3 hàng) + "Xem thêm", như danh mục đang bán. Số cột đọc từ CSS thật nên
  // đúng ở mọi breakpoint; áp trên kết quả đã lọc/sắp. Đã bấm "Xem thêm" thì giữ mở tới khi tải lại trang.
  const fold = () => {
    const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    const limit = cols * (cols <= 2 ? 3 : 2);
    const visible = cards.filter((c) => !c.hidden);
    visible.forEach((c, i) => c.classList.toggle('is-folded', !expanded && i >= limit));
    const rest = expanded ? 0 : Math.max(0, visible.length - limit);
    moreBtn.hidden = !rest;
    $('[data-more-count]', moreBtn).textContent = rest;
  };
  moreBtn.addEventListener('click', () => { expanded = true; fold(); });
  let rz;
  addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(fold); });

  const matches = (card, sel) => Object.entries(sel).every(([g, vals]) =>
    !vals.length || vals.some((v) => card._attrs[g].includes(v)));
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const nSelected = (sel) => Object.values(sel).flat().length;

  const renderPicked = () => {
    const box = $('.picked-dyn');
    if (!box) return;
    box.innerHTML = '';
    opts.filter((o) => (applied[o.dataset.g] || []).includes(o.dataset.v)).forEach((o) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'picked';
      b.innerHTML = `${o.dataset.label}<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>`;
      b.setAttribute('aria-label', `Bỏ lọc ${o.dataset.label}`);
      b.addEventListener('click', () => {
        applied[o.dataset.g] = applied[o.dataset.g].filter((v) => v !== o.dataset.v); apply();
      });
      box.append(b);
    });
    const n = nSelected(applied);
    const badge = $('.filter-count');
    if (badge) { badge.hidden = !n; badge.textContent = n; $('.clear-all').hidden = !n; }
  };

  const apply = () => {
    const key = sort === 'news' ? (c) => -Number(c.dataset.newsTs) : (c) => Number(c.dataset.order);
    cards.sort((a, b) => key(a) - key(b) || Number(a.dataset.order) - Number(b.dataset.order));
    cards.forEach((c) => { c.hidden = !matches(c, applied); grid.append(c); });
    const n = cards.filter((c) => !c.hidden).length;
    empty.hidden = n > 0;
    count.textContent = nSelected(applied) ? `${n}/${cards.length}` : cards.length;
    fold(); renderPicked();
  };

  const syncDraft = () => {
    opts.forEach((o) => o.setAttribute('aria-pressed', String((draft[o.dataset.g] || []).includes(o.dataset.v))));
    $('[data-result-count]').textContent = cards.filter((c) => matches(c, draft)).length;
  };
  const overlay = $('.f-overlay');
  const openBtn = $('[data-open-filter]');
  const openModal = () => {
    lastFocus = document.activeElement; draft = clone(applied); syncDraft();
    // Như web thật: cuộn để nút Lọc nằm sát mép trên, panel xổ xuống ngay dưới nút còn đủ chỗ
    const y = openBtn.getBoundingClientRect().top + scrollY - 16;
    if (Math.abs(scrollY - y) > 4) scrollTo({ top: y, behavior: 'instant' });
    modal.hidden = false; overlay.hidden = false; openBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('modal-open'); $('.modal-close', modal).focus();
  };
  const closeModal = () => {
    modal.hidden = true; overlay.hidden = true; openBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('modal-open'); lastFocus?.focus();
  };

  if (modal) {
  openBtn.addEventListener('click', () => (modal.hidden ? openModal() : closeModal()));
  $$('[data-close-filter]').forEach((b) => b.addEventListener('click', closeModal));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });
  opts.forEach((o) => o.addEventListener('click', () => {
    const { g, v } = o.dataset; const cur = draft[g] || [];
    draft[g] = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]; syncDraft();
  }));
  $('[data-clear-draft]').addEventListener('click', () => { draft = {}; syncDraft(); });
  $('[data-apply-filter]').addEventListener('click', () => { applied = clone(draft); closeModal(); apply(); });
  }
  $$('[data-reset-filter]').forEach((b) => b.addEventListener('click', () => { applied = {}; apply(); }));

  $$('.sort-btn').forEach((b) => b.addEventListener('click', () => {
    $$('.sort-btn').forEach((x) => x.classList.remove('is-active'));
    b.classList.add('is-active'); sort = b.dataset.sort; apply();
  }));
  fold();
})();
