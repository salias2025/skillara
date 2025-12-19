document.addEventListener('DOMContentLoaded', () => {
  const contactSection = document.querySelector('.contact-section');
  const form = contactSection.querySelector('form');
  const inputs = form.querySelectorAll('input, textarea');

  // ---------- Disable HTML5 default validation ----------
  form.setAttribute('novalidate', 'novalidate');

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
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    messageBox.textContent = '';
    messageBox.className = 'form-message';
    
    // CHANGED: #name to #username
    const username = form.querySelector('#username').value.trim();
    const email = form.querySelector('#email').value.trim();
    const message = form.querySelector('#message').value.trim();

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Check for errors (UPDATED for username)
    const errors = [];
    
    // CHANGED: Name validation to Username validation
    if (!username) {
      errors.push("Username is required.");
    }
    
    if (!email) {
      errors.push("Email is required.");
    } else if (!emailRegex.test(email)) {
      errors.push("Please enter a valid email address.");
    }
    
    if (!message) {
      errors.push("Message is required.");
    } else if (message.length < 10) {
      errors.push("Message must be at least 10 characters long.");
    } else if (message.length > 100) {
      errors.push("Message must not exceed 100 characters.");
    }

    // If there are errors, display them (YOUR EXACT STYLE)
    if (errors.length > 0) {
      messageBox.innerHTML = errors.map(error => 
        `<span style="color: #ff3860; display: block; margin-bottom: 5px;">❌ ${error}</span>`
      ).join('');
      messageBox.className = 'form-message error';
      return;
    }

    // Show loading state
    const submitBtn = form.querySelector('input[type="submit"]');
    const originalBtnText = submitBtn.value;
    submitBtn.value = 'Sending...';
    submitBtn.disabled = true;

    try {
      // Send to server - CHANGED: 'name' to 'username'
      const formData = new FormData();
      formData.append('username', username);  // CHANGED HERE
      formData.append('email', email);
      formData.append('message', message);

      const response = await fetch('contactUs_handler.php', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        // Success - YOUR EXACT SUCCESS STYLE
        messageBox.textContent = "✅ " + result.message;
        messageBox.className = 'form-message success';

        form.reset();
        inputs.forEach(input => input.parentElement.classList.remove('focused'));
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          messageBox.textContent = '';
          messageBox.className = 'form-message';
        }, 5000);
      } else {
        // Server error - USING YOUR ERROR STYLE
        messageBox.innerHTML = `<span style="color: #ff3860; display: block; margin-bottom: 5px;">❌ ${result.message}</span>`;
        messageBox.className = 'form-message error';
      }

    } catch (error) {
      // Network error - USING YOUR ERROR STYLE
      messageBox.innerHTML = `<span style="color: #ff3860; display: block; margin-bottom: 5px;">❌ Network error. Please try again.</span>`;
      messageBox.className = 'form-message error';
    } finally {
      // Restore button
      submitBtn.value = originalBtnText;
      submitBtn.disabled = false;
    }
  });
});