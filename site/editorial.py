"""Public artifacts used in the work archive and buyer library."""

from html import escape

KV = "https://github.com/ovg-project/kvcached"
PAPER = "https://arxiv.org/abs/2610.37679"
PDF = "/downloads/ridgefolio-capabilities.pdf"
RECEIPT = "/downloads/sample-permit-receipt.txt"
EXAMPLE = "/downloads/permit-desk-project-brief.txt"
LOC = "https://www.loc.gov/item/2013630463/"

ARCHITECTURE = f'''<figure class="architectural-plate"><div class="photo-pair">
    <div class="dome-view"><img src="/assets/editorial/city-hall-dome-1050.webp" srcset="/assets/editorial/city-hall-dome-600.webp 600w, /assets/editorial/city-hall-dome-1050.webp 1050w" sizes="(max-width:700px) 57vw, 31vw" width="1050" height="1324" fetchpriority="high" alt="The dome and portico of San Francisco City Hall"></div>
    <div class="promenade-view"><img src="/assets/editorial/civic-center-768.webp" width="768" height="512" alt="A walk through the trees at Civic Center Plaza"></div>
    </div><figcaption><span>San Francisco City Hall &amp; Civic Center Plaza</span><span>Carol M. Highsmith · <a href="https://www.loc.gov/item/2011630953/">Dome</a> / <a href="{LOC}">Plaza</a></span></figcaption></figure>'''


def release_cover():
    return """<div class="release-cover"><span>kvcached / releases</span>
    <strong>v0.1.6</strong><small>3 October 2026</small></div>"""


def cover(slug):
    if slug == "evaluation":
        return '<div class="paper-cover"><img src="/assets/editorial/paper-detail.webp" width="772" height="567" loading="lazy" alt="First page of Exposure Is Not Commitment by Rishabh Sinha"></div>'
    return release_cover()


WORK_TITLES = {
    "industrial-parks": "Mapping Indonesia’s industrial parks",
    "open-source": "What a software release leaves behind",
    "evaluation": "Testing what an AI monitor can tell",
}
WORK_CAPTIONS = {
    "industrial-parks": "University of Maryland · Research dashboard",
    "open-source": "kvcached · Open-source contribution",
    "evaluation": "Rishabh Sinha · Research paper",
}


def work_gallery(cases):
    feature = """<a class="feature-case" href="/work/industrial-parks/"><div class="feature-atlas"><img src="/assets/editorial/archipelago-parks.webp" width="1440" height="660" loading="lazy" alt="Map of Indonesian industrial park locations"></div><div class="feature-note"><span class="tag">University of Maryland · Case study</span><h3>Mapping Indonesia’s industrial parks</h3><p>How a research team’s spreadsheet became a public map and a set of tools for its next update.</p><span class="feature-link">Read the case study ↗</span></div></a>"""
    others = "".join(
        f'<a class="archive-entry" href="/work/{slug}/"><div class="work-cover">{cover(slug)}</div><div><p class="credit">{WORK_CAPTIONS[slug]}</p><h3>{WORK_TITLES[slug]} <span aria-hidden="true">↗</span></h3></div></a>'
        for slug, *_ in cases
        if slug != "industrial-parks"
    )
    return (
        '<div class="work-edition">'
        + feature
        + '<div class="archive-pair">'
        + others
        + "</div></div>"
    )


def project_exhibit(slug):
    if slug == "evaluation":
        return f"""<figure class="project-plate research-figure"><a href="/assets/editorial/monitor-results.webp"><img src="/assets/editorial/monitor-results.webp" width="862" height="356" alt="Figure 1 shows how monitor scores change with training population across Qwen, Mistral and OLMo. The comparable-cases scores are 0.853, 0.896 and 0.912."></a><figcaption>Figure 1 from <cite>Exposure Is Not Commitment</cite>, page 3. Select the figure to open it at full size. <a href="https://arxiv.org/pdf/2610.37679">Read the full paper (PDF)</a>.</figcaption></figure>"""
    return f'''<div class="release-plate">{release_cover()}<div class="release-records"><h2>In this release</h2>
    <p><a href="{KV}/pull/480">#480 · Clean up worker socket directories</a><small>Merged 23 September 2026</small></p>
    <p><a href="{KV}/pull/482">#482 · Release shared memory at shutdown</a><small>Merged 24 September 2026</small></p>
    <span>Both changes by Rishabh Sinha. <a href="{KV}/releases/tag/v0.1.6">View release</a>.</span></div></div>'''


EXHIBIT_COPY = {
    "open-source": (
        "Why these changes matter",
        "When an engine shuts down, its temporary files and memory should go with it. The two changes shown here address different resources left behind during shutdown. Each linked review includes the proposed change, discussion and final diff.",
    ),
    "evaluation": (
        "What the comparison found",
        "On the primary Qwen experiment, the monitor scored 0.853 AUROC and a trained text baseline scored 0.855. The paper shows how changing which examples enter the test changes what that score tells a reviewer.",
    ),
}


def directory(items):
    return (
        '<div class="directory">'
        + "".join(
            f'<a href="{escape(url, quote=True)}"><span class="dir-name">{name}</span><span class="dir-copy">{desc}</span><span class="dir-arrow" aria-hidden="true">↗</span></a>'
            for url, name, desc in items
        )
        + "</div>"
    )


def demo_gallery(demos):
    return (
        '<div class="demo-gallery">'
        + "".join(
            f'<a href="/demos/{slug}/"><img src="/assets/previews/{slug}.jpg" loading="lazy" width="954" height="600" alt=""><div><h3>{title}</h3><p>{desc}</p><span>Open demo ↗</span></div></a>'
            for slug, title, desc, _ in demos
        )
        + "</div>"
    )


def library():
    return f'''<div class="library"><a class="document-thumb" href="{PDF}"><img src="/assets/editorial/capability-page.webp" width="618" height="800" alt="Preview of the one-page Ridgefolio capability statement" loading="lazy"></a><div><h2>Capability statement</h2><p>A one-page overview of services, delivery arrangements and founder experience to share with a project team.</p><a class="text-action" href="{PDF}">Open the one-page PDF ↗</a><a class="subtle-link" href="/resources/capabilities/">Read the HTML version</a></div></div>'''


def estimate_link(email):
    return email + "?subject=Project%20estimate%20inquiry"


def social_image(path):
    if path in ("/work/", "/work/industrial-parks/"):
        return (
            "/assets/editorial/archipelago-parks.webp",
            "Map of industrial parks in Indonesia",
        )
    if path == "/work/evaluation/":
        return (
            "/assets/editorial/monitor-results.webp",
            "Figure from the published research paper",
        )
    if path in ("/resources/", "/resources/capabilities/"):
        return (
            "/assets/editorial/capability-page.webp",
            "Ridgefolio capability statement",
        )
    if path == "/practice/":
        return "/assets/editorial/founder.webp", "Rishabh Sinha"
    for slug, service, label in (
        ("finder", "websites", "Service finder"),
        ("permit-desk", "workflows", "Permit desk"),
        ("service-ledger", "data", "Service ledger"),
    ):
        if path in (f"/demos/{slug}/", f"/services/{service}/"):
            return f"/assets/previews/{slug}.jpg", label + " interactive demonstration"
    return (
        "/assets/editorial/civic-center-1440.webp",
        "San Francisco Civic Center, photographed by Carol M. Highsmith",
    )


def audience_artifact(slug):
    if slug == "partners":
        return f'''<a class="partner-document" href="{PDF}"><img src="/assets/editorial/capability-page.webp" width="618" height="800" alt="Ridgefolio LLC capability statement"><span>Capability statement · 1-page PDF ↗</span></a>'''
    return f'''<figure class="receipt-facsimile"><figcaption>Permit desk / sample output</figcaption>
    <blockquote><strong>RF-101</strong><p>Neighborhood art fair<br>Harbor Square, east entrance</p><p>Staff requested a correction: Name the entrance<br>Resident resubmitted the corrected application.<br>Staff approved the application.</p></blockquote>
    <a href="{RECEIPT}">Open the demo receipt ↗</a></figure>'''


def buying_modes():
    choices = [
        (
            "Discovery and prototype",
            "The problem is clear, but the workflow or integration still needs testing.",
            "A working example, a record of dependencies and an estimate for implementation.",
        ),
        (
            "Implementation",
            "Your team can name the deliverables and who will accept them.",
            "Milestone pricing with acceptance checks, migration boundaries and third-party fees.",
        ),
        (
            "Ongoing support",
            "You need an owner for a system already in service.",
            "A coverage window, response targets, escalation contacts and a recurring price.",
        ),
    ]
    rows = "".join(
        f'<tr><th scope="row">{name}</th><td data-label="When it fits">{fit}</td><td data-label="What you receive">{output}</td></tr>'
        for name, fit, output in choices
    )
    return (
        '<table class="buying-modes"><caption class="sr-table">Engagement comparison</caption><thead><tr><th scope="col">Engagement</th><th scope="col">When it fits</th><th scope="col">What you receive</th></tr></thead><tbody>'
        + rows
        + "</tbody></table>"
    )
