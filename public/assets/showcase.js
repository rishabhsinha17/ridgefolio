(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hero = document.getElementById('home-hero');
  if (hero) {
    const arrows = hero.querySelector('#down-arrow');
    const stickyFrame = box('sticky-wrapper');
    stickyFrame.id = 'down-arrow-sticky-wrapper';
    arrows.replaceWith(stickyFrame);
    stickyFrame.append(arrows);
    hero.querySelector('.animatable').classList.add('animated');
    new IntersectionObserver(([entry]) => {
      document.body.classList.toggle('show-return-arrow', !entry.isIntersecting);
    }).observe(hero);
  }

  function box(className) {
    const element = document.createElement('div');
    element.className = className;
    return element;
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
      control.textContent = direction < 0 ? '←' : '→';
      keyboardActivate(control, () => move(direction));
      nav.append(control);
    }
    dots.setAttribute('aria-hidden', 'true');
    carousel.replaceChildren(viewport, nav, dots);

    let selected = edge;
    let settleTimer;
    let isDragging = false;
    let measuredWidth = 0;
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
      return closest;
    }
    function align(index, smooth) {
      selected = index;
      const delta = centerDistance(items[index], viewport.getBoundingClientRect());
      const animate = smooth && !reduceMotion.matches;
      viewport.scrollTo({left: viewport.scrollLeft + delta, behavior: animate ? 'smooth' : 'instant'});
      update();
    }
    function move(direction) {
      const next = selected + direction;
      if (next >= 0 && next < items.length) align(next, true);
    }
    function settle() {
      if (isDragging) return;
      const nearest = update();
      const original = edge + ((nearest - edge + slides.length) % slides.length);
      const drift = centerDistance(items[original], viewport.getBoundingClientRect());
      if (Math.abs(drift) > 0.75) align(original, false);
      selected = original;
    }
    viewport.addEventListener('pointerdown', () => { isDragging = true; }, {passive:true});
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
})();
