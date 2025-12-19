document.addEventListener('DOMContentLoaded', async function () {
  
  // Fetch testimonials from API
  try {
    const response = await fetch('testimonials_handler.php');
    const data = await response.json();
    
    if (data.success && data.testimonials.length > 0) {
      generateTestimonialSlides(data.testimonials);
      initializeSwiper();
    } else {
      // Use fallback if no testimonials from API
      useFallbackTestimonials();
    }
  } catch (error) {
    console.error('Error loading testimonials:', error);
    useFallbackTestimonials();
  }

  // Your existing functions here...
  function generateStars(rating) {
    let starsHTML = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      starsHTML += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
      starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      starsHTML += '<i class="far fa-star"></i>';
    }
    
    return `<div class="rating">${starsHTML}</div>`;
  }

  function generateTestimonialSlides(testimonialsArray) {
    const swiperWrapper = document.querySelector('.swiper-wrapper');
    swiperWrapper.innerHTML = '';
    
    testimonialsArray.forEach(testimonial => {
      // Use the profile_picture with correct path from PHP
      const imageSrc = testimonial.profile_picture || '/skillara/uploads/profile/default_avatar.jpg';
      
      const slideHTML = `
        <div class="swiper-slide">
          <div class="testimonial-bubble">
            <img src="${imageSrc}" 
                 alt="${testimonial.client_name || 'User'}" 
                 onerror="this.src='/skillara/uploads/profile/default_avatar.jpg'">
            ${generateStars(testimonial.star_rating || 4.5)}
            <p class="testimonial-text">"${testimonial.message || 'Great service!'}"</p>
            <p class="user-name">- ${testimonial.client_name || 'Anonymous'}</p>
          </div>
        </div>
      `;
      
      swiperWrapper.insertAdjacentHTML('beforeend', slideHTML);
    });
  }

  function initializeSwiper() {
    new Swiper('.testimonials-swiper', {
      slidesPerView: 3,
      spaceBetween: 40,
      loop: true,
      autoplay: { delay: 3000, disableOnInteraction: false },
      pagination: { el: '.swiper-pagination', clickable: true },
      navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
      breakpoints: {
        1024: { slidesPerView: 3, spaceBetween: 40 },
        768: { slidesPerView: 2, spaceBetween: 30 },
        480: { slidesPerView: 1, spaceBetween: 20 },
      },
    });
  }

  function useFallbackTestimonials() {
    // Your existing hardcoded testimonials
    const testimonialsData = [
      {
        id: 1,
        name: "Sarah Karima.",
        image: "/skillara/uploads/profile/default_avatar.jpg",
        text: "This service is amazing! Highly recommended.",
        rating: 4.5
      },
      // ... rest of your hardcoded data
    ];
    
    // Convert to match database structure
    const convertedData = testimonialsData.map(t => ({
      client_name: t.name,
      profile_picture: t.image,
      message: t.text,
      star_rating: t.rating
    }));
    
    generateTestimonialSlides(convertedData);
    initializeSwiper();
  }

});