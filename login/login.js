// login/login.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');

  // Disable HTML5 default validation
  form.setAttribute('novalidate', 'novalidate');

  // Add message container
  const messageBox = document.createElement('div');
  messageBox.classList.add('form-message');
  
  // Find the submit button and insert message box after it
  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.parentNode.insertBefore(messageBox, submitButton.nextSibling);
  } else {
    form.appendChild(messageBox);
  }

  // Add CSS styles for error messages
  if (!document.querySelector('#login-error-styles')) {
    const style = document.createElement('style');
    style.id = 'login-error-styles';
    style.textContent = `
      .form-message {
        margin-top: 15px;
        padding: 12px;
        border-radius: 5px;
        font-size: 14px;
        transition: all 0.3s ease;
      }
      
      .form-message.error {
        background-color: #ffeaea;
        border: 1px solid #ff3860;
        color: #ff3860;
      }
      
      .form-message.success {
        background-color: #eaffea;
        border: 1px solid #36ff8c;
        color: #00a854;
      }
      
      .form-message ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      
      .form-message li {
        margin-bottom: 8px;
        display: flex;
        align-items: flex-start;
      }
      
      .form-message.error li:before {
        content: "❌";
        margin-right: 8px;
      }
    `;
    document.head.appendChild(style);
  }

  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous messages
    messageBox.innerHTML = '';
    messageBox.className = 'form-message';

    const username = form.username.value.trim();
    const password = form.password.value.trim();

    // Array to collect errors
    const errors = [];

    // Validation
    if (!username) {
      errors.push("Username or email is required.");
    }
    
    if (!password) {
      errors.push("Password is required.");
    }

    // If there are validation errors, display them
    if (errors.length > 0) {
      // Create error list
      const errorList = document.createElement('ul');
      
      errors.forEach(error => {
        const li = document.createElement('li');
        li.textContent = error;
        errorList.appendChild(li);
      });
      
      messageBox.appendChild(errorList);
      messageBox.className = 'form-message error';
      
      // Scroll to error message
      messageBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    // Show loading state
    submitButton.disabled = true;
    submitButton.textContent = 'Logging in...';

    try {
      // Prepare data for backend
      const formData = {
        username: username,
        password: password
      };

      // Send data to backend
      const response = await fetch('login_handler.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        // Show success message
        messageBox.textContent = `✅ ${result.message} Welcome back! Redirecting...`;
        messageBox.className = 'form-message success';
        
        console.log('Login successful!');
        console.log('User data:', result.user);
        
        // Store user info in localStorage for frontend use (optional)
        if (result.user) {
          localStorage.setItem('currentUser', JSON.stringify(result.user));
        }
        
        // Redirect to main page after 1.5 seconds
        setTimeout(() => {
          window.location.href = result.redirect || "/skillara/main_page/main.html";
        }, 1500);
      } else {
        // Show error message from backend
        messageBox.innerHTML = `<ul><li>❌ ${result.message}</li></ul>`;
        messageBox.className = 'form-message error';
        
        // Scroll to error message
        messageBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = 'Login';
      }
    } catch (error) {
      // Show network error
      messageBox.innerHTML = `<ul><li>❌ Network error. Please try again.</li></ul>`;
      messageBox.className = 'form-message error';
      
      // Scroll to error message
      messageBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      
      // Re-enable submit button
      submitButton.disabled = false;
      submitButton.textContent = 'Login';
      
      console.error('Login error:', error);
    }
  });
});