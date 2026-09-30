---
layout: single
title: "Travel"
permalink: /travel/
author_profile: true
excerpt: "Places Shengwei Liu has visited around the world."
---

<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="">

<p>Places I've been so far. Drag to explore, click the map to enable scroll-zoom, or pick a city below to fly there.</p>

<div id="travel-stats" class="travel-stats"></div>

<div id="travel-map" class="travel-map" aria-label="World map of places visited"></div>

<div id="travel-list" class="travel-list"></div>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
<script src="https://cdn.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js"></script>
<script src="{{ site.baseurl }}/assets/js/travel-map.js"></script>
