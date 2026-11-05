// Study tools: a timer and a learning streak on every page, and flashcards on topic pages.
// Everything is saved in this browser only.
(function () {
  var KEY = "y2hl-study";
  var WORK = 25 * 60, BREAK = 5 * 60;
  var memory = null;   // used when the browser refuses to store anything

  function today(offset) {
    var d = new Date();
    d.setDate(d.getDate() + (offset || 0));
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function read() {
    var state = memory;
    try { state = JSON.parse(localStorage.getItem(KEY)) || state; } catch (e) { /* use memory */ }
    state = state || {};
    state.days = state.days || {};
    state.timer = state.timer || { mode: "work", running: false, left: WORK, ends: 0 };
    return state;
  }

  function write(state) {
    memory = state;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* kept in memory for this page */ }
  }

  // A day counts once a student does something: runs a program, submits a quiz, finishes a topic,
  // finishes a flashcard set or completes a timer session. Opening a page does not count.
  function recordActivity(topic) {
    var state = read();
    var day = state.days[today()] = state.days[today()] || { topics: [] };
    if (topic && day.topics.indexOf(topic) < 0) day.topics.push(topic);
    var keep = Object.keys(state.days).sort().slice(-400);
    var pruned = {};
    keep.forEach(function (k) { pruned[k] = state.days[k]; });
    state.days = pruned;
    write(state);
    renderStreak();
  }

  function streak(days) {
    var offset = days[today()] ? 0 : -1;   // today isn't lost until the day is over
    var count = 0;
    while (days[today(offset)]) { count++; offset--; }
    return count;
  }

  function topicsThisWeek(days) {
    var seen = {};
    var now = new Date();
    var sinceMonday = (now.getDay() + 6) % 7;
    for (var i = 0; i <= sinceMonday; i++) {
      var day = days[today(-i)];
      if (day) day.topics.forEach(function (t) { seen[t] = true; });
    }
    return Object.keys(seen).length;
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  function button(cls, text) {
    var b = el("button", cls, text);
    b.type = "button";
    return b;
  }

  // ---------- The panel ----------
  var open = button("study-open", "Study tools");
  open.setAttribute("aria-expanded", "false");
  open.setAttribute("aria-controls", "study-panel");
  var badge = el("span", "study-badge");
  open.appendChild(badge);

  var panel = el("section", "study-panel");
  panel.id = "study-panel";
  panel.hidden = true;
  panel.setAttribute("aria-label", "Study tools");

  var close = button("study-close", "Close");
  var head = el("div", "study-head");
  head.appendChild(el("h2", "", "Study tools"));
  head.appendChild(close);
  panel.appendChild(head);

  var streakBox = el("div", "study-streak");
  var streakCount = el("strong");
  var streakWeek = el("span");
  streakBox.appendChild(streakCount);
  streakBox.appendChild(streakWeek);
  panel.appendChild(streakBox);

  var timerBox = el("div", "study-timer");
  var label = el("p", "study-label");
  var clock = el("p", "study-clock");
  clock.setAttribute("role", "timer");
  var notice = el("p", "study-notice");
  notice.setAttribute("role", "status");
  var controls = el("div", "study-controls");
  var start = button("btn primary", "Start");
  var reset = button("btn", "Reset");
  var swap = button("btn", "Switch to break");
  [start, reset, swap].forEach(function (b) { controls.appendChild(b); });
  [label, clock, controls, notice].forEach(function (n) { timerBox.appendChild(n); });
  panel.appendChild(timerBox);
  panel.appendChild(el("p", "study-note", "Your streak grows on any day you run a program, submit a quiz, finish a topic or flashcard set, or complete a study session. It's saved in this browser only."));

  document.body.appendChild(open);
  document.body.appendChild(panel);

  function setOpen(on) {
    panel.hidden = !on;
    open.setAttribute("aria-expanded", String(on));
    if (on) close.focus(); else open.focus();
  }
  open.addEventListener("click", function () { setOpen(panel.hidden); });
  close.addEventListener("click", function () { setOpen(false); });
  panel.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });

  function renderStreak() {
    var days = read().days;
    var n = streak(days);
    var week = topicsThisWeek(days);
    streakCount.textContent = n === 1 ? "1 day in a row" : n + " days in a row";
    streakWeek.textContent = week === 1 ? "1 topic done this week" : week + " topics done this week";
    badge.textContent = n ? String(n) : "";
    badge.hidden = !n;
    badge.setAttribute("aria-label", n + " day streak");
  }

  // ---------- The timer ----------
  // It stores the time it ends, so it keeps counting across pages and when a page is closed.
  var baseTitle = document.title;

  function leftNow(t) {
    return t.running ? Math.max(0, Math.round((t.ends - Date.now()) / 1000)) : t.left;
  }

  function mmss(s) {
    return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  }

  function chime() {
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      var tone = ctx.createOscillator(), gain = ctx.createGain();
      tone.frequency.value = 660;
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      tone.connect(gain); gain.connect(ctx.destination);
      tone.start(); tone.stop(ctx.currentTime + 0.8);
    } catch (e) { /* no sound available */ }
  }

  function renderTimer() {
    var state = read(), t = state.timer;
    var left = leftNow(t);
    if (t.running && left === 0) {
      var finishedWork = t.mode === "work";
      t.running = false;
      t.mode = finishedWork ? "break" : "work";
      t.left = finishedWork ? BREAK : WORK;
      write(state);
      left = t.left;
      if (finishedWork) recordActivity();
      notice.textContent = finishedWork ? "Session complete. Take a 5-minute break." : "Break over. Ready for another session?";
      badge.parentNode.classList.add("is-due");
      chime();
    }
    label.textContent = t.mode === "work" ? "Study session" : "Break";
    clock.textContent = mmss(left);
    start.textContent = t.running ? "Pause" : (left < (t.mode === "work" ? WORK : BREAK) ? "Resume" : "Start");
    swap.textContent = t.mode === "work" ? "Switch to break" : "Switch to study";
    document.title = t.running ? mmss(left) + " · " + baseTitle : baseTitle;
    open.firstChild.nodeValue = t.running ? mmss(left) : "Study tools";
  }

  start.addEventListener("click", function () {
    var state = read(), t = state.timer;
    if (t.running) {
      t.left = leftNow(t);
      t.running = false;
    } else {
      t.ends = Date.now() + t.left * 1000;
      t.running = true;
      notice.textContent = "";
      open.classList.remove("is-due");
    }
    write(state);
    renderTimer();
  });

  function setMode(mode) {
    var state = read();
    state.timer = { mode: mode, running: false, left: mode === "work" ? WORK : BREAK, ends: 0 };
    write(state);
    notice.textContent = "";
    open.classList.remove("is-due");
    renderTimer();
  }
  reset.addEventListener("click", function () { setMode(read().timer.mode); });
  swap.addEventListener("click", function () { setMode(read().timer.mode === "work" ? "break" : "work"); });

  setInterval(renderTimer, 1000);
  addEventListener("storage", function (e) { if (e.key === KEY) { renderTimer(); renderStreak(); } });

  // ---------- What counts as studying ----------
  var page = document.querySelector("[data-week-page]");
  var topicId = page ? location.pathname.split("/").slice(2, 3)[0] + "/" + page.dataset.weekPage : null;

  document.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest(".py-run")) recordActivity();
  });
  document.addEventListener("submit", function (e) {
    if (e.target.closest && e.target.closest(".quiz")) recordActivity();
  });
  document.addEventListener("change", function (e) {
    if (e.target.matches && e.target.matches("[data-done]") && e.target.checked) {
      recordActivity(location.pathname.split("/").slice(2, 3)[0] + "/" + e.target.dataset.done);
    }
  });
  addEventListener("y2hl:progress", function () {
    if (!topicId || !page) return;
    var done = {};
    try { done = JSON.parse(localStorage.getItem("y2hl-done:" + location.pathname.split("/").slice(0, 3).join("/"))) || {}; } catch (e) { /* nothing saved */ }
    if (done[page.dataset.weekPage]) recordActivity(topicId);
  });

  // ---------- Flashcards ----------
  document.querySelectorAll(".flashcards").forEach(function (list) {
    var terms = list.querySelectorAll("dt"), meanings = list.querySelectorAll("dd");
    var cards = [].map.call(terms, function (dt, i) { return { term: dt.textContent, meaning: meanings[i].textContent }; });
    if (!cards.length) return;
    var original = cards.slice(), index = 0, flipped = false, seen = {};

    var deck = el("div", "flash-deck");
    var card = button("flash-card");
    var inner = el("span", "flash-inner");
    var side = el("span", "flash-side");
    var text = el("span", "flash-text");
    var hint = el("span", "flash-hint");
    inner.appendChild(side); inner.appendChild(text); inner.appendChild(hint);
    card.appendChild(inner);
    var bar = el("div", "flash-bar");
    var prev = button("btn", "Previous");
    var count = el("span", "flash-count");
    count.setAttribute("role", "status");
    var next = button("btn primary", "Next");
    var shuffle = button("btn", "Shuffle");
    [prev, count, next, shuffle].forEach(function (n) { bar.appendChild(n); });
    deck.appendChild(card); deck.appendChild(bar);

    function show() {
      var c = cards[index];
      side.textContent = flipped ? "Meaning" : "Term";
      text.textContent = flipped ? c.meaning : c.term;
      hint.textContent = flipped ? "Select to see the term" : "Select to see the meaning";
      card.classList.toggle("is-flipped", flipped);
      card.setAttribute("aria-label", (flipped ? "Meaning: " : "Term: ") + text.textContent + ". Select to flip.");
      count.textContent = "Card " + (index + 1) + " of " + cards.length;
      prev.disabled = index === 0;
      next.textContent = index === cards.length - 1 ? "Start again" : "Next";
    }

    function move(to) {
      index = (to + cards.length) % cards.length;
      flipped = false;
      show();
    }

    card.addEventListener("click", function () {
      flipped = !flipped;
      if (flipped) {
        seen[cards[index].term] = true;
        if (Object.keys(seen).length === original.length) { recordActivity(); seen = {}; }
      }
      show();
    });
    prev.addEventListener("click", function () { move(index - 1); });
    next.addEventListener("click", function () { move(index + 1); });
    shuffle.addEventListener("click", function () {
      for (var i = cards.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1)), t = cards[i];
        cards[i] = cards[j]; cards[j] = t;
      }
      move(0);
    });
    deck.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); move(index + 1); }
      if (e.key === "ArrowLeft" && index > 0) { e.preventDefault(); move(index - 1); }
    });

    list.hidden = true;
    list.after(deck);
    show();
  });

  renderStreak();
  renderTimer();
})();
