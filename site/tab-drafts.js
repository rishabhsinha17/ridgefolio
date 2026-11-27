// Native controls are editable while deferred site scripts are still downloading.
(() => {
  const worksheet = document.currentScript.dataset.worksheet;
  const brief = worksheet === "project-brief";
  const key = "ridgefolio." + worksheet + ".v1";
  let saved;
  try { saved = JSON.parse(sessionStorage.getItem(key)); } catch { /* Storage can be disabled. */ }
  const values = brief
    ? (saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {})
    : (Array.isArray(saved) ? saved : []);

  const early = new AbortController();
  const boxes = () => [...document.querySelectorAll("#checklist input[type=checkbox]")];
  function updateCount(inputs) {
    const count = document.getElementById("check-count");
    if (count) count.textContent = inputs.filter(box => box.checked).length + " of " + inputs.length + " checked";
  }
  // The parser reaches "interactive" before outstanding deferred scripts run.
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
  }, {once: true, signal: early.signal});

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
    try { sessionStorage.setItem(key, JSON.stringify(values)); } catch { /* Editing and downloads still work. */ }
  }, { capture: true, signal: early.signal });
  document.addEventListener("ridgefolio:worksheet-ready", () => early.abort(), {once: true});
})();
