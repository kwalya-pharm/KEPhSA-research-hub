(() => {
    const API_URL = "https://script.google.com/macros/s/AKfycbzYU-YreXi3OVdE4v5dLLvEFAo_vzmgH_aGtp4AihuWpzMZBWKOXyox7Ojv35C2YAAN/exec";
    const DEFAULT_IMAGE = "media/logo.png";
    const container = document.getElementById("events-container");

    if (!container) {
        return;
    }

    const escapeHtml = (value) => String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");

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

    const getImageSrc = (event) => {
        const rawValue = String(event?.Image || event?.image || "").trim();
        if (!rawValue) {
            return DEFAULT_IMAGE;
        }

        if (/^https?:\/\//i.test(rawValue)) {
            return rawValue;
        }

        const cleanedValue = rawValue.replace(/^\.\//, "").replace(/^\/+/, "");
        const hasLocalPrefix = cleanedValue.startsWith("media/events/");
        return hasLocalPrefix ? cleanedValue : `media/events/${cleanedValue}`;
    };

    const formatMeta = (event) => {
        const values = [event?.Date, event?.Time, event?.Venue].filter(Boolean);
        return values.join(" • ");
    };

    const createEventCard = (event) => {
        const article = document.createElement("article");
        article.className = "event-card image-card image-card-large";
        article.innerHTML = `
            <div class="image-card-bg" aria-hidden="true"></div>
            <div class="image-card-overlay" aria-hidden="true"></div>
            <div class="event-image-wrap">
                <img class="event-image" src="${getImageSrc(event)}" alt="${escapeHtml(event?.Title || "Upcoming event")}" loading="lazy">
            </div>
            <div class="image-card-content">
                <div class="image-card-icon">📅</div>
                <h3>${escapeHtml(event?.Title || "Upcoming event")}</h3>
                <p class="event-meta">${escapeHtml(formatMeta(event) || "More details coming soon")}</p>
                <p>${escapeHtml(event?.Description || "Stay tuned for updates from the KEPhSA community.")}</p>
                <a href="#conferences" class="image-card-btn">View Event</a>
            </div>
        `;

        const image = article.querySelector(".event-image");
        image?.addEventListener("error", () => {
            image.src = DEFAULT_IMAGE;
        });

        return article;
    };

    const renderSkeleton = () => {
        container.innerHTML = "";
        const skeletons = Array.from({ length: 2 }, (_, index) => {
            const card = document.createElement("div");
            card.className = "event-skeleton";
            card.setAttribute("aria-hidden", "true");
            card.innerHTML = `
                <div class="event-skeleton-visual"></div>
                <div class="event-skeleton-line"></div>
                <div class="event-skeleton-line short"></div>
                <div class="event-skeleton-line"></div>
            `;
            return card;
        });

        container.append(...skeletons);
    };

    const renderEvents = (events) => {
        const normalized = normalizeEventsPayload(events).filter(Boolean);
        container.innerHTML = "";

        if (!normalized.length) {
            const emptyState = document.createElement("div");
            emptyState.className = "event-empty";
            emptyState.innerHTML = `
                <h3>No events available right now</h3>
                <p>New opportunities and gatherings will appear here soon.</p>
            `;
            container.appendChild(emptyState);
            return;
        }

        const fragment = document.createDocumentFragment();
        normalized.forEach((event) => {
            fragment.appendChild(createEventCard(event));
        });

        container.appendChild(fragment);
    };

    const loadEvents = async () => {
        renderSkeleton();

        if (Array.isArray(window.__KEPHSA_EVENTS_DATA__)) {
            renderEvents(window.__KEPHSA_EVENTS_DATA__);
            return;
        }

        if (window.__KEPHSA_EVENTS_PROMISE__) {
            const events = await window.__KEPHSA_EVENTS_PROMISE__;
            renderEvents(events);
            return;
        }

        window.__KEPHSA_EVENTS_PROMISE__ = fetch(API_URL, { cache: "no-store" })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Events request failed with status ${response.status}`);
                }
                return response.json();
            })
            .then((payload) => {
                const events = normalizeEventsPayload(payload);
                window.__KEPHSA_EVENTS_DATA__ = events;
                return events;
            })
            .catch(() => {
                window.__KEPHSA_EVENTS_DATA__ = [];
                return [];
            });

        const events = await window.__KEPHSA_EVENTS_PROMISE__;
        renderEvents(events);
    };

    loadEvents();
})();