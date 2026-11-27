"""Render the fictional operations register and its underlying time entries."""

import csv
import io
from collections import defaultdict
from html import escape
from typing import NamedTuple
from urllib.parse import quote


class Entry(NamedTuple):
    day: int
    team: str
    work: str
    minutes: int


class Record(NamedTuple):
    key: str
    district: str
    service: str
    subject: str
    entries: tuple[Entry, ...]

    @property
    def minutes(self):
        return sum(entry.minutes for entry in self.entries)


RECORDS = (
    Record("RF-201", "Central", "Permit review", "Market Square community event", (
        Entry(2, "Permit desk", "Checked the application and proposed site plan.", 60),
        Entry(3, "Community services", "Reviewed the event footprint and entrance.", 120),
        Entry(3, "Permit desk", "Recorded the decision and completed the case file.", 60))),
    Record("RF-202", "North", "Road repair", "Cedar Lane surface repair", (
        Entry(2, "Street maintenance", "Inspected the reported pavement damage.", 120),
        Entry(3, "Road crew", "Patched the damaged section of Cedar Lane.", 360),
        Entry(4, "Street maintenance", "Inspected the patch and closed the work order.", 60))),
    Record("RF-203", "South", "Park reservation", "Riverside shelter reservation", (
        Entry(3, "Parks desk", "Reviewed the shelter request and group size.", 30),
        Entry(3, "Park operations", "Checked availability and assigned the shelter.", 60),
        Entry(4, "Parks desk", "Issued the reservation confirmation.", 30))),
    Record("RF-204", "Central", "Records request", "Park board meeting minutes", (
        Entry(2, "Records desk", "Identified the requested meetings and dates.", 60),
        Entry(4, "Records office", "Located and reviewed the public meeting files.", 240),
        Entry(5, "Records desk", "Prepared the response and recorded delivery.", 60))),
    Record("RF-205", "South", "Road repair", "Maple Avenue pothole repair", (
        Entry(4, "Street maintenance", "Inspected and marked the pothole on Maple Avenue.", 60),
        Entry(5, "Road crew", "Prepared the surface and completed the asphalt patch.", 360),
        Entry(6, "Street maintenance", "Checked the finished repair and closed the work order.", 60))),
    Record("RF-206", "North", "Permit review", "Neighborhood garden gathering", (
        Entry(4, "Permit desk", "Checked the revised gathering location.", 30),
        Entry(5, "Community services", "Reviewed the corrected application.", 120),
        Entry(6, "Permit desk", "Recorded the final decision.", 30))),
)


def hours(minutes):
    return f"{minutes / 60:g}"


def csv_url(rows):
    output = io.StringIO()
    csv.writer(output).writerows(rows)
    return "data:text/csv;charset=utf-8," + quote(output.getvalue(), safe="")


def register_row(record):
    key = record.key
    entries = "".join(
        f'<li data-day="2026-11-{entry.day:02}" data-minutes="{entry.minutes}">'
        f'<time datetime="2026-11-{entry.day:02}">Nov {entry.day}</time>'
        f'<div><strong class="log-team">{escape(entry.team)}</strong><span class="log-work">{escape(entry.work)}</span></div>'
        f'<span class="log-hours">{hours(entry.minutes)} h</span></li>'
        for entry in record.entries
    )
    return f'''<tr class="ledger-entry" data-key="{key}">
      <th scope="row"><span class="ledger-key">{key}</span><button class="ledger-toggle" type="button" aria-controls="log-{key}" aria-expanded="false" hidden>{key}</button></th>
      <td class="record-district">{escape(record.district)}</td><td class="record-service">{escape(record.service)}</td><td class="record-hours">{hours(record.minutes)}</td>
    </tr><tr id="log-{key}" class="ledger-log"><td colspan="4"><details><summary>Work log for {key}</summary>
      <div class="ledger-log-body"><div class="ledger-log-heading"><strong>{escape(record.subject)}</strong><span>{key} work log</span></div>
      <ol>{entries}</ol><div class="ledger-log-total"><span>Total staff time</span><strong>{hours(record.minutes)} h</strong></div>
      <button type="button" class="ledger-log-download ledger-text-action" hidden>Download {key} work log</button></div>
    </details></td></tr>'''


def workspace():
    total = sum(r.minutes for r in RECORDS)
    services = sorted({r.service for r in RECORDS})
    districts = sorted({r.district for r in RECORDS})
    def options(values):
        return "".join(f'<option>{escape(value)}</option>' for value in values)

    groups = defaultdict(int)
    for record in RECORDS:
        groups[record.district] += record.minutes
    bars = "".join(
        f'<li class="ledger-bar"><span>{district}</span><span class="ledger-track" aria-hidden="true">'
        f'<i style="width:{minutes / total:.2%}"></i></span><strong>{hours(minutes)} h</strong></li>'
        for district, minutes in sorted(groups.items(), key=lambda item: (-item[1], item[0]))
    )
    whole_register = csv_url([("Record", "District", "Service", "Hours"), *(
        (r.key, r.district, r.service, hours(r.minutes)) for r in RECORDS
    )])
    return f'''<div id="service-ledger">
      <header class="ledger-heading"><h2>Weekly service hours</h2>
      <p><time datetime="2026-11-02">November 2</time>–<time datetime="2026-11-08">8, 2026</time> · Completed records</p></header>
      <p class="ledger-instruction" hidden><strong>Check South’s 10 hours.</strong> Filter the register to South, inspect the time entries for its two records, then export the report.</p>
      <div class="ledger-controls" hidden>
        <div><label for="district">District</label><select id="district"><option>All districts</option>{options(districts)}</select></div>
        <div><label for="ledger-service">Service</label><select id="ledger-service"><option>All services</option>{options(services)}</select></div>
        <button class="ledger-text-action" id="ledger-clear" type="button" hidden>Clear filters</button>
      </div>
      <div class="ledger-overview"><div class="ledger-amount"><span class="ledger-kicker">Logged staff hours</span>
        <strong id="ledger-hours">{hours(total)}</strong><p id="ledger-summary" role="status">{len(RECORDS)} records · {hours(total)} service hours</p>
      </div><section class="ledger-breakdown" aria-labelledby="ledger-breakdown-title"><div class="ledger-breakdown-head"><h3 id="ledger-breakdown-title">Hours by district</h3>
        <div class="ledger-groups" role="group" aria-label="Group hours by" hidden><button type="button" data-group="district" aria-pressed="true">District</button><button type="button" data-group="service" aria-pressed="false">Service</button></div></div>
        <ul id="ledger-chart" aria-label="Hours grouped by district">{bars}</ul><p class="ledger-measure">Bars show each group’s share of the filtered hours.</p><p class="ledger-chart-empty" hidden>No hours in this selection.</p>
      </section></div>
      <section class="ledger-register" aria-labelledby="ledger-register-title"><div class="ledger-register-head"><div><h3 id="ledger-register-title">Source register</h3>
        <p>Open a record to inspect its time entries.</p></div>
        <div class="ledger-sort" hidden><label for="ledger-sort">Sort by</label><select id="ledger-sort"><option value="record">Record number</option><option value="most">Most hours</option><option value="fewest">Fewest hours</option></select></div>
      </div><table><caption class="ledger-sr">Fictional service records, November 2–8, 2026. Duration in staff hours.</caption>
        <thead><tr><th scope="col">Record</th><th scope="col">District</th><th scope="col">Service</th><th scope="col">Hours</th></tr></thead>
        <tbody id="ledger-rows">{"".join(register_row(r) for r in RECORDS)}</tbody>
        <tfoot><tr><th scope="row" colspan="3">Register total</th><td id="ledger-register-total">{hours(total)}</td></tr></tfoot>
      </table><div id="ledger-empty" hidden><strong>No records match these filters.</strong><p>Clear the filters to see all six records. Exporting this view produces column headings only.</p>
      <button type="button" id="ledger-reset-empty" class="ledger-text-action">Show all records</button></div>
      <div class="ledger-export"><button id="export-ledger" class="ledger-primary" type="button" hidden>Download filtered CSV</button>
        <noscript><a class="ledger-primary" href="{whole_register}" download="sample-service-ledger.csv">Download all records</a></noscript>
        <span>CSV · Record, district, service and hours</span></div></section></div>'''
