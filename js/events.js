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

    const getDriveFileId = (value) => {
        if (!value) {
            return "";
        }

        const rawValue = String(value || "").split(",")[0].trim();
        if (!rawValue) {
            return "";
        }

        const directIdMatch = rawValue.match(/^[A-Za-z0-9_-]{10,}$/);
        if (directIdMatch) {
            return directIdMatch[0];
        }

        const linkMatch = rawValue.match(/(?:\/d\/|id=)([A-Za-z0-9_-]{10,})/i);
        if (linkMatch && linkMatch[1]) {
            return linkMatch[1];
        }

        return "";
    };

    const resolveEventImageUrl = (value) => {
        const rawValue = String(value ?? "").trim();

        if (!rawValue) {
            return "";
        }

        if (/^https?:\/\//i.test(rawValue)) {
            return rawValue;
        }

        const fileId = getDriveFileId(rawValue);
        if (fileId) {
            return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
        }

        const cleanedValue = rawValue.replace(/^\.\//, "").replace(/^\/+/, "");
        const hasLocalPrefix = cleanedValue.startsWith("media/events/");
        return hasLocalPrefix ? cleanedValue : `media/events/${cleanedValue}`;
    };

    const getImageSrc = (event) => {
        const resolvedValue = resolveEventImageUrl(event?.Image || event?.image || "");
        return resolvedValue || DEFAULT_IMAGE;
    };

    const formatMeta = (event) => {
        const values = [event?.Date, event?.Time, event?.Venue].filter(Boolean);
        return values.join(" • ");
    };

    const createEventCard = (event) => {
        const article = document.createElement("article");
        article.className = "event-card";

        const title = event?.Title || "Upcoming event";
        const description = event?.Description || "Stay tuned for updates from the KEPhSA community.";
        const meta = formatMeta(event) || "More details coming soon";
        const imageSrc = getImageSrc(event);

        article.innerHTML = `
            <div class="event-media" aria-label="${escapeHtml(title)}">
                <img class="event-image" src="${imageSrc}" alt="${escapeHtml(title)}" loading="lazy" decoding="async">
            </div>
            <div class="event-copy">
                <p class="event-meta">${escapeHtml(meta)}</p>
                <h3>${escapeHtml(title)}</h3>
                <p class="event-description">${escapeHtml(description)}</p>
                <a href="#conferences" class="event-read-more">Read more</a>
            </div>
        `;

        const image = article.querySelector(".event-image");
        const markLoaded = async () => {
            try {
                await image.decode();
            } catch (error) {
                // Ignore decode failures, still show the image.
            }
            image.classList.add("loaded");
        };

        image?.addEventListener("load", markLoaded);
        if (image?.complete && image?.naturalWidth) {
            markLoaded();
        }

        image?.addEventListener("error", () => {
            if (image.src !== DEFAULT_IMAGE) {
                image.src = DEFAULT_IMAGE;
            }
        });

        const descriptionEl = article.querySelector(".event-description");
        const readMoreEl = article.querySelector(".event-read-more");
        readMoreEl?.addEventListener("click", (event) => {
            event.preventDefault();
            const isExpanded = descriptionEl?.classList.toggle("is-expanded");
            if (readMoreEl) {
                readMoreEl.textContent = isExpanded ? "Show less" : "Read more";
            }
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

    const parseEventDate = (event) => {
        const raw = String(event?.Date || event?.date || "").trim();
        const parsed = Date.parse(raw);
        return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
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

        normalized.sort((a, b) => parseEventDate(a) - parseEventDate(b));

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