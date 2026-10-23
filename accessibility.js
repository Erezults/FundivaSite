// Fundiva — shared accessibility widget (Israeli standard 5568 / WCAG 2.1 AA).
// Font-size step, high-contrast toggle, stop-animations toggle. Settings persist
// in localStorage and apply across all pages that include this script.
(function () {
  'use strict';

  var STORE_KEY = 'fundiva-a11y';
  var FONT_STEPS = [1, 1.15, 1.3];

  function loadState() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return { fontStep: 0, contrast: false, stopMotion: false };
      var parsed = JSON.parse(raw);
      return {
        fontStep: parsed.fontStep || 0,
        contrast: !!parsed.contrast,
        stopMotion: !!parsed.stopMotion,
      };
    } catch (e) {
      return { fontStep: 0, contrast: false, stopMotion: false };
    }
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch (e) {
      /* ignore quota/private-mode errors */
    }
  }

  function applyState(state) {
    var root = document.documentElement;
    // These pages size all text in px (no rem base), so scaling root font-size is
    // a no-op — the "A+" control looked functional but changed nothing. Use zoom,
    // which enlarges px content too (browser-native pinch-zoom stays the fallback
    // on any engine lacking zoom support). Israeli-Standard-5568 AA (D14-02).
    root.style.zoom = FONT_STEPS[state.fontStep];
    root.classList.toggle('a11y-contrast', state.contrast);
    root.classList.toggle('a11y-stop-motion', state.stopMotion);
  }

  var STR = {
    he: { fab: 'פתיחת תפריט נגישות', group: 'אפשרויות נגישות', font: 'הגדלת טקסט (A+)', contrast: 'ניגודיות גבוהה', motion: 'עצירת אנימציות' },
    en: { fab: 'Open accessibility menu', group: 'Accessibility options', font: 'Increase text size (A+)', contrast: 'High contrast', motion: 'Stop animations' }
  };
  function L() { return document.documentElement.getAttribute('lang') === 'en' ? STR.en : STR.he; }

  var state = loadState();
  applyState(state);

  document.addEventListener('DOMContentLoaded', function () {
    var style = document.createElement('style');
    style.textContent =
      '.a11y-stop-motion, .a11y-stop-motion *{animation:none!important;transition:none!important;}' +
      '.a11y-contrast{filter:contrast(1.35) saturate(1.15);}' +
      '.a11y-contrast body{background:#000!important;}' +
      '.a11y-contrast .card, .a11y-contrast .fcard, .a11y-contrast .plan{background:#111!important;border-color:#fff!important;}' +
      '.a11y-fab{position:fixed;inset-inline-end:20px;bottom:20px;z-index:9999;width:52px;height:52px;' +
      'border-radius:50%;background:#5b9df9;color:#0f172a;border:none;font-size:22px;cursor:pointer;' +
      'box-shadow:0 8px 24px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;}' +
      '.a11y-panel{position:fixed;inset-inline-end:20px;bottom:82px;z-index:9999;background:#0f172a;' +
      'border:1px solid rgba(255,255,255,.18);border-radius:16px;padding:14px;display:none;flex-direction:column;gap:8px;' +
      'min-width:220px;box-shadow:0 20px 48px rgba(0,0,0,.5);font-family:"Rubik",-apple-system,sans-serif;}' +
      '.a11y-panel.open{display:flex;}' +
      '.a11y-panel button{all:unset;cursor:pointer;color:#e8eef7;font-size:14px;padding:10px 12px;border-radius:10px;' +
      'background:rgba(255,255,255,.06);text-align:start;}' +
      '.a11y-panel button:hover, .a11y-panel button:focus-visible{background:rgba(91,157,249,.25);outline:2px solid #5b9df9;}' +
      '.a11y-panel button[aria-pressed="true"]{background:rgba(47,168,145,.35);}';
    document.head.appendChild(style);

    var fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'a11y-fab';
    fab.setAttribute('aria-label', L().fab);
    fab.setAttribute('aria-expanded', 'false');
    fab.textContent = '♿';

    var panel = document.createElement('div');
    panel.className = 'a11y-panel';
    // role="group", not "menu": these are independent toggle buttons, not a menu
    // with menuitem/arrow-key navigation — "menu" would promise a keyboard model
    // that isn't implemented (Tab works, arrows/Esc don't) (D14-04).
    panel.setAttribute('role', 'group');
    panel.setAttribute('aria-label', L().group);

    var fontBtn = document.createElement('button');
    fontBtn.type = 'button';
    fontBtn.textContent = L().font;

    var contrastBtn = document.createElement('button');
    contrastBtn.type = 'button';
    contrastBtn.textContent = L().contrast;
    contrastBtn.setAttribute('aria-pressed', String(state.contrast));

    var motionBtn = document.createElement('button');
    motionBtn.type = 'button';
    motionBtn.textContent = L().motion;
    motionBtn.setAttribute('aria-pressed', String(state.stopMotion));

    function relabel() {
      var s = L();
      fab.setAttribute('aria-label', s.fab);
      panel.setAttribute('aria-label', s.group);
      fontBtn.textContent = s.font;
      contrastBtn.textContent = s.contrast;
      motionBtn.textContent = s.motion;
    }
    document.addEventListener('fundiva-lang', relabel);

    panel.appendChild(fontBtn);
    panel.appendChild(contrastBtn);
    panel.appendChild(motionBtn);
    document.body.appendChild(fab);
    document.body.appendChild(panel);

    fab.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      fab.setAttribute('aria-expanded', String(open));
    });

    fontBtn.addEventListener('click', function () {
      state.fontStep = (state.fontStep + 1) % FONT_STEPS.length;
      applyState(state);
      saveState(state);
    });

    contrastBtn.addEventListener('click', function () {
      state.contrast = !state.contrast;
      applyState(state);
      saveState(state);
      contrastBtn.setAttribute('aria-pressed', String(state.contrast));
    });

    motionBtn.addEventListener('click', function () {
      state.stopMotion = !state.stopMotion;
      applyState(state);
      saveState(state);
      motionBtn.setAttribute('aria-pressed', String(state.stopMotion));
    });
  });
})();
