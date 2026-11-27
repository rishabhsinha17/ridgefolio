(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const control = document.getElementById('down-arrow');
  if (control) {
    const workspace = document.getElementById('workspace');
    const wrapper = document.createElement('div');
    wrapper.id = 'down-arrow-sticky-wrapper';
    wrapper.className = 'sticky-wrapper';
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

  // Artwork is visible immediately. Pause continuous decoration off screen.
  const orbit = document.querySelector('.app-wheel, .rotaing');
  const planes = document.querySelector('#home-hero .animatable');
  if (window.IntersectionObserver && (orbit || planes)) {
    const visible = new Set();
    const toggle = orbit?.querySelector('.wheel-play');
    let userPaused = false;
    if (toggle) {
      orbit.setAttribute('data-wheel-ready', '');
      toggle.addEventListener('click', () => {
        userPaused = !userPaused;
        updateMotion();
      });
    }
    function updateMotion() {
      const running = !document.hidden && !reduced.matches;
      orbit?.toggleAttribute('data-orbit-running', running && visible.has(orbit) && !userPaused);
      if (toggle) {
        toggle.hidden = reduced.matches;
        toggle.toggleAttribute('data-paused', userPaused);
        toggle.setAttribute('aria-label', userPaused ? 'Play app previews' : 'Pause app previews');
      }
      planes?.toggleAttribute('data-fly-running', running && visible.has(planes));
    }
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      }
      updateMotion();
    });
    if (orbit) observer.observe(orbit);
    if (planes) observer.observe(planes);
    document.addEventListener('visibilitychange', updateMotion);
    reduced.addEventListener('change', updateMotion);
  }
})();
