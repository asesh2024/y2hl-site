// Self-marking quizzes, CO tests and the "My marks" page.
// Marks live in this browser only (localStorage), under one key per course.
(function () {
  var COURSE = location.pathname.split("/").slice(0, 3).join("/");
  var MARKS_KEY = "y2hl-quiz:" + COURSE;
  var DONE_KEY = "y2hl-done:" + COURSE;
  var STUDENT_KEY = "y2hl-student";

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (e) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* private mode: marks just won't persist */ }
  }
  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function pct(score, total) { return total ? Math.round(100 * score / total) : 0; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  // ---- Score chips (course page, sidebar) -------------------------------------------------
  function paintChips() {
    var marks = read(MARKS_KEY, {});
    document.querySelectorAll("[data-score-for]").forEach(function (chip) {
      var rec = marks[chip.dataset.scoreFor];
      chip.textContent = rec ? rec.best + "/" + rec.total : "";
      chip.classList.toggle("is-pass", !!rec && rec.passed);
      chip.classList.toggle("is-low", !!rec && !rec.passed);
      chip.title = rec ? "Best score " + rec.best + "/" + rec.total + " (" + rec.attempts + " attempt" + (rec.attempts > 1 ? "s" : "") + ")" : "";
    });
  }

  // ---- A quiz ---------------------------------------------------------------------------------
  function Quiz(box) {
    this.box = box;
    this.slug = box.dataset.quiz;
    this.pick = parseInt(box.dataset.pick || "0", 10);
    this.pass = parseInt(box.dataset.pass || "60", 10);
    this.bank = JSON.parse(box.querySelector(".quiz-data").textContent);
    this.start();
  }

  Quiz.prototype.start = function () {
    var self = this;
    var chosen = this.pick ? shuffle(this.bank).slice(0, this.pick) : shuffle(this.bank);
    this.items = chosen.map(function (q) {
      var order = q.type === "tf" ? [0, 1] : shuffle(q.options.map(function (_, i) { return i; }));
      return { q: q, order: order };
    });

    Array.prototype.slice.call(this.box.children).forEach(function (c) {
      if (!c.classList.contains("quiz-data")) c.remove();
    });

    var rec = read(MARKS_KEY, {})[this.slug];
    var head = el("div", "quiz-head");
    head.innerHTML = "<span><strong>" + this.items.length + " questions</strong> · 1 mark each · pass mark " + this.pass + "%</span>" +
      (rec ? "<span>Your best: <strong>" + rec.best + "/" + rec.total + "</strong> · " + rec.attempts + " attempt" + (rec.attempts > 1 ? "s" : "") + "</span>" : "<span>Not attempted yet</span>");
    this.box.appendChild(head);

    var form = el("form", "quiz-form");
    form.noValidate = true;
    this.items.forEach(function (item, n) {
      var q = item.q, multi = q.type === "multi";
      var fs = el("fieldset", "quiz-q");
      fs.appendChild(el("legend", null, "<span class=\"qnum\">" + (n + 1) + ".</span> " + q.q +
        (multi ? " <span class=\"qhint\">(select all that apply)</span>" : "")));
      if (q.dot) {
        var pre = el("pre"), code = el("code", "language-dot");
        code.textContent = q.dot;
        pre.appendChild(code);
        fs.appendChild(pre);
      }
      var opts = el("div", "quiz-options");
      item.order.forEach(function (orig) {
        var label = el("label", "quiz-opt");
        var input = document.createElement("input");
        input.type = multi ? "checkbox" : "radio";
        input.name = "q" + n;
        input.value = orig;
        label.appendChild(input);
        label.appendChild(el("span", null, q.options[orig]));
        opts.appendChild(label);
      });
      fs.appendChild(opts);
      fs.appendChild(el("div", "quiz-explain", "<strong>Why:</strong> " + q.explain));
      form.appendChild(fs);
    });

    var bar = el("div", "quiz-bar");
    var submit = el("button", "btn primary", "Submit answers");
    submit.type = "submit";
    var note = el("span", "muted quiz-note");
    bar.appendChild(submit);
    bar.appendChild(note);
    form.appendChild(bar);
    this.box.appendChild(form);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var blank = self.items.filter(function (_, n) { return !form.querySelector("[name=q" + n + "]:checked"); }).length;
      if (blank && !form.dataset.warned) {
        form.dataset.warned = "1";
        note.textContent = blank + " question" + (blank > 1 ? "s are" : " is") + " unanswered and will score 0. Press Submit again to finish.";
        return;
      }
      self.mark(form);
    });
    form.addEventListener("change", function () { delete form.dataset.warned; note.textContent = ""; });

    if (window.Y2HL) window.Y2HL.renderDots(this.box);
  };

  Quiz.prototype.mark = function (form) {
    var self = this, score = 0;
    this.items.forEach(function (item, n) {
      var q = item.q;
      var want = (Array.isArray(q.answer) ? q.answer : [q.answer]).slice().sort().join(",");
      var picked = Array.prototype.map.call(form.querySelectorAll("[name=q" + n + "]:checked"), function (i) { return +i.value; });
      var right = picked.slice().sort().join(",") === want;
      if (right) score++;
      var fs = form.querySelectorAll(".quiz-q")[n];
      fs.classList.add(right ? "is-right" : "is-wrong");
      fs.querySelectorAll(".quiz-opt").forEach(function (label) {
        var input = label.querySelector("input"), v = +input.value;
        input.disabled = true;
        var isAnswer = (Array.isArray(q.answer) ? q.answer : [q.answer]).indexOf(v) >= 0;
        if (isAnswer) label.classList.add("is-answer");
        if (input.checked && !isAnswer) label.classList.add("is-chosen-wrong");
      });
      var legend = fs.querySelector("legend");
      legend.insertAdjacentHTML("beforeend", " <span class=\"verdict\">" + (right ? "✓ Correct" : "✗ " + (picked.length ? "Incorrect" : "Not answered")) + "</span>");
    });

    var total = this.items.length, p = pct(score, total), passed = p >= this.pass;
    var marks = read(MARKS_KEY, {});
    var rec = marks[this.slug] || { best: 0, attempts: 0 };
    rec.total = total;
    rec.last = score;
    rec.best = Math.max(rec.best || 0, score);
    rec.passed = pct(rec.best, total) >= this.pass;
    rec.attempts = (rec.attempts || 0) + 1;
    rec.updated = new Date().toISOString();
    marks[this.slug] = rec;
    write(MARKS_KEY, marks);
    if (rec.passed && !this.pick) {
      var done = read(DONE_KEY, {});
      done[this.slug] = true;
      write(DONE_KEY, done);
    }
    window.dispatchEvent(new Event("y2hl:progress"));
    paintChips();

    var bar = form.querySelector(".quiz-bar");
    bar.innerHTML = "";
    var result = el("div", "quiz-result " + (passed ? "is-pass" : "is-low"),
      "<p class=\"quiz-score\">" + score + "/" + total + " <span>(" + p + "%)</span></p>" +
      "<p>" + (passed ? "Passed. " : "Below the " + this.pass + "% pass mark. Read the explanations, revise, then try again. ") +
      "Best so far: <strong>" + rec.best + "/" + total + "</strong> over " + rec.attempts + " attempt" + (rec.attempts > 1 ? "s" : "") + ".</p>");
    var again = el("button", "btn primary", this.pick ? "New set of questions" : "Try again");
    again.type = "button";
    again.addEventListener("click", function () { self.start(); self.box.scrollIntoView({ behavior: "smooth", block: "start" }); });
    var marksLink = el("a", "btn", "My marks");
    marksLink.href = COURSE + "/marks.html";
    var actions = el("div", "quiz-result-actions");
    actions.appendChild(again);
    actions.appendChild(marksLink);
    result.appendChild(actions);
    bar.appendChild(result);
    result.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // ---- My marks -------------------------------------------------------------------------------
  function Marks(box) {
    this.box = box;
    this.data = JSON.parse(box.querySelector(".marks-data").textContent);
    this.render();
  }

  Marks.prototype.rows = function () {
    var marks = read(MARKS_KEY, {});
    var rows = this.data.topics.map(function (t) {
      return { slug: t.slug, label: "Topic " + t.num + ": " + t.title, co: t.co, total: t.total, rec: marks[t.slug], kind: "quiz" };
    });
    this.data.tests.forEach(function (t) {
      rows.push({ slug: t.slug, label: t.co + " test", co: t.co, total: t.total, rec: marks[t.slug], kind: "test" });
    });
    return rows;
  };

  Marks.prototype.render = function () {
    var self = this, rows = this.rows();
    var wrap = this.box;
    Array.prototype.slice.call(wrap.children).forEach(function (c) { if (!c.classList.contains("marks-data")) c.remove(); });

    function sum(list, f) { return list.reduce(function (a, r) { return a + f(r); }, 0); }
    var quizzes = rows.filter(function (r) { return r.kind === "quiz"; });
    var tests = rows.filter(function (r) { return r.kind === "test"; });
    var got = sum(rows, function (r) { return r.rec ? r.rec.best : 0; });
    var max = sum(rows, function (r) { return r.total; });
    var attempted = quizzes.filter(function (r) { return r.rec; }).length;
    var passed = quizzes.filter(function (r) { return r.rec && r.rec.passed; }).length;

    var summary = el("div", "marks-summary");
    summary.innerHTML =
      "<div><strong>" + pct(got, max) + "%</strong><span>overall (" + got + "/" + max + ")</span></div>" +
      "<div><strong>" + attempted + "/" + quizzes.length + "</strong><span>topic quizzes attempted</span></div>" +
      "<div><strong>" + passed + "/" + quizzes.length + "</strong><span>topic quizzes passed</span></div>" +
      "<div><strong>" + tests.filter(function (r) { return r.rec; }).length + "/" + tests.length + "</strong><span>CO tests taken</span></div>";
    wrap.appendChild(summary);

    // Per-CO summary.
    var coRows = Object.keys(this.data.outcomes).map(function (co) {
      var q = quizzes.filter(function (r) { return r.co === co; });
      var t = tests.filter(function (r) { return r.co === co; })[0];
      if (!q.length) return "";
      var qg = sum(q, function (r) { return r.rec ? r.rec.best : 0; }), qm = sum(q, function (r) { return r.total; });
      return "<tr><td><span class=\"co co-" + co.toLowerCase() + "\">" + co + "</span> " + esc(self.data.outcomes[co]) + "</td>" +
        "<td>" + qg + "/" + qm + " <span class=\"muted\">(" + pct(qg, qm) + "%)</span></td>" +
        "<td>" + (t && t.rec ? t.rec.best + "/" + t.total + " <span class=\"muted\">(" + pct(t.rec.best, t.total) + "%)</span>" : "—") + "</td></tr>";
    }).join("");
    wrap.appendChild(el("h2", null, "By course outcome"));
    wrap.appendChild(el("div", "table-wrap", "<table><thead><tr><th>Outcome</th><th>Topic quizzes (best)</th><th>CO test (best)</th></tr></thead><tbody>" + coRows + "</tbody></table>"));

    // Every quiz and test.
    var body = rows.map(function (r) {
      var rec = r.rec, when = rec ? new Date(rec.updated).toLocaleDateString() : "";
      var status = !rec ? "<span class=\"muted\">Not attempted</span>" : rec.passed ? "<span class=\"ok\">Passed</span>" : "<span class=\"low\">Below pass</span>";
      return "<tr><td><a href=\"" + COURSE + "/" + r.slug + ".html\">" + esc(r.label) + "</a></td><td>" + r.co + "</td>" +
        "<td>" + (rec ? rec.best + "/" + r.total : "—") + "</td><td>" + (rec ? rec.last + "/" + r.total : "—") + "</td>" +
        "<td>" + (rec ? rec.attempts : 0) + "</td><td>" + status + "</td><td>" + when + "</td></tr>";
    }).join("");
    wrap.appendChild(el("h2", null, "Every quiz and test"));
    wrap.appendChild(el("div", "table-wrap", "<table class=\"marks-table\"><thead><tr><th>Quiz</th><th>CO</th><th>Best</th><th>Last</th><th>Attempts</th><th>Status</th><th>Last tried</th></tr></thead><tbody>" + body + "</tbody></table>"));
    var stamp = el("p", "muted print-only", "Printed " + new Date().toLocaleString() + " from " + location.href + ". Self-assessment record kept in the student's browser.");
    wrap.appendChild(stamp);
  };

  Marks.prototype.csv = function () {
    var student = read(STUDENT_KEY, {});
    var lines = [["Course", this.data.course], ["Name", student.name || ""], ["Student ID", student.id || ""], [],
      ["Quiz", "CO", "Best", "Last", "Out of", "Attempts", "Passed", "Last tried"]];
    this.rows().forEach(function (r) {
      var rec = r.rec || {};
      lines.push([r.label, r.co, rec.best != null ? rec.best : "", rec.last != null ? rec.last : "", r.total, rec.attempts || 0,
        r.rec ? (rec.passed ? "yes" : "no") : "", rec.updated ? rec.updated.slice(0, 10) : ""]);
    });
    var text = lines.map(function (row) {
      return row.map(function (v) { v = String(v); return /[",\n]/.test(v) ? "\"" + v.replace(/"/g, "\"\"") + "\"" : v; }).join(",");
    }).join("\r\n");
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + text], { type: "text/csv" }));
    a.download = "marks-" + COURSE.split("/").pop() + (student.id ? "-" + student.id : "") + ".csv";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  };

  // ---- Wire up --------------------------------------------------------------------------------
  document.querySelectorAll(".quiz[data-quiz]").forEach(function (box) { new Quiz(box); });

  var marksBox = document.querySelector("[data-marks]");
  if (marksBox) {
    var page = new Marks(marksBox);
    var student = read(STUDENT_KEY, {});
    document.querySelectorAll("[data-student]").forEach(function (input) {
      input.value = student[input.dataset.student] || "";
      input.addEventListener("input", function () {
        student[input.dataset.student] = input.value.trim();
        write(STUDENT_KEY, student);
      });
    });
    document.querySelector("[data-marks-csv]").addEventListener("click", function () { page.csv(); });
    document.querySelector("[data-marks-print]").addEventListener("click", function () { window.print(); });
    document.querySelector("[data-marks-reset]").addEventListener("click", function () {
      if (!confirm("Delete all your quiz marks for this course from this browser? This cannot be undone.")) return;
      try { localStorage.removeItem(MARKS_KEY); localStorage.removeItem(DONE_KEY); } catch (e) {}
      window.dispatchEvent(new Event("y2hl:progress"));
      page.render();
      paintChips();
    });
  }

  paintChips();
})();
