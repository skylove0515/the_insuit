let PAGES = [];
let PARTS = []; // grouped {part, badge, accent, cover, items:[...]}

const viewer = document.getElementById('viewer');
const sidebar = document.getElementById('sidebar');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const pageIndicator = document.getElementById('page-indicator');
const tocToggle = document.getElementById('toc-toggle');

PAGES = window.PAGES_DATA || [];
buildSlides();
buildSidebar();
setupObserver();

function buildSlides() {
  const frag = document.createDocumentFragment();
  PAGES.forEach((p, i) => {
    const slide = document.createElement('div');
    slide.className = 'slide';
    slide.id = 'slide-' + p.page;
    slide.dataset.page = p.page;

    const img = document.createElement('img');
    img.loading = 'lazy';
    img.alt = p.title || p.badge;
    img.dataset.src = 'images/' + p.img;
    slide.appendChild(img);

    frag.appendChild(slide);
  });
  viewer.appendChild(frag);
}

// Lazy-load images as they approach viewport
function setupObserver() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const slide = entry.target;
      const pageNum = parseInt(slide.dataset.page, 10);
      if (entry.isIntersecting) {
        const img = slide.querySelector('img');
        if (img.dataset.src) {
          img.src = img.dataset.src;
          delete img.dataset.src;
        }
        pageIndicator.textContent = pageNum + ' / ' + PAGES.length;
        highlightSidebar(pageNum);
      }
    });
  }, { root: viewer, rootMargin: '200% 0px', threshold: 0.5 });

  document.querySelectorAll('.slide').forEach(s => io.observe(s));
}

// ---------------- Sidebar / TOC ----------------
function buildSidebar() {
  PARTS = [];
  let current = null;
  PAGES.forEach(p => {
    if (p.type === 'cover') {
      current = { part: p.part, badge: p.badge, title: p.title, accent: p.accent, page: p.page, items: [] };
      PARTS.push(current);
    } else if (current) {
      // dedupe items by itemNo
      const last = current.items[current.items.length - 1];
      if (!last || last.itemNo !== p.itemNo) {
        current.items.push({ itemNo: p.itemNo, title: p.title, desc: p.desc, page: p.page });
      }
    }
  });

  const frag = document.createDocumentFragment();
  PARTS.forEach((part, idx) => {
    const wrap = document.createElement('div');
    wrap.className = 'toc-part';
    wrap.id = 'toc-part-' + idx;

    const head = document.createElement('div');
    head.className = 'toc-part-head';
    head.innerHTML = `<span><span class="toc-badge" style="background:${part.accent};color:#0c1e3c">${part.badge}</span>${part.title}</span><span class="chev">▾</span>`;
    head.addEventListener('click', () => {
      const itemsEl = wrap.querySelector('.toc-items');
      const willOpen = !itemsEl.classList.contains('open');
      document.querySelectorAll('.toc-items.open').forEach(el => el.classList.remove('open'));
      if (willOpen) itemsEl.classList.add('open');
      goToPage(part.page);
      maybeAutoCloseSidebar();
    });
    wrap.appendChild(head);

    const itemsEl = document.createElement('div');
    itemsEl.className = 'toc-items';
    part.items.forEach(it => {
      const row = document.createElement('div');
      row.className = 'toc-item';
      row.innerHTML = `<span class="ti-no">${it.itemNo}</span><span>${it.title}</span>`;
      row.addEventListener('click', (e) => {
        e.stopPropagation();
        goToPage(it.page);
        maybeAutoCloseSidebar();
      });
      itemsEl.appendChild(row);
    });
    wrap.appendChild(itemsEl);
    frag.appendChild(wrap);
  });
  sidebar.appendChild(frag);
}

function highlightSidebar(pageNum) {
  // Sidebar accordion open/close state is controlled solely by user clicks
  // on the part header (see buildSidebar). Scrolling/page changes must not
  // alter that state, so this function intentionally does nothing now.
}

const sidebarBackdrop = document.getElementById('sidebar-backdrop');
const MOBILE_BREAKPOINT = 900;

function isMobile() {
  return window.innerWidth <= MOBILE_BREAKPOINT;
}

// On mobile/tablet, sidebar starts collapsed (off-canvas overlay)
if (isMobile()) {
  sidebar.classList.add('collapsed');
}

tocToggle.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
});

// Tap backdrop to close the overlay sidebar on mobile
sidebarBackdrop.addEventListener('click', () => {
  sidebar.classList.add('collapsed');
});

// Auto-collapse sidebar on mobile after picking a TOC item
function maybeAutoCloseSidebar() {
  if (isMobile()) sidebar.classList.add('collapsed');
}

// Re-evaluate collapsed state on resize/orientation change
window.addEventListener('resize', () => {
  if (isMobile()) {
    sidebar.classList.add('collapsed');
  } else {
    sidebar.classList.remove('collapsed');
  }
});

// Register service worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

// ---------------- Navigation ----------------
function goToPage(pageNum) {
  const slide = document.getElementById('slide-' + pageNum);
  if (slide) {
    // ensure image loaded immediately
    const img = slide.querySelector('img');
    if (img.dataset.src) {
      img.src = img.dataset.src;
      delete img.dataset.src;
    }
    slide.scrollIntoView({ behavior: 'auto', block: 'start' });
    pageIndicator.textContent = pageNum + ' / ' + PAGES.length;
  }
}

document.getElementById('jump-top').addEventListener('click', () => goToPage(1));
document.getElementById('jump-up').addEventListener('click', () => {
  const cur = currentPage();
  if (cur > 1) goToPage(cur - 1);
});
document.getElementById('jump-down').addEventListener('click', () => {
  const cur = currentPage();
  if (cur < PAGES.length) goToPage(cur + 1);
});

function currentPage() {
  // Compute from actual scroll position so keyboard navigation is reliable
  // regardless of mouse-wheel scroll direction/state.
  const idx = Math.round(viewer.scrollTop / viewer.clientHeight);
  const n = idx + 1;
  if (n < 1) return 1;
  if (n > PAGES.length) return PAGES.length;
  return n;
}

// keyboard navigation
document.addEventListener('keydown', (e) => {
  if (document.activeElement === searchInput) return;
  if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); goToPage(Math.min(currentPage() + 1, PAGES.length)); }
  if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); goToPage(Math.max(currentPage() - 1, 1)); }
  if (e.key === 'Home') { e.preventDefault(); goToPage(1); }
  if (e.key === 'End') { e.preventDefault(); goToPage(PAGES.length); }
});

// ---------------- Search ----------------
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function highlight(text, q) {
  if (!text) return '';
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return escapeHtml(text);
  return escapeHtml(text.slice(0, idx)) + '<mark>' + escapeHtml(text.slice(idx, idx + q.length)) + '</mark>' + escapeHtml(text.slice(idx + q.length));
}

searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim();
  if (!q) {
    searchResults.classList.remove('show');
    searchResults.innerHTML = '';
    return;
  }
  const ql = q.toLowerCase();
  const matches = PAGES.filter(p => {
    const hay = [p.title, p.desc, p.badge].concat(p.keywords || []).filter(Boolean).join(' ').toLowerCase();
    return hay.includes(ql);
  }).slice(0, 40);

  if (matches.length === 0) {
    searchResults.innerHTML = '<div class="result-item"><span class="r-meta">검색 결과가 없습니다.</span></div>';
  } else {
    searchResults.innerHTML = matches.map(p => {
      const matchedKw = (p.keywords || []).find(k => k.toLowerCase().includes(ql));
      const titleHtml = p.title ? highlight(p.title, q) : highlight(p.badge, q);
      const metaParts = [p.badge, p.page + ' / ' + PAGES.length + '페이지'];
      if (matchedKw && matchedKw !== p.title) metaParts.push('키워드: ' + matchedKw);
      return `<div class="result-item" data-page="${p.page}">
        <span class="r-title">${titleHtml}</span>
        <span class="r-meta">${metaParts.join(' · ')}</span>
      </div>`;
    }).join('');
  }
  searchResults.classList.add('show');

  searchResults.querySelectorAll('.result-item[data-page]').forEach(el => {
    el.addEventListener('click', () => {
      goToPage(parseInt(el.dataset.page, 10));
      searchResults.classList.remove('show');
      searchInput.blur();
    });
  });
});

document.addEventListener('click', (e) => {
  if (!searchResults.contains(e.target) && e.target !== searchInput) {
    searchResults.classList.remove('show');
  }
});

searchInput.addEventListener('focus', () => {
  if (searchInput.value.trim()) searchResults.classList.add('show');
});
