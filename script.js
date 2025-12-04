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


/* ============================================================
   THEME SWITCH (DARK / LIGHT)
============================================================ */
const themeToggle = document.getElementById("theme-toggle");
const root = document.documentElement;

function applyTheme(theme) {
  if (theme === "light") root.classList.add("light");
  else root.classList.remove("light");
}

function toggleTheme() {
  const current = root.classList.contains("light") ? "light" : "dark";
  const next = current === "light" ? "dark" : "light";
  applyTheme(next);
  localStorage.setItem("theme", next);
}

themeToggle.addEventListener("click", toggleTheme);

// Charger thème sauvegardé
applyTheme(localStorage.getItem("theme"));


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
    document.querySelectorAll(".split, .reveal, .reveal-up, .card").forEach(el => {
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
