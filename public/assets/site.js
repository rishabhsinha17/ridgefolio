"use strict";
const byId = (id) => document.getElementById(id);
function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function downloadFile(name, contents, type = "text/plain;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
function renderSearch() {
  const input = byId("query"),
    results = byId("site-results"),
    status = byId("results-count");
  input.value = new URLSearchParams(location.search).get("q") || "";
  fetch("/assets/search.json")
    .then((response) => {
      if (!response.ok) throw new Error();
      return response.json();
    })
    .then((pages) => {
      function update() {
        const terms = input.value
          .trim()
          .toLowerCase()
          .split(/\s+/)
          .filter(Boolean);
        const matches = pages
          .map((page) => {
            const title = page.title.toLowerCase(),
              summary = page.description.toLowerCase();
            const text = [title, summary, page.group, page.keywords]
              .join(" ")
              .toLowerCase();
            const score = terms.every((word) => text.includes(word))
              ? terms.reduce(
                  (n, word) =>
                    n +
                    1 +
                    4 * title.includes(word) +
                    2 * summary.includes(word),
                  0,
                )
              : -1;
            return { page, score };
          })
          .filter((row) => row.score >= 0)
          .sort((a, b) => b.score - a.score);
        results.replaceChildren();
        status.textContent = matches.length
          ? matches.length + " pages found"
          : "No matching pages. Try a shorter term or browse Services.";
        for (const { page } of matches) {
          const row = element("div", undefined, "result"),
            link = element("a", page.title);
          link.href = page.path;
          row.append(link, element("p", page.description));
          results.append(row);
        }
      }
      input.addEventListener("input", update);
      byId("search-form").addEventListener("submit", (event) => {
        event.preventDefault();
        history.replaceState(
          null,
          "",
          input.value
            ? "?q=" + encodeURIComponent(input.value)
            : location.pathname,
        );
        update();
      });
      update();
    })
    .catch(() => {
      status.textContent =
        "Search is unavailable. Use the navigation above to browse services, demos and resources.";
    });
}
const services = [
  [
    "Community event permit",
    "Permit",
    "For a gathering in a park or public square.",
    "Prepare the event name, location and a short description.",
    "/demos/permit-desk/",
  ],
  [
    "Street repair request",
    "Roads",
    "Report a pothole or damaged street surface.",
    "Prepare the nearest intersection, direction of travel and a description of the damage.",
  ],
  [
    "Park shelter reservation",
    "Parks",
    "Reserve a picnic shelter for a community activity.",
    "Prepare a preferred park, date, group size and alternate date.",
  ],
  [
    "Public records request",
    "Records",
    "Identify records you want to inspect.",
    "Prepare a description, approximate date range and preferred delivery format.",
  ],
];
function renderFinder() {
  const input = byId("service-query"),
    results = byId("finder-results");
  function update() {
    const query = input.value.toLowerCase().trim();
    const matches = services.filter((row) =>
      row.slice(0, 4).join(" ").toLowerCase().includes(query),
    );
    byId("match-count").textContent = matches.length
      ? matches.length + " matching services"
      : "No matching services. Try park, road or permit.";
    results.replaceChildren();
    for (const [name, category, description, requirements, path] of matches) {
      const card = element("details");
      card.append(
        element("summary", name),
        element("p", description + " " + requirements),
      );
      if (path) {
        const link = element("a", "Try the permit application");
        link.href = path;
        card.append(link);
      }
      results.append(card);
    }
  }
  input.addEventListener("input", update);
  update();
}
function permitDesk() {
  const formArea = byId("desk-step"),
    heading = byId("desk-heading"),
    log = byId("desk-history");
  let stage, eventName, venue, reason, events;
  function button(label, action, quiet = false) {
    const button = element("button", label, quiet ? "quiet" : "");
    button.type = "button";
    button.addEventListener("click", action);
    return button;
  }
  function field(form, label, value, max) {
    const holder = element("label", label),
      input = element("input");
    input.required = true;
    input.maxLength = max;
    input.value = value;
    input.pattern = ".*\\S.*";
    holder.append(input);
    form.append(holder);
    return input;
  }
  function move(next, entry) {
    stage = next;
    events.push(entry);
    draw(true);
  }
  function draw(focus = false) {
    const isIntake = stage === "Draft" || stage === "Correction requested";
    heading.textContent = isIntake
      ? stage === "Draft"
        ? "Application intake"
        : "Correct your application"
      : stage === "In review"
        ? "Staff review"
        : "Permit receipt";
    byId("desk-status").textContent = stage;
    log.replaceChildren(...events.map((entry) => element("li", entry)));
    formArea.replaceChildren();
    if (isIntake) {
      if (reason) formArea.append(element("p", "Reviewer note: " + reason));
      const form = element("form"),
        name = field(form, "Event name", eventName, 80),
        location = field(form, "Event location", venue, 120);
      const send = element(
        "button",
        stage === "Draft" ? "Submit application" : "Resubmit correction",
      );
      form.append(send);
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        eventName = name.value.trim();
        venue = location.value.trim();
        move(
          "In review",
          stage === "Draft"
            ? "Resident submitted the application."
            : "Resident resubmitted the corrected application.",
        );
      });
      formArea.append(form);
    } else if (stage === "In review") {
      formArea.append(
        element("p", eventName + " · " + venue),
        element("p", "Review the application as a staff member."),
      );
      const form = element("form"),
        note = field(
          form,
          "Correction to request",
          "Please specify the entrance or assembly point.",
          160,
        );
      const correct = element("button", "Request correction", "quiet");
      form.append(correct);
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        reason = note.value.trim();
        move("Correction requested", "Staff requested a correction: " + reason);
      });
      formArea.append(
        button("Approve permit", () =>
          move("Approved", "Staff approved the application."),
        ),
        form,
      );
    } else {
      formArea.append(
        element("p", eventName + " · " + venue),
        element("p", "Demo permit RF-101 has been approved."),
        button("Download receipt", () =>
          downloadFile(
            "sample-permit-receipt.txt",
            [
              "RIDGEFOLIO DEMONSTRATION · FICTIONAL PERMIT",
              "RF-101",
              eventName,
              venue,
              stage,
              "",
              ...events,
            ].join("\n"),
          ),
        ),
      );
    }
    if (focus) {
      heading.tabIndex = -1;
      heading.focus();
    }
  }
  function reset() {
    stage = "Draft";
    eventName = "Harbor market";
    venue = "Harbor Square";
    reason = "";
    events = ["Sample case opened."];
    draw();
  }
  byId("desk-reset").addEventListener("click", reset);
  reset();
}
function ledger() {
  const rows = [
    ["RF-201", "Central", "Permit review", 4],
    ["RF-202", "North", "Road repair", 9],
    ["RF-203", "South", "Park reservation", 2],
    ["RF-204", "Central", "Records request", 6],
    ["RF-205", "South", "Road repair", 8],
    ["RF-206", "North", "Permit review", 3],
  ];
  const select = byId("district");
  const selected = () =>
    rows.filter(
      (row) => select.value === "All districts" || row[1] === select.value,
    );
  function draw() {
    const records = selected(),
      total = records.reduce((n, row) => n + row[3], 0);
    byId("ledger-summary").textContent =
      records.length + " records · " + total + " service hours";
    byId("ledger-rows").replaceChildren(
      ...records.map((row) => {
        const tr = element("tr");
        tr.append(...row.map((value) => element("td", value)));
        return tr;
      }),
    );
    const chart = byId("ledger-chart");
    chart.replaceChildren();
    for (const district of [...new Set(records.map((row) => row[1]))].sort()) {
      const hrs = records
        .filter((row) => row[1] === district)
        .reduce((n, row) => n + row[3], 0);
      const bar = element("div", undefined, "bar"),
        meter = element("meter");
      meter.min = 0;
      meter.max = 12;
      meter.value = hrs;
      meter.setAttribute("aria-label", district + " service hours");
      bar.append(element("span", district), meter, element("span", hrs + " h"));
      chart.append(bar);
    }
  }
  select.addEventListener("change", draw);
  draw();
  byId("export-ledger").addEventListener("click", () =>
    downloadFile(
      "sample-service-ledger.csv",
      [["Record", "District", "Service", "Hours"], ...selected()]
        .map((row) => row.join(","))
        .join("\r\n") + "\r\n",
      "text/csv;charset=utf-8",
    ),
  );
}
if (byId("query")) renderSearch();
if (byId("service-query")) renderFinder();
if (byId("desk-step")) permitDesk();
if (byId("district")) ledger();
if (byId("brief"))
  byId("brief").addEventListener("submit", (event) => {
    event.preventDefault();
    const fields = [...new FormData(event.target)].map(
      ([label, value]) => label + "\n" + (value.trim() || "To be determined"),
    );
    downloadFile(
      "project-brief.txt",
      ["PROJECT BRIEF", ...fields].join("\n\n"),
    );
    byId("brief-state").textContent = "Your brief is ready to download.";
  });
if (byId("checklist")) {
  const boxes = [...byId("checklist").querySelectorAll("input")];
  byId("checklist").addEventListener("change", () => {
    byId("check-count").textContent =
      boxes.filter((b) => b.checked).length +
      " of " +
      boxes.length +
      " checked";
  });
  document
    .querySelector("[data-download-checks]")
    .addEventListener("click", () =>
      downloadFile(
        "website-launch-checklist.txt",
        boxes
          .map(
            (box) =>
              (box.checked ? "[x] " : "[ ] ") +
              box.closest("label").querySelector("strong").textContent +
              "\n" +
              box.closest("label").querySelector("span").lastChild.textContent,
          )
          .join("\n\n"),
      ),
    );
}
