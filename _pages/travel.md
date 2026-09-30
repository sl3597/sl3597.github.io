---
layout: single
title: "Wanderlust"
hide_title: true
permalink: /wanderlust/
redirect_from:
  - /travel/
author_profile: true
excerpt: "The more I see, the more I learn — places Shengwei Liu has visited."
---

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/maplibre-gl@5.24.0/dist/maplibre-gl.css">

<div class="wl-hero">
  <div class="wl-hero__title">The more I see, the more I learn.</div>
  <div id="wl-stats" class="wl-stats"></div>
</div>

<div id="wl-filters" class="wl-filters" role="tablist" aria-label="Filter by continent"></div>

<div class="wl-map-card">
  <div id="wl-map" class="wl-map" aria-label="Interactive globe of places visited"></div>
  <div class="wl-legend">
    <span><i class="wl-legend__swatch"></i>Visited</span>
    <span><i class="wl-legend__pin"></i>City</span>
  </div>
  <div class="wl-credit"><a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a></div>
  <button id="wl-reset" class="wl-reset" type="button" title="Back to globe" aria-label="Back to globe">&#8634;</button>
</div>

<!-- Places list is hidden for now; remove "hidden" to show it again. -->
<div id="wl-list" class="wl-list" hidden></div>

<script src="https://cdn.jsdelivr.net/npm/maplibre-gl@5.24.0/dist/maplibre-gl.js"></script>
<script src="{{ site.baseurl }}/assets/lib/topojson-client.min.js"></script>
<script src="{{ site.baseurl }}/assets/js/travel-map.js" data-world="{{ site.baseurl }}/assets/data/countries-50m.json"></script>
