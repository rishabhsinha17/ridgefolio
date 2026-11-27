(() => {
  const atlas = document.querySelector("[data-atlas]");
  if (!atlas || !window.L) return;
  const node = atlas.querySelector(".atlas-viewport");
  const staticImage = atlas.querySelector(".atlas-static");
  const tools = atlas.querySelector(".atlas-tools");
  const status = atlas.querySelector("#atlas-status");
  const region = atlas.querySelector("#atlas-region");
  const park = atlas.querySelector("#atlas-park");
  const result = atlas.querySelector(".atlas-result");
  const national = [[-10.3, 94.1], [7.2, 135.1]];
  const extent = [[-15, 89], [14, 144]];
  const labels = [
    ["Sumatra", 1.3, 98.2], ["Java", -8.9, 111.6], ["Borneo", 2.3, 112.8],
    ["Sulawesi", .6, 121.3], ["Papua", .2, 133.8], ["Banda Sea", -6, 129.7, true],
    ["Java Sea", -4.65, 109.8, true], ["Indian Ocean", -6.8, 100.8, true],
    ["Malaysia", 4.7, 102.1], ["Timor", -10.5, 124.8],
  ];
  const power = {grid:"PLN grid", solar:"solar", coal:"captive coal", gas:"captive gas", bio:"bioenergy", hydro:"hydropower", unclear:"provider unclear"};
  const tag = (name, text) => {
    const elem = document.createElement(name);
    elem.textContent = text;
    return elem;
  };

  async function start() {
    const [parksResponse, geoResponse, landResponse] = await Promise.all([fetch("/assets/parks.json"), fetch("/assets/cgs-atlas/geography.json"), fetch("/assets/cgs-atlas/land.json")]);
    if (!parksResponse.ok || !geoResponse.ok || !landResponse.ok) return;
    const [records, geo, landShapes] = await Promise.all([parksResponse.json(), geoResponse.json(), landResponse.json()]);
    const base = new Image();
    base.src = "/assets/cgs-atlas/relief.webp";
    await base.decode();

    node.hidden = false;
    const motion = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    const map = L.map(node, {crs:L.CRS.EPSG4326, zoomControl:false, attributionControl:false, fadeAnimation:false, zoomAnimation:motion, markerZoomAnimation:motion,
      scrollWheelZoom:false, zoomSnap:.05, zoomDelta:.85, minZoom:1, maxZoom:7.5,
      maxBounds:[[-18, 85], [18, 148]], maxBoundsViscosity:.8, preferCanvas:false});
    const terrainOverlay = L.imageOverlay(base.src, extent, {interactive:false, alt:""}).addTo(map);
    const landPane = map.createPane("atlasLand");
    landPane.style.zIndex = "350";
    landPane.style.pointerEvents = "none";
    const land = L.polygon(landShapes, {pane:"atlasLand", stroke:false, fillColor:"#d5dfc3", fillOpacity:1, interactive:false});
    const credit = atlas.querySelector(".atlas-key small");
    const groupLegend = atlas.querySelector(".group-text");
    const vectors = L.layerGroup().addTo(map);
    const places = L.layerGroup().addTo(map);
    const marks = L.layerGroup().addTo(map);
    let nationalZoom;
    let detailed;
    let visible = records;
    let activePopup;
    function camera(bounds, options={}) {
      map.fitBounds(bounds, {padding:[18, 18], animate:false, maxZoom:6.6, ...options});
    }
    function defaultView() {
      camera(national);
      nationalZoom = map.getZoom();
      map.setMinZoom(nationalZoom - .08);
    }
    defaultView();

    function mapButton(text, drawing, action) {
      const control = document.createElement("button");
      control.type = "button";
      control.title = text;
      control.setAttribute("aria-label", text);
      control.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="' + drawing + '" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      control.addEventListener("click", action);
      return control;
    }
    const navigation = L.control({position:"topright"});
    navigation.onAdd = () => {
      const box = L.DomUtil.create("div", "atlas-map-actions");
      L.DomEvent.disableClickPropagation(box);
      box.append(mapButton("Zoom in", "M12 4v16M4 12h16", () => map.zoomIn(.85,{animate:false})),
        mapButton("Zoom out", "M4 12h16", () => map.zoomOut(.85,{animate:false})),
        mapButton("Show the whole archipelago", "M9 4H4v5m11-5h5v5M4 15v5h5m11-5v5h-5", () => {
          region.value = ""; filter(); defaultView();
        }));
      return box;
    };
    navigation.addTo(map);
    L.control.scale({imperial:false, maxWidth:85, position:"bottomleft"}).addTo(map);

    function zoomLevel() {
      const z = map.getZoom();
      return z < 4.5 ? 0 : z < 5.8 ? 1 : 2;
    }
    function compactOverview() {
      return map.getSize().x < 530 && !region.value && map.getZoom() <= nationalZoom + .3;
    }
    function drawContext() {
      const lowerLeft = map.latLngToLayerPoint(extent[0]);
      const upperRight = map.latLngToLayerPoint(extent[1]);
      const dpr = devicePixelRatio || 1;
      const needsVector = (upperRight.x - lowerLeft.x) * dpr > base.naturalWidth ||
        (lowerLeft.y - upperRight.y) * dpr > base.naturalHeight;
      if (needsVector !== map.hasLayer(land)) {
        if (needsVector) land.addTo(map);
        else map.removeLayer(land);
        terrainOverlay.setOpacity(needsVector ? 0 : 1);
      }
      node.dataset.basemap = needsVector ? "vector" : "relief";
      credit.textContent = needsVector ? "Detail · Natural Earth" : "Relief · NASA / Natural Earth";
      groupLegend.textContent = compactOverview() ? "Parks in a region" : "Nearby parks";
      const level = zoomLevel();
      if (detailed !== level) {
        detailed = level;
        vectors.clearLayers();
        const styles = [
          [geo.coasts, {color:"#77988f", weight:level ? 1 : .7, opacity:.85}],
          [geo.rivers, {color:"#5994a0", weight:level ? 1.1 : .6, opacity:.73}],
          [geo.provinces, {color:"#8d856d", weight:level ? 1.2 : .6, opacity:.75, dashArray:"4 4"}],
        ];
        for (const [lines, style] of styles) L.polyline(lines, {interactive:false, ...style}).addTo(vectors);
      }
      places.clearLayers();
      const view = map.getBounds().pad(.04);
      const occupied = [];
      function label(name, lat, lon, style) {
        if (!view.contains([lat, lon])) return;
        const point = map.latLngToContainerPoint([lat, lon]);
        const width = name.length * (style === "town" ? 6 : 7);
        const box = L.bounds([point.x-width/2-4, point.y-8], [point.x+width/2+4, point.y+9]);
        if (occupied.some(other => other.intersects(box))) return;
        occupied.push(box);
        const span = tag("span", name);
        const icon = L.divIcon({className:"atlas-place " + style, iconSize:[0,0], iconAnchor:[0,0], html:span});
        L.marker([lat, lon], {icon, interactive:false, keyboard:false, zIndexOffset:-900}).addTo(places);
      }
      for (const [name,lat,lon,water] of labels) {
        if (compactOverview() && (name !== "Indian Ocean" || map.getSize().x < 360)) continue;
        label(name,lat,lon,water ? "water" : "island");
      }
      if (level || map.getSize().x > 680) {
        for (const [name,lat,lon,rank] of geo.places) {
          if (rank <= (level ? 2 + level * 2 : 1)) label(name,lat,lon,"town");
        }
      }
    }
    function clusters() {
      const groups = [];
      const useRegions = compactOverview();
      const radius = map.getZoom() >= 7 ? 13 : map.getSize().x < 500 ? 20 : 22;
      for (const record of visible) {
        const pos = map.latLngToLayerPoint([record.lat, record.lon]);
        let group = groups.find(g => useRegions ? g.regionName === record.region : g.center.distanceTo(pos) < radius);
        if (!group) {
          group = {center:pos, records:[], regionName:useRegions ? record.region : ""};
          groups.push(group);
        }
        const n = group.records.length;
        group.center = L.point((n * group.center.x + pos.x)/(n+1), (n * group.center.y + pos.y)/(n+1));
        group.records.push(record);
      }
      return groups;
    }
    function openRecord(record) {
      const card = document.createElement("div");
      card.className = "atlas-record";
      card.append(tag("small", record.province + " · " + record.region), tag("strong", record.name), tag("span", record.status));
      if (record.power.length) card.append(tag("p", "Power sources: " + record.power.map(key => power[key]).join(", ")));
      activePopup = L.popup({className:"atlas-popup", maxWidth:240, autoPan:true, autoPanPadding:[24,28]})
        .setLatLng([record.lat, record.lon]).setContent(card).openOn(map);
    }
    function inspect(record, zoom=true) {
      park.value = record.name;
      result.textContent = record.name + " · " + record.status + " · " + Math.abs(record.lat).toFixed(2) + "°" + (record.lat < 0 ? "S" : "N") + ", " + record.lon.toFixed(2) + "°E";
      if (zoom) map.setView([record.lat, record.lon], Math.max(map.getZoom(),6.35), {animate:false});
      drawMarks();
      openRecord(record);
    }
    function chooseGroup(group) {
      if (group.records.length > 1 && group.regionName) {
        region.value = group.regionName;
        focusRegion();
        return;
      }
      if (group.records.length === 1) return inspect(group.records[0]);
      const bounds = L.latLngBounds(group.records.map(r => [r.lat, r.lon]));
      const next = Math.min(map.getBoundsZoom(bounds,false,[42,42]), map.getMaxZoom());
      if (next > map.getZoom() + .2) {
        camera(bounds, {maxZoom:next, padding:[30,30]});
        return;
      }
      const choices = tag("div", "");
      choices.className = "atlas-record group-choices";
      choices.append(tag("strong", group.records.length + " parks at this location"));
      for (const r of group.records) {
        const button = tag("button", r.name);
        button.type = "button";
        button.addEventListener("click", () => inspect(r,false));
        choices.append(button);
      }
      L.popup({maxWidth:235}).setLatLng(bounds.getCenter()).setContent(choices).openOn(map);
    }
    function drawMarks() {
      marks.clearLayers();
      for (const group of clusters()) {
        const count = group.records.length;
        const selected = park.value && group.records.some(r => r.name === park.value);
        const size = count === 1 ? 13 : compactOverview() ? 26 : count < 10 ? 28 : 34;
        const title = count > 1 ? count + (group.regionName ? " parks in " + group.regionName : " nearby parks") + ". Zoom or inspect." : group.records[0].name;
        const label = tag("span", count > 1 ? count : "");
        const icon = L.divIcon({className:"atlas-symbol " + (count === 1 ? "single" : "cluster") + (selected ? " selected" : ""),
          html:label, iconSize:[size,size], iconAnchor:[size/2,size/2]});
        const marker = L.marker(map.layerPointToLatLng(group.center), {icon, title, alt:title, riseOnHover:true});
        marker.addTo(marks).on("click", () => chooseGroup(group));
        marker.getElement().setAttribute("aria-label",title);
        if (group.regionName && ["Java","Sumatra","Sulawesi","Kalimantan"].includes(group.regionName)) {
          const area = tag("small",group.regionName);
          area.className = "cluster-place " + group.regionName.toLowerCase();
          marker.getElement().append(area);
        }
        marker.getElement().addEventListener("keydown", e => {
          if (e.key === " ") {e.preventDefault(); chooseGroup(group);}
        });
      }
    }
    function populate(select, key, all) {
      const counts = new Map();
      for (const row of records) counts.set(row[key], (counts.get(row[key]) || 0) + 1);
      select.add(new Option(all,""));
      for (const [value,count] of [...counts].sort((a,b) => b[1]-a[1])) select.add(new Option(value + " (" + count + ")",value));
    }
    function filter() {
      if (activePopup) map.closePopup(activePopup);
      visible = records.filter(r => (!status.value || r.status === status.value) && (!region.value || r.region === region.value));
      park.replaceChildren(new Option("All matching parks", ""));
      for (const r of visible) park.add(new Option(r.name, r.name));
      result.textContent = visible.length + " of " + records.length + " parks shown";
      drawMarks();
    }
    function focusRegion() {
      filter();
      if (!region.value) return defaultView();
      const inRegion = records.filter(r => r.region === region.value);
      camera(L.latLngBounds(inRegion.map(r => [r.lat,r.lon])), {padding:[30,24]});
    }
    populate(status, "status", "All statuses");
    populate(region, "region", "All Indonesia");
    status.addEventListener("change", filter);
    region.addEventListener("change", focusRegion);
    park.addEventListener("change", () => {
      const current = visible.find(r => r.name === park.value);
      if (current) inspect(current);
      else filter();
    });
    document.querySelectorAll("a[data-region]").forEach(anchor => anchor.addEventListener("click", event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      region.value = anchor.dataset.region; status.value = "";
      focusRegion();
      document.getElementById("the-map").scrollIntoView({block:"start"});
      region.focus({preventScroll:true});
    }));
    map.on("zoomend moveend", () => {drawContext(); drawMarks();});
    let lastWidth = node.clientWidth;
    new ResizeObserver(() => {
      if (lastWidth !== node.clientWidth) {
        lastWidth = node.clientWidth; map.invalidateSize();
        map.setMinZoom(1); focusRegion();
      }
    }).observe(node);
    drawContext();
    region.value = new URLSearchParams(location.search).get("region") || "";
    if (!region.value) region.value = "";
    focusRegion();
    await terrainOverlay.getElement().decode();
    staticImage.hidden = true;
    tools.hidden = false;
    atlas.classList.add("interactive");
  }
  start().catch(() => {node.hidden=true; staticImage.hidden=false; tools.hidden=true;});
})();
