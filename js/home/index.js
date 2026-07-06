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
    initHeroLogoObserver();
    initHeroScrollAnimator();
  };

  // Observe whether the hero section is visible; when it scrolls out of view
  // add `.shrunk` to the logo to make it slowly shrink and fade. Remove the
  // class when the hero is visible again.
  const initHeroLogoObserver = () => {
    const logo = document.querySelector('.hero-logo');
    if (!homeSection || !logo || typeof IntersectionObserver === 'undefined') {
      // fallback: shrink on scrollY > 120
      window.addEventListener('scroll', () => {
        if (window.scrollY > 140) {
          logo?.classList.add('shrunk');
        } else {
          logo?.classList.remove('shrunk');
        }
      }, { passive: true });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      const e = entries[0];
      if (e.isIntersecting && e.intersectionRatio > 0.6) {
        logo.classList.remove('shrunk');
      } else {
        logo.classList.add('shrunk');
      }
    }, { threshold: [0, 0.25, 0.6, 1] });

    observer.observe(homeSection);
  };

  // Progressive scroll-driven animator: when user scrolls down, the logo's
  // Scroll-driven mapping: while the user scrolls down across the hero
  // section, progressively shrink the logo based on scroll progress. When
  // scrolling stops the logo remains at its current state (no auto-reset).
  const initHeroScrollAnimator = () => {
    const logo = document.querySelector('.hero-logo');
    if (!logo || !homeSection) return;

    const MIN_SCALE = 0.18;
    const MAX_SCALE = 1;
    const SHRINK_AREA_RATIO = 0.6; // fraction of hero height over which shrink happens

    let ticking = false;

    const applyProgress = (progress) => {
      // progress: 0..1
      const scale = MAX_SCALE - progress * (MAX_SCALE - MIN_SCALE);
      const opacity = 1 - progress;
      logo.style.transform = `scale(${scale})`;
      logo.style.opacity = `${opacity}`;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const rect = homeSection.getBoundingClientRect();
        const heroHeight = Math.max(rect.height, window.innerHeight * 0.5);
        // Calculate how far we've scrolled past the top of the hero
        const scrolled = Math.min(Math.max(-rect.top, 0), heroHeight * SHRINK_AREA_RATIO);
        const progress = Math.min(1, heroHeight <= 0 ? 0 : scrolled / (heroHeight * SHRINK_AREA_RATIO));

        applyProgress(progress);

        // If user has scrolled entirely past the shrink threshold, keep final state
        if (progress >= 1) {
          logo.classList.add('shrunk');
        } else {
          logo.classList.remove('shrunk');
        }

        ticking = false;
      });
    };

    // initialize to current scroll position
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  };

  return { init };
};

onReady(() => {
  createController().init();
});
