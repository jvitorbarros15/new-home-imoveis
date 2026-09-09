// First-party conversion tracking. No third-party scripts, no personal data.
(function () {
  const queue = [];
  let flushing = false;

  async function flush() {
    if (flushing || !window.sb || queue.length === 0) return;
    flushing = true;
    const batch = queue.splice(0, queue.length);
    try {
      await window.sb.from("events").insert(batch);
    } catch (e) {
      // Analytics must never break a page.
    }
    flushing = false;
    if (queue.length) flush();
  }

  window.track = function track(name, props = {}) {
    if (typeof name !== "string" || !name) return;
    queue.push({
      name: name.slice(0, 64),
      path: location.pathname.slice(0, 200),
      property_code: typeof props.code === "string" ? props.code.slice(0, 32) : null,
      detail: props.detail ? String(props.detail).slice(0, 200) : null,
    });
    if (typeof window.va === "function") window.va("event", { name });
    setTimeout(flush, 0);
  };

  window.addEventListener("load", () => setTimeout(flush, 1200));
})();
