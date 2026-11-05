// Runs inside static/java-runner.html, in a frame the page removes to stop a program.
// CheerpJ provides a full Java 21 runtime and javac in the browser (free for educational use).
(function () {
  var consoleEl = document.getElementById("console");
  var stream = "out";
  var ready;

  function post(m) { parent.postMessage(m, location.origin); }

  try {
    ready = cheerpjInit({ version: 21, status: "none" });
  } catch (e) {
    post({ type: "failed" });
    return;
  }

  new MutationObserver(flush).observe(consoleEl, { childList: true, characterData: true, subtree: true });

  // Drain the console on every change, so a program that prints forever stays cheap to handle.
  // The launcher writes \u0001 just before an exception report, which turns the rest of the output red.
  function flush() {
    var text = consoleEl.textContent;
    if (!text) return;
    consoleEl.textContent = "";
    var mark = text.indexOf("\u0001");
    if (mark >= 0) {
      send(text.slice(0, mark));
      stream = "err";
      text = text.slice(mark + 1);
    }
    send(text);
  }

  function send(text) {
    if (text) post({ type: stream, text: text.replace(/\/str\//g, "") });
  }

  function reset(kind) {
    flush();
    stream = kind;
  }

  function addFile(path, text) { cheerpOSAddStringFile(path, new TextEncoder().encode(text)); }

  // The launcher feeds the input box to System.in and hides its own frames from stack traces.
  var LAUNCHER = [
    "public class Y2hlRun {",
    "  public static void main(String[] a) throws Exception {",
    "    final java.io.PrintStream real = System.out;",
    "    java.io.PrintStream capped = new java.io.PrintStream(new java.io.OutputStream() {",  // ends a runaway program at the source
    "      long total = 0;",
    "      public void write(int b) { write(new byte[] { (byte) b }, 0, 1); }",
    "      public synchronized void write(byte[] b, int off, int len) {",
    "        real.write(b, off, len);",
    "        total += len;",
    "        if (total > 100000) {",
    "          real.println(\"\\u0001\\nStopped: too much output.\");",
    "          real.flush();",
    "          Runtime.getRuntime().halt(1);",
    "        }",
    "      }",
    "      public void flush() { real.flush(); }",
    "    }, true, \"UTF-8\");",
    "    System.setOut(capped);",
    "    System.setErr(capped);",
    "    System.setIn(new java.io.FileInputStream(\"/str/stdin.txt\"));",
    "    java.lang.reflect.Method m;",
    "    try { m = Class.forName(a[0]).getMethod(\"main\", String[].class); }",
    "    catch (ReflectiveOperationException e) {",
    "      System.out.println(\"This code has no public static void main(String[] args) in class \" + a[0] + \".\");",
    "      return;",
    "    }",
    "    m.setAccessible(true);",
    "    try { m.invoke(null, (Object) new String[0]); }",
    "    catch (java.lang.reflect.InvocationTargetException e) {",
    "      Throwable t = e.getCause();",
    "      System.out.flush();",
    "      System.out.println(\"\\u0001Exception in thread \\\"main\\\" \" + t);",
    "      for (StackTraceElement f : t.getStackTrace()) {",
    "        String c = f.getClassName();",
    "        if (!c.equals(\"Y2hlRun\") && !c.startsWith(\"java.lang.reflect\") && !c.startsWith(\"java.lang.invoke\") && !c.startsWith(\"jdk.internal.reflect\"))",
    "          System.out.println(\"\\tat \" + f);",
    "      }",
    "    }",
    "    System.out.flush();",
    "  }",
    "}"
  ].join("\n");

  function namesFrom(code) {
    var bare = code.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/.*$/gm, " ");
    var pkg = /^\s*package\s+([\w.]+)\s*;/m.exec(bare);
    var pub = /\bpublic\s+(?:(?:final|abstract|sealed|strictfp)\s+)*(?:class|record|interface|enum)\s+(\w+)/.exec(bare);
    var cut = bare.search(/\bvoid\s+main\s*\(/);
    var before = cut < 0 ? bare : bare.slice(0, cut);
    var all = before.match(/\b(?:class|record|interface|enum)\s+\w+/g) || [];
    var first = all.length ? all[0].split(/\s+/)[1] : "Main";
    var name = pub ? pub[1] : first;
    return { file: name, main: (pkg ? pkg[1] + "." : "") + name };
  }

  addEventListener("message", async function (e) {
    if (e.source !== parent || e.origin !== location.origin) return;
    try {
      await ready;
      var names = namesFrom(e.data.code);
      var source = "/str/" + names.file + ".java";
      addFile(source, e.data.code);
      addFile("/str/Y2hlRun.java", LAUNCHER);
      addFile("/str/stdin.txt", e.data.stdin || "");

      post({ type: "status", text: "Compiling…" });
      reset("err");
      var compiled = await cheerpjRunMain("com.sun.tools.javac.Main", "", "-proc:none", "-encoding", "UTF-8",
        "-Xlint:-options", "-d", "/files/y2hl/", source, "/str/Y2hlRun.java");
      flush();
      if (compiled !== 0) {
        post({ type: "done", compileError: true });
        return;
      }

      post({ type: "started" });
      reset("out");
      var began = performance.now();
      await cheerpjRunMain("Y2hlRun", "/files/y2hl/", names.main);
      flush();
      post({ type: "done", ms: Math.round(performance.now() - began) });
    } catch (err) {
      post({ type: "failed" });
    }
  });

  post({ type: "ready" });
})();
