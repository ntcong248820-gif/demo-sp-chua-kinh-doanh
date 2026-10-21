// Trang tổng demo: nút sáng / tối. Nhớ lựa chọn trong localStorage (lỗi thì bỏ qua, trang vẫn chạy theo hệ điều hành).
(function () {
  var toggle = document.getElementById('themeToggle');
  if (!toggle) return;
  var dark = function () {
    var t = document.documentElement.getAttribute('data-theme');
    return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  };
  var paint = function () { toggle.textContent = dark() ? '☀' : '☾'; };
  paint();
  toggle.addEventListener('click', function () {
    var next = dark() ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    paint();
  });
})();
