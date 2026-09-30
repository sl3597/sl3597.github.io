/* Travel map: visited countries shaded, visited cities marked. */
(function () {
  var PLACES = [
    { region: "United Kingdom", cities: [
      ["London", 51.5074, -0.1278], ["Edinburgh", 55.9533, -3.1883], ["Manchester", 53.4808, -2.2426],
      ["Oxford", 51.7520, -1.2577], ["Cambridge", 52.2053, 0.1218]] },
    { region: "France", cities: [["Paris", 48.8566, 2.3522], ["Nice", 43.7102, 7.2620]] },
    { region: "Spain", cities: [["Madrid", 40.4168, -3.7038]] },
    { region: "Italy", cities: [["Turin", 45.0703, 7.6869]] },
    { region: "Monaco", cities: [["Monaco", 43.7384, 7.4246]] },
    { region: "Germany", cities: [["Munich", 48.1351, 11.5820], ["Stuttgart", 48.7758, 9.1829]] },
    { region: "Switzerland", cities: [
      ["Zurich", 47.3769, 8.5417], ["Geneva", 46.2044, 6.1432], ["Lucerne", 47.0502, 8.3093], ["Bern", 46.9480, 7.4474]] },
    { region: "United States", cities: [
      ["New York", 40.7128, -74.0060], ["Washington, D.C.", 38.9072, -77.0369], ["San Francisco", 37.7749, -122.4194],
      ["Los Angeles", 34.0522, -118.2437], ["Las Vegas", 36.1699, -115.1398], ["Miami", 25.7617, -80.1918]] },
    { region: "Singapore", cities: [["Singapore", 1.3521, 103.8198]] },
    { region: "Malaysia", cities: [["Kuala Lumpur", 3.1390, 101.6869]] },
    { region: "China", cities: [
      ["Beijing", 39.9042, 116.4074], ["Shanghai", 31.2304, 121.4737], ["Guangzhou", 23.1291, 113.2644],
      ["Shenzhen", 22.5431, 114.0579], ["Chongqing", 29.5630, 106.5516], ["Suzhou", 31.2990, 120.5853],
      ["Nanjing", 32.0603, 118.7969], ["Chengdu", 30.5728, 104.0668], ["Wuhan", 30.5928, 114.3055]] },
    { region: "Hong Kong", cities: [["Hong Kong", 22.3193, 114.1694]] }
  ];

  /* ISO 3166-1 numeric ids used by world-atlas (Monaco, Singapore and Hong Kong are not separate shapes on the 110m map; their markers show them). */
  var VISITED_COUNTRY_IDS = ["826", "250", "724", "380", "276", "756", "840", "458", "156"];

  var el = document.getElementById("travel-map");
  if (!el || typeof L === "undefined") return;

  function isDark() {
    return document.documentElement.getAttribute("data-theme") === "dark";
  }
  function accent() {
    return getComputedStyle(document.documentElement).getPropertyValue("--global-base-color").trim() || "#2f7f93";
  }

  var map = L.map(el, {
    center: [30, 20],
    zoom: 2,
    minZoom: 2,
    maxZoom: 10,
    worldCopyJump: true,
    scrollWheelZoom: false
  });

  /* Only zoom with the scroll wheel after the map is clicked, so the page still scrolls normally. */
  map.on("click", function () { map.scrollWheelZoom.enable(); });
  map.on("mouseout", function () { map.scrollWheelZoom.disable(); });

  var tileUrl = function () {
    return "https://{s}.basemaps.cartocdn.com/" + (isDark() ? "dark_all" : "light_all") + "/{z}/{x}/{y}{r}.png";
  };
  var tiles = L.tileLayer(tileUrl(), {
    subdomains: "abcd",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }).addTo(map);

  var countryLayer = null;
  var markers = [];

  function countryStyle() {
    return { color: accent(), weight: 1, fillColor: accent(), fillOpacity: 0.28 };
  }
  function markerStyle() {
    return { radius: 5, color: "#fff", weight: 1.5, fillColor: accent(), fillOpacity: 1 };
  }

  PLACES.forEach(function (group) {
    group.cities.forEach(function (c) {
      var m = L.circleMarker([c[1], c[2]], markerStyle())
        .bindTooltip("<strong>" + c[0] + "</strong><br>" + group.region, { direction: "top", offset: [0, -4] })
        .addTo(map);
      markers.push(m);
    });
  });

  fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
    .then(function (r) { return r.json(); })
    .then(function (world) {
      var geo = topojson.feature(world, world.objects.countries);
      geo.features = geo.features.filter(function (f) {
        return VISITED_COUNTRY_IDS.indexOf(String(f.id)) !== -1;
      });
      countryLayer = L.geoJSON(geo, { style: countryStyle, interactive: false }).addTo(map);
      markers.forEach(function (m) { m.bringToFront(); });
    })
    .catch(function () { /* Country shading is optional; markers still show. */ });

  /* Follow the site's light/dark toggle. */
  new MutationObserver(function () {
    tiles.setUrl(tileUrl());
    if (countryLayer) countryLayer.setStyle(countryStyle());
    markers.forEach(function (m) { m.setStyle(markerStyle()); });
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  /* Stats and the list of places under the map. */
  var cityCount = PLACES.reduce(function (n, g) { return n + g.cities.length; }, 0);
  var stats = document.getElementById("travel-stats");
  if (stats) {
    stats.innerHTML = "<span><strong>" + cityCount + "</strong> cities</span><span><strong>" +
      PLACES.length + "</strong> countries &amp; regions</span>";
  }
  var list = document.getElementById("travel-list");
  if (list) {
    PLACES.forEach(function (g) {
      var row = document.createElement("div");
      row.className = "travel-row";
      var name = document.createElement("div");
      name.className = "travel-region";
      name.textContent = g.region;
      var chips = document.createElement("div");
      chips.className = "travel-chips";
      g.cities.forEach(function (c) {
        var chip = document.createElement("button");
        chip.type = "button";
        chip.className = "travel-chip";
        chip.textContent = c[0];
        chip.addEventListener("click", function () {
          map.flyTo([c[1], c[2]], 7, { duration: 1 });
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        });
        chips.appendChild(chip);
      });
      row.appendChild(name);
      row.appendChild(chips);
      list.appendChild(row);
    });
  }
})();
