/* Wanderlust: 3D globe (MapLibre + OpenFreeMap, no API key) with visited countries and cities. */
(function () {
  /* id = ISO 3166-1 numeric code used by world-atlas. To add a place, add a city (name, lat, lng) or a country entry. */
  var PLACES = [
    { continent: "Asia", country: "China", flag: "🇨🇳", id: "156", cities: [
      ["Beijing", 39.9042, 116.4074], ["Changsha", 28.2282, 112.9388], ["Chengdu", 30.5728, 104.0668], ["Chongqing", 29.5630, 106.5516],
      ["Dalian", 38.9140, 121.6147], ["Ganzhou", 25.8311, 114.9336], ["Guangzhou", 23.1291, 113.2644], ["Guilin", 25.2736, 110.2900],
      ["Hangzhou", 30.2741, 120.1551], ["Jinan", 36.6512, 117.1201], ["Nanchang", 28.6820, 115.8579], ["Nanjing", 32.0603, 118.7969],
      ["Qingdao", 36.0671, 120.3826], ["Shanghai", 31.2304, 121.4737], ["Shenzhen", 22.5431, 114.0579], ["Suzhou", 31.2990, 120.5853],
      ["Wuhan", 30.5928, 114.3055], ["Xiamen", 24.4798, 118.0894]] },
    { continent: "Asia", country: "Hong Kong", flag: "🇭🇰", id: "344", cities: [["Hong Kong", 22.3193, 114.1694]] },
    { continent: "Asia", country: "Malaysia", flag: "🇲🇾", id: "458", cities: [["Kuala Lumpur", 3.1390, 101.6869]] },
    { continent: "Asia", country: "Singapore", flag: "🇸🇬", id: "702", cities: [["Singapore", 1.3521, 103.8198]] },
    { continent: "Asia", country: "United Arab Emirates", flag: "🇦🇪", id: "784", cities: [["Abu Dhabi", 24.4539, 54.3773], ["Dubai", 25.2048, 55.2708]] },
    { continent: "Europe", country: "France", flag: "🇫🇷", id: "250", cities: [["Nice", 43.7102, 7.2620], ["Paris", 48.8566, 2.3522]] },
    { continent: "Europe", country: "Germany", flag: "🇩🇪", id: "276", cities: [
      ["Frankfurt", 50.1109, 8.6821], ["Konstanz", 47.6603, 9.1758], ["Munich", 48.1351, 11.5820], ["Stuttgart", 48.7758, 9.1829]] },
    { continent: "Europe", country: "Iceland", flag: "🇮🇸", id: "352", cities: [
      ["Bláskógabyggð", 64.1690, -20.4900], ["Fjaðrárgljúfur", 63.7713, -18.1717], ["Grundarfjörður", 64.9243, -23.2531], ["Hellissandur", 64.9143, -23.8740],
      ["Jökulsárlón", 64.0784, -16.2306], ["Reykjavík", 64.1466, -21.9426], ["Seljalandsfoss", 63.6156, -19.9886], ["Vík", 63.4186, -19.0060],
      ["Þingvellir", 64.2559, -21.1299]] },
    { continent: "Europe", country: "Italy", flag: "🇮🇹", id: "380", cities: [["Turin", 45.0703, 7.6869]] },
    { continent: "Europe", country: "Monaco", flag: "🇲🇨", id: "492", cities: [["Monaco", 43.7384, 7.4246]] },
    { continent: "Europe", country: "Spain", flag: "🇪🇸", id: "724", cities: [["Madrid", 40.4168, -3.7038]] },
    { continent: "Europe", country: "Switzerland", flag: "🇨🇭", id: "756", cities: [
      ["Bern", 46.9480, 7.4474], ["Geneva", 46.2044, 6.1432], ["Grindelwald", 46.6242, 8.0414], ["Interlaken", 46.6863, 7.8632],
      ["Lucerne", 47.0502, 8.3093], ["Spiez", 46.6860, 7.6800], ["Thun", 46.7580, 7.6280], ["Zermatt", 46.0207, 7.7491],
      ["Zurich", 47.3769, 8.5417]] },
    { continent: "Europe", country: "Türkiye", flag: "🇹🇷", id: "792", cities: [["Istanbul", 41.0082, 28.9784]] },
    { continent: "Europe", country: "United Kingdom", flag: "🇬🇧", id: "826", cities: [
      ["Brighton", 50.8225, -0.1372], ["Cambridge", 52.2053, 0.1218], ["Edinburgh", 55.9533, -3.1883], ["London", 51.5074, -0.1278],
      ["Manchester", 53.4808, -2.2426], ["Oxford", 51.7520, -1.2577]] },
    { continent: "North America", country: "Bahamas", flag: "🇧🇸", id: "044", cities: [["Bimini", 25.7280, -79.2966]] },
    { continent: "North America", country: "Turks and Caicos", flag: "🇹🇨", id: "796", cities: [["Grand Turk", 21.4675, -71.1389]] },
    { continent: "North America", country: "United States", flag: "🇺🇸", id: "840", cities: [
      ["Boston", 42.3601, -71.0589], ["Detroit", 42.3314, -83.0458], ["Ithaca", 42.4440, -76.5019], ["Las Vegas", 36.1699, -115.1398],
      ["Los Angeles", 34.0522, -118.2437], ["Miami", 25.7617, -80.1918], ["Monterey", 36.6002, -121.8947], ["New York", 40.7128, -74.0060],
      ["Philadelphia", 39.9526, -75.1652], ["San Francisco", 37.7749, -122.4194], ["Santa Barbara", 34.4208, -119.6982], ["Washington, D.C.", 38.9072, -77.0369]] }
  ];

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
  function styleUrl() {
    return "https://tiles.openfreemap.org/styles/" + (isDark() ? "dark" : "positron");
  }

  var HOME = { center: [60, 28], zoom: 2.05 };

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

  /* Scroll-zoom only after the map is clicked, so the page still scrolls normally. */
  map.on("click", function () { map.scrollZoom.enable(); });
  el.addEventListener("mouseleave", function () { map.scrollZoom.disable(); });

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

  /* Cleaner basemap: English labels only, no hillshade. */
  function tidyBasemap() {
    map.getStyle().layers.forEach(function (l) {
      if (l.type === "raster" || l.type === "hillshade") map.setLayoutProperty(l.id, "visibility", "none");
      if (l.type === "fill" && /^water/.test(l.id)) map.setPaintProperty(l.id, "fill-color", isDark() ? "#16232d" : "#cfe4ee");
      if (l.type === "background") map.setPaintProperty(l.id, "background-color", isDark() ? "#2a2f33" : "#f6f6f3");
      if (l.type === "symbol" && l.layout && l.layout["text-field"]) {
        map.setLayoutProperty(l.id, "text-field", ["coalesce", ["get", "name:en"], ["get", "name_en"], ["get", "name"]]);
      }
    });
  }

  function addOverlays() {
    tidyBasemap();
    map.setProjection({ type: "globe" });
    if (map.setSky) {
      map.setSky({
        "sky-color": isDark() ? "#0f1a24" : "#e6f2f8",
        "horizon-color": isDark() ? "#23394a" : "#ffffff",
        "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 1, 5, 1, 7, 0]
      });
    }
    var before = firstSymbolLayer();
    var a = accent();

    worldPromise.then(function (geo) {
      if (!geo || map.getSource("visited")) return;
      map.addSource("visited", { type: "geojson", data: geo });
      map.addLayer({ id: "visited-fill", type: "fill", source: "visited",
        paint: { "fill-color": a, "fill-opacity": ["case", ["boolean", ["feature-state", "hover"], false], isDark() ? 0.75 : 0.55, isDark() ? 0.5 : 0.32] } }, before);
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
        paint: { "text-color": isDark() ? "#f1f1f1" : "#333333", "text-halo-color": isDark() ? "#000000" : "#ffffff", "text-halo-width": 1.2 } });
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

  map.on("style.load", addOverlays);
  map.on("error", function () { /* Tile hiccups should not break the page. */ });

  /* Follow the site's light/dark toggle. */
  new MutationObserver(function () {
    bound = { country: false, city: false };
    map.setStyle(styleUrl());
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
    map.flyTo({ center: HOME.center, zoom: HOME.zoom, duration: 1600 });
  }

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
