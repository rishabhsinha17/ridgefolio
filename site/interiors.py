"""Arrange Ridgefolio's service catalogue, working examples and project archive."""

from html import escape

from content import DEMOS, SERVICES


DOWN_ARROW = (
    '<svg aria-hidden="true" focusable="false" width="1em" height="1em" viewBox="0 0 18 18" '
    'fill="none" stroke="currentColor" stroke-width="1.4"><path d="M9 2v14m-5-5 5 5 5-5"/></svg>'
)


def showcase(demos):
    """Present the three service areas using screenshots of the actual demos."""
    demo_info = {slug: (name, description) for slug, name, description, _ in DEMOS}
    sections = []
    for service in SERVICES:
        demo = service["demo"]
        demo_title, demo_description = demo_info[demo]
        service_url = f'/services/{service["slug"]}/'
        demo_url = f"/demos/{demo}/"
        title = demo_title if demos else service["title"]
        description = demo_description if demos else service["intro"]
        primary = (demo_url, f"Open {demo_title.lower()}") if demos else (service_url, "Explore the service")
        secondary = (service_url, "Service scope") if demos else (demo_url, f"Try {demo_title.lower()}")
        sections.append(
            f'<article class="rv-product-band"><div class="wrap rv-product-grid">'
            f'<div class="rv-product-copy"><h2>{escape(title)}</h2>'
            f'<p>{escape(description)}</p><div class="rv-inline-actions">'
            f'<a href="{primary[0]}">{escape(primary[1])} <span aria-hidden="true">↗</span></a>'
            f'<a href="{secondary[0]}">{escape(secondary[1])} <span aria-hidden="true">↗</span></a>'
            f'</div></div><a class="rv-product-image" href="{demo_url}" aria-label="Open the {escape(demo_title.lower())} demonstration">'
            f'<img src="/assets/previews/{demo}.jpg" width="954" height="600" loading="lazy" alt="{escape(demo_title)} demonstration interface"></a>'
            f'</div></article>'
        )
    return '<div class="rv-products" id="catalogue">' + "".join(sections) + "</div>"


def catalogue_actions(label):
    return (
        f'<div class="rv-inline-actions"><a href="#catalogue">{escape(label)} {DOWN_ARROW}</a>'
        '<a href="/work/">Selected work <span aria-hidden="true">↗</span></a></div>'
    )


def adapt(path, body):
    """Apply a family-specific wrapper to the generated page."""
    if path == "/":
        return body
    if path in ("/services/", "/demos/"):
        family = "rv-product-index"
    elif path == "/work/":
        family = "rv-portfolio"
    elif path.startswith("/demos/") or path in ("/search/", "/resources/project-brief/", "/resources/launch-checklist/"):
        family = "rv-tool"
    elif path == "/work/industrial-parks/":
        family = "rv-long-case"
    else:
        family = "rv-reading"
    return f'<div class="rv-content {family}">{body}</div>'
