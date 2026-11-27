"""Render the public website with the Python standard library."""

from pathlib import Path
from html import escape
import json
import re
import homepage
import interiors
import navigation
import editorial as ed
import cgs
from content import SERVICES, DEMOS, RESOURCES, CASES, CHECKS

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
BASE = "https://ridgefolio.com"
BOOK = navigation.BOOK
EMAIL = "mailto:" + navigation.EMAIL
pages = {}
LINK_ARROW = '<svg class="rf-diagonal-arrow" aria-hidden="true" focusable="false" width=".82em" height=".82em" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13 13 3M4 3h9v9"/></svg>'


def a(url, label, cls=""):
    return f'<a href="{escape(url, quote=True)}" class="{cls}">{label}</a>'


CA_CERTIFICATION = (
    "California-certified Small Business (Microbusiness) · Certification #2057043 · "
    "Valid through November 30, 2028. "
    '<a href="https://caleprocure.ca.gov/pages/PublicSearch/supplier-search.aspx">Verify on Cal eProcure</a>.'
)


def arrow(label):
    return f'{label} <span aria-hidden="true">↗</span>'


def tag(text):
    return f'<span class="tag">{text}</span>'


def buttons(*links):
    return (
        '<div class="actions">'
        + "".join(
            a(u, arrow(s), "button " + ("secondary" if i else ""))
            for i, (u, s) in enumerate(links)
        )
        + "</div>"
    )


def rows(items):
    return (
        '<dl class="rows">'
        + "".join(f"<div><dt>{h}</dt><dd>{v}</dd></div>" for h, v in items)
        + "</dl>"
    )


def section(title, body, extra=""):
    return f'<section class="block {extra}"><div class="wrap"><h2>{title}</h2>{body}</div></section>'


def intro(family, title, copy, actions="", offline_copy=""):
    lead = (
        f'<p class="rv-js-intro">{copy}</p><noscript><p>{offline_copy}</p></noscript>'
        if offline_copy else f"<p>{copy}</p>"
    )
    return f'<header class="page-head wrap">{tag(family) if family != title else ""}<h1>{title}</h1>{lead}{actions}</header>'


def add(path, title, desc, body, group):
    pages[path] = (title, desc, body, group)


def preview(slug, title):
    return f'<a class="demo-preview" href="/demos/{slug}/"><img src="/assets/previews/{slug}.jpg" alt="{title} demonstration interface" width="954" height="600" loading="lazy"><span>Try the software <b aria-hidden="true">↗</b></span></a>'


ridge = '<div class="tech-stage tech-dark" data-tech="ridge"><div class="tech-stage-top"><span>COMPUTATIONAL RIDGE</span></div><canvas class="tech-canvas" role="img" aria-label="Interactive topographic ridge rendered as a green mesh"></canvas><div class="tech-stage-bottom"><span class="tech-interaction">Explore the terrain</span><div class="tech-controls"><button data-mode="surface" aria-pressed="true">Surface</button><button data-mode="wire" aria-pressed="false">Wireframe</button></div></div></div>'
home = homepage.render()
add(
    "/",
    "Software engineering for public agencies",
    "Websites, workflows and data systems for public agencies and delivery partners.",
    home,
    "Home",
)
add(
    "/services/",
    "Services",
    "Choose a starting point for a website, operations or reporting project.",
    interiors.catalogue(demos=False),
    "Services",
)
for s in SERVICES:
    body = (
        intro(s["label"], s["title"], s["intro"])
        + f'<section class="wrap service-feature"><div><h2>The starting point</h2><p class="lead">{s["need"]}</p></div>{preview(s["demo"], s["short"])}</section>'
        + section("What the work includes", rows(s["items"]))
        + section(
            "How to evaluate it",
            f'<p class="lead">{s["test"]}</p>'
            + buttons(("/demos/" + s["demo"] + "/", "Try the demonstration")),
            "tinted",
        )
        + section(
            "What affects scope",
            f"<p>{s['scope']}</p>"
            + buttons(
                ("/resources/" + s["guide"] + "/", "Open the planning guide"),
                ("/pricing/", "Scope and pricing"),
            ),
        )
    )
    add("/services/" + s["slug"] + "/", s["title"], s["intro"], body, "Services")
for slug, title, cat, summary, detail, why, source, label in CASES:
    if slug == "industrial-parks":
        add("/work/industrial-parks/", cgs.TITLE, cgs.SUMMARY, cgs.case_study(), "Work")
        continue
    add(
        "/work/" + slug + "/",
        title,
        summary,
        f'<header class="wrap case-header">{tag(ed.WORK_CAPTIONS[slug])}<h1>{ed.WORK_TITLES[slug]}</h1><p>{summary}</p></header>'
        + f'<div class="wrap exhibit">{ed.project_exhibit(slug)}</div>'
        + section(
            ed.EXHIBIT_COPY[slug][0],
            f'<div class="reading-copy"><p class="lead">{ed.EXHIBIT_COPY[slug][1]}</p><p>{detail}</p>'
            + buttons((source, label))
            + "</div>",
        )
        + section(
            "Relevance to a project",
            f"<p>{why}</p>"
            + a("/work/", "Browse the other project notes ↗", "text-action"),
        ),
        "Work",
    )
add(
    "/work/",
    "Selected work",
    "Public records of founder contributions to research tools and software.",
    interiors.work_index(),
    "Work",
)
add(
    "/demos/",
    "Live demos",
    "Try three public-service tasks using fictional records.",
    interiors.catalogue(demos=True),
    "Demos",
)
add(
    "/resources/",
    "Buyer resources",
    "Planning tools for buyers and delivery partners.",
    interiors.resource_index(),
    "Resources",
)
for slug, who, desc, items in [
    (
        "agencies",
        "Public agencies",
        "Plan a resident service around the people who use it and the staff who will operate it.",
        [
            (
                "Program staff",
                "Bring the current form, decision rules and examples of cases that need extra review.",
            ),
            (
                "IT and web teams",
                "Identify systems of record, hosting requirements, identity providers and content owners.",
            ),
            (
                "Procurement",
                "Use the capability statement and project brief to compare proposed deliverables and support terms against the acceptance criteria.",
            ),
        ],
    ),
    (
        "partners",
        "Delivery partners",
        "Add an engineering work package to a larger engagement, with clear interfaces and a named handover owner.",
        [
            (
                "Before a proposal",
                "Share the permissible statement of work, role boundaries, required experience and procurement schedule.",
            ),
            ("California certification", CA_CERTIFICATION),
            (
                "During delivery",
                "Agree on repository access, test fixtures, review cadence and who can accept the milestone.",
            ),
            (
                "At handover",
                "Review the release together, deliver test results and document the support boundary.",
            ),
        ],
    ),
]:
    add(
        "/for/" + slug + "/",
        who,
        desc,
        '<header class="wrap audience-intro"><div>'
        + tag("Working with Ridgefolio")
        + f"<h1>{who}</h1><p>{desc}</p>"
        + buttons(
            (ed.PDF, "Capability PDF"),
            (
                "/work/" if slug == "partners" else "/demos/",
                "Selected work"
                if slug == "partners"
                else "Working demos",
            ),
        )
        + "</div>"
        + ed.audience_artifact(slug)
        + "</header>"
        + section(
            "Planning a subcontract"
            if slug == "partners"
            else "Who to bring into the project",
            rows(items),
        )
        + (
            section(
                "See the permit record",
                "<p>Follow an application from the original request through the reviewer’s correction to the final receipt.</p>"
                + buttons(
                    ("/demos/permit-desk/", "Try the permit desk"),
                    (ed.RECEIPT, "Read the example receipt"),
                ),
            )
            if slug == "agencies"
            else section(
                "Scope a work package",
                "<p>A prime can use the example brief to assign the implementation, specify what the customer will test and identify who is responsible after handover.</p>"
                + buttons(
                    (ed.EXAMPLE, "Read the example brief"),
                    ("/pricing/", "Scope and pricing"),
                ),
            )
        ),
        "Practice",
    )
add(
    "/practice/",
    "The practice",
    "Meet Rishabh Sinha and see how Ridgefolio delivers software.",
    f"""<header class="wrap portrait-intro"><div>{tag("The practice")}<h1>Rishabh Sinha</h1><p>Rishabh runs Ridgefolio in California. His work spans a public map of Indonesian industrial parks and memory software for language models.</p><div class="actions">{a("/work/", arrow("Explore the work"), "button")}{a("https://rishabhsinha.dev/", arrow("Founder portfolio"), "field-link")}</div></div><figure><img src="/assets/editorial/founder.webp" alt="Rishabh Sinha" width="428" height="428"></figure></header>"""
    + section(
        "From first conversation to handover",
        rows(
            [
                (
                    "Discovery",
                    "Walk through the current task. Identify the users and constraints. Set the scope and write the acceptance checks together.",
                ),
                (
                    "Build and review",
                    "Review a working slice early. Track decisions and test edge cases with the people who handle them.",
                ),
                (
                    "Release and support",
                    "Rehearse deployment and recovery, train the owners and document how to report an issue. Agree on support hours in the project scope.",
                ),
            ]
        ),
    ),
    "Practice",
)
add(
    "/contact/",
    "Contact Ridgefolio",
    "Discuss an agency project or a subcontracting opportunity.",
    interiors.contact(),
    "Contact",
)

add(
    "/pricing/",
    "Scoping and pricing",
    "Prepare a software estimate with a defined scope, acceptance test and support period.",
    intro(
        "Procurement",
        "Scoping and pricing",
        "To prepare an estimate, we need the task, the systems it touches and your acceptance test. Choose the engagement that fits your buying process.",
    )
    + '<div class="wrap quick-actions">'
    + buttons(
        (ed.estimate_link(EMAIL), "Request an estimate"),
        (ed.EXAMPLE, "See a completed scope"),
    )
    + "</div>"
    + section(
        "Ways to buy the work",
        rows(
            [
                (
                    "Discovery and prototype",
                    "Define one user journey, map the dependencies and review a working example. Use the findings to price the build.",
                ),
                (
                    "Implementation",
                    "Price the agreed deliverables by milestone. Define acceptance, migration boundaries, third-party fees and change control before work starts.",
                ),
                (
                    "Ongoing support",
                    "Specify the supported systems, coverage window, response targets and escalation contacts. Separate recurring costs from one-time delivery.",
                ),
            ]
        ),
    )
    + section(
        "What goes in the estimate",
        "<p>A permit review might include intake, staff review and a receipt. Connecting to an identity provider or migrating old permits adds a separate line of work. We identify the deliverable and acceptance test for each milestone, and list third-party fees and ongoing support separately.</p>"
        + buttons(("/resources/project-brief/", "Prepare a project brief")),
    ),
    "Resources",
)
cap = "/resources/capabilities/"
capbody = (
    intro(
        "Capability statement",
        "Ridgefolio LLC",
        "Independent software engineering for public agencies and delivery partners.",
    )
    + '<div class="wrap quick-actions">'
    + buttons((ed.PDF, "Download the one-page PDF"))
    + "</div>"
    + section("Core capabilities", rows([(s["title"], s["intro"]) for s in SERVICES]))
    + section(
        "Delivery and evidence",
        "<p>Founder Rishabh Sinha leads each engagement from scope through handover. Engagements can cover a complete project or a defined subcontract work package.</p>"
        + f"<p>{CA_CERTIFICATION}</p>"
        + a(
            "/work/industrial-parks/",
            "Founder work · Indonesian industrial parks dashboard",
        )
        + "<p>California · Remote delivery · "
        + a(EMAIL, "rishabh@ridgefolio.com")
        + " · ridgefolio.com</p>",
    )
)
add(cap, "Capability statement", RESOURCES[0][2], capbody, "Resources")
checks = "".join(
    f'<label class="check"><input type="checkbox"><span><strong>{t}</strong>{detail}</span></label>'
    for t, detail in CHECKS
)
add(
    "/resources/launch-checklist/",
    "Website launch checklist",
    RESOURCES[1][2],
    intro(
        "Field guide",
        "Website launch checklist",
        "Check each item as your team verifies it. Your choices stay in this browser tab. Download a copy to keep or share.",
        offline_copy="Check the items your team has verified. Use your browser’s Print command to keep a copy of the marked checklist.",
    )
    + section(
        "Launch review",
        f'<div id="checklist">{checks}<p role="status" id="check-count">0 of {len(CHECKS)} checked</p><button data-download-checks disabled>Download checklist</button> <button type="button" class="quiet" data-clear-checks disabled>Clear checklist</button></div>',
    ),
    "Resources",
)
brief_fields = [
    ("Project name", "What do you call this project?"),
    ("Current task", "What happens today, and who handles it?"),
    ("Desired result", "What should a resident or staff member be able to do?"),
    (
        "Systems and constraints",
        "Which existing systems, deadlines and requirements apply?",
    ),
    ("Acceptance", "How will your team decide the work is ready?"),
]
fields = "".join(
    f'<label>{name}<textarea name="{name}" rows="2" placeholder="{prompt}" maxlength="2500" {"required" if i == 0 else ""}></textarea></label>'
    for i, (name, prompt) in enumerate(brief_fields)
)
add(
    "/resources/project-brief/",
    "Project brief builder",
    RESOURCES[2][2],
    intro(
        "Planning worksheet",
        "Build a project brief.",
        "Capture the problem and the test for success. Download the brief for your records or attach it to a project inquiry. Entries stay in this tab.",
        offline_copy="Use your browser’s Print command for a blank project worksheet, or download the completed example below.",
    )
    + section(
        "Project worksheet",
        f'<p class="worksheet-example"><a href="{ed.EXAMPLE}" download>Download a completed example</a></p><form id="brief">{fields}<button disabled>Download my brief</button> <button type="reset" class="quiet" disabled>Clear brief</button><p id="brief-state" role="status"></p></form>',
    ),
    "Resources",
)


def demo_body(slug):
    if slug == "finder":
        return '<label for="service-query">Search services</label><input id="service-query" type="search" placeholder="Try permit, road or park"><p id="match-count" role="status"></p><div id="finder-results"></div>'
    if slug == "permit-desk":
        return """<div class="desk-grid"><section class="desk-panel"><div class="tag">Resident and staff views</div><h2 id="desk-heading">Application intake</h2><div id="desk-step"></div></section><aside class="receipt"><span class="tag">Case file</span><h3>Community event permit</h3><p id="desk-status" role="status"></p><ol id="desk-history"></ol><button type="button" class="quiet" id="desk-reset">Reset demo</button></aside></div>"""
    return """<label for="district">District</label><select id="district"><option>All districts</option><option>North</option><option>Central</option><option>South</option></select><p role="status" id="ledger-summary"></p><div class="ledger-chart" id="ledger-chart"></div><div class="scroll-table"><table><caption>Fictional service records</caption><thead><tr><th scope="col">Record</th><th scope="col">District</th><th scope="col">Service</th><th scope="col">Hours</th></tr></thead><tbody id="ledger-rows"></tbody></table></div><button id="export-ledger">Download filtered CSV</button>"""


for slug, title, desc, tone in DEMOS:
    body = (
        intro("Interactive demo", title, desc)
        + section(
            "Demo workspace",
            '<div class="workspace '
            + tone
            + '"><p class="workspace-note">Fictional service data · Runs in this tab</p><noscript>Enable JavaScript to use the interactive workspace.</noscript>'
            + demo_body(slug)
            + "</div>",
        )
        + (
            '<p class="wrap receipt-download">'
            + a(ed.RECEIPT, "View a completed sample receipt")
            + "</p>"
            if slug == "permit-desk"
            else ""
        )
        + section(
            "Explore the service",
            buttons(
                (
                    "/services/"
                    + {
                        "finder": "websites",
                        "permit-desk": "workflows",
                        "service-ledger": "data",
                    }[slug]
                    + "/",
                    "View service scope",
                ),
                ("/demos/", "All demos"),
            ),
        )
    )
    add("/demos/" + slug + "/", title, desc, body, "Demos")
add(
    "/search/",
    "Search",
    "Find a service, demo, project or guide.",
    intro(
        "Site directory",
        "Search Ridgefolio",
        "Find services, demos, project evidence and buyer resources.",
    )
    + section(
        "Find a page",
        '<form action="/search/" id="search-form"><label for="query">Search pages</label><input name="q" id="query" type="search" placeholder="Try workflow, migration or brief"><button>Search</button></form><p id="results-count" role="status"></p><div id="site-results"></div><noscript><p>Browse <a href="/services/">services</a>, <a href="/work/">selected work</a> or <a href="/resources/">buyer resources</a>.</p></noscript>',
    ),
    "Search",
)


not_found = "/404.html"
add(
    not_found, "Page not found", "Return to Ridgefolio or search the site.",
    intro("404", "This page isn’t here.", "Use the site directory to find a service, project or guide.")
    + section("Find a page", buttons(("/", "Back to Ridgefolio"), ("/search/", "Search the site"))),
    "",
)
index = []
tab_draft_script = Path(__file__).with_name("tab-drafts.js").read_text()
for path, (title, desc, body, group) in pages.items():
    body = interiors.adapt(path, body)
    family = ""
    family_wrapper = re.fullmatch(r'<div class="(rv-source [^"]+)">(.*)</div>', body, re.S)
    if family_wrapper:
        family, body = family_wrapper.groups()
    if path not in ("/search/", not_found):
        index.append(
            dict(
                path=path,
                title=title,
                description=desc,
                group=group,
                keywords=" ".join(re.sub("<[^>]+>", " ", body).split()),
            )
        )
    out = PUBLIC / "404.html" if path == not_found else PUBLIC / path.strip("/") / "index.html"
    out.parent.mkdir(parents=True, exist_ok=True)
    is_cgs = path == "/work/industrial-parks/"
    case_css = (
        '<link rel="stylesheet" href="/assets/cgs-atlas/leaflet.css">'
        '<link rel="stylesheet" href="/assets/cgs.css">'
    ) if is_cgs else ""
    worksheet = {"/resources/project-brief/": "project-brief", "/resources/launch-checklist/": "launch-checklist"}.get(path)
    early_drafts = f'<script data-worksheet="{worksheet}">{tab_draft_script}</script>' if worksheet else ""
    scripts = (
        '<script src="/assets/ref-shell.js" defer></script><script src="/assets/motion-icons.js" defer></script><script src="/assets/site.js" defer></script>'
        + ('<script src="/assets/cgs-atlas/leaflet.js" defer></script><script src="/assets/atlas.js" defer></script>' if is_cgs else "")
        + ('<script src="/assets/showcase.js" defer></script>' if path == "/" or path == "/practice/" or path.startswith("/for/") else "")
        + ('<script src="/assets/ridge.js" defer></script>' if path == "/practice/" else "")
        + ('<script src="/assets/interiors.js" defer></script>' if path != "/" else "")
    )
    is_task = (
        path.startswith("/demos/")
        and path != "/demos/"
        or path
        in ("/search/", "/resources/launch-checklist/", "/resources/project-brief/")
    )
    body_class = (
        "task-page" if is_task else "document-page" if path == cap else "site-page"
    )
    body_class += " rv-home" if path == "/" else " rv-interior"
    interior_css = '' if path == "/" else '<link rel="stylesheet" href="/assets/interiors.css">'
    template_id = "homepage"
    if family:
        template_id = family.split()[1]
        if template_id == "case-page":
            template_id = "case"
        elif template_id == "article-page":
            template_id = "freeform-page" if path.startswith("/services/") else "blog-post-page"
    if family:
        if path in {"/services/", "/demos/", "/resources/", "/contact/"}:
            stylesheet = "interior-directories"
        elif path == "/practice/" or path.startswith(("/for/", "/work/")):
            stylesheet = "interior-projects"
        else:
            stylesheet = "interior-articles"
        interior_css += f'<link rel="stylesheet" href="/assets/{stylesheet}.css">'
        if path != "/work/industrial-parks/":
            interior_css += '<link rel="stylesheet" href="/assets/interior-art.css">'
    robots = "noindex" if path == not_found else "index,follow"
    social_image, social_alt = ed.social_image(path)
    # Keep the source template’s section ordering and link the skip control to
    # the first heading even on pages with an existing, referenced heading ID.
    first_heading = next((tag for tag in re.finditer(r"<h1\b[^>]*>", body)
                          if 'aria-hidden="true"' not in tag.group() and not re.search(r"\shidden\b", tag.group())), None)
    heading_id = re.search(r'\bid="([^"]+)"', first_heading.group()) if first_heading else None
    target = heading_id[1] if heading_id else "main"
    if first_heading and not heading_id:
        body = body[:first_heading.end()-1] + ' id="main" tabindex="-1">' + body[first_heading.end():]
    if path == "/practice/":
        body += f'<details class="ridge-example wrap"><summary>Explore the terrain study</summary>{ridge}</details>'
    sheet = "" if path == "/contact/" else navigation.contact_form()
    landmark = "" if re.search(r"<main\b", body) else ' role="main"'
    page_body = (
        f'<div class="main-wrap{(" " + family) if family else ""}"{landmark}>{navigation.squares()}{navigation.nav(path)}'
        f'{body}{navigation.footer(path)}{sheet}</div>'
    )
    page_body = page_body.replace("↗", LINK_ARROW)
    out.write_text(f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="{robots}"><title>{escape(title)} | Ridgefolio</title><meta name="description" content="{escape(desc, quote=True)}"><link rel="canonical" href="{BASE}{path}"><meta property="og:title" content="{escape(title, quote=True)} | Ridgefolio"><meta property="og:description" content="{escape(desc, quote=True)}"><meta property="og:url" content="{BASE}{path}"><meta property="og:type" content="website"><meta property="og:image" content="{BASE}{social_image}"><meta property="og:image:alt" content="{escape(social_alt, quote=True)}"><meta name="theme-color" content="#19392d"><link rel="icon" href="/assets/favicon-32.png" sizes="32x32" type="image/png"><link rel="icon" href="/assets/favicon.svg" sizes="any" type="image/svg+xml"><link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">{early_drafts}<link rel="preload" as="font" type="font/woff2" href="/assets/fonts/source-serif-4-400.woff2" crossorigin><link rel="preload" as="font" type="font/ttf" href="/assets/fonts/manrope-variable.ttf" crossorigin><link rel="stylesheet" href="/assets/ridge.css"><link rel="stylesheet" href="/assets/site.css">{case_css}<link rel="stylesheet" href="/assets/showcase.css">{interior_css}<link rel="stylesheet" href="/assets/ref-shell.css"><link rel="stylesheet" href="/assets/motion-icons.css">{scripts}</head>
<body id="{template_id}" class="rz-page {body_class}"><a class="skip" href="#{target}">Skip to content</a>{page_body}</body></html>''')
(PUBLIC / "assets/search.json").write_text(json.dumps(index, ensure_ascii=False))
(PUBLIC / "sitemap.xml").write_text(
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    + "".join(f"<url><loc>{BASE}{p}</loc></url>" for p in pages if p != not_found)
    + "</urlset>"
)
print(f"Rendered {len(pages) - 1} pages and the 404 page.")
