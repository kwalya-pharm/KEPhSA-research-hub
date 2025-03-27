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
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            if (elementTop < windowHeight * 0.85) {
                element.style.transitionDelay = `${index * 0.15}s`; // Stagger effect
                element.classList.add("visible");
            }
        });

        // Show or hide Scroll-to-Top Button
        if (window.scrollY > 300) {
            scrollToTopBtn.classList.add("visible");
        } else {
            scrollToTopBtn.classList.remove("visible");
        }
    }

    // === Sidebar Toggle ===
    toggleBtn?.addEventListener("click", function () {
        sidebar?.classList.toggle("active");
    });

    closeBtn?.addEventListener("click", function () {
        sidebar?.classList.remove("active");
    });

    // Close sidebar when clicking outside
    document.addEventListener("click", function (event) {
        if (sidebar && !sidebar.contains(event.target) && !toggleBtn?.contains(event.target)) {
            sidebar.classList.remove("active");
        }
    });

    // Close sidebar on Escape key press
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && sidebar) {
            sidebar.classList.remove("active");
        }
    });

    // === Scroll-to-Top Button ===
    scrollToTopBtn.innerHTML = "⬆";
    scrollToTopBtn.classList.add("scroll-to-top");
    document.body.appendChild(scrollToTopBtn);

    scrollToTopBtn.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // === Dark Mode Toggle (Optional) ===
    const darkModeToggle = document.createElement("button");
    darkModeToggle.innerHTML = "🌙";
    darkModeToggle.classList.add("dark-mode-toggle");
    document.body.appendChild(darkModeToggle);

    darkModeToggle.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");
    });

    // === Typewriter Effect ===
    function typeWriterEffect(element, text, speed = 100) {
        let index = 0;
        function type() {
            if (index < text.length) {
                element.innerHTML += text.charAt(index);
                index++;
                setTimeout(type, speed);
            }
        }
        element.innerHTML = "";
        type();
    }

    if (typingText) {
        typeWriterEffect(typingText, "THE KEPhSA RESEARCH HUB");
    }

    // === Save Progress Locally ===
    function saveProgress(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    function getProgress(key) {
        return JSON.parse(localStorage.getItem(key)) || {};
    }

    // Example Usage:
    saveProgress("userProgress", { course: "Pharmacology 101", completed: true });
    const progress = getProgress("userProgress");
    console.log("Restored progress:", progress);

    // === Sync Data When Online ===
    window.addEventListener("online", () => {
        console.log("Back Online! Syncing Data...");
        syncUserProgress();
    });

    function syncUserProgress() {
        const progress = getProgress("userProgress");
        if (progress) {
            fetch("/sync-progress", {
                method: "POST",
                body: JSON.stringify(progress),
                headers: { "Content-Type": "application/json" },
            })
                .then(() => {
                    console.log("Progress Synced!");
                    localStorage.removeItem("userProgress"); // Clear stored data after sync
                })
                .catch((err) => console.error("Sync Failed:", err));
        }
    }

    // === Fade In Sections on Scroll ===
    function revealOnScroll() {
        fadeElements.forEach((section) => {
            const sectionTop = section.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            if (sectionTop < windowHeight - 100) {
                section.classList.add("visible");
            }
        });
    }

    window.addEventListener("scroll", revealOnScroll);
    revealOnScroll(); // Trigger on page load

    // === Register Service Worker ===
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker
            .register("/service-worker.js")
            .then(() => console.log("Service Worker Registered"))
            .catch((error) => console.error("Service Worker Registration Failed:", error));
    }

    // Initial Scroll Handling
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Run once on page load
});
