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

  root.classList.add("nh-motion");

  const isMobile = () => window.matchMedia("(max-width: 720px)").matches;
  const time = (seconds) => (isMobile() ? seconds * 0.8 : seconds);
  const dist = (pixels) => (isMobile() ? pixels * 0.6 : pixels);
  const enter = (el, start = "top 88%") => ({ trigger: el, start, once: true });

  const animating = (el) => el.classList.add("m-anim");
  const settled = (...els) => () => els.forEach((el) => el.classList.remove("m-anim"));

  const splitLines = (el, build) =>
    SplitText.create(el, { type: "lines", mask: "lines", maskClass: "m-mask", autoSplit: true, onSplit: (split) => build(split.lines) });

  const effects = {
    lines(el) {
      splitLines(el, (lines) => gsap.from(lines, {
        yPercent: 110, duration: time(1.1), ease: "power3.out", stagger: 0.1, scrollTrigger: enter(el),
      }));
    },

    up(el) {
      animating(el);
      gsap.from(el, {
        y: dist(el.dataset.mDistance || 40), opacity: 0, duration: time(1), ease: "power3.out", clearProps: "transform,opacity",
        scrollTrigger: enter(el, "top 90%"), onComplete: settled(el),
      });
    },

    stagger(el) {
      const items = [...el.children];
      items.forEach(animating);
      gsap.from(items, {
        y: dist(48), opacity: 0, duration: time(1), ease: "power3.out", stagger: 0.09, clearProps: "transform,opacity",
        scrollTrigger: enter(el, "top 85%"), onComplete: settled(...items),
      });
    },

    progress(el) {
      gsap.to(el, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: true } });
    },

    nav(el) {
      const hero = document.querySelector(".hero");
      const show = () => el.removeAttribute("data-hidden");
      el.addEventListener("focusin", show);
      ScrollTrigger.create({
        start: () => (hero ? hero.offsetHeight : 240) - NAV_OFFSET,
        end: "max",
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (self.direction === 1 && !el.matches(":focus-within")) el.setAttribute("data-hidden", "true");
          else if (self.direction === -1) show();
        },
        onLeaveBack: show,
      });
    },

    hero(el) {
      const h1 = el.querySelector("h1");
      const eyebrow = el.querySelector(".hero-eyebrow");
      const sub = el.querySelector(".hero-sub");
      const search = el.querySelector(".hero-search");
      const slides = el.querySelector(".hero-slides");
      const fade = (target, delay, offset, duration) => {
        animating(target);
        gsap.from(target, { opacity: 0, y: dist(offset), duration: time(duration), delay, ease: "power3.out", clearProps: "transform,opacity", onComplete: settled(target) });
      };
      splitLines(h1, (lines) => gsap.from(lines, { yPercent: 110, duration: time(1.1), ease: "power3.out", stagger: 0.1 }));
      fade(eyebrow, 0.35, 24, 0.9);
      if (sub) fade(sub, 0.45, 24, 0.9);
      fade(search, 0.6, 56, 1.1);

      gsap.fromTo(slides, { scale: 1.1 }, { scale: 1, duration: 1.8, ease: "power2.out" });
      gsap.to(slides, {
        yPercent: isMobile() ? 6 : 12, ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
      });
    },
  };

  const auto = [
    [".sec-head h2", "lines"],
    [".reveal:not([data-m])", "up"],
  ];

  const bind = (el, type) => {
    el.setAttribute("data-m-ok", "");
    effects[type]?.(el);
  };

  let bound = 0;
  const scan = () => {
    const before = bound;
    document.querySelectorAll("[data-m]:not([data-m-ok])").forEach((el) => { bound += 1; bind(el, el.dataset.m); });
    auto.forEach(([selector, type]) => {
      document.querySelectorAll(`${selector}:not([data-m-ok])`).forEach((el) => { bound += 1; bind(el, type); });
    });
    if (bound !== before) {
      clearTimeout(scan.timer);
      scan.timer = setTimeout(() => ScrollTrigger.refresh(), 120);
    }
  };
  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
  scan();

  window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
})();
