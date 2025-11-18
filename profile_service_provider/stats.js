document.addEventListener('DOMContentLoaded', () => {
  const isOwner = false; 
  const profileCompletion = 70;
  const stats = { clients: 35, testimonials: 20, services: 12, skills: 25, certifications: 8, portfolios: 5 };
  const skillaraTime = 2;
  const currentTasks = 7;
  const globalRating = 4.5;

  const subscribeBtn = document.getElementById('subscribeBtn');
  const rateBtn = document.getElementById('rateBtn');
  
  // Hide buttons for owner, show for customers
  if (isOwner) {
    if (subscribeBtn) subscribeBtn.style.display = 'none';
    if (rateBtn) rateBtn.style.display = 'none';
  }

  // Initialize counters with actual values (not 0)
  function initializeCounters() {
    const numberEls = document.querySelectorAll('.stat-number');
    const statValues = [stats.clients, stats.testimonials, stats.services, stats.skills, stats.certifications, stats.portfolios];
    
    numberEls.forEach((el, i) => {
      if (i < statValues.length) {
        el.textContent = statValues[i]; // Set initial value immediately
      }
    });

    const miniStats = document.querySelectorAll('.mini-stat h4');
    if (miniStats[0]) miniStats[0].textContent = `${skillaraTime}y`;
    if (miniStats[1]) miniStats[1].textContent = currentTasks;
  }

  // Call this immediately to prevent 0 display
  initializeCounters();

  const progress = document.querySelector('.profile-completion');
  const percentageEl = document.querySelector('.percentage');

  function animateProgress() {
    if (!progress || !percentageEl) return;
    
    let current = 0;
    function step() {
      if (current <= profileCompletion) {
        progress.style.background = `conic-gradient(from -90deg, #8e2de2 ${current}%, #ff0080 ${current + 10}%, #e0e0e0 ${current + 10}%)`;
        percentageEl.textContent = `${current}%`;
        current++;
        setTimeout(step, 15); 
      }
    }
    step();
  }

  function animateStats() {
    const statValues = [stats.clients, stats.testimonials, stats.services, stats.skills, stats.certifications, stats.portfolios];
    const numberEls = document.querySelectorAll('.stat-number');
    
    numberEls.forEach((el, i) => {
      if (i < statValues.length) {
        const targetValue = statValues[i];
        let currentValue = targetValue; // Start from actual value, not 0
        el.textContent = currentValue;
        
        // Optional: Add counting animation if desired
        let count = 0;
        function updateCount() {
          if (count < targetValue) {
            count++;
            el.textContent = count;
            setTimeout(updateCount, 60); 
          }
        }
        updateCount();
      }
    });
  }

  // Stars animation on scroll
  function animateStars() {
    const starsContainer = document.querySelector('.global-rating .stars');
    const ratingNum = document.querySelector('.rating-number');
    
    if (!starsContainer || !ratingNum) return;
    
    starsContainer.textContent = '';
    const fullStarsCount = Math.floor(globalRating);
    const hasHalfStar = globalRating % 1 >= 0.5;
    const totalStars = 5;

    function addStar(index) {
      if (index < fullStarsCount) {
        const star = document.createElement('span');
        star.textContent = '★';
        star.style.color = '#ffb400';
        star.style.fontSize = '38px';
        star.style.transition = 'transform 0.3s ease';
        starsContainer.appendChild(star);
        star.style.transform = 'scale(1.5)';
        setTimeout(() => star.style.transform = 'scale(1)', 400);
        setTimeout(() => addStar(index + 1), 400);
      } else if (index === fullStarsCount && hasHalfStar) {
        const halfStarEl = document.createElement('span');
        halfStarEl.textContent = '½';
        halfStarEl.style.color = '#ffb400';
        halfStarEl.style.fontSize = '38px';
        starsContainer.appendChild(halfStarEl);
        setTimeout(() => addStar(index + 1), 400);
      } else if (index < totalStars) {
        const emptyStar = document.createElement('span');
        emptyStar.textContent = '☆';
        emptyStar.style.color = '#ccc';
        emptyStar.style.fontSize = '38px';
        starsContainer.appendChild(emptyStar);
        setTimeout(() => addStar(index + 1), 300);
      }
    }

    addStar(0);
    ratingNum.textContent = `${globalRating}/5`;
  }

  // ============================
  // SUBSCRIBE FUNCTIONALITY
  // ============================
  if (subscribeBtn && !isOwner) {
    subscribeBtn.addEventListener('click', function() {
      // Show subscription success popup
      const subscribeModal = document.createElement('div');
      subscribeModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
      `;
      
      subscribeModal.innerHTML = `
        <div style="
          background: white;
          padding: 30px;
          border-radius: 15px;
          text-align: center;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        ">
          <div style="font-size: 48px; color: #4CAF50; margin-bottom: 15px;">✓</div>
          <h3 style="margin: 0 0 15px 0; color: #333;">Subscription Successful!</h3>
          <p style="color: #666; margin-bottom: 25px;">
            You have successfully subscribed to this service provider. 
            You will now receive updates and can book their services directly.
          </p>
          <button onclick="this.closest('div').parentElement.remove()" style="
            background: #7d2ae8;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 25px;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.3s;
          ">Got It!</button>
        </div>
      `;
      
      document.body.appendChild(subscribeModal);
    });
  }

  // ============================
  // RATE ME FUNCTIONALITY - SIMPLIFIED
  // ============================
  if (rateBtn && !isOwner) {
    rateBtn.addEventListener('click', function() {
      // Simply scroll to testimonials section
      const testimonialsSection = document.getElementById('testimonials');
      if (testimonialsSection) {
        testimonialsSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  }

  // Animate everything when dashboard is visible
  const dashboardSection = document.getElementById('profile-dashboard');
  if (dashboardSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateProgress();
          animateStats();
          animateStars();
        }
      });
    }, { threshold: 0.5 });

    observer.observe(dashboardSection);
  }
});