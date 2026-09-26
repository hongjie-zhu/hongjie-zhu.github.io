(() => {
  const header = document.querySelector('.site-header');
  const links = [...document.querySelectorAll('.site-header nav a')];
  const sections = ['home','publications','research'].map(id => document.getElementById(id));
  function headerHeight() {
    document.documentElement.style.setProperty('--header-height', `${header.getBoundingClientRect().height}px`);
  }
  headerHeight();
  if (typeof ResizeObserver === 'function') new ResizeObserver(headerHeight).observe(header);
  else window.addEventListener('resize', headerHeight, {passive:true});
  function revealHash() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch (_) { return; }
    const target = document.getElementById(id);
    if (!target) return;
    let element = target;
    while (element) { if (element.tagName === 'DETAILS') element.open = true; element = element.parentElement; }
    requestAnimationFrame(() => { target.scrollIntoView({block:'start'}); setActive(); });
  }
  function setActive() {
    const cutoff = header.getBoundingClientRect().height + 80;
    let active = sections[0];
    for (const section of sections) if (section.getBoundingClientRect().top <= cutoff) active = section;
    for (const link of links) {
      if (link.hash === '#'+active.id) link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    }
  }
  let scheduled = false;
  window.addEventListener('scroll', () => {
    if (!scheduled) { scheduled=true;requestAnimationFrame(() => {setActive();scheduled=false;}); }
  }, {passive:true});
  window.addEventListener('hashchange', revealHash);
  document.addEventListener('click', event => {
    const link=event.target.closest('a[href^="#"]');
    if (link && link.hash===location.hash) requestAnimationFrame(revealHash);
  });
  if (location.hash) revealHash();
  else setActive();
})();
