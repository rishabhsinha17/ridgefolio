// Service records and blank checklists are already available in the HTML.
(() => {
  const app = document.querySelector(".finder-app");
  if (!app) return;
  const query = app.querySelector("#service-query");
  const topic = app.querySelector("#finder-topic");
  const count = app.querySelector("#match-count");
  const clear = app.querySelector(".finder-clear");
  const empty = app.querySelector(".finder-empty");

  const words = text => text.normalize("NFKD").replace(/\p{M}/gu, "")
    .toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];

  const rows = [...app.querySelectorAll(".finder-service")].map(record => {
    const content = [...record.querySelectorAll(
      ".finder-service-name, .finder-description, .finder-routing span, .finder-eligibility, .finder-items label, .finder-next"
    )].map(node => node.textContent).join(" ");
    return { record, terms: words(content + " " + record.dataset.keywords) };
  });

  function filter() {
    const terms = words(query.value);
    let matches = 0;
    for (const row of rows) {
      const matchesTopic = !topic.value || topic.value === row.record.dataset.topic;
      const matchesWords = terms.every(term => row.terms.some(word => word.startsWith(term)));
      row.record.hidden = !(matchesTopic && matchesWords);
      if (!row.record.hidden) matches++;
    }
    const message = matches
      ? matches + (matches === 1 ? " matching service" : " matching services")
      : "No matching services";
    if (count.textContent !== message) count.textContent = message;
    empty.hidden = matches !== 0;
    clear.hidden = !(query.value || topic.value);
  }

  function resetFilters() {
    query.value = "";
    topic.value = "";
    filter();
  }

  function setUpChecklist(record) {
    const inputs = [...record.querySelectorAll('input[type="checkbox"]')];
    const download = record.querySelector(".finder-file");
    const blank = decodeURIComponent(download.getAttribute("href").split(",")[1]);
    const progress = record.querySelector(".finder-progress");
    const storageKey = "ridgefolio.finder.v1." + record.id;
    const label = input => input.labels[0].textContent.trim();
    try {
      const stored = JSON.parse(sessionStorage.getItem(storageKey));
      if (Array.isArray(stored)) {
        for (const input of inputs) input.checked = stored.includes(label(input));
      }
    } catch { /* Checklists still work if browser storage is unavailable. */ }

    function update() {
      const marked = new Set(inputs.filter(input => input.checked).map(label));
      const lines = blank.split("\n").map(line =>
        line.startsWith("[ ] ") && marked.has(line.slice(4)) ? "[x] " + line.slice(4) : line
      );
      download.href = "data:text/plain;charset=utf-8," + encodeURIComponent(lines.join("\n"));
      progress.textContent = marked.size + " of " + inputs.length + " ready";
      return [...marked];
    }

    record.addEventListener("change", event => {
      if (!inputs.includes(event.target)) return;
      const checked = update();
      try { sessionStorage.setItem(storageKey, JSON.stringify(checked)); }
      catch { /* Local checkbox state and the download remain available. */ }
    });
    update();
    download.textContent = "Download checklist";
    progress.hidden = false;
  }

  // Fixed IDs address the same service even when the directory changes order.
  function revealLinkedService() {
    const id = location.hash.slice(1);
    const row = rows.find(({record}) => record.id === id);
    if (!row) return;
    if (row.record.hidden) resetFilters();
    row.record.open = true;
    requestAnimationFrame(() => row.record.scrollIntoView({block: "start", behavior: "instant"}));
  }

  for (const {record} of rows) setUpChecklist(record);
  app.querySelector(".finder-filters").hidden = false;
  query.addEventListener("input", filter);
  topic.addEventListener("change", filter);
  clear.addEventListener("click", () => {
    resetFilters();
    query.focus();
  });
  window.addEventListener("hashchange", revealLinkedService);
  window.addEventListener("pageshow", () => {
    filter();
    revealLinkedService();
  });
  filter();
  revealLinkedService();
})();
