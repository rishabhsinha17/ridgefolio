"""Render the public website with the Python standard library."""

from pathlib import Path
from html import escape
import json
import re
import editorial as ed
import cgs
from content import SERVICES, DEMOS, RESOURCES, CASES, CHECKS

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
BASE = "https://ridgefolio.com"
BOOK = "https://cal.com/ridgefolio/intro"
EMAIL = "mailto:rishabh@ridgefolio.com"
pages = {}


def a(url, label, cls=""):
    return f'<a href="{escape(url, quote=True)}" class="{cls}">{label}</a>'


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


def intro(family, title, copy):
    return f'<header class="page-head wrap">{tag(family) if family != title else ""}<h1>{title}</h1><p>{copy}</p></header>'


def add(path, title, desc, body, group):
    pages[path] = (title, desc, body, group)


def service_list():
    return ed.directory(
        ("/services/" + s["slug"] + "/", s["title"], s["intro"]) for s in SERVICES
    )


def preview(slug, title):
    return f'<a class="demo-preview" href="/demos/{slug}/"><img src="/assets/previews/{slug}.jpg" alt="{title} demonstration interface" width="954" height="600" loading="lazy"><span>Try the software <b aria-hidden="true">↗</b></span></a>'


logo = '<svg viewBox="0 0 44 32" aria-hidden="true"><path d="M2 29 15 5l9 16 6-10 12 18M9 29l6-11 6 11M27 29l3-6 4 6"/></svg>ridgefolio<span class="brand-dot">.</span>'
ridge = '<div class="tech-stage tech-dark" data-tech="ridge"><div class="tech-stage-top"><span>COMPUTATIONAL RIDGE</span></div><canvas class="tech-canvas" role="img" aria-label="Interactive topographic ridge rendered as a green mesh"></canvas><div class="tech-stage-bottom"><span class="tech-interaction">Explore the terrain</span><div class="tech-controls"><button data-mode="surface" aria-pressed="true">Surface</button><button data-mode="wire" aria-pressed="false">Wireframe</button></div></div></div>'
home = f"""<section class="frontispiece"><div class="wrap opening"><div class="field-copy">{tag("Independent software engineering")}<h1>Software for<br><em>public agencies.</em></h1><p>We build the websites people visit, the forms staff review and the data tools behind public decisions.</p><div class="actions">{a("/work/industrial-parks/", arrow("Read the case study"), "button")}{a(BOOK, arrow("Book a call"), "field-link")}</div></div>{ed.ARCHITECTURE}</div></section>
<div class="audience wrap"><strong>Working with Ridgefolio</strong>{a("/for/agencies/", arrow("Public agencies"))}{a("/for/partners/", arrow("Delivery partners"))}</div>"""
home += (
    '<section id="work" class="block home-work"><div class="wrap"><div class="shelf-head"><h2>Selected work</h2>'
    + a("/work/", "All project notes ↗")
    + "</div>"
    + ed.work_gallery(CASES)
    + "</div></section>"
)
home += section("What we build", service_list())
home += section(
    "Engineering records",
    '<div class="sources">'
    + "".join(
        a(u, f"<strong>{n}</strong><span>{l} ↗</span>", "field-work-row")
        for n, l, u in [
            ("kvcached", "Core contributor · Release notes", CASES[1][-2]),
            (
                "IBM vLLM Hook",
                "Merged engineering contribution",
                "https://github.com/IBM/vLLM-Hook/pull/41",
            ),
            (
                "Agent evaluation",
                "Research preprint",
                "https://arxiv.org/abs/2610.37679",
            ),
        ]
    )
    + "</div>",
)
home += f"""<span id="about"></span><section id="practice" class="block studio"><div class="wrap studio-grid"><div class="founder-signature"><img src="/assets/editorial/founder.webp" alt="Rishabh Sinha" width="128" height="128" loading="lazy"><div>{tag("The practice")}<h2>Meet Rishabh.</h2><p>Rishabh Sinha leads Ridgefolio from California. He scopes the work, writes the software and walks your team through the handover.</p>{a("/practice/", arrow("About the practice"))}</div></div>{ridge}</div></section>"""
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
    intro(
        "Engineering services",
        "Engineering services",
        "Choose the part of the service that needs work. Each scope includes an example you can try and a way to test delivery.",
    )
    + section("Service areas", service_list(), "catalogue"),
    "Services",
)
for s in SERVICES:
    body = (
        f'<header class="service-mast"><div class="wrap"><div>{tag(s["label"])}<h1>{s["title"]}</h1><p>{s["intro"]}</p>{buttons(("/demos/" + s["demo"] + "/", "Open the working demo"), ("/pricing/", "Scope and pricing"))}</div><div class="service-product">{preview(s["demo"], s["short"])}</div></div></header>'
        + section(
            "The starting point", f'<p class="lead">{s["need"]}</p>', "editorial-band"
        )
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
    intro(
        "Project evidence",
        "Selected work",
        "Maps, infrastructure and published research from Rishabh Sinha’s work before and alongside Ridgefolio. Each project links to the original record.",
    )
    + section("Project notes", ed.work_gallery(CASES), "catalogue"),
    "Work",
)
add(
    "/demos/",
    "Live demos",
    "Try three public-service tasks using fictional records.",
    intro(
        "Demonstration studio",
        "Try the software",
        "Use fictional records to explore service discovery, application review and reporting. Each example runs in your browser.",
    )
    + section("Choose a demonstration", ed.demo_gallery(DEMOS), "catalogue"),
    "Demos",
)
add(
    "/resources/",
    "Buyer resources",
    "Planning tools for buyers and delivery partners.",
    intro(
        "Buyer resources",
        "Buyer resources",
        "Prepare a scope, check launch readiness or take a capability statement into your next meeting.",
    )
    + '<div class="wrap library-shelf">'
    + ed.library()
    + "</div>"
    + section(
        "Plan a project",
        ed.directory(
            [
                ("/resources/project-brief/", "Build a project brief", RESOURCES[2][2]),
                (
                    ed.EXAMPLE,
                    "Read a completed brief",
                    "A worked example for a permit review, with handover and acceptance criteria.",
                ),
                (
                    "/resources/launch-checklist/",
                    "Review launch readiness",
                    RESOURCES[1][2],
                ),
            ]
        ),
    ),
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
            (ed.PDF, "Download capability statement (PDF)"),
            (
                "/work/" if slug == "partners" else "/demos/",
                "Review founder work"
                if slug == "partners"
                else "Explore working examples",
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
    f"""<header class="wrap portrait-intro"><div>{tag("The practice")}<h1>Rishabh Sinha</h1><p>Rishabh runs Ridgefolio, an independent software engineering practice in California. His work ranges from a public map of Indonesian industrial parks to the software that manages memory for language models.</p><div class="actions">{a("/work/", arrow("Explore the work"), "button")}{a("https://rishabhsinha.dev/", arrow("Founder portfolio"), "field-link")}</div></div><figure><img src="/assets/editorial/founder.webp" alt="Rishabh Sinha" width="428" height="428"></figure></header>"""
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
    intro(
        "Contact",
        "Start a conversation.",
        "Book a 30-minute introduction or email a public solicitation link and the work you have in mind.",
    )
    + '<div class="wrap quick-actions">'
    + buttons((BOOK, "Book a 30-minute call"), (EMAIL, "rishabh@ridgefolio.com"))
    + "</div>"
    + section(
        "What to bring",
        rows(
            [
                (
                    "For a new project",
                    "The task people struggle with today, the systems involved and the date you are working toward.",
                ),
                (
                    "For a solicitation",
                    "The public listing, submission deadline and designated communication channel.",
                ),
                (
                    "For a partnership",
                    "The part of the scope you would like Ridgefolio to own and the responsibilities your team already covers.",
                ),
            ]
        ),
    ),
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
        ed.buying_modes(),
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
    )
    + section(
        "Launch review",
        f'<div id="checklist">{checks}<p role="status" id="check-count">0 of {len(CHECKS)} checked</p><button data-download-checks>Download checklist</button> <button type="button" class="quiet" data-clear-checks>Clear checklist</button></div>',
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
    )
    + section(
        "Project worksheet",
        f'<p class="worksheet-example"><a href="{ed.EXAMPLE}" download>Download a completed example</a></p><form id="brief">{fields}<button>Download my brief</button> <button type="reset" class="quiet">Clear brief</button><p id="brief-state" role="status"></p></form>',
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
    demo_nav = (
        '<nav class="wrap demo-switch" aria-label="Switch demonstration">'
        + "".join(
            f'<a href="/demos/{other}/" aria-current="page">{name}</a>'
            if other == slug
            else a("/demos/" + other + "/", name)
            for other, name, *_ in DEMOS
        )
        + "</nav>"
    )
    body = (
        intro("Interactive demo", title, desc)
        + demo_nav
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


def nav(path):
    links = [
        ("/services/", "Services"),
        ("/demos/", "Demos"),
        ("/work/", "Selected work"),
        ("/resources/", "Resources"),
        ("/pricing/", "Pricing"),
        ("/search/", "Search"),
    ]
    items = "".join(
        f'<a href="{u}"'
        + (
            ' aria-current="page"'
            if path == u
            else ' aria-current="location"'
            if path.startswith(u)
            else ""
        )
        + ">"
        + t
        + "</a>"
        for u, t in links
    )
    return (
        '<header class="top"><div class="wrap nav-shell">'
        + a("/", logo, "brand")
        + '<button class="menu-button" aria-controls="site-nav" aria-expanded="false"><span aria-hidden="true" class="menu-glyph"></span>Menu</button><nav id="site-nav" aria-label="Main navigation">'
        + items
        + a(BOOK, arrow("Book a call"), "nav-cta")
        + "</nav></div></header>"
    )


foot = (
    '<footer><div class="wrap"><div class="footer-top"><div>'
    + a("/", logo, "brand")
    + "<p>Independent software engineering<br>California</p></div><div><strong>Explore</strong>"
    + a("/services/", "Services")
    + a("/practice/", "The practice")
    + a("/demos/", "Demos")
    + a("/work/", "Selected projects")
    + "</div><div><strong>For buyers</strong>"
    + a("/resources/", "Resources")
    + a(cap, "Capability statement")
    + a("/pricing/", "Scoping and pricing")
    + a("/for/partners/", "Delivery partners")
    + "</div><div><strong>Connect</strong>"
    + a("/contact/", "Contact")
    + a(EMAIL, "rishabh@ridgefolio.com", "contact-email")
    + a("/search/", "Search the site")
    + '</div></div><div class="colophon">© 2026 Ridgefolio LLC</div></div></footer>'
)
contact = (
    '<section id="contact" class="closing"><div class="wrap field-contact"><div>'
    + tag("Contact Ridgefolio")
    + "<h2>Have a project in mind?</h2></div>"
    + a(BOOK, arrow("Book a call"), "button bright")
    + "</div></section>"
)
index = []
for path, (title, desc, body, group) in pages.items():
    if path != "/search/":
        index.append(
            dict(
                path=path,
                title=title,
                description=desc,
                group=group,
                keywords=" ".join(re.sub("<[^>]+>", " ", body).split()),
            )
        )
    out = PUBLIC / path.strip("/") / "index.html"
    out.parent.mkdir(parents=True, exist_ok=True)
    crumb = (
        ""
        if path == "/"
        else '<div class="wrap breadcrumb">'
        + a("/", "Home")
        + ' <span aria-hidden="true">/</span> '
        + (
            a("/" + path.split("/")[1] + "/", group)
            + ' <span aria-hidden="true">/</span> '
            if path.count("/") > 2 and not path.startswith("/for/")
            else ""
        )
        + escape(title)
        + "</div>"
    )
    scripts = (
        '<script src="/assets/civic.js" defer></script><script src="/assets/site.js" defer></script>'
        + (
            '<script src="/assets/atlas.js" defer></script>'
            if path == "/work/industrial-parks/"
            else ""
        )
        + ('<script src="/assets/ridge.js" defer></script>' if path == "/" else "")
    )
    is_task = (
        path.startswith("/demos/")
        and path != "/demos/"
        or path
        in ("/search/", "/resources/launch-checklist/", "/resources/project-brief/")
    )
    ending = "" if is_task or path in ("/contact/", cap, "/pricing/") else contact
    body_class = (
        "task-page" if is_task else "document-page" if path == cap else "site-page"
    )
    social_image, social_alt = ed.social_image(path)
    out.write_text(f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="index,follow"><title>{escape(title)} | Ridgefolio</title><meta name="description" content="{escape(desc, quote=True)}"><link rel="canonical" href="{BASE}{path}"><meta property="og:title" content="{escape(title, quote=True)} | Ridgefolio"><meta property="og:description" content="{escape(desc, quote=True)}"><meta property="og:url" content="{BASE}{path}"><meta property="og:type" content="website"><meta property="og:image" content="{BASE}{social_image}"><meta property="og:image:alt" content="{escape(social_alt, quote=True)}"><meta name="theme-color" content="#19392d"><link rel="icon" href="/assets/favicon.svg"><link rel="stylesheet" href="/assets/ridge.css"><link rel="stylesheet" href="/assets/site.css"><link rel="stylesheet" href="/assets/edition.css">{scripts}</head>
<body class="{body_class}" data-area="{path.split("/")[1] or "home"}"><a class="skip" href="#main">Skip to content</a>{nav(path)}<main id="main">{crumb}{body}{ending}</main>{foot}</body></html>''')
(PUBLIC / "assets/search.json").write_text(json.dumps(index, ensure_ascii=False))
(PUBLIC / "sitemap.xml").write_text(
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    + "".join(f"<url><loc>{BASE}{p}</loc></url>" for p in pages)
    + "</urlset>"
)
print(f"Rendered {len(pages)} pages.")
