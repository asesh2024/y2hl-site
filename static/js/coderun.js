// Adds Run / Edit / Reset to Python blocks and to Java blocks that have a main method.
// Each language runtime loads only on the first Run.
(function () {
  var blocks = [].filter.call(
    document.querySelectorAll(".prose pre > code.language-python, .prose pre > code.language-java"),
    function (c) {
      if (c.classList.contains("language-py")) return false;   // a py fence shows Python that can't run here, such as TensorFlow
      return c.classList.contains("language-python") || /\bvoid\s+main\s*\(/.test(c.textContent);
    });
  if (!blocks.length) return;

  var script = document.currentScript.src;
  var version = script.split("?")[1] || "";
  var jsDir = script.split("coderun.js")[0];
  var MAX_OUTPUT = 200000;   // characters; a program printing forever is stopped here
  var current = null;        // the block running now

  function deliver(m) { if (current) current.onMessage(m); }

  // Python: Pyodide in a web worker.
  var python = {
    worker: null,
    loaded: false,
    loadingText: "Loading Python (about 10 MB, first time only)…",
    failText: "Python could not load. Your network may be blocking cdn.jsdelivr.net.\n",
    inputLabel: "Input for input()",
    readsInput: /\binput\s*\(/,
    send: function (code, stdin) {
      if (!this.worker) {
        var self = this;
        var w = new Worker(jsDir + "py-worker.js?" + version);
        this.worker = w;
        this.loaded = false;
        // A stopped worker's queued events must not reach the next run.
        w.onmessage = function (e) { if (w === self.worker) deliver(e.data); };
        w.onerror = function () { if (w === self.worker) deliver({ type: "failed" }); };
      }
      this.worker.postMessage({ code: code, stdin: stdin });
    },
    kill: function () {
      if (this.worker) this.worker.terminate();
      this.worker = null;
      this.loaded = false;
    }
  };

  // Java: CheerpJ in a frame, so removing the frame stops the program.
  var java = {
    frame: null,
    ready: false,
    pending: null,
    loaded: false,
    loadingText: "Loading Java (the first run can take a minute)…",
    failText: "Java could not load. Your network may be blocking cjrtnc.leaningtech.com.\n",
    inputLabel: "Input for Scanner / System.in",
    readsInput: /\bScanner\b|System\.in\b/,
    send: function (code, stdin) {
      this.pending = { code: code, stdin: stdin };
      if (!this.frame) {
        var f = document.createElement("iframe");
        f.src = jsDir.replace(/js\/$/, "") + "java-runner.html?" + version;
        f.title = "Java runtime";
        f.tabIndex = -1;
        f.setAttribute("aria-hidden", "true");
        f.className = "java-frame";
        document.body.appendChild(f);
        this.frame = f;
        this.ready = false;
      } else if (this.ready) {
        this.flushPending();
      }
    },
    flushPending: function () {
      if (this.pending && this.frame) {
        this.frame.contentWindow.postMessage(this.pending, location.origin);
        this.pending = null;
      }
    },
    kill: function () {
      if (this.frame) this.frame.remove();
      this.frame = null;
      this.ready = false;
      this.pending = null;
      this.loaded = false;
    }
  };

  addEventListener("message", function (e) {
    if (!java.frame || e.source !== java.frame.contentWindow || e.origin !== location.origin) return;
    if (e.data.type === "ready") {
      java.ready = true;
      java.flushPending();
    } else {
      deliver(e.data);
    }
  });

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  function button(cls, text) {
    var b = el("button", cls, text);
    b.type = "button";
    return b;
  }

  blocks.forEach(function (code) {
    var engine = code.classList.contains("language-java") ? java : python;
    var lang = engine === java ? "Java" : "Python";
    var pre = code.parentNode;
    var original = code.textContent.replace(/\n$/, "");

    var bar = el("div", "py-bar");
    var run = button("py-btn py-run", "▶ Run");
    var stop = button("py-btn", "■ Stop");
    var edit = button("py-btn", "Edit");
    var reset = button("py-btn", "Reset");
    var status = el("span", "py-status");
    status.setAttribute("role", "status");
    stop.hidden = true;
    reset.hidden = true;
    [run, stop, edit, reset, status].forEach(function (n) { bar.appendChild(n); });

    var editor = el("textarea", "py-editor");
    editor.spellcheck = false;
    editor.setAttribute("autocapitalize", "off");
    editor.setAttribute("autocorrect", "off");
    editor.setAttribute("aria-label", lang + " code. Tab indents; press Escape, then Tab, to leave. Ctrl+Enter runs.");
    editor.hidden = true;

    var inputWrap = el("details", "py-input");
    var summary = el("summary", "", engine.inputLabel);
    var input = el("textarea", "py-stdin");
    input.rows = 3;
    input.spellcheck = false;
    input.placeholder = "One value per line";
    input.setAttribute("aria-label", engine.inputLabel + ", one value per line");
    inputWrap.appendChild(summary);
    inputWrap.appendChild(input);
    inputWrap.hidden = !engine.readsInput.test(original);

    var output = el("pre", "py-output");
    output.hidden = true;
    output.setAttribute("aria-label", "Program output");
    output.tabIndex = 0;

    pre.after(bar);
    bar.before(editor);
    bar.after(inputWrap);
    inputWrap.after(output);

    function sourceText() { return editor.hidden ? original : editor.value; }

    // Consecutive writes of one kind share a span, so heavy output doesn't create thousands of nodes.
    function append(text, cls) {
      var last = output.lastChild;
      if (last && last.className === (cls || "")) last.firstChild.appendData(text);
      else if (text) output.appendChild(el("span", cls, text));
    }

    function setRunning(on) {
      run.hidden = on;
      stop.hidden = !on;
    }

    function finish(message) {
      setRunning(false);
      status.textContent = message;
      if (current === task) current = null;
    }

    var chars = 0;
    var task = {
      onMessage: function (m) {
        if (m.type === "status") {
          status.textContent = m.text;
        } else if (m.type === "started") {
          engine.loaded = true;
          status.textContent = "Running…";
        } else if (m.type === "image") {
          var picture = el("img", "py-img");
          picture.src = "data:image/png;base64," + m.data;
          picture.alt = "Chart drawn by the program";
          output.appendChild(picture);
        } else if (m.type === "out" || m.type === "err") {
          chars += m.text.length;
          append(m.text, m.type === "err" ? "py-err" : "");
          if (chars > MAX_OUTPUT) {
            engine.kill();
            append("\nStopped: too much output.\n", "py-err");
            finish("Stopped");
          }
        } else if (m.type === "done") {
          if (m.compileError) {
            engine.loaded = true;
            finish("Did not compile");
            return;
          }
          if (!output.childNodes.length) append("(The program finished without printing anything.)", "py-note");
          finish("Finished in " + (m.ms < 1000 ? m.ms + " ms" : (m.ms / 1000).toFixed(1) + " s"));
        } else if (m.type === "failed") {
          engine.kill();
          append(engine.failText + "Try mobile data, or copy the code and run it on your own computer.\n", "py-err");
          finish("Could not load");
        }
      },
      halt: function (message) {
        engine.kill();
        append("\n" + message + "\n", "py-note");
        finish("Stopped");
      }
    };

    function runCode() {
      // Analytics: at most one count per page view that someone ran a program here.
      if (!window.y2hlRunCounted && window.goatcounter && window.goatcounter.count) {
        window.y2hlRunCounted = true;
        window.goatcounter.count({ path: "run" + location.pathname, title: "Ran a program", event: true });
      }
      if (current) current.halt("Stopped, because another program was started.");
      current = task;
      chars = 0;
      output.textContent = "";
      output.hidden = false;
      setRunning(true);
      status.textContent = engine.loaded ? "Running…" : engine.loadingText;
      engine.send(sourceText(), input.value);
    }

    run.addEventListener("click", runCode);
    stop.addEventListener("click", function () {
      if (current === task) task.halt("Stopped by you.");
    });

    edit.addEventListener("click", function () {
      editor.value = original;
      editor.rows = original.split("\n").length + 1;
      editor.hidden = false;
      pre.hidden = true;
      edit.hidden = true;
      reset.hidden = false;
      inputWrap.hidden = false;
      editor.focus();
    });

    reset.addEventListener("click", function () {
      if (current === task) task.halt("Stopped by you.");
      editor.hidden = true;
      pre.hidden = false;
      edit.hidden = false;
      reset.hidden = true;
      output.hidden = true;
      output.textContent = "";
      status.textContent = "";
      input.value = "";
      inputWrap.hidden = !engine.readsInput.test(original);
      edit.focus();
    });

    var leaving = false;
    editor.addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        runCode();
      } else if (e.key === "Escape") {
        leaving = true;
      } else if (e.key === "Tab" && !e.shiftKey && !leaving) {
        e.preventDefault();
        editor.setRangeText("    ", editor.selectionStart, editor.selectionEnd, "end");
      } else if (e.key !== "Shift") {
        leaving = false;
      }
    });
  });
})();
