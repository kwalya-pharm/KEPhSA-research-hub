import { HIDE_OVERLAY_DURATION } from "./config.js";

// Shrink-and-fade duration for preload logo (ms). After this the overlay hides.
const SHRINK_DURATION = 3000;

export const initPreload = ({ overlay, continueButton }) => {
  if (!overlay) {
    return;
  }

  const logo = overlay.querySelector(".preload-logo");

  const hideOverlay = () => {
    overlay.classList.add("is-hidden");
    window.setTimeout(() => {
      overlay.remove();
    }, HIDE_OVERLAY_DURATION);
  };

  // Allow optional continue button to skip the wait (backwards-compatible)
  if (continueButton) {
    const handleContinue = () => {
      if (logo) logo.classList.remove("pulse");
      hideOverlay();
      continueButton.removeEventListener("click", handleContinue);
    };
    continueButton.addEventListener("click", handleContinue);
  }

  // Start shrink-and-fade animation if logo exists
  if (logo) {
    // remove pulse if previously applied
    logo.classList.remove("pulse");

    const text = overlay.querySelector('.preload-text');

    // Trigger shrink + fade via a dedicated class which uses CSS transitions
    // Respect reduced-motion: if user prefers reduced motion, skip animation
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      hideOverlay();
      return;
    }

    // Force reflow to ensure transition will run
    // eslint-disable-next-line no-unused-expressions
    logo.offsetWidth;
    logo.classList.add("shrink-hide");
    if (text) {
      // ensure text transitions alongside the logo
      // force reflow for the text as well
      // eslint-disable-next-line no-unused-expressions
      text.offsetWidth;
      text.classList.add('shrink-hide');
    }

    // After transition duration, remove overlay so the site is fully visible at ~3s
    window.setTimeout(() => {
      // remove overlay immediately (no extra fade) so total delay ~= SHRINK_DURATION
      overlay.remove();
    }, SHRINK_DURATION);
  } else {
    // If no logo, hide overlay quickly
    window.setTimeout(hideOverlay, 300);
  }
};
