// First-party conversion tracking. No third-party scripts, no personal data.
(function () {
  const queue = [];
  const MAX_QUEUE = 200;
  const MAX_RETRIES = 3;
  const MAX_ERRORS_PER_PAGE = 5;
  let flushing = false;
  let retries = 0;
  let reportedErrors = 0;

  async function flush() {
    if (flushing || !window.sb || queue.length === 0) return;
    flushing = true;
    const batch = queue.splice(0, queue.length);
    let failed = false;
    try {
      const { error } = await window.sb.from("events").insert(batch);
      failed = !!error;
    } catch (e) {
      failed = true;
    }
    flushing = false;
    if (failed && retries < MAX_RETRIES) {
      retries += 1;
      queue.unshift(...batch);
      queue.splice(MAX_QUEUE);
      setTimeout(flush, 2000 * retries);
      return;
    }
    if (!failed) retries = 0;
    if (queue.length) flush();
  }

  window.track = function track(name, props = {}) {
    if (typeof name !== "string" || !name) return;
    if (queue.length >= MAX_QUEUE) return;
    queue.push({
      name: name.slice(0, 64),
      path: location.pathname.slice(0, 200),
      property_code: typeof props.code === "string" ? props.code.slice(0, 32) : null,
      detail: props.detail ? String(props.detail).slice(0, 200) : null,
    });
    if (typeof window.va === "function") window.va("event", { name });
    setTimeout(flush, 0);
  };

  function reportError(message) {
    if (reportedErrors >= MAX_ERRORS_PER_PAGE) return;
    reportedErrors += 1;
    window.track("js_error", { detail: String(message || "erro desconhecido").slice(0, 200) });
  }

  window.addEventListener("error", (event) => {
    if (!event.filename || !event.filename.startsWith(location.origin)) return;
    reportError(event.message);
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    const stack = reason && typeof reason.stack === "string" ? reason.stack : "";
    if (stack && !stack.includes(location.origin)) return;
    reportError(reason && reason.message ? reason.message : reason);
  });

  window.addEventListener("load", () => setTimeout(flush, 1200));
})();
