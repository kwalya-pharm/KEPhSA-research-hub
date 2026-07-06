import { HIDE_OVERLAY_DURATION } from "./config.js";

export const initPreload = ({ overlay, continueButton }) => {
  if (!overlay || !continueButton) {
    return;
  }

  const hideOverlay = () => {
    overlay.classList.add("is-hidden");
    window.setTimeout(() => {
      overlay.remove();
    }, HIDE_OVERLAY_DURATION);
  };

  const handleContinue = () => {
    hideOverlay();
    continueButton.removeEventListener("click", handleContinue);
  };

  continueButton.addEventListener("click", handleContinue);
};
