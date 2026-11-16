(() => {
  'use strict';
  const menu = document.querySelector('.menu-button');
  const nav = document.querySelector('#site-nav');
  if (menu && nav) {
    const close = () => {
      nav.classList.remove('is-open');
      menu.setAttribute('aria-expanded', 'false');
    };
    menu.addEventListener('click', () => {
      const active = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(active));
      nav.classList.toggle('is-open', active);
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
        close();
        menu.focus();
      }
    });
    addEventListener('resize', () => { if (innerWidth > 600) close(); }, { passive: true });
  }
})();
