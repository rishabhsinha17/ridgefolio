"""Public artifacts used in the work archive and buyer library."""

from html import escape

KV = "https://github.com/ovg-project/kvcached"
PAPER = "https://arxiv.org/abs/2610.37679"
PDF = "/downloads/ridgefolio-capabilities.pdf"
RECEIPT = "/downloads/sample-permit-receipt.txt"
EXAMPLE = "/downloads/permit-desk-project-brief.txt"


def release_cover():
    return """<div class="release-cover"><span>kvcached / releases</span>
    <strong>v0.1.6</strong><small>3 October 2026</small></div>"""


def cover(slug):
    if slug == "industrial-parks":
        return '<img src="/assets/editorial/industrial-parks.webp" width="1460" height="790" loading="eager" alt="Map of Indonesian industrial parks, with a concentration of markers on Java">'
    if slug == "evaluation":
        return '<div class="paper-cover"><img src="/assets/editorial/paper-detail.webp" width="772" height="567" loading="eager" alt="First page of Exposure Is Not Commitment by Rishabh Sinha"></div>'
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


def chart_plate(stem, alt, *, compact=False):
    sizes = {"monitor-strata": (900, 530, 390, 508), "monitor-confidence": (900, 860, 365, 738),
             "regional-status": (900, 600, 400, 530)}
    wide, tall, narrow, compact_height = sizes[stem]
    src = "/assets/project-evidence/" + stem
    media = "all" if compact else "(max-width: 640px)"
    return (f'<picture class="chart-plate"><source media="{media}" srcset="{src}-compact.svg" '
            f'width="{narrow}" height="{compact_height}"><img class="full-img" src="{src}.svg" '
            f'width="{wide}" height="{tall}" alt="{escape(alt, quote=True)}"></picture>')


def project_exhibit(slug):
    if slug == "evaluation":
        stem = "monitor-strata"
        alt = "Commitment-trained probes score 0.853 on Qwen, 0.896 on Mistral and 0.912 on OLMo."
        return ('<figure class="project-plate research-figure">'
                f'<a href="/assets/project-evidence/{stem}.svg">{chart_plate(stem, alt, compact=True)}</a>'
                '<figcaption>Adapted from Figure 1 of Rishabh Sinha’s <cite>Exposure Is Not Commitment</cite>. '
                '<a href="https://arxiv.org/pdf/2610.37679#page=3">Read the original figure</a> · '
                '<a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></figcaption></figure>')
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


def library():
    return f'''<div class="library"><a class="document-thumb" href="{PDF}"><img src="/assets/editorial/capability-page.webp" width="618" height="800" alt="Preview of the one-page Ridgefolio capability statement" loading="eager"></a><div><h2>Capability statement</h2><p>A one-page overview of services, delivery arrangements and founder experience to share with a project team.</p><a class="text-action" href="{PDF}">Open the one-page PDF ↗</a><a class="subtle-link" href="/resources/capabilities/">Read the HTML version</a></div></div>'''


def estimate_link(email):
    return email + "?subject=Project%20estimate%20inquiry"


def social_image(path):
    if path == "/":
        return "/assets/home-evidence/homepage-share.jpg", "Ridgefolio’s homepage with its public agency project gallery"
    if path == "/work/industrial-parks/":
        return "/assets/cgs-atlas/morowali-share.jpg", "Daylight at Morowali Industrial Park in Central Sulawesi, Indonesia"
    photographic_previews = {
        "/services/": ("public-terminals", "Public computer terminals at the Patterson Park library"),
        "/services/websites/": ("public-terminals", "Public computer terminals at the Patterson Park library"),
        "/services/workflows/": ("public-market", "Shoppers at Alexandria’s Old Town Farmers’ Market"),
        "/demos/finder/": ("kiosk", "Information kiosk on Market Street in San Francisco"),
        "/demos/service-ledger/": ("service-areas", "Map of Washington, D.C., library collections in 1926"),
        "/resources/": ("library-interior", "Interior of the Allen County Public Library"),
        "/resources/project-brief/": ("library-elevation", "Historic architectural elevation of Taunton’s Carnegie library"),
        "/resources/launch-checklist/": ("reading-by-touch", "A woman reading braille in an archival photograph"),
        "/pricing/": ("railway-plan", "Historic measured plan of San Francisco’s cable railway powerhouse"),
        "/for/agencies/": ("innovation-center", "Daylight at the Route 9 Library and Innovation Center"),
        "/for/partners/": ("review-changes", "Published changes to the kvcached worker cleanup workflow"),
        "/work/open-source/": ("review-changes", "The reviewed changes in kvcached pull request 480"),
    }
    if path in photographic_previews:
        source, description = photographic_previews[path]
        return f"/assets/interior-art/{source}-1536.webp", description
    if path in ("/work/", "/services/data/"):
        return "/assets/cgs-atlas/overview-1536.webp", "Industrial park locations and regional geography of Indonesia"
    if path == "/work/evaluation/":
        return (
            "/assets/editorial/monitor-results.webp",
            "Activation-probe AUROC by model and training contrast, adapted from Figure 1",
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
