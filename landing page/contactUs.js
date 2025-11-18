document.addEventListener('DOMContentLoaded', () => {
  const contactSection = document.querySelector('.contact-section');
  const form = contactSection.querySelector('form');
  const inputs = form.querySelectorAll('input, textarea');

  // ---------- Animate form on scroll ----------
  const animateForm = () => {
    const rect = contactSection.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;

    if (rect.top <= windowHeight * 0.8 && rect.bottom >= 0) {
      form.classList.add('visible');
    }
  };

  animateForm();
  window.addEventListener('scroll', animateForm);
  window.addEventListener('resize', animateForm);

  // ---------- Floating labels ----------
  inputs.forEach(input => {
    input.addEventListener('focus', () => input.parentElement.classList.add('focused'));
    input.addEventListener('blur', () => {
      if (input.value === '') {
        input.parentElement.classList.remove('focused');
      }
    });
  });

  // ---------- Add message container ----------
  const messageBox = document.createElement('div');
  messageBox.classList.add('form-message');
  form.appendChild(messageBox);

  // ---------- Form submission ----------
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.querySelector('#name').value.trim();
    const email = form.querySelector('#email').value.trim();
    const message = form.querySelector('#message').value.trim();

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !email || !message) {
      messageBox.textContent = "Please fill in all fields.";
      messageBox.className = 'form-message error';
      return;
    }

    if (!emailRegex.test(email)) {
      messageBox.textContent = "Please enter a valid email address.";
      messageBox.className = 'form-message error';
      return;
    }

    // Success
    messageBox.textContent = "✅ Your message has been successfully sent!";
    messageBox.className = 'form-message success';

    form.reset();
    inputs.forEach(input => input.parentElement.classList.remove('focused'));
  });
});
