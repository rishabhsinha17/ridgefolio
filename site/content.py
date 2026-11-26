"""Buyer-facing service descriptions and guides."""

SERVICES = [
    dict(
        slug="websites",
        title="Websites & service portals",
        short="Websites",
        tone="blue",
        label="Resident experience",
        intro="Help residents find a service, understand what they need and finish the task on a phone.",
        need="Someone applying for a permit may have to piece together a department page, a PDF and a conversation by phone. Start by putting the instructions in one place.",
        items=[
            (
                "Service design",
                "Map resident questions to plain-language pages. Test the navigation against tasks such as renewing a license or requesting a record.",
            ),
            (
                "Content migration",
                "Inventory pages and documents, assign owners, map redirects and rehearse the cutover on a staging site.",
            ),
            (
                "Editorial handover",
                "Give editors reusable page patterns and a publishing checklist. Walk an editor through a change before launch.",
            ),
        ],
        test="Ask a first-time visitor to locate the right service, check eligibility and open the application using only a keyboard. Ask an editor to update that same page.",
        scope="To estimate the work, count pages and documents, identify required languages and check the current CMS. Include integrations, editor permissions and the launch date.",
        demo="finder",
        guide="launch-checklist",
    ),
    dict(
        slug="workflows",
        title="Forms & workflow automation",
        short="Workflows",
        tone="gold",
        label="Service operations",
        intro="Connect the resident’s application to the staff queue, review decision and receipt.",
        need="A complete online form can still create hours of retyping. Follow one application all the way to the person who reviews it.",
        items=[
            (
                "Intake and validation",
                "Define the required fields, conditional questions and supporting documents with the people who review them.",
            ),
            (
                "Staff review",
                "Make ownership, status changes, requests for corrections and decision history visible in one place.",
            ),
            (
                "Integration and export",
                "Agree on identifiers and field definitions. Reconcile sample records against the existing system before go-live.",
            ),
        ],
        test="Submit a sample application and ask for a correction. Return the corrected record to staff for approval. Compare the final record with the history and the receipt.",
        scope="Review roles, exception paths, payment providers, identity systems and retention rules affect the build.",
        demo="permit-desk",
        guide="project-brief",
    ),
    dict(
        slug="data",
        title="Data systems & reporting",
        short="Data systems",
        tone="sage",
        label="Decision support",
        intro="Give staff a map or dashboard backed by a reporting pipeline they can check against source records.",
        need="When monthly totals differ between reports, staff need a way to trace the difference. Build the reconciliation step into the reporting process so staff can tell which records changed.",
        items=[
            (
                "Source inventory",
                "Document the owner, format, refresh interval and allowed use of each source. Agree on a definition for each measure.",
            ),
            (
                "Data preparation",
                "Validate incoming records, isolate exceptions and keep stable identifiers across refreshes.",
            ),
            (
                "Maps and reporting",
                "Design filters around decisions, include documented calculations and export the selected records. For an AI-assisted task, test its answers against a labeled sample before release.",
            ),
        ],
        test="Filter a known sample, compare the count and sum to an independent calculation, then export the records and reproduce both numbers.",
        scope="Source quality, update frequency, geographic coverage, access rules and the number of reporting views drive effort.",
        demo="service-ledger",
        guide="project-brief",
    ),
]
DEMOS = [
    (
        "finder",
        "Service finder",
        "Find the right service and check what to prepare before applying.",
        "blue",
    ),
    (
        "permit-desk",
        "Permit desk",
        "Move a sample application from intake through a correction to a decision.",
        "gold",
    ),
    (
        "service-ledger",
        "Service ledger",
        "Filter a service queue, reconcile totals and export the matching records.",
        "sage",
    ),
]
RESOURCES = [
    (
        "capabilities",
        "Capability statement",
        "A printable summary of the practice with links to project evidence.",
    ),
    (
        "launch-checklist",
        "Website launch checklist",
        "Track migration, accessibility, editor handover and launch readiness.",
    ),
    (
        "project-brief",
        "Project brief builder",
        "Take a plain-text scope into your next planning meeting.",
    ),
]
CASES = [
    (
        "industrial-parks",
        "Industrial parks in Indonesia",
        "Research dashboard",
        "At the University of Maryland’s Center for Global Sustainability, Rishabh contributed to a public dashboard for exploring Indonesian industrial parks.",
        "The ArcGIS map uses CSV and GeoJSON data. Separate pages explain the methodology and offer the dataset for download. Visitors can explore park status, energy sources and other layers.",
        "For a public data project, the methodology and underlying records are as important as the map. A reviewer can follow a park from its map marker back to a source record.",
        "https://github.com/rishabhsinha17/cgs-industrial-parks-dashboard",
        "Read the project repository",
    ),
    (
        "open-source",
        "Engineering in public",
        "Open-source infrastructure",
        "Rishabh contributed to kvcached, an open-source project for managing memory in language-model serving systems.",
        "The v0.1.6 release names Rishabh as a core contributor. Its public release notes document the version and the work included across the project.",
        "A release gives reviewers a fixed point to inspect. Ridgefolio uses the same principle for handover, with a named release, acceptance checks and operating notes.",
        "https://github.com/ovg-project/kvcached/releases/tag/v0.1.6",
        "Read the release notes",
    ),
]
CHECKS = [
    (
        "Content and redirects",
        "Match each high-traffic URL to its destination. Check redirected pages, downloads and external links on staging.",
    ),
    (
        "Resident tasks",
        "Ask a new visitor to find and complete the most-used service on a phone.",
    ),
    (
        "Keyboard and assistive technology",
        "Follow the primary tasks with a keyboard and a screen reader. Check form labels, errors and focus after each action.",
    ),
    (
        "Editor handover",
        "Have a staff editor publish, correct and retire a page using their assigned permissions.",
    ),
    (
        "Cutover and recovery",
        "Record the deployment owner, backup location, recovery steps and the decision to roll back.",
    ),
    (
        "Launch acceptance",
        "Record the release, unresolved issues, owners and acceptance decision. Check live transactions after cutover.",
    ),
]

CASES.append(
    (
        "evaluation",
        "Evaluating an AI system",
        "Research and testing",
        "Rishabh authored a study on measuring whether a monitor can distinguish exposure to an instruction from a subsequent action.",
        "The study compares evaluation populations, reports results across models and includes a text baseline. The public paper links the experiment code.",
        "For a buyer testing an assistant, the choice of examples matters. Evaluate correct answers, plausible errors and cases that should go to a human as separate groups.",
        "https://arxiv.org/abs/2610.37679",
        "Read the paper and methods",
    )
)
