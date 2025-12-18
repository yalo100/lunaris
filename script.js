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
   SERVICES — CARROUSEL
============================================================ */
function initServiceCarousel() {
  const carousels = document.querySelectorAll("[data-carousel]");
  if (!carousels.length) return;

  carousels.forEach((carousel) => {
    const track = carousel.querySelector("[data-carousel-track]");
    const slides = Array.from(track?.children || []);
    const prevBtn = carousel.querySelector("[data-carousel-prev]");
    const nextBtn = carousel.querySelector("[data-carousel-next]");
    const windowEl = carousel.querySelector(".services-window");
    const scope = carousel.parentElement;
    const currentEl = scope?.querySelector("[data-carousel-current]");
    const totalEl = scope?.querySelector("[data-carousel-total]");

    if (!slides.length || !track) return;
    if (totalEl) totalEl.textContent = slides.length;

    const getBaseVisibleCount = () => {
      if (window.matchMedia("(max-width: 700px)").matches) return 1;
      if (window.matchMedia("(max-width: 980px)").matches) return 2;
      return 3;
    };

    const getGap = () => {
      const styles = track ? window.getComputedStyle(track) : null;
      const gapValue = styles?.getPropertyValue("column-gap") || styles?.getPropertyValue("gap") || "0";
      return parseFloat(gapValue) || 0;
    };

    const measureVisibleCount = () => {
      const viewportWidth = windowEl?.getBoundingClientRect().width || 0;
      const slideWidth = slides[0]?.getBoundingClientRect().width || 0;
      const gap = getGap();

      if (!viewportWidth || !slideWidth) return getBaseVisibleCount();
      return Math.max(1, Math.floor((viewportWidth + gap) / (slideWidth + gap)));
    };

    const getMaxOffset = () => {
      const windowWidth = windowEl?.getBoundingClientRect().width || 0;
      return Math.max(0, track.scrollWidth - windowWidth);
    };

    const getOffsetForIndex = (value) => {
      const slide = slides[value];
      if (!slide) return 0;

      // Utiliser offsetLeft pour un calcul stable, non impacté par le transform
      // courant appliqué sur la track (getBoundingClientRect inclut la translation
      // et entraînait des déplacements incohérents après la première interaction).
      return slide.offsetLeft;
    };

    let visibleCount = measureVisibleCount();
    let index = 0;

    const clampIndex = (value) => {
      const maxIndex = Math.max(0, slides.length - visibleCount);
      return Math.min(Math.max(value, 0), maxIndex);
    };

    const update = () => {
      visibleCount = measureVisibleCount();
      index = clampIndex(index);

      const offset = Math.min(getOffsetForIndex(index), getMaxOffset());
      track.style.transform = `translateX(-${offset}px)`;

      if (prevBtn) prevBtn.disabled = index <= 0;
      if (nextBtn) nextBtn.disabled = index >= slides.length - visibleCount;
      if (currentEl) currentEl.textContent = index + 1;
    };

    prevBtn?.addEventListener("click", () => {
      index = clampIndex(index - 1);
      update();
    });

    nextBtn?.addEventListener("click", () => {
      index = clampIndex(index + 1);
      update();
    });

    window.addEventListener("resize", update);

    update();
  });
}


/* ============================================================
   BACKGROUND DORÉ DYNAMIQUE
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
    document.querySelectorAll(".split, .reveal, .reveal-up, .card, .service-card").forEach(el => {
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

initServiceCarousel();
