"""Shared public navigation, site directory and contact workflow."""

from html import escape

from content import DEMOS, RESOURCES, SERVICES
from editorial import WORK_TITLES

BOOK = "https://cal.com/ridgefolio/intro"
EMAIL = "rishabh@ridgefolio.com"
PRIMARY = [
    ("/work/", "Selected work"),
    ("/demos/", "Demos"),
    ("/practice/", "The practice"),
    ("/services/", "Services"),
    ("/resources/", "Resources"),
    ("/pricing/", "Pricing"),
]
QUICK_LINKS = [
    ("/for/agencies/", "Public agencies"),
    ("/for/partners/", "Delivery partners"),
    ("/practice/", "The practice"),
    ("/pricing/", "Scoping and pricing"),
    ("/search/", "Site search"),
    ("/contact/", "Contact Ridgefolio"),
]
DIRECTORY = [
    ("Services and demos", [
        ("/services/", "All services"),
        *(("/services/" + item["slug"] + "/", item["short"]) for item in SERVICES),
        ("/demos/", "All demos"),
        *(("/demos/" + slug + "/", title) for slug, title, *_ in DEMOS),
        ("/resources/project-brief/", "Project brief builder"),
    ]),
    ("Selected work and resources", [
        ("/work/", "Selected work"),
        *(("/work/" + slug + "/", title) for slug, title in WORK_TITLES.items()),
        ("/resources/", "Buyer resources"),
        *(("/resources/" + slug + "/", title) for slug, title, *_ in RESOURCES
          if slug != "project-brief"),
    ]),
]

MARK = "M2 29 15 5l9 16 6-10 12 18M9 29l6-11 6 11M27 29l3-6 4 6"
CLOSE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath d='m5 5 10 10m0-10L5 15' fill='none' stroke='%23214638' stroke-width='1.8'/%3E%3C/svg%3E"
ENVELOPE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M2 4h20v16H2zM2 5l10 8L22 5' fill='none' stroke='%23214638' stroke-width='1.5'/%3E%3C/svg%3E"
DIRECTORY_ICON = '<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" aria-hidden="true"><path d="M2 4h6l2 2h8v10H2z"/></svg>'
BARS = '<div class="bar"></div><div class="bar-2"></div>'


def placeholder(classes):
    return f'<div class="{classes}" aria-hidden="true" hidden></div>'


def link(url, title, path="", css=""):
    current = ' aria-current="page"' if url == path else ""
    class_attr = f' class="{css}"' if css else ""
    return f'<a href="{escape(url, quote=True)}"{class_attr}{current}>{escape(title)}</a>'


def squares():
    positions = [
        ("square rellax", -3), ("square square-lg rellax", -2),
        ("square square-sm rellax", -4), ("square square-sm rellax square-4", -3),
        ("square square-lg rellax square-5", -2), ("square rellax square-6", 1),
    ]
    return '<div class="squares" aria-hidden="true">' + "".join(
        f'<div class="{cls}" data-rellax-speed="{speed}"></div>' for cls, speed in positions
    ) + "</div>"


def nav(path):
    contact_url = "/contact/#contact-hero" if path == "/contact/" else "/contact/"
    nav_slot = placeholder("rz-edit-wrap nav-list-btn") if path == "/" else ""
    header_slot = placeholder("float_button_above rz-edit-wrap nav-btn center-btns") if path == "/" else ""
    quick = "".join(link(url, name, path, "btn btn-link") + "<br>" for url, name in QUICK_LINKS)
    columns = "".join(
        f'<div class="col-md-4"><p class="small text-muted">{DIRECTORY_ICON}{heading}</p>{nav_slot}'
        + "".join(link(url, name, path, "h4") for url, name in items) + "</div>"
        for heading, items in DIRECTORY
    )
    primary = "".join("<li>" + link(url, name, path) + "</li>" for url, name in PRIMARY)
    return f'''<header data-ref-header>{header_slot}<div class="container-fluid"><div class="row"><div class="col-md-12">
      <a class="logo" href="/" aria-label="Ridgefolio home"><svg viewBox="0 0 44 32" width="36" height="27" aria-hidden="true"><path id="revizelogo" class="cls-1" d="{MARK}"/></svg></a>
      <div id="mega-drop-toggle" role="button" tabindex="0" aria-label="Menu" aria-expanded="false" aria-controls="site-directory">{BARS}</div>
      <a class="btn btn-inverse open-contact-form visible-md visible-lg" href="{contact_url}">Contact us</a>
      <div class="visible-sm visible-xs pull-right link-btn"><a class="btn btn-link" href="{contact_url}">Contact us</a></div>
      <nav aria-label="Main navigation"><div class="mega-drop" id="site-directory"><div class="mega-drop-inner">
      <div id="mega-close" role="button" tabindex="0" aria-label="Close menu">Close <img alt="" src="{CLOSE}"></div><noscript><a href="#mega-drop-toggle-desktop">Close menu</a></noscript>
      <div class="row"><div class="col-md-4 social-col">{nav_slot}{quick}</div>{columns}</div></div></div>
      <ul>{primary}<li><a href="#site-directory" id="mega-drop-toggle-desktop" aria-expanded="false" aria-controls="site-directory">{BARS}More</a></li></ul></nav>
      </div></div></div></header>'''


def footer(path):
    # Give each icon a real destination and a descriptive accessible name.
    destinations = [
        ("twitter-icon", "/resources/capabilities/", "Capability statement", "M5 2h9l5 5v15H5z M14 2v6h5 M8 12h8 M8 16h8"),
        ("facebook-icon", "/work/", "Project archive", "M2 6h7l2 2h11v12H2z M2 6V4h7l2 2h9v2"),
        ("youtube-icon", "/demos/", "Interactive demos", "M2 3h20v15H2z M8 22h8 M12 18v4 M9 7l6 4-6 4z"),
        ("instagram-icon", BOOK, "Book a 30-minute call", "M3 5h18v16H3z M3 10h18 M7 2v6 M17 2v6 M7 15h4"),
        ("linkedin-icon", "mailto:" + EMAIL, "Email Ridgefolio", "M2 4h20v16H2z M2 5l10 8L22 5"),
    ]
    icons = "".join(
        f'<a href="{url}" aria-label="{title}" title="{title}"><svg width="23" height="23" viewBox="0 0 24 24" aria-hidden="true"><path id="{icon_id}" class="footer-social-icon" d="{drawing}"/></svg></a>'
        for icon_id, url, title, drawing in destinations
    )
    title_slot = placeholder("rz-edit-wrap title-btn") if path == "/" else ""
    menu_slot = placeholder("rz-edit-wrap menu-edit-btn") if path == "/" else ""
    credit_slot = placeholder("rz-edit-wrap foo-edit-btn") if path == "/" else ""
    empty_block = f'<div class="block">{title_slot}{menu_slot}</div>'
    return f'''<footer data-ref-footer><div class="container"><div class="row">
      <div class="col-md-2"><div class="block">{title_slot}<h4>Explore</h4>{menu_slot}{link("/work/", "Project archive")}{link("/services/", "Services")}{link("/practice/", "The practice")}</div>{empty_block}</div>
      <div class="col-md-2"><div class="block">{title_slot}<h4>For buyers</h4>{menu_slot}{link("/resources/", "Buyer resources")}{link("/for/agencies/", "Public agencies")}{link("/for/partners/", "Delivery partners")}</div>{empty_block}</div>
      <div class="col-md-5 col-md-offset-3"><h4 class="h2">Find a service, demo or project.</h4>
      <form id="mc-form" role="search" action="/search/" method="get"><input id="mc-email" type="search" name="q" placeholder="Search Ridgefolio" required>
      <button type="submit" class="btn btn-inverse">Search</button><label for="mc-email">Search Ridgefolio</label>
      <p class="small">Browse services, software examples and buyer resources.</p></form>
      <div class="social"><span>Quick links</span>{icons}</div></div></div></div></footer>
      <div class="copyright"><div class="container"><div class="row"><div class="col-sm-6">{credit_slot}© 2026 Ridgefolio LLC · California</div>
      <div class="col-sm-6 text-right">{menu_slot}{link("/pricing/", "Scoping and pricing")} | {link("/contact/", "Contact")} | <a class="footer-return" href="#top">Back to top</a></div></div></div></div>'''


def contact_form():
    return f'''<div class="form-style" id="contact-form" role="dialog" aria-label="Contact Ridgefolio" hidden>
      <div class="contact-form-inner"><div id="contact-form-close" role="button" tabindex="0" aria-label="Close contact form">Close <img alt="" src="{CLOSE}"></div>
      <div id="contact-results" role="status" aria-live="polite"></div>
      <div id="contact-body" role="form" aria-label="Project inquiry"><div class="form-group">
      <label for="name">Your name</label><input id="name" type="text" name="name" autocomplete="name" maxlength="120" class="input-field form-control"></div>
      <button type="button" class="no-btn open-contact-form">Continue</button>
      <div id="contact-toggle" hidden><div class="form-group"><label for="email">Reply email (optional)</label><input type="email" id="email" name="email" autocomplete="email" maxlength="254" class="input-field form-control"></div>
      <div class="form-group"><label for="phone">Phone (optional)</label><input type="tel" id="phone" name="phone" autocomplete="tel" maxlength="40" class="tel-number-field form-control"></div>
      <div class="form-group"><select id="subject" name="subject" class="select-field form-control" aria-label="Inquiry subject" required><option value="">Choose a subject</option><option>Website or service portal</option><option>Workflow or data project</option><option>Delivery partnership</option><option>Other inquiry</option></select></div>
      <div class="form-group" hidden><label for="find">How did you find us?</label><input id="find" name="find" type="text" class="form-control" disabled></div>
      <div class="form-group"><label for="comments">Project details</label><textarea id="comments" name="comments" class="form-control" maxlength="4000" required></textarea></div>
      <div id="message"></div>
      <fieldset aria-label="Email recipient"><h5 class="page-header">Email recipient</h5>
      <label for="verify" class="verify"><img alt="" src="{ENVELOPE}">Recipient</label><input id="verify" class="form-control" type="email" readonly value="{EMAIL}"></fieldset>
      <button type="button" id="submit_btn" class="btn btn-inverse">Review email draft</button>
      </div></div></div></div>'''
