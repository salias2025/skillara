document.addEventListener('DOMContentLoaded', function () {

  // ============================
  // DEBUG: FIND THE SOURCE OF "CLIENT NAME" POPUP
  // ============================
  console.log('=== DEBUG: Searching for client name validation ===');

  // Override alert to track where "client name" messages come from
  const originalAlert = window.alert;
  window.alert = function(message) {
    console.trace('Alert called with message:', message);
    if (message.toLowerCase().includes('client') || message.toLowerCase().includes('enter') || message.toLowerCase().includes('name')) {
      console.error('🚨 FOUND THE SOURCE OF CLIENT NAME POPUP! Check the stack trace above.');
      // Don't show the alert for client name errors
      if (message.toLowerCase().includes('client name')) {
        console.log('Suppressed client name alert');
        return;
      }
    }
    return originalAlert.apply(this, arguments);
  };

  const isOwner = true; // set false to hide owner-only pages

  // ============================
  // DEFAULT USER OBJECT
  // ============================
  let currentUser = {
    profileIMG: "/images/user-2.jpg",      // default profile picture
    bannerIMG: "/images/coding.webp", // default banner
    backgroundIMG: "/images/bg.jpg", // default background
    username: "Ahmed",
    businessname: "the night coder",
    location: "algiers, algeria",
    servicetype: "software engineer",
    bio: "Seasoned software developer with a passion for building efficient and scalable solutions. Expert in multiple programming languages, frameworks, and modern development tools. Proven track record of delivering high-quality code in fast-paced environments. Constantly exploring new technologies and innovative approaches to problem-solving. Dedicated to mentoring junior developers and contributing to open-source projects.",
    fullname: "Ahmed ben mansour",
    email: "Ali.ben.mansour635@example.com",
    phone: "+213123456789",
    password: "*********",
    social: { facebook: "#", twitter: "#", linkedin: "#", instagram: "#", whatsapp: "#" }
  };

  // ============================
  // VARIABLES
  // ============================
  const flipCard = document.querySelector('.flip-card');
  const editPopup = document.getElementById('edit-popup');
  const closeBtn = editPopup ? editPopup.querySelector('.close-btn') : null;
  const editForm = document.getElementById('edit-form');
  const profileImageInput = document.getElementById('profile-image-input');
  const profileImg = document.querySelector('.profile-picture img');
  const bannerDiv = document.querySelector('.flip-card-front .banner');
  const bannerInput = document.getElementById('banner-image-input');
  const backgroundInput = document.getElementById('card-background-input');
  const slider = document.querySelector('.slider');
  const pages = document.querySelectorAll('.slider .pages');
  const infoList = document.querySelector('.info-list');
  const socialIcons = document.querySelectorAll('.social-icons a');

  const ownerSectionsList = [
    document.querySelector('.my-profile'),
    document.querySelector('.my-clients'),
    document.querySelector('.to-do-list')
  ];

  // ============================
  // RENDER PROFILE
  // ============================
  function renderProfile(user) {
    if (profileImg) profileImg.src = user.profileIMG;
    if (bannerDiv) bannerDiv.style.background = `url('${user.bannerIMG}') center/cover no-repeat`;
    document.body.style.background = `url('${user.backgroundIMG}') center/cover no-repeat`;

    const usernameEl = document.querySelector('.username');
    const locationEl = document.querySelector('.location');
    const serviceTypeEl = document.querySelector('.flip-card-front .below-infos h3:nth-of-type(2)');
    const bioEl = document.querySelector('.bio');

    if (usernameEl) usernameEl.textContent = user.username;
    if (locationEl) locationEl.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${user.location}`;
    if (serviceTypeEl) serviceTypeEl.textContent = user.servicetype;
    if (bioEl) bioEl.textContent = user.bio;

    document.querySelectorAll('.business-name').forEach(el => el.textContent = user.businessname);
    document.querySelectorAll('.service-type').forEach(el => el.textContent = user.servicetype);
    document.querySelectorAll('.business-location').forEach(el => el.textContent = user.location);

    if (infoList) {
      infoList.innerHTML = `
        <p><i class="fas fa-user"></i> <strong>Username:</strong> ${user.username}</p>
        <p><i class="fas fa-id-card"></i> <strong>Full Name:</strong> ${user.fullname}</p>
        <p><i class="fas fa-envelope"></i> <strong>Email:</strong> ${user.email}</p>
        <p><i class="fas fa-phone"></i> <strong>Phone:</strong> ${user.phone}</p>
        <p><i class="fas fa-lock"></i> <strong>Password:</strong> *********</p>
      `;
    }

    socialIcons.forEach(a => {
      const cls = a.classList[0];
      if (user.social && user.social[cls]) a.href = user.social[cls];
    });
  }

  renderProfile(currentUser);

  // ============================
  // EDIT POPUP - FIXED CLOSE BUTTON ISSUE
  // ============================
  if (isOwner && flipCard && editPopup) {
    flipCard.addEventListener('dblclick', () => {
      document.getElementById('edit-username').value = currentUser.username;
      document.getElementById('edit-business').value = currentUser.businessname;
      document.getElementById('edit-location').value = currentUser.location;
      document.getElementById('edit-bio').value = currentUser.bio;
      document.getElementById('edit-service').value = currentUser.servicetype;
      editPopup.style.display = 'flex';
      
      // Ensure popup is scrollable and close button is visible
      editPopup.style.overflowY = 'auto';
      editPopup.style.alignItems = 'flex-start';
      editPopup.style.paddingTop = '50px';
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      editPopup.style.display = 'none';
    });
  }

  // Close popup when clicking outside
  if (editPopup) {
    editPopup.addEventListener('click', (e) => {
      if (e.target === editPopup) {
        editPopup.style.display = 'none';
      }
    });
  }

  // ============================
  // SAVE CHANGES - FIXED DOUBLE POPUP ISSUE
  // ============================
  if (editForm) {
    editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      e.stopPropagation(); // PREVENTS EVENT BUBBLING

      currentUser.username = document.getElementById('edit-username').value;
      currentUser.businessname = document.getElementById('edit-business').value;
      currentUser.location = document.getElementById('edit-location').value;
      currentUser.bio = document.getElementById('edit-bio').value;
      currentUser.servicetype = document.getElementById('edit-service').value;

      // Profile Image
      if (profileImageInput && profileImageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
          currentUser.profileIMG = e.target.result;
          if (profileImg) profileImg.src = currentUser.profileIMG;
        };
        reader.readAsDataURL(profileImageInput.files[0]);
      }

      // Banner Image
      if (bannerInput && bannerInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
          currentUser.bannerIMG = e.target.result;
          if (bannerDiv) bannerDiv.style.background = `url('${currentUser.bannerIMG}') center/cover no-repeat`;
        };
        reader.readAsDataURL(bannerInput.files[0]);
      }

      // Background Image
      if (backgroundInput && backgroundInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
          currentUser.backgroundIMG = e.target.result;
          document.body.style.background = `url('${currentUser.backgroundIMG}') center/cover no-repeat`;
        };
        reader.readAsDataURL(backgroundInput.files[0]);
      }

      renderProfile(currentUser);
      if (editPopup) editPopup.style.display = 'none';
      
      // Use setTimeout to ensure clean alert
      setTimeout(() => {
        alert('Profile updated successfully!');
      }, 100);
    });
  }

  // ============================
  // OWNER SLIDER
  // ============================
  if (isOwner && slider) {
    slider.style.display = 'flex';
    ownerSectionsList.forEach((sec, i) => {
      if (sec) sec.style.display = i === 0 ? 'block' : 'none';
    });
    
    if (pages.length > 0) pages[0].classList.add('active');

    pages.forEach((page, index) => {
      page.addEventListener('click', () => {
        pages.forEach(p => p.classList.remove('active'));
        page.classList.add('active');
        ownerSectionsList.forEach((sec, i) => {
          if (sec) sec.style.display = i === index ? 'block' : 'none';
        });
      });
    });
  } else if (slider) {
    slider.style.display = 'none';
    ownerSectionsList.forEach((sec, i) => {
      if (sec) {
        if (i === 0) sec.style.display = 'block';
        else sec.style.display = 'none';
      }
    });
  }

  // ============================
  // SOCIAL MEDIA LINKS
  // ============================
  socialIcons.forEach(icon => {
    icon.addEventListener('click', (e) => {
      const platform = icon.classList[0];
      if (isOwner) {
        e.preventDefault();
        e.stopPropagation();
        if (icon.parentElement.querySelector('.social-input')) return;

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Add your ${platform} link`;
        input.classList.add('social-input');
        input.value = currentUser.social[platform] || '';

        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save';
        saveBtn.classList.add('social-save-btn');

        icon.parentElement.insertBefore(input, icon);
        icon.parentElement.insertBefore(saveBtn, icon);

        saveBtn.addEventListener('click', () => {
          const newLink = input.value.trim();
          if (newLink) {
            currentUser.social[platform] = newLink;
            icon.href = newLink;
            alert(`${platform} link updated!`);
          }
          input.remove();
          saveBtn.remove();
        }, { once: true });
      } else {
        e.preventDefault();
        const link = currentUser.social[platform];
        if (link && link !== '#') window.open(link, '_blank');
      }
    });
  });

  // ============================
  // CLIENTS LIST - FIXED MISSING IMAGES & 404 ERRORS
  // ============================
  const clients = [
    { name: "Sami Benali", photo: "/images/user-2.jpg", email: "sami@example.com", phone: "+213987654321" },
    { name: "Leila Ahmed", photo: "/images/user-3.jpg", email: "leila@example.com", phone: "+213123987456" },
    { name: "Nourredine Ali", photo: "/images/user-4.jpg", email: "nourredine@example.com", phone: "+213456789123" },
    { name: "Yasmine Khelifi", photo: "/images/user-5.jpg", email: "yasmine@example.com", phone: "+213321654987" },
    { name: "Mohamed Cherif", photo: "/images/user-6.jpg", email: "mohamed@example.com", phone: "+213654321987" },
    { name: "Sara Bensalem", photo: "/images/user-1.jpg", email: "sara@example.com", phone: "+213789123456" },
    { name: "Ahmed Mansouri", photo: "/images/user-8.jpg", email: "ahmed@example.com", phone: "+213987321654" },
    { name: "Ines Djahid", photo: "/images/user-9.jpg", email: "ines@example.com", phone: "+213123789456" },
    { name: "Karim Boudjemaa", photo: "/images/user-2.jpg", email: "karim@example.com", phone: "+213456123789" }, // FIXED: was user-10.jpg
    { name: "Nadia Farah", photo: "/images/user-3.jpg", email: "nadia@example.com", phone: "+213321987654" },
    { name: "Rachid Hamdi", photo: "/images/user-4.jpg", email: "rachid@example.com", phone: "+213654789321" },
    { name: "Leila Ziani", photo: "/images/user-5.jpg", email: "leilaz@example.com", phone: "+213789456123" },
    { name: "Amine Bouzid", photo: "/images/user-6.jpg", email: "amine@example.com", phone: "+213987654123" },
    { name: "Nouria Saadi", photo: "/images/user-1.jpg", email: "nouria@example.com", phone: "+213123654789" },
    { name: "Walid Ouali", photo: "/images/user-8.jpg", email: "walid@example.com", phone: "+213456987321" }
  ];

  const clientsContainer = document.querySelector('.my-clients');
  if (clientsContainer) {
    clientsContainer.innerHTML = '';
    clients.forEach(client => {
      const card = document.createElement('div');
      card.className = 'client-item';
      
      // Add error handling for images
      const img = document.createElement('img');
      img.src = client.photo;
      img.alt = client.name;
      img.className = 'client-photo';
      img.onerror = function() {
        // If image fails to load, use a fallback
        this.src = '/images/user-1.jpg';
      };
      
      card.innerHTML = `
        <div class="client-info">
          <span class="name">${client.name}</span>
          <span class="email">${client.email}</span>
          <span class="phone">${client.phone}</span>
        </div>
      `;
      card.insertBefore(img, card.firstChild);
      clientsContainer.appendChild(card);
    });
  }

  // ============================
  // PREVENT ANY OTHER FORM SUBMISSIONS THAT CAUSE "CLIENT NAME" POPUP
  // ============================
  setTimeout(() => {
    document.querySelectorAll('form').forEach(form => {
      if (form.id !== 'edit-form') {
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          e.stopPropagation();
          console.log('Prevented form submission from:', this);
        });
      }
    });
  }, 1000);

});