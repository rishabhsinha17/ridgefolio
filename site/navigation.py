"""Shared navigation and footer for the Ridgefolio public site."""

from html import escape

from content import DEMOS, RESOURCES, SERVICES
from editorial import WORK_TITLES

BOOK = "https://cal.com/ridgefolio/intro"
EMAIL = "rishabh@ridgefolio.com"
WORDMARK = '<svg viewBox="0 0 44 32" aria-hidden="true" focusable="false"><path d="M2 29 15 5l9 16 6-10 12 18M9 29l6-11 6 11M27 29l3-6 4 6"/></svg><span>ridgefolio<span class="rf-dot">.</span></span>'
PRIMARY = [
    ("/work/", "Selected work"),
    ("/demos/", "Demos"),
    ("/services/", "Services"),
    ("/practice/", "The practice"),
    ("/resources/", "Resources"),
    ("/pricing/", "Pricing"),
]
DIRECTORY = [
    ("Services", [("/services/" + s["slug"] + "/", s["title"]) for s in SERVICES]),
    ("Demos", [("/demos/" + slug + "/", title) for slug, title, *_ in DEMOS]),
    ("Project notes", [("/work/" + slug + "/", title) for slug, title in WORK_TITLES.items()]),
    (
        "For buyers",
        [("/resources/" + slug + "/", title) for slug, title, *_ in RESOURCES]
        + [("/for/agencies/", "Public agencies"), ("/for/partners/", "Delivery partners")],
    ),
]


def link(url, title, current_path="", css=""):
    current = ' aria-current="page"' if url == current_path else ""
    class_attr = f' class="{css}"' if css else ""
    return f'<a href="{escape(url, quote=True)}"{current}{class_attr}>{escape(title)}</a>'


def links(destinations, current_path=""):
    return "<ul>" + "".join(
        f"<li>{link(url, title, current_path)}</li>" for url, title in destinations
    ) + "</ul>"


def brand():
    return f'<a class="rf-brand" href="/" aria-label="Ridgefolio home">{WORDMARK}</a>'


def nav(path):
    groups = "".join(
        f'<details class="rf-group" open><summary>{heading}</summary>{links(destinations, path)}</details>'
        for heading, destinations in DIRECTORY
    )
    quick_links = "".join(
        f"<li>{link(url, title, path)}</li>" for url, title in PRIMARY
    )
    return f'''<header class="rf-header"><div class="rf-nav-wrap">
    {brand()}
    <button class="rf-menu-toggle" type="button" aria-label="Menu" aria-controls="site-nav" aria-expanded="false"><span class="rf-menu-glyph" aria-hidden="true"></span><span>Menu</span></button>
    <nav class="rf-primary" id="site-nav" aria-label="Main navigation">
    <ul class="rf-quick">{quick_links}<li><details class="rf-more"><summary>More<span class="rf-chevron" aria-hidden="true"></span></summary>
    <div class="rf-directory"><div class="rf-directory-inner"><div class="rf-directory-top"><h2>Explore Ridgefolio</h2><button class="rf-close" type="button" aria-label="Close more menu">Close <span aria-hidden="true">×</span></button></div>
    <div class="rf-columns">{groups}</div><div class="rf-directory-tools">{link("/contact/", "Contact", path)}{link("/search/", "Search the site", path)}</div></div></div></details></li></ul></nav>
    {link("/contact/", "Contact us", path, css="rf-action nav-cta")}</div>
    <dialog class="rf-contact-sheet" id="rf-contact-sheet" aria-labelledby="rf-contact-title">
    <form method="dialog"><button class="rf-sheet-close" aria-label="Close contact panel" autofocus>Close <span aria-hidden="true">×</span></button></form>
    <h2 id="rf-contact-title">Contact Ridgefolio</h2>
    <div class="rf-sheet-choices"><a href="{BOOK}">Book a 30-minute call <span aria-hidden="true">↗</span></a>
    <a href="mailto:{EMAIL}">Email Ridgefolio <span aria-hidden="true">↗</span><small>{EMAIL}</small></a>
    <a href="/contact/">Visit the contact page <span aria-hidden="true">↗</span></a></div>
    </dialog></header>'''


def footer():
    explore = links([("/work/", "Project archive"), ("/demos/", "Demos"), ("/services/", "Services"), ("/practice/", "The practice")])
    buyers = links([("/for/agencies/", "Public agencies"), ("/for/partners/", "Delivery partners"), ("/pricing/", "Scoping and pricing"), ("/resources/capabilities/", "Capability statement")])
    return f'''<footer class="rf-footer"><div class="rf-footer-inner">
    <div class="rf-footer-grid"><div class="rf-identity">{brand()}<p>Independent software engineering<br>California</p></div>
    <nav aria-label="Explore Ridgefolio"><h2>Explore</h2>{explore}</nav>
    <nav aria-label="Resources for buyers"><h2>For buyers</h2>{buyers}</nav>
    <div class="rf-footer-contact"><h2>Get in touch</h2><a class="contact-email" href="mailto:{EMAIL}">{EMAIL}</a><a class="rf-footer-book" href="{BOOK}">Book a call <span aria-hidden="true">↗</span></a></div></div>
    <div class="rf-colophon"><small>© 2026 Ridgefolio LLC</small><div>{link("/contact/", "Contact")}{link("/search/", "Search the site")}</div></div></div></footer>'''
