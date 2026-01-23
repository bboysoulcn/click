(() => {
  console.log("Click.js starting...");
  const API_URL = window.location.origin + '/api';
  console.log("API_URL set to:", API_URL);
  
  // Built-in icons (SVG format)
  const BUILTIN_ICONS = {
    heart:
      '<svg width="16" height="16" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" aria-hidden="true"><path d="M15 8C8.925 8 4 12.925 4 19c0 11 13 21 20 23.326C31 40 44 30 44 19c0-6.075-4.925-11-11-11c-3.72 0-7.01 1.847-9 4.674A10.99 10.99 0 0 0 15 8"/></svg>',
    thumbs_up:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>',
    upvote:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 17l-6-6-6 6"/><path d="M18 11l-6-6-6 6"/></svg>',
  };

  // Test API connectivity (keep for production monitoring)
  fetch(`${API_URL}/status`)
    .then(response => {
      if (!response.ok) {
        console.error("API status check failed:", response.status);
      } else {
        console.log("API connectivity test successful");
      }
    })
    .catch(error => {
      console.error("API connectivity test failed:", error);
    });
  
  // Utility function to show user feedback
  function showFeedback(button, message, type = 'success') {
    console.log("Showing feedback:", message, type);
    // Remove existing feedback
    const existingFeedback = button.parentNode.querySelector('.click-feedback');
    if (existingFeedback) {
      existingFeedback.remove();
    }
    
    // Create feedback element
    const feedback = document.createElement('div');
    feedback.className = `click-feedback click-feedback-${type}`;
    feedback.textContent = message;
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('aria-live', 'polite');
    
    // Insert after button
    button.parentNode.insertBefore(feedback, button.nextSibling);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.remove();
      }
    }, 3000);
  }
  
  // Utility function to set button loading state
  function setButtonLoading(button, loading) {
    if (loading) {
      button.classList.add('click-loading');
      button.setAttribute('aria-disabled', 'true');
      console.log("Button set to loading state");
    } else {
      button.classList.remove('click-loading');
      button.setAttribute('aria-disabled', 'false');
      console.log("Button loading state removed");
    }
  }

  // Utility function to toggle icon fill
  function toggleFill(icon, filled) {
    const svg = icon.querySelector("svg");
    if (svg) {
      const button = icon.closest('.click-button');
      const iconType = button?.dataset.icon || 'heart';
      if (iconType === 'upvote') {
        svg.setAttribute("stroke-width", filled ? "3" : "2");
      } else {
        const paths = svg.querySelectorAll("path, polygon, circle");
        paths.forEach((path) => {
          path.setAttribute("fill", filled ? "currentColor" : "none");
        });
      }
    }
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded fired, initializing buttons...");
    const clickButtons = document.querySelectorAll(".click-button");
    console.log("Found click buttons:", clickButtons.length);
    
    if (clickButtons.length === 0) {
      console.error("No click buttons found!");
      return;
    }

    // Get unique slugs for count fetching
    const slugs = Array.from(clickButtons).map(
      (button) => button.dataset.slug || window.location.pathname
    );
    const uniqueSlugs = [...new Set(slugs)];
    const counts = new Map();

    // Fetch counts for all buttons
    const fetchCounts = async () => {
      if (uniqueSlugs.length === 0) {
        return;
      }
      try {
        console.log("Fetching counts for slugs:", uniqueSlugs);
        const response = await fetch(`${API_URL}/get_hits`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            page_slugs: uniqueSlugs,
          }),
        });

        if (!response.ok) {
          console.error("Failed to fetch counts, status:", response.status);
          throw new Error("Failed to fetch counts");
        }
        
        const countsData = await response.json();
        console.log("Received counts data:", countsData);

        if (countsData && typeof countsData === 'object') {
          for (const slug in countsData) {
            const count = countsData[slug];
            counts.set(slug, typeof count === 'number' ? count : 0);
          }
        }
      } catch (error) {
        console.error("Error fetching click counts:", error);
        // Set default counts to 0 on error
        uniqueSlugs.forEach(slug => counts.set(slug, 0));
      }
    };

    const initializeButtons = async () => {
      await fetchCounts();

      clickButtons.forEach((button, index) => {
        console.log(`Setting up button ${index}`);
        
        // Create icon and counter elements
        let icon = button.querySelector(".icon");
        let counter = button.querySelector(".counter");
        
        if (!icon) {
          // Clear any existing content
          button.textContent = "";
          icon = document.createElement("span");
          icon.className = "icon";
          button.appendChild(icon);
        }
        
        if (!counter) {
          counter = document.createElement("span");
          counter.className = "counter";
          button.appendChild(counter);
        }

        const slug = button.dataset.slug || window.location.pathname;
        const count = counts.get(slug) || 0;
        counter.textContent = ` ${count}`;
        console.log(`Button ${index} count: ${count}`);
        
        // Set up icon
        const iconValue = button.dataset.icon || 'heart';
        if (BUILTIN_ICONS[iconValue]) {
          icon.innerHTML = BUILTIN_ICONS[iconValue];
        } else {
          icon.textContent = iconValue; // For emoji
        }

        const storageKey = `click-clicked-${slug}`;
        console.log(`Button ${index} slug: ${slug}, storageKey: ${storageKey}, icon: ${iconValue}`);
        
        // Check initial state
        const isAlreadyClicked = localStorage.getItem(storageKey);
        console.log(`Button ${index} already clicked:`, !!isAlreadyClicked);
        
        if (isAlreadyClicked) {
          button.setAttribute('aria-disabled', 'true');
          button.classList.add("clicked");
          toggleFill(icon, true);
          showFeedback(button, "Already clicked", "info");
        }
        
        const handleInteraction = async (event) => {
          console.log(`Button ${index} interaction started`);
          
          // Check current state
          const currentDisabled = button.getAttribute('aria-disabled');
          const currentStorage = localStorage.getItem(storageKey);
          console.log(`Button ${index} state check - disabled: ${currentDisabled}, storage: ${currentStorage}`);
          
          if (currentStorage || currentDisabled === 'true') {
            console.log(`Button ${index} blocked - already clicked`);
            showFeedback(button, "Already clicked", "info");
            return;
          }
          
          console.log(`Button ${index} processing interaction`);
          
          // Set loading state
          setButtonLoading(button, true);
          showFeedback(button, "Processing...", "info");
          
          // Prevent further clicks
          button.setAttribute('aria-disabled', 'true');
          localStorage.setItem(storageKey, "true");
          button.classList.add("clicked");
          toggleFill(icon, true);
          
          try {
            console.log(`Button ${index} sending request to: ${API_URL}/increment_hits`);
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
              // Update counter
              if (data.new_count !== undefined) {
                counter.textContent = ` ${data.new_count}`;
              }
              showFeedback(button, "Thanks for your support! ❤️", "success");
            } else if (response.status === 429) {
              // Rate limit exceeded
              console.log(`Button ${index} rate limited`);
              showFeedback(button, "Too many requests. Please try again later.", "error");
              button.setAttribute('aria-disabled', 'false');
              localStorage.removeItem(storageKey);
              button.classList.remove("clicked");
              toggleFill(icon, false);
            } else {
              const errorText = await response.text();
              console.error(`Button ${index} failed with status ${response.status}:`, errorText);
              showFeedback(button, "Something went wrong. Please try again.", "error");
              
              // Re-enable button on failure
              button.setAttribute('aria-disabled', 'false');
              localStorage.removeItem(storageKey);
              button.classList.remove("clicked");
              toggleFill(icon, false);
            }
          } catch (error) {
            console.error(`Button ${index} network error:`, error);
            showFeedback(button, "Connection failed. Please check your internet.", "error");
            
            // Re-enable button on network error
            button.setAttribute('aria-disabled', 'false');
            localStorage.removeItem(storageKey);
            button.classList.remove("clicked");
            toggleFill(icon, false);
          } finally {
            setButtonLoading(button, false);
          }
        };
        
        // Event listeners for different input methods
        button.addEventListener("click", (event) => {
          console.log(`Button ${index} click event fired`);
          event.preventDefault();
          handleInteraction(event);
        });
        
        // Touch events for mobile devices
        button.addEventListener("touchstart", (event) => {
          console.log(`Button ${index} touchstart`);
          button.classList.add("touch-active");
        }, { passive: true });
        
        button.addEventListener("touchend", (event) => {
          console.log(`Button ${index} touchend`);
          button.classList.remove("touch-active");
          // Check if touch ended within button bounds
          const rect = button.getBoundingClientRect();
          const touch = event.changedTouches[0];
          if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
              touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
            event.preventDefault();
            handleInteraction(event);
          }
        }, { passive: false });
        
        button.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            console.log(`Button ${index} keyboard event: ${event.key}`);
            event.preventDefault();
            handleInteraction(event);
          }
        });
        
        console.log(`Button ${index} setup complete`);
      });
    };

    initializeButtons();
    
    console.log("All buttons initialized");
  });
})();

// Debug functions (kept for user debugging)
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
  const API_URL = window.location.origin + '/api';
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
