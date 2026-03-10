document.addEventListener("DOMContentLoaded", () => {
	const yearEl = document.getElementById("current-year");
	if (yearEl) {
		yearEl.textContent = String(new Date().getFullYear());
	}

	const hamburgerMenu = document.getElementById("hamburger-menu");
	const mainNav = document.getElementById("main-nav");

	if (hamburgerMenu && mainNav) {
		const closeMenu = () => {
			hamburgerMenu.classList.remove("active");
			mainNav.classList.remove("active");
			hamburgerMenu.setAttribute("aria-expanded", "false");
		};

		hamburgerMenu.addEventListener("click", () => {
			const isActive = hamburgerMenu.classList.toggle("active");
			mainNav.classList.toggle("active", isActive);
			hamburgerMenu.setAttribute("aria-expanded", String(isActive));
		});

		mainNav.querySelectorAll("a").forEach(link => {
			link.addEventListener("click", closeMenu);
		});

		document.addEventListener("click", event => {
			const target = event.target;
			if (!target) return;
			if (!hamburgerMenu.contains(target) && !mainNav.contains(target)) {
				closeMenu();
			}
		});
	}

	const newsletterForm = document.querySelector(".newsletter-form");
	if (newsletterForm) {
		newsletterForm.addEventListener("submit", event => {
			event.preventDefault();
			const emailInput = newsletterForm.querySelector('input[type="email"]');
			const emailValue = emailInput ? emailInput.value.trim() : "";

			if (!emailValue) return;

			alert("Thanks for subscribing. Updates will be shared with " + emailValue + ".");
			newsletterForm.reset();
		});
	}
});

if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
	window.addEventListener("load", () => {
		navigator.serviceWorker.register("service-worker.js").catch(() => {
			// Service worker is optional for local/static previews.
		});
	});
}
