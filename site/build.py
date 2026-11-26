"""Render the public website with the Python standard library."""

from pathlib import Path
from html import escape
import json
import re
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


def art(kind):
    if kind == "blue":
        inner = '<div class="mini-page"><i></i><b></b><span></span><span></span><small></small></div><div class="mini-page back"><i></i><b></b><span></span></div>'
    elif kind == "gold":
        inner = '<div class="mini-flow"><i></i><em></em><i></i><em></em><i></i></div>'
    else:
        inner = (
            '<div class="mini-chart">'
            + "".join(
                f'<i style="--h:{h}%"></i>' for h in [34, 52, 43, 78, 64, 92, 72, 85]
            )
            + "</div>"
        )
    return f'<div class="art {kind}" aria-hidden="true">{inner}</div>'


def card(url, title, desc, category="", tone=""):
    return a(
        url,
        (art(tone) if tone else "")
        + f'<div class="card-body">{tag(category) if category else ""}<h3>{title}</h3><p>{desc}</p><span class="go" aria-hidden="true">↗</span></div>',
        "card",
    )


def grid(items):
    return '<div class="cards">' + "".join(items) + "</div>"


def rows(items):
    return (
        '<dl class="rows">'
        + "".join(f"<div><dt>{h}</dt><dd>{v}</dd></div>" for h, v in items)
        + "</dl>"
    )


def section(title, body, extra=""):
    return f'<section class="block {extra}"><div class="wrap"><h2>{title}</h2>{body}</div></section>'


def intro(family, title, copy):
    return f'<header class="page-head wrap">{tag(family)}<h1>{title}</h1><p>{copy}</p></header>'


def add(path, title, desc, body, group):
    pages[path] = (title, desc, body, group)


def service_cards():
    return grid(
        card(
            "/services/" + s["slug"] + "/",
            s["title"],
            s["intro"],
            s["label"],
            s["tone"],
        )
        for s in SERVICES
    )


def demo_cards():
    return grid(
        card("/demos/" + slug + "/", title, desc, "Interactive demo", tone)
        for slug, title, desc, tone in DEMOS
    )


def preview(slug, title):
    return f'<a class="demo-preview" href="/demos/{slug}/"><img src="/assets/previews/{slug}.jpg" alt="Preview of the {title} demonstration" width="960" height="520" loading="lazy"><span>Open the interactive demo <b aria-hidden="true">↗</b></span></a>'


def resource_cards():
    return grid(
        card("/resources/" + slug + "/", title, desc, "Field guide")
        for slug, title, desc in RESOURCES
    )


def work_cards():
    return grid(
        card("/work/" + slug + "/", title, summary, cat)
        for slug, title, cat, summary, *_ in CASES
    )


def case_strip():
    return section(
        "Selected work",
        work_cards()
        + '<p class="caption">These projects document Rishabh Sinha’s individual experience.</p>',
    )


logo = '<svg viewBox="0 0 44 32" aria-hidden="true"><path d="M2 29 15 5l9 16 6-10 12 18M9 29l6-11 6 11M27 29l3-6 4 6"/></svg>ridgefolio<span class="brand-dot">.</span>'
ridge = '<div class="tech-stage tech-dark" data-tech="ridge"><div class="tech-stage-top"><span>COMPUTATIONAL RIDGE</span></div><canvas class="tech-canvas" role="img" aria-label="Interactive topographic ridge rendered as a green mesh"></canvas><div class="tech-stage-bottom"><span class="tech-interaction">Explore the terrain</span><div class="tech-controls"><button data-mode="surface" aria-pressed="true">Surface</button><button data-mode="wire" aria-pressed="false">Wireframe</button></div></div></div>'
home = f"""<section class="home-head"><div class="wrap hero-layout"><div class="field-copy">{tag("Independent public-sector engineering")}<h1>Better systems.<br><em>Stronger</em><br>places.</h1><p>We build public websites and the systems behind them, from permit review to reporting.</p><div class="actions">{a("/demos/", arrow("Explore live demos"), "button bright")}{a(BOOK, arrow("Book a call"), "field-link")}</div></div>{ridge}</div></section>
<div class="audience wrap"><strong>Who we work with</strong>{a("/for/agencies/", arrow("Public agencies"))}{a("/for/partners/", arrow("Delivery partners"))}</div>"""
home += section("What do you need to build?", service_cards())
home += section(
    "Try the permit desk",
    f'<div class="feature"><div>{tag("Working demonstration")}<h3>One application.<br>Both sides of the desk.</h3><p>Submit a fictional permit request, switch to staff review and see every decision appear in the record.</p>{buttons(("/demos/permit-desk/", "Open permit desk"))}</div><div class="sample-ticket" aria-hidden="true"><div>APPLICATION RECORD <b>DEMO</b></div><h4>Community event permit</h4><p>Harbor Square · Public gathering</p><ol><li>Application received</li><li>Staff review</li><li>Decision &amp; receipt</li></ol></div></div>',
    "tinted",
)
home += '<div id="work">' + case_strip() + "</div>"
home += section(
    "Engineering you can inspect",
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
home += (
    '<span id="about"></span><section id="practice" class="block"><div class="wrap founder-signature"><img src="/assets/founder.jpg" alt="Rishabh Sinha" width="128" height="128" loading="lazy"><div>'
    + tag("Founder")
    + "<h2>Rishabh Sinha</h2><p>Work directly with the engineer who designs the system and hands it over to your team.</p>"
    + a("/practice/", arrow("Meet the practice"))
    + "</div></div></section>"
)
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
        "What do you need to build?",
        "Explore the deliverables, acceptance checks and scoping questions for each service.",
    )
    + section("Engineering services", service_cards()),
    "Services",
)
for s in SERVICES:
    body = (
        intro(s["label"], s["title"], s["intro"])
        + section(
            "Where to start",
            f'<div class="split"><p class="lead">{s["need"]}</p>{preview(s["demo"], s["short"])}</div>',
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
    add(
        "/work/" + slug + "/",
        title,
        summary,
        intro("Founder experience · " + cat, title, summary)
        + section(
            "Inside the work",
            f'<p class="lead">{detail}</p>' + buttons((source, label)),
        )
        + section("What a buyer can take from it", f"<p>{why}</p>"),
        "Work",
    )
add(
    "/work/",
    "Selected work",
    "Public records of founder contributions to research tools and software.",
    intro(
        "Project evidence",
        "Selected work",
        "Explore founder contributions in their original setting, with a public source for each project.",
    )
    + section("Project notes", work_cards()),
    "Work",
)
add(
    "/demos/",
    "Live demos",
    "Try three public-service tasks using fictional records.",
    intro(
        "Demonstration studio",
        "Try the software.",
        "Use fictional records to explore service discovery, application review and reporting. Each example runs in your browser.",
    )
    + section("Choose a demonstration", demo_cards()),
    "Demos",
)
add(
    "/resources/",
    "Buyer resources",
    "Planning tools for buyers and delivery partners.",
    intro(
        "Buyer resources",
        "Bring a better brief.",
        "Prepare a scope, check launch readiness or take a capability statement into your next meeting.",
    )
    + section("Planning tools", resource_cards()),
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
        intro("Who we work with", who, desc)
        + section("Working together", rows(items))
        + section(
            "Plan the engagement",
            buttons(
                ("/resources/capabilities/", "Capability statement"),
                ("/resources/project-brief/", "Build a project brief"),
            ),
        ),
        "Practice",
    )
add(
    "/practice/",
    "The practice",
    "Meet Rishabh Sinha and see how Ridgefolio delivers software.",
    intro(
        "Ridgefolio LLC",
        "The practice",
        "Ridgefolio is an independent software engineering practice in California led by Rishabh Sinha.",
    )
    + section(
        "Rishabh Sinha",
        f'<div class="founder-signature"><img src="/assets/founder.jpg" alt="Rishabh Sinha" width="128" height="128"><div><p>Rishabh has contributed to open-source infrastructure, public research tools and AI evaluation. His work includes a map of Indonesian industrial parks and contributions to kvcached.</p>{a("https://rishabhsinha.dev/", arrow("Founder portfolio"))}</div></div>',
    )
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
    + section(
        "Contact Ridgefolio",
        buttons((BOOK, "Book a call"), (EMAIL, "Email Rishabh"))
        + f"<p>{a(EMAIL, 'rishabh@ridgefolio.com')}</p>",
    )
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
        "Scope a project.",
        "To prepare an estimate, we need the task, the systems it touches and your acceptance test. Choose the engagement that fits your buying process.",
    )
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
        "Request an estimate",
        buttons(
            (
                EMAIL + "?subject=Project%20estimate%20inquiry",
                "Request pricing by email",
            ),
            ("/resources/project-brief/", "Prepare a project brief"),
        ),
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
    + section(
        "Take a copy",
        buttons(
            (
                "/downloads/ridgefolio-capabilities.pdf",
                "Download capability statement (PDF)",
            )
        ),
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
        "Check off each item as your team verifies it. Download your marked copy before closing the tab.",
    )
    + section(
        "Launch review",
        f'<div id="checklist">{checks}<p role="status" id="check-count">0 of {len(CHECKS)} checked</p><button data-download-checks>Download checklist</button></div>',
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
        f'<form id="brief">{fields}<button>Download my brief</button><p id="brief-state" role="status"></p></form>',
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
        '<form action="/search/" id="search-form"><label for="query">Search pages</label><input name="q" id="query" type="search" placeholder="Try workflow, migration or brief"><button>Search</button></form><p id="results-count" role="status"></p><div id="site-results"></div>',
    ),
    "Search",
)


def nav(path):
    links = [
        ("/services/", "Services"),
        ("/demos/", "Demos"),
        ("/work/", "Selected work"),
        ("/resources/", "Resources"),
        ("/practice/", "Practice"),
        ("/search/", "Search"),
    ]
    items = "".join(
        f'<a href="{("#work" if u == "/work/" and path == "/" else u)}"'
        + (' aria-current="page"' if path == u else "")
        + ">"
        + t
        + "</a>"
        for u, t in links
    )
    return (
        '<header class="top"><div class="wrap nav-shell">'
        + a("/", logo, "brand")
        + '<button class="menu-button" aria-controls="site-nav" aria-expanded="false">Menu</button><nav id="site-nav" aria-label="Main navigation">'
        + items
        + a(BOOK, arrow("Book a call"), "nav-cta")
        + "</nav></div></header>"
    )


foot = (
    '<footer><div class="wrap"><div class="footer-top"><div>'
    + a("/", logo, "brand")
    + "<p>Independent software engineering<br>California</p></div><div><strong>Explore</strong>"
    + a("/services/", "Services")
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
        + ('<script src="/assets/ridge.js" defer></script>' if path == "/" else "")
    )
    out.write_text(f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="index,follow"><title>{escape(title)} | Ridgefolio</title><meta name="description" content="{escape(desc, quote=True)}"><link rel="canonical" href="{BASE}{path}"><meta property="og:title" content="{escape(title, quote=True)} | Ridgefolio"><meta property="og:description" content="{escape(desc, quote=True)}"><meta property="og:url" content="{BASE}{path}"><meta property="og:type" content="website"><meta property="og:image" content="{BASE}/assets/ridge-preview.jpg"><meta name="theme-color" content="#19392d"><link rel="icon" href="/assets/favicon.svg"><link rel="stylesheet" href="/assets/ridge.css"><link rel="stylesheet" href="/assets/site.css">{scripts}</head>
<body><a class="skip" href="#main">Skip to content</a>{nav(path)}<main id="main">{crumb}{body}{contact}</main>{foot}</body></html>''')
(PUBLIC / "assets/search.json").write_text(json.dumps(index, ensure_ascii=False))
(PUBLIC / "sitemap.xml").write_text(
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    + "".join(f"<url><loc>{BASE}{p}</loc></url>" for p in pages)
    + "</urlset>"
)
print(f"Rendered {len(pages)} pages.")
