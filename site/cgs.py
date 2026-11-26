"""Case study of Rishabh Sinha's work at the University of Maryland."""

from html import escape

TITLE = "Mapping Indonesia’s industrial parks"
SUMMARY = "How Rishabh Sinha built a public map and a repeatable publishing process for the University of Maryland’s Center for Global Sustainability."
REPO = "https://github.com/rishabhsinha17/cgs-industrial-parks-dashboard"
SNAPSHOT = REPO + "/blob/673480b96b7dbfce3990cc9f72208c87c65b54a9/"
LAUNCH = "https://iesr.or.id/wp-content/uploads/2024/06/Sustainable-Industrial-Development-in-Indonesia-Challenges-and-Opportunities-in-Industrial-Parks.pdf"
REUSE = "https://www.gotech.spp.umd.edu/sites/default/files/2025-12/UMD_NickelIndonesia_Brief2025.pdf#page=21"
LIVE = "https://cgsindustrialparks.org/"
MAP_USAGE = "https://www.arcgis.com/sharing/rest/content/items/2466f609c31c4a66a7183e773b04b5d1?f=pjson"
USAGE_DEFINITION = (
    "https://doc.esri.com/en/arcgis-online/latest/manage-data/monitor-item-usage.html"
)


def link(url, label):
    return f'<a href="{escape(url, quote=True)}">{label} <span aria-hidden="true">↗</span></a>'


def contents():
    return (
        '<nav class="case-contents" aria-label="In this case study">'
        + "".join(
            f'<a href="#{anchor}">{label}</a>'
            for anchor, label in [
                ("the-map", "Explore the map"),
                ("implementation", "Engineering"),
                ("outcome", "Outcome"),
                ("records", "Sources"),
            ]
        )
        + "</nav>"
    )


def atlas():
    return f"""<section class="atlas-wrap wrap" id="the-map" aria-labelledby="atlas-heading">
    <div class="atlas-title"><div><span class="tag">Project data · May 2025</span><h2 id="atlas-heading">One archipelago, 141 parks.</h2></div><p>Explore the status recorded for each park in the handover dataset.</p></div>
    <div class="atlas" data-atlas><div class="atlas-map"><img src="/assets/editorial/archipelago-parks.webp" width="1440" height="660" alt="Industrial park locations across Indonesia, clustered most densely on Java."><canvas aria-hidden="true"></canvas></div>
    <div class="atlas-tools" hidden><div><label for="atlas-status">Filter by status</label><select id="atlas-status"></select></div><div><label for="atlas-park">Inspect a park</label><select id="atlas-park"></select></div>
    <p class="atlas-result" role="status" aria-live="polite"></p></div></div>
    <p class="figure-credit">Ridgefolio rendering of the {link(SNAPSHOT + "data/geojson/statusGeojsonData.geojson", "CGS status file")}. Boundaries from {link("https://www.naturalearthdata.com/", "Natural Earth")}. Nearby points overlap at this scale.</p></section>"""


def energy_figure():
    # Count one park for each source flag set to 1 in the linked historical CSV.
    values = [
        ("PLN grid", 84),
        ("Provider unclear", 37),
        ("Captive gas", 22),
        ("Solar", 22),
        ("Captive coal", 19),
        ("Bioenergy", 10),
        ("Hydropower", 2),
    ]
    bars = "".join(
        f'<li><span>{name}</span><span class="bar-track" aria-hidden="true"><i style="width:{count / 141:.2%}"></i></span><strong>{count}</strong></li>'
        for name, count in values
    )
    return f"""<figure class="energy-figure"><figcaption><strong>Electricity sources in the parks data</strong><span>Number of parks with each source flag</span></figcaption><ul>{bars}</ul><p>One park can appear in several rows. Recalculated from the {link(SNAPSHOT + "data/master/CGS_Industrial_Parks_Sept_2024.csv", "archived September CSV")} using the {link(SNAPSHOT + "dashboard.html#L569", "original chart calculation")}.</p></figure>"""


def case_study():
    return f"""<article class="cgs-story">
    <header class="story-mast"><div class="wrap"><div class="story-credit">Founder case study <span>University of Maryland</span></div>
    <h1>{TITLE}</h1><p>The research team had a spreadsheet full of evidence about Indonesia’s industrial parks. Rishabh Sinha built the website that lets readers explore it, then gave the team a way to publish the next edition.</p>
    <dl class="story-facts"><div><dt>Organization</dt><dd>Center for Global Sustainability</dd></div><div><dt>Role</dt><dd>Research assistant · Website engineering</dd></div><div><dt>Period</dt><dd>Fall 2023 to spring 2025</dd></div></dl>
    </div></header><div class="wrap">{contents()}</div>{atlas()}
    <div class="case-reading wrap"><div class="case-section" id="implementation"><h2>From spreadsheet to public map</h2><div>
    <p>An operating park might draw power from the national grid, from a captive coal plant or from both. Readers needed to switch from park status to electricity supply without losing their place on the map. When researchers corrected a record, the downloadable file needed to reflect the same change.</p>
    <h3>A map and a set of research charts</h3><p>Rishabh connected the ArcGIS web map to thematic GeoJSON files. A reader can select a park to inspect its electricity supply or look up the sources behind a reported dispute. He also implemented nine Plotly charts from CSV data, including regional status and electricity capacity by industry. {link(REPO + "/commit/379ca3e6a36b1827d810587548a448375a701357", "April 2025 chart code")}</p>
    {energy_figure()}
    <h3>A repeatable update</h3><p>Rishabh wrote a Python script that groups the master CSV fields into seven geographic files. He updated the public CSV download to use the master file and connected the site to the team’s selected ArcGIS map. A maintainer could regenerate the files, update the hosted layers and check the published map against the download. {link(SNAPSHOT + "scripts/generate_geojson.py", "Generation script")} · {link(REPO + "/commit/673480b96b7dbfce3990cc9f72208c87c65b54a9", "Download and map changes")}</p>
    <h3>Corrections after launch</h3><p>The team added Indonesia Huabao Industrial Park and updated the public methodology in October 2024. Rishabh added a contribution page with English and Bahasa Indonesia forms. His handover work with Molly Schreier covered replacing a map layer while preserving its colors and symbols. {link("https://cgsindustrialparks.org/methodology.html", "CGS methodology")} · {link(SNAPSHOT + "contribute.html", "Contribution page")}</p>
    </div></div>
    <div class="case-section" id="outcome"><h2>Launch, usage and research reuse</h2><div><div class="usage-record"><strong>4,284</strong><div><b>Recorded ArcGIS map-item views</b><p>As of November 26, 2026, for the map connected in the May 2025 handover. Esri counts openings of the item page or viewer, including repeat visits. {link(MAP_USAGE, "Public counter")} · {link(USAGE_DEFINITION, "How Esri counts views")}</p></div></div><dl class="impact-list">
    <div><dt>June 2024 <span>Public launch</span></dt><dd>CGS presented a downloadable dataset of <strong>140 parks</strong> with <strong>six map layers</strong>. The launch deck shows the interface and how to read each layer. {link(LAUNCH + "#page=2", "Launch presentation")}</dd></div>
    <div><dt>May 2025 <span>Engineering handover</span></dt><dd>The archived master table contains <strong>141 named parks</strong>. Each of the seven geographic files contains the same 141 parks, with fields selected for its topic. {link(SNAPSHOT + "data/geojson", "Inspect the files")}</dd></div>
    <div><dt>December 2025 <span>Research reuse</span></dt><dd>CGS’s subsequent study of <strong>106 nickel smelters</strong> lists the industrial parks dataset among the sources used to identify a smelter’s industrial park. This documents reuse of the team’s data. {link(REUSE, "Methods, Appendix II")}</dd></div>
    </dl></div></div>
    <div class="case-section" id="records"><h2>Project records</h2><div><p>Rishabh built the website as a University of Maryland research assistant, working with Molly Schreier and Jiehong Lou. CGS and its collaborators collected and validated the data. The archived site credits the research team and the website creator separately.</p>
    <div class="case-links">{link(LIVE, "Visit the CGS dashboard")}{link(SNAPSHOT + "about.html#L170", "Read the website credit")}{link(REPO, "Inspect the repository")}</div></div></div>
    </div></article>"""
