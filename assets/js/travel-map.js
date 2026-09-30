/* Wanderlust map: a self-contained vector world map (no tile server or API key). */
(function () {
  /* id = ISO 3166-1 numeric code used by world-atlas. */
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
    { continent: "North America", country: "United States", flag: "🇺🇸", id: "840", cities: [
      ["New York", 40.7128, -74.0060], ["Washington, D.C.", 38.9072, -77.0369], ["San Francisco", 37.7749, -122.4194],
      ["Los Angeles", 34.0522, -118.2437], ["Las Vegas", 36.1699, -115.1398], ["Miami", 25.7617, -80.1918]] },
    { continent: "Asia", country: "China", flag: "🇨🇳", id: "156", cities: [
      ["Beijing", 39.9042, 116.4074], ["Shanghai", 31.2304, 121.4737], ["Guangzhou", 23.1291, 113.2644],
      ["Shenzhen", 22.5431, 114.0579], ["Chongqing", 29.5630, 106.5516], ["Suzhou", 31.2990, 120.5853],
      ["Nanjing", 32.0603, 118.7969], ["Chengdu", 30.5728, 104.0668], ["Wuhan", 30.5928, 114.3055]] },
    { continent: "Asia", country: "Hong Kong", flag: "🇭🇰", id: "344", cities: [["Hong Kong", 22.3193, 114.1694]] },
    { continent: "Asia", country: "Singapore", flag: "🇸🇬", id: "702", cities: [["Singapore", 1.3521, 103.8198]] },
    { continent: "Asia", country: "Malaysia", flag: "🇲🇾", id: "458", cities: [["Kuala Lumpur", 3.1390, 101.6869]] }
  ];

  var el = document.getElementById("travel-map");
  if (!el || typeof L === "undefined" || typeof topojson === "undefined") return;

  var script = document.currentScript || document.querySelector("script[data-world]");
  var worldUrl = script.getAttribute("data-world");

  var byId = {};
  PLACES.forEach(function (p) { byId[p.id] = p; });

  function cssVar(name, fallback) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  }
  function colors() {
    return {
      accent: cssVar("--global-base-color", "#2f7f93"),
      land: cssVar("--travel-land", "#e3e7ea"),
      border: cssVar("--travel-border", "#ffffff")
    };
  }

  var map = L.map(el, {
    zoomSnap: 0.25,
    minZoom: 1,
    maxZoom: 8,
    scrollWheelZoom: false,
    attributionControl: false,
    maxBounds: [[-70, -200], [85, 200]],
    maxBoundsViscosity: 0.8
  });
  var HOME = [[-50, -150], [72, 160]];
  map.fitBounds(HOME);

  /* Only zoom with the scroll wheel after the map is clicked, so the page still scrolls normally. */
  map.on("click", function () { map.scrollWheelZoom.enable(); });
  el.addEventListener("mouseleave", function () { map.scrollWheelZoom.disable(); });

  /* Reset-view button under the zoom controls. */
  var Reset = L.Control.extend({
    options: { position: "topleft" },
    onAdd: function () {
      var btn = L.DomUtil.create("a", "travel-reset");
      btn.href = "#";
      btn.title = "Reset view";
      btn.setAttribute("role", "button");
      btn.innerHTML = "&#8634;";
      L.DomEvent.on(btn, "click", function (e) {
        L.DomEvent.preventDefault(e);
        L.DomEvent.stopPropagation(e);
        map.flyToBounds(HOME, { duration: 0.8 });
      });
      var bar = L.DomUtil.create("div", "leaflet-bar");
      bar.appendChild(btn);
      return bar;
    }
  });
  map.addControl(new Reset());

  var countryLayer = null;

  function countryStyle(feature) {
    var c = colors();
    var visited = !!byId[String(feature.id)];
    return {
      color: visited ? c.accent : c.border,
      weight: visited ? 1 : 0.5,
      fillColor: visited ? c.accent : c.land,
      fillOpacity: visited ? 0.55 : 1
    };
  }

  function citiesText(p) {
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
          layer.bindTooltip(
            "<strong>" + p.flag + " " + p.country + "</strong><br><span>" + citiesText(p) + "</span>",
            { sticky: true, className: "travel-tip" }
          );
          layer.on("mouseover", function () { layer.setStyle({ fillOpacity: 0.8 }); });
          layer.on("mouseout", function () { countryLayer.resetStyle(layer); });
        }
      }).addTo(map);
      addCities();
    })
    .catch(function () {
      el.classList.add("travel-map--error");
      addCities();
    });

  function addCities() {
    var icon = L.divIcon({ className: "travel-pin", html: "<span></span>", iconSize: [12, 12] });
    PLACES.forEach(function (p) {
      p.cities.forEach(function (c) {
        L.marker([c[1], c[2]], { icon: icon, riseOnHover: true })
          .bindTooltip("<strong>" + c[0] + "</strong><br><span>" + p.flag + " " + p.country + "</span>",
            { direction: "top", offset: [0, -6], className: "travel-tip" })
          .addTo(map);
      });
    });
  }

  /* Follow the site's light/dark toggle. */
  new MutationObserver(function () {
    if (countryLayer) countryLayer.setStyle(countryStyle);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  /* Stats row. */
  var cityCount = PLACES.reduce(function (n, p) { return n + p.cities.length; }, 0);
  var continents = [];
  PLACES.forEach(function (p) { if (continents.indexOf(p.continent) === -1) continents.push(p.continent); });
  var stats = document.getElementById("travel-stats");
  if (stats) {
    [[cityCount, "Cities"], [PLACES.length, "Countries & Regions"], [continents.length, "Continents"]].forEach(function (s) {
      var d = document.createElement("div");
      d.className = "travel-stat";
      d.innerHTML = "<span class=\"travel-stat__num\">" + s[0] + "</span><span class=\"travel-stat__label\">" + s[1] + "</span>";
      stats.appendChild(d);
    });
  }

  /* Places grouped by continent, one card per country. */
  var list = document.getElementById("travel-list");
  if (list) {
    continents.forEach(function (cont) {
      var h = document.createElement("h3");
      h.className = "travel-continent";
      h.textContent = cont;
      list.appendChild(h);
      var grid = document.createElement("div");
      grid.className = "travel-grid";
      PLACES.filter(function (p) { return p.continent === cont; }).forEach(function (p) {
        var card = document.createElement("div");
        card.className = "travel-card";
        var title = document.createElement("div");
        title.className = "travel-card__title";
        title.innerHTML = "<span class=\"travel-card__flag\">" + p.flag + "</span>" + p.country +
          "<span class=\"travel-card__count\">" + p.cities.length + "</span>";
        var chips = document.createElement("div");
        chips.className = "travel-chips";
        p.cities.forEach(function (c) {
          var chip = document.createElement("button");
          chip.type = "button";
          chip.className = "travel-chip";
          chip.textContent = c[0];
          chip.addEventListener("click", function () {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            map.flyTo([c[1], c[2]], 6, { duration: 1.2 });
          });
          chips.appendChild(chip);
        });
        card.appendChild(title);
        card.appendChild(chips);
        grid.appendChild(card);
      });
      list.appendChild(grid);
    });
  }
})();
