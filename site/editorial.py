"""Public artifacts used in the work archive and buyer library."""

from html import escape

KV = "https://github.com/ovg-project/kvcached"
PAPER = "https://arxiv.org/abs/2610.37679"
PDF = "/downloads/ridgefolio-capabilities.pdf"
RECEIPT = "/downloads/sample-permit-receipt.txt"
EXAMPLE = "/downloads/permit-desk-project-brief.txt"
LOC = "https://www.loc.gov/item/2013630463/"

PHOTO = f'''<figure class="civic-photo"><img src="/assets/editorial/civic-center-1440.webp"
 srcset="/assets/editorial/civic-center-768.webp 768w, /assets/editorial/civic-center-1440.webp 1440w"
 sizes="(max-width: 700px) 100vw, 55vw" width="1440" height="960" fetchpriority="high"
 alt="People walking beneath a double row of trees in front of San Francisco City Hall">
 <figcaption><span>San Francisco Civic Center, 2012</span><a href="{LOC}">Carol M. Highsmith / Library of Congress</a></figcaption></figure>'''


def release_cover():
    return """<div class="release-cover"><span>kvcached / releases</span>
    <strong>v0.1.6</strong><small>3 October 2026</small></div>"""


def cover(slug):
    if slug == "industrial-parks":
        return '<img src="/assets/editorial/industrial-parks.webp" width="1460" height="790" loading="lazy" alt="Map of Indonesian industrial parks, with a concentration of markers on Java">'
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
    return (
        '<div class="work-gallery">'
        + "".join(
            f'<article><a href="/work/{slug}/"><div class="work-cover">{cover(slug)}</div><p class="credit">{WORK_CAPTIONS[slug]}</p><h3>{WORK_TITLES[slug]} <span aria-hidden="true">↗</span></h3></a></article>'
            for slug, *_ in cases
        )
        + "</div>"
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
    if path == "/work/industrial-parks/":
        return "/assets/editorial/archipelago-parks.webp", "Map of industrial parks in Indonesia"
    if path == "/work/":
        return (
            "/assets/editorial/industrial-parks.webp",
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
