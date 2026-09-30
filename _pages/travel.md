---
layout: single
title: "Wanderlust"
permalink: /wanderlust/
redirect_from:
  - /travel/
author_profile: true
excerpt: "Seeing the world, one city at a time — places Shengwei Liu has visited."
---

<link rel="stylesheet" href="{{ site.baseurl }}/assets/lib/leaflet/leaflet.css">

<p class="travel-tagline">Seeing the world, one city at a time.</p>

<div id="travel-stats" class="travel-stats"></div>

<div class="travel-map-wrap">
  <div id="travel-map" class="travel-map" aria-label="World map of places visited"></div>
  <div class="travel-legend">
    <span><i class="travel-legend__swatch"></i>Visited</span>
    <span><i class="travel-legend__dot"></i>City</span>
  </div>
</div>
<p class="travel-hint">Drag to explore · click the map to zoom with your scroll wheel · pick a city below to fly there</p>

<div id="travel-list"></div>

<script src="{{ site.baseurl }}/assets/lib/leaflet/leaflet.js"></script>
<script src="{{ site.baseurl }}/assets/lib/topojson-client.min.js"></script>
<script src="{{ site.baseurl }}/assets/js/travel-map.js" data-world="{{ site.baseurl }}/assets/data/countries-50m.json"></script>
