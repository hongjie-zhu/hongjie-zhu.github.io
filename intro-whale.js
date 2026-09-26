(() => {
  const root = document.documentElement;
  const intro = document.getElementById('whale-intro');
  const canvas = document.getElementById('whale-canvas');
  const skip = document.getElementById('intro-skip');
  const replay = document.getElementById('intro-replay');
  if (!intro || !canvas) return;

  const ctx = canvas.getContext('2d', { alpha: false });
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const key = 'hongjie-whale-intro-seen-v1';
  let frame = 0, started = 0, active = false, pointerX = 0, pointerY = 0;
  let whale = [], links = [], ambient = [], width = 0, height = 0, dpr = 1;

  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const ease = t => 1 - Math.pow(1 - clamp(t), 3);
  const fade = (a, b, t) => clamp((t - a) / (b - a));
  function seeded(seed) {
    let x = seed >>> 0;
    return () => ((x = Math.imul(1664525, x) + 1013904223 >>> 0) / 4294967296);
  }

  const WHALE_OUTLINE = [[0.5,-0.3872],[0.4868,-0.3741],[0.4722,-0.3595],[0.4603,-0.3438],[0.4501,-0.3275],[0.4379,-0.3119],[0.4257,-0.2964],[0.4111,-0.2818],[0.3962,-0.2681],[0.377,-0.2648],[0.3587,-0.2704],[0.3412,-0.278],[0.3228,-0.2795],[0.3213,-0.2596],[0.3213,-0.239],[0.3246,-0.2197],[0.336,-0.2038],[0.3445,-0.1868],[0.3379,-0.1689],[0.3233,-0.1543],[0.3078,-0.1421],[0.2923,-0.1299],[0.2758,-0.12],[0.2583,-0.1125],[0.2418,-0.1027],[0.2239,-0.0961],[0.2047,-0.0928],[0.1855,-0.0895],[0.1662,-0.0862],[0.1526,-0.097],[0.1537,-0.1093],[0.1358,-0.1027],[0.118,-0.0961],[0.1001,-0.0895],[0.0823,-0.0828],[0.063,-0.0795],[0.0438,-0.0828],[0.0246,-0.0862],[0.0059,-0.0906],[-0.0125,-0.0961],[-0.0303,-0.1027],[-0.0475,-0.1109],[-0.0647,-0.1192],[-0.0815,-0.1283],[-0.099,-0.1359],[-0.1164,-0.1434],[-0.1329,-0.1533],[-0.1498,-0.1623],[-0.1663,-0.1722],[-0.1828,-0.1821],[-0.1999,-0.1905],[-0.2164,-0.2004],[-0.2339,-0.2079],[-0.2515,-0.2152],[-0.2698,-0.2207],[-0.2885,-0.2251],[-0.3076,-0.2288],[-0.3261,-0.234],[-0.3462,-0.235],[-0.3668,-0.235],[-0.386,-0.2384],[-0.4066,-0.2384],[-0.4251,-0.237],[-0.4406,-0.2492],[-0.4561,-0.2614],[-0.4717,-0.2737],[-0.4877,-0.2847],[-0.486,-0.2671],[-0.4753,-0.2509],[-0.4711,-0.2334],[-0.4896,-0.2284],[-0.5,-0.216],[-0.4926,-0.1984],[-0.4827,-0.182],[-0.475,-0.1645],[-0.4651,-0.148],[-0.4553,-0.1315],[-0.443,-0.116],[-0.433,-0.0995],[-0.4209,-0.084],[-0.4087,-0.0684],[-0.3941,-0.0539],[-0.3796,-0.0393],[-0.3641,-0.0271],[-0.3485,-0.0149],[-0.3327,-0.0034],[-0.3162,0.0065],[-0.2997,0.0164],[-0.2818,0.023],[-0.265,0.0322],[-0.2476,0.0398],[-0.2445,0.0591],[-0.2411,0.0783],[-0.2378,0.0975],[-0.2345,0.1167],[-0.2333,0.1368],[-0.2279,0.1552],[-0.2213,0.173],[-0.2176,0.1921],[-0.2114,0.2101],[-0.2081,0.2293],[-0.2047,0.2486],[-0.2014,0.2678],[-0.2014,0.2884],[-0.2014,0.309],[-0.2014,0.3296],[-0.2047,0.3488],[-0.2081,0.368],[-0.2114,0.3872],[-0.2036,0.376],[-0.1914,0.3604],[-0.1816,0.3439],[-0.1717,0.3274],[-0.1641,0.3099],[-0.1551,0.2931],[-0.1485,0.2752],[-0.1452,0.256],[-0.1419,0.2368],[-0.1419,0.2162],[-0.1419,0.1956],[-0.1485,0.1777],[-0.1551,0.1599],[-0.1595,0.1411],[-0.167,0.1236],[-0.1722,0.1052],[-0.1725,0.0867],[-0.1569,0.0793],[-0.138,0.0832],[-0.1199,0.0892],[-0.102,0.0958],[-0.0828,0.0991],[-0.0636,0.1024],[-0.0459,0.0995],[-0.0327,0.0968],[-0.0228,0.1133],[-0.0195,0.1325],[-0.0061,0.1456],[0.007,0.1608],[0.0184,0.1767],[0.0269,0.1938],[0.0335,0.2116],[0.0335,0.2322],[0.0368,0.2514],[0.0374,0.2706],[0.0519,0.256],[0.0533,0.236],[0.0533,0.2154],[0.05,0.1962],[0.05,0.1756],[0.0467,0.1564],[0.0401,0.1385],[0.0401,0.1179],[0.0368,0.0987],[0.05,0.0976],[0.063,0.1024],[0.0822,0.0991],[0.1009,0.0945],[0.1193,0.0892],[0.1372,0.0826],[0.1553,0.0766],[0.1729,0.0694],[0.1902,0.0615],[0.2067,0.0516],[0.2232,0.0417],[0.2387,0.0295],[0.2533,0.015],[0.2679,0.0004],[0.2824,-0.0142],[0.297,-0.0287],[0.3116,-0.0433],[0.3224,-0.0575],[0.3346,-0.073],[0.3445,-0.0895],[0.3544,-0.106],[0.3643,-0.1225],[0.3658,-0.1409],[0.371,-0.1582],[0.3842,-0.1694],[0.3968,-0.1848],[0.4077,-0.1989],[0.4222,-0.2135],[0.4338,-0.2293],[0.442,-0.2465],[0.4504,-0.2636],[0.4594,-0.2805],[0.467,-0.298],[0.4768,-0.3145],[0.4867,-0.331],[0.4934,-0.3488],[0.4967,-0.368]];

  function insideWhale(x, y) {
    let inside = false;
    for (let i = 0, j = WHALE_OUTLINE.length - 1; i < WHALE_OUTLINE.length; j = i++) {
      const a = WHALE_OUTLINE[i], b = WHALE_OUTLINE[j];
      if (((a[1] > y) !== (b[1] > y)) && x < (b[0]-a[0])*(y-a[1])/(b[1]-a[1]) + a[0]) inside = !inside;
    }
    return inside;
  }

  function makeWhale(count) {
    const rnd = seeded(61927), points = [];
    const add = (x, y, edge = false) => points.push({ x, y, edge, phase: rnd() * Math.PI * 2, seed: rnd(), sx: 0, sy: 0 });
    const outlineCount = Math.round(count * (count < 400 ? .58 : .43));
    for (let i = 0; i < outlineCount; i++) {
      const u = i * WHALE_OUTLINE.length / outlineCount, a = WHALE_OUTLINE[Math.floor(u) % WHALE_OUTLINE.length], b = WHALE_OUTLINE[(Math.floor(u)+1) % WHALE_OUTLINE.length], t = u-Math.floor(u);
      add(a[0]*(1-t)+b[0]*t, a[1]*(1-t)+b[1]*t, true);
    }
    while (points.length < count) {
      const x = rnd() - .5, y = (rnd() - .5) * .79;
      if (insideWhale(x,y)) add(x,y);
    }
    add(-.438,-.185,true);
    return points;
  }

  function rebuild() {
    width = innerWidth; height = innerHeight; dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px'; canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const mobile = width < 700;
    whale = makeWhale(mobile ? 300 : Math.min(860, Math.round(width * .62)));
    const rnd = seeded(2718), span = Math.min(width * (mobile ? .94 : .75), height * (mobile ? .64 : .75) / .78);
    const cx = width * .51, cy = height * (mobile ? .36 : .38);
    whale.forEach(p => {
      p.tx = cx + p.x * span; p.ty = cy + p.y * span;
      const angle = rnd() * Math.PI * 2, radius = Math.max(width, height) * (.35 + rnd() * .7);
      p.sx = cx + Math.cos(angle) * radius; p.sy = cy + Math.sin(angle) * radius;
    });
    links = [];
    const linkRange = mobile ? 42 : 48;
    for (let i = 0; i < whale.length; i++) {
      const candidates = [];
      for (let j = i + 1; j < whale.length; j++) {
        const dx = whale[i].tx - whale[j].tx, dy = whale[i].ty - whale[j].ty, d = Math.hypot(dx, dy);
        if (d < linkRange) candidates.push([j, d]);
      }
      candidates.sort((a,b) => a[1]-b[1]);
      for (let k = 0; k < Math.min(whale[i].edge ? 3 : 2, candidates.length); k++) links.push([i,candidates[k][0],candidates[k][1]]);
    }
    ambient = Array.from({length: mobile ? 45 : 105}, () => ({x:rnd()*width,y:rnd()*height,r:.4+rnd()*1.25,s:.06+rnd()*.16,a:.12+rnd()*.38}));
  }

  function background(t) {
    const g = ctx.createRadialGradient(width*.52,height*.42,0,width*.52,height*.42,Math.max(width,height)*.78);
    g.addColorStop(0,'#087fa8'); g.addColorStop(.35,'#07577d'); g.addColorStop(.72,'#032c4b'); g.addColorStop(1,'#021522');
    ctx.fillStyle = g; ctx.fillRect(0,0,width,height);
    const glow = ctx.createLinearGradient(0,0,width,height);
    glow.addColorStop(0,'rgba(57,185,241,.08)'); glow.addColorStop(.5,'rgba(0,0,0,0)'); glow.addColorStop(1,'rgba(77,225,209,.05)');
    ctx.fillStyle = glow; ctx.fillRect(0,0,width,height);
    ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(133,220,255,.045)';
    const grid = Math.max(66, width/18), drift = (t*12)%grid;
    for(let x=-grid+drift;x<width+grid;x+=grid){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x-width*.12,height);ctx.stroke()}
    for(let y=-grid;y<height+grid;y+=grid){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y+height*.04);ctx.stroke()}
    ambient.forEach(p => {p.y -= p.s;if(p.y < -5){p.y=height+5;p.x=Math.random()*width}ctx.globalAlpha=p.a;ctx.fillStyle='#9be4ff';ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill()});
    ctx.globalAlpha=1;
  }

  function draw(now) {
    if (!active) return;
    const t = (now - started) / 1000;
    background(t);
    const assemble = ease(fade(.15,1.75,t)), network = fade(1.0,2.25,t), breathe = Math.sin(t*1.35)*3;
    const depart = ease(fade(3.75,4.55,t)), alpha = 1 - fade(4.0,4.55,t);
    const px = pointerX * 10, py = pointerY * 8;
    const positions = whale.map((p,i) => {
      const tail = p.x > .27 ? Math.sin(t*2.1 + (p.x-.27)*10) * Math.pow((p.x-.27)/.23,1.25) * 13 : 0;
      const shimmer = Math.sin(t*1.6+p.phase)*(.7+p.seed*1.4);
      return {x:p.sx+(p.tx-p.sx)*assemble+px+depart*width*.22,y:p.sy+(p.ty-p.sy)*assemble+py+breathe+tail+shimmer,p};
    });
    ctx.save(); ctx.globalAlpha = alpha * network * .72; ctx.lineWidth=.65;
    links.forEach(([a,b,d],n) => {const p=positions[a],q=positions[b];ctx.strokeStyle=`rgba(${n%7===0?'77,225,209':'155,228,255'},${.13+(1-d/50)*.25})`;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke()});
    ctx.restore();
    positions.forEach((q,i) => {
      const pulse = .75 + .25*Math.sin(t*2.1+q.p.phase), eye = i === whale.length-1;
      ctx.globalAlpha = alpha * assemble * (q.p.edge ? .9 : .55) * pulse;
      ctx.fillStyle = eye ? '#ffffff' : (q.p.seed>.92 ? '#4de1d1' : '#9be4ff');
      ctx.shadowColor = eye ? '#fff' : '#39b9f1'; ctx.shadowBlur = eye ? 15 : (q.p.edge ? 7 : 3);
      ctx.beginPath();ctx.arc(q.x,q.y,eye?2.7:(q.p.edge?1.55:1.05),0,Math.PI*2);ctx.fill();
    });
    ctx.shadowBlur=0;ctx.globalAlpha=1;
    const scanX = width*(.08 + .82*fade(1.15,3.25,t));
    ctx.fillStyle='rgba(142,231,255,.10)';ctx.fillRect(scanX,0,1,height);
    if (t < 4.65) frame=requestAnimationFrame(draw); else finish();
  }

  function setUnderlyingInert(value) {
    document.querySelectorAll('body > :not(#whale-intro):not(script)').forEach(el => {
      if (value) el.setAttribute('inert',''); else el.removeAttribute('inert');
    });
  }
  function start(force=false) {
    if (active || (reduceMotion.matches && !force)) return;
    active=true; root.classList.add('whale-intro-pending'); document.body.classList.add('intro-active');
    intro.classList.remove('is-leaving'); intro.classList.add('is-active'); intro.setAttribute('aria-hidden','false');
    setUnderlyingInert(true); rebuild(); started=performance.now();
    try { sessionStorage.setItem(key,'1'); } catch(_) {}
    cancelAnimationFrame(frame); frame=requestAnimationFrame(draw);
  }
  function finish() {
    if(!active) return; active=false; cancelAnimationFrame(frame); intro.classList.add('is-leaving');
    setTimeout(() => {root.classList.remove('whale-intro-pending');document.body.classList.remove('intro-active');intro.classList.remove('is-active','is-leaving');intro.setAttribute('aria-hidden','true');setUnderlyingInert(false)},620);
  }

  skip?.addEventListener('click',finish);
  replay?.addEventListener('click',() => start(true));
  addEventListener('resize',() => {if(active) rebuild()},{passive:true});
  addEventListener('pointermove',e => {pointerX=(e.clientX/innerWidth-.5);pointerY=(e.clientY/innerHeight-.5)},{passive:true});
  addEventListener('keydown',e => {if(active && (e.key==='Escape'||e.key==='Enter'||e.key===' ')) finish()});
  addEventListener('wheel',() => {if(active) finish()},{passive:true});
  addEventListener('touchmove',() => {if(active) finish()},{passive:true});
  if (root.classList.contains('whale-intro-pending')) start(); else {intro.setAttribute('aria-hidden','true');setUnderlyingInert(false)}
})();
