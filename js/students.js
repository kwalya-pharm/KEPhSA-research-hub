const API_URL ="https://script.google.com/macros/s/AKfycbwN5F5d_nDGaPavl6FgiigJrJY1VAoEnYOu9QIMS66Ge0WINuPfXRRHIBUqN3z40vbc1w/exec";

const container = document.getElementById("studentsContainer");

function escapeHtml(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function ensureStudentModal() {
    if (document.getElementById("studentModal")) {
        return document.getElementById("studentModal");
    }

    const modal = document.createElement("div");
    modal.id = "studentModal";
    modal.className = "student-modal";
    modal.innerHTML = `
        <div class="student-modal-backdrop" data-close="true"></div>
        <div class="student-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="studentModalTitle">
            <button class="student-modal-close" type="button" aria-label="Close student details">×</button>
            <div class="student-modal-body"></div>
        </div>
    `;

    modal.querySelector(".student-modal-close").addEventListener("click", closeStudentModal);
    modal.querySelector(".student-modal-backdrop").addEventListener("click", closeStudentModal);

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeStudentModal();
        }
    });

    document.body.appendChild(modal);
    return modal;
}

function openStudentModal(student) {
    const modal = ensureStudentModal();
    const body = modal.querySelector(".student-modal-body");

    body.innerHTML = `
        <div class="student-modal-header">
            <div class="student-modal-image">
                <img src="${student.photo || "images/avatar.png"}" alt="${escapeHtml(student.name || "Student")}">
            </div>
            <div class="student-modal-heading">
                <p class="student-modal-eyebrow">Student profile</p>
                <h3 id="studentModalTitle">${escapeHtml(student.name || "Unnamed Student")}</h3>
                <span class="student-year">${escapeHtml(student.year || "")}</span>
            </div>
        </div>

        ${student.career ? `
            <div class="student-section">
                <h4>Career Ambitions</h4>
                <p>${escapeHtml(student.career)}</p>
            </div>
        ` : ""}

        ${student.interests ? `
            <div class="student-section">
                <h4>Research Interests</h4>
                <p>${escapeHtml(student.interests)}</p>
            </div>
        ` : ""}

        ${student.projects ? `
            <div class="student-section">
                <h4>Current Projects</h4>
                <p>${escapeHtml(student.projects)}</p>
            </div>
        ` : ""}

        ${student.publications ? `
            <div class="student-section">
                <h4>Publications</h4>
                <p>${escapeHtml(student.publications)}</p>
            </div>
        ` : ""}

        <div class="student-links">
            ${student.linkedin ? `<a href="${formatLink(student.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>` : ""}
            ${student.orcid ? `<a href="${formatLink(student.orcid)}" target="_blank" rel="noopener">ORCID</a>` : ""}
        </div>
    `;

    modal.classList.add("is-open");
    document.body.classList.add("modal-open");
}

function closeStudentModal() {
    const modal = document.getElementById("studentModal");
    if (!modal) {
        return;
    }

    modal.classList.remove("is-open");
    document.body.classList.remove("modal-open");
}

async function loadStudents() {
    container.innerHTML = `
        <div class="students-loading">
            Loading students...
        </div>
    `;

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to fetch data.");
        }

        const students = await response.json();

        renderStudents(students);

    } catch (error) {

        container.innerHTML = `
            <div class="students-error">
                Unable to load student profiles.
            </div>
        `;

        console.error(error);
    }
}

function renderStudents(students) {
    if (!students.length) {
        container.innerHTML = `
            <div class="students-empty">
                No student profiles available.
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="students-carousel" aria-live="polite">
            <div class="students-track"></div>
        </div>
        <div class="students-carousel-controls" aria-label="Student carousel controls">
            <button class="students-carousel-btn" type="button" data-action="prev" aria-label="Previous student">←</button>
            <span class="students-carousel-status"></span>
            <button class="students-carousel-btn" type="button" data-action="next" aria-label="Next student">→</button>
        </div>
    `;

    const track = container.querySelector(".students-track");
    const status = container.querySelector(".students-carousel-status");
    const cards = students.map(student => createCard(student));
    track.innerHTML = cards.join("");

    let currentIndex = 0;
    let timerId = null;

    const showSlide = (index) => {
        currentIndex = (index + cards.length) % cards.length;
        const slides = Array.from(track.children);
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("is-active", slideIndex === currentIndex);
        });
        if (status) {
            status.textContent = `${currentIndex + 1} / ${cards.length}`;
        }
    };

    const startAutoPlay = () => {
        clearInterval(timerId);
        timerId = window.setInterval(() => {
            showSlide(currentIndex + 1);
        }, 5000);
    };

    const goToSlide = (index) => {
        showSlide(index);
        startAutoPlay();
    };

    container.querySelectorAll(".students-carousel-btn").forEach((button) => {
        button.addEventListener("click", () => {
            const action = button.dataset.action;
            goToSlide(action === "next" ? currentIndex + 1 : currentIndex - 1);
        });
    });

    container.querySelectorAll(".student-more-btn").forEach((button) => {
        button.addEventListener("click", () => {
            const student = JSON.parse(decodeURIComponent(button.dataset.student || "{}"));
            openStudentModal(student);
        });
    });

    showSlide(0);
    startAutoPlay();
    container.addEventListener("mouseenter", () => clearInterval(timerId));
    container.addEventListener("mouseleave", startAutoPlay);
}

function createCard(student) {
    const summary = student.interests || student.career || student.projects || student.publications || "";

    return `

    <article class="student-card">

        <div class="student-image">
            <img
                src="${student.photo || "images/avatar.png"}"
                alt="${escapeHtml(student.name || "Student") }"
                loading="lazy"
            >
        </div>

        <div class="student-content">
            <div class="student-top">
                <h3>${escapeHtml(student.name || "Unnamed Student")}</h3>
                <span class="student-year">${escapeHtml(student.year || "")}</span>
            </div>

            ${summary ? `<p class="student-summary">${escapeHtml(summary)}</p>` : ""}

            <button class="student-more-btn" type="button" data-student="${encodeURIComponent(JSON.stringify(student))}">
                More
            </button>
        </div>

    </article>

    `;
}

function formatLink(url) {

    if (!url) return "#";

    if (url.startsWith("http")) {
        return url;
    }

    return "https://" + url;
}

loadStudents();