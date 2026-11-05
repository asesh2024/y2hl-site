// Theme toggle, code highlighting and copy buttons, and per-browser week progress.
(function () {
  var root = document.documentElement;

  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value);
    } catch (e) { return null; }
  }

  // Theme: follow the system until the reader picks one.
  function applyHighlightTheme() {
    var t = root.dataset.theme;
    var light = document.getElementById("hl-light"), dark = document.getElementById("hl-dark");
    if (!light || !dark) return;
    light.media = t ? (t === "light" ? "all" : "not all") : "(prefers-color-scheme: light)";
    dark.media = t ? (t === "dark" ? "all" : "not all") : "(prefers-color-scheme: dark)";
  }
  applyHighlightTheme();
  var toggle = document.querySelector(".theme-toggle");
  if (toggle) toggle.addEventListener("click", function () {
    var current = root.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    var next = current === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    store("theme", next);
    applyHighlightTheme();
  });

  // Diagrams: ```dot blocks become SVG via Graphviz (viz.js), loaded only when a page has one.
  // If the script can't load, the DOT source stays on the page as plain text.
  var vizReady = null;
  function renderDots(scope) {
    var blocks = (scope || document).querySelectorAll("pre > code.language-dot");
    if (!blocks.length) return;
    if (!vizReady) vizReady = new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/@viz-js/viz@3.11.0/lib/viz-standalone.js";
      s.integrity = "sha384-6ECxW8G4FmLMEr8fKkk617NsYhxb7AhsiyyT6Gey/Sru4R+lyRpVM12ekzlOD08g";
      s.crossOrigin = "anonymous";
      s.onload = function () { window.Viz.instance().then(resolve, reject); };
      s.onerror = reject;
      document.head.appendChild(s);
    });
    vizReady.then(function (viz) {
      blocks.forEach(function (code) {
        try {
          // Automata read left to right by default; a diagram can say rankdir=TB (e.g. parse trees).
          var graph = { bgcolor: "transparent", fontname: "Inter" };
          if (!/rankdir/.test(code.textContent)) graph.rankdir = "LR";
          var svg = viz.renderSVGElement(code.textContent, {
            graphAttributes: graph,
            nodeAttributes: { fontname: "Inter", fontsize: 13 },
            edgeAttributes: { fontname: "JetBrains Mono", fontsize: 12 }
          });
          svg.removeAttribute("width");
          svg.removeAttribute("height");
          // Natural size, so a small graph is not stretched across the page. CSS still shrinks wide ones to fit.
          svg.style.width = Math.ceil(svg.viewBox.baseVal.width * 1.2) + "px";
          var fig = document.createElement("figure");
          fig.className = "dot";
          fig.appendChild(svg);
          code.parentNode.replaceWith(fig);
        } catch (e) { /* leave the DOT text visible */ }
      });
    }).catch(function () {});
  }
  window.Y2HL = { renderDots: renderDots };
  renderDots(document);

  // Code: highlight, then add a copy button to each block.
  document.querySelectorAll(".prose pre > code:not(.language-dot)").forEach(function (code) {
    if (window.hljs) window.hljs.highlightElement(code);
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy-btn";
    btn.textContent = "Copy";
    btn.addEventListener("click", function () {
      navigator.clipboard.writeText(code.innerText).then(function () {
        btn.textContent = "Copied";
        setTimeout(function () { btn.textContent = "Copy"; }, 1500);
      });
    });
    code.parentNode.appendChild(btn);
  });

  // Progress: which weeks or topics this reader has finished (ticked by hand, or by passing a quiz).
  var KEY = "y2hl-done:" + location.pathname.split("/").slice(0, 3).join("/");
  var done = {};
  try { done = JSON.parse(store(KEY) || "{}"); } catch (e) { done = {}; }

  function render() {
    var weeks = document.querySelectorAll("[data-week]");
    var total = {}, finished = 0;
    weeks.forEach(function (el) {
      var slug = el.dataset.week;
      total[slug] = true;
      var item = el.closest("li") || el;
      item.classList.toggle("is-done", !!done[slug]);
    });
    Object.keys(total).forEach(function (slug) { if (done[slug]) finished++; });
    var count = Object.keys(total).length;
    document.querySelectorAll("[data-progress-label]").forEach(function (el) {
      el.textContent = finished ? finished + " of " + count + " " + (el.dataset.unitPlural || "weeks") + " done" : "";
    });
    var next = Object.keys(total).sort().find(function (slug) { return !done[slug]; });
    var cont = document.querySelector("[data-continue]");
    if (cont && finished && next) {
      cont.href = cont.href.replace(/[a-z]+-\d+\.html$/, next + ".html");
      cont.textContent = "Continue with " + (cont.dataset.unit || "Week") + " " + parseInt(next.split("-")[1], 10);
    }
  }

  // quiz.js announces a pass this way, so the ticks update without a reload.
  window.addEventListener("y2hl:progress", function () {
    try { done = JSON.parse(store(KEY) || "{}"); } catch (e) { done = {}; }
    render();
  });

  document.querySelectorAll("[data-done]").forEach(function (box) {
    box.checked = !!done[box.dataset.done];
    box.addEventListener("change", function () {
      if (box.checked) done[box.dataset.done] = true; else delete done[box.dataset.done];
      store(KEY, JSON.stringify(done));
      render();
    });
  });
  render();

  // Course contents: a sidebar on wide screens, folded away on small ones.
  var narrow = matchMedia("(max-width: 900px)");
  function syncNav() {
    document.querySelectorAll(".course-nav-box").forEach(function (d) { d.open = !narrow.matches; });
  }
  syncNav();
  narrow.addEventListener("change", syncNav);
})();
