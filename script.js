document.addEventListener("DOMContentLoaded", function () {
    // Selectors
    const fadeElements = document.querySelectorAll(".fade-in");
    const sidebar = document.querySelector(".sidebar");
    const toggleBtn = document.querySelector(".sidebar-toggle-btn");
    const closeBtn = document.querySelector(".close-btn");
    const scrollToTopBtn = document.createElement("button");
    const typingText = document.getElementById("typing-text");

    // === Smooth Fade-in on Scroll ===
    function handleScroll() {
        fadeElements.forEach((element, index) => {
            if (element.getBoundingClientRect().top < window.innerHeight * 0.85) {
                element.style.transitionDelay = `${index * 0.15}s`; // Stagger effect
                element.classList.add("visible");
            }
        });

        // Show/hide Scroll-to-Top Button
        scrollToTopBtn.classList.toggle("visible", window.scrollY > 300);
    }

    // === Sidebar Toggle ===
    toggleBtn?.addEventListener("click", () => sidebar?.classList.toggle("active"));
    closeBtn?.addEventListener("click", () => sidebar?.classList.remove("active"));

    document.addEventListener("click", (event) => {
        if (sidebar && !sidebar.contains(event.target) && !toggleBtn?.contains(event.target)) {
            sidebar.classList.remove("active");
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") sidebar?.classList.remove("active");
    });

    // === Scroll-to-Top Button ===
    scrollToTopBtn.innerHTML = "⬆";
    scrollToTopBtn.className = "scroll-to-top";
    document.body.appendChild(scrollToTopBtn);

    scrollToTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // === Dark Mode Toggle ===
    const darkModeToggle = document.createElement("button");
    darkModeToggle.innerHTML = "🌙";
    darkModeToggle.className = "dark-mode-toggle";
    document.body.appendChild(darkModeToggle);

    darkModeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
    });

    // === Typewriter Effect ===
    function typeWriterEffect(element, text, speed = 80) {
        let index = 0;
        element.innerHTML = "";
        function type() {
            if (index < text.length) {
                element.innerHTML += text.charAt(index++);
                setTimeout(type, speed);
            }
        }
        type();
    }

    if (typingText) typeWriterEffect(typingText, "THE KEPhSA RESEARCH HUB");

    // === Save & Sync Progress Locally ===
    function saveProgress(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    function getProgress(key) {
        return JSON.parse(localStorage.getItem(key)) || {};
    }

    window.addEventListener("online", syncUserProgress);

    function syncUserProgress() {
        const progress = getProgress("userProgress");
        if (progress) {
            fetch("/sync-progress", {
                method: "POST",
                body: JSON.stringify(progress),
                headers: { "Content-Type": "application/json" },
            })
                .then(() => localStorage.removeItem("userProgress"))
                .catch((err) => console.error("Sync Failed:", err));
        }
    }

    // === Fade In Sections on Scroll ===
    function revealOnScroll() {
        fadeElements.forEach((section) => {
            if (section.getBoundingClientRect().top < window.innerHeight - 100) {
                section.classList.add("visible");
            }
        });
    }

    window.addEventListener("scroll", revealOnScroll);
    revealOnScroll(); // Initial trigger

    // === Register Service Worker ===
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker
            .register("/service-worker.js")
            .then(() => console.log("Service Worker Registered"))
            .catch((error) => console.error("Service Worker Registration Failed:", error));
    }

    // Initial Scroll Handling
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial trigger
});
