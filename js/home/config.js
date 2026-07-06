export const SELECTORS = {
  preloadOverlay: ".preload-overlay",
  preloadContinue: ".preload-continue",
  homeSection: "#home",
  navGroup: ".nav-glass",
  navToggle: ".nav-toggle",
  siteNav: ".site-nav",
  siteHeader: ".site-header",
  navRadios: ".nav-glass input[type='radio']",
  navLabels: ".nav-glass label",
  glider: ".glass-glider",
  aboutTimeline: "[data-about-timeline]",
  aboutSteps: "[data-about-step]",
  leadershipTitle: "[data-leadership-title]",
  leadershipCarousel: "#leadershipCarousel",
  leadershipCards: "[data-leader-card]",
  facilitatorsCarousel: "#facilitatorsCarousel",
  facilitatorCards: "[data-facilitator-card]"
};

export const SECTION_THEMES = {
  "#home": {
    background: "linear-gradient(135deg, rgba(130, 203, 255, 0.72), rgba(32, 124, 230, 0.98))",
    shadow: "0 0 18px rgba(130, 203, 255, 0.55), 0 0 10px rgba(255, 255, 255, 0.22) inset"
  },
  "#about": {
    background: "linear-gradient(135deg, rgba(108, 181, 255, 0.55), rgba(58, 105, 214, 0.96))",
    shadow: "0 0 18px rgba(108, 181, 255, 0.48), 0 0 10px rgba(255, 255, 255, 0.2) inset"
  },
  "#leadership": {
    background: "linear-gradient(135deg, rgba(151, 208, 255, 0.58), rgba(85, 162, 245, 0.96))",
    shadow: "0 0 18px rgba(151, 208, 255, 0.48), 0 0 10px rgba(255, 255, 255, 0.2) inset"
  },
  "#programs": {
    background: "linear-gradient(135deg, rgba(127, 219, 255, 0.54), rgba(40, 155, 236, 0.96))",
    shadow: "0 0 18px rgba(127, 219, 255, 0.46), 0 0 10px rgba(255, 255, 255, 0.2) inset"
  },
  "#conferences": {
    background: "linear-gradient(135deg, rgba(161, 226, 255, 0.58), rgba(77, 175, 248, 0.96))",
    shadow: "0 0 18px rgba(161, 226, 255, 0.46), 0 0 10px rgba(255, 255, 255, 0.2) inset"
  },
  "#alumni": {
    background: "linear-gradient(135deg, rgba(110, 196, 255, 0.56), rgba(31, 138, 229, 0.96))",
    shadow: "0 0 18px rgba(110, 196, 255, 0.46), 0 0 10px rgba(255, 255, 255, 0.2) inset"
  },
  "#repository": {
    background: "linear-gradient(135deg, rgba(137, 212, 255, 0.6), rgba(52, 150, 242, 0.96))",
    shadow: "0 0 18px rgba(137, 212, 255, 0.48), 0 0 10px rgba(255, 255, 255, 0.2) inset"
  },
  "#contact": {
    background: "linear-gradient(135deg, rgba(91, 173, 255, 0.6), rgba(19, 113, 214, 0.96))",
    shadow: "0 0 18px rgba(91, 173, 255, 0.48), 0 0 10px rgba(255, 255, 255, 0.2) inset"
  }
};

export const HIDE_OVERLAY_DURATION = 1200;
export const LEADERSHIP_AUTO_ADVANCE_MS = 3500;
export const FACILITATORS_AUTO_ADVANCE_MS = 4200;
export const RESIZE_DEBOUNCE_MS = 120;
export const SWIPE_THRESHOLD = 50;
export const MOBILE_NAV_BREAKPOINT = 900;
export const FACILITATORS_MOBILE_QUERY = "(max-width: 768px)";
export const SCROLL_OFFSET_TOUCH = 120;
export const SCROLL_OFFSET_DESKTOP = 160;
