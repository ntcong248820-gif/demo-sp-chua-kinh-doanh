// Nút "Xem: Desktop / Mobile" trên dải DEMO (owner 22/10/2026): bật Mobile thì mở chính trang này trong khung rộng 390px (iPhone 14)
// giữa màn hình. Dùng iframe để media query chạy theo đúng bề rộng khung, tức là ra đúng giao diện mobile thật.
// Lựa chọn được nhớ khi chuyển trang demo; trong khung (?view=frame) thì ẩn nút để không lồng khung.
(() => {
  const btn = document.querySelector('[data-view-toggle]');
  if (!btn) return;
  const params = new URLSearchParams(location.search);
  if (params.get('view') === 'frame') { document.documentElement.classList.add('in-view-frame'); return; }

  const KEY = 'demoView';
  const save = (v) => { try { localStorage.setItem(KEY, v); } catch (e) { /* trình duyệt chặn lưu thì thôi */ } };
  const load = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  let stage = null;

  const frameUrl = () => {
    const q = new URLSearchParams(location.search);
    q.set('view', 'frame');
    return location.pathname + '?' + q.toString() + location.hash;
  };
  const set = (mobile) => {
    btn.setAttribute('aria-pressed', String(mobile));
    btn.querySelector('b').textContent = mobile ? 'Mobile' : 'Desktop';
    document.documentElement.classList.toggle('view-mobile', mobile);
    if (mobile && !stage) {
      stage = document.createElement('div');
      stage.className = 'view-stage';
      stage.innerHTML = '<div class="view-device"><iframe title="Giao diện mobile của trang này"></iframe></div>';
      stage.querySelector('iframe').src = frameUrl();
      document.querySelector('.demo-ribbon').after(stage);
    } else if (!mobile && stage) {
      stage.remove(); stage = null;
    }
    save(mobile ? 'mobile' : 'desktop');
  };
  btn.hidden = false;
  btn.addEventListener('click', () => set(btn.getAttribute('aria-pressed') !== 'true'));
  if (load() === 'mobile' && window.innerWidth > 640) set(true);
})();
