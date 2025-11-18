document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');

 
  const users = [
    {
      fullName: "John Customer",
      username: "john123",
      email: "john@example.com",
      phone: "1234567890",
      password: "Test123!",
      role: "customer"
    },
    {
      fullName: "Sarah Provider", 
      username: "sarah456",
      email: "sarah@example.com",
      phone: "0987654321",
      password: "Test123!",
      role: "provider",
      serviceType: "Web Development",
      businessName: "Sarah Tech Solutions", 
      location: "New York, USA"
    },
    {
      fullName: "Ahmed Ben Mansour",
      username: "ahmed789", 
      email: "ahmed@example.com",
      phone: "0551234567",
      password: "Test123!",
      role: "provider",
      serviceType: "Software Engineer",
      businessName: "The Night Coder",
      location: "Algiers, Algeria"
    }
  ];

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = form.username.value.trim();
    const password = form.password.value.trim();

    // Simple validation
    if (!username || !password) {
      alert("Please enter both username and password.");
      return;
    }

    if (username.length < 3 || password.length < 6) {
      alert("Username must be at least 3 characters and password at least 6 characters.");
      return;
    }

    
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      alert(`✅ Login successful! Welcome back, ${user.fullName}!`);
      console.log("Logged in user:", user);
      
      
      if (user.role === 'provider') {
        window.location.href = "/provider-dashboard/provider-dashboard.html";
      } else {
        window.location.href = "/main page/main.html";
      }
    } else {
      alert("❌ Invalid username or password.");
    }
  });
});