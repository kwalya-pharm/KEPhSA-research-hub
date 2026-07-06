import { HIDE_OVERLAY_DURATION } from "./config.js";

// Pulse the preload logo for a fixed duration (ms), then hide overlay.
const PULSE_DURATION = 5000;

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

  // Start pulse animation if logo exists
  if (logo) {
    // ensure class is present to trigger CSS animation
    logo.classList.add("pulse");

    // After the pulse duration, stop animation and hide overlay
    window.setTimeout(() => {
      if (logo) logo.classList.remove("pulse");
      hideOverlay();
    }, PULSE_DURATION);
  } else {
    // If no logo, hide overlay quickly
    window.setTimeout(hideOverlay, 300);
  }
};
