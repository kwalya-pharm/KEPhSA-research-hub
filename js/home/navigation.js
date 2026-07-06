import { debounce, isTouchDevice, prefersReducedMotion, normalizeIndex, query, queryAll } from "./utils.js";
import {
  SECTION_THEMES,
  MOBILE_NAV_BREAKPOINT,
  SCROLL_OFFSET_TOUCH,
  SCROLL_OFFSET_DESKTOP,
  RESIZE_DEBOUNCE_MS
} from "./config.js";

const getNavItems = (radios, labels) => radios.map((radio, index) => ({
  radio,
  label: labels[index],
  target: radio.dataset.target
}));

const getTargetSections = (radios) => radios
  .map((radio) => document.querySelector(radio.dataset.target))
  .filter(Boolean);

const getOffsetForDevice = () => (isTouchDevice() ? SCROLL_OFFSET_TOUCH : SCROLL_OFFSET_DESKTOP);

const normalizeTarget = (target) => (typeof target === "string" ? target : "#home");

const getActiveEntry = (entries) => entries
  .filter((entry) => entry.isIntersecting)
  .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

export const createNavController = ({
  navGroup,
  navToggle,
  siteNav,
  siteHeader,
  glider,
  radios,
  labels,
  closeMobileNav
}) => {
  const navItems = getNavItems(radios, labels);
  const navItemsByTarget = new Map(navItems.map((item) => [item.target, item]));
  const targetSections = getTargetSections(radios);
  let activeTarget = null;
  let navFrameId = 0;
  let sectionNavFrameId = 0;
  let resizeObserver = null;

  const moveGlider = (navItem) => {
    const label = navItem?.label;
    const theme = SECTION_THEMES[navItem?.target] || SECTION_THEMES["#home"];

    if (!label || !glider) {
      return;
    }

    const duration = prefersReducedMotion() ? "0ms" : "420ms";

    glider.style.transition = `transform ${duration} cubic-bezier(0.22, 1, 0.36, 1), width ${duration} cubic-bezier(0.22, 1, 0.36, 1), background 0.35s ease, box-shadow 0.35s ease`;
    glider.style.width = `${label.offsetWidth}px`;
    glider.style.transform = `translate3d(${label.offsetLeft}px, 0, 0)`;
    glider.style.background = theme.background;
    glider.style.boxShadow = theme.shadow;
  };

  const scrollToTarget = (target) => {
    const targetElement = document.querySelector(target);

    if (!targetElement) {
      return;
    }

    targetElement.scrollIntoView({
      behavior: prefersReducedMotion() || isTouchDevice() ? "auto" : "smooth",
      block: "start"
    });

    history.replaceState(null, "", target);
  };

  const setActiveNav = (target, { shouldScroll = false, force = false } = {}) => {
    const normalizedTarget = normalizeTarget(target);
    const navItem = navItemsByTarget.get(normalizedTarget) || navItemsByTarget.get("#home");

    if (!navItem) {
      return;
    }

    if (!force && activeTarget === navItem.target && !shouldScroll) {
      return;
    }

    activeTarget = navItem.target;
    navItem.radio.checked = true;

    if (navFrameId) {
      window.cancelAnimationFrame(navFrameId);
    }

    navFrameId = window.requestAnimationFrame(() => moveGlider(navItem));

    if (shouldScroll) {
      scrollToTarget(navItem.target);
    }
  };

  const queueNavUpdate = (target) => {
    const normalizedTarget = normalizeTarget(target);

    if (normalizedTarget === activeTarget) {
      return;
    }

    setActiveNav(normalizedTarget, { force: true });
  };

  const resolveNavItem = (navItemOrRadio) => {
    if (!navItemOrRadio) {
      return null;
    }

    if (navItemOrRadio.label) {
      return navItemOrRadio;
    }

    return navItemsByTarget.get(navItemOrRadio.dataset?.target) || navItemsByTarget.get(navItemOrRadio.target) || null;
  };

  const getSelectedRadio = () => radios.find((radio) => radio.checked) || radios[0];

  const updateActiveSectionFromScroll = () => {
    if (!targetSections.length) {
      return;
    }

    const offset = getOffsetForDevice();
    let nearestSection = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    targetSections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top + window.scrollY - offset;
      const distance = Math.abs(sectionTop - window.scrollY);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestSection = section;
      }
    });

    if (nearestSection) {
      if (sectionNavFrameId) {
        window.cancelAnimationFrame(sectionNavFrameId);
      }

      sectionNavFrameId = window.requestAnimationFrame(() => {
        queueNavUpdate(`#${nearestSection.id}`);
      });
    }
  };

  const syncFromHash = () => {
    const hash = window.location.hash || "#home";
    setActiveNav(hash, { force: true });
  };

  const scheduleLayoutSync = () => {
    window.requestAnimationFrame(() => {
      moveGlider(resolveNavItem(navItemsByTarget.get(activeTarget) || getSelectedRadio()));
    });
  };

  const attachResizeObserver = () => {
    if (typeof ResizeObserver !== "function" || !navGroup) {
      return;
    }

    resizeObserver = new ResizeObserver(() => {
      scheduleLayoutSync();
    });

    resizeObserver.observe(navGroup);
  };

  const attachEvents = () => {
    radios.forEach((radio) => {
      radio.addEventListener("change", () => {
        setActiveNav(radio.dataset.target, { shouldScroll: true, force: true });

        if (window.innerWidth <= MOBILE_NAV_BREAKPOINT) {
          closeMobileNav();
        }
      });
    });

    if (navToggle && siteNav) {
      navToggle.addEventListener("click", () => {
        const isOpen = siteNav.classList.toggle("is-open");
        siteHeader?.classList.toggle("is-open", isOpen);
        navToggle.setAttribute("aria-expanded", String(isOpen));
        document.body.classList.toggle("nav-open", isOpen);
      });
    }

    document.addEventListener("click", (event) => {
      if (!siteNav || !siteNav.classList.contains("is-open")) {
        return;
      }

      if (!siteNav.contains(event.target) && !navToggle?.contains(event.target)) {
        closeMobileNav();
      }
    });

    window.addEventListener("hashchange", syncFromHash);
    window.addEventListener("load", syncFromHash, { once: true });
    window.addEventListener("scroll", updateActiveSectionFromScroll, { passive: true });

    window.addEventListener("resize", debounce(() => {
      if (window.innerWidth > MOBILE_NAV_BREAKPOINT) {
        closeMobileNav();
      }
      scheduleLayoutSync();
      updateActiveSectionFromScroll();
    }, RESIZE_DEBOUNCE_MS));
  };

  const createObserver = () => {
    if (!targetSections.length) {
      return;
    }

    const sectionObserver = new IntersectionObserver((entries) => {
      const activeEntry = getActiveEntry(entries);
      if (activeEntry) {
        if (sectionNavFrameId) {
          window.cancelAnimationFrame(sectionNavFrameId);
        }

        sectionNavFrameId = window.requestAnimationFrame(() => {
          queueNavUpdate(`#${activeEntry.target.id}`);
        });
      } else {
        updateActiveSectionFromScroll();
      }
    }, {
      rootMargin: isTouchDevice() ? "-12% 0px -20% 0px" : "-28% 0px -42% 0px",
      threshold: [0.2, 0.45, 0.65]
    });

    targetSections.forEach((section) => sectionObserver.observe(section));
  };

  const init = () => {
    if (!navGroup || !glider || radios.length === 0 || labels.length === 0) {
      return;
    }

    attachEvents();
    attachResizeObserver();
    createObserver();
    syncFromHash();
    scheduleLayoutSync();
    updateActiveSectionFromScroll();
  };

  return {
    init,
    setActiveNav,
    scheduleLayoutSync
  };
};
