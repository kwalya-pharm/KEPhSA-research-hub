import { query, queryAll, onReady } from "./utils.js";
import { SELECTORS } from "./config.js";
import { initPreload } from "./preload.js";
import { initVantaBackground } from "./vanta.js";
import { initSectionEffects } from "./section-effects.js";
import { createNavController } from "./navigation.js";
import { createCarousel } from "./carousel.js";

const safeQuery = (selector) => query(selector) || null;

const createController = () => {
  const preloadOverlay = safeQuery(SELECTORS.preloadOverlay);
  const preloadContinueButton = safeQuery(SELECTORS.preloadContinue);
  const homeSection = safeQuery(SELECTORS.homeSection);
  const navGroup = safeQuery(SELECTORS.navGroup);
  const navToggle = safeQuery(SELECTORS.navToggle);
  const siteNav = safeQuery(SELECTORS.siteNav);
  const siteHeader = safeQuery(SELECTORS.siteHeader);
  const radios = queryAll(SELECTORS.navRadios);
  const labels = queryAll(SELECTORS.navLabels);
  const glider = safeQuery(SELECTORS.glider);
  const aboutTimeline = safeQuery(SELECTORS.aboutTimeline);
  const aboutSteps = queryAll(SELECTORS.aboutSteps);
  const leadershipTitle = safeQuery(SELECTORS.leadershipTitle);
  const leadershipCarousel = safeQuery(SELECTORS.leadershipCarousel);
  const leadershipCards = queryAll(SELECTORS.leadershipCards);
  const facilitatorsCarousel = safeQuery(SELECTORS.facilitatorsCarousel);
  const facilitatorsCards = queryAll(SELECTORS.facilitatorCards);

  const closeMobileNav = () => {
    if (!siteNav || !navToggle) {
      return;
    }

    siteNav.classList.remove("is-open");
    siteHeader?.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  };

  const navController = createNavController({
    navGroup,
    navToggle,
    siteNav,
    siteHeader,
    glider,
    radios,
    labels,
    closeMobileNav
  });

  const leadershipCarouselController = createCarousel({
    carousel: leadershipCarousel,
    cards: leadershipCards,
    name: "leadership"
  });

  const facilitatorsCarouselController = createCarousel({
    carousel: facilitatorsCarousel,
    cards: facilitatorsCards,
    name: "facilitators"
  });

  const init = () => {
    initPreload({ overlay: preloadOverlay, continueButton: preloadContinueButton });
    initVantaBackground(homeSection);
    initSectionEffects({ aboutTimeline, aboutSteps, leadershipTitle, leadershipCards });
    navController.init();
    leadershipCarouselController.init();
    facilitatorsCarouselController.init();
  };

  return { init };
};

onReady(() => {
  createController().init();
});
