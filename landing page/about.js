document.addEventListener('DOMContentLoaded', () => {

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
        const target = +stat.getAttribute('data-target');
        let count = 0;

        setTimeout(() => {
          const duration = 2000;
          const stepTime = Math.floor(duration / target);

          const counter = setInterval(() => {
            count += 1;
            if (count >= target) {
              stat.textContent = target + (target >= 50 ? "+" : "");
              clearInterval(counter);
            } else {
              stat.textContent = count;
            }
          }, stepTime);
        }, index * 300);
      });
    }
  };

  runCounters();
  window.addEventListener('scroll', runCounters);
  window.addEventListener('resize', runCounters);

  // ---------- STARS RATING EFFECT ----------
  const stars = document.querySelectorAll('.rating-container .star');
  const ratingSection = document.querySelector('.rating-container');
  let starsAnimated = false;

  // Example user ratings (replace with your real data)
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

  animateStars();
  window.addEventListener('scroll', animateStars);
  window.addEventListener('resize', animateStars);

});
