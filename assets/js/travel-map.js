/* Wanderlust map: a self-contained vector world map (no tile server or API key). */
(function () {
  /* id = ISO 3166-1 numeric code used by world-atlas. To add a place, add a city (name, lat, lng) or a country entry. */
  var PLACES = [
    { continent: "Europe", country: "United Kingdom", flag: "🇬🇧", id: "826", cities: [
      ["London", 51.5074, -0.1278], ["Edinburgh", 55.9533, -3.1883], ["Manchester", 53.4808, -2.2426],
      ["Oxford", 51.7520, -1.2577], ["Cambridge", 52.2053, 0.1218]] },
    { continent: "Europe", country: "France", flag: "🇫🇷", id: "250", cities: [["Paris", 48.8566, 2.3522], ["Nice", 43.7102, 7.2620]] },
    { continent: "Europe", country: "Spain", flag: "🇪🇸", id: "724", cities: [["Madrid", 40.4168, -3.7038]] },
    { continent: "Europe", country: "Italy", flag: "🇮🇹", id: "380", cities: [["Turin", 45.0703, 7.6869]] },
    { continent: "Europe", country: "Monaco", flag: "🇲🇨", id: "492", cities: [["Monaco", 43.7384, 7.4246]] },
    { continent: "Europe", country: "Germany", flag: "🇩🇪", id: "276", cities: [["Munich", 48.1351, 11.5820], ["Stuttgart", 48.7758, 9.1829]] },
    { continent: "Europe", country: "Switzerland", flag: "🇨🇭", id: "756", cities: [
      ["Zurich", 47.3769, 8.5417], ["Geneva", 46.2044, 6.1432], ["Lucerne", 47.0502, 8.3093], ["Bern", 46.9480, 7.4474]] },
    { continent: "Europe", country: "Iceland", flag: "🇮🇸", id: "352", cities: [["Reykjavík", 64.1466, -21.9426]] },
    { continent: "Europe", country: "Türkiye", flag: "🇹🇷", id: "792", cities: [["Istanbul", 41.0082, 28.9784]] },
    { continent: "North America", country: "United States", flag: "🇺🇸", id: "840", cities: [
      ["New York", 40.7128, -74.0060], ["Washington, D.C.", 38.9072, -77.0369], ["San Francisco", 37.7749, -122.4194],
      ["Los Angeles", 34.0522, -118.2437], ["Las Vegas", 36.1699, -115.1398], ["Miami", 25.7617, -80.1918]] },
    { continent: "Asia", country: "China", flag: "🇨🇳", id: "156", cities: [
      ["Beijing", 39.9042, 116.4074], ["Shanghai", 31.2304, 121.4737], ["Guangzhou", 23.1291, 113.2644],
      ["Shenzhen", 22.5431, 114.0579], ["Chongqing", 29.5630, 106.5516], ["Suzhou", 31.2990, 120.5853],
      ["Nanjing", 32.0603, 118.7969], ["Chengdu", 30.5728, 104.0668], ["Wuhan", 30.5928, 114.3055]] },
    { continent: "Asia", country: "Hong Kong", flag: "🇭🇰", id: "344", cities: [["Hong Kong", 22.3193, 114.1694]] },
    { continent: "Asia", country: "Singapore", flag: "🇸🇬", id: "702", cities: [["Singapore", 1.3521, 103.8198]] },
    { continent: "Asia", country: "Malaysia", flag: "🇲🇾", id: "458", cities: [["Kuala Lumpur", 3.1390, 101.6869]] },
    { continent: "Asia", country: "United Arab Emirates", flag: "🇦🇪", id: "784", cities: [["Dubai", 25.2048, 55.2708], ["Abu Dhabi", 24.4539, 54.3773]] }
  ];

  var el = document.getElementById("wl-map");
  if (!el || typeof L === "undefined" || typeof topojson === "undefined") return;

  var script = document.currentScript || document.querySelector("script[data-world]");
  var worldUrl = script.getAttribute("data-world");

  var byId = {};
  PLACES.forEach(function (p) { byId[p.id] = p; });

  var continents = [];
  PLACES.forEach(function (p) { if (continents.indexOf(p.continent) === -1) continents.push(p.continent); });

  function cssVar(name, fallback) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  }

  /* ---------- Map ---------- */

  var HOME = [[-45, -135], [70, 150]];
  var map = L.map(el, {
    zoomSnap: 0.25,
    minZoom: 1,
    maxZoom: 8,
    scrollWheelZoom: false,
    attributionControl: false,
    zoomControl: false,
    maxBounds: [[-65, -200], [85, 200]],
    maxBoundsViscosity: 0.8
  });
  map.fitBounds(HOME);
  L.control.zoom({ position: "bottomleft" }).addTo(map);

  /* Only zoom with the scroll wheel after the map is clicked, so the page still scrolls normally. */
  map.on("click", function () { map.scrollWheelZoom.enable(); });
  el.addEventListener("mouseleave", function () { map.scrollWheelZoom.disable(); });

  var Reset = L.Control.extend({
    options: { position: "bottomleft" },
    onAdd: function () {
      var bar = L.DomUtil.create("div", "leaflet-bar");
      var btn = L.DomUtil.create("a", "wl-reset", bar);
      btn.href = "#";
      btn.title = "Reset view";
      btn.setAttribute("role", "button");
      btn.innerHTML = "&#8634;";
      L.DomEvent.on(btn, "click", function (e) {
        L.DomEvent.preventDefault(e);
        L.DomEvent.stopPropagation(e);
        setFilter("All");
      });
      return bar;
    }
  });
  map.addControl(new Reset());

  /* Faint graticule every 30 degrees. */
  var graticule = L.layerGroup().addTo(map);
  function drawGraticule() {
    graticule.clearLayers();
    var style = { color: cssVar("--wl-grid", "#c9dde3"), weight: 0.6, dashArray: "2 4", interactive: false };
    for (var lat = -60; lat <= 60; lat += 30) graticule.addLayer(L.polyline([[lat, -180], [lat, 180]], style));
    for (var lng = -180; lng <= 180; lng += 30) graticule.addLayer(L.polyline([[-65, lng], [85, lng]], style));
  }
  drawGraticule();

  var countryLayer = null;
  var countryLayers = {};

  function countryStyle(feature) {
    var visited = !!byId[String(feature.id)];
    var accent = cssVar("--global-base-color", "#2f7f93");
    return {
      color: visited ? accent : cssVar("--wl-border", "#ffffff"),
      weight: visited ? 1 : 0.6,
      fillColor: visited ? accent : cssVar("--wl-land", "#dfe5e8"),
      fillOpacity: visited ? 0.62 : 1
    };
  }

  function cityNames(p) {
    return p.cities.map(function (c) { return c[0]; }).join(" · ");
  }

  fetch(worldUrl)
    .then(function (r) { return r.json(); })
    .then(function (world) {
      var geo = topojson.feature(world, world.objects.countries);
      geo.features = geo.features.filter(function (f) { return String(f.id) !== "010"; });
      countryLayer = L.geoJSON(geo, {
        style: countryStyle,
        onEachFeature: function (feature, layer) {
          var p = byId[String(feature.id)];
          if (!p) return;
          countryLayers[p.id] = layer;
          layer.bindTooltip(
            "<strong>" + p.flag + " " + p.country + "</strong><br><span>" + cityNames(p) + "</span>",
            { sticky: true, className: "wl-tip" }
          );
          layer.on("mouseover", function () { layer.setStyle({ fillOpacity: 0.85, weight: 1.6 }); });
          layer.on("mouseout", function () { countryLayer.resetStyle(layer); });
          layer.on("click", function () { flyToCountry(p); });
        }
      }).addTo(map);
      addPins();
    })
    .catch(function () {
      el.classList.add("wl-map--error");
      addPins();
    });

  function addPins() {
    var icon = L.divIcon({ className: "wl-pin", html: "<span></span>", iconSize: [12, 12] });
    PLACES.forEach(function (p) {
      p.cities.forEach(function (c) {
        L.marker([c[1], c[2]], { icon: icon, riseOnHover: true, keyboard: false })
          .bindTooltip("<strong>" + c[0] + "</strong><br><span>" + p.flag + " " + p.country + "</span>",
            { direction: "top", offset: [0, -6], className: "wl-tip" })
          .addTo(map);
      });
    });
  }

  function citiesBounds(list) {
    var pts = [];
    list.forEach(function (p) { p.cities.forEach(function (c) { pts.push([c[1], c[2]]); }); });
    return L.latLngBounds(pts);
  }

  function flyToCountry(p) {
    var layer = countryLayers[p.id];
    var b = citiesBounds([p]);
    /* Use the country shape unless it is huge or spans the antimeridian (e.g. the US with Alaska). */
    if (layer && p.id !== "840") b = layer.getBounds();
    map.flyToBounds(b.pad(0.3), { duration: 1, maxZoom: p.cities.length > 1 ? 6 : 7 });
  }

  new MutationObserver(function () {
    if (countryLayer) countryLayer.setStyle(countryStyle);
    drawGraticule();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

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
  var cards = [];

  function setFilter(name) {
    Object.keys(buttons).forEach(function (k) {
      buttons[k].classList.toggle("is-active", k === name);
      buttons[k].setAttribute("aria-selected", k === name ? "true" : "false");
    });
    cards.forEach(function (c) { c.el.hidden = !(name === "All" || c.place.continent === name); });
    if (name === "All") {
      map.flyToBounds(HOME, { duration: 0.9 });
    } else {
      var group = PLACES.filter(function (p) { return p.continent === name; });
      map.flyToBounds(citiesBounds(group).pad(0.25), { duration: 1, maxZoom: 5 });
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
    PLACES.forEach(function (p) {
      var card = document.createElement("div");
      card.className = "wl-card";

      var head = document.createElement("button");
      head.type = "button";
      head.className = "wl-card__head";
      head.innerHTML = "<span class=\"wl-card__flag\">" + p.flag + "</span>" +
        "<span class=\"wl-card__name\">" + p.country + "</span>" +
        "<span class=\"wl-card__count\">" + p.cities.length + "</span>";
      head.addEventListener("click", function () {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        flyToCountry(p);
      });

      var chips = document.createElement("div");
      chips.className = "wl-chips";
      p.cities.forEach(function (c) {
        var chip = document.createElement("button");
        chip.type = "button";
        chip.className = "wl-chip";
        chip.textContent = c[0];
        chip.addEventListener("click", function () {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          map.flyTo([c[1], c[2]], 7, { duration: 1.2 });
        });
        chips.appendChild(chip);
      });

      card.appendChild(head);
      card.appendChild(chips);
      list.appendChild(card);
      cards.push({ el: card, place: p });
    });
  }
})();
