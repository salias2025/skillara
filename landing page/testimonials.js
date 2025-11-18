document.addEventListener('DOMContentLoaded', function () {
  const swiper = new Swiper('.testimonials-swiper', {
    slidesPerView: 3,
    spaceBetween: 40, 
    loop: true,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    breakpoints: {
      1024: { slidesPerView: 3, spaceBetween: 40 },
      768: { slidesPerView: 2, spaceBetween: 30 },
      480: { slidesPerView: 1, spaceBetween: 20 },
    },
  });
});
