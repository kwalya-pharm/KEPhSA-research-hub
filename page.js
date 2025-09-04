// page.js
document.addEventListener("DOMContentLoaded", () => {
  // --- PAGE LOAD ANIMATION ---
  const curtain = document.getElementById("curtain");
  if (curtain) {
    curtain.classList.add("curtain-hide"); // add CSS transition for fade-out
    setTimeout(() => curtain.remove(), 1200); // remove after fade
  }

  // --- SCROLL ANIMATIONS ---
  const fadeEls = document.querySelectorAll(".fade-in");
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
        e.preventDefault();
        document.querySelector(targetId).scrollIntoView({
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
});
