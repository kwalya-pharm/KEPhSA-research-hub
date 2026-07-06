const API =
    "https://script.google.com/macros/s/AKfycbwN5F5d_nDGaPavl6FgiigJrJY1VAoEnYOu9QIMS66Ge0WINuPfXRRHIBUqN3z40vbc1w/exec";

const grid = document.getElementById("studentsGrid");
const searchInput = document.getElementById("studentSearch");
const yearFilter = document.getElementById("yearFilter");

let students = [];

function escapeHtml(value = "") {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function getText(student, key, fallback = "") {
    return (student?.[key] ?? fallback).toString().trim();
}

function getInitials(name) {
    const parts = name.split(/\s+/).filter(Boolean);

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

        const photo = getText(student, "Upload your photo");
        const name = getText(student, "Full Name", "Student profile");
        const year = getText(student, "Year of Study", "Year of study");
        const career = getText(student, "Career Ambitions", "Research-focused pharmacy student");
        const interests = getText(student, "Research Interests");
        const linkedIn = getText(student, "LinkedIn Profile");
        const projectCount = getText(student, "Current Research Project(s)") ? 1 : 0;
        const publicationCount = getText(student, "Research Publications") ? 1 : 0;

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
                        ? `<img src="${escapeHtml(photo)}" alt="${escapeHtml(name)}" loading="lazy">`
                        : escapeHtml(getInitials(name))}
                </div>
                <div class="student-meta">
                    <h3 class="student-name">${escapeHtml(name)}</h3>
                    <span class="student-year">${escapeHtml(year)}</span>
                </div>
            </div>
            <p class="student-career">${escapeHtml(career)}</p>
            ${facts.length ? `<div class="student-facts">${facts.map((fact) => `<span>${escapeHtml(fact)}</span>`).join("")}</div>` : ""}
            <div class="student-tags">${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
            ${linkedIn ? `<div class="student-links"><a href="${escapeHtml(linkedIn)}" target="_blank" rel="noreferrer">View profile</a></div>` : ""}
        `;

        grid.appendChild(card);
    });
}

function applyFilters() {
    const query = searchInput.value.trim().toLowerCase();
    const year = yearFilter.value.trim();

    const filtered = students.filter((student) => {
        const name = getText(student, "Full Name").toLowerCase();
        const career = getText(student, "Career Ambitions").toLowerCase();
        const interests = getText(student, "Research Interests").toLowerCase();
        const studyYear = getText(student, "Year of Study");

        const matchesQuery = !query || [name, career, interests].some((value) => value.includes(query));
        const matchesYear = !year || studyYear === year;

        return matchesQuery && matchesYear;
    });

    renderStudents(filtered);
}

async function loadStudents() {
    renderLoadingState();

    try {
        const response = await fetch(API);
        const data = await response.json();

        students = Array.isArray(data) ? data : [];
        applyFilters();
    }
    catch (error) {
        console.error(error);
        renderStudents([]);
    }
}

searchInput.addEventListener("input", applyFilters);
yearFilter.addEventListener("change", applyFilters);

loadStudents();