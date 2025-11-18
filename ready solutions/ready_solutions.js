const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.querySelector('.mobile-menu');

// عند الضغط على زر الهامبرغر
menuToggle.addEventListener('click', (e) => {
  e.stopPropagation(); // منع الحدث من الوصول للـ document
  mobileMenu.classList.toggle('active');
});

// إخفاء القائمة عند الضغط في أي مكان آخر
document.addEventListener('click', (e) => {
  // إذا كان العنصر المضغوط ليس داخل القائمة أو الزر
  if (!mobileMenu.contains(e.target) && e.target !== menuToggle) {
    mobileMenu.classList.remove('active');
  }
});



const searchInput = document.querySelector('form input');
const cards = document.querySelectorAll('.cards-container .card');

searchInput.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    const query = searchInput.value.toLowerCase();

    cards.forEach(card => {
      const title = card.querySelector('h4').textContent.toLowerCase();
      const desc = card.querySelector('p').textContent.toLowerCase();

      if (title.includes(query) || desc.includes(query)) {
        card.style.display = ''; // ← مهم: يترك Flex كما هو
      } else {
        card.style.display = 'none';
      }
    });
  }
});