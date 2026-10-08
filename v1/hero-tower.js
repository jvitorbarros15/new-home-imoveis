// New Home Imóveis — hero tower: lazy WebGL scene driven by the motion layer

(function () {
  const root = document.documentElement;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const smooth = (value, min, max) => {
    const t = clamp((value - min) / (max - min), 0, 1);
    return t * t * (3 - 2 * t);
  };
  const isMobile = () => window.matchMedia("(max-width: 720px)").matches;
  const finePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const DUSK = { "--sky-top": "#0b0f22", "--sky-bottom": "#1b1526", "--sky-glow": "rgba(110, 126, 214, 0.34)" };

  const supported = () =>
    !!window.NHMotion?.enabled &&
    root.dataset.motion !== "off" &&
    !!window.WebGLRenderingContext &&
    !navigator.connection?.saveData &&
    !(isMobile() && navigator.hardwareConcurrency <= 4) &&
    location.hash.length <= 1 &&
    window.scrollY < 50;

  const afterLoad = (callback) => {
    const run = () => (window.requestIdleCallback ? window.requestIdleCallback(callback, { timeout: 2500 }) : window.setTimeout(callback, 600));
    if (document.readyState === "complete") run();
    else window.addEventListener("load", run, { once: true });
  };

  const loadThree = () => new Promise((resolve, reject) => {
    if (window.NHTower) { resolve(); return; }
    const source = document.querySelector('script[type="nh/lazy"][data-name="three"]');
    if (!source) { reject(new Error("vendor-three missing")); return; }
    const script = document.createElement("script");
    script.src = source.src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  function mount(hero) {
    if (!supported()) return () => {};
    const canvas = hero.querySelector(".tower-stage canvas");
    const stage = hero.querySelector(".tower-stage");
    const labels = [...hero.querySelectorAll(".tower-label")];
    const headline = hero.querySelector(".hero-headline");
    const search = hero.querySelector(".hero-search");
    const motion = window.NHMotion;
    motion.pending = (motion.pending || 0) + 1;

    let tower = null;
    let sequence = null;
    let dead = false;
    let visible = true;
    let released = false;
    const teardown = [];

    const release = () => {
      if (released) return;
      released = true;
      motion.pending -= 1;
    };

    const degrade = () => {
      if (dead) return;
      dead = true;
      teardown.splice(0).reverse().forEach((fn) => fn());
      sequence?.scrollTrigger?.kill(true);
      sequence?.kill();
      sequence = null;
      gsap.set([headline, search], { clearProps: "opacity,visibility,transform" });
      hero.dataset.tower = "static";
      tower?.dispose();
      tower = null;
      release();
      ScrollTrigger.refresh();
    };

    const fail = () => { degrade(); };

    const start = async () => {
      if (dead) return;
      try {
        await loadThree();
        if (dead) return;
        const lite = isMobile();
        const pixelRatio = Math.min(window.devicePixelRatio || 1, lite ? 1.25 : 1.5);
        tower = window.NHTower.createTower(canvas, { lite, pixelRatio });
        tower.state.shift = lite ? 0 : 0.2;
        const size = () => {
          const box = stage.getBoundingClientRect();
          if (box.width > 0 && box.height > 0) tower.resize(box.width, box.height, pixelRatio);
        };
        size();
        const resizer = new ResizeObserver(size);
        resizer.observe(stage);
        teardown.push(() => resizer.disconnect());
        canvas.addEventListener("webglcontextlost", fail, { once: true });

        const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) tower?.invalidate(); });
        io.observe(hero);
        teardown.push(() => io.disconnect());

        const deltas = [];
        let last = performance.now();
        let sampled = false;
        const labelState = new Map();
        const place = () => {
          const explode = tower.state.explode;
          const alpha = isMobile() ? 0 : smooth(explode, 0.6, 0.95);
          labels.forEach((label) => {
            const name = label.dataset.name;
            const wasOn = labelState.get(name) ?? 0;
            if (alpha === 0 && wasOn === 0) return;
            labelState.set(name, alpha);
            const point = tower.project(name);
            const left = label.dataset.side === "left";
            label.style.opacity = alpha.toFixed(3);
            label.style.transform = `translate3d(${point.x.toFixed(1)}px, ${point.y.toFixed(1)}px, 0) translate(${left ? "-100%" : "0"}, -50%)`;
          });
        };
        const tick = () => {
          const now = performance.now();
          const dt = Math.min(0.1, (now - last) / 1000);
          last = now;
          if (!visible || document.hidden || !tower) return;
          const drew = tower.render(dt);
          if (drew) place();
          if (!sampled) {
            deltas.push(dt);
            if (deltas.length === 48) {
              sampled = true;
              const sorted = deltas.slice(8).sort((a, b) => a - b);
              const median = sorted[sorted.length >> 1];
              if (median > 1 / 30) fail();
              else buildSequence();
            }
          }
        };
        gsap.ticker.add(tick);
        teardown.push(() => gsap.ticker.remove(tick));

        const onVisibility = () => { if (!document.hidden) { last = performance.now(); tower?.invalidate(); } };
        document.addEventListener("visibilitychange", onVisibility);
        teardown.push(() => document.removeEventListener("visibilitychange", onVisibility));

        tower.render(0);
        requestAnimationFrame(() => { if (!dead) hero.dataset.tower = "live"; });
        gsap.to(tower.state, { assemble: 1, duration: 1.6, delay: 0.15, ease: "none" });

        if (finePointer() && !isMobile()) wirePointer();
      } catch {
        fail();
      }
    };

    const wirePointer = () => {
      const interactive = "a, button, input, select, label, form, .hero-headline, .hero-search";
      let dragging = false;
      const move = (event) => {
        const box = hero.getBoundingClientRect();
        tower.setPointer(((event.clientX - box.left) / box.width) * 2 - 1, ((event.clientY - box.top) / box.height) * 2 - 1);
        if (dragging) tower.drag(event.movementX / box.width * 3, event.movementY / box.height * 2);
      };
      const down = (event) => {
        if (event.button !== 0 || event.target.closest(interactive)) return;
        dragging = true;
        hero.classList.add("is-dragging");
        hero.setPointerCapture?.(event.pointerId);
      };
      const up = () => {
        if (!dragging) return;
        dragging = false;
        hero.classList.remove("is-dragging");
        tower?.release();
      };
      const leave = () => tower?.setPointer(0, 0);
      hero.addEventListener("pointermove", move);
      hero.addEventListener("pointerdown", down);
      hero.addEventListener("pointerup", up);
      hero.addEventListener("pointercancel", up);
      hero.addEventListener("pointerleave", leave);
      teardown.push(() => ["pointermove", "pointerdown", "pointerup", "pointercancel", "pointerleave"].forEach((name, index) =>
        hero.removeEventListener(name, [move, down, up, up, leave][index])));
    };

    const buildSequence = () => {
      if (dead) return;
      if (isMobile() || window.scrollY >= 50) {
        tower.state.orbit = 0;
        tower.state.light = 0;
        sequence = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.4 },
        });
        sequence.to(tower.state, { orbit: 0.85, light: 0.8, duration: 1 }, 0);
        sequence.to(hero, { ...DUSK, duration: 1 }, 0);
        release();
        return;
      }
      const hold = { immediateRender: false };
      sequence = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          id: "hero-pin",
          refreshPriority: 10,
          trigger: hero,
          start: "top top",
          end: () => `+=${motion.heroPin()}`,
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      sequence.to(tower.state, { p: 1, duration: 1 }, 0);
      sequence.to(hero, { ...DUSK, duration: 0.9 }, 0.1);
      sequence.fromTo(headline, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -48, duration: 0.14, ...hold }, 0.06);
      sequence.fromTo(search, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: 72, duration: 0.12, ...hold }, 0.04);
      sequence.fromTo(headline, { autoAlpha: 0, y: 48 }, { autoAlpha: 1, y: 0, duration: 0.12, ...hold }, 0.88);
      sequence.fromTo(search, { autoAlpha: 0, y: 72 }, { autoAlpha: 1, y: 0, duration: 0.12, ...hold }, 0.9);
      motion.heroPinActive = true;
      ScrollTrigger.refresh();
      release();
    };

    afterLoad(start);

    return () => {
      motion.heroPinActive = false;
      degrade();
      hero.dataset.tower = "static";
    };
  }

  window.NHHeroTower = { mount };
})();
