document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const hamburger = document.querySelector('.hamburger');
  const sidebar = document.querySelector('.sidebar');
  const closeBtn = document.querySelector('.sidebar .close-btn');
  const overlay = document.querySelector('.overlay');
  const sidebarMenuItems = document.querySelectorAll('.sidebar-menu li');
  const navbarMenuItems = document.querySelectorAll('.menus li');

  // ---------- SIDEBAR FUNCTIONS ----------
  function openSidebar() {
    sidebar.classList.add('active');
    overlay.classList.add('active');
    hamburger.classList.add('active'); // hamburger animation
  }

  function closeSidebar() {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    hamburger.classList.remove('active'); // hamburger animation
  }

  // Hamburger click
  hamburger.addEventListener('click', () => {
    sidebar.classList.contains('active') ? closeSidebar() : openSidebar();
  });

  // Sidebar close button
  closeBtn.addEventListener('click', closeSidebar);

  // Overlay click
  overlay.addEventListener('click', closeSidebar);

  // ---------- NAVIGATION FUNCTIONALITY ----------
  function navigateToSection(sectionName) {
    // Map menu text to actual section IDs
    const sectionMap = {
      'profile': 'profile-info',
      'services': 'services',
      'skills': 'skills', 
      'certifications': 'certifications',
      'testimonials': 'testimonials'
    };

    const sectionId = sectionMap[sectionName.toLowerCase()];
    
    if (sectionId) {
      const section = document.getElementById(sectionId);
      if (section) {
        // Close sidebar if open (for mobile)
        closeSidebar();
        
        // Scroll to section
        section.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });

        // Update active states
        updateActiveStates(sectionName);
      } else {
        console.warn(`Section with ID '${sectionId}' not found`);
      }
    }
  }

  function updateActiveStates(activeSection) {
    // Update both navbar and sidebar active states
    const allMenuItems = [...navbarMenuItems, ...sidebarMenuItems];
    
    allMenuItems.forEach(item => {
      const itemText = item.textContent.trim().toLowerCase();
      if (itemText === activeSection.toLowerCase()) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  // ---------- SIDEBAR MENU CLICK HANDLERS ----------
  sidebarMenuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionName = item.textContent.trim().replace(/[^a-zA-Z]/g, '');
      navigateToSection(sectionName);
    });
  });

  // ---------- NAVBAR MENU CLICK HANDLERS ----------
  navbarMenuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionName = item.textContent.trim().replace(/[^a-zA-Z]/g, '');
      navigateToSection(sectionName);
    });
  });

  // ---------- CLICK OUTSIDE SIDEBAR ----------
  document.addEventListener('click', (e) => {
    if (
      sidebar.classList.contains('active') &&
      !sidebar.contains(e.target) &&
      !hamburger.contains(e.target) &&
      !overlay.contains(e.target)
    ) {
      closeSidebar();
    }
  });

  // ---------- ESCAPE KEY CLOSES SIDEBAR ----------
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSidebar();
  });

  // ---------- INITIAL ACTIVE STATE ----------
  // Set initial active state to Profile
  updateActiveStates('profile');

  // ---------- ENSURE ALL SECTIONS ARE VISIBLE ----------
  // Make sure all sections are visible for navigation
  const allSections = document.querySelectorAll('.section');
  allSections.forEach(section => {
    section.style.display = 'block';
  });
});