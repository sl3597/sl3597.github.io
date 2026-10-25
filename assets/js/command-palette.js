/* Command palette (⌘K / Ctrl K) plus single-key shortcuts. Vanilla JS, no dependencies.
   Commands come from three places: the nav in _data/navigation.yml and author links in _config.yml
   (passed in via the #cmdk-data JSON), the h2/h3 headings of the current page, and the city list in
   /assets/js/wl-places.js, which the Wanderlust globe can fly to. */
(function () {
  var root = document.getElementById("cmdk");
  var input = document.getElementById("cmdk-input");
  var list = document.getElementById("cmdk-list");
  var modeChip = document.getElementById("cmdk-mode");
  var toast = document.getElementById("cmdk-toast");
  var dataEl = document.getElementById("cmdk-data");
  if (!root || !input || !list || !dataEl) return;

  var data = {};
  try { data = JSON.parse(dataEl.textContent); } catch (e) { data = {}; }

  var base = data.base || "";
  var basePath = "";
  try { basePath = new URL(base || "/", location.href).pathname.replace(/\/+$/, ""); } catch (e) { basePath = ""; }
  var isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform) || /Mac OS/.test(navigator.userAgent);
  var modKey = isMac ? "⌘" : "Ctrl";
  var onWanderlust = !!document.getElementById("wl-map");

  /* Hints in the masthead and the home hero say ⌘ by default; swap for Ctrl elsewhere. */
  Array.prototype.forEach.call(document.querySelectorAll("[data-modkey]"), function (k) { k.textContent = modKey; });

  /* ---------- helpers ---------- */

  function norm(s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c];
    });
  }
  /* Wrap the first match of q in <mark>, comparing on the accent-stripped string. */
  function highlight(label, q) {
    if (!q) return esc(label);
    var i = norm(label).indexOf(q);
    if (i < 0) return esc(label);
    return esc(label.slice(0, i)) + "<mark>" + esc(label.slice(i, i + q.length)) + "</mark>" + esc(label.slice(i + q.length));
  }
  function currentPath() {
    var p = location.pathname.replace(/index\.html$/, "").replace(/\/+$/, "");
    return p.indexOf(basePath) === 0 ? p.slice(basePath.length) : p;
  }
  function hrefFor(url) {
    return /^https?:\/\//.test(url) ? url : base + url;
  }
  function isEditable(t) {
    if (!t) return false;
    var tag = (t.tagName || "").toLowerCase();
    return tag === "input" || tag === "textarea" || tag === "select" || t.isContentEditable;
  }
  function toggleTheme() {
    var t = document.getElementById("theme-toggle");
    if (t) t.click(); /* the theme handler in _main.js is bound to this element */
  }
  function scrollToHeading(h) {
    var top = h.getBoundingClientRect().top + window.pageYOffset - 84;
    window.scrollTo({ top: top, behavior: "smooth" });
    if (h.id) history.replaceState(null, "", "#" + h.id);
  }

  var toastTimer = null;
  function showToast(msg, icon) {
    if (!toast) return;
    toast.innerHTML = "<i class=\"fas " + (icon || "fa-check") + "\" aria-hidden=\"true\"></i>" + esc(msg);
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.hidden = true; }, 1900);
  }
  function copyText(text, label) {
    function done() { showToast("Copied " + (label || text)); }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { showToast(text, "fa-copy"); }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
  }
  function flyTo(city) {
    if (onWanderlust && window.WL) window.WL.flyToCity(city);
    else location.href = hrefFor(data.wanderlust || "/wanderlust/") + "#to=" + encodeURIComponent(city);
  }

  /* ---------- commands ---------- */

  var NAV_ICON = { home: "fa-house", about: "fa-user", publications: "fa-book", cv: "fa-file-pdf", wanderlust: "fa-earth-americas" };
  var NAV_KEY = { home: "h", about: "a", publications: "p", cv: "c", wanderlust: "w" };

  function navCommands() {
    return (data.nav || []).map(function (n) {
      var slug = norm(n.title).replace(/\s+/g, "-");
      var isPdf = /\.pdf(\?|#|$)/i.test(n.url);
      var href = hrefFor(n.url);
      var here = !isPdf && currentPath() === n.url.replace(/\/+$/, "");
      return {
        group: "Go to", label: n.title, icon: NAV_ICON[slug] || "fa-arrow-right", key: NAV_KEY[slug],
        hint: isPdf ? "PDF, opens in a new tab" : (here ? "you are here" : n.url),
        run: function () {
          if (isPdf) window.open(href, "_blank", "noopener");
          else if (here) window.scrollTo({ top: 0, behavior: "smooth" });
          else location.href = href;
        }
      };
    });
  }

  function actionCommands() {
    var out = [];
    out.push({ group: "Actions", label: "Toggle light / dark theme", icon: "fa-circle-half-stroke", key: "t", run: toggleTheme });
    out.push({ group: "Actions", label: "Fly to a city on the globe", icon: "fa-plane", key: "g", hint: "search " + cityCount() + " cities",
      keepOpen: true, run: function () { setMode("cities"); } });
    if (data.email) {
      out.push({ group: "Actions", label: "Copy email address", icon: "fa-copy", hint: data.email, run: function () { copyText(data.email); } });
      out.push({ group: "Actions", label: "Send me an email", icon: "fa-envelope", hint: data.email, run: function () { location.href = "mailto:" + data.email; } });
    }
    if (data.linkedin) {
      out.push({ group: "Actions", label: "Open LinkedIn", icon: "fa-linkedin", brand: true, hint: "linkedin.com/in/" + data.linkedin,
        run: function () { window.open("https://www.linkedin.com/in/" + data.linkedin, "_blank", "noopener"); } });
    }
    if (data.github) {
      out.push({ group: "Actions", label: "Open GitHub", icon: "fa-github", brand: true, hint: "github.com/" + data.github,
        run: function () { window.open("https://github.com/" + data.github, "_blank", "noopener"); } });
    }
    out.push({ group: "Actions", label: "Copy link to this page", icon: "fa-link", hint: location.host + location.pathname,
      run: function () { copyText(location.href.split("#")[0], "page link"); } });
    return out;
  }

  function sectionCommands() {
    var out = [];
    Array.prototype.forEach.call(document.querySelectorAll(".page__content h2[id], .page__content h3[id]"), function (h) {
      var text = h.textContent.replace(/\s+/g, " ").trim();
      if (!text) return;
      out.push({ group: "On this page", label: text, icon: "fa-hashtag", search: text, run: function () { scrollToHeading(h); } });
    });
    return out;
  }

  function cityCount() {
    return (window.WL_PLACES || []).reduce(function (n, p) { return n + p.cities.length; }, 0);
  }
  function cityCommands() {
    var out = [];
    if (onWanderlust) {
      out.push({ group: "Fly to", label: "Back to the whole globe", icon: "fa-earth-americas", search: "globe home reset",
        run: function () { if (window.WL) window.WL.flyHome(); } });
    }
    (window.WL_PLACES || []).forEach(function (p) {
      p.cities.forEach(function (c) {
        out.push({ group: p.flag + " " + p.country, label: c[0], icon: "fa-location-dot", hint: p.flag + " " + p.country,
          search: c[0] + " " + p.country + " " + p.continent, city: true, run: function () { flyTo(c[0]); } });
      });
    });
    return out;
  }

  /* Rank: prefix > word start > substring > in-order subsequence. 0 means no match. */
  function score(q, text) {
    if (!q) return 1;
    var i = text.indexOf(q);
    if (i === 0) return 100;
    if (i > 0 && /[^a-z0-9]/.test(text[i - 1])) return 80;
    if (i > 0) return 60;
    var ti = 0;
    for (var k = 0; k < q.length; k++) {
      if (q[k] === " ") continue;
      ti = text.indexOf(q[k], ti);
      if (ti < 0) return 0;
      ti++;
    }
    return 20;
  }
  /* A command ranks by its label; its country, continent or hint only counts as a plain substring,
     so "zer" finds Zermatt but not every city whose country happens to contain those letters. */
  function rank(c, q) {
    if (!q) return 1;
    var s = score(q, norm(c.label));
    var extra = norm(c.search || c.hint || "");
    if (extra && extra.indexOf(q) >= 0) s = Math.max(s, 50);
    return s;
  }

  /* ---------- state + rendering ---------- */

  var mode = null;          /* null | "cities" */
  var items = [];
  var active = 0;
  var lastFocus = null;
  var MAX_CITY_HITS = 6;    /* when not in cities mode, cities appear only as search hits */

  function setMode(m) {
    mode = m;
    input.value = "";
    if (modeChip) {
      modeChip.hidden = !m;
      modeChip.textContent = m === "cities" ? "Fly to" : "";
    }
    input.placeholder = m === "cities" ? "City or country…" : "Type a command or a city…";
    active = 0;
    render();
    input.focus();
  }

  function collect(q) {
    if (mode === "cities") return cityCommands();
    var all = navCommands().concat(actionCommands(), sectionCommands());
    if (q) {
      var hits = cityCommands().map(function (c) { return { c: c, s: rank(c, q) }; })
        .filter(function (x) { return x.s > 0; })
        .sort(function (a, b) { return b.s - a.s; })
        .slice(0, MAX_CITY_HITS)
        .map(function (x) { x.c.group = "Fly to"; return x.c; });
      all = all.concat(hits);
    }
    return all;
  }

  function render() {
    var q = norm(input.value.trim());
    var scored = collect(q).map(function (c) { return { c: c, s: rank(c, q) }; })
      .filter(function (x) { return x.s > 0; });
    if (q) scored.sort(function (a, b) { return b.s - a.s; });
    items = scored.map(function (x) { return x.c; });
    if (active >= items.length) active = 0;

    list.innerHTML = "";
    if (!items.length) {
      var empty = document.createElement("li");
      empty.className = "cmdk__empty";
      empty.textContent = mode === "cities" ? "No city called “" + input.value.trim() + "” yet." : "Nothing matches. Try “pub”, “theme”, or a city like “Zermatt”.";
      list.appendChild(empty);
      input.removeAttribute("aria-activedescendant");
      return;
    }
    var showGroups = !q;
    var lastGroup = null;
    items.forEach(function (c, i) {
      if (showGroups && c.group !== lastGroup) {
        var g = document.createElement("li");
        g.className = "cmdk__group";
        g.setAttribute("role", "presentation");
        g.textContent = c.group;
        list.appendChild(g);
        lastGroup = c.group;
      }
      var li = document.createElement("li");
      li.className = "cmdk__item" + (i === active ? " is-active" : "");
      li.id = "cmdk-opt-" + i;
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", i === active ? "true" : "false");
      li.innerHTML =
        "<i class=\"" + (c.brand ? "fab " : "fas ") + c.icon + "\" aria-hidden=\"true\"></i>" +
        "<span class=\"cmdk__label\">" + highlight(c.label, q) + "</span>" +
        (c.hint && !(showGroups && mode === "cities") ? "<span class=\"cmdk__hint\">" + esc(c.hint) + "</span>" : "<span class=\"cmdk__hint\"></span>") +
        (c.key ? "<kbd class=\"cmdk__key\">" + c.key + "</kbd>" : "");
      li.addEventListener("mousemove", function () { if (active !== i) { active = i; paintActive(false); } });
      li.addEventListener("click", function () { runItem(c); });
      list.appendChild(li);
    });
    paintActive(true);
  }

  function paintActive(scroll) {
    var rows = list.querySelectorAll(".cmdk__item");
    Array.prototype.forEach.call(rows, function (r, i) {
      r.classList.toggle("is-active", i === active);
      r.setAttribute("aria-selected", i === active ? "true" : "false");
    });
    var cur = rows[active];
    if (cur) {
      input.setAttribute("aria-activedescendant", cur.id);
      if (scroll && cur.scrollIntoView) cur.scrollIntoView({ block: "nearest" });
    }
  }

  function runItem(c) {
    if (!c) return;
    if (c.keepOpen) { c.run(); return; }
    close();
    c.run();
  }

  function open(initialMode) {
    if (!root.hidden) { setMode(initialMode || null); return; }
    lastFocus = document.activeElement;
    root.hidden = false;
    document.body.classList.add("cmdk-open");
    setMode(initialMode || null);
    requestAnimationFrame(function () { input.focus(); });
  }
  function close() {
    if (root.hidden) return;
    root.hidden = true;
    document.body.classList.remove("cmdk-open");
    if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus();
  }
  function toggle() { if (root.hidden) open(); else close(); }

  /* ---------- events ---------- */

  input.addEventListener("input", function () { active = 0; render(); });
  input.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") { e.preventDefault(); if (items.length) { active = (active + 1) % items.length; paintActive(true); } }
    else if (e.key === "ArrowUp") { e.preventDefault(); if (items.length) { active = (active - 1 + items.length) % items.length; paintActive(true); } }
    else if (e.key === "Enter") { e.preventDefault(); runItem(items[active]); }
    else if (e.key === "Escape") { e.preventDefault(); if (mode) setMode(null); else close(); }
    else if (e.key === "Backspace" && mode && input.value === "") { e.preventDefault(); setMode(null); }
    else if (e.key === "Tab") { e.preventDefault(); }
  });
  Array.prototype.forEach.call(root.querySelectorAll("[data-cmdk-close]"), function (b) { b.addEventListener("click", close); });

  var trigger = document.getElementById("cmdk-trigger");
  if (trigger) {
    trigger.addEventListener("click", function (e) { e.preventDefault(); open(); });
    trigger.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
  }

  /* Global keys. ⌘K / Ctrl K toggles the palette from anywhere, including inside inputs.
     The single-key shortcuts only fire outside form fields and with no modifier held. */
  var singles = {
    "/": function () { open(); },
    "?": function () { open(); },
    "g": function () { open("cities"); },
    "t": toggleTheme
  };
  navCommands().forEach(function (c) { if (c.key) singles[c.key] = c.run; });

  /* Shared with the home page terminal (home-terminal.js) so both expose the same actions. */
  window.CMDK = {
    open: open, close: close, toggle: toggle,
    toggleTheme: toggleTheme, copyText: copyText, flyTo: flyTo, showToast: showToast,
    hrefFor: hrefFor, data: data,
    cities: function () {
      var list = [];
      (window.WL_PLACES || []).forEach(function (p) {
        p.cities.forEach(function (c) { list.push({ name: c[0], country: p.country, flag: p.flag, continent: p.continent }); });
      });
      return list;
    }
  };

  document.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && !e.altKey && (e.key === "k" || e.key === "K")) { e.preventDefault(); toggle(); return; }
    if (!root.hidden) { if (e.key === "Escape" && !e.defaultPrevented) close(); return; } /* the input handles Escape itself when a mode is active */
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (isEditable(e.target)) return;
    var fn = singles[e.key];
    if (fn && (e.key === "?" || !e.shiftKey)) { e.preventDefault(); fn(); }
  });
})();
