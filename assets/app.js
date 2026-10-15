// Tương tác demo v3: chip Hãng / Loại lọc ngay trên trang (OR trong nhóm, AND giữa nhóm),
// sắp xếp Nổi bật / Có tin mới. Nội dung đã render sẵn trong HTML; tắt JS trang vẫn đọc được.
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
  const empty = $('.empty');
  const count = $('[data-visible-count]');
  const cards = $$('.pcard', grid);
  const chips = $$('button.chip[data-g]');
  let sort = 'featured';

  // data-g = brand | type | line, khớp với data-brand / data-type / data-line của card
  const selected = () => chips.filter((c) => c.getAttribute('aria-pressed') === 'true')
    .reduce((acc, c) => ((acc[c.dataset.g] ||= []).push(c.dataset.v), acc), {});
  const matches = (card, sel) => Object.entries(sel).every(([g, vals]) => vals.includes(card.dataset[g]));

  const apply = () => {
    const sel = selected();
    const key = sort === 'news' ? (c) => -Number(c.dataset.newsTs) : (c) => Number(c.dataset.order);
    cards.sort((a, b) => key(a) - key(b) || Number(a.dataset.order) - Number(b.dataset.order));
    cards.forEach((c) => { c.hidden = !matches(c, sel); grid.append(c); });
    const n = cards.filter((c) => !c.hidden).length;
    empty.hidden = n > 0;
    count.textContent = Object.keys(sel).length ? `${n}/${cards.length}` : cards.length;
  };

  chips.forEach((c) => c.addEventListener('click', () => {
    c.setAttribute('aria-pressed', String(c.getAttribute('aria-pressed') !== 'true')); apply();
  }));
  $$('[data-reset-filter]').forEach((b) => b.addEventListener('click', () => {
    chips.forEach((c) => c.setAttribute('aria-pressed', 'false')); apply();
  }));
  $$('.sort-btn').forEach((b) => b.addEventListener('click', () => {
    $$('.sort-btn').forEach((x) => x.classList.remove('is-active'));
    b.classList.add('is-active'); sort = b.dataset.sort; apply();
  }));
})();
