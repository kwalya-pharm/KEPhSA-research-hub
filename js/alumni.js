(() => {
    const API_URL = "https://script.google.com/macros/s/AKfycbxhGe5LCYuDof4ChP1px7CDtkRywT18uWexbZBfvYGpnTZ4fBGzQ6RU4Hyvd-8AyPTV/exec";
    const alumniSection = document.getElementById("alumni");
    const portraitEl = document.getElementById("alumniPortrait");
    const graduationYearEl = document.getElementById("graduationYear");
    const nameEl = document.getElementById("alumniName");
    const roleEl = document.getElementById("currentRole");
    const organizationEl = document.getElementById("organization");
    const careerGoalEl = document.getElementById("careerGoal");
    const bioEl = document.getElementById("bio");
    const interestTagsEl = document.getElementById("interestTags");
    const projectListEl = document.getElementById("projectList");
    const publicationListEl = document.getElementById("publicationList");
    const thumbnailStripEl = document.getElementById("thumbnailStrip");
    const profileBtn = document.getElementById("profileBtn");
    const statsEls = Array.from(alumniSection?.querySelectorAll(".community-stats h3") || []);

    let alumniPeople = [];
    let currentIndex = 0;
    let autoplayTimer = null;
    let isPaused = false;
    let touchStartX = 0;
    let touchEndX = 0;
    let thumbnailObserver = null;
    let renderedThumbnailCount = 0;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const defaultPortrait = "media/alumni/default.jpg";
    const getThumbnailBatchSize = () => (window.matchMedia("(max-width: 640px)").matches ? 8 : 12);

    const slugify = (value) => String(value || "")
        .trim()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/(^-|-$)/g, "")
        .toLowerCase();

    const convertGoogleDriveLink = (url) => {
        if (!url) return "";

        url = String(url).trim();

        // Already a direct Google Drive image URL
        if (url.includes("uc?export=view&id=")) {
            return url;
        }

        // Convert Google Drive sharing link: /d/<id>/
        const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (match) {
            return `https://drive.google.com/uc?export=view&id=${match[1]}`;
        }

        // Handle links with ?id=
        const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (idMatch) {
            return `https://drive.google.com/uc?export=view&id=${idMatch[1]}`;
        }

        // Support Google Photos short share links
        const photosMatch = url.match(/https?:\/\/photos\.app\.goo\.gl\/([A-Za-z0-9_-]+)/i);
        if (photosMatch) {
            return `https://photos.app.goo.gl/${photosMatch[1]}`;
        }

        // Return any other URL unchanged
        return url;
    };

    const buildImageCandidates = (person, value) => {
        const candidates = [];
        const rawValue = String(value || "").trim();
        const normalizedValue = convertGoogleDriveLink(rawValue);

        const personName = normalizeValue(person, ["name"], "");
        const firstName = personName.split(/\s+/).filter(Boolean)[0] || personName;
        const nameSlug = slugify(firstName);

        // Use normalized value (converted Drive link when applicable)
        const checkValue = normalizedValue || rawValue;

        // If backend provided a full data/blob URL, use it first
        if (/^data:|^blob:/i.test(checkValue)) {
            candidates.push(checkValue);
            return [...new Set(candidates.filter(Boolean))];
        }

        // If backend provided an absolute or protocol-relative URL, prefer it
        if (/^https?:\/\//i.test(checkValue) || /^\/\//.test(checkValue)) {
            candidates.push(checkValue);
            return [...new Set(candidates.filter(Boolean))];
        }

        // If backend provided a relative path or filename, prefer the exact value first
        if (checkValue) {
            const cleanedValue = checkValue.replace(/^\.\//, "").replace(/^\/+/, "");
            const withoutHash = cleanedValue.split("#")[0].split("?")[0];

            if (withoutHash) {
                candidates.push(withoutHash);

                const hasSupportedExtension = /\.(jpe?g|webp|png)$/i.test(withoutHash);
                const baseName = hasSupportedExtension
                    ? withoutHash.replace(/\.(jpe?g|webp|png)$/i, "")
                    : withoutHash;

                [".jpg", ".jpeg", ".webp", ".png"].forEach((extension) => {
                    candidates.push(`${baseName}${extension}`);
                });
            }
        }

        // Do not force local media/alumni paths — prefer backend-provided URLs or explicit paths.

        return [...new Set(candidates.filter(Boolean))];
    };

    const loadImageWithFallback = (person, src, onSuccess, onError) => {
        const candidates = buildImageCandidates(person, src);
        let attempt = 0;

        const tryNext = () => {
            if (attempt >= candidates.length) {
                onError?.();
                return;
            }

            const candidate = candidates[attempt++];
            const image = new Image();
            image.decoding = "async";
            image.onload = () => onSuccess?.(candidate);
            image.onerror = () => tryNext();
            image.src = candidate;
        };

        tryNext();
    };

    const normalizeValue = (person, keys, fallback = "") => {
        for (const key of keys) {
            const value = person?.[key];
            if (value !== undefined && value !== null && String(value).trim() !== "") {
                return value;
            }
        }
        return fallback;
    };

    const normalizeAlumniData = (payload) => {
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

    const clampIndex = (index) => {
        if (!alumniPeople.length) {
            return 0;
        }
        return ((index % alumniPeople.length) + alumniPeople.length) % alumniPeople.length;
    };

    const renderTags = (person) => {
        if (!interestTagsEl) {
            return;
        }

        const tags = Array.isArray(person?.interests) ? person.interests.filter(Boolean) : [];
        interestTagsEl.innerHTML = tags.length
            ? tags.slice(0, 8).map((tag) => `<span class="tag">${String(tag)}</span>`).join("")
            : '<span class="tag">Research</span>';
    };

    const renderList = (container, items, fallbackText) => {
        if (!container) {
            return;
        }

        const listItems = Array.isArray(items) ? items.filter(Boolean) : [];
        container.innerHTML = listItems.length
            ? listItems.map((item) => `<li>${String(item)}</li>`).join("")
            : `<li>${fallbackText}</li>`;
    };

    const setTextContent = (element, value) => {
        if (!element) {
            return;
        }

        element.classList.remove("is-visible");
        element.classList.add("is-transitioning");
        window.requestAnimationFrame(() => {
            element.textContent = value || "—";
            element.classList.remove("is-transitioning");
            element.classList.add("is-visible");
        });
    };

    const setImage = (person, src) => {
        if (!portraitEl) {
            return;
        }

        portraitEl.classList.remove("is-visible");
        portraitEl.onerror = null;
        portraitEl.style.opacity = "0";

        loadImageWithFallback(
            person,
            src,
            (resolvedSrc) => {
                portraitEl.src = resolvedSrc;
                portraitEl.alt = "Alumni portrait";
                portraitEl.style.opacity = "1";
                window.setTimeout(() => {
                    portraitEl.classList.add("is-visible");
                }, prefersReducedMotion ? 0 : window.matchMedia("(max-width: 640px)").matches ? 80 : 180);
            },
            () => {
                portraitEl.removeAttribute("src");
                portraitEl.alt = "No alumni portrait available";
                portraitEl.style.opacity = "0";
            }
        );
    };

    const updateActiveThumbnail = (index) => {
        if (!thumbnailStripEl) {
            return;
        }

        thumbnailStripEl.querySelectorAll(".thumb[data-index]").forEach((thumb) => {
            thumb.classList.toggle("active", Number(thumb.dataset.index || 0) === index);
        });
    };

    const ensureThumbnailImage = (thumb) => {
        if (!thumb) {
            return;
        }

        const img = thumb.querySelector("img");
        const index = Number(thumb.dataset.index || -1);
        const person = alumniPeople[index];

        if (!img || !person || img.dataset.loaded === "true") {
            return;
        }

        const portraitSrc = normalizeValue(person, ["portrait", "image", "avatar"], defaultPortrait);
        loadImageWithFallback(
            person,
            portraitSrc,
            (resolvedSrc) => {
                img.src = resolvedSrc;
                img.alt = String(person?.name || "Alumnus");
                img.dataset.loaded = "true";
            },
            () => {
                img.src = defaultPortrait;
                img.alt = "Default alumni portrait";
                img.dataset.loaded = "true";
            }
        );
    };

    const attachThumbnailObserver = () => {
        if (!thumbnailStripEl || typeof IntersectionObserver === "undefined") {
            return;
        }

        if (thumbnailObserver) {
            thumbnailObserver.disconnect();
        }

        thumbnailObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    ensureThumbnailImage(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: "220px 0px 220px 0px" });

        thumbnailStripEl.querySelectorAll(".thumb[data-index]").forEach((thumb) => {
            thumbnailObserver.observe(thumb);
        });
    };

    const renderProfile = (index) => {
        if (!alumniPeople.length) {
            return;
        }

        const safeIndex = clampIndex(index);
        const person = alumniPeople[safeIndex];
        currentIndex = safeIndex;

        const graduationLabel = normalizeValue(person, ["graduationYear", "graduation_year", "classYear"], "2024");
        const nameLabel = normalizeValue(person, ["name"], "Alumni Name");
        const roleLabel = normalizeValue(person, ["currentRole", "current_role", "role", "position"], "Alumnus");
        const organizationLabel = normalizeValue(person, ["organization", "currentOrganization", "currentOrganizationName", "institution"], "KEPhSA Research Hub");
        const careerLabel = normalizeValue(person, ["careerGoal", "careerAspiration", "careerAspirationGoal", "aspiration"], "Research and Impact");
        const bioLabel = normalizeValue(person, ["bio", "about"], "A valued member of the KEPhSA research community.");
        const portraitSrc = normalizeValue(person, ["portrait", "image", "avatar"], defaultPortrait);
        const profileLink = normalizeValue(person, ["linkedin", "scholar", "orcid", "profileLink", "profile", "link"], "#");
        const projects = Array.isArray(person?.researchProjects) ? person.researchProjects.filter(Boolean) : [];
        const publications = Array.isArray(person?.publications) ? person.publications.filter(Boolean) : [];

        setTextContent(graduationYearEl, graduationLabel ? `Class of ${graduationLabel}` : "Class of 2024");
        setTextContent(nameEl, nameLabel);
        setTextContent(roleEl, roleLabel);
        setTextContent(organizationEl, organizationLabel);
        setTextContent(careerGoalEl, careerLabel);
        setTextContent(bioEl, bioLabel);
        renderTags(person);
        renderList(projectListEl, projects, "No projects listed yet.");
        renderList(publicationListEl, publications.length ? publications : [], "No publications yet.");

        if (profileBtn) {
            profileBtn.href = profileLink || "#";
            profileBtn.target = profileLink && String(profileLink).startsWith("http") ? "_blank" : "_self";
        }

        setImage(person, portraitSrc);
        updateActiveThumbnail(safeIndex);
    };

    const buildThumbnails = () => {
        if (!thumbnailStripEl) {
            return;
        }

        thumbnailStripEl.innerHTML = "";
        renderedThumbnailCount = 0;

        const createThumbnailButton = (person, index) => {
            const thumb = document.createElement("button");
            thumb.className = `thumb${index === 0 ? " active" : ""}`;
            thumb.type = "button";
            thumb.dataset.index = String(index);
            thumb.setAttribute("aria-label", `Show ${String(person?.name || "Alumnus")}`);

            const thumbImage = document.createElement("img");
            thumbImage.alt = String(person?.name || "Alumnus");
            thumbImage.loading = "lazy";
            thumbImage.decoding = "async";
            thumbImage.dataset.loaded = "false";

            const thumbName = document.createElement("span");
            thumbName.textContent = String(person?.name || "Alumnus").split(" ")[0];

            thumb.appendChild(thumbImage);
            thumb.appendChild(thumbName);
            thumb.addEventListener("click", () => {
                showAlumni(Number(thumb.dataset.index || 0));
            });

            return thumb;
        };

        const initialBatchSize = getThumbnailBatchSize();
        const loadMoreButton = document.createElement("button");
        loadMoreButton.className = "thumb thumb-more";
        loadMoreButton.type = "button";
        loadMoreButton.textContent = "Show more";
        loadMoreButton.hidden = alumniPeople.length <= initialBatchSize;

        const renderNextBatch = () => {
            const fragment = document.createDocumentFragment();
            const batchSize = getThumbnailBatchSize();
            const endIndex = Math.min(alumniPeople.length, renderedThumbnailCount + batchSize);

            for (let index = renderedThumbnailCount; index < endIndex; index += 1) {
                const person = alumniPeople[index];
                fragment.appendChild(createThumbnailButton(person, index));
            }

            if (renderedThumbnailCount === 0) {
                thumbnailStripEl.appendChild(fragment);
            } else {
                thumbnailStripEl.insertBefore(fragment, loadMoreButton);
            }

            renderedThumbnailCount = endIndex;

            if (renderedThumbnailCount >= alumniPeople.length) {
                loadMoreButton.remove();
            } else {
                thumbnailStripEl.appendChild(loadMoreButton);
            }

            attachThumbnailObserver();
        };

        renderNextBatch();
        loadMoreButton.addEventListener("click", renderNextBatch);
    };

    const showAlumni = (index) => {
        const safeIndex = clampIndex(index);
        renderProfile(safeIndex);
        resetAutoplay();
    };

    const nextAlumni = () => showAlumni(currentIndex + 1);
    const previousAlumni = () => showAlumni(currentIndex - 1);

    const startAutoplay = () => {
        if (!alumniPeople.length || prefersReducedMotion || window.matchMedia("(max-width: 640px)").matches) {
            return;
        }

        clearInterval(autoplayTimer);
        autoplayTimer = window.setInterval(() => {
            if (!isPaused) {
                nextAlumni();
            }
        }, 7000);
    };

    const resetAutoplay = () => {
        clearInterval(autoplayTimer);
        startAutoplay();
    };

    const attachEvents = () => {
        if (!alumniSection) {
            return;
        }

        alumniSection.addEventListener("mouseenter", () => {
            isPaused = true;
            clearInterval(autoplayTimer);
        });

        alumniSection.addEventListener("mouseleave", () => {
            isPaused = false;
            startAutoplay();
        });

        window.addEventListener("keydown", (event) => {
            if (event.key === "ArrowRight") {
                event.preventDefault();
                nextAlumni();
            }

            if (event.key === "ArrowLeft") {
                event.preventDefault();
                previousAlumni();
            }
        });

        alumniSection.addEventListener("touchstart", (event) => {
            touchStartX = event.changedTouches[0].clientX;
        }, { passive: true });

        alumniSection.addEventListener("touchend", (event) => {
            touchEndX = event.changedTouches[0].clientX;
            const delta = touchStartX - touchEndX;
            if (delta > 45) {
                nextAlumni();
            } else if (delta < -45) {
                previousAlumni();
            }
        }, { passive: true });
    };

    const showFriendlyError = () => {
        if (nameEl) {
            nameEl.textContent = "Alumni data unavailable";
        }
        if (bioEl) {
            bioEl.textContent = "The alumni feed is temporarily unavailable. Please refresh the page shortly.";
        }
        if (interestTagsEl) {
            interestTagsEl.innerHTML = "";
        }
        if (projectListEl) {
            projectListEl.innerHTML = "";
        }
        if (publicationListEl) {
            publicationListEl.innerHTML = "";
        }
        if (thumbnailStripEl) {
            thumbnailStripEl.innerHTML = "";
        }
    };

    const init = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            const payload = await response.json();
            alumniPeople = normalizeAlumniData(payload);
            window.__KEPHSA_ALUMNI_DATA__ = alumniPeople;

            if (!alumniPeople.length) {
                showFriendlyError();
                if (nameEl) {
                    nameEl.textContent = "No alumni available yet";
                }
                if (bioEl) {
                    bioEl.textContent = "The alumni list will appear here once the data feed is ready.";
                }
                return;
            }

            buildThumbnails();
            renderProfile(0);
            attachEvents();
            startAutoplay();
        } catch (error) {
            console.error("Unable to load alumni data", error);
            showFriendlyError();
        }
    };

    init();
})();
