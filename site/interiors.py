"""Render Ridgefolio content in the catalogue, project, case and article page families."""

from html import escape
import re

import editorial as ed
import navigation
from content import CASES, DEMOS, RESOURCES, SERVICES


RIGHT_ARROW = (
    '<svg aria-hidden="true" focusable="false" width="28" height="20" viewBox="0 0 28 20" fill="none" stroke="currentColor" stroke-width="2">'
    '<g><g><path class="st0" d="M1 10h24"/></g><g><g><path class="st0" d="M17 2l9 8"/></g>'
    '<g><path class="st0" d="M26 10l-9 8"/></g></g></g></svg>'
)


def button(url, label, primary=False):
    style = "btn-inverse" if primary else "btn-default"
    return f'<a class="btn {style}" href="{escape(url, quote=True)}">{escape(label)}</a>'


def edit_slot(style="", link=False):
    name = "rz-edit-wrap" + (f" {style}" if style else "")
    child = '<a></a>' if link else ""
    return f'<div class="{name}" hidden inert aria-hidden="true">{child}</div>'


def down(target="scroll-to"):
    arrow = '<polygon points="12,1 15,1 15,20 22,13 24,15 13.5,26 3,15 5,13 12,20"/>'
    return (
        '<div id="down-arrow"><a class="up" aria-label="Return to page heading" href="#main" hidden>'
        f'<svg aria-hidden="true" viewBox="0 0 28 28"><title>Return to top</title>{arrow}</svg></a>'
        f'<a class="down" aria-label="Continue to page content" href="#{target}"><svg aria-hidden="true" viewBox="0 0 28 28">{arrow}</svg></a></div>'
    )



def pixel(url, title, label):
    return (
        f'<div class="pixel-btn"><div class="cover"></div><a href="{escape(url, quote=True)}">'
        f'<p class="lead">{escape(title)}</p><p class="small">{escape(label)}</p>{RIGHT_ARROW}</a></div>'
    )


def title_hero(identifier, title, subtitle="", *, target="scroll-to", project=False, category="", service=False):
    column = "col-sm-8" if project or identifier == "blog-hero" and subtitle else "col-sm-10 col-sm-offset-1"
    if identifier == "projects-hero":
        column = "col-sm-10 col-md-offset-1"
    if service:
        # The source stores an empty H1 before its displayed H1. Keep one accessible title.
        headings = f'<span class="legacy-title-slot" hidden></span><h1>{title}</h1>'
    elif project:
        headings = f'<h1 class="h1 no-margin display-text">{title}</h1><span class="h1 text-muted text-light display-text">{subtitle}</span>'
    elif subtitle:
        headings = f'<span class="h1 no-margin display-text">{title}</span><h1 class="text-muted text-light display-text">{subtitle}</h1>'
    else:
        headings = (f'<div class="small blog-date"><b class="text-muted">{category}</b></div>' if category else "") + f'<h1>{title}</h1>'
    if project or identifier == "blog-hero" and subtitle:
        headings = edit_slot("center-btns") + headings
    elif identifier == "blog-hero" and not service:
        headings += '<p class="blog-author">Ridgefolio LLC</p>'
    style = "padding-tb-250" + (" bg-muted" if identifier == "projects-hero" else "")
    return (
        f'<section id="{identifier}" class="{style}"><div class="container"><div class="row"><div class="{column} caption-wrap v-align">'
        f'<div class="caption-inner">{headings}{down(target)}</div></div></div></div></section>'
    )


def image_banner(src, alt, url, title, action, extra="", *, editable=False):
    edit = edit_slot("banner-btn") if editable else ""
    return (
        f'<div id="blog-lg-img" class="relative" data-presentation="{extra}">{edit}<div class="cover"></div>'
        f'<img class="full-img" src="{escape(src, quote=True)}" alt="{escape(alt, quote=True)}">'
        f'{pixel(url, title, action)}</div>'
    )


def article_body(content):
    return (
        '<section id="scroll-to" class="padding-tb-150"><div class="container"><div class="row">'
        f'<div class="col-md-10 col-md-offset-1"><article class="blog-post">{edit_slot("center-btns")}{content}</article></div></div></div></section>'
    )


def shell(content, family):
    return f'<div class="rv-source {family}">{content}</div>'


def catalogue(demos=False):
    title, subtitle = ("Interactive", "demonstrations") if demos else ("Engineering", "services")
    description = (
        "Use fictional records to explore service discovery, application review and reporting. Each example runs in your browser."
        if demos else "Choose the part of the service that needs work. Each scope includes an example you can try and a way to test delivery."
    )
    first_label = "Explore the demos" if demos else "Explore services"
    lead = (
        '<section id="apps" class="apps-hero"><div class="container"><div class="row">'
        f'<div class="col-md-4 v-align">{edit_slot("center-btns")}<h1 class="h1">{title}<br><span class="text-muted">{subtitle}</span></h1>'
        f'<p class="lead"><span>{description}</span></p><p>{button("#scroll-to", first_label, True)} {button("/work/", "Selected work")}</p>{down()}</div>'
        '<div class="col-md-7 col-md-offset-1 rotating-apps equal padding-tb-150" aria-hidden="true">'
        '<div class="rotaing"><div class="one"></div><div class="two"></div><div class="three"></div></div></div></div></div></section>'
    )
    headline = (
        'Three public-service tasks.<br><span class="text-muted">Try each one in your browser.</span>'
        if demos else 'Websites, workflows and data.<br><span class="text-muted">Choose a service.</span>'
    )
    intro = (
        '<section id="scroll-to" class="padding-tb-150"><div class="container" id="catalogue"><div class="row">'
        f'<div class="col-md-10 col-md-offset-1">{edit_slot("title-edit-btn")}<h2 class="h1 text-center">{headline}</h2></div></div></div></section>'
    )
    demo_info = {slug: (name, desc) for slug, name, desc, _ in DEMOS}
    bands = []
    for index, service in enumerate(SERVICES):
        slug = service["demo"]
        demo_name, demo_desc = demo_info[slug]
        service_url = f'/services/{service["slug"]}/'
        demo_url = f'/demos/{slug}/'
        name = demo_name if demos else service["short"]
        detail = service["label"] if demos else service["title"]
        desc = demo_desc if demos else service["intro"]
        side = "right" if index % 2 else "left"
        column = "col-md-4" + (" col-md-offset-8" if side == "left" else "")
        tile = pixel(demo_url if demos else service_url, demo_name if demos else service["short"], "Open demo" if demos else "View scope")
        secondary_url, secondary_label = (service_url, "View service scope") if demos else (demo_url, f"Try {demo_name.lower()}")
        secondary = f'<a href="{secondary_url}">{escape(secondary_label)}</a>'
        bands.append(
            f'<section id="{slug}-app" class="app-row relative">{tile}<div class="container"><div class="row">'
            f'<div class="{column} padding-tb-150"><h3 class="h2">{escape(name)}<br><span class="text-muted">{escape(detail)}</span></h3>'
            f'<p class="lead"><span>{escape(desc)}</span> {secondary}</p></div></div></div>'
            f'<div class="app-img-{side}" style="--interface-preview:url(/assets/previews/{slug}.jpg)" role="img" aria-label="{escape(demo_name)} interface"><div class="cover"></div></div></section>'
        )
    return shell(lead + intro + "".join(bands), "apps-page")


def work_index():
    project_images = {
        "industrial-parks": "/assets/editorial/industrial-parks.webp",
        "open-source": "/assets/interior-release-cover.webp",
        "evaluation": "/assets/editorial/paper-detail.webp",
    }
    cards = []
    for slug, *_ in CASES:
        cards.append(
            '<div class="col-md-5 col-md-offset-1 project"><div class="item text-center"><div class="simple-project">'
            f'<a href="/work/{slug}/"><div class="img-wrap"><div class="project-image" data-project="{slug}" style="--project-cover:url({project_images[slug]})"></div></div>'
            f'<p class="h3">{ed.WORK_TITLES[slug]}<small>{ed.WORK_CAPTIONS[slug]}</small></p></a></div></div></div>'
        )
    return shell(
        title_hero("projects-hero", "Selected work", "Founder projects", target="top-projects")
        + '<section id="top-projects"><div class="container" id="catalogue"><div class="row">' + edit_slot("center-btns col-md-offset-1 col-md-12") + '</div><div class="row project-feed">'
        + "".join(cards) + '</div><div class="pagination" hidden><a class="pagination__next"></a></div>'
        + '<div class="scroller-status" hidden><div class="infinite-scroll-request loader-ellips"></div>'
        + '<p class="infinite-scroll-last">All projects are displayed.</p><p class="infinite-scroll-error"></p></div></div></section>' , "projects-page",
    )


def resource_index():
    entries = [
        ("/resources/capabilities/", "Capability statement", RESOURCES[0][2], ed.PDF, "Download the one-page PDF"),
        ("/resources/project-brief/", "Build a project brief", RESOURCES[2][2], ed.EXAMPLE, "Download a completed example"),
        ("/resources/launch-checklist/", "Review launch readiness", RESOURCES[1][2], None, None),
    ]
    items = []
    for url, label, description, download, action in entries:
        extra = f'<b class="text-muted"><a href="{download}">{action}</a></b>' if download else '<b class="text-muted">Printable worksheet</b>'
        image = {"capabilities": "capability", "project-brief": "brief", "launch-checklist": "checklist"}[url.strip("/").split("/")[-1]]
        items.append(
            '<article class="blog-list-article">' + edit_slot("blog-btns", True) + '<div class="row"><div class="col-xs-12">'
            f'<a href="{url}"><h2>{label}</h2></a><p class="lead"><span>{description}</span></p></div></div>'
            f'<div class="row"><div class="col-md-6">{button(url, "Open guide")}</div><div class="col-xs-6 text-right"><p class="small">{extra}</p></div>'
            f'<div class="col-md-12"><a href="{url}"><img class="full-img" loading="lazy" src="/assets/showcase/{image}.webp" alt="{label} excerpt"></a></div></div></article>'
        )
    return shell(
        title_hero("blog-hero", "Buyer resources", "Planning guides")
        + image_banner("/assets/showcase/capability.webp", "Ridgefolio capability statement", ed.PDF, "Capability statement", "Open PDF", "document-banner", editable=True)
        + '<section id="scroll-to" class="padding-tb-150"><div class="container"><div class="row"><div class="col-md-10 col-md-offset-1">' + edit_slot("center-btns")
        + "".join(items) + "</div></div></div></section>", "blog-page",
    )


def contact():
    email = navigation.EMAIL
    return shell(
        '<section id="contact-hero" class="padding-tb-150"><div class="container"><div class="row">'
        '<div class="col-md-5 caption-wrap"><div class="caption-inner padding-tb-150">' + edit_slot("center-btns") +
        '<span class="h1 no-margin">Contact Ridgefolio</span><h1 class="text-muted text-light">Start a<br>conversation about<br>your next<br>software project.</h1>'
        '<address><strong>Ridgefolio LLC</strong><br>Independent software engineering<br>Public agencies and delivery partners<br><abbr title="Location">Based in</abbr> California<br><abbr title="Delivery">Delivery</abbr> online</address>'
        f'<address><strong>Contact email</strong><br><a href="mailto:{email}"><span>{email}</span></a><br>'
        f'{button(navigation.BOOK, "Book a 30-minute call", True)}</address>'
        '</div></div><div class="col-md-6 col-md-offset-1"><section id="contact" aria-label="Project inquiry">'
        '<form id="contactform" name="contactform" method="dialog">'
        '<div class="form-group"><label for="name">Your name</label><input id="name" class="form-control" type="text" name="name" autocomplete="name" maxlength="120" required></div>'
        '<div class="form-group"><label for="email">Email</label><input id="email" class="form-control" type="email" name="email" autocomplete="email" maxlength="254" required></div>'
        '<div class="form-group"><label for="phone">Phone (optional)</label><input id="phone" class="form-control" type="tel" name="phone" autocomplete="tel" maxlength="50"></div>'
        '<div class="form-group"><label for="website">Project or solicitation link <small>(optional)</small></label><input id="website" class="form-control" type="url" name="website" maxlength="800"></div>'
        '<h4 class="page-header" role="heading" aria-level="2">Your project</h4>'
        '<div class="form-group"><label for="subject">Subject</label><select id="subject" class="form-control" name="subject" required><option value="">Choose a subject</option>'
        '<option>Website or service portal</option><option>Workflow or data project</option><option>Delivery partnership</option><option>Other inquiry</option></select></div>'
        '<div class="form-group"><label for="find">Organization (optional)</label><input id="find" class="form-control" name="organization" type="text" autocomplete="organization" maxlength="180"></div>'
        '<div class="form-group"><label for="comments">Project details</label><textarea id="comments" class="form-control" name="comments" rows="4" maxlength="4000" required placeholder="What should the service do? Which systems and deadlines apply?"></textarea></div>'
        '<fieldset><h5 class="page-header" role="heading" aria-level="3">Preview your email before sending</h5>'
        f'<label for="verify" class="verify"><img src="/assets/favicon.svg" alt="" width="20" height="20"> Recipient</label><input id="verify" class="form-control" type="email" value="{email}" readonly></fieldset>'
        ''
        '<input id="submit" class="submit btn btn-inverse" type="submit" value="Preview email draft" disabled>'
        '<noscript><p>Use the email address or booking link above to contact Ridgefolio.</p></noscript>'
        '</form><mark id="message" class="alert alert-info" aria-live="polite" hidden></mark></section></div></div></div></section>', "contact-page",
    )


def split_intro(body):
    header, content = body.split("</header>", 1)
    title = re.search(r"<h1>(.+?)</h1>", header, re.S).group(1)
    label = re.search(r'<span class="tag">(.+?)</span>', header, re.S)
    lead = re.search(r'</h1>(<p(?:\s[^>]*)?>.*?</p>(?:<noscript>.*?</noscript>)?)', header, re.S)
    return title, label.group(1) if label else "", lead.group(1) if lead else "", content


def strips(content):
    # The input markup comes only from the generator's section() and intro() helpers.
    return re.sub(r'<section class="block [^"]*"><div class="wrap">', '<section class="entry-section"><div>', content).replace('class="wrap quick-actions"', 'class="entry-actions"')


def article(path, body):
    title, category, lead, content = split_intro(body)
    banner = ""
    guide_images = {
        "/pricing/": ("brief", "Sample permit project brief", "Plan the estimate"),
        "/resources/project-brief/": ("brief", "Project brief worksheet", "Build a project brief"),
        "/resources/launch-checklist/": ("checklist", "Launch checklist excerpt", "Open checklist"),
        "/resources/capabilities/": ("capability", "One-page Ridgefolio capability statement", "Read the statement"),
    }
    if path in guide_images:
        slug, alt, action = guide_images[path]
        banner = image_banner(f"/assets/showcase/{slug}.webp", alt, "#scroll-to", action, "Open guide", "document-banner")
    elif path.startswith("/demos/"):
        slug = path.strip("/").split("/")[-1]
        banner = image_banner(f"/assets/previews/{slug}.jpg", f"{title} demonstration interface", "#scroll-to", "Try the demo", "Open workspace", "demo-banner")
    if path.startswith("/services/"):
        s = next(item for item in SERVICES if path == f'/services/{item["slug"]}/')
        url = f'/demos/{s["demo"]}/'
        banner = image_banner(f'/assets/previews/{s["demo"]}.jpg', s["short"] + " demonstration", url, "Working example", "Open demo", "demo-banner", editable=True)
        content = re.sub(r'(<section class="wrap service-feature">)<div>(.*?)</div><a class="demo-preview".*?</a></section>', r'<section class="entry-section"><div>\2</div></section>', content, count=1, flags=re.S)
    return shell(title_hero("blog-hero", title, category=category, service=path.startswith("/services/")) + banner + article_body(lead + strips(content)), "article-page" + ("" if banner else " no-hero-image"))


def about(path, body):
    title, label, lead, content = split_intro(body)
    head = body.partition("</header>")[0]
    actions = re.search(r'<div class="actions">(.*?)</div>', head, re.S).group(1)
    links = re.findall(r'<a href="(.*?)"[^>]*>(.*?)</a>', actions)
    group = "<p>" + " ".join(
        button(url, re.sub(r"<[^>]+>|↗", "", label).strip(), primary=i == 0)
        for i, (url, label) in enumerate(links)
    ) + "</p>"
    artifact = re.search(r'</h1>.*?</div></div>(.*)', head, re.S).group(1)
    slug = path.strip("/").split("/")[-1]
    if slug == "practice":
        cover = '<div class="cover-half about-portrait" role="img" aria-label="Portrait of Rishabh Sinha"></div>'
        lead = lead.replace("</p>", '<br><img class="about-proof" src="/assets/showcase/map-desktop.webp" alt="Map interface from the Indonesian industrial parks project" width="144" height="87"></p>')
    else:
        cover = f'<div class="cover-half about-portrait">{artifact}</div>'
    lead = lead.replace("<p>", '<p class="lead">')
    hero = (
        f'<section id="about-hero" class="about-{slug}">{cover}<div class="container"><div class="row">'
        f'<div class="col-sm-5 caption-wrap v-align"><div class="caption-inner">{edit_slot("center-btns")}<span class="h1 no-margin display-text">{label}</span>'
        f'<h1 class="text-muted text-light display-text">{title}</h1>{lead}{group}{down()}</div></div></div></div>'
        f'</section>'
    )
    first, _, remaining = content.partition("</section>")
    first_title, first_body = first.split("<h2>", 1)[1].split("</h2>", 1)
    first_body = first_body.removesuffix("</div>")
    image = "/assets/editorial/industrial-parks.webp" if slug == "practice" else "/assets/previews/permit-desk.jpg"
    belief = (
        '<section id="scroll-to" class="padding-tb-150 we-believe"><div class="container"><div class="row">'
        f'<div class="col-md-5 col-md-offset-7"><h2 class="h1">{first_title}</h2>{first_body}</div></div></div>'
        f'<div class="we-believe-img"><div class="cover"></div><img src="{image}" alt="" loading="lazy"></div></section>'
    )
    others = ""
    if remaining:
        heading, copy = remaining.split("<h2>", 1)[1].split("</h2>", 1)
        others = '<div id="leaders"><div class="leader bg-muted padding-tb-100"><div class="container"><div class="row"><div class="col-md-5">' + f'<h3 class="h2">{heading}</h3>' + '</div><div class="col-md-5 col-md-offset-2">' + copy.removesuffix("</div></section>") + "</div></div></div></div></div>"
    if not others:
        others = (
            '<div id="leaders">' + edit_slot("leader-new-btn") + '<div class="leader bg-muted padding-tb-100"><div class="container"><div class="row"><div class="col-md-5">'
            + edit_slot("leader-btns", True) + '<h3 class="h2">Website engineering</h3><p>Rishabh built a public dashboard for the University of Maryland’s Center for Global Sustainability.</p>'
            + '<p class="no-margin">' + button("/work/industrial-parks/", "Read the case study", True) + '</p></div><div class="col-md-5 col-md-offset-2">'
            + '<p class="h3">141 industrial parks</p><p class="text-muted no-margin">May 2025 handover dataset</p></div></div></div></div></div>'
        )
    quote = (
        '<section id="inner-quotes" class="bg-muted"><div class="container-fluid"><div class="row">'
        '<div class="quotes-carousel owl-carousel owl-theme"><div class="item">'
        '<blockquote class="h3">Exposure Is Not Commitment</blockquote>'
        f'<p><b>Rishabh Sinha</b> <span class="text-muted">· <a href="{ed.PAPER}">Read the research paper</a></span></p>'
        '</div></div></div></div></section>'
    )
    return shell(hero + belief + others + quote, "about-page")


def project(path, body):
    slug = path.strip("/").split("/")[-1]
    title, label, lead, content = split_intro(body)
    exhibit, remaining = content.split('<section class="block ', 1)
    heading, article_content = remaining.split("<h2>", 1)[1].split("</h2>", 1)
    copy, more = article_content.split('</div></section>', 1)
    if slug == "open-source":
        banner = image_banner("/assets/interior-release-cover.webp", "kvcached release v0.1.6, 3 October 2026", ed.KV + "/releases/tag/v0.1.6", "Release record", "Open release", "demo-banner")
    else:
        banner = image_banner("/assets/editorial/monitor-results.webp", "Figure from the research paper", ed.PAPER, "Research paper", "Read paper", "demo-banner")
    responsive = (
        '<section id="responsive" class="padding-tb-150"><div class="container"><div class="row">'
        f'<div class="col-md-5"><div class="sticky-element">{edit_slot("title-btn")}<h2 class="h1">{heading}</h2>{lead}{copy}</div></div>'
        f'<div class="col-md-6 col-md-offset-1 responsive-shots">{exhibit}</div></div></div></section>'
    )
    topic, explanation = more.split("<h2>", 1)[1].split("</h2>", 1)
    explanation = explanation.removesuffix("</div></section>")
    closing_src, closing_alt = ("/assets/editorial/paper-detail.webp", "First page of the research paper") if slug == "evaluation" else ("/assets/interior-release-record.webp", "kvcached v0.1.6 release and the two merged changes by Rishabh Sinha")
    closing = f'<div id="project-end-image" class="relative"><div class="cover"></div><img class="full-img" src="{closing_src}" alt="{closing_alt}" loading="lazy"></div>'
    return shell(title_hero("project-hero", title, label, target="responsive", project=True) + banner + responsive
                 + '<section id="about-section" class="padding-tb-150"><div class="container"><div class="row"><div class="col-md-5 col-md-offset-1"><div class="feature-block">'
                 + f"<h3>{topic}</h3>{explanation}</div></div></div></div></section>" + closing, "project-page")


def case_study(body):
    title = re.search(r"<h1>(.+?)</h1>", body).group(1)
    intro = body.split("</header>", 1)[0]
    overview = intro.split("</h1>", 1)[1].strip().removesuffix("</div>")
    contents, reading = body.split("</header>", 1)[1].split('<div class="case-reading wrap">', 1)
    chapters = re.findall(r'<div class="case-section" id="([^"]+)"><h2>(.*?)</h2><div>(.*?)</div></div>\s*(?=<div class="case-section"|</div></article>)', reading, re.S)
    if len(chapters) != 3:
        raise ValueError("CGS chapters changed. Review the case study divisions.")
    def divider(title, copy, anchor=""):
        identifier = f' id="{anchor}"' if anchor else ""
        return f'<div class="divider-row"{identifier}><div class="divider"><h2>{title}</h2><div class="divider-content">{copy}</div></div></div>'
    implementation, outcome, records = chapters
    engineering = re.split(r"<h3>(.*?)</h3>", implementation[2])
    if len(engineering) != 7:
        raise ValueError("CGS engineering subsections changed. Review their layout.")

    def paired_dividers(first, second, anchor=""):
        identifier = f' id="{anchor}"' if anchor else ""
        pair = "".join(
            f'<div class="col-md-6"><div class="divider"><h2>{heading}</h2><div class="divider-content">{copy}</div></div></div>'
            for heading, copy in (first, second)
        )
        return f'<div class="divider-row two"{identifier}><div class="row">{pair}</div></div>'

    credits = records[2].partition('<div class="case-links">')
    source_links = re.findall(r'<a href="(.*?)">(.*?)</a>', credits[2])
    proof = []
    if len(source_links) != 3:
        raise ValueError("Expected the three original project records")
    for i, (url, text) in enumerate(source_links):
        copy = credits[0].strip() if i == 0 else (
            "<p>The archived handover distinguishes website engineering from the research team’s data collection.</p>" if i == 1
            else "<p>The public repository preserves the dashboard, transformations and project history.</p>"
        )
        proof.append(f'<div class="feedback">{copy}<span class="feedback-person"><a href="{url}">{text}</a></span></div>')

    approach = paired_dividers((implementation[1], engineering[0]), (engineering[1], engineering[2]), implementation[0])
    maintenance = paired_dividers((engineering[3], engineering[4]), (engineering[5], engineering[6]))
    hero = (
        '<header class="case-header"><div class="container"><h1>Founder case study</h1></div></header>'
        '<div id="slider"><div id="blur"></div><ul class="bxslider"><li></li></ul>'
        '<div class="container left"><div id="caption">University of Maryland</div></div><div class="container right"><div class="row">'
        '<div class="col-md-7 col-md-offset-5 col-sm-12 col-sm-offset-0 col-xs-12 col-xs-offset-0">'
        f'<div id="white-block" class="fillRight">{edit_slot(link=True)}<strong>Center for Global Sustainability</strong><h2>{title}</h2></div></div></div></div></div>'
    )
    return shell(
        hero.replace('<div id="slider">', edit_slot("center-btns") + '<div id="slider">', 1) + '<main class="container">' + edit_slot(link=True) + divider("Overview", overview)
        + contents + approach + maintenance + divider(outcome[1], outcome[2], outcome[0]) + "</main>"
        + '<footer class="case-footer" id="records"><h2 class="text-center">Project records</h2>' + edit_slot("menu-edit-btn")
        + '<div id="feedback-list">' + "".join(proof) + '</div></footer>', "case-page",
    )


def adapt(path, body):
    if path == "/" or body.startswith('<div class="rv-source '):
        return body
    if path == "/services/" or path == "/demos/":
        return catalogue(demos=path == "/demos/")
    if path == "/work/":
        return work_index()
    if path == "/resources/":
        return resource_index()
    if path == "/contact/":
        return contact()
    if path == "/work/industrial-parks/":
        return case_study(body)
    if path.startswith("/work/"):
        return project(path, body)
    if path.startswith("/for/") or path == "/practice/":
        return about(path, body)
    return article(path, body)
