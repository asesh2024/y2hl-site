// Site-wide search. build.py writes the index; it loads the first time search is opened.
(function () {
  var opener = document.querySelector(".search-open");
  var dialog = document.getElementById("search-dialog");
  if (!opener || !dialog || !dialog.showModal) return;

  var input = dialog.querySelector(".search-input");
  var status = dialog.querySelector(".search-status");
  var list = dialog.querySelector(".search-results");
  var indexUrl = document.currentScript.src.split("js/search.js")[0] + "search-index.json?v=" + opener.dataset.version;
  var HINT = "Try Huffman, pumping lemma or Strategy pattern.";
  var STOP = { a: 1, an: 1, and: 1, the: 1, of: 1, in: 1, on: 1, to: 1, for: 1, is: 1, what: 1, how: 1, with: 1, by: 1 };
  var MAX_HITS = 30;
  var docs = null, vocab = null, loading = null, active = -1, timer = 0;
  opener.hidden = false;

  // Lower-cases and strips accents, keeping every character's position, so a match in the
  // folded text points at the same place in the original. Boruvka finds Borůvka.
  function fold(s) {
    return s.replace(/[^\x00-\x7f]|_/g, function (c) {
      return c === "_" ? " " : c.normalize("NFD").charAt(0);
    }).toLowerCase();
  }

  function load() {
    if (!loading) loading = fetch(indexUrl).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    }).then(function (raw) {
      vocab = new Map();
      docs = raw.map(function (d) {
        var doc = {
          where: d[0], title: d[1], url: d[2], desc: d[3],
          fWhere: fold(d[0]), fTitle: fold(d[1]), fDesc: fold(d[3]), fKeys: fold(d[4]),
          sections: d[5].map(function (s) { return { id: s[0], h: s[1], text: s[2], fH: fold(s[1]), fText: fold(s[2]) }; })
        };
        [doc.fTitle, doc.fDesc, doc.fKeys].concat(doc.sections.map(function (s) { return s.fH + " " + s.fText; })).forEach(function (t) {
          (t.match(/[a-z0-9]+/g) || []).forEach(function (w) { vocab.set(w, (vocab.get(w) || 0) + 1); });
        });
        return doc;
      });
    }).catch(function (e) {
      loading = null;
      throw e;
    });
    return loading;
  }

  // Edit distance that counts a swap of neighbours as one mistake (djikstra, dijkstra).
  function distance(a, b, limit) {
    if (Math.abs(a.length - b.length) > limit) return limit + 1;
    var before = null, prev = [], i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      var row = [i];
      for (j = 1; j <= b.length; j++) {
        row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        if (before && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) row[j] = Math.min(row[j], before[j - 2] + 1);
      }
      before = prev;
      prev = row;
    }
    return prev[b.length];
  }

  function isKnown(word) {
    if (word.length <= 2) return vocab.has(word);
    for (var w of vocab.keys()) if (w.startsWith(word)) return true;
    return false;
  }

  function correct(word) {
    if (word.length < 4 || /\d/.test(word)) return null;
    var limit = word.length < 6 ? 1 : 2, best = null, bestD = limit + 1, bestN = 0;
    vocab.forEach(function (n, w) {
      if (w[0] !== word[0]) return;
      var d = distance(word, w, limit);
      // A half-typed word may still be close to the start of a longer one.
      if (w.length > word.length && d > 1 && distance(word, w.slice(0, word.length), 1) <= 1) d = 1;
      if (d < bestD || (d === bestD && n > bestN)) { best = w; bestD = d; bestN = n; }
    });
    return bestD <= limit ? best : null;
  }

  function makeTerm(word) {
    // A word of one or two letters must match whole: NP shouldn't find npm.
    return {
      word: word,
      any: new RegExp("\\b" + word + (word.length <= 2 ? "\\b" : ""), "g"),
      whole: new RegExp("\\b" + word + "(?:s|es)?\\b", "g")   // a plural counts as the whole word
    };
  }

  function has(text, re) { return text.search(re) >= 0; }
  function count(text, re) { var m = text.match(re); return m ? m.length : 0; }

  function parse(query) {
    var words = fold(query).match(/[a-z0-9]+/g) || [];
    var kept = words.filter(function (w) { return !STOP[w]; });
    if (!kept.length) kept = words;
    var changed = false;
    var unique = kept.filter(function (w, i) { return kept.indexOf(w) === i; }).map(function (w) {
      if (isKnown(w)) return w;
      var fixed = correct(w);
      if (fixed) changed = true;
      return fixed || w;
    });
    return {
      terms: unique.map(makeTerm),
      corrected: changed ? unique.join(" ") : "",
      phrase: !changed && words.length > 1 ? new RegExp("\\b" + words.join("[^a-z0-9]+")) : null
    };
  }

  function scoreDoc(doc, q) {
    var score = 0, found = 0, inTitle = 0;
    var bySection = doc.sections.map(function () { return 0; });
    q.terms.forEach(function (t) {
      var s = 0, body = 0;
      // A whole word beats the start of a longer one: gate should find GATE before gateway.
      if (has(doc.fKeys, t.whole)) {
        s += 60;
        inTitle++;
      } else if (has(doc.fTitle, t.any)) {
        s += has(doc.fTitle, t.whole) ? 40 : 10;
        inTitle++;
      }
      if (has(doc.fDesc, t.any)) s += 6;
      if (has(doc.fWhere, t.any)) s += 4;
      doc.sections.forEach(function (sec, i) {
        if (has(sec.fH, t.any)) { s += has(sec.fH, t.whole) ? 12 : 4; bySection[i] += 10; }
        // The start of a longer word counts for little.
        var c = count(sec.fText, t.whole);
        c += (count(sec.fText, t.any) - c) * 0.2;
        if (c) { body += c; bySection[i] += 1 + Math.log(1 + c); }
      });
      if (body) s += 3 * Math.log(1 + body);
      if (s) found++;
      score += s;
    });
    if (q.phrase && found === q.terms.length) {
      if (has(doc.fTitle, q.phrase)) score += 40;
      doc.sections.forEach(function (sec, i) {
        if (has(sec.fH, q.phrase)) { score += 20; bySection[i] += 12; }
        if (has(sec.fText, q.phrase)) { score += 15; bySection[i] += 8; }
      });
    }
    var best = -1, top = 0;
    bySection.forEach(function (v, i) { if (v > top) { top = v; best = i; } });
    return { doc: doc, score: score, found: found, section: inTitle === q.terms.length ? null : doc.sections[best] };
  }

  function search(query) {
    var q = parse(query);
    if (!q.terms.length) return { q: q, hits: [], total: 0 };
    var scored = docs.map(function (d) { return scoreDoc(d, q); });
    var all = scored.filter(function (h) { return h.found === q.terms.length; });
    var partial = !all.length && q.terms.length > 1;
    var hits = partial ? scored.filter(function (h) { return h.found; }) : all;
    hits.sort(function (a, b) { return (b.found - a.found) || (b.score - a.score); });
    return { q: q, hits: hits.slice(0, MAX_HITS), total: hits.length, partial: partial };
  }

  // Appends text with the query's words marked. Builds DOM nodes, so page text is never parsed as HTML.
  function appendMarked(parent, text, folded, terms) {
    var re = new RegExp(terms.map(function (t) { return t.any.source; }).join("|"), "g");
    var at = 0, m;
    while ((m = re.exec(folded))) {
      parent.appendChild(document.createTextNode(text.slice(at, m.index)));
      var mark = document.createElement("mark");
      mark.textContent = text.substr(m.index, m[0].length);
      parent.appendChild(mark);
      at = m.index + m[0].length;
    }
    parent.appendChild(document.createTextNode(text.slice(at)));
  }

  function snippet(parent, text, folded, q) {
    var at = q.phrase ? folded.search(q.phrase) : -1;
    q.terms.forEach(function (t) {
      if (at < 0) at = folded.search(t.any);
    });
    var LENGTH = 170;
    var start = Math.max(0, at - 50);
    if (start > 0) {
      var space = text.indexOf(" ", start);
      if (space >= 0 && space < at) start = space + 1;
    }
    var end = Math.min(text.length, start + LENGTH);
    if (end < text.length) {
      var last = text.lastIndexOf(" ", end);
      if (last > start) end = last;
    }
    if (start > 0) parent.appendChild(document.createTextNode("… "));
    appendMarked(parent, text.slice(start, end), folded.slice(start, end), q.terms);
    if (end < text.length) parent.appendChild(document.createTextNode(" …"));
  }

  function span(cls) {
    var s = document.createElement("span");
    s.className = cls;
    return s;
  }

  function setActive(i) {
    var items = list.children;
    if (active >= 0 && items[active]) items[active].setAttribute("aria-selected", "false");
    active = i;
    if (i >= 0 && items[i]) {
      items[i].setAttribute("aria-selected", "true");
      items[i].scrollIntoView({ block: "nearest" });
      input.setAttribute("aria-activedescendant", items[i].id);
    } else {
      input.removeAttribute("aria-activedescendant");
    }
  }

  function render() {
    clearTimeout(timer);
    timer = 0;
    var query = input.value.trim();
    list.textContent = "";
    active = -1;
    input.removeAttribute("aria-activedescendant");
    input.setAttribute("aria-expanded", "false");
    if (!query) { status.textContent = HINT; return; }
    if (!docs) return;

    var r = search(query);
    if (!r.q.terms.length || !r.hits.length) {
      status.textContent = 'Nothing found for "' + query + '". Check the spelling, or try a shorter word.';
      return;
    }
    var message = r.total === 1 ? "1 page" : r.total + " pages";
    if (r.total > r.hits.length) message = "Top " + r.hits.length + " of " + r.total + " pages";
    if (r.q.corrected) message += ' for "' + r.q.corrected + '"';
    if (r.partial) message += " with some of your words";
    status.textContent = message;

    r.hits.forEach(function (h, i) {
      var doc = h.doc, sec = h.section;
      var a = document.createElement("a");
      a.className = "search-hit";
      a.id = "search-hit-" + i;
      a.href = doc.url + (sec && sec.id ? "#" + sec.id : "");
      a.setAttribute("role", "option");
      a.setAttribute("aria-selected", "false");
      a.tabIndex = -1;

      var where = span("search-where");
      where.textContent = doc.where + (sec && sec.h ? " › " + sec.h : "");
      a.appendChild(where);
      var title = span("search-title");
      appendMarked(title, doc.title, doc.fTitle, r.q.terms);
      a.appendChild(title);

      var snip = span("search-snip");
      var text = sec && sec.text ? sec.text : doc.desc;
      var folded = sec && sec.text ? sec.fText : doc.fDesc;
      if (text) {
        snippet(snip, text, folded, r.q);
        a.appendChild(snip);
      }
      list.appendChild(a);
    });
    input.setAttribute("aria-expanded", "true");
    setActive(0);
  }

  function open() {
    if (dialog.open) return;
    dialog.showModal();
    input.focus();
    input.select();
    if (docs) { render(); return; }
    status.textContent = "Loading search…";
    load().then(render).catch(function () {
      status.textContent = "Search could not load. Check your connection, then close this and try again.";
    });
  }

  opener.addEventListener("click", open);
  dialog.querySelector(".search-close").addEventListener("click", function () { dialog.close(); });
  // A click outside the panel lands on the dialog element itself.
  dialog.addEventListener("click", function (e) {
    if (e.target === dialog) dialog.close();
    else if (e.target.closest(".search-hit")) dialog.close();
  });

  input.addEventListener("input", function () {
    clearTimeout(timer);
    timer = setTimeout(render, 80);
  });

  input.addEventListener("keydown", function (e) {
    var n = list.children.length;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (n) setActive((active + (e.key === "ArrowDown" ? 1 : n - 1)) % n);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (timer) render();
      if (list.children[active]) list.children[active].click();
    }
  });

  document.addEventListener("keydown", function (e) {
    var t = e.target;
    var typing = t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName);
    if ((e.key === "/" && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) {
      e.preventDefault();
      open();
    }
  });
})();
