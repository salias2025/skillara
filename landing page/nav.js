const slider = document.querySelector('.slider');
const menuItems = document.querySelectorAll('.menus li');
const hamburger = document.querySelector('.hamburger');
const sidebar = document.querySelector('.sidebar');
const closeBtn = document.querySelector('.close-btn');

// Move slider under active menu item (desktop)
function moveSlider(element) {
    if (slider && element) {
        slider.style.width = element.offsetWidth + "px";
        slider.style.left = element.offsetLeft + "px";
    }
}

// Initialize slider on page load (desktop only)
const activeItem = document.querySelector('.menus li.active');
if (activeItem && window.innerWidth > 768) {
    moveSlider(activeItem);
}

// Add click event to each menu item (desktop)
menuItems.forEach(item => {
    item.addEventListener('click', () => {
        menuItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        if (window.innerWidth > 768) moveSlider(item);
    });
});

// Toggle sidebar (mobile)
if (hamburger && sidebar) {
    hamburger.addEventListener('click', () => {
        sidebar.classList.add('active');
    });
}

if (closeBtn && sidebar) {
    closeBtn.addEventListener('click', () => {
        sidebar.classList.remove('active');
    });
}

// Optional: close sidebar when clicking outside it
document.addEventListener('click', (e) => {
    if (
        sidebar.classList.contains('active') &&
        !sidebar.contains(e.target) &&
        !hamburger.contains(e.target)
    ) {
        sidebar.classList.remove('active');
    }
});
