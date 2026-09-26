(() => {
  const panel = document.querySelector('.minimal-map');
  if (!panel) return;
  const zh = document.documentElement.lang.startsWith('zh');
  const scriptURL = document.currentScript.src;
  const ns = 'http://www.w3.org/2000/svg';
  const countryNames = typeof Intl.DisplayNames === 'function' ? new Intl.DisplayNames([zh ? 'zh-CN' : 'en'], { type: 'region' }) : null;
  function activate(code, active) {
    panel.querySelectorAll('.map-marker').forEach(el => el.classList.toggle('is-active', active && el.dataset.country === code));
  }
  function bindButtons() {
    panel.querySelectorAll('.visitor-countries button').forEach(button => {
      ['mouseenter','focus'].forEach(event => button.addEventListener(event, () => activate(button.dataset.country, true)));
      ['mouseleave','blur'].forEach(event => button.addEventListener(event, () => activate(button.dataset.country, false)));
      button.addEventListener('click', () => activate(button.dataset.country, true));
    });
  }
  bindButtons();
  async function json(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(url, {cache:'no-store',signal:controller.signal});
      if (!response.ok) throw new Error('Visitor data unavailable');
      return await response.json();
    } finally { clearTimeout(timeout); }
  }
  function render(data, centers) {
    if (!Array.isArray(data.countries) || !data.countries.length || data.countries.some(c => !/^[A-Z]{2}$/.test(c.code) || !Number.isInteger(c.visits) || c.visits < 0)) return;
    if (!Number.isFinite(Date.parse(data.updated_at))) return;
    const existingDate = Date.parse(document.getElementById('map-updated').dateTime);
    if (Date.parse(data.updated_at) < existingDate) return;
    const markers = document.getElementById('visitor-markers');
    const list = document.getElementById('visitor-country-list');
    markers.replaceChildren(); list.replaceChildren();
    for (const country of data.countries) {
      let label = country.name;
      try { label = countryNames?.of(country.code) || label; } catch (_) {}
      const center = centers[country.code];
      if (center && Number.isFinite(center.x) && Number.isFinite(center.y)) {
        const g = document.createElementNS(ns, 'g');g.setAttribute('class','map-marker');g.dataset.country=country.code;g.setAttribute('transform',`translate(${center.x},${center.y})`);
        const title = document.createElementNS(ns,'title');title.textContent=`${label}: ${country.visits}`;g.append(title);
        for (const [cls,radius] of [['marker-halo',11],['marker-dot',4.5]]) { const circle=document.createElementNS(ns,'circle');circle.setAttribute('class',cls);circle.setAttribute('r',radius);g.append(circle); }
        markers.append(g);
      }
      const li=document.createElement('li');const button=document.createElement('button');button.type='button';button.dataset.country=country.code;button.append(document.createTextNode(label+' '));
      const count=document.createElement('span');count.textContent=country.visits;button.append(count);li.append(button);list.append(li);
    }
    document.getElementById('country-total').textContent=data.countries.length;
    document.getElementById('visit-total').textContent=data.countries.reduce((sum,c)=>sum+c.visits,0);
    const updated=document.getElementById('map-updated');updated.dateTime=data.updated_at;updated.textContent=data.updated_at.slice(0,16).replace('T',' ')+' UTC';
    bindButtons();
  }
  Promise.all([json(panel.dataset.statsUrl),json(new URL('assets/country-centers.json',scriptURL))]).then(([data,centers])=>render(data,centers)).catch(()=>{
    // Retain the visible, dated last successful snapshot when refresh is unavailable.
  });
})();
