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
  // Trang ví dụ minh hoạ (ngành hết hàng): máy giả định, không có trang sản phẩm thật
  document.addEventListener('click', (e) => {
    const ex = e.target.closest('[data-pdp-example]');
    if (!ex) return;
    e.preventDefault();
    toast(`Ví dụ minh hoạ: "${ex.dataset.pdpExample}" chỉ để xem giao diện, trên web thật card mở trang sản phẩm ngừng kinh doanh.`);
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

  // "Thông tin hãng" trang đang bán (A2), như live: gập còn 200px + "Xem thêm"; bấm mục lục thì mở bài rồi nhảy tới.
  const bi = $('[data-bi]');
  const biMore = $('[data-bi-more]');
  if (bi && biMore) {
    const setBi = (open) => {
      bi.classList.toggle('is-collapsed', !open);
      biMore.setAttribute('aria-expanded', String(open));
      biMore.firstElementChild.firstChild.textContent = open ? 'Thu gọn' : 'Xem thêm';
    };
    setBi(false);
    biMore.hidden = false;
    biMore.addEventListener('click', () => {
      const open = bi.classList.contains('is-collapsed');
      setBi(open);
      if (!open) bi.closest('section').scrollIntoView({ block: 'start' });
    });
    $$('[data-toc-link]').forEach((a) => a.addEventListener('click', () => setBi(true)));
    const tocBtn = $('[data-toc-btn]');
    if (tocBtn) tocBtn.addEventListener('click', () => {
      const open = tocBtn.getAttribute('aria-expanded') !== 'true';
      tocBtn.setAttribute('aria-expanded', String(open));
      $('#bi-toc-list').hidden = !open;
    });
  }

  // Banner đầu trang: mũi tên cuộn đúng 1 tấm, ẩn mũi tên ở hai đầu (như danh mục đang bán). Không tự chạy.
  const bn = $('[data-banner]');
  if (bn) {
    const track = $('[data-bn-track]', bn);
    const prev = $('[data-bn-prev]', bn);
    const next = $('[data-bn-next]', bn);
    const smooth = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    const step = () => track.firstElementChild.getBoundingClientRect().width + 10;
    const sync = () => {
      const max = track.scrollWidth - track.clientWidth - 2;
      const atStart = track.scrollLeft <= 2;
      const atEnd = track.scrollLeft >= max;
      // Mũi tên đang được focus mà sắp ẩn thì chuyển focus sang mũi tên còn lại, không rơi về đầu trang
      if (atStart && document.activeElement === prev && !atEnd) next.focus();
      if (atEnd && document.activeElement === next && !atStart) prev.focus();
      prev.hidden = atStart; next.hidden = atEnd;
    };
    prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: smooth }));
    next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: smooth }));
    track.addEventListener('scroll', sync, { passive: true });
    addEventListener('resize', sync);
    sync();
  }

  // Trang đang bán (A2): nút nổi mô phỏng cờ khai báo "Hiện khối SP chưa KD". Trạng thái ghi lên URL (?khoi=tat)
  // để gửi link xem đúng trạng thái. Tắt JS thì khối luôn hiện. Bật/tắt không đổi số SP trên breadcrumb.
  const tBlock = $('[data-toggle-block]');
  const tBtn = $('[data-toggle-btn]');
  if (tBlock && tBtn) {
    const setBlock = (on) => {
      tBlock.hidden = !on;
      tBtn.setAttribute('aria-pressed', String(on));
      tBtn.querySelector('b').textContent = on ? 'Bật' : 'Tắt';
      const u = new URL(location.href);
      if (on) u.searchParams.delete('khoi'); else u.searchParams.set('khoi', 'tat');
      history.replaceState(null, '', u);
    };
    setBlock(new URLSearchParams(location.search).get('khoi') !== 'tat');
    tBtn.addEventListener('click', () => setBlock(tBlock.hidden));
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
    // Như web thật: có chip đã chọn (từ URL hoặc lọc tại chỗ) thì phễu trên nút Lọc có chấm cam
    const n = nSelected(applied);
    $('[data-open-filter]')?.classList.toggle('has-filter', n > 0 || !!$('a.picked'));
    const clr = $('.clear-all');
    if (clr) clr.hidden = !n;
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
  // Khung 2 tab trên trang hết hàng: máy mới đang bán | máy cũ giá rẻ; "Xem tất cả" đổi theo tab
  document.documentElement.classList.add('js');
  $$('.promo--tabs').forEach((box) => {
    const tabs = $$('.pt-tab', box);
    const all = $('.pb-all', box);
    const show = (t) => {
      tabs.forEach((x) => {
        const on = x === t;
        x.classList.toggle('is-active', on); x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1;
        $('#' + x.getAttribute('aria-controls')).hidden = !on;
      });
      all.href = t.dataset.href;
    };
    tabs.forEach((t) => t.addEventListener('click', () => show(t)));
    box.addEventListener('keydown', (e) => {
      const i = tabs.indexOf(document.activeElement);
      if (i < 0 || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      n.focus(); show(n);
    });
    show(tabs[0]);
  });
  // Câu dẫn trên lưới "Xem laptop Samsung cũ": cuộn xuống khung và mở đúng tab
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-open-tab]');
    if (!a) return;
    const t = document.getElementById(a.dataset.openTab);
    if (t) t.click();
  });
})();
