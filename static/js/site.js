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

  // Code: highlight, then add a copy button to each block.
  document.querySelectorAll(".prose pre > code").forEach(function (code) {
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

  // Progress: which weeks this reader has marked as finished.
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
      el.textContent = finished ? finished + " of " + count + " weeks done" : "";
    });
    var next = Object.keys(total).sort().find(function (slug) { return !done[slug]; });
    var cont = document.querySelector("[data-continue]");
    if (cont && finished && next) {
      cont.href = cont.href.replace(/week-\d+\.html$/, next + ".html");
      cont.textContent = "Continue with Week " + parseInt(next.slice(5), 10);
    }
  }

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
