"""Resident service directory for the public, fictional service finder."""

from dataclasses import dataclass
from html import escape
from urllib.parse import quote


TOPICS = {
    "community": "Parks and events",
    "streets": "Streets and lighting",
    "records": "Public records",
    "waste": "Waste collection",
}


@dataclass(frozen=True)
class Service:
    slug: str
    name: str
    topic: str
    description: str
    eligibility: str
    desk: str
    requirements: tuple[str, ...]
    next_step: str
    keywords: str


SERVICES = (
    Service(
        "community-event-permit", "Community event permit", "community",
        "Apply to hold an organized gathering in a park or public square.",
        "For an organizer planning a group activity on public grounds. A picnic shelter booking has a separate entry.",
        "Community services",
        ("Event name", "Event location, including the entrance or assembly point", "Event date", "Expected attendance"),
        "Open the demo permit desk. Enter the four items above and add an event plan if you have one. You can then try the staff review.",
        "festival fair block party application gathering plaza",
    ),
    Service(
        "street-repair", "Street repair request", "streets",
        "Report a pothole, broken pavement or damage to a public street.",
        "Use this service for damage to the pavement on a public road. The owner handles repairs on a private driveway.",
        "Street maintenance",
        ("Street name and nearest intersection", "Direction of travel and affected lane", "Description of the damage"),
        "Take this checklist to the street repair page of the department that maintains the road.",
        "potholes road repair asphalt pavement rut intersection",
    ),
    Service(
        "park-shelter-reservation", "Park shelter reservation", "community",
        "Request a picnic shelter for a group on a specific date.",
        "Choose this service to reserve a shelter for your group. A larger gathering that uses the rest of the park may need a separate application.",
        "Parks reservations",
        ("Park and shelter name", "Preferred date and an alternate date", "Group size and requested hours"),
        "Check available dates on the park operator’s reservation calendar. Confirm the shelter capacity and fee before booking.",
        "picnic pavilion shelter barbecue reserve rental birthday",
    ),
    Service(
        "public-records", "Public records request", "records",
        "Ask to inspect or obtain a copy of an existing public record.",
        "Ask for an existing document, such as meeting minutes, a contract or a report. Identify the office that created or received it.",
        "Records office",
        ("Document type or subject", "Approximate dates and the office involved", "Preferred format or request to inspect in person"),
        "Use that agency’s records request page. Keep its confirmation number with your request.",
        "information disclosure minutes agenda record documents copy contracts",
    ),
    Service(
        "streetlight-outage", "Streetlight outage", "streets",
        "Report a streetlight that flickers or fails to turn on at night.",
        "Choose this entry for an installed light along a public street. The pole label can identify the utility or agency that maintains it.",
        "Street lighting",
        ("Nearest street address or intersection", "Pole number, if visible from the ground", "Description of the outage and when you noticed it"),
        "Check the pole label or the local public works site for the maintenance provider, then use its streetlight outage form.",
        "lamp lighting light bulb street light dark broken flicker",
    ),
    Service(
        "missed-collection", "Missed waste collection", "waste",
        "Report a trash, recycling or yard-waste cart missed on collection day.",
        "Use this form if you put your cart out at its usual pickup point on the scheduled day. Check the collection calendar for holiday changes.",
        "Collection services",
        ("Collection address", "Scheduled pickup date", "Cart type and whether the crew collected nearby carts"),
        "Check the collection provider’s missed-pickup instructions and use its reporting form. Keep the request number for follow-up.",
        "garbage trash rubbish waste recycling bin pickup missed collection compost",
    ),
)


def service_entry(service):
    topic = TOPICS[service.topic]
    identifier = "service-" + service.slug
    items = "".join(
        f'<li><label><input type="checkbox"><span>{escape(requirement)}</span></label></li>'
        for requirement in service.requirements
    )
    checklist = "\n".join((
        service.name, "Ridgefolio service directory · Fictional example",
        "", "When to use this service", service.eligibility, "Example office: " + service.desk,
        "", "What to prepare", *("[ ] " + item for item in service.requirements),
        "", "Next step", service.next_step, "",
    ))
    application = (
        '<a class="finder-primary" href="/demos/permit-desk/#workspace">Try the permit application</a>'
        if service.slug == "community-event-permit" else ""
    )
    return (
        f'<details class="finder-service" id="{identifier}" data-topic="{service.topic}" data-keywords="{escape(service.keywords, quote=True)}">'
        '<summary><span class="finder-row-copy">'
        f'<span class="finder-service-name">{escape(service.name)}</span>'
        f'<span class="finder-description">{escape(service.description)}</span></span>'
        '<span class="finder-toggle" aria-hidden="true"></span></summary>'
        f'<div class="finder-body"><div class="finder-routing"><span>{escape(topic)}</span><span>Example office · {escape(service.desk)}</span></div>'
        f'<p class="finder-eligibility">{escape(service.eligibility)}</p>'
        '<fieldset class="finder-items"><legend>What to prepare</legend>'
        f'<ul>{items}</ul><p class="finder-progress" hidden></p></fieldset>'
        f'<div class="finder-followup"><h4>Next step</h4><p class="finder-next">{escape(service.next_step)}</p>'
        f'<div class="finder-actions">{application}<a class="finder-file" href="data:text/plain;charset=utf-8,{quote(checklist, safe="")}" '
        f'download="{service.slug}-checklist.txt">Download blank checklist</a>'
        f'<a class="finder-permalink" href="#{identifier}" aria-label="Link to this service, {escape(service.name, quote=True)}">Link to this service</a></div></div></div></details>'
    )


def workspace():
    options = "".join(f'<option value="{slug}">{label}</option>' for slug, label in TOPICS.items())
    entries = "".join(service_entry(service) for service in SERVICES)
    return (
        '<section class="finder-app" aria-labelledby="finder-heading">'
        '<div class="finder-head"><h3 id="finder-heading">Resident service directory</h3>'
        '<p>Choose a service to see who handles it, what to prepare and where to go next.</p></div>'
        '<div class="finder-content"><noscript><p>Browse the services below. Enable JavaScript to search, filter by topic and save your checklist progress in this tab.</p></noscript>'
        '<div class="finder-filters" hidden><div>'
        '<label for="service-query">Search services</label><input type="search" id="service-query" placeholder="Try pothole, picnic or permit" autocomplete="off" enterkeyhint="search"></div>'
        f'<div><label for="finder-topic">Service topic</label><select id="finder-topic"><option value="">All topics</option>{options}</select></div></div>'
        '<div class="finder-count"><p id="match-count" role="status" aria-live="polite" aria-atomic="true">'
        f'{len(SERVICES)} matching services</p><button type="button" class="finder-clear" hidden>Clear filters</button></div>'
        '<p class="finder-empty" hidden>Try a shorter search or clear the filters to browse every service.</p>'
        f'<div id="finder-results">{entries}</div></div></section>'
    )
