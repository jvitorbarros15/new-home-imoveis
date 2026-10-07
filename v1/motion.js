// New Home Imóveis — smooth scroll and motion engine (GSAP + Lenis)

(function () {
  const root = document.documentElement;
  const NAV_OFFSET = 72;

  const nativeScrollTo = (target) => {
    if (typeof target === "number") window.scrollTo({ top: target });
    else (typeof target === "string" ? document.querySelector(target) : target)?.scrollIntoView();
  };

  const disabled =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    root.dataset.motion === "off" ||
    !window.gsap ||
    !window.Lenis;

  if (disabled) {
    window.NHMotion = { enabled: false, stop() {}, start() {}, refresh() {}, scrollTo: nativeScrollTo, idle: () => true };
    return;
  }

  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    syncTouch: false,
    allowNestedScroll: true,
  });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  const scrollTo = (target, options) => {
    lenis.scrollTo(target, { offset: -NAV_OFFSET, duration: 1.4, force: true, ...options });
  };

  const NHMotion = {
    enabled: true,
    lenis,
    stop: () => lenis.stop(),
    start: () => lenis.start(),
    refresh: () => ScrollTrigger.refresh(),
    scrollTo,
    idle: () => !gsap.globalTimeline.getChildren(false, true, false)
      .some((anim) => !anim.paused() && anim.progress() < 1 && !anim.scrollTrigger?.vars.scrub),
  };
  window.NHMotion = NHMotion;

  const hashTarget = (hash) => {
    try { return hash.length > 1 ? document.getElementById(decodeURIComponent(hash.slice(1))) : null; } catch { return null; }
  };

  const focusTarget = (el) => {
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  };

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest?.("a[href]");
    if (!link || link.target === "_blank" || link.origin !== location.origin || link.pathname !== location.pathname || link.search !== location.search) return;
    const target = hashTarget(link.hash);
    if (!target) return;
    event.preventDefault();
    history.pushState(null, "", link.hash);
    scrollTo(target, { onComplete: () => focusTarget(target) });
    if (link.classList.contains("skip-link")) focusTarget(target);
  });

  // Layout above the target keeps changing while content and pins mount, so the
  // browser's own jump to a hash lands short; re-apply it until the user takes over.
  if (location.hash.length > 1) {
    let until = Date.now() + 3500;
    const stopFollowing = () => { until = 0; };
    ["wheel", "touchstart", "keydown", "pointerdown"].forEach((name) => window.addEventListener(name, stopFollowing, { once: true, passive: true }));
    const follow = () => {
      const target = hashTarget(location.hash);
      if (target) lenis.scrollTo(target, { offset: -NAV_OFFSET, immediate: true, force: true });
      if (Date.now() < until) setTimeout(follow, 400);
    };
    window.addEventListener("load", follow, { once: true });
  }

  window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
})();
