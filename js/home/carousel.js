import { debounce, normalizeIndex, isTouchDevice } from "./utils.js";
import {
  LEADERSHIP_AUTO_ADVANCE_MS,
  FACILITATORS_AUTO_ADVANCE_MS,
  FACILITATORS_MOBILE_QUERY,
  RESIZE_DEBOUNCE_MS,
  SWIPE_THRESHOLD
} from "./config.js";

const getCarouselData = ({ carousel, cards }) => ({
  carousel,
  cards,
  currentIndex: 0,
  autoAdvanceInterval: null,
  touchStartX: 0,
  touchEndX: 0,
  transformFrame: 0,
  resizeTimer: 0
});

const getDimensions = (carousel, cards) => {
  const card = cards[0];
  if (!card || !carousel) {
    return { cardWidth: 240, gap: 32 };
  }

  const cardWidth = card.offsetWidth;
  const computedStyle = window.getComputedStyle(carousel);
  const gap = parseFloat(computedStyle.columnGap || computedStyle.gap || "32");
  return { cardWidth, gap };
};

const getWrapperWidth = (carousel) => carousel.parentElement?.clientWidth || window.innerWidth;

const setTransform = (carousel, offset, state) => {
  if (!carousel) {
    return;
  }

  if (state.transformFrame) {
    window.cancelAnimationFrame(state.transformFrame);
  }

  state.transformFrame = window.requestAnimationFrame(() => {
    carousel.style.willChange = "transform";
    carousel.style.transform = `translate3d(${offset}px, 0, 0)`;
  });
};

const calculateOffset = ({ carousel, cards, currentIndex }) => {
  const { cardWidth, gap } = getDimensions(carousel, cards);
  const wrapperWidth = getWrapperWidth(carousel);
  const centerOffset = wrapperWidth / 2 - cardWidth / 2;
  const cardSpace = cardWidth + gap;
  return centerOffset - currentIndex * cardSpace;
};

const applyCardClasses = ({ cards, currentIndex }) => {
  cards.forEach((card, index) => card.classList.toggle("active", index === currentIndex));
};

const isMobile = () => window.matchMedia(FACILITATORS_MOBILE_QUERY).matches;

export const createCarousel = ({ carousel, cards, name }) => {
  const state = getCarouselData({ carousel, cards });

  const update = (index) => {
    if (!carousel || !cards.length) {
      return;
    }

    if (name === "facilitators") {
      const mobile = isMobile();
      carousel.classList.toggle("is-mobile-layout", mobile);

      if (mobile) {
        cards.forEach((card) => card.classList.add("active"));
        carousel.style.transform = "translate3d(0, 0, 0)";
        return;
      }
    }

    state.currentIndex = normalizeIndex(index, cards.length);
    applyCardClasses(state);
    setTransform(carousel, calculateOffset(state), state);
  };

  const advance = () => update(state.currentIndex + 1);

  const startAutoAdvance = () => {
    if (state.autoAdvanceInterval) {
      clearInterval(state.autoAdvanceInterval);
    }

    if (name === "facilitators" && isMobile()) {
      return;
    }

    const intervalMs = name === "facilitators" ? FACILITATORS_AUTO_ADVANCE_MS : LEADERSHIP_AUTO_ADVANCE_MS;
    state.autoAdvanceInterval = window.setInterval(advance, intervalMs);
  };

  const stopAutoAdvance = () => {
    if (state.autoAdvanceInterval) {
      clearInterval(state.autoAdvanceInterval);
      state.autoAdvanceInterval = null;
    }
  };

  const resetAutoAdvance = () => {
    stopAutoAdvance();
    startAutoAdvance();
  };

  const attachEvents = () => {
    cards.forEach((card, index) => {
      card.addEventListener("click", () => {
        update(index);
        resetAutoAdvance();
      });
    });

    if (!carousel) {
      return;
    }

    carousel.addEventListener("touchstart", (event) => {
      state.touchStartX = event.changedTouches[0].clientX;
      stopAutoAdvance();
    }, { passive: true });

    carousel.addEventListener("touchend", (event) => {
      state.touchEndX = event.changedTouches[0].clientX;
      const diff = state.touchStartX - state.touchEndX;

      if (diff > SWIPE_THRESHOLD && name !== "facilitators") {
        advance();
      }

      if (name === "facilitators" && diff > SWIPE_THRESHOLD && !isMobile()) {
        advance();
      }

      resetAutoAdvance();
    }, { passive: true });

    window.addEventListener("resize", debounce(() => update(state.currentIndex), RESIZE_DEBOUNCE_MS));
  };

  const init = () => {
    if (!carousel || !cards.length) {
      return;
    }

    attachEvents();
    startAutoAdvance();
    update(0);
  };

  return {
    init,
    refresh: () => update(state.currentIndex)
  };
};
