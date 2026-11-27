"use strict";
// Produces a link for a visitor to open after reviewing the draft.
function contactDraftURL(recipient, subject, body) {
  const lines = body.replace(/\r?\n/g, "\r\n");
  return "mailto:" + recipient + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines);
}
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
  const form = byId("search-form");
  const input = byId("query");
  const results = byId("site-results");
  const status = byId("results-count");
  const query = () => new URLSearchParams(location.search).get("q") || "";
  let pages;
  let loading = false;
  input.value = query();

  function commit() {
    const term = input.value.trim();
    const url = new URL(location.href);
    if (term) url.searchParams.set("q", term);
    else url.searchParams.delete("q");
    url.hash = "";
    if (location.href !== url.href) history.pushState(null, "", url);
  }
  function recovery(label, action) {
    const actions = element("div", undefined, "search-recovery");
    const button = element("button", label, "quiet");
    const browse = element("a", "Browse services");
    browse.href = "/services/";
    button.type = "button";
    button.addEventListener("click", action);
    actions.append(button, browse);
    return actions;
  }
  function update() {
    if (!pages) return;
    results.replaceChildren();
    const terms = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) {
      status.textContent = "";
      return;
    }
    const matches = pages.map(page => {
      const title = page.title.toLowerCase();
      const summary = page.description.toLowerCase();
      const text = [title, summary, page.group, page.keywords].join(" ").toLowerCase();
      const score = terms.every(word => text.includes(word))
        ? terms.reduce((n, word) => n + 1 + 4 * title.includes(word) + 2 * summary.includes(word), 0)
        : -1;
      return { page, score };
    }).filter(entry => entry.score >= 0).sort((a, b) => b.score - a.score);
    if (!matches.length) {
      status.textContent = "No matching pages. Try a shorter search.";
      results.append(recovery("Clear search", () => { input.value = ""; commit(); update(); input.focus(); }));
      return;
    }
    status.textContent = matches.length + (matches.length === 1 ? " page found" : " pages found");
    for (const { page } of matches) {
      const row = element("div", undefined, "result");
      const link = element("a", page.title);
      link.href = page.path;
      row.append(link, element("p", page.description));
      results.append(row);
    }
  }
  async function load() {
    if (loading) return;
    loading = true;
    results.setAttribute("aria-busy", "true");
    try {
      const response = await fetch("/assets/search.json");
      if (!response.ok) throw new Error("Search unavailable");
      pages = await response.json();
      update();
    } catch {
      pages = undefined;
      status.textContent = "Search is unavailable.";
      results.replaceChildren(recovery("Retry search", () => { input.focus(); load(); }));
    } finally {
      loading = false;
      results.removeAttribute("aria-busy");
    }
  }
  input.addEventListener("input", update);
  form.addEventListener("submit", event => {
    event.preventDefault();
    commit();
    if (pages) update(); else load();
  });
  window.addEventListener("popstate", () => { input.value = query(); update(); });
  load().then(async () => {
    if (!query() || location.hash || performance.getEntriesByType("navigation")[0]?.type === "back_forward") return;
    await document.fonts?.ready;
    if (window.scrollY < 2 && results.getBoundingClientRect().top > innerHeight * .58) {
      form.scrollIntoView({block:"start", behavior:"instant"});
    }
  });
}

// Demo filters are shareable. Keep the current page section and unrelated parameters.
function demoParameters(values) {
  const url = new URL(location.href);
  for (const [key, value] of Object.entries(values)) {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  }
  if (url.href !== location.href) history.replaceState(history.state, "", url);
}

function renderFinder() {
  const input = byId("service-query");
  const workspace = input.closest(".demo-workspace");
  const cards = [...workspace.querySelectorAll("[data-service]")];
  const topics = [...workspace.querySelectorAll("button[data-topic]")];
  const empty = workspace.querySelector(".finder-empty");
  const initial = new URLSearchParams(location.search);
  const normalize = (value) =>
    value
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  const data = cards.map((card) => ({
    card,
    text: normalize(
      [
        card.querySelector("summary").textContent,
        card.querySelector(".service-detail > p").textContent,
        card.dataset.keywords,
        card.querySelector(".service-prep").textContent,
      ].join(" "),
    ),
  }));
  let topic =
    topics.find((button) => button.dataset.topic === initial.get("topic"))?.dataset.topic || "All topics";
  let open = initial.get("service") || "";
  input.value = (initial.get("q") || "").slice(0, input.maxLength);
  function save() {
    demoParameters({ q: input.value.trim(), topic: topic === "All topics" ? "" : topic, service: open });
  }
  function update() {
    const words = normalize(input.value).split(" ").filter(Boolean);
    let count = 0;
    for (const { card, text } of data) {
      const show =
        (topic === "All topics" || card.dataset.topic === topic) &&
        words.every((word) => text.includes(word));
      card.hidden = !show;
      if (show) count++;
      else if (open === card.dataset.service) open = "";
      card.open = show && open === card.dataset.service;
    }
    for (const b of topics) b.setAttribute("aria-pressed", String(b.dataset.topic === topic));
    byId("match-count").textContent = count
      ? count + " matching service" + (count === 1 ? "" : "s")
      : "No matching services";
    empty.hidden = count > 0;
    save();
  }
  topics.forEach((b) =>
    b.addEventListener("click", () => {
      topic = b.dataset.topic;
      update();
    }),
  );
  input.addEventListener("input", update);
  byId("finder-clear").addEventListener("click", () => {
    input.value = "";
    topic = "All topics";
    open = "";
    update();
    input.focus();
  });
  for (const card of cards) {
    card.addEventListener("toggle", () => {
      if (card.hidden) return;
      if (card.open) {
        open = card.dataset.service;
        cards.forEach((other) => {
          if (other !== card) other.open = false;
        });
      } else if (open === card.dataset.service) open = "";
      save();
    });
    const button = card.querySelector(".checklist-download");
    button.hidden = false;
    button.addEventListener("click", () => {
      const name = card.querySelector("summary strong").textContent;
      const items = [...card.querySelectorAll(".service-prep li")].map((li) => "[ ] " + li.textContent);
      downloadFile(
        card.dataset.service + "-service-checklist.txt",
        [
          "RIDGEFOLIO DEMONSTRATION · FICTIONAL SERVICE GUIDE",
          "",
          name,
          card.querySelector(".service-detail > p").textContent,
          "",
          "What to prepare",
          ...items,
          "",
          "Example routing: " + card.querySelector(".service-owner b").textContent,
          "",
        ].join("\n"),
      );
    });
  }
  workspace.querySelector(".finder-tools").hidden = false;
  update();
}

function permitDesk() {
  const area = byId("desk-step"),
    heading = byId("desk-heading"),
    log = byId("desk-history");
  const workspace = area.closest(".demo-workspace");
  const store = tabDraft("ridgefolio.permit-desk.v1");
  const stages = ["Draft", "In review", "Correction requested", "Approved"];
  const template = () => ({
    stage: "Draft",
    name: "Harbor market",
    venue: "Harbor Square",
    description: "",
    note: "Please specify the entrance or assembly point.",
    reason: "",
    submission: null,
    events: [{ text: "Sample case opened.", actor: "Case opened" }],
  });
  const saved = store.load();
  const restore =
    saved &&
    stages.includes(saved.stage) &&
    ["name", "venue", "description", "note", "reason"].every((k) => typeof saved[k] === "string") &&
    Array.isArray(saved.events) &&
    saved.events.length &&
    saved.events.every((e) => e && typeof e.text === "string" && typeof e.actor === "string") &&
    (saved.stage === "Draft" ||
      (saved.submission &&
        ["name", "venue", "description"].every((k) => typeof saved.submission[k] === "string")));
  let state = restore ? saved : template(),
    previous = null;
  const persist = () => store.save(state);
  function action(label, run, secondary = false) {
    const button = element("button", label, secondary ? "demo-secondary" : "demo-action");
    button.type = "button";
    button.addEventListener("click", run);
    return button;
  }
  function progress() {
    const index =
      state.stage === "Approved"
        ? 2
        : state.stage === "Draft" || state.stage === "Correction requested"
          ? 0
          : 1;
    [...workspace.querySelectorAll(".permit-progress li")].forEach((li, i) => {
      li.classList.toggle("complete", i < index);
      if (i === index) li.setAttribute("aria-current", "step");
      else li.removeAttribute("aria-current");
    });
    const entries = state.events.map((entry) => {
      const li = element("li"),
        actor = element("small", entry.actor);
      li.append(actor, element("span", entry.text));
      if (entry.change) li.append(element("em", entry.change));
      return li;
    });
    log.replaceChildren(...entries);
    byId("desk-status").textContent = state.stage;
    byId("desk-status").dataset.state = state.stage;
  }
  function advance(stage, text, actor, change) {
    state.stage = stage;
    state.events.push({ text, actor, change });
    previous = null;
    persist();
    draw(true);
  }
  function field(form, key, label, max, options = {}) {
    const block = element("div", undefined, "permit-field");
    const id = "permit-" + key,
      caption = element("label", label);
    caption.htmlFor = id;
    const input = element(options.multiline ? "textarea" : "input");
    input.id = id;
    input.name = key;
    input.value = state[key];
    input.maxLength = max;
    input.required = !options.optional;
    if (options.placeholder) input.placeholder = options.placeholder;
    input.autocomplete = "off";
    if (options.multiline) input.rows = options.optional ? 2 : 3;
    const error = element("p", "", "field-error");
    error.id = id + "-error";
    error.hidden = true;
    input.addEventListener("input", () => {
      state[key] = input.value;
      previous = null;
      workspace.querySelector(".undo-reset")?.remove();
      form.querySelector(".revision-error")?.remove();
      error.hidden = true;
      input.removeAttribute("aria-invalid");
      input.removeAttribute("aria-describedby");
      persist();
    });
    block.append(caption, input, error);
    form.append(block);
    return { input, error, label };
  }
  function valid(fields) {
    let first;
    for (const { input, error, label } of fields) {
      if (input.required && !input.value.trim()) {
        error.hidden = false;
        error.textContent = "Enter " + label.toLowerCase() + ".";
        input.setAttribute("aria-invalid", "true");
        input.setAttribute("aria-describedby", error.id);
        first ??= input;
      }
    }
    if (first) first.focus();
    return !first;
  }
  function record() {
    const dl = element("dl", undefined, "application-record");
    for (const [key, label] of [
      ["name", "Event"],
      ["venue", "Location"],
      ["description", "Event details"],
    ]) {
      const value = state.submission?.[key] ?? state[key];
      if (!value) continue;
      const pair = element("div");
      pair.append(element("dt", label), element("dd", value));
      dl.append(pair);
    }
    return dl;
  }
  function draw(focus = false) {
    const intake = state.stage === "Draft" || state.stage === "Correction requested";
    const correcting = state.stage === "Correction requested";
    heading.textContent = intake
      ? correcting
        ? "Correct your application"
        : "Application intake"
      : state.stage === "In review"
        ? "Staff review"
        : "Permit receipt";
    byId("desk-role").textContent = intake
      ? "Resident view"
      : state.stage === "In review"
        ? "Staff view"
        : "Decision issued";
    progress();
    area.replaceChildren();
    workspace.querySelector(".undo-reset")?.remove();
    if (previous) {
      const undo = action(
        "Undo reset",
        () => {
          state = previous;
          previous = null;
          persist();
          draw(true);
        },
        true,
      );
      undo.classList.add("undo-reset");
      byId("desk-reset").after(undo);
    }
    if (intake) {
      if (correcting) area.append(element("p", "Reviewer note: " + state.reason, "reviewer-note"));
      const form = element("form", undefined, "permit-form");
      form.noValidate = true;
      const name = field(form, "name", "Event name", 80),
        venue = field(form, "venue", "Event location", 120);
      field(form, "description", "Event details (optional)", 350, { multiline: true, optional: true });
      const send = element(
        "button",
        correcting ? "Resubmit correction" : "Submit application",
        "demo-action",
      );
      send.type = "submit";
      form.append(send);
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!valid([name, venue])) return;
        const submission = {
          name: state.name.trim(),
          venue: state.venue.trim(),
          description: state.description.trim(),
        };
        if (correcting && Object.keys(submission).every((k) => submission[k] === state.submission[k])) {
          const existing = form.querySelector(".revision-error");
          const message =
            existing ||
            element(
              "p",
              "Update the event name, location or details to address the reviewer’s note.",
              "field-error revision-error",
            );
          message.setAttribute("role", "alert");
          if (!existing) send.before(message);
          venue.input.focus();
          return;
        }
        let changed;
        if (correcting) {
          changed = [
            ["name", "Event name"],
            ["venue", "Location"],
            ["description", "Details"],
          ]
            .filter(([k]) => submission[k] !== state.submission[k])
            .map(
              ([k, label]) =>
                label + ": " + (state.submission[k] || "None") + " → " + (submission[k] || "None"),
            )
            .join(" · ");
        }
        if (correcting) state.note = "";
        Object.assign(state, submission);
        state.submission = submission;
        advance(
          "In review",
          correcting
            ? "Resident resubmitted the corrected application."
            : "Resident submitted the application.",
          "Resident",
          changed,
        );
      });
      area.append(form);
    } else if (state.stage === "In review") {
      area.append(
        record(),
        action("Approve permit", () => advance("Approved", "Staff approved the application.", "Staff")),
      );
      const form = element("form", undefined, "correction-form");
      form.noValidate = true;
      const note = field(form, "note", "Correction to request", 160, {
        multiline: true, placeholder: "Describe what the resident needs to change",
      });
      const send = element("button", "Request correction", "demo-secondary");
      send.type = "submit";
      form.append(send);
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!valid([note])) return;
        state.reason = state.note.trim();
        advance("Correction requested", "Staff requested a correction: " + state.reason, "Staff");
      });
      area.append(form);
    } else {
      area.append(element("p", "Demo permit RF-101 has been approved.", "approved-note"), record());
      area.append(
        action("Download receipt", () =>
          downloadFile(
            "sample-permit-receipt.txt",
            [
              "RIDGEFOLIO DEMONSTRATION · FICTIONAL PERMIT",
              "RF-101",
              state.submission.name,
              state.submission.venue,
              ...(state.submission.description ? ["Details: " + state.submission.description] : []),
              "Approved",
              "",
              ...state.events.map((e) => e.text),
            ].join("\n"),
          ),
        ),
      );
    }
    if (focus) heading.focus();
  }
  byId("desk-reset").addEventListener("click", () => {
    previous = state;
    state = template();
    store.save(null);
    draw(true);
  });
  workspace.querySelector(".permit-live").hidden = false;
  draw();
}

function ledger() {
  const district = byId("district"),
    service = byId("ledger-service"),
    sort = byId("ledger-sort"),
    body = byId("ledger-rows");
  const workspace = district.closest(".demo-workspace");
  const records = [...body.querySelectorAll(".ledger-record")].map((row) => ({
    row,
    detail: byId("detail-" + row.dataset.key),
    toggle: row.querySelector(".record-toggle"),
    key: row.dataset.key,
    district: row.dataset.district,
    service: row.dataset.service,
    hours: Number(row.dataset.hours),
  }));
  const params = new URLSearchParams(location.search);
  for (const [node, name] of [
    [district, "district"],
    [service, "service"],
    [sort, "sort"],
  ]) {
    if ([...node.options].some((o) => o.value === params.get(name))) node.value = params.get(name);
  }
  let expanded = params.get("record") || "",
    current = [];
  function save() {
    demoParameters({
      district: district.selectedIndex ? district.value : "",
      service: service.selectedIndex ? service.value : "",
      sort: sort.selectedIndex ? sort.value : "",
      record: expanded,
    });
  }
  function showDetail() {
    for (const r of records) {
      const isOpen = !r.row.hidden && r.key === expanded;
      r.detail.hidden = !isOpen;
      r.toggle.setAttribute("aria-expanded", String(isOpen));
    }
  }
  function draw() {
    current = records.filter(
      (r) =>
        (!district.selectedIndex || r.district === district.value) &&
        (!service.selectedIndex || r.service === service.value),
    );
    current.sort(
      (a, b) =>
        (sort.value === "most" ? b.hours - a.hours : sort.value === "fewest" ? a.hours - b.hours : 0) ||
        a.key.localeCompare(b.key),
    );
    for (const r of records) r.row.hidden = !current.includes(r);
    for (const r of current) body.append(r.row, r.detail);
    if (!current.some((r) => r.key === expanded)) expanded = "";
    showDetail();
    const total = current.reduce((n, r) => n + r.hours, 0);
    byId("hours-total").textContent = total;
    byId("ledger-summary").textContent =
      current.length +
      (current.length === 1 ? " record · " : " records · ") +
      total +
      (total === 1 ? " service hour" : " service hours");
    const chart = byId("ledger-chart");
    chart.replaceChildren();
    for (const name of ["Central", "North", "South"]) {
      if (district.selectedIndex && district.value !== name) continue;
      const hours = current.filter((r) => r.district === name).reduce((n, r) => n + r.hours, 0);
      const line = element("div", undefined, "district-bar"),
        track = element("div"),
        bar = element("i");
      track.setAttribute("aria-hidden", "true");
      bar.style.width = (hours / 12) * 100 + "%";
      track.append(bar);
      line.append(element("span", name), track, element("b", hours + " h"));
      chart.append(line);
    }
    byId("ledger-empty").hidden = current.length > 0;
    byId("export-ledger").disabled = current.length === 0;
    save();
  }
  for (const r of records) {
    r.toggle.hidden = false;
    r.row.querySelector(".plain-record").hidden = true;
    r.toggle.addEventListener("click", () => {
      expanded = expanded === r.key ? "" : r.key;
      showDetail();
      save();
    });
  }
  for (const el of [district, service, sort]) el.addEventListener("change", draw);
  workspace.querySelector(".ledger-filters").hidden = false;
  byId("ledger-clear").addEventListener("click", () => {
    district.selectedIndex = 0;
    service.selectedIndex = 0;
    draw();
    district.focus();
  });
  const download = byId("export-ledger");
  download.hidden = false;
  download.addEventListener("click", () => {
    if (!current.length) return;
    const values = current.map((r) => [r.key, r.district, r.service, r.hours]);
    downloadFile(
      "sample-service-ledger.csv",
      [["Record", "District", "Service", "Hours"], ...values].map((row) => row.join(",")).join("\r\n") +
        "\r\n",
      "text/csv;charset=utf-8",
    );
  });
  draw();
}

if (byId("query")) renderSearch();
if (byId("service-query")) renderFinder();
if (byId("desk-step")) permitDesk();
if (byId("district")) ledger();
// These planning tools keep drafts in the current tab, including across refreshes.
function tabDraft(key) {
  return {
    load() {
      try {
        return JSON.parse(sessionStorage.getItem(key));
      } catch {
        return null;
      }
    },
    save(value) {
      try {
        if (value === null) sessionStorage.removeItem(key);
        else sessionStorage.setItem(key, JSON.stringify(value));
      } catch {
        // A browser can disable storage. The form and its download still work.
      }
    },
  };
}
if (byId("brief")) {
  const form = byId("brief");
  const draft = tabDraft("ridgefolio.project-brief.v1");
  const restored = draft.load();
  for (const field of form.querySelectorAll("textarea")) {
    if (typeof restored?.[field.name] === "string") {
      field.value = restored[field.name].slice(0, field.maxLength);
    }
  }
  const projectName = form.querySelector("textarea[required]");
  function validateName() {
    projectName.setCustomValidity(projectName.value && !projectName.value.trim() ? "Enter a project name." : "");
  }
  validateName();
  form.addEventListener("input", () => {
    validateName();
    draft.save(Object.fromEntries(new FormData(form)));
    byId("brief-state").textContent = "";
  });
  form.addEventListener("reset", () => {
    projectName.setCustomValidity("");
    draft.save(null);
    byId("brief-state").textContent = "Brief cleared.";
  });
  form.addEventListener("submit", (event) => {
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
}
if (byId("checklist")) {
  const boxes = [...byId("checklist").querySelectorAll("input")];
  const draft = tabDraft("ridgefolio.launch-checklist.v1");
  const restored = draft.load();
  if (Array.isArray(restored)) {
    boxes.forEach((box, i) => { box.checked = restored[i] === true; });
  }
  function updateCount() {
    byId("check-count").textContent =
      boxes.filter((b) => b.checked).length +
      " of " +
      boxes.length +
      " checked";
  }
  updateCount();
  byId("checklist").addEventListener("change", () => {
    draft.save(boxes.map((box) => box.checked));
    updateCount();
  });
  document.querySelector("[data-clear-checks]").addEventListener("click", () => {
    boxes.forEach((box) => { box.checked = false; });
    draft.save(null);
    updateCount();
  });
  document.querySelector("[data-download-checks]").addEventListener("click", () => {
    const entries = boxes.map(box => {
      const label = box.closest("label");
      return (box.checked ? "[x] " : "[ ] ") + label.querySelector("strong").textContent +
        "\n" + label.querySelector("span").lastChild.textContent;
    });
    downloadFile("website-launch-checklist.txt", entries.join("\n\n"));
    updateCount();
    byId("check-count").append(". Download started.");
  });
}

for (const field of document.querySelectorAll('#contact-body textarea[required], #contactform textarea[required], #contactform input[type=text][required]')) {
  const validate = () => {
    const label = field.labels?.[0]?.textContent.trim() || "This field";
    field.setCustomValidity(field.value && !field.value.trim() ? label + " is required." : "");
  };
  field.addEventListener("input", validate);
  validate();
}
