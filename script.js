// VECTOR Books · reader size — zero dependencies.
// <section class="rb" data-assets="assets/"></section> becomes the whole app: home and the reader.
// A+ makes the text really larger: font-size changes, the lines wrap again, pages and chapters recount.
// "Keep my line in place": the marked line and its ribbon stay at the same height of the page,
// the text above grows upwards past the top of the page, the text below grows downwards.
;(() => {
  'use strict';

  const svg = (d, o = {}) => `<svg width="${o.s || 18}" height="${o.s || 18}" viewBox="0 0 24 24" fill="none" stroke="${o.c || 'currentColor'}" stroke-width="${o.w || 1.8}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const P = {
    home: '<path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z"/>',
    library: '<path d="M5 4h4v16H5zM11 4h4v16h-4zM16.5 5.2l3.8-1 3.2 15.5-3.8 1z"/>',
    reading: '<path d="M3 5c3.5-1.2 6-.8 9 1v13c-3-1.8-5.5-2.2-9-1zM21 5c-3.5-1.2-6-.8-9 1v13c3-1.8 5.5-2.2 9-1z"/>',
    highlights: '<path d="m14 4 6 6-9 9H5v-6z"/><path d="M4 21h16"/>',
    club: '<circle cx="9" cy="9" r="3.5"/><path d="M3 20c.8-3.4 3-5 6-5s5.2 1.6 6 5"/><path d="M16 5.5a3.5 3.5 0 0 1 0 7M18 15c1.6.7 2.6 2.4 3 5"/>',
    audio: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>',
    store: '<path d="M4 8h16l-1.5 12h-13z"/><path d="M9 8a3 3 0 0 1 6 0"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    upload: '<path d="M12 15V4M7 9l5-5 5 5M5 20h14"/>',
    bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>',
    clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
  };
  const NAV = [['home', 'Home'], ['library', 'Library'], ['reading', 'Reading now', '<small data-home-only>3</small>'], ['highlights', 'Highlights', '<small>24</small>'], ['club', 'Book club', '<span class="rb-badge">3</span>'], ['audio', 'Audiobooks'], ['store', 'Store']];
  const CHAPTERS = ['The Ferry', 'Salt and Paper', 'The Island Letter', 'Low Tide', 'Father’s Coat', 'The Stairs', 'The Lamp Room', 'Answering Light', 'The Quay', 'The House', 'Winter Ferry'];
  const CH_AT_18 = [1, 24, 51, 79, 104, 127, 139, 163, 190, 221, 255];   // first page of each chapter at 18 px
  // the text size scale: six steps, 18 px is where Nora reads
  const SIZES = [14, 16, 18, 22, 26, 30];
  const PAGES_K = [0.6, 0.79, 1, 1.49, 2.09, 2.78];                     // book length relative to 18 px
  const WORDS = [13, 11, 10, 8, 7, 6];
  const DOTS = [6, 7, 9, 10, 11, 12];
  const ANCHOR = 300, TEXT_TOP = 56, TEXT_BOTTOM = 700;                 // px from the top of the page
  const REFLOW_MS = 520;
  const BEFORE = [
    'The stairs climbed in a slow spiral, one hundred and twelve steps worn soft in the middle, and Elsa counted them the way her father had taught her, out loud and without hurry. At the forty-first step the wind found the gap under the old door and began to whistle a note she remembered from every winter of her childhood.',
    'The lamp room was smaller than she expected. A brass rail ran around the lens, green where hands had held it, and the glass was furred with salt on the sea side. On the shelf under the window lay his logbook, open at the third of November, the ink still sharp: wind north-east, visibility poor, one light seen off the point at twenty to ten.',
    'She read the line twice. There had been no ships due that night, no ferry, no fishing boats out in that weather. Only her mother, rowing back from the island with the doctor’s letter folded inside her coat.',
  ];
  const AFTER = [
    '<mark>She understood then that the lamp had never been meant for the ships at all.</mark> It had been lit, night after night, for a single small boat and the one person in it, so that there would always be a fixed point on the dark water to row towards.',
    'Elsa closed the logbook and turned the brass handle the way he used to, a quarter turn and then another. Somewhere below her the mechanism woke with a sound like a clock clearing its throat, and the great lens began, very slowly, to move.',
    'Out on the water the first beam swept across the harbour mouth, across the moored boats and the empty quay, and out past the point where the island sat low and black against the last of the light.',
  ];

  class ReaderApp {
    constructor(root) {
      this.root = root;
      const A = root.dataset.assets || 'assets/';
      const img = (n, cls, alt = '', st = '') => `<img src="${A}${n}.jpg" class="${cls}" alt="${alt}"${st ? ` style="${st}"` : ''}>`;
      const search = (w, ph) => `<label class="rb-search" style="width:${w}px">${svg(P.search, { s: 16, w: 2 })}<span class="rb-sr">Search</span><input type="search" placeholder="${ph}"></label>`;
      const bell = `<button class="rb-ib" type="button" aria-label="Notifications, 1 new">${svg(P.bell, { s: 19 })}<i></i></button>`;
      root.innerHTML = `
<nav class="rb-side" aria-label="Main">
  <div class="rb-logo"><svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true"><path d="M3 6c4-1.6 7-1.2 10 1v14c-3-2.2-6-2.6-10-1z" fill="none" stroke="#E3A341" stroke-width="2" stroke-linejoin="round"/><path d="M23 6c-4-1.6-7-1.2-10 1v14c3-2.2 6-2.6 10-1z" fill="none" stroke="#EDEAE3" stroke-width="2" stroke-linejoin="round"/></svg><b>VECTOR</b><span>Books</span></div>
  ${NAV.map(([k, t, extra = '']) => `<a class="rb-nav" href="#" data-nav="${k}">${svg(P[k])}${t}${extra}</a>`).join('')}
  <div class="rb-goal"><div class="rb-small">Reading goal 2026</div><div class="rb-strong" style="margin-top:4px">31 of 40 books</div><div class="rb-bar" style="margin-top:10px"><i style="width:77%"></i></div></div>
  <div class="rb-me">${img('nora', 'rb-av l')}<div><div class="rb-strong">Nora Venn</div><div class="rb-tiny">Reader since 2021</div></div></div>
</nav>
<div class="rb-col">
  <div class="rb-view" data-view="home">
    <header class="rb-top">${search(460, 'Search books, authors, your notes')}
      <button class="rb-ghost" type="button" style="margin-left:auto">${svg(P.upload, { s: 16, w: 2 })}Add a book</button>${bell}${img('nora', 'rb-av l', 'Nora Venn')}</header>
    <div class="rb-home-body">
      <main class="rb-home-main">
        <div><h1 class="rb-h1">Good evening, Nora</h1><p class="rb-sub">You read 42 minutes today · Chapter 7 is waiting where you left it</p></div>
        <section class="rb-cont" aria-label="Continue reading">
          <div class="rb-card rb-hero">${img('cover-harbour', 'rb-cv', 'Cover of The Quiet Harbour', 'width:150px;height:225px')}
            <div class="rb-hero-b">
              <div style="font-size:12.5px;color:var(--rb-lamp);font-weight:600">Continue reading</div>
              <div style="font-size:22px;font-weight:700;margin-top:8px;letter-spacing:-.01em">The Quiet Harbour</div>
              <div style="font-size:14px;color:var(--rb-muted);margin-top:4px">Ines Valk · 2 h 40 min left</div>
              <div class="rb-quote"><mark>She understood then that the lamp had never been meant for the ships at all.</mark><small>Your place · page 142</small></div>
              <div class="rb-row" style="margin-top:16px;font-size:12.5px"><span style="color:var(--rb-muted)">Chapter 7 · The Lamp Room</span><span>37%</span></div>
              <div class="rb-bar" style="margin-top:8px"><i style="width:37%"></i></div>
              <div style="display:flex;gap:10px;margin-top:auto;padding-top:16px">
                <button class="rb-go" type="button" data-continue>Continue</button>
                <button class="rb-ghost" type="button" style="height:40px;padding:0 16px;font-size:14px">Notes · 12</button>
              </div>
            </div>
          </div>
          <div class="rb-more">
            <div class="rb-card rb-mini">${img('cover-orchard', 'rb-cv', '', 'width:72px;height:108px')}<div style="flex:1;min-width:0"><div style="font-size:15px;font-weight:600">The Orchard Year</div><div class="rb-small" style="margin-top:3px">Mateo Lind</div><div class="rb-bar" style="margin-top:14px"><i style="width:64%"></i></div><div class="rb-tiny" style="margin-top:8px">64% · 1 h 10 min left</div></div></div>
            <div class="rb-card rb-mini">${img('cover-city', 'rb-cv', '', 'width:72px;height:108px')}<div style="flex:1;min-width:0"><div style="font-size:15px;font-weight:600">Night Shift on Linden Street</div><div class="rb-small" style="margin-top:3px">Ada Ross · audiobook</div><div class="rb-bar" style="margin-top:14px"><i style="width:12%"></i></div><div class="rb-tiny" style="margin-top:8px">12% · 6 h 25 min left</div></div></div>
          </div>
        </section>
        <section aria-label="Up next">
          <div class="rb-h" style="margin-bottom:12px"><h2 style="font-size:17px">Up next on your shelf</h2><a href="#" style="font-size:13px;color:var(--rb-lamp)">Library · 86 books</a></div>
          <div class="rb-shelf">${[['cover-desert', 'Dry Season', 'Samir Okafor', '7 h · from Theo'], ['cover-mountain', 'Above the Pass', 'Liv Arnesen', '5 h · memoir'], ['cover-ocean', 'Open Water', 'June Calder', '4 h · club pick']].map(([c, t, a, m]) =>
            `<a href="#" class="rb-card">${img(c, 'rb-cv', '', 'width:80px;height:120px')}<span><span style="display:block;font-size:14px;font-weight:600">${t}</span><span class="rb-small" style="display:block;margin-top:3px">${a}</span><span class="rb-tiny" style="display:block;margin-top:10px">${m}</span></span></a>`).join('')}</div>
        </section>
        <section class="rb-card rb-week" aria-label="This week">
          <div class="rb-strong" style="width:110px">This week</div>
          <div class="rb-days">${[['M', 22], ['T', 40], ['W', 17], ['T', 49], ['F', 31], ['S', 36], ['S', 45]].map(([d, h]) => `<span><i style="height:${h}px"></i>${d}</span>`).join('')}</div>
          <div class="rb-small" style="line-height:1.5;width:150px">4 h 52 min read<br>6-day streak</div>
        </section>
      </main>
      <aside class="rb-home-side" aria-label="Book club and highlights">
        <section class="rb-card rb-box" style="gap:14px">
          <div class="rb-h"><h2>Harbour readers</h2><span class="rb-small">Thu, 19:00</span></div>
          <div class="rb-msg">${img('theo', 'rb-av m')}<div><p>Read the lamp room scene twice. Who else?</p><div class="rb-tiny" style="margin-top:3px">Theo Marsh · 2 h</div></div></div>
          <div class="rb-msg">${img('amara', 'rb-av m')}<div><p>Finished chapter 8, no spoilers on Thursday</p><div class="rb-tiny" style="margin-top:3px">Amara Diallo · 1 d</div></div></div>
          <button class="rb-wide" type="button">Open discussion</button>
        </section>
        <section class="rb-card rb-box">
          <div class="rb-h"><h2>Recent highlights</h2><span class="rb-small">24</span></div>
          <div class="rb-hl">The ferry left at six, and nobody on the quay waved back.<div class="rb-tiny" style="margin-top:4px">The Quiet Harbour · ch. 1</div></div>
          <div class="rb-hl">Every tree kept a little of the frost until noon.<div class="rb-tiny" style="margin-top:4px">The Orchard Year · ch. 9</div></div>
        </section>
        <section class="rb-card rb-box" style="flex-direction:row;align-items:center;gap:14px"><i class="rb-tile">${svg(P.bookmark, { s: 20 })}</i><div><div class="rb-strong">Synced on 3 devices</div><div class="rb-small" style="margin-top:2px">Laptop · phone · e-reader</div></div></section>
        <section class="rb-card rb-box">
          <div class="rb-h"><h2>Finished this month</h2><span class="rb-small">3 books</span></div>
          <div class="rb-row"><span>The Salt Road</span><span>Nov 18 · 5/5</span></div>
          <div class="rb-row"><span>Small Hours</span><span>Nov 9 · 4/5</span></div>
          <div class="rb-row"><span>A Room for Paper</span><span>Nov 2 · 4/5</span></div>
        </section>
      </aside>
    </div>
  </div>

  <div class="rb-view" data-view="reader">
    <header class="rb-top"><nav class="rb-crumbs" aria-label="Breadcrumb"><a href="#" data-nav-to="home">Reading now</a><span>/</span><b>The Quiet Harbour</b></nav>
      <span style="margin-left:auto"></span>${search(380, 'Search in this book, notes, library')}${bell}${img('nora', 'rb-av l', 'Nora Venn')}</header>
    <div class="rb-read">
      <aside class="rb-toc-col" aria-label="Contents">
        <div class="rb-book">${img('cover-harbour', 'rb-cv', 'Cover of The Quiet Harbour', 'width:58px;height:87px;box-shadow:0 6px 14px rgba(0,0,0,.45)')}<div><div class="rb-strong" style="line-height:1.25">The Quiet Harbour</div><div class="rb-small" style="margin-top:3px">Ines Valk</div><div class="rb-tiny rb-num" style="margin-top:8px"><span data-pages></span> pages</div></div></div>
        <div class="rb-card rb-toc"><div class="rb-small" style="padding:6px 10px">Contents</div>
          ${CHAPTERS.map((t, i) => `<a href="#"${i === 6 ? ' class="is-on" aria-current="true"' : ''}><b>${i + 1}</b><span>${t}</span><em data-ch="${i}"></em></a>`).join('')}</div>
        <div class="rb-card" style="padding:14px"><div class="rb-row" style="font-size:12.5px"><span style="color:var(--rb-muted)">Book progress</span><span style="color:var(--rb-text);font-weight:600">37%</span></div><div class="rb-bar" style="margin-top:9px"><i style="width:37%"></i></div><div class="rb-tiny" style="margin-top:9px">2 h 40 min left · 9 min in chapter</div></div>
        <div class="rb-card" style="padding:14px;display:flex;align-items:center;gap:12px"><i class="rb-tile" style="width:36px;height:36px">${svg(P.clock)}</i><div><div style="font-size:13.5px;font-weight:600">24 min tonight</div><div class="rb-tiny" style="margin-top:2px">Started at 21:12 · 6-day streak</div></div></div>
      </aside>
      <main class="rb-main">
        <div class="rb-tools"><span class="rb-small" style="font-size:13px">Chapter 7 of 12</span><span style="margin-left:auto"></span>
          <button class="rb-tb" type="button" aria-label="Search in book">${svg(P.search, { s: 17 })}</button>
          <button class="rb-tb" type="button" aria-label="Bookmark">${svg(P.bookmark, { s: 17 })}</button>
          <button class="rb-tb" type="button" aria-label="Display settings" aria-pressed="false" data-aa>Aa</button></div>
        <article class="rb-page" aria-label="Chapter 7, The Lamp Room">
          <div class="rb-run"><span>Ines Valk</span><span>7 · The Lamp Room</span></div>
          <div class="rb-ribbon" aria-hidden="true" style="top:${ANCHOR}px"></div>
          <div class="rb-before">${BEFORE.map(p => `<p>${p}</p>`).join('')}</div>
          <div class="rb-after" style="top:${ANCHOR}px">${AFTER.map(p => `<p>${p}</p>`).join('')}</div>
          <div class="rb-foot"><span>Page <span data-page></span> of <span data-pages></span></span><div><i></i></div><span>9 min left in chapter</span></div>
        </article>
      </main>
      <aside class="rb-right" aria-label="Display and notes">
        <section class="rb-card rb-box rb-display" data-when="on" aria-label="Display">
          <div class="rb-h"><h2>Display</h2><button type="button" class="rb-small" data-reset-size>Reset</button></div>
          <div>
            <div class="rb-row" style="font-size:12.5px"><span style="color:var(--rb-muted)">Text size</span><span class="rb-num" style="color:var(--rb-text);font-weight:600"><span data-fs></span> px</span></div>
            <div class="rb-size">
              <button class="rb-step" type="button" data-step="-1" aria-label="Smaller text">A−</button>
              <div class="rb-dots" aria-hidden="true">${DOTS.map(d => `<i style="width:${d}px;height:${d}px"></i>`).join('')}</div>
              <button class="rb-step" type="button" data-step="1" aria-label="Larger text">A+</button>
            </div>
            <div class="rb-row rb-num" style="font-size:12px;margin-top:10px"><span style="color:var(--rb-muted)"><span data-lines></span> lines a page</span><span>≈ <span data-words></span> words a line</span></div>
          </div>
          <div class="rb-keep">${svg(P.bookmark)}<div style="flex:1;color:var(--rb-text)"><div style="font-size:13.5px;font-weight:600">Keep my line in place</div><div class="rb-tiny" style="margin-top:2px">When text size changes</div></div><button class="rb-switch" type="button" role="switch" aria-checked="true" aria-label="Keep my line in place" data-keep></button></div>
          <div><div class="rb-small" style="margin-bottom:8px">Line spacing</div><div class="rb-segs"><button class="rb-seg" type="button" aria-pressed="false">Tight</button><button class="rb-seg" type="button" aria-pressed="true">Normal</button><button class="rb-seg" type="button" aria-pressed="false">Loose</button></div></div>
          <div><div class="rb-small" style="margin-bottom:8px">Page</div><div class="rb-papers">
            <button type="button" aria-pressed="true" style="background:#ECE6DA;color:#24211C">Paper</button>
            <button type="button" aria-pressed="false" style="background:#D9C7A4;color:#3A2E1C">Sepia</button>
            <button type="button" aria-pressed="false" style="background:#1A1C24;color:#C9CBD4;border:1px solid #2A2D39">Night</button></div></div>
        </section>
        <section class="rb-card rb-box" data-when="off">
          <div class="rb-h"><h2>Bookmarks</h2><span class="rb-small">4</span></div>
          <div class="rb-row"><span>3 · The doctor’s letter</span><span>p. 58</span></div>
          <div class="rb-row"><span>5 · Father’s coat</span><span>p. 111</span></div>
          <div class="rb-row"><span>6 · The forty-first step</span><span>p. 133</span></div>
          <div class="rb-row"><span style="color:var(--rb-text);font-weight:600">7 · Your place</span><span style="color:var(--rb-lamp)">p. <span data-page></span></span></div>
        </section>
        <section class="rb-card rb-box" data-when="off" style="gap:10px">
          <div class="rb-h"><h2>About this book</h2><span class="rb-small">4.6 / 5</span></div>
          <div style="font-size:13px;color:var(--rb-text-2);line-height:1.5">A daughter returns to the island lighthouse her father kept for forty years.</div>
          <div class="rb-tiny">Novel · 2025 · Harbour readers pick</div>
        </section>
        <section class="rb-card rb-box" data-slide>
          <div class="rb-h"><h2>Notes in chapter 7</h2><span class="rb-small">3</span></div>
          <div class="rb-msg" style="gap:10px">${img('nora', 'rb-av')}<div><p style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">“The lamp had never been meant for the ships”</p><div class="rb-tiny" style="margin-top:2px">You · page <span data-page></span></div></div></div>
          <div class="rb-msg" style="gap:10px">${img('theo', 'rb-av')}<div><p>Read this line twice too.</p><div class="rb-tiny" style="margin-top:2px">Theo · Book club · 2 h</div></div></div>
          <div class="rb-msg" style="gap:10px">${img('amara', 'rb-av')}<div><p>The logbook page gets me every time.</p><div class="rb-tiny" style="margin-top:2px">Amara · Book club · 1 d</div></div></div>
        </section>
        <section class="rb-card rb-box" data-slide>
          <div class="rb-h"><h2>Harbour readers</h2><span class="rb-small">Thu, 19:00</span></div>
          <div style="display:flex;align-items:center;gap:12px"><div class="rb-stack">${img('theo', 'rb-av m')}${img('amara', 'rb-av m')}${img('nora', 'rb-av m')}<span>+5</span></div><div class="rb-small">Chapters 7–8 this week</div></div>
          <button class="rb-wide" type="button">Open discussion</button>
        </section>
      </aside>
    </div>
  </div>
</div>`;
      const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
      this.views = $$('.rb-view');
      this.navs = $$('.rb-nav');
      this.aa = $('[data-aa]');
      this.page = $('.rb-page');
      this.ribbon = $('.rb-ribbon');
      this.before = $('.rb-before');
      this.after = $('.rb-after');
      this.dots = $$('.rb-dots i');
      this.steps = $$('.rb-step');
      this.out = { fs: $$('[data-fs]'), page: $$('[data-page]'), pages: $$('[data-pages]'), lines: $$('[data-lines]'), words: $$('[data-words]'), ch: $$('[data-ch]') };
      this.raf = 0;

      $('[data-continue]').addEventListener('click', () => this.go('reader'));
      $('[data-nav="home"]').addEventListener('click', e => { e.preventDefault(); this.go('home'); });
      $('[data-nav="reading"]').addEventListener('click', e => { e.preventDefault(); this.go('reader'); });
      $('[data-nav-to="home"]').addEventListener('click', e => { e.preventDefault(); this.go('home'); });
      this.aa.addEventListener('click', () => this.setDisplay(this.root.dataset.display !== 'on'));
      this.steps.forEach(b => b.addEventListener('click', () => this.setSize(this.size + +b.dataset.step)));
      $('[data-reset-size]').addEventListener('click', () => this.setSize(2));
      $('[data-keep]').addEventListener('click', e => { const b = e.currentTarget; b.setAttribute('aria-checked', b.getAttribute('aria-checked') !== 'true'); });
      $$('.rb-seg, .rb-papers button').forEach(b => b.addEventListener('click', () => {
        b.parentElement.querySelectorAll('[aria-pressed]').forEach(x => x.setAttribute('aria-pressed', x === b));
      }));
      // press feedback that also works for synthetic pointer events
      $$('.rb-go, .rb-tb, .rb-step').forEach(b => {
        b.addEventListener('pointerdown', () => b.classList.add('is-press'));
        ['pointerup', 'pointerleave'].forEach(t => b.addEventListener(t, () => b.classList.remove('is-press')));
      });
      this.reset();
    }

    go(view, quiet = false) {
      if (quiet) this.instant();
      this.root.dataset.view = view;
      this.views.forEach(v => v.classList.toggle('is-on', v.dataset.view === view));
      this.navs.forEach(n => n.classList.toggle('is-on', n.dataset.nav === (view === 'reader' ? 'reading' : 'home')));
    }

    // Aa: the Display panel takes the place of Bookmarks and About; the cards below slide down to their new place
    setDisplay(on, quiet = false) {
      const slide = [...this.root.querySelectorAll('[data-slide]')];
      const was = slide.map(el => el.getBoundingClientRect().top);
      this.root.dataset.display = on ? 'on' : 'off';
      this.aa.setAttribute('aria-pressed', on);
      if (quiet || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const k = this.root.getBoundingClientRect().width / this.root.offsetWidth || 1;
      slide.forEach((el, i) => {
        const dy = (was[i] - el.getBoundingClientRect().top) / k;
        if (dy) el.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.16,1,.3,1)' });
      });
      const panel = this.root.querySelector(`[data-when="${on ? 'on' : 'off'}"]`);
      panel.animate([{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.16,1,.3,1)' });
    }

    // A+ / A−: the real text size changes; numbers count to the new book length while the lines wrap again
    setSize(i, quiet = false) {
      i = Math.max(0, Math.min(SIZES.length - 1, i));
      const from = this.shown || this.values(i), to = this.values(i);
      this.size = i;
      this.dots.forEach((d, n) => d.classList.toggle('is-on', n <= i));
      this.steps[0].disabled = i === 0;
      this.steps[1].disabled = i === SIZES.length - 1;
      cancelAnimationFrame(this.raf);
      if (quiet || matchMedia('(prefers-reduced-motion: reduce)').matches) return this.paint(to);
      const t0 = performance.now();
      const tick = () => {
        const p = Math.min(1, (performance.now() - t0) / REFLOW_MS), e = (1 - Math.cos(Math.PI * p)) / 2;   // sine: the lines keep wrapping through the whole move
        this.paint(this.mix(from, to, e));
        if (p < 1) this.raf = requestAnimationFrame(tick);
      };
      this.raf = requestAnimationFrame(tick);
    }

    values(i) {
      const k = PAGES_K[i];
      return { fs: SIZES[i], page: 142 * k, pages: 388 * k, words: WORDS[i], ch: CH_AT_18.map((p, n) => n ? p * k : 1) };
    }

    mix(a, b, e) {
      const m = (x, y) => x + (y - x) * e;
      return { fs: m(a.fs, b.fs), page: m(a.page, b.page), pages: m(a.pages, b.pages), words: m(a.words, b.words), ch: a.ch.map((x, n) => m(x, b.ch[n])) };
    }

    // one frame of the reflow: font-size and line-height change for real (no transform), so the browser wraps the lines again;
    // the boxes hold whole lines only, the box above ends and the box below starts at the anchor line
    paint(v) {
      this.shown = v;
      const L = Math.round(v.fs * 16) / 10;
      const above = Math.floor((ANCHOR - TEXT_TOP) / L) * L, below = Math.floor((TEXT_BOTTOM - ANCHOR) / L) * L;
      const type = `font-size:${v.fs}px;line-height:${L}px`;
      this.before.style.cssText = `${type};top:${ANCHOR - above}px;height:${above}px`;
      this.after.style.cssText = `${type};top:${ANCHOR}px;height:${below}px`;
      this.ribbon.style.height = `${L}px`;
      const put = (els, x) => els.forEach(el => { el.textContent = Math.round(x); });
      put(this.out.fs, v.fs); put(this.out.page, v.page); put(this.out.pages, v.pages); put(this.out.words, v.words);
      put(this.out.lines, Math.floor((TEXT_BOTTOM - TEXT_TOP) / L));
      this.out.ch.forEach((el, n) => { el.textContent = Math.round(v.ch[n]); });
    }

    instant() {
      this.root.classList.add('is-instant');
      requestAnimationFrame(() => requestAnimationFrame(() => this.root.classList.remove('is-instant')));
    }

    reset() {
      this.shown = null;
      this.setSize(2, true);
      this.setDisplay(false, true);
      this.go('home', true);
    }
  }

  document.querySelectorAll('.rb').forEach(el => { el.readerApp = new ReaderApp(el); });
})();
