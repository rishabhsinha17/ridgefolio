"""Documentary plates and records for Ridgefolio’s interior pages."""

from html import escape

PHOTOS = {
    "public-terminals": ("Public computers at the Patterson Park Branch, Baltimore", "Carol M. Highsmith", "https://www.loc.gov/item/2012630164/"),
    "reading-by-touch": ("A reader using braille, 1931 or 1932", "Harris & Ewing", "https://www.loc.gov/item/2016889835/"),
    "innovation-center": ("Route 9 Library and Innovation Center, New Castle, Delaware", "Carol M. Highsmith", "https://www.loc.gov/item/2018699890/"),
    "kiosk": ("Information kiosk on Market Street, San Francisco", "Carol M. Highsmith", "https://www.loc.gov/item/2011633078/"),
    "public-market": ("Old Town Farmers’ Market, Alexandria", "Carol M. Highsmith", "https://www.loc.gov/item/2020724970/"),
    "library-interior": ("Stairway and stacks, Allen County Public Library", "Carol M. Highsmith", "https://www.loc.gov/resource/highsm.41101/"),
    "library-elevation": ("Design for the Carnegie library in Taunton, Massachusetts", "Albert Randolph Ross", "https://www.loc.gov/item/96514755/"),
    "railway-plan": ("Cable Car Powerhouse and Barn, San Francisco. First-floor plan", "Historic American Engineering Record", "https://www.loc.gov/resource/hhh.ca1270.sheet/?sp=4"),
    "service-areas": ("Libraries of Washington, D.C., mapped by collection size in 1926", "Library of Congress, Map Division", "https://www.loc.gov/item/87694100/"),
}


def responsive(stem, sizes="100vw"):
    root = f"/assets/interior-art/{stem}"
    widest = 5070 if stem in ("kiosk", "reading-by-touch") else 5184
    sources = ", ".join(f"{root}-{width}.webp {width}w" for width in (960, 1536, 2560, 3840, widest))
    return f'src="{root}-3840.webp" srcset="{sources}" sizes="{sizes}"'


def photo(stem, *, sizes="100vw", css="full-img", lazy=False):
    title = PHOTOS[stem][0]
    loading = ' loading="lazy"' if lazy else ""
    return f'<img class="{css}" {responsive(stem, sizes)} width="3840" height="2560" alt="{escape(title, quote=True)}"{loading}>'


def credit(stem):
    title, author, url = PHOTOS[stem]
    return f'<a class="documentary-credit" href="{escape(url, quote=True)}">{escape(title)} <span>· {escape(author)}</span></a>'


def record(name):
    # These measurements and work products can be reproduced in the public tools.
    if name == "ledger":
        return (
            '<figure class="field-record ledger-record"><figcaption>North district · Fictional service records</figcaption>'
            '<p class="record-total">12 <span>service hours</span></p><dl>'
            '<div><dt>RF-202 · Road repair</dt><dd>9 h</dd></div>'
            '<div><dt>RF-206 · Permit review</dt><dd>3 h</dd></div></dl></figure>'
        )
    if name == "checklist":
        return (
            '<figure class="field-record checklist-record"><figcaption>Website launch · Example review</figcaption>'
            '<p class="record-total">3 <span>of 6 verified</span></p><ul>'
            '<li>Content and redirects</li><li>Keyboard and assistive technology</li><li>Cutover and recovery</li>'
            '</ul></figure>'
        )
    if name == "brief":
        return (
            '<figure class="field-record brief-record"><figcaption>From the completed project brief</figcaption>'
            '<blockquote>“Check the event, corrected location, review note and approval against the case history.”</blockquote>'
            '<p>Community event permit · Acceptance walkthrough</p></figure>'
        )
    raise ValueError(name)
