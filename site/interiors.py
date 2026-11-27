"""Render Ridgefolio content in the catalogue, project, case and article page families."""

from html import escape
from pathlib import Path
import re

import editorial as ed
import interior_art as art
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



def pixel(url, title, label, *, banner_link=False):
    link_class = ' class="open-contact-form"' if banner_link else ''
    return (
        f'<div class="pixel-btn"><div class="cover"></div><a{link_class} href="{escape(url, quote=True)}">'
        f'<p class="lead">{escape(title)}</p><p class="small">{escape(label)}</p>{RIGHT_ARROW}</a></div>'
    )


def title_hero(identifier, title, subtitle="", *, target="scroll-to", project=False, category="", service=False):
    column = "col-sm-8" if project or identifier == "blog-hero" and subtitle else "col-sm-10 col-sm-offset-1"
    if identifier == "projects-hero":
        column = "col-sm-10 col-md-offset-1"
    if service:
        # The original title slot remains inert; the visible title owns the skip target.
        headings = f'<h1 hidden inert aria-hidden="true"></h1><h1>{title}</h1>'
    elif project:
        headings = f'<h1 class="h1 no-margin display-text">{title}</h1><span class="h1 text-muted text-light display-text">{subtitle}</span>'
    elif subtitle:
        headings = f'<span class="h1 no-margin display-text">{title}</span><h1 class="text-muted text-light display-text">{subtitle}</h1>'
    else:
        headings = (f'<div class="small blog-date"><b class="text-muted">{category}</b></div>' if category else "") + f'<h1>{title}</h1>'
    if project or identifier == "blog-hero" and subtitle:
        headings = edit_slot("center-btns") + headings
    elif target == "workspace":
        headings += '<p class="demo-launch"><a href="#workspace">Open workspace</a></p>'
    elif identifier == "blog-hero" and not service:
        headings += '<p class="blog-author">Ridgefolio LLC</p>'
    style = "padding-tb-250" + (" bg-muted" if identifier == "projects-hero" else "")
    return (
        f'<section id="{identifier}" class="{style}"><div class="container"><div class="row"><div class="{column} caption-wrap v-align">'
        f'<div class="caption-inner">{headings}{down(target)}</div></div></div></div></section>'
    )


def image_banner(src, alt, url, title, action, extra="", *, editable=False):
    edit = edit_slot("banner-btn") if editable else ""
    responsive = ""
    if src.startswith("/assets/article-evidence/") and src.endswith(".webp") and not src.endswith("/capability-sheet.webp"):
        stem = src.removesuffix(".webp")
        responsive = f' srcset="{stem}-960.webp 960w, {stem}-1920.webp 1920w, {src} 3840w" sizes="100vw" width="3840" height="2560"'
    elif src == "/assets/cgs-atlas/overview-3840.webp":
        candidates = ", ".join(f"/assets/cgs-atlas/overview-{width}.webp {width}w" for width in (960, 1536, 2560, 3840, 4320))
        responsive = f' srcset="{candidates}" sizes="min(2160px, 100vw)" width="3840" height="2560"'
    elif src == "/assets/article-evidence/capability-sheet.webp":
        responsive = ' width="2720" height="3520"'
    elif src == "/assets/editorial/civic-center-3840.webp":
        responsive = ' srcset="/assets/editorial/civic-center-768.webp 768w, /assets/editorial/civic-center-1440.webp 1440w, /assets/editorial/civic-center-1920.webp 1920w, /assets/editorial/civic-center-3200.webp 3200w, /assets/editorial/civic-center-3840.webp 3840w" sizes="100vw" width="3840" height="2560"'
    return (
        f'<div id="blog-lg-img" class="relative" data-presentation="{extra}">{edit}<div class="cover"></div>'
        f'<img class="full-img" src="{escape(src, quote=True)}"{responsive} alt="{escape(alt, quote=True)}">'
        f'{pixel(url, title, action, banner_link=True)}</div>'
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
        "Find a service as a resident, review a permit as a staff member or reconcile a report. All three demos use fictional records and run in your browser."
        if demos else "Explore the work involved in publishing a public website, reviewing an application or reconciling a report. Each service includes a working example."
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
        'Three tasks for delivering public services.<br><span class="text-muted">Try each one in your browser.</span>'
        if demos else 'Public websites, workflows and data.<br><span class="text-muted">Explore three scopes of work.</span>'
    )
    intro = (
        '<section id="scroll-to" class="padding-tb-150"><div class="container" id="catalogue"><div class="row">'
        f'<div class="col-md-10 col-md-offset-1">{edit_slot("title-edit-btn")}<h2 class="h1 text-center">{headline}</h2></div></div></div></section>'
    )
    demo_info = {slug: (name, desc) for slug, name, desc, _ in DEMOS}
    captions = {
        "finder": ("Find a service by keyword and topic.", "Check what to prepare before applying."),
        "permit-desk": ("The approval keeps the full review history.", "A reviewer asks which entrance to use."),
        "service-ledger": ("Six sample records add up to 32 service hours.", "Two records in the South district account for 10 hours."),
    }
    bands = []
    for index, service in enumerate(SERVICES):
        slug = service["demo"]
        demo_name, demo_desc = demo_info[slug]
        service_url = f'/services/{service["slug"]}/'
        demo_url = f'/demos/{slug}/#workspace'
        name = demo_name if demos else service["title"]
        detail = service["label"]
        desc = (demo_desc + " " + service["test"]) if demos else (service["intro"] + " " + service["need"])
        side = "right" if index % 2 else "left"
        column = "col-md-4" + (" col-md-offset-8" if side == "left" else "")
        tile = pixel(demo_url if demos else service_url, demo_name if demos else service["short"], "Open demo" if demos else "View scope")
        secondary_url, secondary_label = (service_url, "View service scope") if demos else (demo_url, f"Try {demo_name.lower()}")
        secondary = f'<a href="{secondary_url}">{escape(secondary_label)}</a>'
        state = "demo" if demos else "scope"
        scope_caption, demo_caption = captions[slug]
        caption = escape(demo_caption if demos else scope_caption, quote=True)
        artwork = f"/assets/directory-evidence/{slug}-{state}"
        if demos:
            scene = (
                f'<div class="app-img-{side}" style="--capture:url({artwork}-wide.webp);--capture-narrow:url({artwork}-narrow.webp)" '
                f'data-caption="{caption}" role="img" aria-label="{escape(demo_name)} demonstration. {caption}"><div class="cover"></div></div>'
            )
        elif slug == "service-ledger":
            map_sizes = ", ".join(f"/assets/cgs-atlas/overview-{width}.webp {width}w" for width in (960, 1536, 2560, 3840))
            scene = f'<div class="app-img-{side} directory-landscape"><img src="/assets/cgs-atlas/overview-3840.webp" srcset="{map_sizes}" sizes="(min-width:992px) max(1400px, 75vw), max(580px, 135vw)" alt="Industrial park locations across Indonesia from the CGS case study" width="3840" height="2560" loading="lazy"></div>'
        else:
            source = "public-terminals" if slug == "finder" else "public-market"
            scene = (
                f'<div class="app-img-{side} directory-landscape">' + art.photo(source, sizes="(min-width:992px) max(1400px, 75vw), max(580px, 135vw)", lazy=True)
                + art.credit(source) + '</div>'
            )
        bands.append(
            f'<section id="{slug}-app" class="app-row relative">{tile}<div class="container"><div class="row">'
            f'<div class="{column} padding-tb-150"><h3 class="h2">{escape(name)}<br><span class="text-muted">{escape(detail)}</span></h3>'
            f'<p class="lead"><span>{escape(desc)}</span> {secondary}</p></div></div></div>'
            + scene + '</section>'
        )
    return shell(lead + intro + "".join(bands), "apps-page")


def work_index():
    project_images = {
        "industrial-parks": "/assets/cgs-atlas/overview-3840.webp",
        "open-source": "/assets/interior-art/review-changes-3840.webp",
        "evaluation": "/assets/project-evidence/monitor-strata.svg",
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
        ("/resources/project-brief/", "Build a project brief",
         "Describe what staff do today, what should change and how you’ll check the result. The completed permit example shows how a correction and approval become acceptance criteria. Download your own brief as plain text.",
         "Build the brief", ed.EXAMPLE, "Download a completed example"),
        ("/resources/launch-checklist/", "Review launch readiness",
         "Work through six checks with the people responsible for a website launch. Mark the resident tasks, redirects and handover steps you’ve verified, then download a copy that shows what’s still open.",
         "Open the checklist", None, None),
        ("/resources/capabilities/", "Capability statement",
         "Get a one-page overview of Ridgefolio’s website, workflow and data services. It names the engineer responsible for delivery and links to his work on the Indonesian industrial parks dashboard.",
         "View capabilities", ed.PDF, "Download the one-page PDF"),
    ]
    items = []
    for url, label, description, guide_action, download, action in entries:
        extra = f'<b class="text-muted"><a href="{download}">{action}</a></b>' if download else '<b class="text-muted">Printable worksheet</b>'
        image, caption = {
            "capabilities": ("capability", "Ridgefolio’s capability statement with its website, workflow and data services"),
            "project-brief": ("project-brief", "Project brief builder filled with the fictional community event permit example"),
            "launch-checklist": ("launch-checklist", "Launch readiness worksheet with three of six checks marked complete"),
        }[url.strip("/").split("/")[-1]]
        items.append(
            '<article class="blog-list-article">' + edit_slot("blog-btns", True) + '<div class="row"><div class="col-xs-12">'
            f'<a href="{url}"><h2>{label}</h2></a><p class="lead"><span>{description}</span></p></div></div>'
            f'<div class="row"><div class="col-md-6">{button(url, guide_action)}</div><div class="col-xs-6 text-right"><p class="small">{extra}</p></div>'
            f'<div class="col-md-12"><a href="{url}"><img class="full-img" loading="lazy" width="3840" height="2560" src="/assets/article-evidence/{image}.webp" '
            f'srcset="/assets/article-evidence/{image}-960.webp 960w, /assets/article-evidence/{image}-1920.webp 1920w, /assets/article-evidence/{image}.webp 3840w" '
            f'sizes="(max-width: 991px) calc(100vw - 80px), min(1090px, 83vw)" alt="{caption}"></a></div></div></article>'
        )
    return shell(
        title_hero("blog-hero", "Buyer resources", "Planning guides")
        + documentary_banner("library-interior", ed.PDF, "Capability statement", "Open PDF", editable=True)
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
        '<option>Website or service portal</option><option>Workflow or data project</option><option data-organization>Delivery partnership</option><option>Other inquiry</option></select></div>'
        '<div class="form-group" hidden><label for="find">Partner organization (optional)</label><input id="find" class="form-control" name="organization" type="text" autocomplete="organization" maxlength="180" disabled></div>'
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


def article_subheading(title):
    return f'<p class="article-subheading" role="heading" aria-level="2"><span><strong>{title}</strong></span></p>'


def article_sections(content):
    """Move the generator’s sections onto the reading grid, keeping live tools intact."""
    sections = re.split(r'<section class="block [^"]*"><div class="wrap"><h2>(.*?)</h2>', content, flags=re.S)
    result = [sections[0].replace('class="wrap quick-actions"', 'class="entry-actions"')]
    for title, fragment in zip(sections[1::2], sections[2::2], strict=True):
        body, closing, after = fragment.rpartition('</div></section>')
        if not closing:
            raise ValueError(f'Incomplete generated article section {title!r}')
        result.extend((article_subheading(title), body, after))
    # In the source article, related destinations are simple lists and definition-like
    # passages open with a bold inline label. Keep native controls and tables in place.
    def links(match):
        items = re.findall(r'(<a[^>]+>.*?</a>)', match.group(1), flags=re.S)
        return '<ul class="article-links">' + ''.join(f'<li><span>{item}</span></li>' for item in items) + '</ul>'

    def definitions(match):
        pairs = re.findall(r'<div><dt>(.*?)</dt><dd>(.*?)</dd></div>', match.group(1), flags=re.S)
        return ''.join(f'<p><span><strong>{term}.</strong> {description}</span></p>' for term, description in pairs)

    text = re.sub(r'<div class="actions">(.*?)</div>', links, ''.join(result), flags=re.S)
    return re.sub(r'<dl class="rows">(.*?)</dl>', definitions, text, flags=re.S)


SERVICE_NOTES = {
    "websites": (
        "A permit applicant needs the service name, eligibility requirements and documents to bring. A staff editor needs one place to keep those details current.",
        "Search by permit, roads, parks or records. Open a result to see the information a resident should prepare.",
        "Before moving pages, list the terms residents use when they telephone the department. Those terms belong in the new search index.",
        "Choose a published page that changes frequently. Ask the person who maintains it to show how a correction reaches the public site.",
        "Keep links to the current application and its supporting documents with the service instructions.",
        ("Repeat the search with the words someone would use at the counter.", "Check a saved address from the former site and confirm that it opens the corresponding service.", "Have a second editor find and correct the same instruction using the handover notes."),
    ),
    "workflows": (
        "Begin with an application that staff returned for correction. Its history reveals which questions caused trouble and who could resolve them.",
        "In the demonstration, a reviewer can return a sample application with a note. The applicant can amend it and submit it again.",
        "Identify the role allowed to make each decision. A reviewer needs to know who owns an incomplete record.",
        "Keep the correction request with the application so the next reviewer can see how it was addressed.",
        "Choose one accepted application as an example of what the receipt and the staff record should contain.",
        ("Try leaving a required field blank and check that the form identifies what to supply.", "Follow the change from correction request to resubmission in the application history.", "Compare the identifier on a sample receipt with the corresponding staff record."),
    ),
    "data": (
        "Choose one number that staff already report. Trace it to the records, filters and calculation behind it.",
        "Select a district to compare its service records and hours. The CSV download follows the active district filter.",
        "Record how to treat a missing value, a correction and a row that was already present in the last refresh.",
        "Keep a small sample with known totals. A maintainer can run it again after a source field or reporting rule changes.",
        "For a map, preserve an identifier that lets a reviewer go from a point on the screen to the underlying record.",
        ("Note when the source was last refreshed and which reporting period it covers.", "Include sample duplicates and missing values when checking the import.", "Open the export and reproduce the total using only its rows."),
    ),
}


def service_article(service):
    context, example, first, second, third, checks = SERVICE_NOTES[service["slug"]]
    demo_url = f'/demos/{service["demo"]}/'
    demo_name = next(title for slug, title, *_ in DEMOS if slug == service["demo"])
    parts = [
        f'<p><span><strong>{escape(service["intro"])}</strong></span></p>',
        f'<p>{escape(service["need"])}</p><p>{escape(context)}</p>',
        f'<p>Try the <a href="{demo_url}">{escape(demo_name.lower())} demonstration</a>. {escape(example)}</p>',
        *(f'<p>{escape(paragraph)}</p>' for paragraph in (first, second, third)),
    ]
    for index, ((name, description), check) in enumerate(zip(service["items"], checks, strict=True), 1):
        parts.append(f'<h1 role="heading" aria-level="2">{index}. {escape(name)}</h1><p>{escape(description)}</p><p>{escape(check)}</p>')
    guide = f'/resources/{service["guide"]}/'
    parts.extend((
        '<h1 role="heading" aria-level="2">4. Scope and acceptance</h1>',
        f'<p>{escape(service["test"])}</p><p>{escape(service["scope"])}<br><br></p>',
        f'<div class="article-related"><a href="{guide}">Open the planning guide</a> · <a href="/pricing/">Scope and pricing</a></div>',
    ))
    return "".join(parts)


def article_figure(path):
    if path == "/resources/capabilities/":
        return (
            '<figure class="article-document"><img src="/assets/article-evidence/capability-sheet.webp" '
            'width="2720" height="3520" loading="lazy" alt="The one-page Ridgefolio capability statement, including services, delivery process and company contact information.">'
            f'<figcaption><a href="{ed.PDF}">Read the capability statement as a PDF</a></figcaption></figure>'
        )
    if path == "/demos/permit-desk/":
        receipt = Path(__file__).resolve().parents[1] / "public" / ed.RECEIPT.lstrip("/")
        return (
            article_subheading("Example of an approved receipt")
            + '<p>The receipt keeps the corrected location and the reviewer’s original note with the same application number.</p>'
            + f'<pre class="article-transcript">{escape(receipt.read_text().strip())}</pre>'
            + f'<p><a href="{ed.RECEIPT}">Download the completed sample receipt</a></p>'
        )
    if path in ("/demos/finder/", "/demos/service-ledger/", "/resources/launch-checklist/"):
        notes = {
            "/demos/finder/": (
                "Follow the permit application",
                'Search for “permit” and expand the Community event permit entry. The entry lists what to prepare and links directly to the application. Use the <a href="/demos/permit-desk/#workspace">permit desk</a> to follow the same task through staff review.',
            ),
            "/demos/service-ledger/": (
                "Reconcile a filtered export",
                'Choose <strong>North</strong>. Records RF-202 and RF-206 show nine and three service hours. Download the filtered CSV and add the Hours column. It should total 12, the number displayed above the chart.',
            ),
            "/resources/launch-checklist/": (
                "Keep the review record",
                'Mark a check after someone has completed the task. Choose <strong>Download checklist</strong> to keep the marked and outstanding items together. Closing the browser tab ends this worksheet session.',
            ),
        }
        heading, note = notes[path]
        return article_subheading(heading) + f'<p>{note}</p>'
    if path not in ("/pricing/", "/resources/project-brief/"):
        return ""
    example = Path(__file__).resolve().parents[1] / "public" / ed.EXAMPLE.lstrip("/")
    sections = dict(part.split("\n", 1) for part in example.read_text().split("\n\n") if "\n" in part)
    if path == "/pricing/":
        title = "What the buyer receives at handover"
        extract = f'<p>{escape(sections["Handover"])}</p>'
    else:
        title = "An acceptance test from the permit desk brief"
        steps = sections["Acceptance walkthrough"].splitlines()
        extract = '<ol class="article-steps">' + "".join(f'<li>{escape(step.partition(". ")[2])}</li>' for step in steps) + "</ol>"
    return (
        article_subheading(title) + extract
        + '<figure class="article-illustration"><img src="/assets/article-evidence/permit-approval.webp" '
        'srcset="/assets/article-evidence/permit-approval-720.webp 720w, /assets/article-evidence/permit-approval-1440.webp 1440w, /assets/article-evidence/permit-approval.webp 2560w" '
        'sizes="(min-width:1400px) 1110px, (min-width:992px) 80vw, calc(100vw - 60px)" width="2560" height="1141" loading="lazy" '
        'alt="Approved permit RF-101 for Neighborhood art fair at Harbor Square, east entrance. The case file preserves the request for correction and the resubmission.">'
        f'<figcaption>The permit desk after approval. <a href="{ed.RECEIPT}">Read the exported receipt</a>.</figcaption></figure>'
        f'<p><a href="{ed.EXAMPLE}">Read the complete sample project brief</a></p>'
    )


def documentary_banner(stem, url, title, action, *, record="", editable=False):
    edit = edit_slot("banner-btn") if editable else ""
    style = "documentary-pair" if record else "documentary"
    output = art.record(record) if record else ""
    return (
        f'<div id="blog-lg-img" class="relative" data-presentation="{style}" data-plate="{stem}">'
        + edit + art.photo(stem, sizes="(max-width:799px) 132vw, 100vw" if record else "100vw")
        + output + art.credit(stem) + pixel(url, title, action, banner_link=True) + '</div>'
    )


def utility_page(title, category, lead, content):
    heading = (
        '<section id="blog-hero" class="utility-heading"><div class="container"><div class="row">'
        '<div class="col-sm-10 col-sm-offset-1 caption-wrap"><div class="caption-inner">'
        f'<p class="small blog-date">{category}</p><h1>{title}</h1></div></div></div></div></section>'
    )
    return shell(heading + article_body(lead + article_sections(content)), "article-page")


def article(path, body):
    title, category, lead, content = split_intro(body)
    if path in ("/search/", "/404.html"):
        return utility_page(title, category, lead, content)
    if path.startswith("/services/"):
        service = next(item for item in SERVICES if path == f'/services/{item["slug"]}/')
        demo_url = f'/demos/{service["demo"]}/'
        if service["slug"] == "data":
            banner = image_banner("/assets/cgs-atlas/overview-3840.webp", "The 141 records in the industrial parks dataset, clustered across the Indonesian archipelago", demo_url, "Working example", "Open demo", "atlas-plate", editable=True)
        else:
            stem = "public-terminals" if service["slug"] == "websites" else "public-market"
            banner = documentary_banner(stem, demo_url, "Working example", "Open demo", editable=True)
        return shell(title_hero("blog-hero", title, service=True) + banner + article_body(service_article(service)), "article-page")
    if path == "/pricing/":
        banner = documentary_banner("railway-plan", "#scroll-to", "Plan the estimate", "Open guide")
    elif path == "/resources/project-brief/":
        banner = documentary_banner("library-elevation", "#scroll-to", "Build a project brief", "Open guide", record="brief")
    elif path == "/resources/launch-checklist/":
        banner = documentary_banner("reading-by-touch", "#scroll-to", "Open checklist", "Open guide", record="checklist")
    elif path == "/resources/capabilities/":
        banner = image_banner("/assets/article-evidence/capability-sheet.webp", "Ridgefolio’s complete one-page capability statement", ed.PDF, "Capability statement", "Open PDF", "portrait-document")
    elif path == "/demos/service-ledger/":
        banner = documentary_banner("service-areas", "#workspace", "Try the demo", "Open workspace", record="ledger")
    elif path == "/demos/finder/":
        banner = (
            '<div id="blog-lg-img" class="relative" data-presentation="finder-demonstration">'
            + art.photo("kiosk", sizes="(max-width:480px) 140vw, 100vw") + '<figure class="search-record"><figcaption>Service finder · Sample result</figcaption>'
            '<p class="record-name">Community event permit requirements</p><p>For a gathering in a park or public square. '
            'Prepare the event name, location, date and expected attendance.</p></figure>' + art.credit("kiosk")
            + pixel("#workspace", "Try the demo", "Open workspace", banner_link=True) + '</div>'
        )
    else:
        banner = (
            '<div id="blog-lg-img" class="relative" data-presentation="permit-demonstration">'
            '<figure class="permit-result"><figcaption>Community event permit · Fictional example</figcaption>'
            '<p class="record-name">RF-101</p><p>Neighborhood art fair<br>Harbor Square, east entrance</p>'
            f'<a href="{ed.RECEIPT}">Read the approved receipt</a></figure>'
            '<div class="permit-interface"><img src="/assets/article-evidence/permit-desk.webp" '
            'srcset="/assets/article-evidence/permit-desk-960.webp 960w, /assets/article-evidence/permit-desk-1920.webp 1920w, /assets/article-evidence/permit-desk.webp 3840w" '
            'sizes="(min-width:800px) 54vw, 100vw" width="3840" height="2560" alt="Actual permit desk showing staff review and the case history after resubmission."></div>'
            + pixel("#workspace", "Try the demo", "Open workspace", banner_link=True) + '</div>'
        )
    figure = article_figure(path)
    if path == "/demos/permit-desk/":
        content = re.sub(r'<p class="wrap receipt-download">.*?</p>', figure, content, count=1)
        figure = ""
    target = "workspace" if path.startswith("/demos/") else "scroll-to"
    return shell(title_hero("blog-hero", title, category=category, target=target) + banner + article_body(lead + article_sections(content) + figure), "article-page")


def about(path, body):
    title, label, lead, content = split_intro(body)
    slug = path.strip("/").split("/")[-1]
    head = body.partition("</header>")[0]
    actions = re.search(r'<div class="actions">(.*?)</div>', head, re.S).group(1)
    links = re.findall(r'<a href="(.*?)"[^>]*>(.*?)</a>', actions)
    primary = " ".join(
        button(url, re.sub(r"<[^>]+>|↗", "", text).strip(), primary=i == 0)
        for i, (url, text) in enumerate(links)
    )
    artifact = re.search(r'</h1>.*?</div></div>(.*)', head, re.S).group(1)
    plates = {
        "practice": ("/assets/cgs-atlas/overview-3840.webp", "/assets/project-evidence/regional-status.svg",
                     "Regional distribution and operating status in the 141-record industrial parks handover", "Indonesia’s industrial parks by region and status · May 2025 handover",
                     "/work/industrial-parks/"),
        "agencies": ("/assets/article-evidence/permit-desk.webp", "/assets/editorial/civic-center-3200.webp",
                     "The Civic Center in San Francisco", "San Francisco Civic Center · Carol M. Highsmith, Library of Congress",
                     "https://www.loc.gov/item/2013630463/"),
        "partners": ("/assets/article-evidence/project-brief.webp", "/assets/interior-art/review-changes-3840.webp",
                     "Reviewed changes to the kvcached command-line tool on GitHub", "Worker socket cleanup · kvcached pull request 480",
                     ed.KV + "/pull/480/files"),
    }
    belief_image, illustration, alt, caption_text, caption_url = plates[slug]
    sizes = {
        "practice": "/assets/project-evidence/regional-status.svg",
        "agencies": "/assets/editorial/civic-center-768.webp 768w, /assets/editorial/civic-center-1440.webp 1440w, /assets/editorial/civic-center-1920.webp 1920w, /assets/editorial/civic-center-3200.webp 3200w, /assets/editorial/civic-center-3840.webp 3840w, /assets/interior-art/civic-center-5184.webp 5184w",
        "partners": ", ".join(f"/assets/interior-art/review-changes-{width}.webp {width}w" for width in (960, 1536, 2560, 3840, 4096, 5280)),
    }
    plate_width = "107vw" if slug == "partners" else "100vw"
    if slug != "practice":
        label = "Working together"
    if slug == "practice":
        cover = '<div class="cover-half about-portrait" role="img" aria-label="Portrait of Rishabh Sinha"></div>'
    elif slug == "agencies":
        cover = (
            '<div class="cover-half about-portrait agency-portrait">'
            + art.photo("innovation-center", sizes="(min-width:992px) max(1400px, 80vw), max(630px, 145vw)")
            + art.credit("innovation-center") + '</div>'
        )
        lead += f'<p class="agency-example"><a href="{ed.RECEIPT}">Read a sample permit receipt</a></p>'
    else:
        artifact = artifact.replace("/assets/editorial/capability-page.webp", "/assets/article-evidence/capability-sheet.webp")
        cover = f'<div class="cover-half about-portrait">{artifact}</div>'
    lead = lead.replace("<p>", '<p class="lead">', 1)
    hero = (
        f'<section id="about-hero" class="about-{slug}">{cover}<div class="container"><div class="row">'
        f'<div class="col-sm-5 caption-wrap v-align"><div class="caption-inner">{edit_slot("center-btns")}<span class="h1 no-margin display-text">{label}</span>'
        f'<h1 class="text-muted text-light display-text">{title}</h1>{lead}<p>{primary}</p>{down()}</div></div></div></div></section>'
    )
    first, _, remaining = content.partition("</section>")
    first_title, first_body = first.split("<h2>", 1)[1].split("</h2>", 1)
    steps = re.findall(r'<div><dt>(.*?)</dt><dd>(.*?)</dd></div>', first_body, re.S)
    if not steps:
        raise ValueError("Missing planning steps on " + path)
    copy = "".join(f'<p class="no-margin"><strong>{item}</strong></p><p>{detail}</p>' for item, detail in steps)
    belief = (
        '<section id="scroll-to" class="padding-tb-150 we-believe"><div class="container"><div class="row">'
        f'<div class="col-md-5 col-md-offset-7">{edit_slot("believe-btn")}<h2 class="h1">{first_title}</h2>{copy}</div></div></div>'
        f'<div class="we-believe-img" style="--belief-image:url({belief_image})"><div class="cover"></div></div></section>'
    )
    if remaining:
        heading, contents = remaining.split("<h2>", 1)[1].split("</h2>", 1)
        description = contents.split('<div class="actions">', 1)[0]
        link_pairs = re.findall(r'<a href="(.*?)"[^>]*>(.*?)</a>', contents)
        actions = " ".join(button(url, re.sub(r"<[^>]+>|↗", "", text).strip(), i == 0) for i, (url, text) in enumerate(link_pairs))
        fact, caption = (
            ("RF-101", "Sample community event permit · fictional record")
            if slug == "agencies" else ("One workflow, one acceptance test.", "Permit review project brief · worked example")
        )
    else:
        heading = "Website engineering"
        description = "<p>Rishabh built a public dashboard for the University of Maryland’s Center for Global Sustainability.</p>"
        actions = button("/work/industrial-parks/", "Read case study", True)
        fact, caption = "141 industrial parks", "May 2025 handover dataset"
    leaders = (
        '<div id="leaders">' + edit_slot("leader-new-btn") + '<div class="leader bg-muted padding-tb-100"><div class="container"><div class="row"><div class="col-md-5">'
        + edit_slot("leader-btns", True) + f'<h3 class="h2">{heading}</h3>{description}<p class="no-margin">{actions}</p></div>'
        + f'<div class="col-md-5 col-md-offset-2"><p class="h3">{fact}</p><p class="text-muted no-margin">{caption}</p></div></div></div></div></div>'
    )
    plate = (
        '<div class="relative" data-about-plate>' + edit_slot("banner-btn") + '<div class="cover"></div>'
        + f'<img class="full-img" src="{illustration}" srcset="{sizes[slug]}" sizes="{plate_width}" alt="{alt}" loading="lazy">'
        + f'<a class="plate-credit" href="{caption_url}">{caption_text} <span aria-hidden="true">↗</span></a>'
        + '</div>'
    )
    records = (
        ("Exposure Is Not Commitment", "Rishabh Sinha", ed.PAPER, "Read the research paper"),
        ("Mapping Indonesia’s industrial parks", "Center for Global Sustainability", "/work/industrial-parks/", "Read the case study"),
        ("kvcached v0.1.6", "Open-source release", "/work/open-source/", "Inspect the contributions"),
    )
    records_html = "".join(
        f'<div class="item" id="project-record-{i}"><blockquote class="h3">{name}</blockquote><p><b>{credit}</b> <span class="text-muted">· <a href="{url}">{action}</a></span></p></div>'
        for i, (name, credit, url, action) in enumerate(records, 1)
    )
    record_nav = '<nav class="project-record-nav" aria-label="Jump to a project record">' + "".join(
        f'<a href="#project-record-{i}" aria-label="Show {name}">{i}</a>' for i, (name, *_) in enumerate(records, 1)
    ) + '</nav>'
    proof = (
        '<section id="inner-quotes" class="bg-muted"><div class="container-fluid"><div class="row">'
        f'<div class="quotes-carousel owl-carousel owl-theme" tabindex="0" role="region" aria-label="Project records">{records_html}</div>{record_nav}</div></div></section>'
    )
    return shell(hero + belief + leaders + plate + proof, "about-page")


def project(path, body):
    slug = path.strip("/").split("/")[-1]
    full_title, _, summary, content = split_intro(body)
    exhibit, sections = content.split('<section class="block ', 1)
    finding, content = sections.split("<h2>", 1)[1].split("</h2>", 1)
    explanation, context = content.split("</div></section>", 1)
    detail = re.findall(r"<p(?: [^>]*)?>(.*?)</p>", explanation, re.S)
    source_url, source_text = re.search(r'<a href="(.*?)"[^>]*>(.*?)</a>', explanation, re.S).groups()
    source_text = re.sub(r"<[^>]+>|↗", "", source_text).strip()
    topic, relevance = context.split("<h2>", 1)[1].split("</h2>", 1)
    relevance = relevance.removesuffix("</div></section>")
    if slug == "open-source":
        title, collection = "kvcached", "Release v0.1.6"
        hero_src, hero_alt = "/assets/project-evidence/release-note.webp", "Published notes for kvcached v0.1.6 credit the release contributors"
        hero_link, action = ed.KV + "/releases/tag/v0.1.6", "Open release"
        shot_src, shot_alt = "/assets/project-evidence/worker-review.webp", "Published review for the cleanup of tensor-parallel worker sockets, with summary and validation"
        shot_width, shot_height = 3402, 3180
        inset_width, inset_height = 3024, 303
        shot_link = ed.KV + "/pull/480"
        inset_src, inset_alt = "/assets/project-evidence/worker-merged.webp", "GitHub records pull request 480 as merged"
        closing_src, closing_alt = "/assets/project-evidence/engine-review.webp", "Pull request 482 documents the EngineCore shared-memory change"
        closing_link, closing_label = ed.KV + "/pull/482", "Read the shared-memory review"
        closing_width, closing_height = 4000, 2287
    else:
        title, collection = "AI monitor evaluation", "Research paper"
        hero_src, hero_alt = "/assets/project-evidence/monitor-strata.svg", "Figure 1 comparing monitor scores across models"
        hero_link, action = ed.PAPER, "Read paper"
        shot_src, shot_alt = "/assets/project-evidence/paper-page.webp", "First page of Exposure Is Not Commitment, including the full abstract"
        shot_width, shot_height = 2295, 2970
        inset_width, inset_height = 407, 169
        shot_link = ed.PAPER
        inset_src, inset_alt = hero_src, hero_alt
        closing_src, closing_alt = "/assets/project-evidence/monitor-confidence.svg", "Figure 2 compares pre-action commitment with 95 percent bootstrap intervals"
        closing_link, closing_label = "https://arxiv.org/pdf/2610.37679#page=8", "Read Figure 2 on page eight"
        closing_width, closing_height = 353, 196
        exhibit = exhibit.replace("/assets/editorial/monitor-results.webp", hero_src).replace(
            "</figcaption>", ' Figures by Rishabh Sinha, <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.</figcaption>'
        )
    banner = image_banner(hero_src, hero_alt, hero_link, title, action, "evidence-plate " + slug)
    closing_sources = ""
    if slug == "open-source":
        def review_sources(name):
            folder = "/assets/project-evidence/"
            return (f' srcset="{folder}{name}-960.webp 960w, {folder}{name}-1920.webp 1920w, {folder}{name}.webp 4000w"'
                    ' sizes="100vw"')
        banner = banner.replace(f'src="{hero_src}"', f'src="{hero_src}"{review_sources("release-note")}')
        closing_sources = review_sources("engine-review")

    responsive = (
        '<section id="responsive" class="padding-tb-150"><div class="container"><div class="row">'
        f'<div class="col-md-5"><div class="sticky-element">{edit_slot("title-btn")}<h2 class="h1">{full_title}</h2>'
        + summary.replace("<p>", '<p class="lead">') + '<p>' + button(source_url, source_text, True) + '</p></div></div>'
        + f'<div class="col-md-6 col-md-offset-1 responsive-shots"><a href="{shot_link}" class="project-shot-link"><img class="shot1" src="{shot_src}" alt="{shot_alt}" width="{shot_width}" height="{shot_height}" loading="lazy"></a>'
        + f'<img class="shot2 sticky-element" src="{inset_src}" alt="{inset_alt}" width="{inset_width}" height="{inset_height}" loading="lazy"></div></div></div></section>'
    )
    reasoning = "".join(f"<p>{part}</p>" for part in detail)
    features = (
        '<section id="about-section" class="padding-tb-150"><div class="container"><div class="row">'
        f'<div class="col-md-5 col-md-offset-1"><div class="feature-block"><h3>{finding}</h3>{reasoning}</div>'
        + f'<div class="feature-block"><h3>{topic}</h3>{relevance}</div></div>'
        + f'<div class="col-md-5 col-md-offset-1"><div class="feature-block">{exhibit}</div></div></div></div></section>'
    )
    closing = (
        f'<div id="project-end-image" class="relative"><div class="cover"></div><img class="full-img" src="{closing_src}"{closing_sources} alt="{closing_alt}" width="{closing_width}" height="{closing_height}" loading="lazy">'
        f'<a class="plate-credit" href="{closing_link}">{closing_label} <span aria-hidden="true">↗</span></a></div>'
    )
    return shell(title_hero("project-hero", title, collection, target="responsive", project=True) + banner + responsive + features + closing, "project-page")


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

    from cgs import region_figure
    overview += ('<p class="map-photograph-credit">Photograph of Indonesia Morowali Industrial Park in Central Sulawesi, July 2023. '
                 '<a href="https://commons.wikimedia.org/wiki/File:Morowali_Industrial_Park.jpg">Ministry of Public Works of Indonesia</a>.</p>')
    regional_chart = region_figure()
    approach = paired_dividers((implementation[1], engineering[0] + regional_chart), (engineering[1], engineering[2]), implementation[0])
    maintenance = paired_dividers((engineering[3], engineering[4]), (engineering[5], engineering[6]))
    hero = (
        '<header class="case-header"><div class="container"><span>Founder case study</span><span>University of Maryland</span></div></header>'
        '<div id="slider"><div id="blur"></div><ul class="bxslider"><li><img class="cgs-hero-photo" src="/assets/cgs-atlas/morowali-1920.webp" '
        'srcset="/assets/cgs-atlas/morowali-960.webp 960w, /assets/cgs-atlas/morowali-1920.webp 1920w, /assets/cgs-atlas/morowali-2560.webp 2560w, /assets/cgs-atlas/morowali-4000.webp 4000w, /assets/cgs-atlas/morowali-4639.webp 4639w" '
        'sizes="(max-width: 700px) max(100vw, 740px), 100vw" alt="The waterfront cranes and blue-roofed buildings at Indonesia Morowali Industrial Park, with forested hills beyond" fetchpriority="high"></li></ul>'
        '<div class="container left"><div id="caption">Morowali, Central Sulawesi<br><small>Indonesia · July 2023</small></div></div><div class="container right"><div class="row">'
        '<div class="col-md-7 col-md-offset-5 col-sm-12 col-sm-offset-0 col-xs-12 col-xs-offset-0">'
        f'<div id="white-block" class="fillRight">{edit_slot(link=True)}<strong>Center for Global Sustainability</strong><h1>{title}</h1></div></div></div></div></div>'
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
