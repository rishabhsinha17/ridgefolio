(() => {
  const root = document.documentElement;
  const header = document.querySelector('[data-ref-header]');
  if (!header) return;

  const mobile = matchMedia('(max-width: 991px)');
  const menu = header.querySelector('#site-directory');
  const desktopToggle = header.querySelector('#mega-drop-toggle-desktop');
  const phoneToggle = header.querySelector('#mega-drop-toggle');
  const menuClose = header.querySelector('#mega-close');
  const sheet = document.getElementById('contact-form');
  const moreFields = sheet?.querySelector('#contact-toggle');
  const close = sheet?.querySelector('#contact-form-close');
  const name = sheet?.querySelector('#name');
  let menuOpener;
  let contactOpener;
  const footerReturn = document.querySelector('.footer-return');
  let inertElements = [];

  const plainClick = (event) => event.button === 0 &&
    !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey;

  footerReturn?.addEventListener('click', event => {
    if (!plainClick(event)) return;
    header.querySelector('.logo').focus({preventScroll:true});
  });

  function buttonKeys(element) {
    element?.addEventListener('keydown', (event) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        element.click();
      }
    });
  }

  function setMenu(open, restoreFocus = false) {
    root.classList.toggle('ref-menu-open', open);
    desktopToggle.setAttribute('aria-expanded', String(open));
    phoneToggle.setAttribute('aria-expanded', String(open));
    if (open) {
      menu.scrollTop = 0;
      (mobile.matches ? menu.querySelector('.social-col a[href]') : menuClose).focus({preventScroll:true});
    } else if (restoreFocus) {
      (menuOpener?.getClientRects().length ? menuOpener : mobile.matches ? phoneToggle : desktopToggle).focus();
    }
  }

  for (const trigger of [phoneToggle, desktopToggle]) {
    trigger.addEventListener('click', (event) => {
      if (trigger.tagName === 'A' && !plainClick(event)) return;
      event.preventDefault();
      menuOpener = trigger;
      setMenu(!root.classList.contains('ref-menu-open'), true);
    });
  }
  buttonKeys(phoneToggle);
  buttonKeys(menuClose);
  menuClose.addEventListener('click', () => setMenu(false, true));
  mobile.addEventListener('change', () => {
    if (root.classList.contains('ref-menu-open')) setMenu(false, true);
  });
  document.addEventListener('focusin', (event) => {
    if (root.classList.contains('ref-menu-open') && !header.contains(event.target)) setMenu(false);
  });

  function disableBackground() {
    for (let active = sheet; active && active !== document.body; active = active.parentElement) {
      for (const element of active.parentElement.children) {
        if (element === active || element.inert || /^(SCRIPT|STYLE|LINK|NOSCRIPT)$/.test(element.tagName)) continue;
        element.inert = true;
        inertElements.push(element);
      }
    }
  }

  function openContact(trigger) {
    if (!sheet || root.classList.contains('ref-contact-open')) return;
    setMenu(false);
    contactOpener = menu.contains(trigger) ? (mobile.matches ? phoneToggle : desktopToggle) : trigger;
    sheet.hidden = false;
    sheet.setAttribute('aria-modal', 'true');
    root.classList.add('ref-contact-open');
    disableBackground();
    name.focus({preventScroll:true});
  }

  function closeContact() {
    if (!sheet || sheet.hidden) return;
    root.classList.remove('ref-contact-open', 'ref-contact-expanded');
    sheet.hidden = true;
    moreFields.hidden = true;
    sheet.removeAttribute('aria-modal');
    sheet.querySelector('#contact-results').replaceChildren();
    sheet.querySelector('#message').replaceChildren();
    for (const element of inertElements) element.inert = false;
    inertElements = [];
    const trigger = contactOpener?.getClientRects().length ? contactOpener : (mobile.matches ? phoneToggle : desktopToggle);
    trigger.focus({preventScroll:true});
    contactOpener = null;
  }

  function expandContact() {
    moreFields.hidden = false;
    root.classList.add('ref-contact-expanded');
    sheet.querySelector('#email').focus();
  }

  document.addEventListener('click', (event) => {
    if (sheet && root.classList.contains('ref-contact-open')) {
      if (!sheet.contains(event.target)) closeContact();
      return;
    }
    const trigger = event.target.closest('a.open-contact-form, a.btn, a.button, a.text-action');
    const opensSheet = trigger && (trigger.getAttribute('href') === '#contact-form' ||
      (trigger.origin === location.origin && trigger.pathname === '/contact/'));
    if (sheet && opensSheet && trigger.target !== '_blank' && plainClick(event)) {
      event.preventDefault();
      openContact(trigger);
    } else if (root.classList.contains('ref-menu-open') && !header.contains(event.target)) {
      setMenu(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (sheet && root.classList.contains('ref-contact-open')) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeContact();
      } else if (event.key === 'Tab') {
        const focusable = [...sheet.querySelectorAll('a[href], input, select, textarea, button, [tabindex="0"]')]
          .filter((element) => !element.disabled && element.getClientRects().length);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    } else if (event.key === 'Escape' && root.classList.contains('ref-menu-open')) {
      event.preventDefault();
      setMenu(false, true);
    }
  });

  if (sheet) {
    buttonKeys(close);
    close.addEventListener('click', closeContact);
    sheet.querySelector('button.open-contact-form').addEventListener('click', () => expandContact());
    name.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        expandContact();
      }
    });
    const preview = sheet.querySelector('#message');
    sheet.addEventListener('input', () => {
      if (preview.hasChildNodes()) {
        preview.replaceChildren();
        sheet.querySelector('#contact-results').textContent = 'The inquiry changed. Review the updated draft when ready.';
      }
    });
    sheet.querySelector('#submit_btn').addEventListener('click', () => {
      for (const field of sheet.querySelectorAll('input, select, textarea')) {
        if (!field.reportValidity()) return;
      }
      const value = (id) => sheet.querySelector('#' + id).value.trim();
      const details = [
        value('comments'), '',
        value('name') && 'Name: ' + value('name'),
        value('email') && 'Reply email: ' + value('email'),
        value('phone') && 'Phone: ' + value('phone'),
      ].filter((line, index) => line || index === 1).join('\n').trimEnd().replace(/\r?\n/g, '\r\n');
      const subject = 'Ridgefolio — ' + value('subject');
      const heading = document.createElement('h3');
      heading.textContent = 'Review your draft';
      heading.tabIndex = -1;
      const recipientLine = document.createElement('p');
      recipientLine.textContent = 'To: ' + value('verify');
      const subjectLine = document.createElement('p');
      subjectLine.textContent = 'Subject: ' + subject;
      const body = document.createElement('pre');
      body.textContent = details;
      const openDraft = document.createElement('a');
      openDraft.href = contactDraftURL(value('verify'), subject, details);
      openDraft.textContent = 'Open draft in my email app';
      preview.replaceChildren(heading, recipientLine, subjectLine, body, openDraft);
      sheet.querySelector('#contact-results').textContent = 'Draft prepared for your review.';
      heading.focus({preventScroll: true});
      heading.scrollIntoView({block: 'nearest'});
    });
  }
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      setMenu(false);
      closeContact();
    }
  });
  root.classList.add('ref-shell-ready');
})();
