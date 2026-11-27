(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const control = document.getElementById('down-arrow');
  if (control) {
    const wrapper = document.createElement('div');
    wrapper.id = 'down-arrow-sticky-wrapper';
    wrapper.className = 'sticky-wrapper';
    control.replaceWith(wrapper);
    wrapper.append(control);
    const downLink = control.querySelector('.down');
    const upLink = control.querySelector('.up');
    const root = document.documentElement;
    // Retire the shortcut while its edge position covers readable content.
    // The native footer return remains available on every page.
    const textSelector = 'h1,h2,h3,h4,h5,h6,p,li,dt,dd,td,th,label,figcaption,blockquote,pre,summary';
    const protectedSelector = 'input,textarea,select,button,a[href],img[alt]:not([alt=""]),canvas,.workspace,[data-atlas]';
    function obstructs(x, y) {
      const inspected = new Set();
      for (const dx of [1,25,49]) for (const dy of [1,25,49]) {
        for (const el of document.elementsFromPoint(x + dx, y + dy)) {
          if (control.contains(el) || el.closest('#contact-form, [data-ref-header], [hidden]')) continue;
          if (el.closest(protectedSelector)) return true;
          const text = el.closest(textSelector);
          if (!text || inspected.has(text)) continue;
          inspected.add(text);
          const range = document.createRange();
          range.selectNodeContents(text);
          if ([...range.getClientRects()].some(b => b.left < x + 50 && b.right > x && b.top < y + 50 && b.bottom > y)) return true;
        }
      }
      return false;
    }
    let pinned;
    let frame;
    control.dataset.scrollControl = '';
    const supportsPopover = typeof control.showPopover === 'function';
    function measure() {
      frame = 0;
      const rect = wrapper.getBoundingClientRect();
      if (!rect.width) return;
      const active = rect.top < 200;
      const width = document.documentElement.clientWidth;
      const phone = width < 768;
      const toX = phone ? rect.right : width < 992 ? rect.left + .88 * width : rect.left - 70;
      const inset = 8;
      const x = Math.min(width - 50 - inset, Math.max(inset, toX));
      const height = document.documentElement.clientHeight;
      const y = Math.min(phone ? Math.max(135, height - 170) : 180, height - 58);
      const covered = active && !control.contains(document.activeElement) &&
        !root.classList.contains('ref-contact-open') && !root.classList.contains('ref-menu-open') && obstructs(x,y);
      control.toggleAttribute('data-rail-covered', covered);
      control.style.setProperty('--rail-top', (y - 200) + 'px');
      control.style.setProperty('--origin-x', rect.left + 'px');
      control.style.setProperty('--travel-x', (x - rect.left) + 'px');
      if (pinned === active) {
        if (active && upLink.inert !== covered) {
          upLink.inert = covered;
          upLink.tabIndex = covered ? -1 : 0;
          upLink.setAttribute('aria-hidden', String(covered));
        }
        return;
      }
      const hadFocus = control.contains(document.activeElement);
      pinned = active;
      wrapper.classList.toggle('stickyarrow', active);
      if (supportsPopover) {
        if (active) {
          // The ring stays on top of clipped hero artwork without moving its
          // link out of the document's logical reading and tab order.
          control.setAttribute('popover', 'manual');
          control.showPopover();
        } else if (control.hasAttribute('popover')) {
          control.hidePopover();
          control.removeAttribute('popover');
        }
      }
      for (const [link, live] of [[downLink, !active], [upLink, active && !covered]]) {
        link.hidden = false;
        link.inert = !live;
        link.setAttribute('aria-hidden', String(!live));
        link.tabIndex = live ? 0 : -1;
      }
      if (hadFocus) (active ? upLink : downLink).focus({preventScroll:true});
    }
    function queue() {
      if (!frame) frame = requestAnimationFrame(measure);
    }
    window.addEventListener('scroll', queue, {passive:true});
    window.addEventListener('resize', queue, {passive:true});
    window.addEventListener('pageshow', queue);
    new MutationObserver(queue).observe(root, {attributes:true,attributeFilter:['class']});
    new ResizeObserver(queue).observe(control.closest('section') || document.body);
    document.fonts?.ready.then(queue);
    measure();
  }

  // Run ornamental motion only while the artwork is in view. A returning
  // visitor sees the settled hero instead of replaying the entrance.
  const orbit = document.querySelector('.rotaing');
  const planes = document.querySelector('#home-hero .animatable');
  const revealTargets = [];
  if (window.IntersectionObserver) {
    let orbitVisible = false;
    let planesVisible = false;
    let artworkObserver;
    function syncOrbit() {
      if (planes) planes.toggleAttribute('data-fly-running', planesVisible && !document.hidden && !reduced.matches);
      if (orbit) orbit.toggleAttribute('data-orbit-running', orbitVisible && !document.hidden && !reduced.matches);
    }
    if (orbit) new IntersectionObserver(([entry]) => {
      orbitVisible = entry.isIntersecting;
      syncOrbit();
    }).observe(orbit);
    document.addEventListener('visibilitychange', syncOrbit);
    if (planes) {
      new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) planes.classList.add('animated');
      }, {rootMargin:'0px 0px -25% 0px'}).observe(planes);
      new IntersectionObserver(([entry]) => {
        planesVisible = entry.isIntersecting;
        syncOrbit();
      }).observe(planes);
    }
    for (const cover of document.querySelectorAll('.rv-source :is(.cover,.cover-half,.cover-2,.cover-3), .rv-home #blog-list .cover')) {
      const frame = cover.parentElement;
      if (cover.closest('header,footer,#contact,#contact-form,.pixel-btn,.workspace')) continue;
      let image = frame.querySelector(':scope > img.full-img, :scope > .blog-image');
      if (cover.matches('.about-portrait')) image = cover;
      else if (frame.matches('.app-img-left,.app-img-right,.we-believe-img')) image = frame;
      if (image?.querySelector('a[href],button,input,textarea,select')) image = image.querySelector('img');
      if (image) revealTargets.push(image);
    }
    revealTargets.push(...document.querySelectorAll('.rv-home .responsive-shots > img,.rv-home .client-shot'));
    function syncReveal() {
      syncOrbit();
      artworkObserver?.disconnect();
      if (reduced.matches) {
        for (const item of revealTargets) item.removeAttribute('data-art-reveal');
        return;
      }
      artworkObserver = new IntersectionObserver(entries => {
        for (const x of entries) {
          if (!x.isIntersecting) continue;
          x.target.dataset.artReveal = 'visible';
          artworkObserver.unobserve(x.target);
        }
      });
      for (const item of revealTargets) {
        if (item.getBoundingClientRect().top < innerHeight || item.dataset.artReveal === 'visible') {
          item.removeAttribute('data-art-reveal');
          continue;
        }
        item.dataset.artReveal = 'waiting';
        artworkObserver.observe(item);
      }
    }
    reduced.addEventListener('change', syncReveal);
    syncReveal();
  }
})();
