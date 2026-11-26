const scrollLinks = document.querySelector('.rv-source #down-arrow');
if (scrollLinks && !matchMedia('(scripting: none)').matches) {
  const returnLink = scrollLinks.querySelector('.up');
  const forwardLink = scrollLinks.querySelector('.down');
  const observer = new IntersectionObserver(([entry]) => {
    const past = !entry.isIntersecting && entry.boundingClientRect.bottom < 0;
    returnLink.hidden = !past;
    forwardLink.hidden = past;
  });
  observer.observe(scrollLinks);
}

// The source template marks artwork with cover elements. Reveal the actual
// image independently so a neighbouring link or floating action stays usable.
if (window.IntersectionObserver && matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  const artwork = new Set();
  for (const cover of document.querySelectorAll('.rv-interior .rv-source :is(.cover, .cover-half, .cover-2, .cover-3)')) {
    if (cover.closest('header, footer, .copyright, #contact, #contact-form, .pixel-btn, a, button, .workspace')) continue;
    const frame = cover.parentElement;
    let image = frame.querySelector(':scope > img.full-img');
    if (cover.matches('.about-portrait')) image = cover;
    else if (frame.matches('.app-img-left, .app-img-right, .we-believe-img')) image = frame;
    if (image?.querySelector('a[href], button, input, select, textarea')) image = image.querySelector('img');
    if (image && image.getBoundingClientRect().top >= window.innerHeight) artwork.add(image);
  }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.setAttribute('data-art-reveal', 'visible');
      observer.unobserve(entry.target);
    }
  });
  for (const image of artwork) {
    image.setAttribute('data-art-reveal', 'waiting');
    observer.observe(image);
  }
}

// The form previews editable text in-page. Only an explicit click on the labeled
// email-app link can hand a prepared draft to the visitor's mail client.
const inquiry = document.querySelector('.contact-page #contactform');
if (inquiry) {
  const preview = document.querySelector('#contact #message');
  const subjectSelect = inquiry.querySelector('#subject');
  const organization = inquiry.querySelector('#find');
  function syncOrganization() {
    const partner = subjectSelect.selectedOptions[0]?.hasAttribute('data-organization');
    organization.disabled = !partner;
    organization.closest('.form-group').hidden = !partner;
  }
  syncOrganization();
  subjectSelect.addEventListener('change', syncOrganization);
  window.addEventListener('pageshow', syncOrganization);
  inquiry.addEventListener('input', () => {
    preview.hidden = true;
  });
  inquiry.querySelector('input[type=submit]').disabled = false;
  inquiry.addEventListener('submit', event => {
    event.preventDefault();
    const fields = new FormData(inquiry);
    const text = name => String(fields.get(name) || '').trim();
    const contact = [text('name'), text('organization'), text('email'), text('phone')].filter(Boolean);
    const body = [text('comments'), text('website'), '', ...contact].filter((line, index) => index === 2 || line).join('\n');
    const subject = text('subject') + ' — ' + (text('organization') || text('name'));
    const heading = document.createElement('strong');
    heading.textContent = subject;
    const draft = document.createElement('textarea');
    draft.rows = 8;
    draft.className = 'form-control';
    draft.setAttribute('aria-label', 'Your email draft');
    draft.value = body;
    const link = document.createElement('a');
    link.className = 'btn btn-inverse';
    link.textContent = 'Open in my email app';
    const update = () => {
      link.href = contactDraftURL(inquiry.querySelector('#verify').value, subject, draft.value);
    };
    update();
    draft.addEventListener('input', update);
    preview.replaceChildren(heading, draft, link);
    preview.hidden = false;
    draft.focus();
  });
}
