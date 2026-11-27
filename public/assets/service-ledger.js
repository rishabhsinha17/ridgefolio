(() => {
  const ledger = document.getElementById("service-ledger");
  if (!ledger) return;

  const district = byId("district");
  const service = byId("ledger-service");
  const sort = byId("ledger-sort");
  const body = byId("ledger-rows");
  const chart = byId("ledger-chart");
  const clear = byId("ledger-clear");
  const groupButtons = [...ledger.querySelectorAll("[data-group]")];
  const hours = minutes => String(minutes / 60);
  const countLabel = (count, noun) => count + " " + noun + (count === 1 ? "" : "s");
  const totalMinutes = records => records.reduce((sum, item) => sum + item.minutes, 0);

  const records = [...body.querySelectorAll(".ledger-entry")].map(row => {
    const key = row.dataset.key;
    const log = byId("log-" + key);
    const entries = [...log.querySelectorAll("li[data-minutes]")].map(entry => ({
      day: entry.dataset.day,
      team: entry.querySelector(".log-team").textContent,
      work: entry.querySelector(".log-work").textContent,
      minutes: Number(entry.dataset.minutes),
    }));
    return {
      key, row, log, entries,
      district: row.querySelector(".record-district").textContent,
      service: row.querySelector(".record-service").textContent,
      minutes: totalMinutes(entries),
      toggle: row.querySelector(".ledger-toggle"),
    };
  });

  const params = new URLSearchParams(location.search);
  for (const [control, name] of [[district, "district"], [service, "service"], [sort, "sort"]]) {
    const match = [...control.options].find(option => option.value === params.get(name));
    if (match) control.value = match.value;
  }
  let group = params.get("group") === "service" ? "service" : "district";
  let openKey = params.get("record") || "";
  let visible = [];

  function keepView() {
    const url = new URL(location.href);
    const values = {
      district: district.selectedIndex ? district.value : "",
      service: service.selectedIndex ? service.value : "",
      sort: sort.selectedIndex ? sort.value : "",
      group: group === "district" ? "" : group,
      record: openKey,
    };
    for (const [key, value] of Object.entries(values)) {
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    }
    if (url.href !== location.href) history.replaceState(history.state, "", url);
  }

  function downloadCsv(filename, rows) {
    const cell = value => {
      const text = String(value);
      return /[",\r\n]/.test(text) ? '"' + text.replaceAll('"', '""') + '"' : text;
    };
    downloadFile(filename, rows.map(row => row.map(cell).join(",")).join("\r\n") + "\r\n", "text/csv;charset=utf-8");
  }

  function updateOpenLog() {
    for (const record of records) {
      const opened = !record.row.hidden && record.key === openKey;
      record.log.hidden = !opened;
      record.log.querySelector("details").open = opened;
      record.toggle.setAttribute("aria-expanded", String(opened));
    }
  }

  function updateChart(sum) {
    const totals = new Map();
    for (const record of visible) {
      const label = record[group];
      totals.set(label, (totals.get(label) || 0) + record.minutes);
    }
    const items = [...totals].sort(([a, av], [b, bv]) => bv - av || a.localeCompare(b));
    const control = group === "district" ? district : service;
    chart.replaceChildren();
    for (const [label, minutes] of items) {
      const line = element("li", undefined, "ledger-bar");
      const pick = element("button", label, "ledger-group-key");
      pick.type = "button";
      pick.dataset.label = label;
      const isSelected = control.selectedIndex !== 0 && control.value === label;
      pick.setAttribute("aria-pressed", String(isSelected));
      pick.setAttribute("aria-label", (isSelected ? "Clear" : "Filter to") + " " + label + " " + group);
      pick.addEventListener("click", () => {
        if (isSelected) control.selectedIndex = 0;
        else control.value = label;
        render();
        [...chart.querySelectorAll(".ledger-group-key")].find(button => button.dataset.label === label)?.focus();
      });
      const track = element("span", undefined, "ledger-track");
      track.setAttribute("aria-hidden", "true");
      const fill = element("i");
      fill.style.width = (100 * minutes / sum) + "%";
      track.append(fill);
      line.append(pick, track, element("strong", hours(minutes) + " h"));
      chart.append(line);
    }
    byId("ledger-breakdown-title").textContent = "Hours by " + group;
    chart.setAttribute("aria-label", "Hours grouped by " + group);
    ledger.querySelector(".ledger-chart-empty").hidden = items.length > 0;
    ledger.querySelector(".ledger-measure").hidden = items.length === 0;
    for (const button of groupButtons) {
      button.setAttribute("aria-pressed", String(button.dataset.group === group));
    }
  }

  function render() {
    visible = records.filter(record =>
      (!district.selectedIndex || record.district === district.value) &&
      (!service.selectedIndex || record.service === service.value)
    );
    visible.sort((a, b) => {
      const difference = sort.value === "most" ? b.minutes - a.minutes : sort.value === "fewest" ? a.minutes - b.minutes : 0;
      return difference || a.key.localeCompare(b.key);
    });
    const keys = new Set(visible.map(record => record.key));
    if (!keys.has(openKey)) openKey = "";
    for (const record of records) record.row.hidden = !keys.has(record.key);
    for (const record of visible) body.append(record.row, record.log);
    updateOpenLog();
    const sum = totalMinutes(visible);
    byId("ledger-hours").textContent = hours(sum);
    byId("ledger-register-total").textContent = hours(sum);
    byId("ledger-summary").textContent = countLabel(visible.length, "record") + " · " + countLabel(sum / 60, "service hour");
    clear.hidden = !district.selectedIndex && !service.selectedIndex;
    byId("ledger-empty").hidden = visible.length > 0;
    updateChart(sum);
    keepView();
  }

  function resetFilters() {
    district.selectedIndex = 0;
    service.selectedIndex = 0;
    openKey = "";
    render();
    district.focus();
  }

  for (const record of records) {
    record.row.querySelector(".ledger-key").hidden = true;
    record.toggle.hidden = false;
    record.toggle.addEventListener("click", () => {
      openKey = openKey === record.key ? "" : record.key;
      updateOpenLog();
      keepView();
    });
    const download = record.log.querySelector(".ledger-log-download");
    download.hidden = false;
    download.addEventListener("click", () => downloadCsv(record.key + "-work-log.csv", [
      ["Record", "Date", "Team", "Work", "Hours"],
      ...record.entries.map(entry => [record.key, entry.day, entry.team, entry.work, hours(entry.minutes)]),
    ]));
  }
  for (const control of [district, service, sort]) control.addEventListener("change", render);
  for (const button of groupButtons) button.addEventListener("click", () => {
    group = button.dataset.group;
    render();
  });
  clear.addEventListener("click", resetFilters);
  byId("ledger-reset-empty").addEventListener("click", resetFilters);
  const download = byId("export-ledger");
  download.addEventListener("click", () => downloadCsv("sample-service-ledger.csv", [
    ["Record", "District", "Service", "Hours"],
    ...visible.map(record => [record.key, record.district, record.service, hours(record.minutes)]),
  ]));
  download.hidden = false;
  for (const control of ledger.querySelectorAll(".ledger-instruction, .ledger-controls, .ledger-sort, .ledger-groups")) {
    control.hidden = false;
  }
  ledger.dataset.enhanced = "true";
  render();
})();
