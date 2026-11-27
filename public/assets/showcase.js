(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function box(className) {
    const element = document.createElement('div');
    element.className = className;
    return element;
  }

  function vector(path, diagonal = false) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', diagonal ? 'rf-diagonal-arrow' : 'rf-control-icon');
    svg.setAttribute('viewBox', diagonal ? '0 0 16 16' : '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', diagonal ? '1.5' : '1.65');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const shape = document.createElementNS(ns, 'path');
    shape.setAttribute('d', path);
    svg.append(shape);
    return svg;
  }

  function keyboardActivate(element, action) {
    element.tabIndex = 0;
    element.addEventListener('click', action);
    element.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      action();
    });
  }

  function setupRotation(carousel, button, label, advance, isScrollable = () => true) {
    button.setAttribute('role', 'button');
    button.setAttribute('aria-label', 'Automatic rotation for ' + label);
    let paused = reduceMotion.matches;
    let hovered = false;
    let visible = false;
    let rotationTimer;
    function schedule() {
      clearTimeout(rotationTimer);
      if (!visible || !isScrollable() || paused || hovered || document.hidden || reduceMotion.matches) return;
      rotationTimer = setTimeout(() => { advance(); schedule(); }, 5000);
    }
    function rotationState() {
      button.setAttribute('aria-pressed', String(!paused));
      button.title = (paused ? 'Play' : 'Pause') + ' automatic rotation';
      button.replaceChildren(vector(paused ? 'M8 5l11 7-11 7z' : 'M8 5v14m8-14v14'));
      schedule();
    }
    function pause() {
      if (!paused) { paused = true; rotationState(); }
    }
    const toggle = () => {
      paused = !paused;
      rotationState();
    };
    if (button.tagName === 'BUTTON') button.addEventListener('click', toggle);
    else keyboardActivate(button, toggle);
    button.setAttribute('aria-keyshortcuts','Enter Space');
    function resize() {
      button.hidden = !isScrollable();
      schedule();
    }
    rotationState();
    resize();
    new ResizeObserver(resize).observe(carousel);
    reduceMotion.addEventListener('change', () => {
      paused = reduceMotion.matches || paused;
      rotationState();
    });
    carousel.addEventListener('focusin', event => { if (!button.contains(event.target)) pause(); });
    carousel.addEventListener('mouseenter', () => { hovered = true; schedule(); });
    carousel.addEventListener('mouseleave', () => { hovered = false; schedule(); });
    document.addEventListener('visibilitychange', schedule);
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    }, {threshold:.15}).observe(carousel);
    return pause;
  }

  for (const carousel of document.querySelectorAll('.rv-home .owl-carousel')) {
    const slides = [...carousel.children];
    const records = carousel.classList.contains('testimonials');
    const label = records ? 'record' : 'project';
    const edge = records ? 6 : 4;
    const viewport = box('owl-stage-outer');
    const stage = box('owl-stage');
    const nav = box('owl-nav disabled');
    const dots = box('owl-dots disabled');

    const sequence = [...slides.slice(-edge), ...slides, ...slides.slice(0, edge)];
    const items = sequence.map((slide, index) => {
      const clone = index < edge || index >= edge + slides.length;
      const item = box(clone ? 'owl-item cloned' : 'owl-item');
      if (clone) {
        item.setAttribute('aria-hidden', 'true');
        const copy = slide.cloneNode(true);
        // A visible preview at the edge remains a native pointer link. Only the
        // original appears in the tab sequence and accessibility tree.
        for (const link of copy.querySelectorAll('a')) link.tabIndex = -1;
        if (records) item.inert = true;
        item.append(copy);
      } else {
        item.append(slide);
        item.setAttribute('role', 'group');
        item.setAttribute('aria-label', (index - edge + 1) + ' of ' + slides.length);
        if (records) {
          const attribution = slide.querySelector('.text-muted');
          attribution.setAttribute('role', 'link');
          attribution.setAttribute('aria-label', 'View project record for ' + attribution.textContent);
          attribution.append(document.createTextNode(' '), vector('M3 13 13 3M4 3h9v9', true));
          keyboardActivate(attribution, () => location.assign(slide.dataset.source));
        }
      }
      return item;
    });
    stage.append(...items);
    viewport.append(stage);
    carousel.classList.add('owl-loaded', 'owl-drag');
    nav.setAttribute('role', 'group');
    nav.setAttribute('aria-label', 'Browse ' + label + 's');
    for (const direction of [-1, 1]) {
      const control = box(direction < 0 ? 'owl-prev' : 'owl-next');
      control.setAttribute('role', 'button');
      control.setAttribute('aria-label', (direction < 0 ? 'Previous ' : 'Next ') + label);
      control.append(vector(direction < 0 ? 'M20 12H4m7-7-7 7 7 7' : 'M4 12h16m-7-7 7 7-7 7'));
      keyboardActivate(control, () => { pause(); move(direction); });
      nav.append(control);
    }
    // The source's unused dots slot houses an explicit rotation control.
    // Entering slide or navigation content also stops automatic movement.
    dots.className = 'owl-dots rf-rotation';
    const pause = setupRotation(carousel, dots, label + 's', () => move(1));
    carousel.replaceChildren(viewport, nav, dots);

    const recordPanel = records ? document.querySelector('#quotes #about') : null;
    const illustration = recordPanel?.querySelector('.client-shot');
    const firstImageSources = illustration?.getAttribute('srcset');
    const firstImage = illustration?.getAttribute('src');
    let selected = edge;
    let settleTimer;
    let isDragging = false;
    let measuredWidth = 0;
    let animationFrame;
    function centerDistance(item, bounds) {
      const rect = item.getBoundingClientRect();
      return (rect.left + rect.right - bounds.left - bounds.right) / 2;
    }
    function update() {
      const bounds = viewport.getBoundingClientRect();
      let closest = 0;
      let distance = Infinity;
      items.forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        const delta = Math.abs((rect.left + rect.right - bounds.left - bounds.right) / 2);
        if (delta < distance) {
          closest = index;
          distance = delta;
        }
        item.classList.toggle('active', rect.right > bounds.left + 2 && rect.left < bounds.right - 2);
      });
      items.forEach((item, index) => item.classList.toggle('center', !records && index === closest));
      if (illustration && recordPanel.offsetWidth) {
        const art = sequence[closest].dataset;
        if (illustration.dataset.art !== art.art) {
          // The initial photograph has a responsive source set. Later records
          // have their own intrinsic sizes and carry their own source credit.
          if (art.art === slides[0].dataset.art && firstImageSources) {
            illustration.setAttribute('srcset', firstImageSources);
            illustration.src = firstImage;
          } else {
            illustration.removeAttribute('srcset');
            illustration.src = art.art;
          }
          illustration.dataset.art = art.art;
          illustration.alt = art.alt;
          recordPanel.dataset.credit = art.credit;
          recordPanel.dataset.artKind = art.artKind;
        }
      }
      return closest;
    }
    function align(index, smooth) {
      selected = index;
      const delta = centerDistance(items[index], viewport.getBoundingClientRect());
      const animate = smooth && !reduceMotion.matches;
      stopAnimation();
      if (!animate) {
        viewport.scrollTo({left: viewport.scrollLeft + delta, behavior:'instant'});
        update();
        return;
      }
      const from = viewport.scrollLeft;
      const start = performance.now();
      function step(now) {
        const progress = Math.min(1, (now - start) / 1200);
        // The rail moves independently of the page's vertical scroll.
        const ease = .5 - .5 * Math.cos(Math.PI * progress);
        viewport.scrollTo({left:from + delta * ease, behavior:'instant'});
        if (progress < 1) animationFrame = requestAnimationFrame(step);
        else { animationFrame = 0; settle(); }
      }
      animationFrame = requestAnimationFrame(step);
    }
    function move(direction) {
      const next = selected + direction;
      if (next >= 0 && next < items.length) align(next, true);
    }
    function settle() {
      if (isDragging || animationFrame) return;
      const nearest = update();
      const original = edge + ((nearest - edge + slides.length) % slides.length);
      const drift = centerDistance(items[original], viewport.getBoundingClientRect());
      if (Math.abs(drift) > 0.75) align(original, false);
      selected = original;
    }
    function stopAnimation() {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }
    viewport.addEventListener('pointerdown', () => { stopAnimation(); isDragging = true; pause(); }, {passive:true});
    viewport.addEventListener('wheel', () => { stopAnimation(); pause(); }, {passive:true});
    document.addEventListener('visibilitychange', () => { if (document.hidden) stopAnimation(); });
    reduceMotion.addEventListener('change', () => { if (reduceMotion.matches) align(selected, false); });
    const finishDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      clearTimeout(settleTimer);
      settleTimer = setTimeout(settle, 160);
    };
    window.addEventListener('pointerup', finishDrag, {passive:true});
    window.addEventListener('pointercancel', finishDrag, {passive:true});
    carousel.addEventListener('keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      pause();
      move(event.key === 'ArrowRight' ? 1 : -1);
    });
    viewport.addEventListener('scroll', () => {
      update();
      clearTimeout(settleTimer);
      settleTimer = setTimeout(settle, 150);
    }, {passive:true});
    new ResizeObserver(() => {
      if (viewport.clientWidth !== measuredWidth) {
        measuredWidth = viewport.clientWidth;
        align(selected, false);
      }
    }).observe(viewport);
    align(selected, false);
    update();
  }

  // The interior project record rail already includes native numbered anchors.
  // Rotate only when a narrow layout actually clips one of the three records.
  for (const rail of document.querySelectorAll('.about-page .quotes-carousel')) {
    const links = rail.parentElement.querySelector('.project-record-nav');
    if (!links) continue;
    const rotation = document.createElement('button');
    rotation.type = 'button';
    rotation.className = 'record-rotation';
    links.append(rotation);
    const cards = [...rail.children];
    const wide = () => rail.scrollWidth > rail.clientWidth + 2;
    const advance = () => {
      const left = rail.getBoundingClientRect().left;
      const nearest = cards.reduce((a, b) =>
        Math.abs(a.getBoundingClientRect().left - left) < Math.abs(b.getBoundingClientRect().left - left) ? a : b);
      const next = cards[(cards.indexOf(nearest) + 1) % cards.length];
      rail.scrollTo({left:rail.scrollLeft + next.getBoundingClientRect().left - left,
        behavior:reduceMotion.matches ? 'instant' : 'smooth'});
    };
    const pause = setupRotation(rail, rotation, 'project records', advance, wide);
    rail.addEventListener('pointerdown', pause, {passive:true});
    rail.addEventListener('wheel', pause, {passive:true});
    links.addEventListener('focusin', event => { if (event.target !== rotation) pause(); });
  }
})();
