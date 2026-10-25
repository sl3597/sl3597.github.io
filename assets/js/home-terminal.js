/* Home page terminal: a launcher you can type into or click. It shares its actions with the ⌘K
   palette through window.CMDK (see command-palette.js), so both stay in sync. */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  ready(function () {
    var tty = document.getElementById("tty");
    var screen = document.getElementById("tty-screen");
    var out = document.getElementById("tty-out");
    var form = document.getElementById("tty-form");
    var input = document.getElementById("tty-input");
    var echo = document.getElementById("tty-echo");
    var ghost = document.getElementById("tty-ghost");
    var suggest = document.getElementById("tty-suggest");
    var help = document.getElementById("tty-help");
    if (!tty || !screen || !out || !form || !input) return;

    var C = window.CMDK || {};
    var D = C.data || {};
    var email = tty.getAttribute("data-email") || D.email || "";
    var linkedin = tty.getAttribute("data-linkedin") || D.linkedin || "";
    var cvUrl = tty.getAttribute("data-cv") || "";
    var href = C.hrefFor || function (u) { return u; };
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var touch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;

    /* ---------- output ---------- */

    function esc(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c];
      });
    }
    function scrollDown() { screen.scrollTop = screen.scrollHeight; }
    function line(html, cls) {
      var d = document.createElement("div");
      d.className = "tty__line" + (cls ? " tty__line--" + cls : "");
      d.innerHTML = html;
      out.appendChild(d);
      scrollDown();
      return d;
    }
    function print(text, cls) { return line(esc(text), cls); }
    function echoCommand(text) { line("<span class=\"tty__prompt\">~ $</span> " + esc(text), "cmd"); }
    function link(url, label, newTab) {
      return "<a href=\"" + esc(url) + "\"" + (newTab ? " target=\"_blank\" rel=\"noopener\"" : "") + ">" + esc(label) + "</a>";
    }

    var identity = Array.prototype.slice.call(tty.querySelectorAll("[data-boot=\"id\"]"));
    function reprint(nodes) {
      nodes.forEach(function (n) {
        var c = n.cloneNode(true);
        c.removeAttribute("data-boot");
        c.classList.add("is-shown");
        out.appendChild(c);
      });
      scrollDown();
    }

    /* ---------- actions ---------- */

    function go(url, label) {
      print("opening " + label + " …", "dim");
      setTimeout(function () { location.href = url; }, 280);
    }
    function openTab(url, label) {
      print("opening " + label + " in a new tab …", "dim");
      window.open(url, "_blank", "noopener");
    }
    function cities() {
      if (C.cities) return C.cities();
      var list = [];
      (window.WL_PLACES || []).forEach(function (p) {
        p.cities.forEach(function (c) { list.push({ name: c[0], country: p.country, flag: p.flag }); });
      });
      return list;
    }
    function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
    function matchCities(q) {
      q = norm(q.trim());
      if (!q) return cities();
      return cities().map(function (c) {
        var n = norm(c.name), k = norm(c.country);
        var s = n.indexOf(q) === 0 ? 3 : n.indexOf(q) > 0 ? 2 : k.indexOf(q) >= 0 ? 1 : 0;
        return { c: c, s: s };
      }).filter(function (x) { return x.s > 0; })
        .sort(function (a, b) { return b.s - a.s || a.c.name.localeCompare(b.c.name); })
        .map(function (x) { return x.c; });
    }
    function fly(arg) {
      if (!arg) {
        print("usage: fly <city>   e.g. fly zermatt", "dim");
        if (C.open) { print("opening the city list …", "dim"); C.open("cities"); }
        return;
      }
      var hits = matchCities(arg);
      if (!hits.length) { print("fly: no such city: " + arg, "err"); print("type “fly ” and press Tab to browse.", "dim"); return; }
      var c = hits[0];
      print("flying to " + c.name + " " + c.flag + " " + c.country + " …", "dim");
      if (C.flyTo) setTimeout(function () { C.flyTo(c.name); }, 280);
      else go(href("/wanderlust/") + "#to=" + encodeURIComponent(c.name), "wanderlust");
    }
    function theme(arg) {
      var cur = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
      var want = arg === "dark" || arg === "light" ? arg : (cur === "dark" ? "light" : "dark");
      if (want !== cur && C.toggleTheme) C.toggleTheme();
      else if (want !== cur) { var t = document.getElementById("theme-toggle"); if (t) t.click(); }
      print("theme: " + want, "ok");
    }
    function copyEmail() {
      if (C.copyText) C.copyText(email);
      else if (navigator.clipboard) navigator.clipboard.writeText(email);
      print("copied " + email, "ok");
    }
    function ls() {
      line([
        link(href("/about/"), "about.md"),
        link(href("/publications/"), "publications/"),
        link(cvUrl, "cv.pdf", true),
        link(href("/wanderlust/"), "wanderlust/")
      ].join("  "), "ls");
    }
    function cat(arg) {
      var f = norm(arg).replace(/\/$/, "");
      if (!f) { print("usage: cat <file>   try: ls", "dim"); return; }
      if (f === "about.md" || f === "about") return go(href("/about/"), "about.md");
      if (f === "publications" || f === "publications.md") return go(href("/publications/"), "publications");
      if (f === "cv.pdf" || f === "cv") return openTab(cvUrl, "cv.pdf");
      if (f === "wanderlust") return go(href("/wanderlust/"), "wanderlust");
      print("cat: " + arg + ": No such file or directory", "err");
    }
    function showHelp() {
      if (!help) return;
      var c = help.cloneNode(true);
      c.removeAttribute("id");
      c.removeAttribute("data-boot");
      c.classList.add("is-shown");
      out.appendChild(c);
      scrollDown();
    }
    function clear() {
      out.innerHTML = "";
    }

    var COMMANDS = [
      { name: "help", alias: ["?", "commands"], run: showHelp },
      { name: "about", alias: ["whois", "bio"], run: function () { go(href("/about/"), "about"); } },
      { name: "publications", alias: ["pubs", "papers"], run: function () { go(href("/publications/"), "publications"); } },
      { name: "cv", alias: ["resume"], run: function () { openTab(cvUrl, "cv"); } },
      { name: "wanderlust", alias: ["travel", "globe", "map"], run: function () { go(href("/wanderlust/"), "wanderlust"); } },
      { name: "fly", args: "city", run: fly },
      { name: "email", alias: ["mail", "contact"], run: function () { print("opening your mail client …", "dim"); location.href = "mailto:" + email; } },
      { name: "copy", run: copyEmail },
      { name: "linkedin", run: function () { openTab("https://www.linkedin.com/in/" + linkedin, "linkedin"); } },
      { name: "theme", args: "dark|light", run: theme },
      { name: "whoami", run: function () { reprint(identity); } },
      { name: "ls", alias: ["dir"], run: ls },
      { name: "cat", alias: ["open"], args: "file", run: cat },
      { name: "clear", alias: ["cls"], run: clear },
      { name: "pwd", hidden: true, run: function () { print("/home/shengwei"); } },
      { name: "sudo", hidden: true, run: function () { print("shengwei is not in the sudoers file. This incident will be reported.", "err"); } },
      { name: "exit", alias: ["quit", "logout"], hidden: true, run: function () { print("there is no exit. try “about” instead.", "dim"); } },
      { name: "palette", alias: ["k"], hidden: true, run: function () { if (C.open) C.open(); } }
    ];
    var byName = {};
    COMMANDS.forEach(function (c) {
      byName[c.name] = c;
      (c.alias || []).forEach(function (a) { byName[a] = c; });
    });

    function resolve(word) {
      if (byName[word]) return byName[word];
      var hits = COMMANDS.filter(function (c) { return !c.hidden && c.name.indexOf(word) === 0; });
      return hits.length ? hits[0] : null;
    }
    function exec(text) {
      text = String(text || "").trim();
      if (!text) return;
      echoCommand(text);
      var parts = text.split(/\s+/);
      var word = parts[0].toLowerCase();
      var arg = parts.slice(1).join(" ");
      var cmd = resolve(word);
      if (!cmd) {
        print("zsh: command not found: " + word, "err");
        print("type “help” to see what you can do here.", "dim");
        return;
      }
      cmd.run(arg);
    }

    /* ---------- completion ---------- */

    function completions(value) {
      var v = value.replace(/^\s+/, "");
      var low = v.toLowerCase();
      if (/^(fly|cat)\s/.test(low)) {
        var w = low.split(/\s+/)[0];
        var rest = v.slice(w.length).replace(/^\s+/, "");
        if (w === "fly") return matchCities(rest).slice(0, 8).map(function (c) { return { text: "fly " + c.name, label: c.name, hint: c.flag + " " + c.country }; });
        return ["about.md", "publications/", "cv.pdf", "wanderlust/"].filter(function (f) { return f.indexOf(norm(rest)) === 0; })
          .map(function (f) { return { text: "cat " + f, label: f }; });
      }
      if (!low) return [];
      var seen = {};
      return COMMANDS.filter(function (c) { return !c.hidden && c.name.indexOf(low) === 0 && !(seen[c.name] = seen[c.name] || false); })
        .map(function (c) { seen[c.name] = true; return { text: c.name + (c.args ? " " : ""), label: c.name, hint: c.args ? "<" + c.args + ">" : "" }; })
        .slice(0, 8);
    }
    function paint() {
      var v = input.value;
      echo.textContent = v;
      var opts = completions(v);
      var top = opts[0];
      var lowV = v.toLowerCase();
      ghost.textContent = top && v && top.text.toLowerCase().indexOf(lowV) === 0 && top.text.length > v.length ? top.text.slice(v.length) : "";
      if (!opts.length || !v.trim()) { suggest.hidden = true; suggest.innerHTML = ""; return; }
      suggest.innerHTML = "";
      opts.forEach(function (o) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "tty__chip";
        b.innerHTML = esc(o.label) + (o.hint ? " <span>" + esc(o.hint) + "</span>" : "");
        b.addEventListener("mousedown", function (e) { e.preventDefault(); });
        b.addEventListener("click", function () { accept(o.text); });
        suggest.appendChild(b);
      });
      suggest.hidden = false;
      scrollDown();
    }
    function accept(text) {
      if (/\s$/.test(text)) { input.value = text; paint(); input.focus(); return; }
      input.value = "";
      paint();
      exec(text);
      input.focus();
    }

    /* ---------- input ---------- */

    var history = [];
    var cursor = -1;
    var draft = "";

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = input.value;
      if (!v.trim()) return;
      history.push(v);
      cursor = -1;
      input.value = "";
      paint();
      exec(v);
    });
    input.addEventListener("input", paint);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Tab") {
        var opts = completions(input.value);
        if (opts.length) { e.preventDefault(); input.value = opts[0].text; paint(); }
        else if (!input.value) { e.preventDefault(); input.value = "help"; paint(); }
      } else if (e.key === "ArrowUp") {
        if (!history.length) return;
        e.preventDefault();
        if (cursor === -1) { draft = input.value; cursor = history.length; }
        cursor = Math.max(0, cursor - 1);
        input.value = history[cursor];
        paint();
      } else if (e.key === "ArrowDown") {
        if (cursor === -1) return;
        e.preventDefault();
        cursor++;
        if (cursor >= history.length) { cursor = -1; input.value = draft; } else input.value = history[cursor];
        paint();
      } else if (e.key === "Escape") {
        input.value = "";
        paint();
      } else if (e.key === "l" && e.ctrlKey) {
        e.preventDefault();
        clear();
      }
    });
    input.addEventListener("focus", function () { form.classList.add("is-focused"); });
    input.addEventListener("blur", function () { form.classList.remove("is-focused"); });

    /* Click anywhere on the screen to type; click a help row to run it. */
    screen.addEventListener("click", function (e) {
      var row = e.target.closest("[data-cmd]");
      if (row) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; /* let modified clicks open links normally */
        e.preventDefault();
        accept(row.getAttribute("data-cmd"));
        return;
      }
      if (e.target.closest("a, button")) return;
      input.focus({ preventScroll: true });
    });

    /* ---------- boot ---------- */

    var bootEls = Array.prototype.slice.call(tty.querySelectorAll("[data-boot]"));
    function show(el) { el.classList.add("is-shown"); }
    function finish() {
      tty.classList.remove("is-booting");
      tty.classList.add("is-ready");
      window.__ttyReady = true;
      scrollDown();
      if (!touch) input.focus({ preventScroll: true });
    }
    function lastTextNode(el) {
      for (var i = el.childNodes.length - 1; i >= 0; i--) {
        var n = el.childNodes[i];
        if (n.nodeType === 3 && n.nodeValue.trim()) return n;
      }
      return null;
    }
    function step(i) {
      if (i >= bootEls.length) return finish();
      var el = bootEls[i];
      var kind = el.getAttribute("data-boot");
      if (kind === "type") {
        var node = lastTextNode(el);
        var text = node ? node.nodeValue : "";
        if (node) node.nodeValue = " ";
        show(el);
        scrollDown();
        var k = 1;
        (function typeChar() {
          if (!node) return step(i + 1);
          node.nodeValue = text.slice(0, k);
          k++;
          if (k <= text.length) setTimeout(typeChar, 38 + Math.random() * 42);
          else setTimeout(function () { step(i + 1); }, 240);
        })();
        return;
      }
      show(el);
      scrollDown();
      setTimeout(function () { step(i + 1); }, kind === "help" ? 220 : kind === "form" ? 120 : 100);
    }

    if (reduce) { bootEls.forEach(show); finish(); }
    else if (tty.classList.contains("is-booting")) setTimeout(function () { step(0); }, 350);
    else { bootEls.forEach(show); finish(); }
  });
})();
