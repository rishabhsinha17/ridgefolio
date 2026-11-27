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
        services = [
            ("permit", "Community event permit", "Permits", "Community services", "For a gathering in a park or public square.",
             ["Event name and proposed location", "Entrance or assembly point", "A short description of the event"], "festival gathering event application public square"),
            ("roads", "Street repair request", "Roads", "Street maintenance", "Report a pothole or damaged street surface.",
             ["Nearest street or intersection", "Direction of travel", "A description of the damaged surface"], "road street potholes damage maintenance pavement"),
            ("parks", "Park shelter reservation", "Parks", "Parks and recreation", "Reserve a picnic shelter for a community activity.",
             ["Preferred park and shelter", "Proposed date and an alternate date", "Estimated group size"], "parks picnic pavilion reserve booking shelter reservation"),
            ("records", "Public records request", "Records", "Records office", "Identify public records you want to inspect.",
             ["A description of the records", "Approximate date range", "Preferred delivery format"], "records record documents documents copy archive disclosure"),
        ]
        paths = {
            "permit": "M6 5h12v15H6z M9 3v4m6-4v4M9 11h6m-6 4h4",
            "roads": "m5 20 4-16m10 16L15 4m-3 0v3m0 3v4m0 3v3",
            "parks": "M3 11 12 4l9 7H3zm3 0v9m12-9v9M8 16h8m-6 0-1 4m5-4 1 4",
            "records": "M4 7h6l2 2h8v10H4z M6 5h6l2 2h4",
        }
        cards = []
        for key, name, topic, office, desc, requirements, terms in services:
            items = "".join(f"<li>{item}</li>" for item in requirements)
            action = '<a class="demo-action" href="/demos/permit-desk/#workspace">Try the permit application</a>' if key == "permit" else ""
            cards.append(
                f'<details class="finder-card" data-service="{key}" data-topic="{topic}" data-keywords="{terms}" name="finder-service">'
                f'<summary><span class="service-symbol" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="{paths[key]}"/></svg></span><span class="service-label"><small>{topic}</small>'
                f'<strong>{name}</strong></span><span class="disclosure-glyph" aria-hidden="true"></span></summary>'
                f'<div class="service-detail"><p>{desc}</p><div class="service-prep"><h4>What to prepare</h4><ul>{items}</ul></div>'
                f'<p class="service-owner">Example routing <b>{office}</b></p><div class="record-actions">{action}'
                f'<button class="demo-secondary checklist-download" type="button" hidden>Download checklist</button></div></div></details>'
            )
        topics = ["All topics", "Permits", "Roads", "Parks", "Records"]
        tabs = "".join(f'<button type="button" data-topic="{name}" aria-pressed="{str(i == 0).lower()}">{name}</button>' for i, name in enumerate(topics))
        return (
            '<div class="workspace-head"><div><span class="demo-eyebrow">Resident services</span><h3>Service directory</h3></div><span class="workspace-note">Fictional service guide</span></div>'
            '<div class="workspace-content"><div class="finder-tools" hidden><label for="service-query">Search services</label>'
            '<div class="finder-search"><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="m15 15 6 6" stroke="currentColor" stroke-width="1.7"/></svg>'
            '<input id="service-query" type="search" placeholder="Search by service or keyword" maxlength="100" autocomplete="off"></div>'
            f'<div class="topic-switch" role="group" aria-label="Filter by topic">{tabs}</div></div>'
            '<p id="match-count" role="status" aria-live="polite">4 matching services</p><div id="finder-results">' + "".join(cards) + '</div>'
            '<div class="finder-empty" hidden><strong>No services match those filters.</strong><p>Try another keyword or browse the full directory.</p>'
            '<button type="button" class="demo-secondary" id="finder-clear">Show all services</button></div></div>'
        )
    if slug == "permit-desk":
        return (
            '<div class="workspace-head"><div><span class="demo-eyebrow">Community event permit</span><h3>Permit desk</h3></div><span class="workspace-note">Fictional case · This tab only</span></div>'
            '<noscript><p class="workspace-offline">The interactive review needs JavaScript. <a href="/downloads/sample-permit-receipt.txt">Read a completed sample permit receipt.</a></p></noscript>'
            '<div class="permit-live" hidden><ol class="permit-progress" aria-label="Permit stage">'
            '<li data-stage="intake">Intake</li><li data-stage="review">Staff review</li><li data-stage="decision">Decision</li></ol>'
            '<div class="desk-grid"><section class="desk-panel" aria-labelledby="desk-heading"><span class="demo-eyebrow" id="desk-role">Resident view</span>'
            '<h2 id="desk-heading" tabindex="-1">Application intake</h2><div id="desk-step"></div></section>'
            '<aside class="receipt" aria-label="Case file"><div class="file-heading"><span class="demo-eyebrow">Case file</span><b>RF-101</b></div>'
            '<p id="desk-status" role="status"></p><h3>Case history</h3><ol id="desk-history"></ol>'
            '<button type="button" class="demo-secondary" id="desk-reset">Reset demo</button></aside></div></div>'
        )
    records = [
        ("RF-201", "Central", "Permit review", 4, "Review a community event permit and record the staff decision.", [1, 2, 1]),
        ("RF-202", "North", "Road repair", 9, "Inspect a damaged road surface and complete the repair.", [2, 6, 1]),
        ("RF-203", "South", "Park reservation", 2, "Check shelter availability and issue a reservation confirmation.", [.5, 1, .5]),
        ("RF-204", "Central", "Records request", 6, "Locate the requested records and prepare a response.", [1, 4, 1]),
        ("RF-205", "South", "Road repair", 8, "Inspect a reported pothole and record the completed road repair.", [1, 6, 1]),
        ("RF-206", "North", "Permit review", 3, "Check a permit correction and complete the final review.", [.5, 2, .5]),
    ]
    lines = []
    for key, district, service, hours, note, parts in records:
        details = "".join(f'<div><dt>{label}</dt><dd>{value:g} h</dd></div>' for label, value in zip(("Intake", "Delivery", "Closeout"), parts))
        lines.append(
            f'<tr class="ledger-record" data-key="{key}" data-district="{district}" data-service="{service}" data-hours="{hours}">'
            f'<th scope="row"><span class="plain-record">{key}</span><button type="button" class="record-toggle" aria-expanded="false" aria-controls="detail-{key}" hidden>{key}</button></th>'
            f'<td>{district}</td><td>{service}</td><td class="hour-value">{hours}</td></tr>'
            f'<tr id="detail-{key}" class="ledger-detail" hidden><td colspan="4"><strong>{note}</strong><dl>{details}</dl></td></tr>'
        )
    csv = "Record,District,Service,Hours%0D%0A" + "".join(",".join(str(x) for x in row[:4]).replace(" ", "%20") + "%0D%0A" for row in records)
    service_options = "".join(f"<option>{service}</option>" for service in sorted({r[2] for r in records}))
    initial_chart = "".join(
        f'<div class="district-bar"><span>{district}</span><div aria-hidden="true"><i style="width:{hours / 12:.4%}"></i></div><b>{hours} h</b></div>'
        for district, hours in [("Central", 10), ("North", 12), ("South", 10)]
    )
    return (
        '<div class="workspace-head"><div><span class="demo-eyebrow">Operations reporting</span><h3>Service ledger</h3></div><span class="workspace-note">Fictional reporting period</span></div>'
        '<div class="workspace-content"><div class="ledger-filters" hidden><div><label for="district">District</label><select id="district"><option>All districts</option><option>North</option><option>Central</option><option>South</option></select></div>'
        f'<div><label for="ledger-service">Service</label><select id="ledger-service"><option>All services</option>{service_options}</select></div>'
        '<div><label for="ledger-sort">Sort records</label><select id="ledger-sort"><option value="record">Record number</option><option value="most">Most hours first</option><option value="fewest">Fewest hours first</option></select></div></div>'
        '<div class="ledger-overview"><div class="ledger-total"><span class="demo-eyebrow">Service hours</span><strong id="hours-total">32</strong>'
        '<p id="ledger-summary" role="status">6 records · 32 service hours</p></div><figure class="hours-figure"><figcaption>Hours by district</figcaption>'
        f'<div id="ledger-chart">{initial_chart}</div></figure></div>'
        '<div class="table-heading"><h4>Record register</h4><button id="export-ledger" class="demo-secondary" type="button" hidden>Download filtered CSV</button>'
        f'<noscript><a href="data:text/csv;charset=utf-8,{csv}" download="sample-service-ledger.csv">Download all records</a></noscript></div>'
        '<div class="scroll-table"><table><caption class="workspace-sr">Fictional service records</caption><thead><tr><th scope="col">Record</th><th scope="col">District</th><th scope="col">Service</th><th scope="col">Hours</th></tr></thead>'
        '<tbody id="ledger-rows">' + "".join(lines) + '</tbody></table></div>'
        '<div id="ledger-empty" class="ledger-empty" hidden><strong>No records in this view.</strong><p>Change a district or service to find matching work.</p><button type="button" class="demo-secondary" id="ledger-clear">Clear filters</button></div></div>'
    )


for slug, title, desc, tone in DEMOS:
    body = (
        intro("Interactive demo", title, desc)
        + section(
            "Demo workspace",
            f'<div id="workspace" class="workspace demo-workspace {tone}" data-demo="{slug}">'
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
        '<form action="/search/" id="search-form"><label for="query">Search pages</label><input name="q" id="query" type="search" placeholder="Try workflow, migration or brief"><button>Search</button></form><p id="results-count" role="status"></p><div id="site-results"></div><noscript><p>Site search needs JavaScript. Browse <a href="/services/">services</a>, <a href="/work/">selected work</a> or <a href="/resources/">buyer resources</a>.</p></noscript>',
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
    demo_css = '<link rel="stylesheet" href="/assets/demo-workspaces.css">' if path in {
        "/demos/finder/", "/demos/permit-desk/", "/demos/service-ledger/",
    } else ""
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
        f'<div id="top" class="main-wrap{(" " + family) if family else ""}"{landmark}>{navigation.squares()}{navigation.nav(path)}'
        f'{body}{navigation.footer(path)}{sheet}</div>'
    )
    page_body = page_body.replace("↗", LINK_ARROW)
    out.write_text(f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="{robots}"><title>{escape(title)} | Ridgefolio</title><meta name="description" content="{escape(desc, quote=True)}"><link rel="canonical" href="{BASE}{path}"><meta property="og:title" content="{escape(title, quote=True)} | Ridgefolio"><meta property="og:description" content="{escape(desc, quote=True)}"><meta property="og:url" content="{BASE}{path}"><meta property="og:type" content="website"><meta property="og:image" content="{BASE}{social_image}"><meta property="og:image:alt" content="{escape(social_alt, quote=True)}"><meta name="theme-color" content="#19392d"><link rel="icon" href="/assets/favicon-32.png" sizes="32x32" type="image/png"><link rel="icon" href="/assets/favicon.svg" sizes="any" type="image/svg+xml"><link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">{early_drafts}<link rel="preload" as="font" type="font/woff2" href="/assets/fonts/source-serif-4-400.woff2" crossorigin><link rel="preload" as="font" type="font/ttf" href="/assets/fonts/manrope-variable.ttf" crossorigin><link rel="stylesheet" href="/assets/ridge.css"><link rel="stylesheet" href="/assets/site.css">{case_css}<link rel="stylesheet" href="/assets/showcase.css">{interior_css}<link rel="stylesheet" href="/assets/ref-shell.css"><link rel="stylesheet" href="/assets/motion-icons.css">{demo_css}{scripts}</head>
<body id="{template_id}" class="rz-page {body_class}"><a class="skip" href="#{target}">Skip to content</a>{page_body}</body></html>''')
(PUBLIC / "assets/search.json").write_text(json.dumps(index, ensure_ascii=False))
(PUBLIC / "sitemap.xml").write_text(
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    + "".join(f"<url><loc>{BASE}{p}</loc></url>" for p in pages if p != not_found)
    + "</urlset>"
)
print(f"Rendered {len(pages) - 1} pages and the 404 page.")
