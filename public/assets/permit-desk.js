"use strict";
(() => {
  const desk = document.getElementById("permit-workspace");
  if (!desk) return;
  const id = name => desk.querySelector("#" + name);
  const intake = id("pd-intake");
  const note = id("pd-note");
  const key = "ridgefolio.permit-desk.case.v1";
  const fields = { name:"Event name", venue:"Event location", date:"Event date", attendance:"Expected attendance", plan:"Event plan" };
  const stages = { opened:"Draft", submitted:"In review", returned:"Correction requested", approved:"Approved" };
  const documentDate = new Intl.DateTimeFormat(undefined, { year:"numeric", month:"short", day:"numeric" });
  const eventTime = new Intl.DateTimeFormat(undefined, { year:"numeric", month:"short", day:"numeric", hour:"numeric", minute:"2-digit" });
  const calendarDate = date => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0,10);
  const moment = () => new Date().toISOString();

  function fresh() {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return {
      draft:{ name:"Harbor market", venue:"Harbor Square", date:calendarDate(date), attendance:"120", plan:"Outdoor neighborhood market with vendor stalls and a pedestrian entrance." },
      note:"Please specify the entrance or assembly point.",
      events:[{ type:"opened", when:moment() }]
    };
  }
  const containsFields = value => value && Object.keys(fields).every(field => typeof value[field] === "string");
  const isEventDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value + "T12:00:00"));
  const isHeadcount = value => Number.isSafeInteger(Number(value)) && Number(value) > 0;
  function load() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(key));
      if (!saved || !containsFields(saved.draft) || typeof saved.note !== "string" || !Array.isArray(saved.events) || !saved.events.length) return fresh();
      let prior = "";
      for (const event of saved.events) {
        if (!event || !Number.isFinite(Date.parse(event.when))) return fresh();
        const transitions = { "":["opened"], opened:["submitted"], submitted:["returned","approved"], returned:["submitted"], approved:[] };
        if (!transitions[prior].includes(event.type)) return fresh();
        if (event.type === "submitted" && (!containsFields(event.record) || !isEventDate(event.record.date) || !isHeadcount(event.record.attendance))) return fresh();
        if (event.type === "returned" && typeof event.note !== "string") return fresh();
        prior = event.type;
      }
      return saved;
    } catch { return fresh(); }
  }
  let state = load();
  let undo;
  function save() {
    try {
      sessionStorage.setItem(key, JSON.stringify(state));
      id("pd-local").textContent = "Saved in this tab.";
    } catch {
      id("pd-local").textContent = "Browser storage is unavailable. Keep this page open to retain your work.";
    }
  }
  function clearUndo() { undo = undefined; id("pd-undo").hidden = true; }
  const latest = () => state.events[state.events.length - 1];
  const submitted = () => state.events.filter(event => event.type === "submitted");
  const differences = (old, record) => Object.keys(fields).filter(field => old[field] !== record[field]);
  function display(field, value) {
    return field === "date" ? documentDate.format(new Date(value + "T12:00:00")) : value || "Not specified";
  }
  function row(label, ...content) {
    const pair = document.createElement("div");
    const dd = document.createElement("dd");
    dd.append(...content);
    pair.append(element("dt", label), dd);
    return pair;
  }

  // Both the browser timeline and the exported receipt describe the same saved events.
  function history() {
    let previous, revision = 0;
    return state.events.map(event => {
      let title, detail = "";
      switch (event.type) {
        case "opened":
          title = "Sample case opened";
          break;
        case "submitted": {
          revision++;
          title = "Applicant submitted revision " + revision;
          if (previous) detail = differences(previous,event.record).map(field =>
            fields[field] + ": " + display(field,previous[field]) + " → " + display(field,event.record[field])).join("\n");
          previous = event.record;
          break;
        }
        case "returned":
          title = "Staff returned revision " + revision;
          detail = event.note;
          break;
        case "approved":
          title = "Staff approved revision " + revision;
          break;
      }
      return {title,detail,when:event.when};
    });
  }
  function renderHistory() {
    id("desk-history").replaceChildren(...history().reverse().map(entry => {
      const item = document.createElement("li");
      const time = element("time", eventTime.format(new Date(entry.when)));
      time.dateTime = entry.when;
      item.append(element("strong",entry.title),time);
      if (entry.detail) item.append(element("p",entry.detail));
      return item;
    }));
  }
  function renderRecord(revisions) {
    const record = revisions[revisions.length-1].record;
    id("pd-record-title").textContent = "Submitted application · Revision " + revisions.length;
    id("pd-record-fields").replaceChildren(...Object.entries(fields).map(([field,label]) => row(label,display(field,record[field]))));
    const before = revisions.length > 1 ? revisions[revisions.length-2].record : null;
    id("pd-changes").hidden = !before;
    if (before) id("pd-changed-fields").replaceChildren(...differences(before,record).map(field =>
      row(fields[field],element("span","Previously: " + display(field,before[field]),"pd-before"),element("span","Now: " + display(field,record[field]),"pd-after"))));
  }
  function setError(input, message) {
    const error = id(input.id + "-error");
    if (!error) return;
    error.textContent = message;
    error.hidden = !message;
    if (message) {
      input.setAttribute("aria-invalid","true");
      input.setAttribute("aria-describedby",error.id);
    } else {
      input.removeAttribute("aria-invalid");
      input.removeAttribute("aria-describedby");
    }
  }
  function render(focus) {
    const last = latest(), correction = last.type === "returned", review = last.type === "submitted", approved = last.type === "approved";
    const editing = !review && !approved, revisions = submitted();
    const stage = stages[last.type];
    desk.dataset.stage = stage;
    id("desk-status").textContent = stage;
    id("desk-status").hidden = false;
    id("pd-revision").textContent = revisions.length ? "Revision " + revisions.length : "Unsubmitted";
    id("pd-role").textContent = approved ? "Decision record" : editing ? "Applicant view" : "Staff review";
    const heading = id("desk-heading");
    heading.textContent = correction ? "Correct your application" : review ? "Review application" : approved ? "Permit receipt" : "Application intake";
    id("pd-instructions").textContent = correction ? "Address the reviewer’s note and return the revised application to staff."
      : review ? "Check the submitted details, then approve the permit or send a specific correction back to the applicant."
      : approved ? "The approved application and its review history are ready to download."
      : "Review the sample details, then submit the application to the permit desk.";
    const returned = correction ? last : (review && revisions.length > 1 ? state.events[state.events.length-2] : null);
    id("pd-reviewer-note").hidden = !returned;
    id("pd-reviewer-note").textContent = returned ? "Reviewer note: " + returned.note : "";
    intake.hidden = !editing;
    id("pd-record").hidden = editing;
    id("pd-review").hidden = !review;
    id("pd-receipt").hidden = !approved;
    id("desk-correction-error").hidden = true;
    for (const field of Object.keys(fields)) {
      const input = intake.elements[field];
      if (editing) input.value = state.draft[field];
      setError(input,"");
    }
    note.value = state.note;
    setError(note,"");
    id("pd-submit").textContent = correction ? "Resubmit correction" : "Submit application";
    if (!editing) renderRecord(revisions);
    renderHistory();
    id("pd-undo").hidden = !undo;
    id("pd-live").hidden = false;
    if (focus) heading.focus();
  }
  function advance(event) {
    clearUndo();
    state.events.push({...event,when:moment()});
    save();
    render(true);
  }
  intake.addEventListener("input", event => {
    const input = event.target;
    if (!Object.hasOwn(fields,input.name)) return;
    clearUndo();
    state.draft[input.name] = input.value;
    setError(input,"");
    if (intake.elements.name.getAttribute("aria-describedby") === "desk-correction-error") intake.elements.name.removeAttribute("aria-describedby");
    id("desk-correction-error").hidden = true;
    save();
  });
  intake.addEventListener("submit", event => {
    event.preventDefault();
    if (!["opened","returned"].includes(latest().type)) return;
    const record = Object.fromEntries(Object.keys(fields).map(field => [field,intake.elements[field].value.trim()]));
    let first;
    for (const field of ["name","venue","date","attendance"]) {
      const input = intake.elements[field];
      let message = "";
      if (field === "attendance" && !isHeadcount(record.attendance)) message = "Enter a whole number of at least 1.";
      else if (field === "date" && !isEventDate(record.date)) message = "Enter a valid event date.";
      else if (!record[field]) message = "Enter the " + fields[field].toLowerCase() + ".";
      setError(input,message);
      if (message && !first) first = input;
    }
    if (first) { first.focus(); return; }
    record.attendance = String(Number(record.attendance));
    const revisions = submitted();
    if (revisions.length && !differences(revisions[revisions.length-1].record,record).length) {
      id("desk-correction-error").hidden = false;
      intake.elements.name.setAttribute("aria-describedby","desk-correction-error");
      intake.elements.name.focus();
      return;
    }
    state.draft = {...record};
    advance({type:"submitted",record});
  });
  note.addEventListener("input", () => { clearUndo(); state.note = note.value; setError(note,""); save(); });
  id("pd-return").addEventListener("submit",event => {
    event.preventDefault();
    if (latest().type !== "submitted") return;
    const reason = note.value.trim();
    if (!reason) { setError(note,"Tell the applicant what to change."); note.focus(); return; }
    state.note = ""; // A new review should only send a new instruction deliberately entered by staff.
    advance({type:"returned",note:reason});
  });
  id("pd-approve").addEventListener("click",() => {
    if (latest().type === "submitted") advance({type:"approved"});
  });
  id("pd-receipt").addEventListener("click",() => {
    if (latest().type !== "approved") return;
    const revisions = submitted(), record = revisions[revisions.length-1].record;
    const lines = ["RIDGEFOLIO DEMONSTRATION · FICTIONAL PERMIT","Community event permit | RF-101","Decision: Approved",
      "Approved revision: " + revisions.length,"Decision time (UTC): " + latest().when, "", "APPROVED APPLICATION"];
    for (const [field,label] of Object.entries(fields)) lines.push(label + ": " + (record[field] || "Not specified"));
    lines.push("", "CASE HISTORY (UTC)");
    for (const entry of history()) { lines.push(entry.when + " — " + entry.title); if (entry.detail) lines.push(entry.detail); }
    downloadFile("sample-permit-receipt.txt",lines.join("\n") + "\n");
  });
  id("desk-reset").addEventListener("click",() => {
    if (!undo) undo = state;
    state = fresh();
    save(); render(true);
  });
  id("pd-undo").addEventListener("click",() => {
    if (!undo) return;
    state = undo;
    clearUndo(); save(); render(true);
  });
  save();
  render(false);
})();
