(() => {
  console.log("Click.js loaded");
  const API_URL = window.location.origin + '/api';
  console.log("API_URL:", API_URL);
  
  // Test API connectivity
  fetch(`${API_URL}/status`)
    .then(response => {
      if (response.ok) {
        console.log("API is reachable");
      } else {
        console.error("API status check failed:", response.status);
      }
    })
    .catch(error => {
      console.error("API connectivity test failed:", error);
    });
  
  document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded");
    const clickButtons = document.querySelectorAll(".click-button");
    console.log("Found buttons:", clickButtons.length);
    
    if (clickButtons.length === 0) {
      console.error("No click buttons found!");
      return;
    }

    clickButtons.forEach((button, index) => {
      const slug = button.dataset.slug || window.location.pathname;
      const storageKey = `click-clicked-${slug}`;
      
      console.log(`Setting up button ${index} for slug: ${slug}, storageKey: ${storageKey}`);
      
      // Check initial state
      const isAlreadyClicked = localStorage.getItem(storageKey);
      console.log(`Button ${index} initial state - clicked: ${!!isAlreadyClicked}`);
      
      if (isAlreadyClicked) {
        button.setAttribute('aria-disabled', 'true');
        button.classList.add("clicked");
        console.log(`Button ${index} disabled due to previous click`);
      }
      
      const handleInteraction = async (event) => {
        console.log(`Button ${index} interaction started`);
        
        // Check current state
        const currentDisabled = button.getAttribute('aria-disabled');
        const currentStorage = localStorage.getItem(storageKey);
        
        console.log(`Button ${index} state check - disabled: ${currentDisabled}, storage: ${currentStorage}`);
        
        if (currentStorage || currentDisabled === 'true') {
          console.log(`Button ${index} blocked - already clicked`);
          return;
        }
        
        console.log(`Button ${index} processing click`);
        
        // Prevent further clicks
        button.setAttribute('aria-disabled', 'true');
        localStorage.setItem(storageKey, "true");
        button.classList.add("clicked");
        
        console.log(`Button ${index} sending request to: ${API_URL}/increment_hits`);
        console.log(`Button ${index} request payload:`, { page_slug: slug });
        
        try {
          const response = await fetch(`${API_URL}/increment_hits`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Referer": window.location.href
            },
            body: JSON.stringify({ page_slug: slug }),
          });
          
          console.log(`Button ${index} response status:`, response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log(`Button ${index} success:`, data);
          } else {
            const errorText = await response.text();
            console.error(`Button ${index} failed with status ${response.status}:`, errorText);
            
            // Re-enable button on failure
            button.setAttribute('aria-disabled', 'false');
            localStorage.removeItem(storageKey);
            button.classList.remove("clicked");
          }
        } catch (error) {
          console.error(`Button ${index} network error:`, error);
          
          // Re-enable button on network error
          button.setAttribute('aria-disabled', 'false');
          localStorage.removeItem(storageKey);
          button.classList.remove("clicked");
        }
      };

      button.addEventListener("click", (event) => {
        console.log(`Button ${index} clicked event fired`);
        event.preventDefault();
        handleInteraction(event);
      });
      
      button.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          console.log(`Button ${index} keyboard event: ${event.key}`);
          event.preventDefault();
          handleInteraction(event);
        }
      });
      
      console.log(`Button ${index} setup complete`);
    });
  });
})();

// Debug functions
window.clearClickStorage = function() {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('click-clicked-')) {
      localStorage.removeItem(key);
      console.log('Removed:', key);
    }
  });
  alert('Click history cleared. Refresh the page to re-enable buttons.');
};

window.showStorage = function() {
  const keys = Object.keys(localStorage);
  const clickKeys = keys.filter(key => key.startsWith('click-clicked-'));
  console.log('Click storage keys:', clickKeys);
  alert('Check console for storage keys');
};

window.testAPI = async function() {
  try {
    const response = await fetch(`${API_URL}/status`);
    const data = await response.json();
    console.log('API test result:', data);
    alert('API test: ' + JSON.stringify(data));
  } catch (error) {
    console.error('API test failed:', error);
    alert('API test failed: ' + error.message);
  }
};
