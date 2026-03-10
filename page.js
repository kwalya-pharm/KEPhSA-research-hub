// page.js
document.addEventListener("DOMContentLoaded", () => {
  // --- PAGE LOAD ANIMATION ---
  const curtain = document.getElementById("curtain");
  if (curtain) {
    setTimeout(() => {
      curtain.classList.add("curtain-hide"); // add CSS transition for fade-out
    }, 1100);
    setTimeout(() => curtain.remove(), 2600); // remove after visible hold + fade
  }

  // --- SCROLL ANIMATIONS ---
  const fadeEls = document.querySelectorAll(".fade-in");
  fadeEls.forEach((el, index) => {
    const delay = Math.min(index * 0.06, 0.36);
    el.style.setProperty("--reveal-delay", `${delay}s`);
  });

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible"); // CSS handles fade-in
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  fadeEls.forEach(el => observer.observe(el));

  // --- SMOOTH SCROLL FOR NAV LINKS ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId && targetId.startsWith("#")) {
        const targetEl = document.querySelector(targetId);
        if (!targetEl) {
          return;
        }
        e.preventDefault();
        targetEl.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  });

  // --- HEADER APPEARANCE ON SCROLL ---
  const header = document.querySelector(".main-header");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  // --- PARTNERS MARQUEE ---
  const partnersTrack = document.getElementById("partners-track");
  const firstPartnerGroup = partnersTrack?.querySelector(".partner-group");

  if (partnersTrack && firstPartnerGroup) {
    let offset = 0;
    let lastTime = 0;
    const speed = 42;

    const step = timestamp => {
      if (!lastTime) {
        lastTime = timestamp;
      }

      const delta = (timestamp - lastTime) / 1000;
      lastTime = timestamp;

      offset -= speed * delta;
      const resetPoint = firstPartnerGroup.offsetWidth;

      if (resetPoint > 0 && Math.abs(offset) >= resetPoint) {
        offset += resetPoint;
      }

      partnersTrack.style.setProperty("--marquee-offset", `${offset}px`);
      window.requestAnimationFrame(step);
    };

    window.requestAnimationFrame(step);
  }
});