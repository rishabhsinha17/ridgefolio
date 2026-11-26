"""Public landing page using the practice's demonstrations and founder work."""

from content import DEMOS


def demos():
    actions = {"finder": "Find a service", "permit-desk": "Review a permit", "service-ledger": "Filter the ledger"}
    links = []
    panels = []
    for slug, title, desc, _ in DEMOS:
        links.append(f'<a href="#preview-{slug}" data-app="{slug}">{title}</a>')
        panels.append(f'''<figure id="preview-{slug}" class="rv-app-panel">
          <a href="/demos/{slug}/" aria-label="Open the {title} demo">
            <img src="/assets/previews/{slug}.jpg" loading="lazy" width="954" height="600" alt="{title} demonstration with fictional records">
          </a><figcaption><p>{desc}</p><a href="/demos/{slug}/">{actions[slug]} ↗</a></figcaption>
        </figure>''')
    return f'''<section class="rv-apps" aria-labelledby="apps-heading"><div class="rv-container rv-app-layout">
      <div class="rv-app-copy"><h2 id="apps-heading">Web applications<br>for public services.</h2>
      <p>Follow a sample application from a resident’s first question to the receipt at the permit desk.</p>
      <a class="rv-action rv-inverse" href="/demos/">Browse the demos</a></div>
      <div class="rv-demo-shelf"><nav class="rv-app-tabs" aria-label="Application previews">{''.join(links)}</nav>
      {''.join(panels)}</div></div></section>'''


def projects():
    projects = [
        ("industrial-parks", "University of Maryland", "Mapping Indonesia’s industrial parks", "map"),
        ("open-source", "Open-source contribution", "Inside the kvcached release", "release"),
        ("evaluation", "Research paper", "Evaluating tool-using agents", "paper"),
    ]
    art = {
        "map": '<img src="/assets/editorial/archipelago-parks.webp" alt="" loading="lazy" width="1440" height="660">',
        "release": '<div class="rv-release-exhibit"><span>kvcached / releases</span><b>v0.1.6</b><span>3 October 2026</span></div>',
        "paper": '<img src="/assets/editorial/paper-detail.webp" alt="" loading="lazy" width="772" height="567">',
    }
    return ''.join(f'''<a class="rv-project" href="/work/{slug}/"><div class="rv-exhibit rv-exhibit-{kind}">{art[kind]}</div>
      <span class="rv-credit">{credit}</span><h3>{title} ↗</h3></a>''' for slug, credit, title, kind in projects)


def resources():
    items = [
        ("project-brief", "Project brief builder", "Describe a project and download a brief for your team.", "brief"),
        ("launch-checklist", "Launch checklist", "Check the site with staff before it goes live.", "checklist"),
        ("capabilities", "Capability statement", "Share a one-page overview with a buyer or delivery partner.", "capability"),
    ]
    return ''.join(f'''<a class="rv-resource" href="/resources/{slug}/">
        <div class="rv-resource-art rv-art-{asset}"><img src="/assets/showcase/{asset}.webp" loading="lazy" width="640" height="400" alt=""></div>
        <h3>{title} ↗</h3><p>{desc}</p></a>''' for slug, title, desc, asset in items)


def render(book, ridge):
    return f'''<section class="rv-hero" aria-labelledby="hero-title">
      <div class="rv-hero-art"><picture><source media="(max-width: 700px)" srcset="/assets/showcase/hero-phone.webp" width="920" height="560"><img src="/assets/showcase/hero-wide.webp" width="1600" height="1100" fetchpriority="high" alt="Angled views of Ridgefolio’s civic software demonstrations and founder projects"></picture></div>
      <div class="rv-container rv-hero-body"><div class="field-copy"><h1 id="hero-title">Software for<br><em>public agencies.</em></h1>
        <p>Websites for residents, workflows for staff and data tools for public decisions.</p>
        <div class="rv-actions"><a href="{book}" class="rv-action field-link">Book a call</a><a href="/work/" class="rv-action rv-secondary">Our work</a></div></div>
        <a class="rv-scroll" href="#what-we-build" aria-label="Scroll to services"><svg aria-hidden="true" viewBox="0 0 20 36" width="18" height="32" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 2v29m-6-7 6 8 6-8"/></svg></a></div></section>
      <section id="what-we-build" class="rv-intro rv-container" aria-labelledby="what-heading"><h2 id="what-heading">What does a resident need to do?</h2>
       <p>Find a service, submit a form or make sense of a public record. We build the software and give your staff the tools to keep it running.</p>
       <nav class="rv-service-nav" aria-label="Engineering services"><a href="/services/websites/">Websites &amp; portals ↗</a><a href="/services/workflows/">Forms &amp; workflows ↗</a><a href="/services/data/">Data &amp; reporting ↗</a></nav></section>
      {demos()}
      <section class="rv-portfolio rv-container" id="work" aria-labelledby="work-heading">
        <div class="rv-section-head"><div><h2 id="work-heading">Our work</h2><p>Selected projects from Rishabh Sinha’s research and engineering practice.</p></div>
        <a class="rv-action rv-secondary" href="/work/">All project notes</a></div><div class="rv-projects">{projects()}</div></section>
      <section class="rv-responsive"><div class="rv-container rv-device-layout"><div class="rv-device-copy"><h2>A public map,<br>on any screen.</h2>
      <p>At the University of Maryland, Rishabh built a dashboard for the Center for Global Sustainability. Readers can inspect individual industrial parks. Researchers can update all seven geographic files from one spreadsheet.</p>
      <a class="rv-action" href="/work/industrial-parks/">Explore the case study</a></div>
      <a class="rv-devices" href="/work/industrial-parks/#the-map" aria-label="Explore the industrial parks map">
      <img class="rv-display" src="/assets/showcase/map-desktop.webp" width="1080" height="801" loading="lazy" alt="Desktop view of the industrial parks map">
      <img class="rv-handset" src="/assets/showcase/map-mobile.webp" width="350" height="684" loading="lazy" alt="Phone view of the same map and its park filters"></a>
      </div></section>
      <section id="practice" class="rv-practice rv-container"><div class="rv-practice-copy" id="about"><div class="founder-signature"><img src="/assets/editorial/founder.webp" alt="Rishabh Sinha" width="90" height="90" loading="lazy"><div><span>The practice</span><h2>Rishabh Sinha</h2></div></div>
      <p>Rishabh scopes the project, builds the software and walks your team through the handover.</p>
      <a href="/practice/" class="rv-textlink">Meet Rishabh ↗</a><div class="rv-records"><h3>Engineering records</h3>
      <a class="field-work-row" href="https://github.com/ovg-project/kvcached/releases/tag/v0.1.6">kvcached release notes ↗</a>
      <a class="field-work-row" href="https://github.com/IBM/vLLM-Hook/pull/41">IBM vLLM Hook contribution ↗</a>
      <a class="field-work-row" href="https://arxiv.org/abs/2610.37679">Agent evaluation preprint ↗</a></div></div>{ridge}</section>
      <section class="rv-library"><div class="rv-container"><div class="rv-section-head"><div><h2>For buyers</h2><p>Prepare a scope or check a site before launch.</p></div><a class="rv-action rv-secondary" href="/resources/">All resources</a></div>
      <div class="rv-resources">{resources()}</div></div></section>'''
