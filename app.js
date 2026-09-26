(() => {
  const root = document.documentElement;
  const language = root.lang.startsWith('zh') ? 'zh' : 'en';
  const langButton = document.getElementById('language-toggle');
  langButton.textContent = language === 'zh' ? 'EN' : '中文';
  langButton.setAttribute('aria-label', language === 'zh' ? 'Switch to English' : '切换到中文');
  langButton.addEventListener('click', () => {
    const target = document.querySelector('link[rel="alternate"][hreflang="' + (language === 'zh' ? 'en' : 'zh-CN') + '"]');
    const pathname = new URL(target.href).pathname;
    window.location.assign(pathname + window.location.hash);
  });
  const themeButton = document.getElementById('theme-toggle');
  function themeLabel() {
    const dark = root.dataset.theme === 'dark';
    themeButton.setAttribute('aria-label', language === 'zh' ? (dark ? '切换到日间模式' : '切换到夜间模式') : (dark ? 'Switch to light mode' : 'Switch to dark mode'));
    themeButton.setAttribute('aria-pressed', String(dark));
    document.querySelector('meta[name="theme-color"]').content = dark ? '#141d28' : '#ffffff';
  }
  themeLabel();
  themeButton.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('hz-theme', root.dataset.theme); } catch (_) {}
    themeLabel();
  });
  const counter = document.getElementById('visitor-counter');
  if (counter) {
    const failed = () => { document.querySelector('.counter-error').hidden = false; counter.closest('a').hidden = true; };
    counter.addEventListener('error', failed);
    if (counter.complete && !counter.naturalWidth) failed();
  }
  const dialog = document.getElementById('lightbox');
  if (dialog) {
    document.querySelectorAll('[data-lightbox]').forEach(a => a.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const caption = a.dataset[language === 'zh' ? 'captionZh' : 'captionEn'];
      document.getElementById('lightbox-image').src = a.href;
      document.getElementById('lightbox-image').alt = caption;
      document.getElementById('lightbox-caption').textContent = caption;
      dialog.showModal();
    }));
    document.getElementById('close-lightbox').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
  }
})();
