// registration/register.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const providerFields = document.getElementById('providerFields');
  const roleRadios = document.querySelectorAll('input[name="role"]');

  // Disable HTML5 default validation
  form.setAttribute('novalidate', 'novalidate');

  // Toggle provider fields visibility
  roleRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (document.querySelector('input[name="role"]:checked').value === 'provider') {
        providerFields.classList.add('show');
      } else {
        providerFields.classList.remove('show');
      }
    });
  });

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
  if (!document.querySelector('#register-error-styles')) {
    const style = document.createElement('style');
    style.id = 'register-error-styles';
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
    
    let errors = [];

    const fullName = form.full_name.value.trim();
    const username = form.username.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const password = form.password.value.trim();
    const confirmPassword = form.confirm_password.value.trim();
    const role = document.querySelector('input[name="role"]:checked')?.value;

    // Validation
    const nameRegex = /^[A-Za-z\s]{2,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Algerian phone number validation - ONLY 05, 06, or 07 followed by 8 digits
    const phoneRegex = /^0[567][0-9]{8}$/;
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;

    // Validate role selection
    if (!role) {
      errors.push("Please select a role (Client or Service Provider).");
    }

    if (!fullName || !nameRegex.test(fullName)) {
      errors.push("Full Name must be at least 2 letters and contain only alphabets.");
    }
    
    if (!username || username.length < 3) {
      errors.push("Username must be at least 3 characters.");
    }
    
    if (!email || !emailRegex.test(email)) {
      errors.push("Please enter a valid email address.");
    }
    
    // Clean phone number for validation (remove all non-digit characters)
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (!cleanPhone) {
      errors.push("Phone number is required.");
    } else if (!phoneRegex.test(cleanPhone)) {
      errors.push("Please enter a valid Algerian phone number starting with 05, 06, or 07 followed by 8 digits (10 digits total). Example: 05XX XX XX XX");
    }
    
    if (!password || !passwordRegex.test(password)) {
      errors.push("Password must be at least 6 characters and include uppercase, lowercase, number, and special character.");
    }

    if (!confirmPassword) {
      errors.push("Please confirm your password.");
    } else if (password !== confirmPassword) {
      errors.push("Passwords do not match.");
    }

    let location = "";
    let serviceType = "";
    let businessName = "";

    if (role === "provider") {
      serviceType = form.service_type.value.trim();
      businessName = form.business_name.value.trim();
      location = form.location.value.trim();

      if (!serviceType) errors.push("Service Type is required.");
      if (!businessName) errors.push("Business Name is required.");
      if (!location) errors.push("Location is required.");
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
    submitButton.textContent = 'Registering...';

    try {
      // Prepare data for backend
      const formData = {
        full_name: fullName,
        username: username,
        email: email,
        phone: cleanPhone,
        password: password,
        role: role
      };

      // Add provider-specific fields if applicable
      if (role === "provider") {
        formData.location = location;
        formData.service_type = serviceType;
        formData.business_name = businessName;
      }

      // Send data to backend
      const response = await fetch('registration_handler.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        // Show success message
        messageBox.textContent = "✅ " + result.message;
        messageBox.className = 'form-message success';
        
        console.log('Registration successful!');
        console.log('User data:', result);
        
        // Redirect to main page after 2 seconds
        setTimeout(() => {
          window.location.href = result.redirect || "/skillara/main_page/main.html";
        }, 2000);
      } else {
        // Show error message from backend
        messageBox.innerHTML = `<ul><li>❌ ${result.message}</li></ul>`;
        messageBox.className = 'form-message error';
        
        // Scroll to error message
        messageBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = 'Register';
      }
    } catch (error) {
      // Show network error
      messageBox.innerHTML = `<ul><li>❌ Network error. Please try again.</li></ul>`;
      messageBox.className = 'form-message error';
      
      // Scroll to error message
      messageBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      
      // Re-enable submit button
      submitButton.disabled = false;
      submitButton.textContent = 'Register';
      
      console.error('Registration error:', error);
    }
  });
});