document.addEventListener("DOMContentLoaded", () => {
    const preloadOverlay = document.querySelector(".preload-overlay");
    const preloadContinueButton = document.querySelector(".preload-continue");
    const homeSection = document.querySelector("#home");
    const navGroup = document.querySelector(".nav-glass");
    const radios = Array.from(document.querySelectorAll('.nav-glass input[type="radio"]'));
    const labels = Array.from(document.querySelectorAll('.nav-glass label'));
    const glider = document.querySelector(".glass-glider");
    const aboutTimeline = document.querySelector("[data-about-timeline]");
    const aboutSteps = Array.from(document.querySelectorAll("[data-about-step]"));
    const leadershipTitle = document.querySelector("[data-leadership-title]");
    const leadershipCarousel = document.querySelector("#leadershipCarousel");
    const leadershipCards = Array.from(document.querySelectorAll("[data-leader-card]"));
    const navItems = radios.map((radio, index) => ({
        radio,
        label: labels[index],
        target: radio.dataset.target
    }));
    const navItemsByTarget = new Map(navItems.map((item) => [item.target, item]));
    const sectionThemes = {
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

    if (window.VANTA && typeof window.VANTA.NET === "function" && homeSection) {
        window.VANTA.NET({
            el: "#home",
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200,
            minWidth: 200,
            scale: 1,
            scaleMobile: 1,
            color: 0x1e88e5,
            backgroundColor: 0x031427,
            points: 12,
            maxDistance: 22,
            spacing: 18,
            showDots: true
        });
    }

    if (!navGroup || !glider || radios.length === 0) {
        return;
    }

    const hidePreloadOverlay = () => {
        if (!preloadOverlay) {
            return;
        }

        preloadOverlay.classList.add("is-hidden");
        window.setTimeout(() => {
            preloadOverlay.remove();
        }, 1200);
    };

    const onContinue = () => {
        hidePreloadOverlay();

        if (preloadContinueButton) {
            preloadContinueButton.removeEventListener("click", onContinue);
        }
    };

    if (preloadContinueButton) {
        preloadContinueButton.addEventListener("click", onContinue);
    }

    let activeTarget = null;
    let navFrameId = 0;

    const setActiveNav = (target, { shouldScroll = false, force = false } = {}) => {
        const navItem = navItemsByTarget.get(target) || navItemsByTarget.get("#home");

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

        navFrameId = window.requestAnimationFrame(() => {
            moveGlider(navItem);
        });

        if (shouldScroll) {
            scrollToTarget(navItem.target);
        }
    };

    const queueNavUpdate = (target) => {
        if (!target || target === activeTarget) {
            return;
        }

        setActiveNav(target, { force: true });
    };

    if (aboutTimeline && aboutSteps.length > 0) {
        const setAboutProgress = (visibleCount) => {
            const progress = Math.max(0, Math.min(1, visibleCount / aboutSteps.length));
            aboutTimeline.style.setProperty("--about-progress", String(progress));
        };

        aboutSteps.forEach((step) => {
            step.classList.add("is-visible");
        });
        setAboutProgress(aboutSteps.length);
    }

    if (leadershipTitle || leadershipCards.length > 0) {
        if (leadershipTitle) {
            leadershipTitle.classList.add("is-visible");
        }

        leadershipCards.forEach((card) => {
            card.classList.add("is-visible");
        });
    }

    // Leadership carousel functionality
    let leadershipCurrentIndex = 0;
    let leadershipAutoAdvanceInterval = null;
    let leadershipTouchStartX = 0;
    let leadershipTouchEndX = 0;

    const getLeadershipCardDimensions = () => {
        const card = leadershipCards[0];
        if (!card) return { cardWidth: 240, gap: 32 };
        const cardWidth = card.offsetWidth;
        const carouselStyle = window.getComputedStyle(leadershipCarousel);
        const gap = parseFloat(carouselStyle.columnGap || carouselStyle.gap || "32");
        return { cardWidth, gap };
    };

    const updateLeadershipCarousel = (index) => {
        if (!leadershipCarousel || leadershipCards.length === 0) {
            return;
        }

        // Wrap index to valid range (infinite on both sides)
        leadershipCurrentIndex = ((index % leadershipCards.length) + leadershipCards.length) % leadershipCards.length;

        // Update active class on cards
        leadershipCards.forEach((card, idx) => {
            card.classList.toggle("active", idx === leadershipCurrentIndex);
        });

        // Center the active card inside the carousel viewport
        const { cardWidth, gap } = getLeadershipCardDimensions();
        const cardSpace = cardWidth + gap;
        const wrapperWidth = leadershipCarousel.parentElement?.clientWidth || window.innerWidth;
        const centerOffset = wrapperWidth / 2 - cardWidth / 2;
        const offset = centerOffset - leadershipCurrentIndex * cardSpace;
        leadershipCarousel.style.transform = `translateX(${offset}px)`;
    };

    const advanceLeadershipCarousel = () => {
        updateLeadershipCarousel(leadershipCurrentIndex + 1);
    };

    const startLeadershipAutoAdvance = () => {
        if (leadershipAutoAdvanceInterval) {
            clearInterval(leadershipAutoAdvanceInterval);
        }

        leadershipAutoAdvanceInterval = setInterval(advanceLeadershipCarousel, 3500);
    };

    const stopLeadershipAutoAdvance = () => {
        if (leadershipAutoAdvanceInterval) {
            clearInterval(leadershipAutoAdvanceInterval);
            leadershipAutoAdvanceInterval = null;
        }
    };

    const resetLeadershipAutoAdvance = () => {
        stopLeadershipAutoAdvance();
        startLeadershipAutoAdvance();
    };

    // Click navigation
    leadershipCards.forEach((card, index) => {
        card.addEventListener("click", () => {
            updateLeadershipCarousel(index);
            resetLeadershipAutoAdvance();
        });
    });

    // Swipe detection - forward only (continuous loop)
    if (leadershipCarousel) {
        leadershipCarousel.addEventListener("touchstart", (e) => {
            leadershipTouchStartX = e.changedTouches[0].clientX;
            stopLeadershipAutoAdvance();
        }, { passive: true });

        leadershipCarousel.addEventListener("touchend", (e) => {
            leadershipTouchEndX = e.changedTouches[0].clientX;
            const swipeThreshold = 50;
            const diff = leadershipTouchStartX - leadershipTouchEndX;

            // Only allow forward progression (swiping left)
            if (diff > swipeThreshold) {
                // Swiped left - advance carousel
                advanceLeadershipCarousel();
            }

            resetLeadershipAutoAdvance();
        }, { passive: true });
    }

    window.addEventListener("resize", () => {
        updateLeadershipCarousel(leadershipCurrentIndex);
    });

    // Start auto-advance
    startLeadershipAutoAdvance();

    // Initialize carousel to first card
    updateLeadershipCarousel(0);

    const getSelectedRadio = () => radios.find((radio) => radio.checked) || radios[0];
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
    const shouldUseSmoothScroll = !isTouchDevice && !prefersReducedMotion;

    const moveGlider = (navItemOrRadio) => {
        const navItem = navItemOrRadio && navItemOrRadio.label ? navItemOrRadio : navItemsByTarget.get(navItemOrRadio?.dataset?.target) || navItemsByTarget.get(navItemOrRadio?.target) || null;
        const label = navItem?.label;
        const theme = sectionThemes[navItem?.target] || sectionThemes["#home"];

        if (!label) {
            return;
        }

        const duration = prefersReducedMotion ? "0ms" : "420ms";
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

        targetElement.scrollIntoView({ behavior: shouldUseSmoothScroll ? "smooth" : "auto", block: "start" });
        history.replaceState(null, "", target);
    };

    const syncSelection = (radio, shouldScroll = false) => {
        if (!radio) {
            return;
        }

        setActiveNav(radio.dataset.target, { shouldScroll, force: true });
    };

    radios.forEach((radio) => {
        radio.addEventListener("change", () => {
            syncSelection(radio, true);
        });
    });

    const syncFromHash = () => {
        const currentHash = window.location.hash || "#home";
        setActiveNav(currentHash, { force: true });
    };

    let sectionNavFrameId = 0;

    const targetSections = radios
        .map((radio) => document.querySelector(radio.dataset.target || ""))
        .filter(Boolean);

    const updateActiveSectionFromScroll = () => {
        if (!targetSections.length) {
            return;
        }

        const offset = isTouchDevice ? 120 : 160;
        let nearestSection = null;
        let nearestDistance = Number.POSITIVE_INFINITY;

        targetSections.forEach((section) => {
            const rect = section.getBoundingClientRect();
            const sectionOffset = rect.top + window.scrollY - offset;
            const distance = Math.abs(sectionOffset - window.scrollY);

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

    const sectionObserver = new IntersectionObserver((entries) => {
        const activeEntry = entries
            .filter((entry) => entry.isIntersecting)
            .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

        if (!activeEntry) {
            updateActiveSectionFromScroll();
            return;
        }

        if (sectionNavFrameId) {
            window.cancelAnimationFrame(sectionNavFrameId);
        }

        sectionNavFrameId = window.requestAnimationFrame(() => {
            queueNavUpdate(`#${activeEntry.target.id}`);
        });
    }, {
        rootMargin: isTouchDevice ? "-12% 0px -20% 0px" : "-28% 0px -42% 0px",
        threshold: [0.2, 0.45, 0.65]
    });

    targetSections.forEach((section) => {
        sectionObserver.observe(section);
    });

    const scheduleLayoutSync = () => {
        window.requestAnimationFrame(() => {
            moveGlider(navItemsByTarget.get(activeTarget) || getSelectedRadio());
        });
    };

    const resizeObserver = typeof ResizeObserver === "function"
        ? new ResizeObserver(() => {
            scheduleLayoutSync();
        })
        : null;

    if (resizeObserver) {
        resizeObserver.observe(navGroup);
    }

    window.addEventListener("hashchange", syncFromHash);
    window.addEventListener("resize", () => {
        scheduleLayoutSync();
        updateActiveSectionFromScroll();
    });
    window.addEventListener("scroll", () => {
        updateActiveSectionFromScroll();
    }, { passive: true });
    window.addEventListener("load", syncFromHash, { once: true });

    scheduleLayoutSync();
    updateActiveSectionFromScroll();
});
