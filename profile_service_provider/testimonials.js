let swiperInstance;

const testimonials = [
  { name: "Sarah K.", image: "/images/user-1.jpg", text: "This service is amazing! Highly recommended.", rating: 5 },
  { name: "Ahmed L.", image: "/images/user-2.jpg", text: "Professional and reliable, great experience.", rating: 4 },
  { name: "Lina M.", image: "/images/user-3.jpg", text: "They exceeded my expectations on every level!", rating: 5 },
  { name: "Omar T.", image: "/images/user-4.jpg", text: "Amazing creativity and attention to detail!", rating: 4 },
  { name: "Saliha", image: "/images/user-5.jpg", text: "Is yours", rating: 1 }
];

// Render all testimonials
function renderTestimonials() {
  const wrapper = document.querySelector('.swiper-wrapper');
  wrapper.innerHTML = '';

  testimonials.forEach(t => {
    const slide = document.createElement('div');
    slide.classList.add('swiper-slide');
    slide.innerHTML = `
      <div class="testimonial-bubble">
        <img src="${t.image}" alt="${t.name}">
        <p class="testimonial-text">"${t.text}"</p>
        <p class="user-name">- ${t.name}</p>
        <div class="stars">
          ${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}
        </div>
      </div>
    `;
    wrapper.appendChild(slide);
  });

  // Initialize Swiper only once
  if (!swiperInstance) {
    swiperInstance = new Swiper('.testimonials-swiper', {
      slidesPerView: 3,
      spaceBetween: 40,
      loop: true,
      pagination: { el: '.swiper-pagination', clickable: true },
      navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
      breakpoints: {
        1024: { slidesPerView: 3, spaceBetween: 40 },
        768: { slidesPerView: 2, spaceBetween: 30 },
        480: { slidesPerView: 1, spaceBetween: 20 },
      },
    });
  } else {
    swiperInstance.update();
  }
}

// Add editable testimonial bubble for new ratings
function addEditableTestimonialBubble() {
  const wrapper = document.querySelector('.swiper-wrapper');

  // Prevent multiple editable bubbles
  if (document.querySelector('.editable-testimonial')) return;

  const slide = document.createElement('div');
  slide.classList.add('swiper-slide');

  slide.innerHTML = `
    <div class="testimonial-bubble editable-testimonial">
      <textarea class="testimonial-input" placeholder="Write your testimonial..."></textarea>
      <input class="user-name-input" type="text" placeholder="Your name">
      <select class="rating-input">
        <option value="5">★★★★★</option>
        <option value="4">★★★★☆</option>
        <option value="3">★★★☆☆</option>
        <option value="2">★★☆☆☆</option>
        <option value="1">★☆☆☆☆</option>
      </select>
      <div class="testimonial-buttons">
        <button class="submit-testimonial">Submit</button>
        <button class="cancel-testimonial">Cancel</button>
      </div>
    </div>
  `;

  wrapper.appendChild(slide);
  swiperInstance.update();
  swiperInstance.slideTo(testimonials.length); // move to editable slide

  // Handle submit
  slide.querySelector('.submit-testimonial').addEventListener('click', () => {
    const text = slide.querySelector('.testimonial-input').value.trim();
    const name = slide.querySelector('.user-name-input').value.trim();
    const rating = parseInt(slide.querySelector('.rating-input').value);

    if (!text || !name) {
      alert("Please fill in your name and testimonial!");
      return;
    }

    testimonials.push({
      name,
      image: "/images/default-profile.png",
      text,
      rating
    });

    renderTestimonials(); // Re-render all testimonials
  });

  // Handle cancel
  slide.querySelector('.cancel-testimonial').addEventListener('click', () => {
    slide.remove(); // remove the bubble
    swiperInstance.update(); // update swiper so it doesn't leave empty space
  });
}

// Event listener for "Rate Me" button
document.addEventListener('DOMContentLoaded', () => {
  renderTestimonials();

  const rateBtn = document.getElementById('rateBtn');
  if (rateBtn) {
    rateBtn.addEventListener('click', addEditableTestimonialBubble);
  }
});
