/* ============================================================
   SMOOTH SCROLL — LENIS
============================================================ */
const lenis = new Lenis({
  duration: 1.2,
  smooth: true,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);


/* ============================================================
   HEADER DYNAMIQUE — MODE COMPACT AU SCROLL
============================================================ */
const header = document.getElementById("header");
let lastScroll = 0;

window.addEventListener("scroll", () => {
  const current = window.scrollY;

  if (current > 80 && current > lastScroll) {
    header.classList.add("compact");
  } else if (current < 40) {
    header.classList.remove("compact");
  }

  lastScroll = current;
});


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
    const words = el.textContent.trim().split(" ");
    el.textContent = "";

    words.forEach(word => {
      const span = document.createElement("span");
      span.classList.add("split");
      span.textContent = word + " ";
      el.appendChild(span);
    });
  });
}

splitLines(".split");

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


/* ============================================================
   SECTIONS — REVEAL ANIMATIONS
============================================================ */

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


/* ============================================================
   CARDS — FLOATING LUXE ENTRANCE
============================================================ */

gsap.utils.toArray(".card").forEach(card => {
  gsap.fromTo(
    card,
    { opacity: 0, y: 40 },
    {
      opacity: 1,
      y: 0,
      duration: 1.3,
      ease: "power3.out",
      scrollTrigger: {
        trigger: card,
        start: "top 90%",
      }
    }
  );
});


/* ============================================================
   BACKGROUND DORÉ DYNAMIQUE
============================================================ */
document.addEventListener("mousemove", (e) => {
  const pos = (e.clientX / window.innerWidth) * 100;
  root.style.setProperty("--pos", pos + "%");
});


/* ============================================================
   FOOTER — ANNÉE AUTOMATIQUE
============================================================ */
document.getElementById("year").textContent = new Date().getFullYear();
