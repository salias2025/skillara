document.addEventListener('DOMContentLoaded', () => {
  
  // ---------- FETCH DYNAMIC COUNTERS ----------
  async function loadCounters() {
    try {
      console.log('📊 Loading counters from API...');
      const response = await fetch('counters_handler.php');
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Counters loaded:', data);
        
        // Get all stat elements
        const statElements = document.querySelectorAll('.stat h3');
        
        // Update data-target attributes with real data
        // Order: clients, providers, services, projects
        if (statElements.length >= 4) {
          statElements[0].setAttribute('data-target', data.total_clients);
          statElements[1].setAttribute('data-target', data.total_providers);
          statElements[2].setAttribute('data-target', data.total_services);
          statElements[3].setAttribute('data-target', data.total_projects);
          
          console.log('🎯 Updated targets:', {
            clients: data.total_clients,
            providers: data.total_providers,
            services: data.total_services,
            projects: data.total_projects
          });
        }
      } else {
        console.error('❌ Failed to load counters:', data.message);
        // Use fallback values
        const statElements = document.querySelectorAll('.stat h3');
        statElements[0].setAttribute('data-target', 500);
        statElements[1].setAttribute('data-target', 1200);
        statElements[2].setAttribute('data-target', 50);
        statElements[3].setAttribute('data-target', 100);
      }
    } catch (error) {
      console.error('❌ Error fetching counters:', error);
      // Use HTML default values as fallback
    }
  }

  // ---------- ABOUT TEXT POP EFFECT ----------
  const aboutText = document.querySelector('.about-text');

  const checkAboutText = () => {
    const rect = aboutText.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;

    if (rect.top <= windowHeight * 0.8 && rect.bottom >= 0) {
      aboutText.classList.add('visible');
    }
  };

  checkAboutText();
  window.addEventListener('scroll', checkAboutText);
  window.addEventListener('resize', checkAboutText);

  // ---------- STATS COUNTER EFFECT ----------
  const stats = document.querySelectorAll('.stat h3');
  const aboutSection = document.querySelector('.about-us-section');
  let counting = false;

  const runCounters = () => {
    const rect = aboutSection.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;

    if (rect.top <= windowHeight * 0.8 && rect.bottom >= 0 && !counting) {
      counting = true;

      stats.forEach((stat, index) => {
        const target = +stat.getAttribute('data-target') || 0;
        let count = 0;

        setTimeout(() => {
          const duration = 2000;
          const stepTime = Math.max(20, Math.floor(duration / target));

          const counter = setInterval(() => {
            count += 1;
            if (count >= target) {
              // FIXED: Add + sign for numbers >= 50 (like your original code)
              const displayValue = target >= 50 ? target + "+" : target;
              stat.textContent = displayValue;
              clearInterval(counter);
            } else {
              stat.textContent = count;
            }
          }, stepTime);
        }, index * 300);
      });
    }
  };

  // ---------- STARS RATING EFFECT ----------
  const stars = document.querySelectorAll('.rating-container .star');
  const ratingSection = document.querySelector('.rating-container');
  let starsAnimated = false;

  // Example user ratings (replace with real data from testimonials API later)
  const userRatings = [5, 4, 5, 5, 4]; // array of user ratings 1-5

  const meanRating = userRatings.reduce((a, b) => a + b, 0) / userRatings.length;

  const animateStars = () => {
    const rect = ratingSection.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;

    if (rect.top <= windowHeight * 0.8 && rect.bottom >= 0 && !starsAnimated) {
      starsAnimated = true;

      stars.forEach((star, index) => {
        setTimeout(() => {
          if (index < Math.round(meanRating)) {
            star.classList.add('active');
          }
        }, index * 300); // animate one by one
      });
    }
  };

  // ---------- INITIALIZE EVERYTHING ----------
  
  // First load counters from API
  loadCounters().then(() => {
    // After counters are loaded, set up scroll listeners
    runCounters();
    window.addEventListener('scroll', runCounters);
    window.addEventListener('resize', runCounters);
    
    animateStars();
    window.addEventListener('scroll', animateStars);
    window.addEventListener('resize', animateStars);
  });

});