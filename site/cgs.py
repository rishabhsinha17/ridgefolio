"""Case study of Rishabh Sinha's work at the University of Maryland."""

import json
from collections import Counter
from html import escape
from pathlib import Path
from urllib.parse import quote

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
    <div class="atlas-title"><div><span class="tag">Industrial parks atlas · May 2025</span><h2 id="atlas-heading">Explore the archipelago.</h2></div><p>Choose a region or a park to see where the research team located it.</p></div>
    <div class="atlas" data-atlas><div class="atlas-topline"><b>Indonesia</b><span>CGS handover dataset</span></div>
    <div class="atlas-map"><img class="atlas-static" src="/assets/cgs-atlas/overview.webp" width="4000" height="1888" alt="Industrial parks across Indonesia, with the densest concentrations on Java and Sumatra."><div class="atlas-viewport" hidden role="region" aria-label="Interactive map of Indonesia’s industrial parks"></div></div>
    <div class="atlas-key"><span><i class="single-key"></i> One park</span><span class="group-legend"><i class="group-key">3</i> <span class="group-text">Nearby parks</span></span><small>Relief · NASA / Natural Earth</small></div>
    <div class="atlas-tools" hidden><div><label for="atlas-region">Explore a region</label><select id="atlas-region"></select></div><div><label for="atlas-status">Filter by status</label><select id="atlas-status"></select></div><div><label for="atlas-park">Inspect a park</label><select id="atlas-park"></select></div>
    <p class="atlas-result" role="status" aria-live="polite"></p></div></div>
    <p class="figure-credit">Park coordinates and status come from the {link(SNAPSHOT + "data/geojson/statusGeojsonData.geojson", "CGS status file")}. Shaded relief uses {link("https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-topography-bathymetry/", "NASA Blue Marble")}. Rivers, boundaries and places come from {link("https://www.naturalearthdata.com/", "Natural Earth")}. <span class="interactive-note">Select a numbered group to see its parks.</span></p></section>"""


STATUS_COLORS = (
    ("Operational", "operating", "Operational"),
    ("Operational with Continued Construction", "expanding", "Operating and expanding"),
    ("Under Construction", "building", "Under construction"),
    ("Before Construction", "planned", "Before construction"),
    ("Stalled", "stalled", "Stalled"),
    ("Unclear", "unclear", "Unclear"),
)
POWER_SOURCES = (
    ("grid", "PLN grid"), ("unclear", "Provider unclear"), ("gas", "Captive gas"),
    ("solar", "Solar"), ("coal", "Captive coal"), ("bio", "Bioenergy"), ("hydro", "Hydropower"),
)


def chart_records():
    source = Path(__file__).resolve().parents[1] / "public" / "assets" / "parks.json"
    return json.loads(source.read_text())


def region_figure():
    records = chart_records()
    regions = Counter(row["region"] for row in records)
    by_status = Counter((row["region"], row["status"]) for row in records)
    largest = max(regions.values())
    rows, table = [], []
    for name, total in regions.most_common():
        segments, values = [], []
        for status, key, _ in STATUS_COLORS:
            count = by_status[name, status]
            values.append(f"<td>{count}</td>")
            if count:
                segments.append(f'<i class="stratum-{key}" style="width:{count / total:.4%}" title="{escape(status)} · {count}"></i>')
        rows.append(f'<li><a href="?region={quote(name)}#the-map" data-region="{escape(name)}" title="Explore {escape(name)} on the map"><span>{name}</span>'
                    f'<span class="region-track"><span class="region-stack" style="width:{total / largest:.4%}">{"".join(segments)}</span></span><b>{total}</b></a></li>')
        table.append(f'<tr><th scope="row">{name}</th>{"".join(values)}<td>{total}</td></tr>')
    key = "".join(f'<span><i class="stratum-{css}"></i>{name}</span>' for _, css, name in STATUS_COLORS)
    columns = "".join(f'<th scope="col">{short}</th>' for _, _, short in STATUS_COLORS)
    return (
        '<figure class="data-exhibit regional-exhibit"><figcaption><span class="exhibit-kicker">Industrial parks by region</span>'
        f'<strong>{regions["Java"] + regions["Sumatra"]} of {len(records)} parks are in the Java and Sumatra regions.</strong></figcaption>'
        f'<ol class="region-bars">{"".join(rows)}</ol><div class="status-legend">{key}</div>'
        '<details class="chart-table"><summary>Read the counts by status</summary><div class="table-scroll" tabindex="0" aria-label="Park counts by region and status">'
        f'<table><caption>Industrial parks by region and reported status</caption><thead><tr><th scope="col">Region</th>{columns}<th scope="col">Total</th></tr></thead><tbody>{"".join(table)}</tbody></table></div></details>'
        f'<p class="chart-source">One status per park. Recalculated from the {link(SNAPSHOT + "data/master/CGS_Industrial_Parks_Sept_2024.csv", "archived master CSV")} '
        f'using the {link(SNAPSHOT + "dashboard.html#L430-L467", "original regional chart calculation")}.</p></figure>'
    )


def energy_figure():
    records = chart_records()
    counts = Counter(source for park in records for source in park["power"])
    total = len(records)
    bars = "".join(
        f'<li><span>{label}</span><span class="energy-track" aria-hidden="true"><i style="width:{counts[key] / total:.4%}"></i></span><b>{counts[key]}</b></li>'
        for key, label in POWER_SOURCES
    )
    return (
        '<figure class="data-exhibit energy-exhibit"><figcaption><span class="exhibit-kicker">Electricity sources</span>'
        f'<strong>{counts["grid"]} parks report a connection to the PLN grid.</strong></figcaption>'
        f'<div class="energy-axis" aria-hidden="true"><span>0</span><span>Share of {total} parks</span><span>100%</span></div>'
        f'<ol class="energy-bars">{bars}</ol><p class="chart-source">Counts show parks reporting each source. A park can report several. '
        f'Source flags in the {link(SNAPSHOT + "data/master/CGS_Industrial_Parks_Sept_2024.csv", "archived CSV")} follow the {link(SNAPSHOT + "dashboard.html#L569", "original calculation")}.</p></figure>'
    )


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
