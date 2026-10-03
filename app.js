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
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let themeBusy = false;
  themeButton.addEventListener('click', () => {
    if (themeBusy) return;
    const changeTheme = () => {
      root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('hz-theme', root.dataset.theme); } catch (_) {}
      themeLabel();
    };
    if (reducedMotion.matches) { changeTheme(); return; }
    const bounds = themeButton.getBoundingClientRect();
    const x = bounds.left + bounds.width / 2, y = bounds.top + bounds.height / 2;
    root.style.setProperty('--theme-x', `${x}px`);
    root.style.setProperty('--theme-y', `${y}px`);
    root.style.setProperty('--theme-radius', `${Math.hypot(Math.max(x, innerWidth-x), Math.max(y, innerHeight-y))}px`);
    themeBusy = true;
    themeButton.classList.add('is-switching');
    const done = () => {
      themeBusy = false;
      themeButton.classList.remove('is-switching');
      root.classList.remove('theme-reveal', 'theme-fading');
    };
    if (typeof document.startViewTransition === 'function') {
      root.classList.add('theme-reveal');
      try {
        const transition = document.startViewTransition(changeTheme);
        transition.ready.catch(() => {});
        transition.finished.then(done, done);
      } catch (_) { changeTheme(); done(); }
    } else {
      root.classList.add('theme-fading');
      changeTheme();
      setTimeout(done, 650);
    }
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
