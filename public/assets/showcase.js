(() => {
  const shelf = document.querySelector('.rv-demo-shelf');
  if (!shelf) return;
  const links = [...shelf.querySelectorAll('[data-app]')];
  const panels = [...shelf.querySelectorAll('.rv-app-panel')];
  function select(slug) {
    for (const link of links) {
      if (link.dataset.app === slug) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
    for (const panel of panels) panel.hidden = panel.id !== 'preview-' + slug;
  }
  for (const link of links) {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      select(link.dataset.app);
    });
  }
  const initial = links.find(link => link.hash === location.hash) || links[0];
  select(initial.dataset.app);
  window.addEventListener('hashchange', () => {
    const matching = links.find(link => link.hash === location.hash);
    if (matching) select(matching.dataset.app);
  });
})();
