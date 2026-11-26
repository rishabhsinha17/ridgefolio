(() => {
  const atlas = document.querySelector("[data-atlas]");
  if (!atlas) return;

  const image = atlas.querySelector("img");
  const map = image.parentElement;
  const canvas = atlas.querySelector("canvas");
  const status = document.getElementById("atlas-status");
  const park = document.getElementById("atlas-park");
  const result = atlas.querySelector(".atlas-result");
  const tools = atlas.querySelector(".atlas-tools");

  async function start() {
    const response = await fetch("/assets/parks.json");
    if (!response.ok) return;
    const records = await response.json();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const base = new Image();
    base.src = "/assets/project-evidence/parks-base.svg";
    await base.decode();
    const counts = new Map();
    for (const record of records) counts.set(record.status, (counts.get(record.status) || 0) + 1);
    status.add(new Option("All statuses", ""));
    for (const [value, count] of [...counts].sort((a, b) => b[1] - a[1])) {
      status.add(new Option(value + " (" + count + ")", value));
    }

    let visible = records;
    function point(record, width, height) {
      return [(record.lon - 93) / 44 * width, (9.4 - record.lat) / 21 * height];
    }
    function paint() {
      const {width, height} = map.getBoundingClientRect();
      if (!width || !height) return;
      const ratio = window.devicePixelRatio || 1;
      const pixelsWide = Math.round(width * ratio);
      const pixelsHigh = Math.round(height * ratio);
      if (canvas.width !== pixelsWide || canvas.height !== pixelsHigh) {
        canvas.width = pixelsWide;
        canvas.height = pixelsHigh;
      }
      ctx.setTransform(pixelsWide / width, 0, 0, pixelsHigh / height, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const dot = Math.max(2, 5 * width / 1440);
      const selected = visible.find(record => record.name === park.value);
      for (const record of visible) {
        const [x, y] = point(record, width, height);
        ctx.beginPath();
        ctx.arc(x, y, dot, 0, Math.PI * 2);
        ctx.fillStyle = "#ffdc96";
        ctx.fill();
        ctx.strokeStyle = "#635339";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      if (selected) {
        const [x, y] = point(selected, width, height);
        for (const [color, line] of [["#17312b", 5], ["#fffdf3", 2]]) {
          ctx.beginPath();
          ctx.arc(x, y, Math.max(7, dot * 3), 0, Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.lineWidth = line;
          ctx.stroke();
        }
      }
    }
    function inspect() {
      const selected = visible.find(record => record.name === park.value);
      result.textContent = selected
        ? selected.name + " · " + selected.status + " · " + Math.abs(selected.lat).toFixed(2) + "°" + (selected.lat < 0 ? "S" : "N") + ", " + selected.lon.toFixed(2) + "°E"
        : visible.length + " of " + records.length + " parks shown";
      paint();
    }
    function filter() {
      visible = records.filter(record => !status.value || record.status === status.value);
      park.replaceChildren(new Option("All matching parks", ""));
      for (const record of visible) park.add(new Option(record.name, record.name));
      inspect();
    }
    canvas.addEventListener("click", event => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      let nearest;
      let distance = matchMedia("(pointer: coarse)").matches ? 14 : 9;
      for (const record of visible) {
        const [px, py] = point(record, rect.width, rect.height);
        const gap = Math.hypot(px - x, py - y);
        if (gap < distance) {
          distance = gap;
          nearest = record;
        }
      }
      if (nearest) {
        park.value = nearest.name;
        inspect();
      }
    });
    status.addEventListener("change", filter);
    park.addEventListener("change", inspect);
    image.src = base.src;
    image.alt = "Map of Indonesia. Choose a park below to read its status and coordinates.";
    canvas.style.display = "block";
    tools.hidden = false;
    filter();
    new ResizeObserver(paint).observe(map);
    window.addEventListener("resize", paint);
  }
  start().catch(() => { /* The complete static map stays visible if the data cannot load. */ });
})();
