/* ======================================================================
   Kavinda Pulathisi — Portfolio interactions (GSAP + ScrollTrigger + Lenis)
   ====================================================================== */
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
     Render projects from projects.js
  ------------------------------------------------------------------ */
  const track = $("#workTrack");
  const pad = (n) => String(n).padStart(2, "0");
  const host = (u) => u.replace(/^https?:\/\//, "").replace(/\/$/, "");

  (window.PROJECTS || []).forEach((p, i) => {
    const hasShots = p.screenshots && p.screenshots.length;
    let screen;
    const embed = p.live && p.embed !== false;
    if (embed) {
      screen = `<div class="browser__loading">Loading live preview…</div><iframe data-src="${p.live}" title="${p.title} live preview" loading="lazy" tabindex="-1"></iframe><div class="browser__shield"></div>`;
    } else if (hasShots) {
      screen = `<img src="${p.screenshots[0]}" alt="${p.title} screenshot" loading="lazy" />`;
    } else {
      screen = `<div class="placeholder"><div><div class="placeholder__icon">▶</div><div class="placeholder__title">${p.short}</div><div class="placeholder__note">Screenshots coming soon</div></div></div>`;
    }
    const el = document.createElement("article");
    el.className = "project";
    el.style.setProperty("--accent", p.accent || "#6b94ff");
    el.innerHTML = `
      <div class="project__media" data-cursor="view" data-label="${p.live ? "LIVE DEMO" : "DEMO"}" ${embed || !p.live ? `data-open="${i}"` : `data-ext="${p.live}"`}>
        <div class="browser">
          <div class="browser__bar"><div class="browser__dots"><i></i><i></i><i></i></div>
            <div class="browser__url">${p.live ? host(p.live) : host(p.repo)}</div>
            ${p.live ? '<span class="browser__live">LIVE</span>' : ""}
          </div>
          <div class="browser__screen">${screen}</div>
        </div>
        <span class="project__float">${embed ? "▶ Click to try it" : p.live ? "↗ Opens live site" : "▶ View demo"}</span>
      </div>
      <div class="project__body">
        <div class="project__meta mono"><span class="project__num">${pad(i + 1)} / ${pad(window.PROJECTS.length)}</span><span>${p.year}</span></div>
        <h3 class="project__title">${p.title}</h3>
        <p class="project__tag">${p.tagline}</p>
        <ul class="project__hl">${p.highlights.map((h) => `<li>${h}</li>`).join("")}</ul>
        <ul class="chips">${p.stack.map((s) => `<li>${s}</li>`).join("")}</ul>
        <div class="project__actions">
          ${embed ? `<button class="pbtn pbtn--main" data-open="${i}" data-cursor="hover">Launch live demo <span>↗</span></button>`
            : p.live ? `<a class="pbtn pbtn--main" href="${p.live}" target="_blank" rel="noopener" data-cursor="hover">Open live site <span>↗</span></a>`
            : `<button class="pbtn pbtn--main" data-open="${i}" data-cursor="hover">View screenshots <span>↗</span></button>`}
          ${p.repo ? `<a class="pbtn" href="${p.repo}" target="_blank" rel="noopener" data-cursor="hover">Source code</a>` : ""}
        </div>
      </div>`;
    track.appendChild(el);
  });
  const end = document.createElement("div");
  end.className = "work__end";
  end.innerHTML = `<div><h3>Want to see<br/>more?</h3><a class="btn btn--ghost magnetic" data-cursor="hover" href="https://github.com/KPulathisi" target="_blank" rel="noopener"><span>All repos on GitHub ↗</span></a></div>`;
  track.appendChild(end);

  $("#moreList").innerHTML = (window.MORE_PROJECTS || [])
    .map((m) => {
      const inner = `<span class="more__name">${m.title}<span class="more__note">${m.note}</span></span><span class="more__stack mono">${m.stack}</span><span class="more__arrow">${m.repo ? "↗" : "·"}</span>`;
      return m.repo
        ? `<li><a href="${m.repo}" target="_blank" rel="noopener" data-cursor="hover">${inner}</a></li>`
        : `<li><a data-cursor="hover">${inner}</a></li>`;
    })
    .join("");

  /* lazy-load live iframes when cards approach the viewport */
  const ioFrames = new IntersectionObserver(
    (entries) =>
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const f = en.target.querySelector("iframe[data-src]");
        if (f) {
          f.src = f.dataset.src;
          f.removeAttribute("data-src");
          f.addEventListener("load", () => f.previousElementSibling && f.previousElementSibling.remove());
        }
        ioFrames.unobserve(en.target);
      }),
    { rootMargin: "300px 600px" }
  );
  $$(".project").forEach((p) => ioFrames.observe(p));
  function fitPreviews() {
    $$(".browser__screen iframe").forEach((f) => {
      const box = f.parentElement;
      const w = box.clientWidth, h = box.clientHeight;
      if (!w) return;
      const virtualW = w < 560 ? 390 : 1280; // render the site at phone width on phones
      const s = w / virtualW;
      f.style.width = virtualW + "px";
      f.style.height = h / s + "px";
      f.style.transform = `scale(${s})`;
    });
  }
  fitPreviews();
  window.addEventListener("resize", fitPreviews);

  /* ------------------------------------------------------------------
     Text splitting helpers
  ------------------------------------------------------------------ */
  $$(".split").forEach((el) => {
    // keep each word together so lines never break mid-word; keep <em> styling
    const html = el.innerHTML;
    const wrapWords = (txt) => txt.split(" ").map((w) => w ? `<span class="word">${[...w].map((c) => `<span class="char">${c}</span>`).join("")}</span>` : "").join(" ");
    el.innerHTML = html.replace(/<em>(.*?)<\/em>|([^<]+)/g, (m, em, txt) => em ? `<em class="em-split">${wrapWords(em)}</em>` : wrapWords(txt));
  });
  $$(".split-lines").forEach((el) => {
    el.innerHTML = el.innerHTML
      .split(/<br\s*\/?>/i)
      .map((l) => `<span class="sl"><span>${l}</span></span>`)
      .join("");
  });
  $$(".reveal-words").forEach((el) => {
    el.innerHTML = el.textContent
      .trim()
      .split(/\s+/)
      .map((w) => `<span class="w">${w}</span>`)
      .join(" ");
  });

  /* ------------------------------------------------------------------
     Smooth scroll (Lenis) wired into ScrollTrigger
  ------------------------------------------------------------------ */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  const scrollTo = (target) => (lenis ? lenis.scrollTo(target, { offset: 0, duration: 1.4 }) : document.querySelector(target)?.scrollIntoView({ behavior: "smooth" }));
  $$('a[href^="#"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      e.preventDefault();
      document.body.classList.remove("menu-open");
      scrollTo(id === "#top" ? 0 : id);
    })
  );

  /* ------------------------------------------------------------------
     Preloader → intro
  ------------------------------------------------------------------ */
  // failsafe: never let the preloader block the page (e.g. if the tab loads in the background)
  setTimeout(() => { const pl = $(".preloader"); if (pl) { pl.remove(); document.body.classList.remove("is-loading"); lenis && lenis.start(); ScrollTrigger.refresh(); } }, 6000);
  const counter = { v: 0 };
  const countEl = $("#loadCount");
  const loadTl = gsap.timeline();
  loadTl
    .to(counter, {
      v: 100,
      duration: reduce ? 0.2 : 1.8,
      ease: "power2.inOut",
      onUpdate: () => (countEl.textContent = Math.round(counter.v))
    })
    .to(".preloader__bar span", { width: "100%", duration: reduce ? 0.2 : 1.8, ease: "power2.inOut" }, 0)
    .to(".preloader > *", { y: -40, opacity: 0, duration: 0.5, stagger: 0.05, ease: "power3.in" })
    .to(".preloader", { clipPath: "inset(0 0 100% 0)", duration: 0.9, ease: "expo.inOut" }, "-=0.15")
    .add(() => {
      document.body.classList.remove("is-loading");
      $(".preloader").remove();
      lenis && lenis.start();
      ScrollTrigger.refresh();
    })
    .add(intro(), "-=0.55");

  function intro() {
    const tl = gsap.timeline();
    tl.from(".hero__title .char", { yPercent: 115, rotate: 8, duration: 1.2, ease: "expo.out", stagger: 0.035 })
      .from("#hero3d", { opacity: 0, scale: 1.12, duration: 2, ease: "expo.out" }, 0)
      .from(".hero__hint", { opacity: 0, y: 12, duration: 0.8, ease: "power3.out" }, 1.1)
      .from(".hero__eyebrow", { y: 20, opacity: 0, duration: 0.8, ease: "power3.out" }, 0.3)
      .from(".hero__role, .hero__actions > *", { y: 30, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.1 }, 0.5)
      .from(".nav > *", { y: -30, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.06 }, 0.4)
      .from(".hero__scroll", { opacity: 0, duration: 1 }, 0.9);
    return tl;
  }

  /* ------------------------------------------------------------------
     Custom cursor + magnetic buttons
  ------------------------------------------------------------------ */
  if (!isTouch) {
    const cursor = $(".cursor");
    const dot = $(".cursor__dot");
    const ring = $(".cursor__ring");
    const label = $(".cursor__label");
    const dx = gsap.quickTo(dot, "x", { duration: 0.08 });
    const dy = gsap.quickTo(dot, "y", { duration: 0.08 });
    const rx = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3" });
    const ry = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3" });
    window.addEventListener("pointermove", (e) => {
      cursor.classList.remove("is-out");
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
    });
    document.addEventListener("pointerleave", () => cursor.classList.add("is-out"));
    window.addEventListener("blur", () => cursor.classList.add("is-out"));
    document.addEventListener("pointerover", (e) => {
      const t = e.target.closest("[data-cursor]");
      cursor.classList.toggle("is-hover", !!t && t.dataset.cursor === "hover");
      cursor.classList.toggle("is-view", !!t && t.dataset.cursor === "view");
      if (t && t.dataset.cursor === "view") label.textContent = t.dataset.label || "VIEW";
    });

    $$(".magnetic").forEach((el) => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.35);
        yTo((e.clientY - r.top - r.height / 2) * 0.35);
      });
      el.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
    });
  }

  /* ------------------------------------------------------------------
     Nav: hide on scroll down, active section, progress bar
  ------------------------------------------------------------------ */
  const nav = $(".nav");
  let lastY = 0;
  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
      const y = self.scroll();
      nav.classList.toggle("is-scrolled", y > 40);
      nav.classList.toggle("is-hidden", y > lastY && y > 300 && !document.body.classList.contains("menu-open"));
      lastY = y;
      gsap.set(".scroll-progress span", { scaleX: self.progress });
    }
  });
  $$("section[id]").forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec,
      start: "top 50%",
      end: "bottom 50%",
      onToggle: ({ isActive }) => {
        if (!isActive) return;
        $$(".nav__links a").forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + sec.id));
      }
    });
  });
  $(".nav__burger").addEventListener("click", () => document.body.classList.toggle("menu-open"));

  /* ------------------------------------------------------------------
     Typed role text
  ------------------------------------------------------------------ */
  const phrases = ["building full-stack web apps", "designing clean databases", "shipping React + TypeScript", "crafting APIs that scale", "turning ideas into products"];
  const typed = $("#typed");
  let pi = 0;
  function cycle() {
    const next = phrases[(pi = (pi + 1) % phrases.length)];
    erase(typed);
    setTimeout(() => type(typed, next), 900);
  }
  function erase(el) {
    const full = el.textContent;
    let n = full.length;
    const id = setInterval(() => { el.textContent = full.slice(0, --n); if (n <= 0) clearInterval(id); }, 22);
  }
  function type(el, txt) {
    let n = 0;
    const id = setInterval(() => { el.textContent = txt.slice(0, ++n); if (n >= txt.length) clearInterval(id); }, 45);
  }
  if (!reduce) setInterval(cycle, 3400);

  /* ------------------------------------------------------------------
     Hero scroll-out + 3D link
  ------------------------------------------------------------------ */
  gsap.timeline({
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true,
      onUpdate: (s) => window.hero3d && (window.hero3d.state.scroll = s.progress) }
  })
    .to(".hero__title .line:first-child", { xPercent: -12, ease: "none" }, 0)
    .to(".hero__title .line--outline", { xPercent: 10, ease: "none" }, 0)
    .to(".hero__inner, .hero__hint", { yPercent: -18, opacity: 0, ease: "none" }, 0);

  /* ------------------------------------------------------------------
     Marquee — infinite, reacts to scroll velocity & direction
  ------------------------------------------------------------------ */
  const mTrack = $(".marquee__track");
  const row = $(".marquee__row");
  mTrack.appendChild(row.cloneNode(true));
  mTrack.appendChild(row.cloneNode(true));
  let mx = 0, dir = 1, boost = 0;
  gsap.ticker.add(() => {
    const w = row.offsetWidth;
    mx -= (0.6 + boost) * dir;
    if (mx <= -w) mx += w;
    if (mx > 0) mx -= w;
    gsap.set(mTrack, { x: mx });
    boost *= 0.92;
  });
  ScrollTrigger.create({
    trigger: ".marquee", start: "top bottom", end: "bottom top",
    onUpdate: (s) => { dir = s.direction; boost = Math.min(Math.abs(s.getVelocity()) / 220, 12); }
  });

  /* ------------------------------------------------------------------
     Generic reveals
  ------------------------------------------------------------------ */
  $$(".split-lines .sl > span").forEach((s) =>
    gsap.from(s, { yPercent: 110, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: s, start: "top 90%" } })
  );
  $$(".reveal-words").forEach((el) =>
    gsap.to(el.querySelectorAll(".w"), {
      opacity: 1, stagger: 0.08, ease: "none",
      scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true }
    })
  );
  $$(".fade-up").forEach((el) =>
    gsap.from(el, { y: 40, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } })
  );
  $$(".section__label").forEach((el) =>
    gsap.from(el, { x: -30, opacity: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" } })
  );

  /* About photo: clip reveal + inner parallax */
  gsap.to(".about__photo", { clipPath: "inset(0% 0 0 0 round 28px)", duration: 1.4, ease: "expo.inOut", scrollTrigger: { trigger: ".about__photo", start: "top 80%" } });
  gsap.fromTo(".about__photo img", { yPercent: -8, scale: 1.25 }, { yPercent: 0, scale: 1.05, ease: "none", scrollTrigger: { trigger: ".about", start: "top bottom", end: "bottom top", scrub: true } });
  gsap.from(".about__badge", { scale: 0, rotate: -180, duration: 1.2, ease: "back.out(1.6)", scrollTrigger: { trigger: ".about__photo", start: "top 60%" } });

  /* Counters */
  $$("[data-count]").forEach((el) => {
    const o = { v: 0 };
    gsap.to(o, {
      v: +el.dataset.count, duration: 2, ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 90%" },
      onUpdate: () => (el.textContent = Math.round(o.v) + (el.dataset.suffix || ""))
    });
  });

  /* Skills cards */
  gsap.from(".skill-card", { y: 80, opacity: 0, rotateX: -15, duration: 1.1, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: ".skills__grid", start: "top 85%" } });

  /* Glow follow + 3D tilt */
  $$(".glow-card, .about__photo").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      card.style.setProperty("--mx", x + "px");
      card.style.setProperty("--my", y + "px");
      if (isTouch) return;
      gsap.to(card, { rotateY: (x / r.width - 0.5) * 10, rotateX: -(y / r.height - 0.5) * 10, transformPerspective: 900, duration: 0.5, ease: "power2.out" });
    });
    card.addEventListener("pointerleave", () => gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.8, ease: "elastic.out(1, 0.5)" }));
  });

  /* ------------------------------------------------------------------
     Work — pinned horizontal scroll on desktop
  ------------------------------------------------------------------ */
  const mm = gsap.matchMedia();
  mm.add("(min-width: 901px)", () => {
    const getDist = () => track.scrollWidth - window.innerWidth;
    const tween = gsap.to(track, {
      x: () => -getDist(),
      ease: "none",
      scrollTrigger: {
        trigger: ".work__pin",
        start: "top top",
        end: () => "+=" + getDist(),
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        anticipatePin: 1
      }
    });
    $$(".project").forEach((card) => {
      gsap.from(card.querySelector(".browser"), {
        rotateY: -18, transformPerspective: 1200, scale: 0.9, ease: "none",
        scrollTrigger: { trigger: card, containerAnimation: tween, start: "left right", end: "left 35%", scrub: true }
      });
      gsap.from(card.querySelectorAll(".project__body > *"), {
        x: 60, opacity: 0, stagger: 0.05, ease: "none",
        scrollTrigger: { trigger: card, containerAnimation: tween, start: "left 90%", end: "left 40%", scrub: true }
      });
    });
    return () => tween.kill();
  });
  mm.add("(max-width: 900px)", () => {
    $$(".project").forEach((card) =>
      gsap.from(card, { y: 80, opacity: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: card, start: "top 88%" } })
    );
  });

  gsap.from(".more__list li", { y: 40, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.08, scrollTrigger: { trigger: ".more__list", start: "top 85%" } });

  /* ------------------------------------------------------------------
     Timeline — line draws as you scroll
  ------------------------------------------------------------------ */
  gsap.fromTo(".timeline__line line", { attr: { y2: 0 } }, {
    attr: { y2: 100 }, ease: "none",
    scrollTrigger: { trigger: ".timeline", start: "top 70%", end: "bottom 60%", scrub: true }
  });
  $$(".tl-group").forEach((g) => gsap.from(g, { scale: 0.6, opacity: 0, duration: 0.8, ease: "back.out(2)", scrollTrigger: { trigger: g, start: "top 85%" } }));
  $$(".tl-item").forEach((it) => {
    ScrollTrigger.create({ trigger: it, start: "top 65%", onEnter: () => it.classList.add("is-active"), onLeaveBack: () => it.classList.remove("is-active") });
    const left = window.innerWidth > 900 && !it.classList.contains("tl-item--r");
    const wide = window.innerWidth > 900;
    gsap.from(it.querySelector(".tl-card"), { x: wide ? (left ? -60 : 60) : 0, y: wide ? 0 : 40, rotateY: wide ? (left ? 12 : -12) : 0, transformPerspective: 1000, opacity: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: it, start: "top 85%" } });
    if (it.querySelector(".grades")) gsap.from(it.querySelectorAll(".grades li"), { scale: 0.6, opacity: 0, duration: 0.5, stagger: 0.04, ease: "back.out(2)", scrollTrigger: { trigger: it, start: "top 75%" } });
  });

  /* ------------------------------------------------------------------
     Beyond — parallax cards
  ------------------------------------------------------------------ */
  gsap.fromTo(".beyond__card--a", { y: 80 }, { y: -40, ease: "none", scrollTrigger: { trigger: ".beyond", start: "top bottom", end: "bottom top", scrub: true } });
  gsap.fromTo(".beyond__card--b", { y: -20 }, { y: -140, ease: "none", scrollTrigger: { trigger: ".beyond", start: "top bottom", end: "bottom top", scrub: true } });
  gsap.from(".beyond__card", { clipPath: "inset(30% 30% 30% 30% round 24px)", duration: 1.4, ease: "expo.out", stagger: 0.15, scrollTrigger: { trigger: ".beyond__grid", start: "top 80%" } });

  /* ------------------------------------------------------------------
     Contact
  ------------------------------------------------------------------ */
  gsap.from(".contact__title .char", { yPercent: 115, duration: 1.1, ease: "expo.out", stagger: 0.025, scrollTrigger: { trigger: ".contact__title", start: "top 85%" } });
  gsap.from(".contact__row, .social", { y: 40, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.07, scrollTrigger: { trigger: ".contact__row", start: "top 92%" } });
  const emailBtn = $(".contact__email");
  emailBtn.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(emailBtn.dataset.email); } catch (_) { window.location.href = "mailto:" + emailBtn.dataset.email; return; }
    emailBtn.classList.add("copied");
    setTimeout(() => emailBtn.classList.remove("copied"), 1800);
  });

  $("#year").textContent = new Date().getFullYear();
  const t = $("#localTime");
  const tick = () => (t.textContent = new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Colombo", hour: "2-digit", minute: "2-digit" }) + " SLST");
  tick(); setInterval(tick, 30000);

  /* ------------------------------------------------------------------
     Demo modal
  ------------------------------------------------------------------ */
  const modal = $("#demoModal");
  const body = $("#modalBody");
  let galleryTimer = null;

  function openDemo(i) {
    const p = window.PROJECTS[i];
    const embed = p.live && p.embed !== false;
    body.className = "modal__body";
    $("#modalUrl").textContent = p.live || p.repo || p.title;
    $("#modalTitle").textContent = p.short || p.title;
    const openBtn = $("#modalOpen");
    openBtn.href = p.live || p.repo || "#";
    $$(".modal__btn[data-view]").forEach((b) => (b.style.display = embed ? "" : "none"));
    $('.modal__btn[data-view="desktop"]').classList.add("is-on");
    $('.modal__btn[data-view="mobile"]').classList.remove("is-on");

    if (embed) {
      body.innerHTML = `<div class="modal__loading mono">Loading live demo…</div><iframe src="${p.live}" title="${p.title} live demo" allow="clipboard-write; fullscreen" allowfullscreen></iframe>`;
    } else {
      const slides = [];
      (p.screenshots || []).forEach((s) => slides.push(`<img src="${s}" alt="${p.title} screenshot" />`));
      if (!slides.length) {
        slides.push(`<div class="placeholder" style="--accent:${p.accent}"><div><div class="placeholder__icon">▣</div><div class="placeholder__title">Screenshots coming soon</div><div class="placeholder__note">assets/projects/${p.id}/</div></div></div>`);
      }
      body.innerHTML = `<div class="gallery">${slides.map((s, k) => `<div class="gallery__slide${k ? "" : " is-active"}">${s}</div>`).join("")}
        ${slides.length > 1 ? `<button class="gallery__arrow gallery__arrow--prev" data-cursor="hover">←</button><button class="gallery__arrow gallery__arrow--next" data-cursor="hover">→</button><div class="gallery__nav">${slides.map((_, k) => `<button data-go="${k}" class="${k ? "" : "is-active"}"></button>`).join("")}</div>` : ""}</div>`;
      setupGallery(slides.length);
    }
    $("#modalInfo").innerHTML = `<div><strong>${p.title}</strong> — ${p.description}</div>${p.repo ? `<a class="pbtn" href="${p.repo}" target="_blank" rel="noopener" data-cursor="hover">Source ↗</a>` : ""}`;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    if (!(history.state && history.state.demo !== undefined)) history.pushState({ demo: i }, "", "#demo-" + p.id);
    lenis && lenis.stop();
    document.body.style.overflow = "hidden";
    document.documentElement.classList.add("modal-open");
    gsap.timeline()
      .to(".modal__backdrop", { opacity: 1, duration: 0.4 })
      .fromTo(".modal__panel", { y: 60, scale: 0.92, opacity: 0, clipPath: "inset(10% 10% 10% 10% round 18px)" }, { y: 0, scale: 1, opacity: 1, clipPath: "inset(0% 0% 0% 0% round 18px)", duration: 0.8, ease: "expo.out" }, 0.05);
  }

  function setupGallery(n) {
    if (n < 2) return;
    let cur = 0;
    const go = (k) => {
      cur = (k + n) % n;
      $$(".gallery__slide", body).forEach((s, i) => s.classList.toggle("is-active", i === cur));
      $$(".gallery__nav button", body).forEach((b, i) => b.classList.toggle("is-active", i === cur));
    };
    body.querySelector(".gallery__arrow--prev").onclick = () => go(cur - 1);
    body.querySelector(".gallery__arrow--next").onclick = () => go(cur + 1);
    $$(".gallery__nav button", body).forEach((b) => (b.onclick = () => go(+b.dataset.go)));
    clearInterval(galleryTimer);
    galleryTimer = setInterval(() => go(cur + 1), 4500);
  }

  function closeDemo() {
    clearInterval(galleryTimer);
    gsap.timeline({
      onComplete: () => {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        body.innerHTML = "";
        document.body.style.overflow = "";
        document.documentElement.classList.remove("modal-open");
        lenis && lenis.start();
      }
    })
      .to(".modal__panel", { y: 40, scale: 0.95, opacity: 0, duration: 0.35, ease: "power3.in" })
      .to(".modal__backdrop", { opacity: 0, duration: 0.3 }, "-=0.15");
  }

  document.addEventListener("click", (e) => {
    const x = e.target.closest("[data-ext]");
    if (x) { window.open(x.dataset.ext, "_blank", "noopener"); return; }
    const o = e.target.closest("[data-open]");
    if (o) { e.preventDefault(); openDemo(+o.dataset.open); return; }
    if (e.target.closest("[data-close]")) requestClose();
    const v = e.target.closest(".modal__btn[data-view]");
    if (v) {
      body.classList.toggle("is-mobile", v.dataset.view === "mobile");
      $$(".modal__btn[data-view]").forEach((b) => b.classList.toggle("is-on", b === v));
    }
  });
  function requestClose() {
    if (history.state && history.state.demo !== undefined) history.back(); // popstate → closeDemo
    else closeDemo();
  }
  window.addEventListener("popstate", () => { if (modal.classList.contains("is-open")) closeDemo(); });
  document.addEventListener("keydown", (e) => e.key === "Escape" && modal.classList.contains("is-open") && requestClose());

  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
