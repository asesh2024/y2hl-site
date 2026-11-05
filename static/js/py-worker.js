// Runs Python (Pyodide) off the main thread, so a long or endless program cannot freeze the page.
// The page stops a program by terminating this worker and starting a new one.
var PYODIDE = "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/";
var pyodide = null;
var datasetLoaded = false;
var LIBRARIES = [[/\bnumpy\b/, "NumPy"], [/\bpandas\b/, "pandas"], [/\bsklearn\b/, "scikit-learn"], [/\bmatplotlib\b/, "matplotlib"], [/\bxgboost\b/, "XGBoost"], [/\blightgbm\b/, "LightGBM"]];

var WRAPPER = [
  "import os, sys, traceback, base64, io",
  "import y2hl_page",
  "sys.path.insert(0, '/home/pyodide')",
  "os.chdir('/home/pyodide')",
  "os.environ['MPLBACKEND'] = 'AGG'",
  "import logging; logging.getLogger('matplotlib.font_manager').setLevel(logging.ERROR)",
  // Every open matplotlib figure becomes a picture in the output; plt.show() or the end of the program sends it.
  "def _y2hl_figures():",
  "    if 'matplotlib.pyplot' not in sys.modules:",
  "        return",
  "    plt = sys.modules['matplotlib.pyplot']",
  "    sys.stdout.flush()",
  "    for n in plt.get_fignums():",
  "        buf = io.BytesIO()",
  "        plt.figure(n).savefig(buf, format='png', dpi=110, bbox_inches='tight')",
  "        y2hl_page.image(base64.b64encode(buf.getvalue()).decode())",
  "    plt.close('all')",
  "def _y2hl_run(src):",
  "    if 'matplotlib' in src:",
  "        import matplotlib.pyplot as plt",
  "        plt.show = lambda *a, **k: _y2hl_figures()",
  "    ns = {'__name__': '__main__'}",
  "    try:",
  "        exec(compile(src, 'your_code.py', 'exec'), ns)",
  "    except SystemExit:",
  "        pass",
  "    except BaseException as e:",
  "        sys.stdout.flush()",
  "        traceback.print_exception(type(e), e, e.__traceback__.tb_next)",  // hide this wrapper's frame
  "    try:",
  "        _y2hl_figures()",
  "    except BaseException as e:",
  "        traceback.print_exception(type(e), e, None)",
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
  pyodide.registerJsModule("y2hl_page", { image: function (data) { postMessage({ type: "image", data: data }); } });
  pyodide.runPython(WRAPPER);
})();

onmessage = async function (e) {
  try {
    await loading;
  } catch (err) {
    postMessage({ type: "failed" });
    return;
  }
  // The course's practice data is one small Python file, fetched when a program imports it.
  var imports = e.data.code;
  if (/\bplacement_predict\b/.test(imports)) {
    try {
      var helper = await (await fetch(new URL("../data/placement_predict.py", location.href))).text();
      pyodide.FS.writeFile("/home/pyodide/placement_predict.py", helper);
      if (!datasetLoaded) {
        postMessage({ type: "status", text: "Loading the course dataset…" });
        var data = await fetch(new URL("../data/placement_predict_50k.csv", location.href));
        if (data.ok) {
          pyodide.FS.writeFile("/home/pyodide/placement_predict_50k.csv", new Uint8Array(await data.arrayBuffer()));
          datasetLoaded = true;
        }
      }
      imports += "\nimport numpy\nimport pandas\nimport sklearn\n";
    } catch (err) { /* the program's own import error will explain it */ }
  }
  // NumPy, pandas, scikit-learn and matplotlib download only when a program imports them.
  var libs = LIBRARIES.filter(function (l) { return l[0].test(imports); }).map(function (l) { return l[1]; });
  if (libs.length) postMessage({ type: "status", text: "Loading " + libs.join(", ") + " (this can take a minute or two)…" });
  try {
    await pyodide.loadPackagesFromImports(imports, { messageCallback: function () {}, errorCallback: function () {} });
  } catch (err) { /* the program's own import error will explain it */ }
  postMessage({ type: "started" });
  var lines = (e.data.stdin || "").split("\n");
  if (lines[lines.length - 1] === "") lines.pop();
  pyodide.setStdin({ stdin: function () { return lines.length ? lines.shift() + "\n" : undefined; } });
  var ran = performance.now();
  pyodide.globals.get("_y2hl_run")(e.data.code);
  postMessage({ type: "done", ms: Math.round(performance.now() - ran) });
};
