(() => {
  const header = document.querySelector('.rf-header');
  if (!header) return;

  const menu = header.querySelector('.rf-menu-toggle');
  const primary = header.querySelector('#site-nav');
  const trigger = header.querySelector('.rf-action');
  const sheet = header.querySelector('.rf-contact-sheet');
  const directory = header.querySelector('.rf-more');
  const more = directory.querySelector(':scope > summary');
  const close = directory.querySelector('.rf-close');
  const groups = [...directory.querySelectorAll('.rf-group')];
  const mobile = matchMedia('(max-width: 980px)');

  function collapse() {
    menu.setAttribute('aria-expanded', 'false');
    directory.open = false;
  }
  function matchLayout() {
    collapse();
    groups.forEach(group => { group.open = !mobile.matches; });
    // Keep visual and keyboard order aligned when the mobile actions move.
    if (mobile.matches) menu.before(trigger);
    else primary.after(trigger);
  }
  if (typeof sheet?.showModal === 'function') {
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-controls', sheet.id);
    trigger.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      collapse();
      sheet.showModal();
      document.documentElement.classList.add('rf-contact-open');
    });
    sheet.addEventListener('click', event => {
      if (event.target !== sheet) return;
      const bounds = sheet.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX >= bounds.right ||
          event.clientY < bounds.top || event.clientY >= bounds.bottom) sheet.close();
    });
    sheet.addEventListener('close', () => {
      document.documentElement.classList.remove('rf-contact-open');
      trigger.focus({preventScroll: true});
    });
  }
  menu.addEventListener('click', () => {
    if (menu.getAttribute('aria-expanded') === 'true') {
      collapse();
    } else {
      menu.setAttribute('aria-expanded', 'true');
    }
  });
  close.addEventListener('click', () => {
    directory.open = false;
    more.focus();
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (directory.open) {
      directory.open = false;
      more.focus();
    } else if (menu.getAttribute('aria-expanded') === 'true') {
      collapse();
      menu.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!header.contains(event.target) || event.target.closest('a')) collapse();
  });
  document.addEventListener('focusin', event => {
    if (!header.contains(event.target)) {
      collapse();
    } else if (!directory.contains(event.target)) {
      directory.open = false;
    }
  });
  mobile.addEventListener('change', matchLayout);
  matchLayout();
  header.classList.add('rf-nav-ready');
})();
