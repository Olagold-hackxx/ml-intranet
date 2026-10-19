// Web Worker that runs Python tests with Pyodide (Python + NumPy, in the browser).
/* global loadPyodide */
importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js");

let ready = null;
function boot() {
  if (!ready) {
    ready = (async () => {
      const py = await loadPyodide();
      await py.loadPackage(["numpy"]);
      return py;
    })();
  }
  return ready;
}

const RUNNER = `
import sys, os, io, traceback, importlib, contextlib
def __mli_run(files, code):
    work = "/home/pyodide/work"
    os.makedirs(work, exist_ok=True)
    os.chdir(work)
    if work not in sys.path:
        sys.path.insert(0, work)
    for name, text in files.items():
        d = os.path.dirname(name)
        if d:
            os.makedirs(d, exist_ok=True)
        with open(name, "w") as f:
            f.write(text)
        mod = os.path.splitext(os.path.basename(name))[0]
        sys.modules.pop(mod, None)
    importlib.invalidate_caches()
    out = io.StringIO()
    try:
        with contextlib.redirect_stdout(out), contextlib.redirect_stderr(out):
            exec(compile(code, "<check>", "exec"), {"__name__": "__check__"})
        return {"ok": True, "out": out.getvalue()[-2000:]}
    except BaseException:
        tb = traceback.format_exc().strip().splitlines()
        return {"ok": False, "out": out.getvalue()[-1500:], "error": "\\n".join(tb[-6:])}
`;

self.onmessage = async (e) => {
  const { id, files, code } = e.data;
  try {
    const py = await boot();
    if (!py.globals.get("__mli_run")) py.runPython(RUNNER);
    const run = py.globals.get("__mli_run");
    const res = run(py.toPy(files), code).toJs({ dict_converter: Object.fromEntries });
    self.postMessage({ id, ...res });
  } catch (err) {
    self.postMessage({ id, ok: false, error: String(err && err.message ? err.message : err) });
  }
};
