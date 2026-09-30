---
layout: single
title: "Wanderlust"
hide_title: true
permalink: /wanderlust/
redirect_from:
  - /travel/
author_profile: true
excerpt: "Seeing the world, one city at a time — places Shengwei Liu has visited."
---

<link rel="stylesheet" href="{{ site.baseurl }}/assets/lib/leaflet/leaflet.css">

<div class="wl-hero">
  <p class="wl-hero__title">Seeing the world, one city at a time.</p>
  <div id="wl-stats" class="wl-stats"></div>
</div>

<div id="wl-filters" class="wl-filters" role="tablist" aria-label="Filter by continent"></div>

<div class="wl-map-card">
  <div id="wl-map" class="wl-map" aria-label="World map of places visited"></div>
  <div class="wl-legend">
    <span><i class="wl-legend__swatch"></i>Visited</span>
    <span><i class="wl-legend__pin"></i>City</span>
  </div>
</div>
<p class="wl-hint">Drag to explore · click the map to zoom with your scroll wheel · tap a country or city below to fly there</p>

<div id="wl-list" class="wl-list"></div>

<script src="{{ site.baseurl }}/assets/lib/leaflet/leaflet.js"></script>
<script src="{{ site.baseurl }}/assets/lib/topojson-client.min.js"></script>
<script src="{{ site.baseurl }}/assets/js/travel-map.js" data-world="{{ site.baseurl }}/assets/data/countries-50m.json"></script>
