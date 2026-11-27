// Register before editable markup: deferred downloads can arrive after the first edit.
(() => {
  const worksheet = document.currentScript.dataset.worksheet;
  const brief = worksheet === "project-brief";
  const key = "ridgefolio." + worksheet + ".v1";
  let saved;
  try { saved = JSON.parse(sessionStorage.getItem(key)); } catch { /* Storage can be disabled. */ }
  let values = brief
    ? (saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {})
    : (Array.isArray(saved) ? saved : []);

  const boxes = () => [...document.querySelectorAll("#checklist input[type=checkbox]")];
  function updateCount(inputs) {
    const count = document.getElementById("check-count");
    if (count) count.textContent = inputs.filter(box => box.checked).length + " of " + inputs.length + " checked";
  }
  function clear() {
    values = brief ? {} : [];
    try { sessionStorage.removeItem(key); } catch { /* Current fields remain usable. */ }
  }
  // Restore as soon as the parser finishes, including any edits made during parsing.
  document.addEventListener("readystatechange", () => {
    if (brief) {
      for (const field of document.querySelectorAll("#brief textarea[name]")) {
        if (typeof values[field.name] === "string") field.value = values[field.name].slice(0, field.maxLength);
      }
    } else {
      const inputs = boxes();
      inputs.forEach((box, index) => { box.checked = values[index] === true; });
      updateCount(inputs);
    }
  }, { once: true });

  document.addEventListener(brief ? "input" : "change", ({ target }) => {
    if (brief) {
      if (!target.matches("#brief textarea[name]")) return;
      values[target.name] = target.value;
    } else {
      if (!target.matches("#checklist input[type=checkbox]")) return;
      const inputs = boxes();
      values[inputs.indexOf(target)] = target.checked;
      updateCount(inputs);
    }
    try { sessionStorage.setItem(key, JSON.stringify(values)); } catch { /* Keep the in-memory draft. */ }
  }, true);
  if (brief) {
    document.addEventListener("reset", ({ target }) => { if (target.id === "brief") clear(); });
  } else {
    document.addEventListener("click", ({ target }) => {
      if (!target.closest("[data-clear-checks]")) return;
      const inputs = boxes();
      inputs.forEach(box => { box.checked = false; });
      clear();
      updateCount(inputs);
    });
  }
})();
