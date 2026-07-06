const API =
    "https://script.google.com/macros/s/AKfycbwN5F5d_nDGaPavl6FgiigJrJY1VAoEnYOu9QIMS66Ge0WINuPfXRRHIBUqN3z40vbc1w/exec";

const grid = document.getElementById("studentsGrid");
const searchInput = document.getElementById("studentSearch");
const yearFilter = document.getElementById("yearFilter");

let students = [];

function escapeHtml(value = "") {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function getText(student, key, fallback = "") {
    return (student?.[key] ?? fallback).toString().trim();
}

function getStudentField(student, keys, fallback = "") {
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
}

function normalizeStudentsPayload(payload) {
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
}

function resolvePhotoUrl(value = "") {
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
}

function normalizeStudent(student) {
    const name = getStudentField(student, ["name", "Full Name", "full name", "Student Name", "student_name"], "Student profile");
    const photo = resolvePhotoUrl(getStudentField(student, ["photo", "Upload your photo", "Photo", "Profile Photo", "image", "Image"], ""));
    const year = getStudentField(student, ["year", "Year of Study", "Year", "Study Year"], "Year of study");
    const career = getStudentField(student, ["career", "Career Ambitions", "Career", "Career Goals"], "Research-focused pharmacy student");
    const interests = getStudentField(student, ["interests", "Research Interests", "Research Interest", "Areas of Interest"], "");
    const linkedIn = getStudentField(student, ["linkedin", "LinkedIn Profile", "LinkedIn", "Linkedin"], "");
    const projects = getStudentField(student, ["projects", "Current Research Project(s)", "Current Research Projects", "Research Projects"], "");
    const publications = getStudentField(student, ["publications", "Research Publications", "Publications"], "");

    return {
        name,
        photo,
        year,
        career,
        interests,
        linkedIn,
        projects,
        publications,
    };
}

function getInitials(name) {
    const parts = String(name || "").split(/\s+/).filter(Boolean);

    if (!parts.length) {
        return "ST";
    }

    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function renderLoadingState() {
    grid.innerHTML = "";

    for (let i = 0; i < 4; i += 1) {
        const skeleton = document.createElement("article");
        skeleton.className = "student-card student-card--skeleton";
        skeleton.innerHTML = `
            <div class="student-skeleton-line"></div>
            <div class="student-skeleton-line short"></div>
            <div class="student-skeleton-line"></div>
            <div class="student-skeleton-line short"></div>
        `;
        grid.appendChild(skeleton);
    }
}

function isMobileViewport() {
    return window.matchMedia("(max-width: 768px)").matches;
}

function renderStudents(list) {
    grid.innerHTML = "";

    if (!list.length) {
        const empty = document.createElement("div");
        empty.className = "student-empty";
        empty.innerHTML = "No student profiles matched your search yet. Try a different keyword or year.";
        grid.appendChild(empty);
        return;
    }

    list.forEach((student) => {
        const card = document.createElement("article");
        card.className = "student-card";

        const photo = student.photo || "";
        const name = student.name || "Student profile";
        const year = student.year || "Year of study";
        const career = student.career || "Research-focused pharmacy student";
        const interests = student.interests || "";
        const linkedIn = student.linkedIn || "";
        const projectCount = student.projects ? 1 : 0;
        const publicationCount = student.publications ? 1 : 0;
        const isMobile = isMobileViewport();
        const collapsedCareer = career.length > 180 ? `${career.slice(0, 180).trimEnd()}…` : career;
        const showReadToggle = isMobile && career.length > 180;

        const tags = interests
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
            .slice(0, 4);

        const facts = [];

        if (projectCount) {
            facts.push("Active project");
        }

        if (publicationCount) {
            facts.push("Publication");
        }

        card.innerHTML = `
            <div class="student-card-header">
                <div class="student-avatar">
                    ${photo
                        ? `<img src="${escapeHtml(photo)}" alt="${escapeHtml(name)}" loading="lazy" decoding="async">`
                        : escapeHtml(getInitials(name))}
                </div>
                <div class="student-meta">
                    <h3 class="student-name">${escapeHtml(name)}</h3>
                    <span class="student-year">${escapeHtml(year)}</span>
                    <div class="student-career-shell">
                        <p class="student-career ${showReadToggle ? "student-career--collapsed" : ""}" data-full-text="${escapeHtml(career)}" data-collapsed-text="${escapeHtml(collapsedCareer)}">${escapeHtml(showReadToggle ? collapsedCareer : career)}</p>
                        ${showReadToggle ? `<button type="button" class="student-read-toggle" aria-expanded="false">... Read More</button>` : ""}
                    </div>
                    ${facts.length ? `<div class="student-facts">${facts.map((fact) => `<span>${escapeHtml(fact)}</span>`).join("")}</div>` : ""}
                    <div class="student-tags">${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
                    ${linkedIn ? `<div class="student-links"><a href="${escapeHtml(linkedIn)}" target="_blank" rel="noreferrer">View profile</a></div>` : ""}
                </div>
            </div>
        `;

        const readToggle = card.querySelector(".student-read-toggle");
        if (readToggle) {
            readToggle.addEventListener("click", () => {
                const paragraph = card.querySelector(".student-career");
                const isExpanded = readToggle.getAttribute("aria-expanded") === "true";

                if (isExpanded) {
                    paragraph.classList.remove("student-career--expanded");
                    paragraph.classList.add("student-career--collapsed");
                    paragraph.textContent = paragraph.dataset.collapsedText || paragraph.textContent;
                    readToggle.setAttribute("aria-expanded", "false");
                    readToggle.textContent = "... Read More";
                } else {
                    paragraph.classList.remove("student-career--collapsed");
                    paragraph.classList.add("student-career--expanded");
                    paragraph.textContent = paragraph.dataset.fullText || paragraph.textContent;
                    readToggle.setAttribute("aria-expanded", "true");
                    readToggle.textContent = "Read Less";
                }
            });
        }

        grid.appendChild(card);
    });
}

function applyFilters() {
    const query = searchInput.value.trim().toLowerCase();
    const year = yearFilter.value.trim();

    const filtered = students.filter((student) => {
        const name = student.name.toLowerCase();
        const career = student.career.toLowerCase();
        const interests = student.interests.toLowerCase();
        const studyYear = student.year;

        const matchesQuery = !query || [name, career, interests].some((value) => value.includes(query));
        const matchesYear = !year || studyYear === year;

        return matchesQuery && matchesYear;
    });

    renderStudents(filtered);
}

async function loadStudents() {
    if (Array.isArray(window.__KEPHSA_STUDENTS_DATA__)) {
        students = window.__KEPHSA_STUDENTS_DATA__;
        applyFilters();
        return;
    }

    if (window.__KEPHSA_STUDENTS_LOAD_PROMISE__) {
        renderLoadingState();
        window.__KEPHSA_STUDENTS_LOAD_PROMISE__
            .then((data) => {
                students = data;
                applyFilters();
            })
            .catch(() => {
                renderStudents([]);
            });
        return;
    }

    renderLoadingState();

    window.__KEPHSA_STUDENTS_LOAD_PROMISE__ = fetch(API, { cache: "no-store" })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            students = normalizeStudentsPayload(data).map(normalizeStudent);
            window.__KEPHSA_STUDENTS_DATA__ = students;
            return students;
        })
        .catch((error) => {
            console.error("Failed to load students:", error);
            students = [];
            window.__KEPHSA_STUDENTS_DATA__ = [];
            return [];
        })
        .finally(() => {
            applyFilters();
        });
}

searchInput.addEventListener("input", applyFilters);
yearFilter.addEventListener("change", applyFilters);

loadStudents();