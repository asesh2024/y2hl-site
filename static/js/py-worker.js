// Runs Python (Pyodide) off the main thread, so a long or endless program cannot freeze the page.
// The page stops a program by terminating this worker and starting a new one.
var PYODIDE = "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/";
var pyodide = null;

var WRAPPER = [
  "import sys, traceback",
  "def _y2hl_run(src):",
  "    ns = {'__name__': '__main__'}",
  "    try:",
  "        exec(compile(src, 'your_code.py', 'exec'), ns)",
  "    except SystemExit:",
  "        pass",
  "    except BaseException as e:",
  "        sys.stdout.flush()",
  "        traceback.print_exception(type(e), e, e.__traceback__.tb_next)",  // hide this wrapper's frame
  "    sys.stdout.flush()",
  "    sys.stderr.flush()"
].join("\n");

// A raw byte stream, so text without a final newline still reaches the page.
function stream(type) {
  var decoder = new TextDecoder();
  return {
    isatty: true,  // line-buffered: output appears as it is printed
    write: function (bytes) {
      postMessage({ type: type, text: decoder.decode(bytes, { stream: true }) });
      return bytes.length;
    }
  };
}

var loading = (async function () {
  importScripts(PYODIDE + "pyodide.js");
  pyodide = await loadPyodide({ indexURL: PYODIDE });
  pyodide.setStdout(stream("out"));
  pyodide.setStderr(stream("err"));
  pyodide.runPython(WRAPPER);
})();

onmessage = async function (e) {
  try {
    await loading;
  } catch (err) {
    postMessage({ type: "failed" });
    return;
  }
  postMessage({ type: "started" });
  var lines = (e.data.stdin || "").split("\n");
  if (lines[lines.length - 1] === "") lines.pop();
  pyodide.setStdin({ stdin: function () { return lines.length ? lines.shift() + "\n" : undefined; } });
  var ran = performance.now();
  pyodide.globals.get("_y2hl_run")(e.data.code);
  postMessage({ type: "done", ms: Math.round(performance.now() - ran) });
};
