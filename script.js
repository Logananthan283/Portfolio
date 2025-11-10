// ===================================================================
// ============= MAIN SCRIPT (FIXED) =================================
// ===================================================================
// We wrap ALL our code in this listener to ensure the HTML is
// 100% loaded before any JavaScript runs. This prevents errors.
// ===================================================================
document.addEventListener("DOMContentLoaded", () => {
    
  // ===================== AOS INIT =====================
  // Check if AOS is defined (it might be blocked)
  if (typeof AOS !== 'undefined') {
    AOS.init({
      once: true,
      duration: 800,
      easing: 'ease-out-cubic'
    });
  } else {
    console.warn("AOS library not loaded, animations will be disabled.");
  }


  // ===================== COUNTER ANIMATION (Fixed - No GSAP) =====================
  const counters = document.querySelectorAll('.counter');
  
  const animateCounter = (el) => {
    const target = +el.getAttribute('data-target');
    let current = 0;
    const duration = 1200; // 1.2 seconds
    const stepTime = 15; // update every 15ms
    const steps = duration / stepTime;
    const increment = target / steps;
    
    const update = () => {
      current += increment;
      if (current < target) {
        el.textContent = Math.floor(current);
        setTimeout(update, stepTime);
      } else {
        el.textContent = target; // Ensure it ends on the exact target
      }
    };
    update(); // Start the animation
  };

  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target); // Animate only once
      }
    });
  }, { threshold: 0.6 });

  counters.forEach(c => io.observe(c));


  // ===================== PORTFOLIO FILTERS (Fixed - No GSAP) =====================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.card-item[data-project-id]');
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Set active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const category = card.dataset.category;
        const show = (filter === 'all' || filter === category);
        
        if (show) {
          // Use setTimeout to allow the 'display' change to register before transitioning
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 10); // A tiny delay
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          // Hide the element *after* the transition is complete (300ms)
          setTimeout(() => {
            // Only hide if it's still supposed to be hidden (user might click another filter fast)
            if (card.style.opacity === '0') {
              card.style.display = 'none';
            }
          }, 300); // Must match the CSS transition duration
        }
      });
    });
  });

  // ===================== FORM UX & SUBMISSION =====================
  const form = document.querySelector('.contact-form');
  const status = document.getElementById('formStatus');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');

  function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
  
  function validateForm() {
      let isValid = true;
      document.querySelectorAll('.error-msg').forEach(el => el.style.display = 'none');
      
      if (nameInput.value.trim() === '') {
          document.getElementById('err-name').style.display = 'block';
          isValid = false;
      }
      if (!validateEmail(emailInput.value)) {
          document.getElementById('err-email').style.display = 'block';
          isValid = false;
      }
      if (messageInput.value.trim() === '') {
          document.getElementById('err-message').style.display = 'block';
          isValid = false;
      }
      return isValid;
  }

  async function handleSubmit(event) {
      event.preventDefault();
      if (!validateForm()) {
        status.textContent = 'Please fix the errors above.';
        status.style.color = '#ff8a8a';
        return;
      }
    
      const data = new FormData(event.target);
      status.textContent = 'Sending…';
      status.style.color = 'var(--muted)';
      
      try {
          const response = await fetch(event.target.action, {
              method: form.method,
              body: data,
              headers: { 'Accept': 'application/json' }
          });

          if (response.ok) {
              status.textContent = "Thanks! I'll get back to you shortly.";
              status.style.color = '#8aff8a'; // Green for success
              form.reset();
          } else {
              const responseData = await response.json();
              if (Object.hasOwn(responseData, 'errors')) {
                  status.textContent = responseData["errors"].map(error => error["message"]).join(", ");
              } else {
                  status.textContent = "Oops! There was a problem submitting your form.";
              }
              status.style.color = '#ff8a8a'; // Red for error
          }
      } catch (error) {
          status.textContent = "Oops! There was a network error.";
          status.style.color = '#ff8a8a'; // Red for error
      }
  }

  // Ensure form exists before adding listener
  if(form) {
    form.addEventListener("submit", handleSubmit);
  }
  
  
  // ===================== FEATURE: AUTO-UPDATING YEAR =====================
  const yearSpan = document.getElementById("currentYear");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
  
  
  // ===================== FEATURE: "BACK TO TOP" (Removed) =====================
  // All "Back to Top" logic has been removed.
  
  
  // ===================== FEATURE: SCROLL SPY (Active Nav) =====================
  const navLinks = document.querySelectorAll('.nav-menu a[data-section-id]');
  const sections = document.querySelectorAll('section[id]');

  if (navLinks.length > 0 && sections.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '-50% 0px -50% 0px', // Triggers when the section is in the middle of the viewport
      threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.sectionId === id);
          });
        }
      });
    }, observerOptions);

    sections.forEach(sec => sectionObserver.observe(sec));
  }
  
  
  // ===================== FEATURE: PROJECT MODAL =====================
  
  // --- 1. Define Project Data ---
  const projectData = {
    "qaSuite": {
      title: "Manual Testing Suite for E-commerce",
      image: "images/4.png",
      description: `
        <p>This project involved comprehensive manual and functional testing for a new e-commerce web application. My primary role was to ensure product quality before launch.</p>
        <p><strong>Key Responsibilities:</strong></p>
        <ul>
          <li>Designed and documented over 100 detailed test cases covering all user flows, from registration to checkout.</li>
          <li>Executed functional, regression, and usability tests across multiple browsers (Chrome, Firefox, Safari).</li>
          <li>Identified, documented, and triaged over 50 bugs, including 15 critical defects related to payment processing and user authentication.</li>
          <li>Collaborated with developers in an Agile environment to verify bug fixes and provide clear, actionable feedback.</li>
        </ul>
        <p><strong>Result:</strong> Contributed to a 30% reduction in post-release defects and a significantly more stable and reliable platform for launch.</p>
      `,
      links: `` // No live link for this one
    },
    "shopifyStore": {
      title: "Shopify T-Shirt Store (LeaderClothings.in)",
      image: "images/2.png",
      description: `
        <p>This was a complete, end-to-end project to build and launch a functional Shopify store for a T-shirt brand.</p>
        <p><strong>My role covered both development and testing:</strong></p>
        <ul>
          <li>Gathered requirements and set up the Shopify store, including theme selection and customization.</li>
          <li>Configured product catalogs, collections, navigation, and payment gateways (Stripe, Razorpay).</li>
          <li>Ensured the store was fully responsive and optimized for mobile performance.</li>
          <li>Conducted end-to-end testing of the entire user journey: product browsing, adding to cart, checkout, payment, and order confirmation.</li>
          <li>Handled deployment and post-launch monitoring.</li>
        </ul>
      `,
      links: `
        <a href="https://leaderclothings.in" target="_blank" rel="noopener" class="btn btn-primary">
          <i class="fa-solid fa-arrow-up-right-from-square"></i> Live Store
        </a>
      `
    }
  };
  
  // --- 2. Get Modal Elements ---
  const modal = document.getElementById('projectModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalImage = document.getElementById('modalImage');
  const modalTitle = document.getElementById('modalTitle');
  const modalDescription = document.getElementById('modalDescription');
  const modalLinks = document.getElementById('modalLinks');
  const projectCards = document.querySelectorAll('.card-item[data-project-id]');
  
  // --- 3. Open Modal Function ---
  function openModal(projectId) {
    const data = projectData[projectId];
    if (!data) return;
    
    modalImage.src = data.image;
    modalImage.alt = data.title;
    modalTitle.textContent = data.title;
    modalDescription.innerHTML = data.description;
    modalLinks.innerHTML = data.links;
    
    modal.hidden = false;
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }
  
  // --- 4. Close Modal Function ---
  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = ''; // Re-enable background scrolling
  }
  
  // --- 5. Add Event Listeners (Check if elements exist first) ---
  if (modal && modalCloseBtn && projectCards.length > 0) {
    projectCards.forEach(card => {
      card.addEventListener('click', () => {
        openModal(card.dataset.projectId);
      });
    });
    
    modalCloseBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      // Close if user clicks on the dark overlay background
      if (e.target === modal) {
        closeModal();
      }
    });
  }

}); // <-- This closes the main DOMContentLoaded listener
