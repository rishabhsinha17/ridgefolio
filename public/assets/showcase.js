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
    function offset(index) {
      const inset = records ? 0 : (viewport.clientWidth - items[index].offsetWidth) / 2;
      return items[index].offsetLeft - items[0].offsetLeft - inset;
    }
    function align(index, smooth) {
      selected = index;
      viewport.scrollTo({left:offset(index), behavior:smooth && !reduceMotion.matches ? 'smooth' : 'instant'});
    }
    function move(direction) {
      const next = selected + direction;
      if (next >= 0 && next < items.length) align(next, true);
    }
    function update() {
      const bounds = viewport.getBoundingClientRect();
      let nearest = 0;
      let center = 0;
      let closestCenter = Infinity;
      items.forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        const middle = Math.abs((rect.left + rect.right - bounds.left - bounds.right) / 2);
        if (Math.abs(offset(index) - viewport.scrollLeft) < Math.abs(offset(nearest) - viewport.scrollLeft)) nearest = index;
        if (middle < closestCenter) {
          center = index;
          closestCenter = middle;
        }
        item.classList.toggle('active', rect.right > bounds.left + 2 && rect.left < bounds.right - 2);
      });
      items.forEach((item,index) => item.classList.toggle('center', !records && index === center));
      selected = nearest;
    }
    function settle() {
      update();
      if (selected < edge) align(selected + slides.length, false);
      else if (selected >= edge + slides.length) align(selected - slides.length, false);
    }
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
      align(selected, false);
      update();
    }).observe(viewport);
    align(selected, false);
    update();
  }
})();
