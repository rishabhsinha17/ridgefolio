(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
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
  document.querySelectorAll('[data-editorial-art]').forEach(frame => {
    const reset = () => {
      frame.style.setProperty('--art-x', '0px');
      frame.style.setProperty('--art-y', '0px');
    };
    frame.addEventListener('pointermove', event => {
      if (!fine.matches || reduced.matches) return;
      const rect = frame.getBoundingClientRect();
      frame.style.setProperty('--art-x', `${((event.clientX - rect.left) / rect.width - .5) * -9}px`);
      frame.style.setProperty('--art-y', `${((event.clientY - rect.top) / rect.height - .5) * -7}px`);
    }, { passive: true });
    frame.addEventListener('pointerleave', reset, { passive: true });
    reduced.addEventListener('change', reset);
  });
})();
