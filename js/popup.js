(() => {
    const STORAGE_KEY = "kephsa-popup-dismissed";
    const STUDENTS_API_URL = "https://script.google.com/macros/s/AKfycbwN5F5d_nDGaPavl6FgiigJrJY1VAoEnYOu9QIMS66Ge0WINuPfXRRHIBUqN3z40vbc1w/exec";
    const EVENTS_API_URL = "https://script.google.com/macros/s/AKfycbzYU-YreXi3OVdE4v5dLLvEFAo_vzmgH_aGtp4AihuWpzMZBWKOXyox7Ojv35C2YAAN/exec";

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

    const normalizeStudentsPayload = (payload) => {
        if (Array.isArray(payload)) {
            return payload;
        }

        if (payload && typeof payload === "object") {
            for (const key of ["students", "data", "records", "items"]) {
                if (Array.isArray(payload[key])) {
                    return payload[key];
                }
            }
        }

        return [];
    };

    const resolvePhotoUrl = (value = "") => {
        const raw = String(value || "").trim();

        if (!raw) {
            return "";
        }

        if (/^https?:\/\//i.test(raw)) {
            if (/drive\.google\.com/i.test(raw)) {
                const match = raw.match(/(?:^|[?&])id=([^&]+)/i) || raw.match(/\/file\/d\/([^/]+)/i);
                if (match?.[1]) {
                    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
                }
            }

            return raw;
        }

        const normalized = raw.replace(/^\.?\//, "");
        const match = normalized.match(/([A-Za-z0-9_-]{10,})/);
        if (match?.[1] && !normalized.includes(" ")) {
            return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
        }

        return raw;
    };

    const getStudentField = (student, keys, fallback = "") => {
        for (const key of keys) {
            if (!key) {
                continue;
            }

            const value = student?.[key];
            if (value !== undefined && value !== null) {
                const text = String(value).trim();
                if (text) {
                    return text;
                }
            }
        }

        return fallback;
    };

    const normalizeStudent = (student) => ({
        name: getStudentField(student, ["name", "Full Name", "full name", "Student Name", "student_name"], "Student spotlight"),
        photo: resolvePhotoUrl(getStudentField(student, ["photo", "Upload your photo", "Photo", "Profile Photo", "image", "Image"], "")),
        year: getStudentField(student, ["year", "Year of Study", "Year", "Study Year"], "Student member"),
        interests: getStudentField(student, ["interests", "Research Interests", "Research Interest", "Areas of Interest"], "More details coming soon"),
        career: getStudentField(student, ["career", "Career Ambitions", "Career", "Career Goals"], "")
    });

    const getStudentData = async () => {
        if (Array.isArray(window.__KEPHSA_STUDENTS_DATA__)) {
            return window.__KEPHSA_STUDENTS_DATA__;
        }

        if (window.__KEPHSA_STUDENTS_LOAD_PROMISE__) {
            return window.__KEPHSA_STUDENTS_LOAD_PROMISE__;
        }

        window.__KEPHSA_STUDENTS_LOAD_PROMISE__ = fetch(STUDENTS_API_URL, { cache: "no-store" })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`);
                }
                return response.json();
            })
            .then((payload) => {
                const students = normalizeStudentsPayload(payload).map(normalizeStudent);
                window.__KEPHSA_STUDENTS_DATA__ = students;
                return students;
            })
            .catch(() => {
                window.__KEPHSA_STUDENTS_DATA__ = [];
                return [];
            });

        return window.__KEPHSA_STUDENTS_LOAD_PROMISE__;
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

    const getEventField = (event, keys, fallback = "") => {
        for (const key of keys) {
            if (!key) {
                continue;
            }

            const value = event?.[key];
            if (value !== undefined && value !== null) {
                const text = String(value).trim();
                if (text) {
                    return text;
                }
            }
        }

        return fallback;
    };

    const getEventImageSrc = (event) => {
        const rawValue = getEventField(event, ["Image", "image", "imageUrl", "ImageUrl"], "").trim();
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
                        title: getEventField(event, ["Title", "title", "name"], "Upcoming event"),
                        description: getEventField(event, ["Description", "description", "Venue", "venue"], "More details coming soon"),
                        image: getEventField(event, ["Image", "image", "imageUrl", "ImageUrl"], "")
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

    const resolveSpotlightImage = async (student) => {
        return student.photo || "";
    };

    const fillPopupContent = async (root, student, events) => {
        const imageEl = root.querySelector("#popup-image");
        const nameEl = root.querySelector("#popup-spotlight-name");
        const roleEl = root.querySelector("#popup-spotlight-role");
        const quoteEl = root.querySelector("#popup-spotlight-quote");
        const eventsListEl = root.querySelector(".popup-events-list");

        if (student) {
            imageEl.src = student.photo || "media/logo.jpeg";
            imageEl.alt = student.name || "Student spotlight";
            imageEl.style.display = "block";
            nameEl.textContent = student.name || "Student spotlight";
            roleEl.textContent = student.year || "Student member";
            quoteEl.textContent = student.interests
                ? `Research Interests: ${student.interests}`
                : "More details coming soon.";
        } else {
            imageEl.style.display = "none";
            nameEl.textContent = "No student profiles";
            roleEl.textContent = "";
            quoteEl.textContent = "";
        }

        if (eventsListEl) {
            const html = (events.length ? events : [{
                title: "No upcoming updates",
                description: "Check back later."
            }])
                .map((event) => `
                    <li class="popup-event-item">
                        <img class="popup-event-image" src="${getEventImageSrc(event)}" alt="${event.title}">
                        <div class="popup-event-copy">
                            <strong>${event.title}</strong>
                            <span>${event.description}</span>
                        </div>
                    </li>
                `)
                .join("");

            eventsListEl.innerHTML = html;
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
                                <h3>Student Spotlight</h3>
                                <span>Live</span>
                            </div>
                            <div class="popup-spotlight">
                                <img class="popup-image" id="popup-image" alt="">
                                <div class="popup-spotlight-copy">
                                    <h4 id="popup-spotlight-name">Loading spotlight…</h4>
                                    <p id="popup-spotlight-role">Loading current student...</p>
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

        const [students, events] = await Promise.all([
            getStudentData(),
            getEventData()
        ]);

        const spotlight = students.length
            ? students[Math.floor(Math.random() * students.length)]
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
