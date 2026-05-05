/**
 * nav-pubs.js
 * Fetches publications.json and injects a collapsible sub-list
 * under the "Publications" link in the sidebar nav.
 * Each item links to pdf-viewer.html with the matching PDF.
 */

// Inject CSS once
(function injectCSS() {
  const style = document.createElement('style');
  style.textContent = `
    .nav-pub-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .nav-pub-row > a {
      flex: 1;
    }
    .nav-pub-toggle {
      background: none;
      border: none;
      cursor: pointer;
      font-family: var(--mono, monospace);
      font-size: 0.6rem;
      color: var(--mid, #888);
      padding: 0.28rem 0.2rem;
      line-height: 1;
      transition: color .15s;
      flex-shrink: 0;
    }
    .nav-pub-toggle:hover { color: var(--black, #0a0a0a); }

    .nav-pub-sublist {
      list-style: none;
      margin: 0.2rem 0 0.6rem 0.5rem;
      padding-left: 0.7rem;
      border-left: 1px solid var(--rule, #d8d4ce);
      display: none;
    }
    .nav-pub-sublist.open { display: block; }

    .nav-pub-sublist li { margin-bottom: 0; }

    .nav-pub-sublist a {
      font-family: var(--mono, monospace);
      font-size: 0.58rem;
      color: var(--mid, #888);
      text-decoration: none;
      display: block;
      padding: 0.22rem 0;
      line-height: 1.35;
      border-left: none !important;
      margin-left: 0 !important;
      padding-left: 0 !important;
      transition: color .15s;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .nav-pub-sublist a:hover {
      color: var(--black, #0a0a0a);
      border-color: transparent !important;
    }
  `;
  document.head.appendChild(style);
})();

// Short journal abbreviations for the nav display
const ABBR = {
  'BMC Public Health':               'BMC Public Health',
  'BMC Infectious Diseases':         'BMC Infect Dis',
  'BMC Pregnancy Childbirth':        'BMC Preg Childbirth',
  'American Journal of Public Health': 'AJPH',
  'Journal of Interpersonal Violence': 'J Interpers Viol',
  'Journal of American College Health': 'J Am Coll Health',
  'Global Health: Science and Practice': 'GHSP',
  'Violence Against Women':          'Violence Against Women',
  'JMIR Research Protocols':         'JMIR Res Protoc',
  'PLoS One':                        'PLoS One',
  'AIDS and Behavior':               'AIDS Behav',
  'AIDS Behavior':                   'AIDS Behav',
  'Translational Behavioral Medicine': 'Transl Behav Med',
  'Journal of Korean Medical Science': 'J Korean Med Sci',
};

function abbr(journal) {
  return ABBR[journal] || journal;
}

// Determine path prefix: are we at root or in a sub-directory?
// All shell pages are at root, so we use relative paths directly.
function rootPath(p) { return p; }

(async function buildNavPubs() {
  // Wait for DOM if needed
  if (document.readyState === 'loading') {
    await new Promise(r => document.addEventListener('DOMContentLoaded', r));
  }

  // Find the Publications <a> link
  let pubLink = null;
  for (const a of document.querySelectorAll('.nav a')) {
    if (a.getAttribute('href') === 'publications.html') { pubLink = a; break; }
  }
  if (!pubLink) return;

  // Load publications data
  let pubs = [];
  for (const path of ['data/publications_auto.json', 'data/publications.json']) {
    try {
      const r = await fetch(path);
      if (r.ok) { pubs = await r.json(); break; }
    } catch(e) {}
  }
  // Only keep entries that have a pdf
  pubs = pubs.filter(p => p.pdf).sort((a, b) => b.year - a.year || b.id - a.id);
  if (!pubs.length) return;

  // ── Wrap the Publications <a> in a flex row with a toggle button ──
  const li = pubLink.closest('li');
  const row = document.createElement('div');
  row.className = 'nav-pub-row';
  li.insertBefore(row, pubLink);
  row.appendChild(pubLink);

  const toggle = document.createElement('button');
  toggle.className = 'nav-pub-toggle';
  toggle.textContent = '▸';
  toggle.title = 'Show publications';
  row.appendChild(toggle);

  // ── Build the sub-list ──
  const ul = document.createElement('ul');
  ul.className = 'nav-pub-sublist';
  li.appendChild(ul);

  pubs.forEach(pub => {
    const item = document.createElement('li');
    const a    = document.createElement('a');
    a.textContent = `${abbr(pub.journal)} · ${pub.year}`;
    a.title       = pub.title;

    const qs = new URLSearchParams({
      pdf:      rootPath('publications/' + pub.pdf),
      title:    pub.title    || '',
      authors:  pub.authors  || '',
      citation: pub.citation || '',
    });
    a.href = rootPath('pdf-viewer.html') + '?' + qs.toString();

    item.appendChild(a);
    ul.appendChild(item);
  });

  // ── Toggle on button click ──
  let open = false;
  toggle.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    open = !open;
    ul.classList.toggle('open', open);
    toggle.textContent = open ? '▾' : '▸';
    toggle.title = open ? 'Hide publications' : 'Show publications';
  });
})();
