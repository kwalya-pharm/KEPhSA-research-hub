document.addEventListener('DOMContentLoaded', () => {

  // --- Smooth Curtain Effect on Page Load ---
  const curtain = document.getElementById('curtain');
  if (curtain) {
    curtain.style.opacity = '0';
    curtain.style.visibility = 'hidden';
    curtain.style.transition = 'opacity 0.8s ease, visibility 0.8s ease';
  }

  // --- Header Stickiness and Scroll-based Effects ---
  const mainHeader = document.querySelector('.main-header');
  const heroSection = document.querySelector('.hero-section');
  const faders = document.querySelectorAll('.fade-in');

  const headerObserver = new IntersectionObserver(
    ([entry]) => {
      mainHeader.classList.toggle('sticky', !entry.isIntersecting);
    }, {
      rootMargin: '-50px 0px 0px 0px'
    }
  );

  if (heroSection) {
    headerObserver.observe(heroSection);
  }

  // --- "Fade-in" on Scroll Animation ---
  const appearOnScroll = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('appear');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
    }
  );

  faders.forEach(fader => {
    appearOnScroll.observe(fader);
  });

  // --- Dynamic Year for Footer ---
  const currentYearSpan = document.getElementById('current-year');
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  // --- Newsletter Form Submission ---
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    const emailInput = newsletterForm.querySelector('input[name="email"]');
    const submitButton = newsletterForm.querySelector('button[type="submit"]');

    newsletterForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!emailInput || !submitButton) {
        console.error("Newsletter form elements are missing.");
        return;
      }

      // Add loading state
      const originalButtonHtml = submitButton.innerHTML;
      submitButton.disabled = true;
      submitButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Subscribing...`;

      // Google Forms submission requires a specific URLSearchParams format
      const formData = new URLSearchParams();
      // The name 'entry.1582891937' must match the 'name' attribute of the email field in the Google Form's HTML
      formData.append('entry.1582891937', emailInput.value);

      const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdGY8cDDrjTam4loExTaXxLoDxpo7JA-st4xyokJctLDGGTTg/formResponse';

      try {
        // Using `fetch` with `mode: 'no-cors'` for Google Forms. This will not return a successful response but will submit the form.
        await fetch(formUrl, {
          method: 'POST',
          body: formData,
          mode: 'no-cors'
        });

        // Handle success
        submitButton.innerHTML = `<i class="fas fa-check"></i> Subscribed!`;
        submitButton.classList.add('success');

        // Reset the form and button after a delay
        setTimeout(() => {
          emailInput.value = '';
          submitButton.disabled = false;
          submitButton.innerHTML = originalButtonHtml;
          submitButton.classList.remove('success');
        }, 3000);
      } catch (error) {
        console.error('Submission failed:', error);
        // Handle error
        submitButton.innerHTML = `<i class="fas fa-exclamation-circle"></i> Error`;
        submitButton.classList.add('error');

        // Reset the button after a delay
        setTimeout(() => {
          submitButton.disabled = false;
          submitButton.innerHTML = originalButtonHtml;
          submitButton.classList.remove('error');
        }, 3000);
      }
    });
  }
});