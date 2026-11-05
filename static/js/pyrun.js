// Adds Run / Edit / Reset to every Python block. Python itself loads only on the first Run.
(function () {
  var blocks = document.querySelectorAll(".prose pre > code.language-python");
  if (!blocks.length) return;

  var workerUrl = document.currentScript.src.replace("pyrun.js", "py-worker.js");
  var MAX_OUTPUT = 200000;   // characters; a program printing forever is stopped here
  var worker = null;
  var loaded = false;
  var current = null;        // the block running now

  function startWorker() {
    var w = new Worker(workerUrl);
    worker = w;
    loaded = false;
    // A stopped worker's queued events must not reach the next run.
    w.onmessage = function (e) { if (w === worker && current) current.onMessage(e.data); };
    w.onerror = function () { if (w === worker && current) current.onMessage({ type: "failed" }); };
  }

  function killWorker() {
    if (worker) worker.terminate();
    worker = null;
    loaded = false;
  }

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

  blocks.forEach(function (code, i) {
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
    editor.setAttribute("aria-label", "Python code. Tab indents; press Escape, then Tab, to leave. Ctrl+Enter runs.");
    editor.hidden = true;

    var inputWrap = el("details", "py-input");
    var summary = el("summary", "", "Input for input()");
    var input = el("textarea", "py-stdin");
    input.rows = 3;
    input.spellcheck = false;
    input.placeholder = "One value per line";
    input.setAttribute("aria-label", "Input for input(), one value per line");
    inputWrap.appendChild(summary);
    inputWrap.appendChild(input);
    inputWrap.hidden = !/\binput\s*\(/.test(original);

    var output = el("pre", "py-output");
    output.hidden = true;
    output.setAttribute("aria-label", "Program output");
    output.tabIndex = 0;

    pre.after(bar);
    bar.before(editor);
    bar.after(inputWrap);
    inputWrap.after(output);

    function sourceText() { return editor.hidden ? original : editor.value; }

    function append(text, cls) {
      var span = el("span", cls, text);
      output.appendChild(span);
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
        if (m.type === "started") {
          loaded = true;
          status.textContent = "Running…";
        } else if (m.type === "out" || m.type === "err") {
          chars += m.text.length;
          append(m.text, m.type === "err" ? "py-err" : "");
          if (chars > MAX_OUTPUT) {
            killWorker();
            append("\nStopped: too much output.\n", "py-err");
            finish("Stopped");
          }
        } else if (m.type === "done") {
          if (!output.textContent) append("(The program finished without printing anything.)", "py-note");
          finish("Finished in " + (m.ms < 1000 ? m.ms + " ms" : (m.ms / 1000).toFixed(1) + " s"));
        } else if (m.type === "failed") {
          killWorker();
          append("Python could not load. Your network may be blocking cdn.jsdelivr.net.\n" +
                 "Try mobile data, or copy the code and run it in your own Python.\n", "py-err");
          finish("Could not load");
        }
      },
      halt: function (message) {
        killWorker();
        append("\n" + message + "\n", "py-note");
        finish("Stopped");
      }
    };

    function runCode() {
      if (current) current.halt("Stopped, because another program was started.");
      current = task;
      chars = 0;
      output.textContent = "";
      output.hidden = false;
      setRunning(true);
      status.textContent = loaded ? "Running…" : "Loading Python (about 10 MB, first time only)…";
      if (!worker) startWorker();
      worker.postMessage({ code: sourceText(), stdin: input.value });
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
      inputWrap.hidden = !/\binput\s*\(/.test(original);
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
        var s = editor.selectionStart;
        editor.setRangeText("    ", s, editor.selectionEnd, "end");
      } else if (e.key !== "Shift") {
        leaving = false;
      }
    });
  });
})();
