(() => {
  const atlas = document.querySelector("[data-atlas]");
  if (!atlas) return;
  const image = atlas.querySelector("img");
  const canvas = atlas.querySelector("canvas");
  const status = document.getElementById("atlas-status");
  const park = document.getElementById("atlas-park");
  const result = atlas.querySelector(".atlas-result");
  const tools = atlas.querySelector(".atlas-tools");
  async function start() {
    const response = await fetch("/assets/parks.json");
    if (!response.ok) return;
    const records = await response.json();
    const base = new Image();
    base.src = "/assets/editorial/archipelago-base.webp";
    await base.decode();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const counts = new Map();
    for (const record of records) counts.set(record.status, (counts.get(record.status) || 0) + 1);
    status.add(new Option("All statuses", ""));
    for (const [value, count] of [...counts].sort((a,b) => b[1]-a[1])) {
      status.add(new Option(value + " (" + count + ")", value));
    }
    let visible = records;
    function point(record) {
      return [(record.lon - 93) / 44 * base.width, (9.4 - record.lat) / 21 * base.height];
    }
    function render() {
      const selected = visible.find(record => record.name === park.value);
      canvas.width = base.width;
      canvas.height = base.height;
      ctx.drawImage(base, 0, 0);
      for (const record of visible) {
        const [x,y] = point(record);
        ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#ffdc96"; ctx.fill();
        ctx.strokeStyle = "#635339"; ctx.lineWidth = 1; ctx.stroke();
      }
      if (selected) {
        const [x,y] = point(selected);
        for (const [radius,color,width] of [[16,"#17312b",7],[16,"#fffdf3",3]]) {
          ctx.beginPath(); ctx.arc(x,y,radius,0,Math.PI*2);
          ctx.strokeStyle=color; ctx.lineWidth=width; ctx.stroke();
        }
      }
      result.textContent = selected
        ? selected.name + " · " + selected.status + " · " + Math.abs(selected.lat).toFixed(2) + "°" + (selected.lat<0?"S":"N") + ", " + selected.lon.toFixed(2) + "°E"
        : visible.length + " of " + records.length + " parks shown";
    }
    function filter() {
      visible = records.filter(record => !status.value || record.status === status.value);
      park.replaceChildren(new Option("All matching parks", ""));
      for (const record of visible) park.add(new Option(record.name,record.name));
      render();
    }
    status.addEventListener("change",filter);
    park.addEventListener("change",render);
    filter();
    image.hidden = true;
    canvas.style.display = "block";
    tools.hidden = false;
  }
  start().catch(() => { /* The initial map and source link remain usable offline. */ });
})();

