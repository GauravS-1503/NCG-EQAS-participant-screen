// /assets/include.js  (participant)
(function () {
  // Compute base for GitHub Pages reliably
  function computeBase() {
    // If served from *.github.io/<repo>/..., base should be "/<repo>"
    const gh = location.hostname.endsWith('github.io');
    if (gh) {
      const segs = location.pathname.split('/').filter(Boolean);
      return segs.length ? '/' + segs[0] : '';
    }
    // Fallback: infer from this script's src (works locally too)
    const s = document.querySelector('script[src*="include.js"]');
    if (!s) return '';
    const u = new URL(s.getAttribute('src'), location.href);
    return (u.pathname.replace(/\/assets\/.*$/, '') || '');
  }

  async function inject(sel, rel) {
    const host = document.querySelector(sel);
    if (!host) return;

    const base = computeBase();            // e.g. "/NCG-EQAS-participant-screen"
    const url  = `${base}/${rel}`.replace(/\/+/g, '/');

    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const html = await res.text();

      // Parse and safely rewrite URLs
      const tpl = document.createElement('template');
      tpl.innerHTML = html;

      const rewrite = (el, attr) => {
        const v = el.getAttribute(attr);
        if (!v) return;

        // Absolute/external/hash → leave as is
        if (/^(https?:)?\/\//i.test(v) || v.startsWith('data:') || v.startsWith('#')) return;

        let out = v;

        if (v.startsWith('/')) {
          // Root-relative → prefix repo base
          out = `${base}${v}`;
        } else {
          // Plain relative → clean ./ and ../ then prefix base
          let cleaned = v.replace(/^(\.\/)+/, '');
          while (cleaned.startsWith('../')) cleaned = cleaned.slice(3);
          out = `${base}/${cleaned}`;
        }

        out = out.replace(/\/+/g, '/');

        // Dev aid: see what changed (open DevTools → Console)
        if (v !== out) console.log('[include] rewrite', attr, v, '→', out);

        el.setAttribute(attr, out);
      };

      tpl.content.querySelectorAll('[src]').forEach(n => rewrite(n, 'src'));
      tpl.content.querySelectorAll('[href]').forEach(n => rewrite(n, 'href'));

      host.innerHTML = '';
      host.appendChild(tpl.content);
    } catch (err) {
      console.error('[include] failed:', url, err);
    }
  }

  function markActive() {
    const segs = location.pathname.split('/').filter(Boolean);
    let keySeg = segs[segs.length - 1] || '';
    if (keySeg.includes('.')) keySeg = segs[segs.length - 2] || keySeg; // prefer folder
    const folder = decodeURIComponent(keySeg).toLowerCase();

    document.querySelectorAll('#sidebarMenu a[data-link]').forEach(a => {
      const key = (a.getAttribute('data-link') || '').toLowerCase();
      if (key && (folder === key || folder.includes(key))) {
        a.classList.add('text-primary');
        a.classList.remove('text-white');
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
