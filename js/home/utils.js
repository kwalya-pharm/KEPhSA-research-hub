export const query = (selector, root = document) => root.querySelector(selector);
export const queryAll = (selector, root = document) => Array.from(root.querySelectorAll(selector));

export const onReady = (callback) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
};

export const isTouchDevice = () => window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
export const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const debounce = (callback, delay = 120) => {
  let timer = null;
  return (...args) => {
    if (timer) {
      window.clearTimeout(timer);
    }
    timer = window.setTimeout(() => {
      callback(...args);
      timer = null;
    }, delay);
  };
};

export const normalizeIndex = (index, length) => ((index % length) + length) % length;
