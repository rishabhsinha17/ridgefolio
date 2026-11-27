"""Render the public home page with Ridgefolio projects and working examples."""

from html import escape


# The skipped card numbers are part of the published stage layout. Two pictures
# may share the same ground position while the foreground picture floats above it.
HERO_SCREENS = (
    (1, "article-evidence/permit-desk-1920.webp"),
    (2, "article-evidence/capability-1920.webp"),
    (3, "project-evidence/monitor-confidence-preview.svg"),
    (4, None),  # The outline occupies this slot on its own.
    (5, "home-evidence/field-map-test.webp"),
    (6, "cgs-atlas/overview.webp"),
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
    ("/work/industrial-parks/", "Indonesia’s industrial parks", "University of Maryland · Founder project", "atlas"),
    ("/demos/permit-desk/", "Permit desk", "Working demonstration", "permit"),
    ("/work/evaluation/", "Testing tool-using agents", "Founder research", "evaluation"),
    ("/demos/service-ledger/", "Service ledger", "Working demonstration", "ledger"),
    ("/work/open-source/", "Inside the kvcached release", "Open-source contribution", "release"),
    ("/demos/finder/", "Service finder", "Working demonstration", "finder"),
)

RESOURCES = (
    ("/resources/project-brief/", "Project brief builder", "Describe one service, its users and the outcome your team needs. Download the brief for a project discussion.", "brief"),
    ("/resources/launch-checklist/", "Launch checklist", "Check accessibility, redirects, handover and the tasks residents need to complete.", "checklist"),
    ("/resources/capabilities/", "Capability statement", "A one-page overview of Ridgefolio’s services, delivery arrangements and founder experience.", "capability"),
    ("/pricing/", "Scope and pricing", "See how discovery, a milestone-based build and ongoing support fit into a budget.", "scope"),
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
        if asset:
            src = f"hero-cards/card-{number}.webp" if asset.endswith(".webp") else asset
            planes.append(f'<img src="/assets/{src}" alt="" class="card card{number}" loading="eager">')
        if number in outlines:
            style, index = outlines[number]
            planes.append(f'<div class="{style} card-border{index}"></div>')
    return f'''<section id="home-hero" class="tour" aria-labelledby="hero-heading">
      <div class="container"><div class="row">
        <div class="col-sm-5 caption-wrap v-align">{placeholder()}<div class="caption-inner">
          <span class="no-margin h1 display-text">We build</span>
          <h1 class="text-muted text-light display-text" id="hero-heading" tabindex="-1">Software for public agencies.</h1>
          <p>{action("/contact/", "Contact us", "btn-inverse open-contact-form")}{action("/work/", "Our work", "btn-default")}</p>
          <div id="down-arrow">{arrow("Back to the top", "#home-hero", "up")}{arrow("Explore the practice", "#welcome-header", "down")}</div>
        </div></div>
        <div class="col-sm-7 v-align"><div class="perspective-section" role="img" aria-label="Ridgefolio demonstrations, maps, research charts and project records">
          <div class="animatable animated" aria-hidden="true">{''.join(planes)}</div>
        </div></div>
      </div></div></section>'''


def statement(section_id, text, anchor):
    return f'''<section id="{section_id}" class="header-block padding-tb-150"><div class="container"><div class="row">
      <div class="col-md-10 col-md-offset-1" id="{anchor}">{placeholder("menu-edit-btn" if section_id == "testimonials-header" else "title-btn")}<h2 class="text-center">{text}</h2></div>
    </div></div></section>'''


def apps():
    records = "".join(
        f'<span class="wheel-arm wheel-{slug}"><img class="wheel-print" src="/assets/home-projects/wheel-{slug}-960.webp" '
        f'srcset="/assets/home-projects/wheel-{slug}-480.webp 480w, /assets/home-projects/wheel-{slug}-960.webp 960w, '
        f'/assets/home-projects/wheel-{slug}-1280.webp 1280w" sizes="(max-width:991px) min(50vw, 320px), min(28vw, 410px)" '
        f'width="960" height="522" alt="" loading="eager"></span>'
        for slug in ("finder", "permit", "ledger")
    )
    return f'''<section id="apps"><div class="container"><div class="row">
      <div class="col-md-4 v-align">{placeholder()}<h3 class="h1">Web applications<br><span class="text-muted">for public services.</span></h3>
        <p class="lead"><span>Find a service, review a permit or filter a workload report. Try each task with sample records.</span></p>
        <p>{action("/demos/", "Try the apps")}{action("/work/", "Our work")}</p></div>
      <div class="col-md-7 col-md-offset-1 rotating-apps"><div class="app-wheel">
        <div class="wheel-paths" aria-hidden="true"></div><div class="wheel-scene" aria-hidden="true">{records}</div>
        <button type="button" class="wheel-play" aria-label="Pause app previews" hidden>
          <svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16"><path class="pause" d="M8 5v14m8-14v14"/><path class="play" d="m8 5 10 7-10 7z"/></svg>
        </button></div></div></div></div></section>'''


def cover_image(asset, sizes):
    if asset == "evaluation":
        source = 'src="/assets/project-evidence/monitor-strata-compact.svg"'
    else:
        path = f"/assets/home-projects/cover-{asset}-"
        source = (f'src="{path}640.webp" srcset="{path}640.webp 640w, {path}960.webp 960w, {path}1440.webp 1440w" '
                  f'sizes="{sizes}"')
    return f'<img class="project-image" {source} alt="" width="360" height="432" loading="eager">'


def projects():
    cards = []
    for url, title, credit, asset in PROJECTS:
        art = cover_image(asset, "(max-width:767px) calc((100vw - 30px) / 2), calc((100vw - 90px) / 4)")
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
        <img class="shot1" src="/assets/home-evidence/atlas-desktop-1300.webp" srcset="/assets/home-evidence/atlas-desktop-740.webp 740w, /assets/home-evidence/atlas-desktop-1300.webp 1300w, /assets/home-evidence/atlas-desktop-2600.webp 2600w, /assets/home-evidence/atlas-desktop-3300.webp 3300w" sizes="(max-width:991px) min(85vw, 640px), min(45vw, 655px)" alt="Ridgefolio’s CGS case study and industrial parks map on a desktop screen" width="1100" height="1449" loading="eager">
        <img class="shot2" src="/assets/home-evidence/atlas-iphone-650.webp" srcset="/assets/home-evidence/atlas-iphone-650.webp 650w, /assets/home-evidence/atlas-iphone-1308.webp 1308w" sizes="(max-width: 991px) min(30vw, 200px), min(14vw, 186px)" alt="The industrial parks atlas on an iPhone, filtered to the 13 parks in Sulawesi" width="436" height="876" loading="eager">
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
        <img class="client-shot" src="/assets/cgs-atlas/morowali-1920.webp" srcset="/assets/cgs-atlas/morowali-960.webp 960w, /assets/cgs-atlas/morowali-1920.webp 1920w, /assets/cgs-atlas/morowali-4000.webp 4000w" sizes="(max-width: 991px) 1px, min(1200px, 100vw)" alt="Daylight view of Indonesia Morowali Industrial Park on the Central Sulawesi coast" width="4639" height="2980" loading="eager"></div>
      <div class="col-md-5 col-md-offset-2 padding-t-150-b-50">{placeholder("testimonial-btn")}<div class="testimonials owl-carousel owl-theme" tabindex="0" aria-label="Eleven project records">
        {''.join(notes)}</div>
      </div></div></div></section>'''


def library():
    cards = []
    for href, title, desc, asset in RESOURCES:
        art = cover_image(asset, "(max-width:767px) 74vw, (max-width:991px) 43vw, min(29vw, 420px)")
        cards.append(f'''<div class="item"><article class="simple-project resource-card"><a href="{href}">
          <div class="img-wrap">{art}</div><h4>{escape(title)}</h4><p>{escape(desc)}</p>
          <span class="resource-action">Open resource</span></a></article></div>''')
    return f'''<section id="blog-list" class="padding-tb-150"><div class="container">
      <div class="row"><div class="col-md-8">{placeholder()}<h3 class="h1">For buyers<br><span class="text-muted">Plan your next project.</span></h3></div>
      <div class="col-md-4"><p class="pull-right">{action("/contact/", "Contact us", "btn-inverse open-contact-form")}{action("/resources/", "All resources")}</p></div></div>
      </div><div class="resource-carousel owl-carousel owl-theme" tabindex="0" role="region" aria-label="Browse four buyer resources">
      {''.join(cards)}</div></section>'''


def render():
    return "".join((
        hero(), statement("welcome-header", "A resident looks up a permit. A reviewer asks for a correction. A director checks the numbers. We build the software behind those tasks.", "what-we-build"),
        apps(), projects(), responsive(),
        statement("testimonials-header", "Engineering you can inspect.", "records"),
        evidence(), library(),
    ))
