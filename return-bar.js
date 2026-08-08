/* ============================================================
   GSU RETURN BAR · v2.0 · Aug 7 2026
   ------------------------------------------------------------
   One line in any read.globalsovereignuniversity.org page:

     <script src="/return-bar.js" defer></script>

   Place it just before </body>.

   v2.0 changes from v1.0 (Jun 26 2026):
     · Adds persistent quick-links (Library / Free Tutor /
       Certification) so a visitor is never one dead end away
       from the university.
     · Adds an OPTIONAL Google rating badge. It is OFF by
       default and renders NOTHING until real values are set
       in the CONFIG block below. See the note there.
     · Mobile-aware: collapses to a single Home link under 560px.
     · Respects pages that already have their own fixed header
       (set data-gsu-nooffset="1" on <body> to skip the spacer).
     · Idempotent: will not double-inject.
   ============================================================ */
(function () {
  'use strict';

  /* ==========================================================
     CONFIG
     ========================================================== */
  var HOME = 'https://www.globalsovereignuniversity.org';

  var LINKS = [
    { label: 'Library',       href: HOME + '/library' },
    { label: 'Free Tutor',    href: HOME + '/free-tutor' },
    { label: 'Certification', href: HOME + '/certification' }
  ];

  /* ---- GOOGLE RATING BADGE -------------------------------
     DISABLED until real, verifiable numbers are supplied.

     Do NOT invent a rating or a review count. GSU is a
     501(c)(3) that solicits donations; a fabricated rating
     is a real legal and reputational exposure, not a
     cosmetic shortcut.

     To turn it on, set enabled:true and fill in the values
     from the live Google Business Profile:
        score  – the actual average, e.g. '5.0'
        count  – the actual number of reviews, e.g. 47
        href   – the public Google reviews URL
     ------------------------------------------------------- */
  var RATING = {
    enabled: false,
    score:   null,
    count:   null,
    href:    null
  };

  /* ==========================================================
     GUARD
     ========================================================== */
  if (window.__gsuReturnBar) return;
  window.__gsuReturnBar = true;

  /* ==========================================================
     BACK DESTINATION
     Prefer the referring GSU page; otherwise the home page.
     ========================================================== */
  var ref = document.referrer || '';
  var backUrl = HOME;
  var backLabel = 'Global Sovereign University';

  if (ref && ref.indexOf('globalsovereignuniversity.org') !== -1 &&
      ref.indexOf('read.globalsovereignuniversity.org') === -1) {
    try {
      var u = new URL(ref);
      var seg = u.pathname.replace(/\/+$/, '').split('/').filter(Boolean);
      if (seg.length) {
        var pretty = decodeURIComponent(seg[seg.length - 1])
          .replace(/[-_]+/g, ' ')
          .replace(/\.[a-z]{2,4}$/i, '')
          .replace(/\b\w/g, function (c) { return c.toUpperCase(); });
        if (pretty.length > 34) pretty = pretty.slice(0, 32).trim() + '…';
        backUrl = ref;
        backLabel = 'Back to ' + pretty;
      } else {
        backUrl = ref;
      }
    } catch (e) { /* keep defaults */ }
  }

  /* ==========================================================
     STYLES
     ========================================================== */
  var css = [
    '#gsu-return-bar{',
    ' position:fixed;top:0;left:0;right:0;z-index:2147483000;',
    ' background:linear-gradient(90deg,#C9A84C,#DDBE62,#C9A84C);',
    ' box-shadow:0 2px 10px rgba(0,0,0,.4);',
    ' font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;',
    ' font-size:14px;line-height:1.2;',
    '}',
    '#gsu-return-bar .gsu-rb-in{',
    ' max-width:1180px;margin:0 auto;padding:9px 16px;',
    ' display:flex;align-items:center;gap:18px;flex-wrap:wrap;',
    '}',
    '#gsu-return-bar a{color:#000;text-decoration:none;font-weight:700;}',
    '#gsu-return-bar a:hover,#gsu-return-bar a:focus{text-decoration:underline;}',
    '#gsu-return-bar .gsu-rb-home{font-size:14.5px;}',
    '#gsu-return-bar .gsu-rb-links{display:flex;gap:16px;margin-left:auto;flex-wrap:wrap;}',
    '#gsu-return-bar .gsu-rb-links a{font-weight:600;font-size:13.5px;opacity:.88;}',
    '#gsu-return-bar .gsu-rb-rating{',
    ' display:flex;align-items:center;gap:6px;font-weight:700;font-size:13.5px;color:#000;',
    '}',
    '#gsu-return-bar .gsu-rb-stars{letter-spacing:1px;}',
    '#gsu-return-spacer{display:block;height:40px;}',
    '@media (max-width:560px){',
    ' #gsu-return-bar .gsu-rb-links{display:none;}',
    ' #gsu-return-bar .gsu-rb-in{padding:8px 12px;justify-content:center;}',
    ' #gsu-return-bar .gsu-rb-home{font-size:14px;}',
    ' #gsu-return-spacer{height:36px;}',
    '}',
    '@media print{#gsu-return-bar,#gsu-return-spacer{display:none!important;}}'
  ].join('');

  /* ==========================================================
     BUILD
     ========================================================== */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c];
    });
  }

  function build() {
    if (document.getElementById('gsu-return-bar')) return;

    var style = document.createElement('style');
    style.id = 'gsu-return-bar-style';
    style.textContent = css;
    document.head.appendChild(style);

    var inner = '<a class="gsu-rb-home" href="' + esc(backUrl) + '">&larr; ' +
                esc(backLabel) + '</a>';

    if (RATING.enabled && RATING.score && RATING.count && RATING.href) {
      var full = Math.round(Number(RATING.score));
      var stars = '';
      for (var i = 0; i < 5; i++) stars += (i < full ? '\u2605' : '\u2606');
      inner += '<a class="gsu-rb-rating" href="' + esc(RATING.href) + '"' +
               ' target="_blank" rel="noopener">' +
               '<span class="gsu-rb-stars">' + stars + '</span>' +
               '<span>' + esc(RATING.score) + ' on Google (' +
               esc(RATING.count) + ' reviews)</span></a>';
    }

    var linkHtml = LINKS.map(function (l) {
      return '<a href="' + esc(l.href) + '">' + esc(l.label) + '</a>';
    }).join('');
    inner += '<span class="gsu-rb-links">' + linkHtml + '</span>';

    var bar = document.createElement('div');
    bar.id = 'gsu-return-bar';
    bar.setAttribute('role', 'navigation');
    bar.setAttribute('aria-label', 'Return to Global Sovereign University');
    bar.innerHTML = '<div class="gsu-rb-in">' + inner + '</div>';

    document.body.insertBefore(bar, document.body.firstChild);

    if (document.body.getAttribute('data-gsu-nooffset') !== '1') {
      var spacer = document.createElement('div');
      spacer.id = 'gsu-return-spacer';
      document.body.insertBefore(spacer, bar.nextSibling);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
