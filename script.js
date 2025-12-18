/* ============================================================
   SMOOTH SCROLL — LENIS (respecte le prefers-reduced-motion)
============================================================ */
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let lenis = null;

function startLenis() {
  if (lenis) return;

  lenis = new Lenis({
    duration: 1.2,
    smooth: true,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });

  function raf(time) {
    lenis?.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);
}

function stopLenis() {
  if (!lenis) return;
  lenis.stop();
  lenis = null;
}


/* ============================================================
   HEADER DYNAMIQUE — MODE COMPACT AU SCROLL
============================================================ */
const header = document.getElementById("header");
let lastScroll = 0;

const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");

function handleHeaderScroll() {
  const current = window.scrollY;

  if (current > 80 && current > lastScroll) {
    header.classList.add("compact");
  } else if (current < 40) {
    header.classList.remove("compact");
  }

  lastScroll = current;
}

window.addEventListener("scroll", handleHeaderScroll);

function setMenuState(open) {
  if (!menuToggle || !mobileMenu) return;

  menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
  mobileMenu.setAttribute("aria-hidden", open ? "false" : "true");
  mobileMenu.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
}

menuToggle?.addEventListener("click", () => {
  const isOpen = mobileMenu?.classList.contains("is-open");
  setMenuState(!isOpen);
});

mobileMenu?.querySelectorAll("a")?.forEach(link => {
  link.addEventListener("click", () => setMenuState(false));
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 700) setMenuState(false);
});


/* ============================================================
   THEME SWITCH (DARK / LIGHT)
============================================================ */
const themeToggle = document.getElementById("theme-toggle");
const root = document.documentElement;

function applyTheme(theme) {
  const isLight = theme === "light";
  root.classList.toggle("light", isLight);
  themeToggle?.setAttribute("aria-pressed", isLight ? "true" : "false");
}

function toggleTheme() {
  const current = root.classList.contains("light") ? "light" : "dark";
  const next = current === "light" ? "dark" : "light";
  applyTheme(next);
  localStorage.setItem("theme", next);
}

themeToggle?.addEventListener("click", toggleTheme);

// Charger thème sauvegardé ou préférences système
const savedTheme = localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
applyTheme(savedTheme);


/* ============================================================
   HERO — ANIMATION TYPOGRAPHIQUE PREMIUM
============================================================ */

// Fonction SplitText "maison"
function splitLines(selector) {
  const elements = document.querySelectorAll(selector);

  elements.forEach(el => {
    if (el.dataset.splitApplied === "true") return;

    const words = el.textContent.trim().split(" ");
    el.textContent = "";

    words.forEach(word => {
      const span = document.createElement("span");
      span.classList.add("split");
      span.textContent = word + " ";
      el.appendChild(span);
    });

    el.dataset.splitApplied = "true";
  });
}

function animateSplits() {
  // GSAP — Animation des mots
  gsap.fromTo(
    ".split",
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      ease: "power3.out",
      duration: 1.2,
      stagger: 0.12,
      delay: 0.3,
    }
  );
}


/* ============================================================
   SECTIONS — REVEAL ANIMATIONS
============================================================ */

function animateReveals() {
  gsap.utils.toArray(".reveal").forEach(el => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 75%",
        }
      }
    );
  });

  gsap.utils.toArray(".reveal-up").forEach(el => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
        }
      }
    );
  });
}


/* ============================================================
   SLIDERS — SERVICES & OFFRES
============================================================ */
function initSliders() {
  const sliders = document.querySelectorAll("[data-slider]");
  if (!sliders.length) return;

  sliders.forEach((slider) => {
    const track = slider.querySelector("[data-slider-track]");
    const viewport = slider.querySelector("[data-slider-window]");
    const slides = Array.from(track?.children || []);
    const prevBtn = slider.querySelector("[data-slider-prev]");
    const nextBtn = slider.querySelector("[data-slider-next]");
    const dotsWrapper = slider.querySelector("[data-slider-dots]");
    const currentEl = slider.querySelector("[data-slider-current]");
    const totalEl = slider.querySelector("[data-slider-total]");

    if (!track || !viewport || !slides.length) return;

    let gap = 0;
    let slideWidth = 0;
    let visibleCount = 1;
    let maxIndex = slides.length - 1;
    let pageCount = slides.length;
    let index = 0;

    const getGap = () => {
      const styles = window.getComputedStyle(track);
      const spacing = styles.getPropertyValue("column-gap") || styles.getPropertyValue("gap") || "0";
      return parseFloat(spacing) || 0;
    };

    const getColumns = () => {
      const styles = window.getComputedStyle(slider);
      const value = parseFloat(styles.getPropertyValue("--slider-columns"));
      return Number.isFinite(value) && value > 0 ? value : 1;
    };

    const renderDots = () => {
      if (!dotsWrapper) return;
      dotsWrapper.innerHTML = "";
      const pages = Math.max(1, pageCount);
      for (let idx = 0; idx < pages; idx++) {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "slider-dot";
        dot.setAttribute("aria-label", `Aller à la diapositive ${idx + 1}`);
        dot.addEventListener("click", () => goTo(idx));
        dotsWrapper.appendChild(dot);
      }
    };

    const measure = () => {
      gap = getGap();
      const columns = getColumns();
      slideWidth = (viewport.clientWidth - gap * (columns - 1)) / Math.max(columns, 1);
      visibleCount = Math.max(1, Math.min(slides.length, Math.round(columns)));
      maxIndex = Math.max(0, slides.length - visibleCount);
      pageCount = maxIndex + 1;
      index = Math.min(index, maxIndex);

      const trackWidth = slides.length * slideWidth + gap * (slides.length - 1);
      track.style.width = `${trackWidth}px`;
    };

    const updateUI = () => {
      const offset = (slideWidth + gap) * index;
      track.style.transform = `translate3d(-${offset}px, 0, 0)`;

      if (prevBtn) prevBtn.disabled = index === 0;
      if (nextBtn) nextBtn.disabled = index >= maxIndex;
      if (currentEl) currentEl.textContent = String(index + 1).padStart(2, "0");
      if (totalEl) totalEl.textContent = String(slides.length).padStart(2, "0");

      if (dotsWrapper) {
        const dots = dotsWrapper.querySelectorAll(".slider-dot");
        dots.forEach((dot, dotIndex) => {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }
    };

    const goTo = (value) => {
      index = Math.max(0, Math.min(value, maxIndex));
      updateUI();
    };

    measure();
    renderDots();
    updateUI();

    prevBtn?.addEventListener("click", () => goTo(index - 1));
    nextBtn?.addEventListener("click", () => goTo(index + 1));
    window.addEventListener("resize", () => {
      measure();
      renderDots();
      updateUI();
    });
  });
}


/* ============================================================
   BACKGROUND DORÉ DYNAMIQUE
============================================================ */
function bindParallax() {
  if (bindParallax.bound) return;

  document.addEventListener("mousemove", (e) => {
    const pos = (e.clientX / window.innerWidth) * 100;
    root.style.setProperty("--pos", pos + "%");
  });

  bindParallax.bound = true;
}


/* ============================================================
   FOOTER — ANNÉE AUTOMATIQUE
============================================================ */
document.getElementById("year").textContent = new Date().getFullYear();

/* ============================================================
   ACCESSIBILITÉ : MODE RÉDUIT
============================================================ */
function applyReducedMotionState(matches) {
  if (matches) {
    root.classList.add("reduce-motion");
    stopLenis();
    document.querySelectorAll(".split, .reveal, .reveal-up, .card, .service-card, .slider-track").forEach(el => {
      el.style.opacity = 1;
      el.style.transform = "none";
    });
  } else {
    root.classList.remove("reduce-motion");
    startLenis();
    splitLines(".split");
    animateSplits();
    animateReveals();
    bindParallax();
  }
}

applyReducedMotionState(prefersReducedMotion.matches);
prefersReducedMotion.addEventListener("change", (event) => {
  applyReducedMotionState(event.matches);
});

initSliders();
