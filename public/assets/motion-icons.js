(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const control = document.getElementById('down-arrow');
  if (control) {
    const workspace = document.getElementById('workspace');
    const wrapper = document.createElement('div');
    wrapper.id = 'down-arrow-sticky-wrapper';
    wrapper.className = 'sticky-wrapper';
    const initialHeight = control.getBoundingClientRect().height;
    wrapper.style.minHeight = initialHeight + 'px';
    control.replaceWith(wrapper);
    wrapper.append(control);
    const downLink = control.querySelector('.down');
    const upLink = control.querySelector('.up');
    let pinned;
    let workspacePaused;
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
      control.style.setProperty('--origin-x', rect.left + 'px');
      control.style.setProperty('--travel-x', (x - rect.left) + 'px');
      const hadFocus = control.contains(document.activeElement);
      const changed = pinned !== active;
      if (changed) {
        pinned = active;
        wrapper.classList.toggle('stickyarrow', active);
        if (supportsPopover) {
          if (active) {
            control.setAttribute('popover', 'manual');
            control.showPopover();
          } else if (control.hasAttribute('popover')) {
            control.hidePopover();
            control.removeAttribute('popover');
          }
        }
        downLink.hidden = false;
        upLink.hidden = false;
      }

      // A partly visible application can sit well below the shortcut. Yield
      // only when the actual hit area reaches the application on either axis.
      let blocked = false;
      if (workspace && active) {
        const w = workspace.getBoundingClientRect();
        const near = w.top < innerHeight && w.bottom > 0;
        control.toggleAttribute('data-workspace-near', near);
        if (near) {
          const a = upLink.getBoundingClientRect();
          blocked = a.left < w.right && a.right > w.left && a.top < w.bottom && a.bottom > w.top;
        }
      } else if (workspace) control.removeAttribute('data-workspace-near');
      if (!changed && workspacePaused === blocked) return;
      workspacePaused = blocked;
      control.toggleAttribute('data-workspace-paused', blocked);
      for (const [link, live] of [[downLink, !active], [upLink, active && !blocked]]) {
        link.inert = !live;
        link.setAttribute('aria-hidden', String(!live));
        link.tabIndex = live ? 0 : -1;
      }
      if (hadFocus) (blocked ? workspace : active ? upLink : downLink).focus({preventScroll:true});
    }
    function queue() {
      if (!frame) frame = requestAnimationFrame(measure);
    }
    window.addEventListener('scroll', queue, {passive:true});
    window.addEventListener('resize', queue, {passive:true});
    window.addEventListener('pageshow', queue);
    const observer = new ResizeObserver(queue);
    observer.observe(control.closest('section') || document.body);
    if (workspace) observer.observe(workspace);
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
      }, {rootMargin: '0px 0px 280px'});
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
