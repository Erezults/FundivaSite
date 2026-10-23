// Fundiva — HE/EN language toggle (same mechanism as the other Erezults sites:
// data-en attributes + data-he captured from the original Hebrew markup).
(function () {
  'use strict';
  var KEY = 'fundiva-lang';
  var html = document.documentElement;

  function detect() {
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    if (saved === 'he' || saved === 'en') return saved;
    var nav = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
    return (nav.indexOf('he') === 0 || nav.indexOf('iw') === 0) ? 'he' : 'en';
  }

  // Set lang/dir immediately (script runs in <head>) and hide until text is applied.
  var current = detect();
  html.setAttribute('lang', current);
  html.setAttribute('dir', current === 'he' ? 'rtl' : 'ltr');
  html.classList.add('i18n-pending');

  var css = document.createElement('style');
  css.textContent =
    'html.i18n-pending body{visibility:hidden}' +
    '.fl-lang{display:inline-flex;gap:2px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.12);border-radius:999px;padding:3px;direction:ltr}' +
    '.fl-lang button{all:unset;cursor:pointer;font:500 13px/1 "Rubik",-apple-system,sans-serif;color:#b6c6de;padding:7px 13px;border-radius:999px}' +
    '.fl-lang button.active{background:linear-gradient(135deg,#5b9df9,#2fa891);color:#0f172a;font-weight:700}' +
    '.fl-lang button:focus-visible{outline:3px solid #5b9df9;outline-offset:2px}' +
    '.fl-lang-home{position:absolute;top:16px;inset-inline-end:16px;z-index:5}' +
    'header .wrap.fl-bar{display:flex;align-items:center;justify-content:space-between;gap:12px}';
  document.head.appendChild(css);

  function store(el, attr, getter) {
    if (!el.hasAttribute('data-he')) el.setAttribute('data-he', getter());
  }

  function apply(lang) {
    html.setAttribute('lang', lang);
    html.setAttribute('dir', lang === 'he' ? 'rtl' : 'ltr');
    document.querySelectorAll('[data-en]').forEach(function (el) {
      var tag = el.tagName;
      if (tag === 'TITLE') {
        store(el, 'title', function () { return el.textContent; });
        document.title = el.getAttribute('data-' + lang);
      } else if (tag === 'META') {
        store(el, 'meta', function () { return el.getAttribute('content'); });
        el.setAttribute('content', el.getAttribute('data-' + lang));
      } else {
        store(el, 'html', function () { return el.innerHTML; });
        el.innerHTML = el.getAttribute('data-' + lang);
      }
    });
    document.querySelectorAll('a[href="/privacy"],a[href="/privacy/en/"]').forEach(function (a) {
      a.setAttribute('href', lang === 'en' ? '/privacy/en/' : '/privacy');
    });
    document.querySelectorAll('.fl-lang button').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-lang') === lang);
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang));
    });
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    current = lang;
    document.dispatchEvent(new CustomEvent('fundiva-lang', { detail: lang }));
    html.classList.remove('i18n-pending');
  }

  function buildToggle() {
    var box = document.createElement('div');
    box.className = 'fl-lang';
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', 'Language / שפה');
    [['he', 'עב'], ['en', 'EN']].forEach(function (p) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('data-lang', p[0]);
      b.setAttribute('lang', p[0]);
      b.textContent = p[1];
      b.addEventListener('click', function () { apply(p[0]); });
      box.appendChild(b);
    });
    var header = document.querySelector('header .wrap');
    if (header) { header.classList.add('fl-bar'); header.appendChild(box); }
    else { box.className += ' fl-lang-home'; document.body.insertBefore(box, document.body.firstChild); }
  }

  window.fundivaLang = function () { return current; };

  document.addEventListener('DOMContentLoaded', function () {
    buildToggle();
    apply(current);
  });
})();
