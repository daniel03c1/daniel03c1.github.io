/*
  Daniel Rho personal website script.

  Scope is intentionally tiny:
    1. Theme toggle: switch between light and dark, persist to localStorage,
       respect the user's system setting until they make their own choice.
    2. Mobile nav: open and close the menu with the hamburger button, close
       it again when the user picks a destination.

  Notes for future maintenance:
    - This file is loaded with `defer`, so it runs after the DOM is parsed.
      No need for DOMContentLoaded wrappers.
    - Every external interaction is wrapped in feature checks (`if (button)`,
      try/catch around storage). Missing elements should never throw.
    - Keep it framework free. If this file ever needs to grow, split it into
      modules instead of pulling in a bundler.
*/

(function () {
  'use strict';

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  /** Safe localStorage getter. Returns null when storage is unavailable. */
  function readStorage(key) {
    try { return localStorage.getItem(key); }
    catch (_) { return null; }
  }

  /** Safe localStorage setter. Silently no-ops when storage is unavailable. */
  function writeStorage(key, value) {
    try { localStorage.setItem(key, value); }
    catch (_) { /* private mode, quota errors, etc. */ }
  }

  // -----------------------------------------------------------------------
  // Theme toggle
  // -----------------------------------------------------------------------

  var themeToggle = document.querySelector('[data-theme-toggle]');
  var THEME_KEY = 'theme';

  /** Returns the resolved theme: stored choice, or system preference. */
  function resolvedTheme() {
    var stored = readStorage(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia &&
           window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = resolvedTheme() === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      writeStorage(THEME_KEY, next);
    });
  }

  // If the user has not made a manual choice, follow live system changes.
  if (window.matchMedia) {
    var mql = window.matchMedia('(prefers-color-scheme: dark)');
    var onSystemChange = function () {
      if (readStorage(THEME_KEY) === null) {
        // Remove any data-theme attribute so the CSS prefers-color-scheme
        // rules take over again.
        document.documentElement.removeAttribute('data-theme');
      }
    };
    if (mql.addEventListener) mql.addEventListener('change', onSystemChange);
    else if (mql.addListener) mql.addListener(onSystemChange);
  }

  // -----------------------------------------------------------------------
  // Mobile navigation
  // -----------------------------------------------------------------------

  var navToggle = document.querySelector('[data-nav-toggle]');
  var navMenu   = document.getElementById('primary-menu');

  function setMenuOpen(open) {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    navMenu.classList.toggle('is-open', open);
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      var open = navToggle.getAttribute('aria-expanded') !== 'true';
      setMenuOpen(open);
    });

    // Close the menu after picking a link, so the user lands at their
    // destination with a clear viewport.
    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setMenuOpen(false); });
    });

    // Close on Escape for keyboard users.
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' &&
          navToggle.getAttribute('aria-expanded') === 'true') {
        setMenuOpen(false);
        navToggle.focus();
      }
    });
  }
})();
