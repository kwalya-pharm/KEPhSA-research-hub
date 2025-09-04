// --- CONFIGURATION ---
// URL to fetch reviews from the Google Sheet in TSV format
const GOOGLE_SHEET_TSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSEYqS-HKiH_0JBnCRHarp88LvUK27a-xbdl6DGTkF-OWKZmEJDS7EdyqKZ6b2v9D8oY9yUKO7dQLh4/pub?gid=854671043&single=true&output=tsv';

// URL for Google Form submission (must be the formResponse endpoint)
const GOOGLE_FORM_SUBMISSION_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSc0cOR-VgduPKvlXK3fHLPJ7_zHMyVSsr8HdnyuIZWwp-VYGA/formResponse';

// --- DOM Elements ---
const dynamicReviewsContainer = document.getElementById('dynamic-reviews');
const reviewsLoadingState = document.getElementById('reviews-loading');
const reviewForm = document.getElementById('review-form');

// --- Helper: Render a single review card ---
function createReviewCard(review) {
  const article = document.createElement('article');
  article.classList.add('review-card');
  article.innerHTML = `
    <p class="review-text">"${review.review}"</p>
    <p class="reviewer-meta">— ${review.name}, ${review.institution}</p>
  `;
  return article;
}



// --- Fetch and display reviews ---
async function fetchAndDisplayReviews() {
  if (!dynamicReviewsContainer) return;

  // Show loading state
  if (reviewsLoadingState) {
    reviewsLoadingState.style.display = 'block';
  }

  try {
    const response = await fetch(GOOGLE_SHEET_TSV_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const tsvText = await response.text();

    // Parse TSV data. Assuming first row is headers and data starts from the second row.
    const rows = tsvText.trim().split('\n');
const reviews = [];
if (rows.length > 1) {
  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i].split('\t'); // split by tab
    if (cells && cells.length >= 4) {
      const timestamp = cells[0];
      const institution = cells[1];
      const reviewText = cells[2];
      const name = cells[3];
      reviews.push({ timestamp, name, institution, review: reviewText });
    }
  }
}

    // Sort reviews by timestamp, newest first
    reviews.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Clear loading state and existing reviews
    dynamicReviewsContainer.innerHTML = '';
    if (reviewsLoadingState) {
      reviewsLoadingState.style.display = 'none';
    }

    // Render reviews
    if (reviews.length > 0) {
      reviews.forEach(review => {
        dynamicReviewsContainer.appendChild(createReviewCard(review));
      });
    } else {
      dynamicReviewsContainer.innerHTML = `<p class="no-reviews-message">No reviews have been submitted yet.</p>`;
    }
  } catch (error) {
    console.error('Error fetching reviews:', error);
    if (reviewsLoadingState) {
      reviewsLoadingState.style.display = 'none';
    }
    dynamicReviewsContainer.innerHTML = `<p class="error-message">Error: Could not load reviews. Please try again later.</p>`;
  }
}

// --- Handle form submission ---
async function handleFormSubmission(event) {
  event.preventDefault();

  const formData = new FormData(reviewForm);

  const submitButton = reviewForm.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.innerHTML;

  // Disable button and show loading state
  submitButton.disabled = true;
  submitButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Submitting...`;

  try {
    await fetch(GOOGLE_FORM_SUBMISSION_URL, {
      method: 'POST',
      body: formData,
      mode: 'no-cors' // Required for Google Forms
    });

    reviewForm.reset();
    alert('✅ Thank you for your review! It will appear shortly.');

    // Wait a bit for the sheet to update
    setTimeout(fetchAndDisplayReviews, 4000);
  } catch (error) {
    console.error('Submission failed:', error);
    alert('❌ Could not submit. Please try again.');
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = originalButtonText;
  }
}

// --- Event Listeners and Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
  if (reviewForm) {
    reviewForm.addEventListener('submit', handleFormSubmission);
  }
  fetchAndDisplayReviews();
});
