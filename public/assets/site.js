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
        if (!terms.length) {
          results.replaceChildren();
          status.textContent = "";
          return;
        }
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
          ? matches.length + (matches.length === 1 ? " page found" : " pages found")
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
if (byId("query")) renderSearch();
if (byId("brief")) {
  const form = byId("brief");
  const projectName = form.querySelector("textarea[required]");
  function validateName() {
    projectName.setCustomValidity(projectName.value && !projectName.value.trim() ? "Enter a project name." : "");
  }
  validateName();
  form.addEventListener("input", () => {
    validateName();
    byId("brief-state").textContent = "";
  });
  form.addEventListener("reset", () => {
    projectName.setCustomValidity("");
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
  for (const button of form.querySelectorAll("button")) button.disabled = false;
}
if (byId("checklist")) {
  const boxes = [...byId("checklist").querySelectorAll("input")];
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
  for (const button of byId("checklist").querySelectorAll("button")) button.disabled = false;
}
