"""Render the public home page with Ridgefolio projects and working examples."""

from html import escape


# The skipped card numbers are part of the published stage layout. Two pictures
# may share the same ground position while the foreground picture floats above it.
HERO_SCREENS = (
    (1, "article-evidence/permit-desk-1920.webp"),
    (2, "article-evidence/capability-1920.webp"),
    (3, "project-evidence/monitor-confidence.svg"),
    (4, "project-evidence/paper-page.webp"),
    (5, "home-evidence/field-map-test.webp"),
    (6, "cgs-atlas/overview.webp"),
    (7, "home-evidence/design-method-cards.webp"),
    (8, "cgs-atlas/morowali-1920.webp"),
    (9, "home-evidence/planning-workshop.webp"),
    (10, "project-evidence/monitor-strata.svg"),
    (11, "article-evidence/finder-1920.webp"),
    (12, "editorial/city-hall-dome-1050.webp"),
    (14, "interior-art/kiosk-960.webp"),
    (19, "home-evidence/finder.webp"),
    (20, "article-evidence/capability-sheet.webp"),
    (22, "article-evidence/service-ledger-1920.webp"),
)

PROJECTS = (
    ("/work/industrial-parks/", "Indonesia’s industrial parks", "University of Maryland · Founder project", "home-evidence/sulawesi.webp"),
    ("/demos/permit-desk/", "Permit desk", "Working demonstration", "interior-art/public-market-2560.webp"),
    ("/work/evaluation/", "Testing tool-using agents", "Founder research", "project-evidence/monitor-confidence.svg"),
    ("/demos/service-ledger/", "Service ledger", "Working demonstration", "home-evidence/service-ledger.webp"),
    ("/work/open-source/", "Inside the kvcached release", "Open-source contribution", "interior-art/review-changes-2560.webp"),
    ("/demos/finder/", "Service finder", "Working demonstration", "interior-art/kiosk-2560.webp"),
)

RESOURCES = (
    ("/resources/project-brief/", "Project brief builder", "Describe one service, its users and the outcome your team needs. Download the brief for a project discussion.", "home-evidence/planning-workshop.webp"),
    ("/resources/launch-checklist/", "Launch checklist", "Check accessibility, redirects, handover and the tasks residents need to complete.", "home-evidence/launch-checklist.webp"),
    ("/resources/capabilities/", "Capability statement", "A one-page overview of Ridgefolio’s services, delivery arrangements and founder experience.", "article-evidence/capability-sheet.webp"),
    ("/pricing/", "Scope and pricing", "See how discovery, a milestone-based build and ongoing support fit into a budget.", "interior-art/railway-plan-2560.webp"),
)

ENGINEERING = (
    ("The University of Maryland research team published maps, charts and downloadable data about industrial parks in Indonesia. Rishabh built the dashboard as a research assistant at CGS.", "Website engineering · University of Maryland", "/work/industrial-parks/"),
    ("The archived May 2025 dataset contains 141 named industrial parks. Readers can explore the location and status of each one on the case-study map.", "CGS handover dataset · May 2025", "/work/industrial-parks/#the-map"),
    ("Nine Plotly charts turn the team’s CSV records into views of park status, electricity supply and industrial activity.", "CGS dashboard · Chart implementation", "/work/industrial-parks/#implementation"),
    ("Rishabh wrote a Python script that turns the master spreadsheet into seven geographic files. Each file keeps the same parks and selects the fields needed for its map layer.", "CGS dashboard · Publishing workflow", "/work/industrial-parks/#implementation"),
    ("The June 2024 launch presentation introduced a dataset of 140 parks and showed how to read six map layers.", "CGS dashboard · Public launch", "/work/industrial-parks/#outcome"),
    ("A subsequent UMD study of 106 nickel smelters cites the industrial parks dataset in its methods.", "CGS dashboard · Research reuse", "/work/industrial-parks/#outcome"),
    ("The kvcached v0.1.6 release lists Rishabh as a core contributor. The release notes and associated code review are public.", "Open-source infrastructure · kvcached v0.1.6", "/work/open-source/"),
    ("A merged contribution to IBM’s vLLM Hook is available with its implementation and code review.", "Open-source infrastructure · IBM vLLM Hook", "https://github.com/IBM/vLLM-Hook/pull/41"),
    ("Rishabh studied what a monitor can infer when a software agent encounters malicious instructions in a tool response.", "Founder research · Agent evaluation", "/work/evaluation/"),
    ("The permit desk demonstration follows a sample application through intake, correction and a reviewer’s decision.", "Ridgefolio demonstration · Permit desk", "/demos/permit-desk/"),
    ("The service ledger lets a buyer explore workload filters and export the selected rows from a sample of service requests.", "Ridgefolio demonstration · Service ledger", "/demos/service-ledger/"),
)


def placeholder(kind="title-btn"):
    return f'<div class="rz-edit-wrap {kind}" aria-hidden="true"></div>'


def action(url, text, classes="btn-inverse"):
    return f'<a class="btn {classes}" href="{url}">{escape(text)}</a>'


def arrow(label, link, direction):
    title = "<title>Back to the top</title>" if direction == "up" else ""
    return f'<a class="{direction}" href="{link}" aria-label="{label}"><svg viewBox="0 0 24 36" width="24" height="36" aria-hidden="true">{title}<polygon fill="currentColor" points="11,1 13,1 13,29 20,22 21.5,23.5 12,33 2.5,23.5 4,22 11,29"></polygon></svg></a>'


def hero():
    planes = []
    outlines = {1: ("card-border-dashed", 1), 4: ("card-border", 2),
                8: ("card-border-dashed", 3), 12: ("card-border-dashed", 4)}
    for number, asset in HERO_SCREENS:
        planes.append(f'<img src="/assets/{asset}" alt="" class="card card{number}" decoding="async">')
        if number in outlines:
            style, index = outlines[number]
            planes.append(f'<div class="{style} card-border{index}"></div>')
    return f'''<section id="home-hero" class="tour" aria-labelledby="hero-heading">
      <div class="container"><div class="row">
        <div class="col-sm-5 caption-wrap v-align">{placeholder()}<div class="caption-inner">
          <span class="no-margin h1 display-text">We build</span>
          <h1 class="text-muted text-light display-text" id="hero-heading">Software for public agencies.<br><img class="aos-init aos-animate" src="/assets/showcase/home-services.svg" width="300" height="83" alt="Websites, workflows and data tools."></h1>
          <p>{action("/contact/", "Contact us", "btn-inverse open-contact-form")}{action("/work/", "Our work", "btn-default")}</p>
          <div id="down-arrow">{arrow("Back to the top", "#home-hero", "up")}{arrow("Explore the practice", "#welcome-header", "down")}</div>
        </div></div>
        <div class="col-sm-7 v-align"><div class="perspective-section" role="img" aria-label="Ridgefolio demonstrations, maps, research charts and project records">
          <div class="animatable" aria-hidden="true">{''.join(planes)}</div>
        </div></div>
      </div></div></section>'''


def statement(section_id, text, anchor):
    return f'''<section id="{section_id}" class="header-block padding-tb-150"><div class="container"><div class="row">
      <div class="col-md-10 col-md-offset-1" id="{anchor}">{placeholder("menu-edit-btn" if section_id == "testimonials-header" else "title-btn")}<h2 class="text-center">{text}</h2></div>
    </div></div></section>'''


def apps():
    return f'''<section id="apps"><div class="container"><div class="row">
      <div class="col-md-4 v-align">{placeholder()}<h3 class="h1">Web applications<br><span class="text-muted">for public services.</span></h3>
        <p class="lead"><span>Find a service, review a permit or filter a workload report. Try each task with sample records.</span></p>
        <p>{action("/demos/", "Try the apps")}{action("/work/", "Our work")}</p></div>
      <div class="col-md-7 col-md-offset-1 rotating-apps equal padding-tb-150" aria-hidden="true"><div class="rotaing">
        <div class="one"></div><div class="two"></div><div class="three"></div>
      </div></div></div></div></section>'''


def projects():
    cards = []
    for url, title, credit, asset in PROJECTS:
        art = f'<div class="project-image" style="--project-image:url(/assets/{asset})"></div>'
        cards.append(f'''<div class="item"><div class="simple-project"><a href="{url}">
          <div class="img-wrap">{art}</div><p class="h3">{escape(title)}<small>{escape(credit)}</small></p></a></div></div>''')
    return f'''<section id="our-work-header" class="padding-t-150-b-50"><div class="container" id="work"><div class="row">
      <div class="col-md-8">{placeholder()}<h3 class="h1">Our work<br><span class="text-muted">Projects and demos.</span></h3>
        <p class="lead">Explore Rishabh’s research and open-source work alongside demonstrations built by Ridgefolio.</p></div>
      <div class="col-md-4"><p class="pull-right">{action("/work/", "Project notes")}</p></div>
      </div></div></section>
      <section id="featured-projects" aria-label="Featured projects"><div class="container-fluid"><div class="row"><div class="col-md-12">
        <div class="project-carousel owl-carousel owl-theme text-center" tabindex="0" aria-label="Browse six projects">{''.join(cards)}</div>
      </div></div></div></section>'''


def responsive():
    return f'''<section id="responsive" class="padding-tb-150"><div class="container"><div class="row">
      <div class="col-md-5"><div class="sticky-element">{placeholder()}<h3 class="h1">One public map.<br><span class="text-muted">Any screen size.</span></h3>
        <p class="lead">As a research assistant at the University of Maryland, Rishabh built the industrial parks dashboard for the Center for Global Sustainability. Readers can inspect 141 parks in the May 2025 data.</p>
        {action("/contact/", "Contact us", "btn-inverse open-contact-form")}{action("/work/industrial-parks/", "Case study")}<p></p>
      </div></div>
      <div class="col-md-6 col-md-offset-1 responsive-shots">
        <img class="shot1" src="/assets/home-evidence/atlas-desktop-1300.webp" srcset="/assets/home-evidence/atlas-desktop-740.webp 740w, /assets/home-evidence/atlas-desktop-1300.webp 1300w, /assets/home-evidence/atlas-desktop-2600.webp 2600w, /assets/home-evidence/atlas-desktop-3300.webp 3300w" sizes="(max-width: 991px) calc(100vw - 60px), min(1300px, 100vw)" alt="Ridgefolio’s CGS case study and industrial parks map on a desktop screen" width="1100" height="1449" loading="lazy">
        <img class="shot2 sticky-element" src="/assets/home-evidence/atlas-iphone-650.webp" srcset="/assets/home-evidence/atlas-iphone-650.webp 650w, /assets/home-evidence/atlas-iphone-1308.webp 1308w" sizes="(max-width: 991px) 200px, 400px" alt="The industrial parks atlas on an iPhone, filtered to the 13 parks in Sulawesi" width="436" height="876" loading="lazy">
      </div></div></div></section>'''


def evidence():
    notes = []
    for index, (text, label, url) in enumerate(ENGINEERING):
        record = escape(text)
        if index in (2, 9, 10):
            record = f"<span>{record}</span>"
        notes.append(f'<div class="item" data-source="{escape(url, quote=True)}"><div class="h3">{record}</div><p class="text-muted">{escape(label)}</p></div>')
    return f'''<section id="quotes" aria-label="Founder and studio project records"><div class="container" id="practice"><div class="row">
      <div class="col-md-5 hidden-sm hidden-xs" id="about">
        <img class="client-shot" src="/assets/cgs-atlas/morowali-1920.webp" srcset="/assets/cgs-atlas/morowali-960.webp 960w, /assets/cgs-atlas/morowali-1920.webp 1920w, /assets/cgs-atlas/morowali-4000.webp 4000w" sizes="(max-width: 991px) 1px, min(1200px, 100vw)" alt="Daylight view of Indonesia Morowali Industrial Park on the Central Sulawesi coast" width="4639" height="2980" loading="lazy"></div>
      <div class="col-md-5 col-md-offset-2 padding-t-150-b-50">{placeholder("testimonial-btn")}<div class="testimonials owl-carousel owl-theme" tabindex="0" aria-label="Eleven project records">
        {''.join(notes)}</div>
      </div></div></div></section>'''


def library():
    cards = []
    for href, title, desc, asset in RESOURCES:
        credit = ' data-photo-credit="Service design workshop · 18F"' if href == "/resources/project-brief/" else ""
        if href == "/pricing/":
            credit = ' data-photo-credit="San Francisco Cable Car Powerhouse · HAER"'
        image = f"url(/assets/{asset})"
        cards.append(f'''<div class="col-md-3"><div class="blog-list-item"><a href="{href}">
          <div class="blog-lest-img relative"><div class="blog-image" style="background-image:{image}"></div><div class="cover"{credit}></div></div>
          <h4>{escape(title)}</h4><p>{escape(desc)}</p><span class="btn btn-link">Open resource</span></a></div></div>''')
    return f'''<section id="blog-list" class="padding-tb-150"><div class="container">
      <div class="row"><div class="col-md-8">{placeholder()}<h3 class="h1">For buyers<br><span class="text-muted">Plan your next project.</span></h3></div>
      <div class="col-md-4"><p class="pull-right">{action("/contact/", "Contact us", "btn-inverse open-contact-form")}{action("/resources/", "All resources")}</p></div></div>
      <div class="row">{''.join(cards)}</div></div></section>'''


def render():
    return "".join((
        hero(), statement("welcome-header", "A resident looks up a permit. A reviewer asks for a correction. A director checks the numbers. We build the software behind those tasks.", "what-we-build"),
        apps(), projects(), responsive(),
        statement("testimonials-header", "Engineering you can inspect.", "records"),
        evidence(), library(),
    ))
