/*
 * The little the pages need: a theme switch, a menu on a narrow screen, and the year.
 * Everything here is an improvement on a page that already works without it.
 */
(function () {
  'use strict';

  var root = document.documentElement;

  /* ---- Light or dark. The choice is remembered in this browser and nowhere else. ---- */

  var themeToggle = document.querySelector('.theme-toggle');
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  function theme() {
    return root.getAttribute('data-theme') || (prefersDark.matches ? 'dark' : 'light');
  }

  function nameTheToggle() {
    if (!themeToggle) return;
    themeToggle.setAttribute(
      'aria-label',
      theme() === 'dark' ? 'Switch to the light theme' : 'Switch to the dark theme'
    );
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = theme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try {
        localStorage.setItem('theme', next);
      } catch (e) {
        /* A private window may refuse; the switch still works for this visit. */
      }
      nameTheToggle();
    });
    if (prefersDark.addEventListener) prefersDark.addEventListener('change', nameTheToggle);
    nameTheToggle();
  }

  /* ---- The menu, on a screen too narrow for the links. ---- */

  var navToggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');

  function setMenu(open) {
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close the menu' : 'Open the menu');
    if (open) nav.setAttribute('data-open', '');
    else nav.removeAttribute('data-open');
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      setMenu(navToggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        navToggle.focus();
      }
    });
  }

  /* ---- The year in the footer. ---- */

  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
