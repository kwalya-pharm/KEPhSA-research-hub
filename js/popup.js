(() => {
    const STORAGE_KEY = "kephsa-popup-dismissed";
    const ALUMNI_API_URL = "https://script.google.com/macros/s/AKfycbxhGe5LCYuDof4ChP1px7CDtkRywT18uWexbZBfvYGpnTZ4fBGzQ6RU4Hyvd-8AyPTV/exec";
    const EVENTS_API_URL = "https://script.google.com/macros/s/AKfycbyVHUlybyAt8RdE2qu1iWH5_ff46jWWCH7hJg5l50K6XKaGQj3nHdO9TpYw-t0Vr6f9dQ/exec";

    const slugify = (value) => String(value || "")
        .trim()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/(^-|-$)/g, "")
        .toLowerCase();

    const normalizeValue = (person, keys, fallback = "") => {
        for (const key of keys) {
            const value = person?.[key];
            if (value !== undefined && value !== null && String(value).trim() !== "") {
                return value;
            }
        }
        return fallback;
    };

    const normalizeAlumniPayload = (payload) => {
        if (Array.isArray(payload)) {
            return payload;
        }

        if (payload && typeof payload === "object") {
            for (const key of ["alumni", "data", "records", "items"]) {
                if (Array.isArray(payload[key])) {
                    return payload[key];
                }
            }
        }

        return [];
    };

    const getAlumniData = async () => {
        if (Array.isArray(window.__KEPHSA_ALUMNI_DATA__)) {
            return window.__KEPHSA_ALUMNI_DATA__;
        }

        if (window.__KEPHSA_ALUMNI_LOAD_PROMISE__) {
            return window.__KEPHSA_ALUMNI_LOAD_PROMISE__;
        }

        window.__KEPHSA_ALUMNI_LOAD_PROMISE__ = fetch(ALUMNI_API_URL)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`);
                }
                return response.json();
            })
            .then((payload) => {
                const alumni = normalizeAlumniPayload(payload);
                window.__KEPHSA_ALUMNI_DATA__ = alumni;
                return alumni;
            })
            .catch(() => {
                window.__KEPHSA_ALUMNI_DATA__ = [];
                return [];
            });

        return window.__KEPHSA_ALUMNI_LOAD_PROMISE__;
    };

    const normalizeEventsPayload = (payload) => {
        if (Array.isArray(payload)) {
            return payload;
        }

        if (payload && typeof payload === "object") {
            for (const key of ["events", "data", "records", "items"]) {
                if (Array.isArray(payload[key])) {
                    return payload[key];
                }
            }
        }

        return [];
    };

    const getEventImageSrc = (event) => {
        const rawValue = String(event?.Image || event?.image || "").trim();
        if (!rawValue) {
            return "media/logo.png";
        }

        if (/^https?:\/\//i.test(rawValue)) {
            return rawValue;
        }

        const cleanedValue = rawValue.replace(/^\.\//, "").replace(/^\/+/, "");
        const hasLocalPrefix = cleanedValue.startsWith("media/events/");
        return hasLocalPrefix ? cleanedValue : `media/events/${cleanedValue}`;
    };

    const getEventData = async () => {
        if (Array.isArray(window.__KEPHSA_EVENTS_DATA__)) {
            return window.__KEPHSA_EVENTS_DATA__;
        }

        if (window.__KEPHSA_EVENTS_LOAD_PROMISE__) {
            return window.__KEPHSA_EVENTS_LOAD_PROMISE__;
        }

        window.__KEPHSA_EVENTS_LOAD_PROMISE__ = fetch(EVENTS_API_URL, { cache: "no-store" })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Events request failed with status ${response.status}`);
                }
                return response.json();
            })
            .then((payload) => {
                const events = normalizeEventsPayload(payload)
                    .filter(Boolean)
                    .slice(0, 3)
                    .map((event) => ({
                        title: event?.Title || event?.title || "Upcoming event",
                        description: event?.Description || event?.description || event?.Venue || event?.Venue || "More details coming soon",
                        image: event?.Image || event?.image || ""
                    }));
                window.__KEPHSA_EVENTS_DATA__ = events;
                return events;
            })
            .catch(() => {
                window.__KEPHSA_EVENTS_DATA__ = [];
                return [];
            });

        return window.__KEPHSA_EVENTS_LOAD_PROMISE__;
    };

    const buildImageCandidates = (person, value) => {
        const candidates = [];
        const rawValue = String(value || "").trim();
        const personName = normalizeValue(person, ["name"], "");
        const firstName = personName.split(/\s+/).filter(Boolean)[0] || personName;
        const slug = slugify(firstName);

        if (slug) {
            const baseName = `media/alumni/${slug}`;
            [".jpg", ".jpeg", ".webp", ".png"].forEach((extension) => {
                candidates.push(`${baseName}${extension}`);
            });
        }

        if (/^https?:\/\//i.test(rawValue)) {
            candidates.push(rawValue);
        } else if (rawValue) {
            const cleanedValue = rawValue.replace(/^\.\//, "").replace(/^\/+/, "");
            const withoutHash = cleanedValue.split("#")[0].split("?")[0];
            if (withoutHash) {
                candidates.push(withoutHash);
            }
        }

        return [...new Set(candidates.filter(Boolean))];
    };

    const resolveSpotlightImage = (person) => {
        return new Promise((resolve) => {
            const candidates = buildImageCandidates(person, normalizeValue(person, ["portrait", "image", "avatar"], ""));
            if (!candidates.length) {
                resolve("");
                return;
            }

            let attempt = 0;
            const tryNext = () => {
                if (attempt >= candidates.length) {
                    resolve("");
                    return;
                }

                const candidate = candidates[attempt++];
                const image = new Image();
                image.onload = () => resolve(candidate);
                image.onerror = () => tryNext();
                image.src = candidate;
            };

            tryNext();
        });
    };

    const fillPopupContent = async (root, spotlight, events) => {
        const imageEl = root.querySelector("#popup-image");
        const nameEl = root.querySelector("#popup-spotlight-name");
        const roleEl = root.querySelector("#popup-spotlight-role");
        const quoteEl = root.querySelector("#popup-spotlight-quote");
        const eventsListEl = root.querySelector(".popup-events-list");

        if (spotlight) {
            const spotlightName = normalizeValue(spotlight, ["name"], "Alumni Spotlight");
            const spotlightRole = normalizeValue(spotlight, ["currentRole", "role", "position"], "KEPhSA member");
            const spotlightQuote = normalizeValue(spotlight, ["bio", "about", "quote"], "Research grows through connection and mentorship.");
            const spotlightImage = await resolveSpotlightImage(spotlight);

            if (imageEl) {
                imageEl.src = spotlightImage;
                imageEl.alt = spotlightName;
                imageEl.style.display = spotlightImage ? "block" : "none";
            }

            if (nameEl) {
                nameEl.textContent = spotlightName;
            }
            if (roleEl) {
                roleEl.textContent = spotlightRole;
            }
            if (quoteEl) {
                const quoteText = String(spotlightQuote).trim();
                quoteEl.textContent = `“${quoteText.slice(0, 140)}${quoteText.length > 140 ? "…" : ""}”`;
            }
        } else {
            if (imageEl) {
                imageEl.removeAttribute("src");
                imageEl.style.display = "none";
            }
            if (nameEl) {
                nameEl.textContent = "No alumni spotlight yet";
            }
            if (roleEl) {
                roleEl.textContent = "Updates will appear here soon";
            }
            if (quoteEl) {
                quoteEl.textContent = "The alumni feed is currently unavailable.";
            }
        }

        if (eventsListEl) {
            const eventMarkup = (events && events.length ? events : [{ title: "No upcoming updates", description: "Check back soon for new opportunities.", image: "" }])
                .map((event) => `
                    <li class="popup-event-item">
                        <img class="popup-event-image" src="${getEventImageSrc(event)}" alt="${String(event.title || "Upcoming event").replace(/"/g, "&quot;")}" onerror="this.src='media/logo.png'">
                        <div class="popup-event-copy">
                            <strong>${String(event.title || "Upcoming event")}</strong>
                            <span>${String(event.description || "More details coming soon")}</span>
                        </div>
                    </li>
                `)
                .join("");

            eventsListEl.innerHTML = eventMarkup;
        }
    };

    const createPopup = () => {
        if (document.getElementById("kephsa-popup-root")) {
            return document.getElementById("kephsa-popup-root");
        }

        const root = document.createElement("div");
        root.id = "kephsa-popup-root";
        root.setAttribute("aria-hidden", "true");
        root.innerHTML = `
            <div class="popup-fab" aria-label="Open updates">
                <span>✨</span>
            </div>
            <div class="popup-overlay" id="kephsa-popup-overlay">
                <div class="popup-modal" role="dialog" aria-modal="true" aria-labelledby="kephsa-popup-title">
                    <button class="popup-close" type="button" aria-label="Close popup">×</button>
                    <div class="popup-header">
                        <div>
                            <p class="popup-kicker">KEPhSA Pulse</p>
                            <h2 id="kephsa-popup-title">Fresh updates for the research community</h2>
                        </div>
                        <div class="popup-badge">Live</div>
                    </div>

                    <div class="popup-callout">
                        <strong>Elevate your brand with a professional website from <a href="https://wa.me/254748052811" target="_blank" rel="noopener noreferrer">+254748052811</a> — PharmaSmart Technologies.</strong>
                        <span>We also build efficient pharmacy management systems. Stay informed with the latest health news at <a href="https://kenyanpharmacistsnetwork.co.ke" target="_blank" rel="noopener noreferrer">kenyanpharmacistsnetwork.co.ke</a>.</span>
                    </div>

                    <div class="popup-shell">
                        <section class="popup-card popup-card-spotlight">
                            <div class="popup-card-title-row">
                                <h3>Alumni spotlight</h3>
                                <span>Live</span>
                            </div>
                            <div class="popup-spotlight">
                                <img class="popup-image" id="popup-image" alt="">
                                <div class="popup-spotlight-copy">
                                    <h4 id="popup-spotlight-name">Loading spotlight…</h4>
                                    <p id="popup-spotlight-role">Gathering the latest alumni profile</p>
                                    <blockquote id="popup-spotlight-quote">Please wait while the latest community update is loaded.</blockquote>
                                </div>
                            </div>
                        </section>

                        <section class="popup-card popup-card-events">
                            <div class="popup-card-title-row">
                                <h3>Upcoming events</h3>
                                <span>From the site</span>
                            </div>
                            <ul class="popup-events-list">
                                <li>
                                    <strong>Loading updates…</strong>
                                    <span>Checking the latest events from the page.</span>
                                </li>
                            </ul>
                        </section>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(root);
        return root;
    };

    const showPopup = async (root) => {
        const overlay = root.querySelector(".popup-overlay");
        const fab = root.querySelector(".popup-fab");

        overlay.classList.add("is-open");
        root.setAttribute("aria-hidden", "false");
        document.body.classList.add("popup-open");

        if (fab) {
            fab.classList.add("is-hidden");
        }

        const [alumniPeople, events] = await Promise.all([
            getAlumniData(),
            getEventData()
        ]);

        const spotlight = Array.isArray(alumniPeople) && alumniPeople.length
            ? alumniPeople[Math.floor(Math.random() * alumniPeople.length)]
            : null;
        await fillPopupContent(root, spotlight, events);

        const close = () => {
            overlay.classList.remove("is-open");
            root.setAttribute("aria-hidden", "true");
            document.body.classList.remove("popup-open");
            if (fab) {
                fab.classList.remove("is-hidden");
            }
        };

        root.querySelector(".popup-close")?.addEventListener("click", close);
        overlay.onclick = (event) => {
            if (event.target === overlay) {
                close();
            }
        };
        document.onkeydown = (event) => {
            if (event.key === "Escape") {
                close();
            }
        };
    };

    const init = () => {
        const root = createPopup();
        const fab = root.querySelector(".popup-fab");

        fab?.addEventListener("click", () => showPopup(root));

        try {
            if (!window.localStorage.getItem(STORAGE_KEY)) {
                window.setTimeout(() => {
                    showPopup(root);
                }, 1400);
            }
        } catch (error) {
            showPopup(root);
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
