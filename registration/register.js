document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const providerFields = document.getElementById('providerFields');
  const roleRadios = document.querySelectorAll('input[name="role"]');

  // Global users array (in-memory storage)
  let users = [];

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

  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let errors = [];

    const fullName = form.full_name.value.trim();
    const username = form.username.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const password = form.password.value.trim();
    const role = document.querySelector('input[name="role"]:checked').value;

    // Validation
    const nameRegex = /^[A-Za-z\s]{2,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;

    if (!nameRegex.test(fullName)) errors.push("Full Name must be at least 2 letters and contain only alphabets.");
    if (username.length < 3) errors.push("Username must be at least 3 characters.");
    if (!emailRegex.test(email)) errors.push("Please enter a valid email address.");
    if (!phoneRegex.test(phone)) errors.push("Phone number must contain exactly 10 digits.");
    if (!passwordRegex.test(password)) errors.push("Password must be at least 6 characters and include uppercase, lowercase, number, and special character.");

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

    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    // Create user object
    const newUser = {
      fullName,
      username,
      email,
      phone,
      password,
      role,
      serviceType,
      businessName,
      location
    };

    // Check if username or email already exists in the users array
    const exists = users.some(user => user.username === username || user.email === email);
    if (exists) {
      alert("❌ Username or email already exists!");
      return;
    }

    // Add new user to the array
    users.push(newUser);

    // Store current user in a separate variable for session simulation
    let currentUser = newUser;

    alert("✅ Registration successful!");
    console.log('Registered users:', users); // For debugging - you can see all users in console
    console.log('Current user:', currentUser); // For debugging - current logged in user
    
    // Redirect to main page
    window.location.href = "/main page/main.html";
  });
});