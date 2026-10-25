/* Wanderlust: 3D globe (MapLibre + OpenFreeMap, no API key) with visited countries and cities. */
(function () {
  var PLACES = window.WL_PLACES || [];

  var el = document.getElementById("wl-map");
  if (!el || typeof maplibregl === "undefined") return;

  var script = document.currentScript || document.querySelector("script[data-world]");
  var worldUrl = script.getAttribute("data-world");

  var byId = {};
  PLACES.forEach(function (p) {
    byId[p.id] = p;
    p.cities.sort(function (x, y) { return x[0].localeCompare(y[0], "en"); });
  });
  var continents = [];
  PLACES.forEach(function (p) { if (continents.indexOf(p.continent) === -1) continents.push(p.continent); });
  continents.sort();

  function isDark() { return document.documentElement.getAttribute("data-theme") === "dark"; }
  function accent() {
    return getComputedStyle(document.documentElement).getPropertyValue("--global-base-color").trim() || "#2f7f93";
  }
  /* Both themes use the same positron style, so labels, fonts, filters, roads and
     borders are identical; dark mode only recolors it (see tidyBasemap). */
  function styleUrl() {
    return "https://tiles.openfreemap.org/styles/positron";
  }

  /* Home zoom is tuned for the ~770x520 desktop card; scale it down for narrower
     containers (phones) so the whole globe still fits on first load. */
  function homeZoom() {
    var fit = Math.min(el.clientWidth / 770, el.clientHeight / 520, 1);
    return Math.max(0.8, 2.05 + Math.log2(fit));
  }
  var HOME = { center: [60, 28], zoom: homeZoom() };

  var map = new maplibregl.Map({
    container: el,
    style: styleUrl(),
    center: HOME.center,
    zoom: HOME.zoom,
    minZoom: 0.8,
    maxZoom: 12,
    attributionControl: false,
    cooperativeGestures: false,
    scrollZoom: false,
    dragRotate: false,
    pitchWithRotate: false,
    renderWorldCopies: false
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-left");

  /* Scroll-zoom only after the map is clicked, so the page still scrolls normally.
     Trackpad pinch (a ctrlKey wheel event) always zooms the map instead of the page. */
  var clickZoom = false;
  var gesturing = false;
  map.on("click", function () { clickZoom = true; map.scrollZoom.enable(); });
  el.addEventListener("mouseleave", function () { clickZoom = false; map.scrollZoom.disable(); });
  el.parentNode.addEventListener("wheel", function (e) {
    if (!el.contains(e.target)) return;
    if (gesturing) { e.preventDefault(); e.stopPropagation(); return; }
    if (e.ctrlKey) map.scrollZoom.enable();
    else if (!clickZoom) map.scrollZoom.disable();
  }, { capture: true, passive: false });

  /* Safari reports trackpad pinch as gesture events rather than ctrlKey wheels. */
  var gestureZoom = 0;
  el.addEventListener("gesturestart", function (e) {
    e.preventDefault();
    gesturing = true;
    stopSpin();
    gestureZoom = map.getZoom();
  });
  el.addEventListener("gesturechange", function (e) {
    e.preventDefault();
    map.jumpTo({ zoom: gestureZoom + Math.log2(e.scale) });
  });
  el.addEventListener("gestureend", function (e) { e.preventDefault(); gesturing = false; });

  /* ---------- Gentle auto-rotation until the visitor interacts ---------- */

  var spinning = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function spin() {
    if (!spinning || map.getZoom() > 2.5) return;
    var c = map.getCenter();
    map.easeTo({ center: [c.lng + 12, c.lat], duration: 1000, easing: function (t) { return t; } });
  }
  function stopSpin() { spinning = false; }
  map.on("moveend", spin);
  ["mousedown", "touchstart", "wheel", "dragstart"].forEach(function (ev) { map.on(ev, stopSpin); });

  /* ---------- Visited-country highlight (self-hosted country shapes) ---------- */

  var countriesGeo = null;
  var worldPromise = fetch(worldUrl)
    .then(function (r) { return r.json(); })
    .then(function (world) {
      var geo = topojson.feature(world, world.objects.countries);
      geo.features = geo.features.filter(function (f) { return byId[String(f.id)]; });
      geo.features.forEach(function (f) {
        var p = byId[String(f.id)];
        f.id = Number(f.id);
        f.properties = { name: p.country, flag: p.flag, cities: p.cities.map(function (c) { return c[0]; }).join(" · ") };
      });
      countriesGeo = geo;
      return geo;
    })
    .catch(function () { return null; });

  function citiesGeo() {
    var feats = [];
    PLACES.forEach(function (p) {
      p.cities.forEach(function (c) {
        feats.push({ type: "Feature", properties: { name: c[0], country: p.country, flag: p.flag },
          geometry: { type: "Point", coordinates: [c[2], c[1]] } });
      });
    });
    return { type: "FeatureCollection", features: feats };
  }

  function firstSymbolLayer() {
    var layers = map.getStyle().layers;
    for (var i = 0; i < layers.length; i++) if (layers[i].type === "symbol") return layers[i].id;
    return undefined;
  }

  /* Dark palette for positron, keyed by layer type and id pattern. */
  var DARK = {
    background: "#2a2f33",
    water: "#16232d",
    green: "#2c3431",
    land: "#33383d",
    ice: "#3a4046",
    buildingLine: "#40464b",
    waterway: "#1f3542",
    boundary: "#6b7279",
    roadCasing: "#23272b",
    roadInner: "#4d545b",
    roadMinor: "#3d444a",
    rail: "#4a5056",
    text: "#e6ebef",
    textMuted: "#b8c0c7",
    textRoad: "#aab2b9",
    textWater: "#8fb4d6",
    halo: "#1b1f23"
  };

  function darkPaint(l) {
    var id = l.id;
    if (l.type === "background") return { "background-color": DARK.background };
    if (l.type === "fill") {
      if (/^water/.test(id)) return { "fill-color": DARK.water };
      if (/park|wood/.test(id)) return { "fill-color": DARK.green };
      if (/ice|glacier/.test(id)) return { "fill-color": DARK.ice };
      if (/pier/.test(id)) return { "fill-color": DARK.background };
      if (id === "building") return { "fill-color": DARK.land, "fill-outline-color": DARK.buildingLine };
      return { "fill-color": DARK.land };
    }
    if (l.type === "line") {
      if (/^boundary/.test(id)) return { "line-color": DARK.boundary };
      if (/^waterway/.test(id)) return { "line-color": DARK.waterway };
      if (/dashline|pier/.test(id)) return { "line-color": DARK.background };
      if (/casing/.test(id)) return { "line-color": DARK.roadCasing };
      if (/railway|aeroway/.test(id)) return { "line-color": DARK.rail };
      if (/inner/.test(id)) return { "line-color": DARK.roadInner };
      return { "line-color": DARK.roadMinor };
    }
    if (l.type === "symbol" && l.layout && l.layout["text-field"]) {
      var color = DARK.text;
      if (/water/.test(id)) color = DARK.textWater;
      else if (/highway|airport|road/.test(id)) color = DARK.textRoad;
      else if (/label_(other|state)/.test(id)) color = DARK.textMuted;
      return { "text-color": color, "text-halo-color": DARK.halo };
    }
    return null;
  }

  function lightPaint(l) {
    if (l.type === "background") return { "background-color": "#f6f6f3" };
    if (l.type === "fill" && /^water/.test(l.id)) return { "fill-color": "#cfe4ee" };
    return null;
  }

  /* The original paint of each layer, captured once per style load, so the
     light theme can be restored after a dark recolor without reloading. */
  var basePaint = {};

  /* Cleaner basemap: English labels only, no hillshade, theme colors. */
  function tidyBasemap() {
    var dark = isDark();
    map.getStyle().layers.forEach(function (l) {
      if (l.type === "raster" || l.type === "hillshade") map.setLayoutProperty(l.id, "visibility", "none");
      if (l.type === "symbol" && l.layout && l.layout["text-field"]) {
        map.setLayoutProperty(l.id, "text-field", ["coalesce", ["get", "name:en"], ["get", "name_en"], ["get", "name"]]);
      }
      var paint = dark ? darkPaint(l) : lightPaint(l);
      var base = basePaint[l.id] || (basePaint[l.id] = l.paint ? JSON.parse(JSON.stringify(l.paint)) : {});
      if (!dark) {
        /* restore anything the dark pass touched */
        var d = darkPaint(l);
        if (d) Object.keys(d).forEach(function (k) {
          if (!(paint && k in paint)) map.setPaintProperty(l.id, k, base[k] === undefined ? null : base[k]);
        });
      }
      if (paint) Object.keys(paint).forEach(function (k) { map.setPaintProperty(l.id, k, paint[k]); });
    });
  }

  function visitedFillOpacity() {
    return ["case", ["boolean", ["feature-state", "hover"], false], isDark() ? 0.75 : 0.55, isDark() ? 0.5 : 0.32];
  }
  function cityLabelPaint() {
    return { "text-color": isDark() ? "#f1f1f1" : "#333333", "text-halo-color": isDark() ? "#000000" : "#ffffff", "text-halo-width": 1.2 };
  }

  /* Everything that depends on the theme; runs on style load and on toggle. */
  function applyTheme() {
    tidyBasemap();
    if (map.setSky) {
      map.setSky({
        "sky-color": isDark() ? "#0f1a24" : "#e6f2f8",
        "horizon-color": isDark() ? "#23394a" : "#ffffff",
        "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 1, 5, 1, 7, 0]
      });
    }
    var a = accent();
    if (map.getLayer("visited-fill")) {
      map.setPaintProperty("visited-fill", "fill-color", a);
      map.setPaintProperty("visited-fill", "fill-opacity", visitedFillOpacity());
    }
    if (map.getLayer("visited-line")) {
      map.setPaintProperty("visited-line", "line-color", a);
      map.setPaintProperty("visited-line", "line-opacity", isDark() ? 1 : 0.8);
    }
    if (map.getLayer("city-label")) {
      var cp = cityLabelPaint();
      Object.keys(cp).forEach(function (k) { map.setPaintProperty("city-label", k, cp[k]); });
    }
  }

  function addOverlays() {
    basePaint = {};
    applyTheme();
    map.setProjection({ type: "globe" });
    var before = firstSymbolLayer();
    var a = accent();

    worldPromise.then(function (geo) {
      if (!geo || map.getSource("visited")) return;
      map.addSource("visited", { type: "geojson", data: geo });
      map.addLayer({ id: "visited-fill", type: "fill", source: "visited",
        paint: { "fill-color": a, "fill-opacity": visitedFillOpacity() } }, before);
      map.addLayer({ id: "visited-line", type: "line", source: "visited",
        paint: { "line-color": a, "line-width": 1, "line-opacity": isDark() ? 1 : 0.8 } }, before);
      bindCountryHover();
    });

    if (!map.getSource("cities")) {
      map.addSource("cities", { type: "geojson", data: citiesGeo() });
      map.addLayer({ id: "city-halo", type: "circle", source: "cities",
        paint: { "circle-radius": ["interpolate", ["linear"], ["zoom"], 1, 6, 6, 12], "circle-color": "#ef6b4a", "circle-opacity": 0.22 } });
      map.addLayer({ id: "city-dot", type: "circle", source: "cities",
        paint: { "circle-radius": ["interpolate", ["linear"], ["zoom"], 1, 3, 6, 6], "circle-color": "#ef6b4a",
          "circle-stroke-color": "#ffffff", "circle-stroke-width": 1.5 } });
      map.addLayer({ id: "city-label", type: "symbol", source: "cities", minzoom: 4,
        layout: { "text-field": ["get", "name"], "text-font": ["Noto Sans Regular"], "text-size": 12,
          "text-offset": [0, 1.1], "text-anchor": "top" },
        paint: cityLabelPaint() });
      bindCityHover();
    }
  }

  var popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, className: "wl-popup", offset: 10 });
  var hovered = null;
  var bound = { country: false, city: false };

  function bindCountryHover() {
    if (bound.country) return;
    bound.country = true;
    map.on("mousemove", "visited-fill", function (e) {
      if (!e.features.length || map.getLayer("city-dot") && map.queryRenderedFeatures(e.point, { layers: ["city-dot"] }).length) return;
      var f = e.features[0];
      if (hovered !== null) map.setFeatureState({ source: "visited", id: hovered }, { hover: false });
      hovered = f.id;
      map.setFeatureState({ source: "visited", id: hovered }, { hover: true });
      map.getCanvas().style.cursor = "pointer";
      popup.setLngLat(e.lngLat).setHTML("<strong>" + f.properties.flag + " " + f.properties.name + "</strong><br><span>" +
        f.properties.cities + "</span>").addTo(map);
    });
    map.on("mouseleave", "visited-fill", function () {
      if (hovered !== null) map.setFeatureState({ source: "visited", id: hovered }, { hover: false });
      hovered = null;
      map.getCanvas().style.cursor = "";
      popup.remove();
    });
    map.on("click", "visited-fill", function (e) {
      var p = PLACES.filter(function (x) { return x.country === e.features[0].properties.name; })[0];
      if (p) flyToCountry(p);
    });
  }

  function bindCityHover() {
    if (bound.city) return;
    bound.city = true;
    map.on("mouseenter", "city-dot", function (e) {
      var f = e.features[0];
      map.getCanvas().style.cursor = "pointer";
      popup.setLngLat(f.geometry.coordinates).setHTML("<strong>" + f.properties.name + "</strong><br><span>" +
        f.properties.flag + " " + f.properties.country + "</span>").addTo(map);
    });
    map.on("mouseleave", "city-dot", function () { map.getCanvas().style.cursor = ""; popup.remove(); });
    map.on("click", "city-dot", function (e) {
      stopSpin();
      map.flyTo({ center: e.features[0].geometry.coordinates, zoom: 8, duration: 1600 });
    });
  }

  var styleReady = false;
  map.on("style.load", function () { styleReady = true; addOverlays(); });
  map.on("error", function () { /* Tile hiccups should not break the page. */ });

  /* Follow the site's light/dark toggle by recoloring in place. The theme
     attribute is set by the main bundle, which may run before or after the
     style JSON arrives; if before, addOverlays picks the theme up itself. */
  new MutationObserver(function () {
    if (styleReady) applyTheme();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  /* ---------- Camera helpers ---------- */

  function boundsOf(points) {
    var b = new maplibregl.LngLatBounds();
    points.forEach(function (pt) { b.extend(pt); });
    return b;
  }
  function citiesPoints(list) {
    var pts = [];
    list.forEach(function (p) { p.cities.forEach(function (c) { pts.push([c[2], c[1]]); }); });
    return pts;
  }
  function flyToCountry(p) {
    stopSpin();
    if (p.cities.length === 1) {
      map.flyTo({ center: [p.cities[0][2], p.cities[0][1]], zoom: 6, duration: 1600 });
    } else {
      map.fitBounds(boundsOf(citiesPoints([p])), { padding: 80, maxZoom: 7, duration: 1600 });
    }
  }
  function flyHome() {
    map.flyTo({ center: HOME.center, zoom: homeZoom(), duration: 1600 });
  }
  function findCity(name) {
    var key = String(name || "").trim().toLowerCase();
    for (var i = 0; i < PLACES.length; i++) {
      for (var j = 0; j < PLACES[i].cities.length; j++) {
        if (PLACES[i].cities[j][0].toLowerCase() === key) return { place: PLACES[i], city: PLACES[i].cities[j] };
      }
    }
    return null;
  }
  function flyToCity(name) {
    var hit = findCity(name);
    if (!hit) return false;
    stopSpin();
    popup.remove();
    map.flyTo({ center: [hit.city[2], hit.city[1]], zoom: 8, duration: 1800 });
    map.once("moveend", function () {
      popup.setLngLat([hit.city[2], hit.city[1]])
        .setHTML("<strong>" + hit.city[0] + "</strong><br><span>" + hit.place.flag + " " + hit.place.country + "</span>")
        .addTo(map);
    });
    return true;
  }

  /* Deep link: /wanderlust/#to=Zermatt flies to that city once the globe is ready.
     The command palette uses this from other pages, and calls window.WL directly on this one. */
  function cityFromHash() {
    var m = /[#&]to=([^&]+)/.exec(location.hash);
    return m ? decodeURIComponent(m[1].replace(/\+/g, " ")) : null;
  }
  function goToHash() {
    var name = cityFromHash();
    if (name && flyToCity(name)) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  map.once("load", function () { setTimeout(goToHash, 300); });
  window.addEventListener("hashchange", goToHash);

  window.WL = {
    places: PLACES,
    flyToCity: function (name) {
      var ok = flyToCity(name);
      if (ok) {
        history.replaceState(null, "", "#to=" + encodeURIComponent(name));
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return ok;
    },
    flyHome: function () { stopSpin(); history.replaceState(null, "", location.pathname); flyHome(); }
  };

  /* ---------- Stats ---------- */

  var cityCount = PLACES.reduce(function (n, p) { return n + p.cities.length; }, 0);
  var stats = document.getElementById("wl-stats");
  if (stats) {
    [[cityCount, "cities"], [PLACES.length, "countries & regions"], [continents.length, "continents"]].forEach(function (s) {
      var d = document.createElement("div");
      d.className = "wl-stat";
      d.innerHTML = "<span class=\"wl-stat__num\">" + s[0] + "</span><span class=\"wl-stat__label\">" + s[1] + "</span>";
      stats.appendChild(d);
    });
  }

  /* ---------- Continent filters + country cards ---------- */

  var filters = document.getElementById("wl-filters");
  var list = document.getElementById("wl-list");
  var buttons = {};
  var groups = [];

  function setFilter(name) {
    stopSpin();
    Object.keys(buttons).forEach(function (k) {
      buttons[k].classList.toggle("is-active", k === name);
      buttons[k].setAttribute("aria-selected", k === name ? "true" : "false");
    });
    groups.forEach(function (c) { c.el.hidden = !(name === "All" || c.place.continent === name); });
    if (name === "All") {
      flyHome();
    } else {
      var group = PLACES.filter(function (p) { return p.continent === name; });
      map.fitBounds(boundsOf(citiesPoints(group)), { padding: 70, maxZoom: 5, duration: 1600 });
    }
  }

  if (filters) {
    ["All"].concat(continents).forEach(function (name) {
      var n = name === "All" ? PLACES.length : PLACES.filter(function (p) { return p.continent === name; }).length;
      var b = document.createElement("button");
      b.type = "button";
      b.className = "wl-filter";
      b.setAttribute("role", "tab");
      b.innerHTML = name + " <span>" + n + "</span>";
      b.addEventListener("click", function () { setFilter(name); });
      filters.appendChild(b);
      buttons[name] = b;
    });
    buttons.All.classList.add("is-active");
    buttons.All.setAttribute("aria-selected", "true");
  }

  if (list) {
    continents.forEach(function (cont) {
      var section = document.createElement("section");
      section.className = "wl-group";
      var h = document.createElement("h3");
      h.className = "wl-group__title";
      h.textContent = cont;
      section.appendChild(h);

      PLACES.filter(function (p) { return p.continent === cont; })
        .sort(function (x, y) { return x.country.localeCompare(y.country, "en"); })
        .forEach(function (p) {
        var row = document.createElement("div");
        row.className = "wl-row";

        var name = document.createElement("button");
        name.type = "button";
        name.className = "wl-row__country";
        name.innerHTML = "<span class=\"wl-row__flag\">" + p.flag + "</span>" + p.country;
        name.addEventListener("click", function () {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          flyToCountry(p);
        });

        var cities = document.createElement("div");
        cities.className = "wl-row__cities";
        p.cities.forEach(function (c) {
          var link = document.createElement("button");
          link.type = "button";
          link.className = "wl-city";
          link.textContent = c[0];
          link.addEventListener("click", function () {
            stopSpin();
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            map.flyTo({ center: [c[2], c[1]], zoom: 9, duration: 1800 });
          });
          cities.appendChild(link);
        });

        row.appendChild(name);
        row.appendChild(cities);
        section.appendChild(row);
      });

      list.appendChild(section);
      groups.push({ el: section, place: { continent: cont } });
    });
  }

  /* Reset button inside the map. */
  var reset = document.getElementById("wl-reset");
  if (reset) reset.addEventListener("click", function () { setFilter("All"); });
})();
