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

        // Save full list for pagination and future re-renders
        window.__KEPHSA_EVENTS_DATA__ = normalized;

        // Pagination state
        let pageSize = window.matchMedia('(max-width: 560px)').matches ? 1 : 2;
        let currentPage = 0;
        const totalPages = () => Math.max(1, Math.ceil(window.__KEPHSA_EVENTS_DATA__.length / pageSize));

        // Ensure paginated layout class is applied
        container.classList.add('events-paginated');

        // Create pagination controls
        let paginationEl = document.querySelector('.events-pagination');
        if (!paginationEl) {
            paginationEl = document.createElement('div');
            paginationEl.className = 'events-pagination';
            paginationEl.innerHTML = `
                <button type="button" class="events-prev" aria-label="Previous events">Prev</button>
                <div class="events-page-indicator" aria-hidden="true"></div>
                <button type="button" class="events-next" aria-label="Next events">Next</button>
            `;
            container.after(paginationEl);
        }

        const prevBtn = paginationEl.querySelector('.events-prev');
        const nextBtn = paginationEl.querySelector('.events-next');
        const pageIndicator = paginationEl.querySelector('.events-page-indicator');

        const renderPage = (pageIndex) => {
            const items = window.__KEPHSA_EVENTS_DATA__ || [];
            pageSize = window.matchMedia('(max-width: 560px)').matches ? 1 : 2;
            const pages = totalPages();
            currentPage = Math.max(0, Math.min(pageIndex, pages - 1));

            container.innerHTML = '';
            const start = currentPage * pageSize;
            const fragment = document.createDocumentFragment();
            const pageItems = items.slice(start, start + pageSize);
            pageItems.forEach(ev => fragment.appendChild(createEventCard(ev)));
            container.appendChild(fragment);

            // Update controls
            if (pages <= 1) {
                paginationEl.style.display = 'none';
            } else {
                paginationEl.style.display = '';
                prevBtn.disabled = currentPage === 0;
                nextBtn.disabled = currentPage === (pages - 1);
                pageIndicator.textContent = `${currentPage + 1} / ${pages}`;
            }
        };

        prevBtn.addEventListener('click', () => renderPage(currentPage - 1));
        nextBtn.addEventListener('click', () => renderPage(currentPage + 1));

        // Keyboard navigation for desktop
        const onKey = (e) => {
            if (e.key === 'ArrowLeft') renderPage(currentPage - 1);
            if (e.key === 'ArrowRight') renderPage(currentPage + 1);
        };
        window.addEventListener('keydown', onKey);

        // Touch / swipe support for mobile
        let touchStartX = null;
        container.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
        container.addEventListener('touchend', (e) => {
            if (touchStartX === null) return;
            const dx = (e.changedTouches[0].clientX - touchStartX);
            if (Math.abs(dx) > 40) {
                if (dx < 0) renderPage(currentPage + 1);
                else renderPage(currentPage - 1);
            }
            touchStartX = null;
        });

        // Recalculate on resize (switch between 1 and 2 per page)
        let resizeTimer = null;
        const onResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const oldSize = pageSize;
                pageSize = window.matchMedia('(max-width: 560px)').matches ? 1 : 2;
                // If page size changed, clamp currentPage and re-render
                if (oldSize !== pageSize) {
                    renderPage(0);
                } else {
                    renderPage(currentPage);
                }
            }, 120);
        };
        window.addEventListener('resize', onResize);

        // Initial render
        renderPage(0);
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