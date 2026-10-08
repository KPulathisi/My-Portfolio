/* ======================================================================
   Kavinda Pulathisi — Portfolio interactions (GSAP + ScrollTrigger + Lenis)
   ====================================================================== */
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
     Render projects from projects.js
  ------------------------------------------------------------------ */
  const track = $("#workTrack");
  const host = (u) => u.replace(/^https?:\/\//, "").replace(/\/$/, "");

  (window.PROJECTS || []).forEach((p, i) => {
    const hasShots = p.screenshots && p.screenshots.length;
    const embed = p.live && p.embed !== false;
    let screen;
    if (embed) {
      screen = `<div class="browser__loading">Loading live preview…</div><iframe data-src="${p.live}" title="${p.title} live preview" loading="lazy" tabindex="-1"></iframe><div class="browser__shield"></div>`;
    } else if (hasShots) {
      screen = `<img src="${p.screenshots[0]}" alt="${p.title} screenshot" loading="lazy" />`;
    } else {
      screen = `<div class="placeholder"><div><div class="placeholder__title">${p.short}</div><div class="placeholder__note">Screenshots coming soon</div></div></div>`;
    }
    const el = document.createElement("article");
    el.className = "project reveal";
    el.style.setProperty("--accent", p.accent || "#6b94ff");
    el.innerHTML = `
      <div class="project__media" ${embed || !p.live ? `data-open="${i}"` : `data-ext="${p.live}"`}>
        <div class="browser">
          <div class="browser__bar"><div class="browser__dots"><i></i><i></i><i></i></div>
            <div class="browser__url">${p.live ? host(p.live) : host(p.repo)}</div>
          </div>
          <div class="browser__screen">${screen}</div>
        </div>
        <span class="browser__cta">${embed ? "▶ Try it here" : p.live ? "↗ Opens live site" : "▶ View screenshots"}</span>
      </div>
      <div class="project__body">
        <p class="project__meta mono"><span>${p.year}</span>${p.live ? '<span class="project__live">Live</span>' : ""}</p>
        <h3 class="project__title">${p.title}</h3>
        <p class="project__tag">${p.tagline}</p>
        <ul class="project__hl">${p.highlights.map((h) => `<li>${h}</li>`).join("")}</ul>
        <ul class="chips">${p.stack.map((s) => `<li>${s}</li>`).join("")}</ul>
        <div class="project__actions">
          ${embed ? `<button class="pbtn pbtn--main" data-open="${i}">Launch live demo <span aria-hidden="true">↗</span></button>`
            : p.live ? `<a class="pbtn pbtn--main" href="${p.live}" target="_blank" rel="noopener">Open live site <span aria-hidden="true">↗</span></a>`
            : `<button class="pbtn pbtn--main" data-open="${i}">View screenshots</button>`}
          ${p.repo ? `<a class="pbtn" href="${p.repo}" target="_blank" rel="noopener">Source code</a>` : ""}
        </div>
      </div>`;
    track.appendChild(el);
  });

  $("#moreList").innerHTML = (window.MORE_PROJECTS || [])
    .map((m) => {
      const inner = `<span class="more__name">${m.title}<span class="more__note">${m.note}</span></span><span class="more__stack mono">${m.stack}</span><span class="more__arrow" aria-hidden="true">${m.repo ? "↗" : ""}</span>`;
      return m.repo
        ? `<li class="reveal"><a href="${m.repo}" target="_blank" rel="noopener">${inner}</a></li>`
        : `<li class="reveal"><a>${inner}</a></li>`;
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
    { rootMargin: "400px 0px" }
  );
  $$(".project").forEach((p) => ioFrames.observe(p));

  /* scale each preview so the site renders at a real viewport width */
  function fitPreviews() {
    $$(".browser__screen iframe").forEach((f) => {
      const box = f.parentElement;
      const w = box.clientWidth, h = box.clientHeight;
      if (!w) return;
      const virtualW = w < 560 ? 1024 : 1280;
      const s = w / virtualW;
      f.style.width = virtualW + "px";
      f.style.height = h / s + "px";
      f.style.transform = `scale(${s})`;
    });
  }
  fitPreviews();
  window.addEventListener("resize", fitPreviews);

  /* ------------------------------------------------------------------
     Split the hero name into characters for the intro
  ------------------------------------------------------------------ */
  $$(".split").forEach((el) => {
    const wrapWords = (txt) => txt.split(" ").map((w) => (w ? `<span class="word">${[...w].map((c) => `<span class="char">${c}</span>`).join("")}</span>` : "")).join(" ");
    el.setAttribute("aria-label", el.textContent);
    el.innerHTML = wrapWords(el.textContent);
  });

  /* ------------------------------------------------------------------
     Smooth scroll (Lenis) wired into ScrollTrigger
  ------------------------------------------------------------------ */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  // the fixed-nav offset comes from scroll-padding-top in style.css (Lenis honours it too)
  const scrollTo = (target) => {
    if (lenis) return lenis.scrollTo(target, { duration: 1.2 });
    target === 0 ? window.scrollTo({ top: 0, behavior: "smooth" }) : document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
  };

  /* ------------------------------------------------------------------
     Mobile menu
  ------------------------------------------------------------------ */
  const burger = $(".nav__burger");
  const setMenu = (open) => {
    document.body.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  burger.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));
  document.addEventListener("keydown", (e) => e.key === "Escape" && document.body.classList.contains("menu-open") && setMenu(false));

  $$('a[href^="#"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      e.preventDefault();
      if (document.body.classList.contains("menu-open")) setMenu(false);
      scrollTo(id === "#top" ? 0 : id);
    })
  );

  /* ------------------------------------------------------------------
     Intro
  ------------------------------------------------------------------ */
  if (!reduce) {
    gsap.timeline({ defaults: { ease: "expo.out" } })
      .from(".hero__title .char", { yPercent: 110, duration: 1.1, stagger: 0.03 }, 0.1)
      .from("#hero3d", { opacity: 0, duration: 1.6 }, 0)
      .from(".hero__eyebrow, .hero__role, .hero__actions > *, .hero__hint", { y: 20, opacity: 0, duration: 0.9, stagger: 0.08 }, 0.35)
      .from(".nav__inner > *", { y: -16, opacity: 0, duration: 0.8, stagger: 0.05 }, 0.3);
  }

  /* ------------------------------------------------------------------
     Nav: hide on scroll down, active section
  ------------------------------------------------------------------ */
  const nav = $(".nav");
  let lastY = 0;
  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
      const y = self.scroll();
      nav.classList.toggle("is-scrolled", y > 40);
      nav.classList.toggle("is-hidden", y > lastY && y > 400 && !document.body.classList.contains("menu-open"));
      lastY = y;
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

  /* hero fades out as you scroll away; the shader reads the progress */
  gsap.timeline({
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true,
      onUpdate: (s) => window.hero3d && (window.hero3d.state.scroll = s.progress) }
  }).to(".hero__inner, .hero__hint", { yPercent: -12, opacity: 0, ease: "none" }, 0);

  /* ------------------------------------------------------------------
     Gentle reveal on scroll
  ------------------------------------------------------------------ */
  if (!reduce) {
    gsap.set(".reveal", { y: 24, opacity: 0 });
    ScrollTrigger.batch(".reveal", {
      start: "top 92%",
      once: true,
      onEnter: (els) => gsap.to(els, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.06, overwrite: true })
    });
  }

  /* ------------------------------------------------------------------
     Contact: copy email
  ------------------------------------------------------------------ */
  const toast = $("#toast");
  let toastTimer;
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-on"), 1800);
  };
  const emailBtn = $(".contact__email");
  emailBtn.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(emailBtn.dataset.email); } catch (_) { window.location.href = "mailto:" + emailBtn.dataset.email; return; }
    showToast("Email copied ✓");
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
    $("#modalOpen").href = p.live || p.repo || "#";
    $$(".modal__btn[data-view]").forEach((b) => (b.style.display = embed ? "" : "none"));
    $('.modal__btn[data-view="desktop"]').classList.add("is-on");
    $('.modal__btn[data-view="mobile"]').classList.remove("is-on");

    if (embed) {
      body.innerHTML = `<div class="modal__loading mono">Loading live demo…</div><iframe src="${p.live}" title="${p.title} live demo" allow="clipboard-write; fullscreen"></iframe>`;
    } else {
      const slides = [];
      (p.screenshots || []).forEach((s) => slides.push(`<img src="${s}" alt="${p.title} screenshot" />`));
      if (!slides.length) {
        slides.push(`<div class="placeholder" style="--accent:${p.accent}"><div><div class="placeholder__title">Screenshots coming soon</div><div class="placeholder__note">assets/projects/${p.id}/</div></div></div>`);
      }
      body.innerHTML = `<div class="gallery">${slides.map((s, k) => `<div class="gallery__slide${k ? "" : " is-active"}">${s}</div>`).join("")}
        ${slides.length > 1 ? `<button class="gallery__arrow gallery__arrow--prev" aria-label="Previous">←</button><button class="gallery__arrow gallery__arrow--next" aria-label="Next">→</button><div class="gallery__nav">${slides.map((_, k) => `<button data-go="${k}" class="${k ? "" : "is-active"}" aria-label="Slide ${k + 1}"></button>`).join("")}</div>` : ""}</div>`;
      setupGallery(slides.length);
    }
    $("#modalInfo").innerHTML = `<div><strong>${p.title}</strong> — ${p.description}</div>${p.repo ? `<a class="pbtn" href="${p.repo}" target="_blank" rel="noopener">Source ↗</a>` : ""}`;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    if (!(history.state && history.state.demo !== undefined)) history.pushState({ demo: i }, "", "#demo-" + p.id);
    lenis && lenis.stop();
    document.body.style.overflow = "hidden";
    gsap.timeline()
      .to(".modal__backdrop", { opacity: 1, duration: 0.3 })
      .fromTo(".modal__panel", { y: 40, scale: 0.97, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.6, ease: "expo.out" }, 0.05);
    $(".modal__back").focus({ preventScroll: true });
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
        lenis && lenis.start();
      }
    })
      .to(".modal__panel", { y: 30, opacity: 0, duration: 0.3, ease: "power3.in" })
      .to(".modal__backdrop", { opacity: 0, duration: 0.25 }, "-=0.1");
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

  window.addEventListener("load", () => { fitPreviews(); ScrollTrigger.refresh(); });
})();
