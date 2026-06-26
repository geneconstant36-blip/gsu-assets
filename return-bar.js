/* ============================================================
   GSU RETURN BAR · v1.0 · June 26 2026
   Drop one <script src="/return-bar.js"></script> in any
   read.globalsovereignuniversity.org page.
   Creates a fixed gold bar at the top linking back to the
   main site. Uses document.referrer when available; falls
   back to globalsovereignuniversity.org home.
   ============================================================ */
(function () {
  var HOME = 'https://www.globalsovereignuniversity.org';

  /* Determine back destination */
  var ref = document.referrer || '';
  var backUrl = HOME;
  var backLabel = 'GlobalSovereignUniversity.org';

  if (ref && ref.indexOf('globalsovereignuniversity.org') !== -1) {
    backUrl = ref;
    /* Build a readable label from the referrer path */
    try {
      var u = new URL(ref);
      var seg = u.pathname.replace(/\/$/, '').split('/').filter(Boolean);
      if (seg.length) {
        backLabel = decodeURIComponent(seg[seg.length - 1])
          .replace(/-/g, ' ')
          .replace(/\b\w/g, function (c) { return c.toUpperCase(); });
        backLabel = '← Back to ' + backLabel;
      } else {
        backLabel = '← Back to GlobalSovereignUniversity.org';
      }
    } catch (e) {
      backLabel = '← Back to GlobalSovereignUniversity.org';
    }
  } else {
    backLabel = '← GlobalSovereignUniversity.org — Free Education for All';
  }

  /* Inject styles */
  var style = document.createElement('style');
  style.textContent = [
    '#gsu-return-bar{',
    '  position:fixed;top:0;left:0;right:0;z-index:99999;',
    '  background:linear-gradient(90deg,#C9A84C,#DDBE62,#C9A84C);',
    '  text-align:center;padding:9px 16px;',
    '  font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;',
    '  letter-spacing:.02em;box-shadow:0 2px 8px rgba(0,0,0,.35);',
    '}',
    '#gsu-return-bar a{',
    '  color:#000000;text-decoration:none;',
    '}',
    '#gsu-return-bar a:hover{text-decoration:underline;}',
    '#gsu-return-spacer{height:38px;display:block;}'
  ].join('');
  document.head.appendChild(style);

  /* Build bar */
  var bar = document.createElement('div');
  bar.id = 'gsu-return-bar';
  bar.innerHTML = '<a href="' + backUrl + '">' + backLabel + '</a>';

  /* Spacer so page content isn't hidden under bar */
  var spacer = document.createElement('div');
  spacer.id = 'gsu-return-spacer';

  function inject() {
    if (document.getElementById('gsu-return-bar')) return;
    document.body.insertBefore(spacer, document.body.firstChild);
    document.body.insertBefore(bar, document.body.firstChild);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
