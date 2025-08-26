document.addEventListener('DOMContentLoaded', function() {
  const newsletterForm = document.querySelector('.newsletter-form');
  
  // Update these selectors to match your HTML
  const nameInput = newsletterForm.querySelector('input[name="name"]');
  const emailInput = newsletterForm.querySelector('input[name="email"]');
  
  const submitButton = newsletterForm.querySelector('button[type="submit"]');

  // Function to handle newsletter form submission
  newsletterForm.addEventListener('submit', function(event) {
    // Prevent the default form submission behavior
    event.preventDefault();

    // Check if inputs are available before trying to read their value
    if (!nameInput || !emailInput) {
      console.error("Form inputs not found. Check your HTML selectors.");
      return; // Stop execution if elements don't exist
    }

    // Show a loading state on the button
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';

    const formData = new URLSearchParams();
    formData.append('entry.375698588', nameInput.value);
    formData.append('entry.1582891937', emailInput.value);

    // Google Forms submission endpoint (this is the correct endpoint)
    const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdGY8cDDrjTam4loExTaXxLoDxpo7JA-st4xyokJctLDGGTTg/formResponse';

    fetch(formUrl, {
      method: 'POST',
      body: formData,
      mode: 'no-cors' // Required for cross-origin submission to Google Forms
    })
    .then(() => {
      // The `no-cors` mode makes the response always "opaque",
      // so we can only assume success if there's no network error.
      console.log('Newsletter subscription successful.');
      submitButton.innerHTML = '<i class="fas fa-check"></i> Subscribed!';
      submitButton.classList.add('success');
      
      // Optionally, clear the form after a short delay
      setTimeout(() => {
        nameInput.value = '';
        emailInput.value = '';
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Subscribe';
        submitButton.classList.remove('success');
      }, 3000);

    })
    .catch(error => {
      console.error('Submission failed:', error);
      submitButton.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error';
      submitButton.classList.add('error');
      // Re-enable button after error
      setTimeout(() => {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Subscribe';
        submitButton.classList.remove('error');
      }, 3000);
    });
  });

  // --- Function to fetch data from the spreadsheet ---
  // You can call this function from anywhere in your code to get the data
  async function fetchSpreadsheetData() {
    const spreadsheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS0GJGuCH8CWGNFfdFx4ODdQ0kerfl_YT29AnzviRPW-iGmoUkq2d0AXLXk1DudiD7wVQUKM48mK9Kg/pub?output=csv';
    try {
      const response = await fetch(spreadsheetUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.text();
      
      // Log the data to the console for inspection
      console.log('--- Spreadsheet Data (CSV) ---');
      console.log(data);
      console.log('------------------------------');

      // You can process the 'data' variable here, e.g.,
      // const rows = data.split('\n').map(row => row.split(','));
      // console.log(rows);

    } catch (error) {
      console.error('Failed to fetch spreadsheet data:', error);
    }
  }

  // Example of how to call the function
  // fetchSpreadsheetData();
});
