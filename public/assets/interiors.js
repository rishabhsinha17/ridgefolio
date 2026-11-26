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

// The form previews editable text in-page. Only an explicit click on the labeled
// email-app link can hand a prepared draft to the visitor's mail client.
const inquiry = document.querySelector('.contact-page #contactform');
if (inquiry) {
  const preview = document.querySelector('#contact #message');
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
