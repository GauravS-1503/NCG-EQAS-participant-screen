// /assets/include.js (participant)
(function () {
  function computeBase() {
    // Find where this script was loaded from, then strip trailing /assets/...
    const s = document.querySelector('script[src*="include.js"]');
    if (!s) return '';
    const u = new URL(s.getAttribute('src'), location.href);
    return u.pathname.replace(/\/assets\/.*$/, '') || '';
  }

  async function inject(sel, rel) {
    const host = document.querySelector(sel);
    if (!host) return;

    const base = computeBase();
    const url  = `${base}/${rel}`.replace(/\/+/g, '/');

    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

      // Keep fragment-relative assets working from the same base
      let html = await res.text();
      html = html.replace(
        /(src|href)="(?!https?:|\/\/|data:|#|\/)/g,
        `$1="${base}/`
      );
      host.innerHTML = html;
    } catch (err) {
      console.error('[include] failed:', url, err);
    }
  }

  function markActive() {
    const segs = location.pathname.split('/').filter(Boolean);
    let keySeg = segs[segs.length - 1] || '';
    if (keySeg.includes('.')) keySeg = segs[segs.length - 2] || keySeg; // use folder, not file
    const folder = decodeURIComponent(keySeg).toLowerCase();

    document.querySelectorAll('#sidebarMenu a[data-link]').forEach(a => {
      const key = (a.getAttribute('data-link') || '').toLowerCase();
      if (key && (folder === key || folder.includes(key))) {
        a.classList.add('text-primary');
        a.classList.remove('text-white');
      }
    });

    // If using collapsible groups, auto-open the active one
    document.querySelectorAll('#sidebarMenu a.text-primary').forEach(a => {
      const col = a.closest('.collapse');
      if (col && !col.classList.contains('show')) {
        col.classList.add('show');
        const trigger = document.querySelector(
          `[href="#${col.id}"][data-bs-toggle="collapse"]`
        );
        if (trigger) trigger.setAttribute('aria-expanded', 'true');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', async () => {
    await inject('#header',  'components/header.html');
    await inject('#sidebar', 'components/sidebar.html');
    markActive();

    const btn = document.getElementById('menuToggle');
    const sb  = document.getElementById('sidebarMenu');
    if (btn && sb) btn.addEventListener('click', () => sb.classList.toggle('collapsed'));
  });
})();
