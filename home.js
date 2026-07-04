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
    const leadershipCards = Array.from(document.querySelectorAll("[data-leadership-card]"));
    const leadershipToggles = Array.from(document.querySelectorAll("[data-leadership-toggle]"));
    const leadershipMobileQuery = window.matchMedia("(max-width: 768px)");
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

        const aboutObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                }
            });

            const visibleCount = aboutSteps.filter((step) => step.classList.contains("is-visible")).length;
            setAboutProgress(visibleCount);
        }, {
            rootMargin: "0px 0px -18% 0px",
            threshold: 0.35
        });

        aboutSteps.forEach((step) => aboutObserver.observe(step));
        setAboutProgress(0);
    }

    if (leadershipTitle || leadershipCards.length > 0) {
        let leadershipAnimated = false;

        const revealLeadership = () => {
            if (leadershipAnimated) {
                return;
            }

            leadershipAnimated = true;

            if (leadershipTitle) {
                leadershipTitle.classList.add("is-visible");
            }

            leadershipCards.forEach((card, index) => {
                window.setTimeout(() => {
                    card.classList.add("is-visible");
                }, index * 120);
            });
        };

        const leadershipObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    revealLeadership();
                }
            });
        }, {
            rootMargin: "0px 0px -20% 0px",
            threshold: 0.28
        });

        const leadershipSection = document.querySelector("#leadership");

        if (leadershipSection) {
            leadershipObserver.observe(leadershipSection);
        }
    }

    const syncLeadershipToggleLabel = (card, isExpanded) => {
        const toggle = card.querySelector("[data-leadership-toggle]");

        if (!toggle) {
            return;
        }

        toggle.setAttribute("aria-expanded", String(isExpanded));
        toggle.textContent = isExpanded ? "Hide details" : "Expand details";
    };

    const collapseLeadershipCards = (exceptCard = null) => {
        leadershipCards.forEach((card) => {
            const shouldStayOpen = exceptCard && card === exceptCard;
            const isExpanded = shouldStayOpen && card.classList.contains("is-expanded");

            if (!shouldStayOpen) {
                card.classList.remove("is-expanded");
                syncLeadershipToggleLabel(card, false);
                return;
            }

            syncLeadershipToggleLabel(card, isExpanded);
        });
    };

    const setLeadershipCardExpanded = (card, isExpanded) => {
        card.classList.toggle("is-expanded", isExpanded);
        syncLeadershipToggleLabel(card, isExpanded);
    };

    const syncLeadershipMode = () => {
        if (leadershipMobileQuery.matches) {
            collapseLeadershipCards();
            return;
        }

        leadershipCards.forEach((card) => {
            card.classList.remove("is-expanded");
            syncLeadershipToggleLabel(card, false);
        });
    };

    leadershipToggles.forEach((toggle) => {
        toggle.addEventListener("click", () => {
            const card = toggle.closest("[data-leadership-card]");

            if (!card || !leadershipMobileQuery.matches) {
                return;
            }

            const shouldExpand = !card.classList.contains("is-expanded");

            collapseLeadershipCards(card);
            setLeadershipCardExpanded(card, shouldExpand);
        });
    });

    if (typeof leadershipMobileQuery.addEventListener === "function") {
        leadershipMobileQuery.addEventListener("change", syncLeadershipMode);
    } else if (typeof leadershipMobileQuery.addListener === "function") {
        leadershipMobileQuery.addListener(syncLeadershipMode);
    }

    syncLeadershipMode();

    const getSelectedRadio = () => radios.find((radio) => radio.checked) || radios[0];

    const moveGlider = (navItemOrRadio) => {
        const navItem = navItemOrRadio && navItemOrRadio.label ? navItemOrRadio : navItemsByTarget.get(navItemOrRadio?.dataset?.target) || navItemsByTarget.get(navItemOrRadio?.target) || null;
        const label = navItem?.label;
        const theme = sectionThemes[navItem?.target] || sectionThemes["#home"];

        if (!label) {
            return;
        }

        glider.style.width = `${label.offsetWidth}px`;
        glider.style.transform = `translateX(${label.offsetLeft}px)`;
        glider.style.background = theme.background;
        glider.style.boxShadow = theme.shadow;
    };

    const scrollToTarget = (target) => {
        const targetElement = document.querySelector(target);

        if (!targetElement) {
            return;
        }

        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
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

    const sectionObserver = new IntersectionObserver((entries) => {
        const activeEntry = entries
            .filter((entry) => entry.isIntersecting)
            .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

        if (!activeEntry) {
            return;
        }

        queueNavUpdate(`#${activeEntry.target.id}`);
    }, {
        rootMargin: "-28% 0px -42% 0px",
        threshold: [0.2, 0.45, 0.65]
    });

    radios.forEach((radio) => {
        const targetSection = document.querySelector(radio.dataset.target || "");

        if (targetSection) {
            sectionObserver.observe(targetSection);
        }
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
    window.addEventListener("resize", scheduleLayoutSync);
    window.addEventListener("load", syncFromHash, { once: true });

    scheduleLayoutSync();
});
