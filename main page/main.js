// Set the user type
const currentUserType = 'customer'; 

// ===== PROVIDER DATA =====
const providersData = [
    {
        id: 1,
        name: "Jane Doe",
        service: "Full Stack Developer",
        rating: 4.9,
        email: "jane.doe@example.com",
        bio: "Full Stack Developer with 8+ years of experience in building scalable web applications. I specialize in JavaScript, React, Node.js, and modern cloud technologies. Passionate about creating user-friendly interfaces and robust backend systems.",
        profileImage: "/images/user-2.jpg",
        skills: [
            { name: "React", icon: "⚛️" },
            { name: "Node.js", icon: "🟢" },
            { name: "JavaScript", icon: "📜" },
            { name: "Cloud", icon: "☁️" }
        ]
    },
    {
        id: 2,
        name: "John Smith", 
        service: "Web Designer",
        rating: 4.8,
        email: "john.smith@example.com",
        bio: "Creative Web Designer with a passion for crafting beautiful, functional websites. I combine aesthetics with usability to create digital experiences that engage users and drive results.",
        profileImage: "/images/user-3.jpg",
        skills: [
            { name: "UI/UX Design", icon: "🎨" },
            { name: "Responsive", icon: "📱" },
            { name: "Branding", icon: "🏷️" },
            { name: "Prototyping", icon: "📐" }
        ]
    },
    {
        id: 3,
        name: "Alice Johnson",
        service: "UI/UX Designer", 
        rating: 4.7,
        email: "alice.johnson@example.com",
        bio: "UI/UX Designer focused on creating intuitive and engaging user experiences. I believe great design solves problems and creates emotional connections.",
        profileImage: "/images/user-4.jpg",
        skills: [
            { name: "User Research", icon: "🔍" },
            { name: "Wireframing", icon: "📊" },
            { name: "Interaction Design", icon: "🖱️" },
            { name: "User Testing", icon: "✅" }
        ]
    },
    {
        id: 4,
        name: "Michael Brown",
        service: "Frontend Developer",
        rating: 4.8,
        email: "michael.brown@example.com",
        bio: "Frontend Developer specializing in modern JavaScript frameworks and performance optimization. I build fast, accessible, and maintainable web applications.",
        profileImage: "/images/user-5.jpg",
        skills: [
            { name: "Vue.js", icon: "🟢" },
            { name: "TypeScript", icon: "📘" },
            { name: "Performance", icon: "⚡" },
            { name: "Accessibility", icon: "♿" }
        ]
    },
    {
        id: 5,
        name: "Emma Wilson",
        service: "Graphic Designer",
        rating: 4.9,
        email: "emma.wilson@example.com",
        bio: "Graphic Designer with a passion for visual storytelling and brand identity. I create compelling designs that communicate your message effectively.",
        profileImage: "/images/user-6.jpg",
        skills: [
            { name: "Logo Design", icon: "✨" },
            { name: "Brand Identity", icon: "🎯" },
            { name: "Print Design", icon: "🖨️" },
            { name: "Illustration", icon: "✏️" }
        ]
    },
    {
        id: 6,
        name: "David Lee",
        service: "Backend Developer",
        rating: 4.6,
        email: "david.lee@example.com",
        bio: "Backend Developer focused on building scalable and secure server-side applications. I specialize in database design, API development, and cloud infrastructure.",
        profileImage: "/images/user-7.avif",
        skills: [
            { name: "Database Design", icon: "🗄️" },
            { name: "API Development", icon: "🔗" },
            { name: "Cloud Services", icon: "☁️" },
            { name: "Security", icon: "🔒" }
        ]
    },
    {
        id: 7,
        name: "Sophia Martinez",
        service: "Mobile App Developer",
        rating: 4.7,
        email: "sophia.martinez@example.com",
        bio: "Mobile App Developer creating cross-platform applications for iOS and Android. I focus on delivering smooth, native-like experiences using modern frameworks.",
        profileImage: "/images/user-8.jpg",
        skills: [
            { name: "React Native", icon: "📱" },
            { name: "Flutter", icon: "📲" },
            { name: "App Store", icon: "🏪" },
            { name: "Push Notifications", icon: "🔔" }
        ]
    }
];

// ===== NAVIGATION FUNCTION =====
function navigateTo(page) {
    const routes = {
        'home': '/landing page/index.html',
        'free-help': '/free solutions/free_solution.html', 
        'ready-help': '/ready solutions/ready_solutions.html',
        'contact': '/landing page/index.html#contact'
    };

    if (routes[page]) {
        window.location.href = routes[page];
    } else {
        console.warn('Unknown page:', page);
    }
}

// Make function global
window.navigateTo = navigateTo;

document.addEventListener("DOMContentLoaded", () => {
    
    const container = document.querySelector(".cards-container");
    const searchInput = document.querySelector("header form input");

    // ===== COMPLETE CARD DATA =====
    const cardsData = [
        {
            name: "Jane Doe",
            profession: "Full Stack Developer",
            location: "New York",
            rating: 4,
            img: "/images/user-2.jpg",
            icons: [
                { class: "fa-brands fa-facebook", link: "https://facebook.com" },
                { class: "fa-brands fa-square-instagram", link: "https://instagram.com" },
                { class: "fa-solid fa-envelope", link: "mailto:jane@example.com" },
                { class: "fa-solid fa-map-location-dot", link: " https://www.google.com/maps" }
            ]
        },
        {
            name: "John Smith",
            profession: "Web Designer",
            location: "Los Angeles",
            rating: 5,
            img: "/images/user-3.jpg",
            icons: [
                { class: "fa-brands fa-facebook", link: "https://facebook.com" },
                { class: "fa-brands fa-square-instagram", link: "https://instagram.com" },
                { class: "fa-solid fa-envelope", link: "mailto:john@example.com" },
                { class: "fa-solid fa-map-location-dot", link: " https://www.google.com/maps" }
            ]
        },
        {
            name: "Alice Johnson",
            profession: "UI/UX Designer",
            location: "Chicago",
            rating: 3,
            img: "/images/user-4.jpg",
            icons: [
                { class: "fa-brands fa-facebook", link: "https://facebook.com" },
                { class: "fa-brands fa-square-instagram", link: "https://instagram.com" },
                { class: "fa-solid fa-envelope", link: "mailto:alice@example.com" },
                { class: "fa-solid fa-map-location-dot", link: " https://www.google.com/maps" }
            ]
        },
        {
            name: "Michael Brown",
            profession: "Frontend Developer",
            location: "San Francisco",
            rating: 4,
            img: "/images/user-5.jpg",
            icons: [
                { class: "fa-brands fa-facebook", link: "https://facebook.com" },
                { class: "fa-brands fa-square-instagram", link: "https://instagram.com" },
                { class: "fa-solid fa-envelope", link: "mailto:michael@example.com" },
                { class: "fa-solid fa-map-location-dot", link: " https://www.google.com/maps" }
            ]
        },
        {
            name: "Emma Wilson",
            profession: "Graphic Designer",
            location: "Boston",
            rating: 5,
            img: "/images/user-6.jpg",
            icons: [
                { class: "fa-brands fa-facebook", link: "https://facebook.com" },
                { class: "fa-brands fa-square-instagram", link: "https://instagram.com" },
                { class: "fa-solid fa-envelope", link: "mailto:emma@example.com" },
                { class: "fa-solid fa-map-location-dot", link: " https://www.google.com/maps" }
            ]
        },
        {
            name: "David Lee",
            profession: "Backend Developer",
            location: "Seattle",
            rating: 4,
            img: "/images/user-7.avif",
            icons: [
                { class: "fa-brands fa-facebook", link: "https://facebook.com" },
                { class: "fa-brands fa-square-instagram", link: "https://instagram.com" },
                { class: "fa-solid fa-envelope", link: "mailto:david@example.com" },
                { class: "fa-solid fa-map-location-dot", link: " https://www.google.com/maps" }
            ]
        },
        {
            name: "Sophia Martinez",
            profession: "Mobile App Developer",
            location: "Miami",
            rating: 3,
            img: "/images/user-8.jpg",
            icons: [
                { class: "fa-brands fa-facebook", link: "https://facebook.com" },
                { class: "fa-brands fa-square-instagram", link: "https://instagram.com" },
                { class: "fa-solid fa-envelope", link: "mailto:sophia@example.com" },
                { class: "fa-solid fa-map-location-dot", link: " https://www.google.com/maps" }
            ]
        }
    ];

    // ===== FUNCTION TO CREATE A CARD =====
    function createCard(cardData) {
        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
        <div class="card-content">
            <div class="card-image">
                <img src="${cardData.img}" alt="">
            </div>

            <div class="media-icons">
                ${cardData.icons.map(icon => `<a href="${icon.link}" target="_blank"><i class="${icon.class}"></i></a>`).join("")}
            </div>

            <div class="name-profession">
                <span class="name">${cardData.name}</span>
                <span class="profession">${cardData.profession}</span>
                <span class="location" style="display:none;">${cardData.location}</span>
            </div>

            <div class="rating">
                ${[1,2,3,4,5].map(i => `<i class="${i <= cardData.rating ? 'fas' : 'far'} fa-star"></i>`).join("")}
            </div>

            <div class="card-button">
                <button class="aboutMe" onclick="openAboutMe('${cardData.name}')">About ME</button>
                <button class="hireMe" onclick="hireProvider('${cardData.name}')">Hire ME</button>
            </div>
        </div>`;

        return card;
    }

    // ===== LOAD CARDS DYNAMICALLY =====
    function loadCards() {
        if (!container) return;
        container.innerHTML = "";
        const sorted = cardsData.sort((a, b) => b.rating - a.rating);
        sorted.forEach(cardData => container.appendChild(createCard(cardData)));
    }

    loadCards();

    // ===== SEARCH FUNCTIONALITY =====
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            if (!container) return;
            const query = searchInput.value.trim().toLowerCase();
            container.innerHTML = "";

            const filtered = cardsData.filter(card => 
                card.profession.toLowerCase().includes(query) ||
                card.name.toLowerCase().includes(query)
            );

            if (filtered.length === 0) {
                container.innerHTML = `<p style="width:100%;text-align:center;">No results found</p>`;
            } else {
                filtered.sort((a, b) => b.rating - a.rating).forEach(cardData => {
                    container.appendChild(createCard(cardData));
                });
            }
        });
    }

    // ===== SIDEBAR MANAGEMENT =====
    const providerSidebar = document.querySelector('.sidebar');
    const customerSidebar = document.querySelector('.customer-sidebar');
    const toggleBtn = document.getElementById('sidebarToggle');
    const barsIcon = toggleBtn ? toggleBtn.querySelector('.fa-bars') : null;
    const timesIcon = toggleBtn ? toggleBtn.querySelector('.fa-times') : null;
    const cont = document.querySelector('.cont');
    
    // Mobile buttons
    const btnFreeHelp = document.getElementById('btn-freehelp');
    const btnReadyHelp = document.getElementById('btn-readyhelp');

    let activeSidebar = null;

    // Initialize sidebars based on user type
    function initializeSidebars() {
        if (!providerSidebar || !customerSidebar) return;

        if (currentUserType === "provider") {
            showSidebar(providerSidebar);
            activeSidebar = providerSidebar;
        } else if (currentUserType === "customer") {
            showSidebar(customerSidebar);
            activeSidebar = customerSidebar;
        }
        updateToggleIcon();
    }

    function showSidebar(sidebarToShow) {
        if (!providerSidebar || !customerSidebar || !sidebarToShow) return;
        
        // Hide both sidebars first
        providerSidebar.style.display = 'none';
        customerSidebar.style.display = 'none';
        
        // Show the requested sidebar
        sidebarToShow.style.display = 'flex';
        activeSidebar = sidebarToShow;
        
        // Update CSS classes for animation
        if (window.innerWidth <= 900) {
            sidebarToShow.classList.add('open');
        } else {
            sidebarToShow.classList.remove('closed');
            if (cont) cont.classList.remove('closed');
        }
        
        updateToggleIcon();
    }

    function toggleSidebar() {
        if (!activeSidebar || !cont) return;

        if (window.innerWidth <= 900) {
            // Mobile: toggle the active sidebar
            activeSidebar.classList.toggle('open');
        } else {
            // Desktop: toggle closed state
            activeSidebar.classList.toggle('closed');
            cont.classList.toggle('closed');
        }
        updateToggleIcon();
    }

    function updateToggleIcon() {
        if (!barsIcon || !timesIcon || !activeSidebar) return;

        if (window.innerWidth <= 900) {
            // Mobile: check open class
            if (activeSidebar.classList.contains('open')) {
                barsIcon.style.display = 'none';
                timesIcon.style.display = 'block';
            } else {
                barsIcon.style.display = 'block';
                timesIcon.style.display = 'none';
            }
        } else {
            // Desktop: check closed class
            if (activeSidebar.classList.contains('closed')) {
                barsIcon.style.display = 'block';
                timesIcon.style.display = 'none';
            } else {
                barsIcon.style.display = 'none';
                timesIcon.style.display = 'block';
            }
        }
    }

    // Mobile button handlers
    if (btnFreeHelp) {
        btnFreeHelp.addEventListener('click', () => {
            showSidebar(customerSidebar);
        });
    }

    if (btnReadyHelp) {
        btnReadyHelp.addEventListener('click', () => {
            showSidebar(providerSidebar);
        });
    }

    // Toggle button handler
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleSidebar);
    }

    // Window resize handler
    window.addEventListener('resize', () => {
        if (!providerSidebar || !customerSidebar || !cont) return;

        if (window.innerWidth > 900) {
            // Desktop: remove mobile classes
            providerSidebar.classList.remove('open');
            customerSidebar.classList.remove('open');
        } else {
            // Mobile: remove desktop classes
            providerSidebar.classList.remove('closed');
            customerSidebar.classList.remove('closed');
            cont.classList.remove('closed');
        }
        updateToggleIcon();
    });

    // Initialize
    initializeSidebars();

    // ===== EDIT PROFILE BUTTON REDIRECT =====
    const editProfileBtn = document.getElementById('btn-edit');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', function() {
            window.location.href = '/profile_service_provider/profile.html';
        });
    }

    // ===== VIEW ALL PROVIDERS FUNCTIONALITY =====
    const viewAllBtn = document.querySelector('.customer-view-all');
    const providersModal = document.getElementById('providersModal');
    const closeModal = document.querySelector('.close-modal');
    const providersGrid = document.getElementById('providersGrid');

    // Sample data for all providers
    const allProvidersData = [
        {
            name: "Sarah Johnson",
            profession: "Plumbing Services",
            rating: 4.9,
            img: "/images/user-2.jpg"
        },
        {
            name: "Mike Chen",
            profession: "Electrician",
            rating: 4.8,
            img: "/images/user-3.jpg"
        },
        {
            name: "Emily Davis",
            profession: "Web Developer",
            rating: 4.7,
            img: "/images/user-4.jpg"
        },
        {
            name: "Alex Rodriguez",
            profession: "Graphic Designer",
            rating: 4.9,
            img: "/images/user-5.jpg"
        },
        {
            name: "Jessica Brown",
            profession: "Tutor",
            rating: 5.0,
            img: "/images/user-6.jpg"
        },
        {
            name: "David Wilson",
            profession: "Photographer",
            rating: 4.6,
            img: "/images/user-7.avif"
        },
        {
            name: "Lisa Garcia",
            profession: "Personal Trainer",
            rating: 4.8,
            img: "/images/user-8.jpg"
        },
        {
            name: "Kevin Martinez",
            profession: "Chef",
            rating: 4.9,
            img: "/images/user-2.jpg"
        },
        {
            name: "Maria Gonzalez",
            profession: "House Cleaning",
            rating: 4.7,
            img: "/images/user-3.jpg"
        },
        {
            name: "James Wilson",
            profession: "Car Mechanic",
            rating: 4.8,
            img: "/images/user-4.jpg"
        },
        {
            name: "Sophia Lee",
            profession: "Yoga Instructor",
            rating: 4.9,
            img: "/images/user-5.jpg"
        },
        {
            name: "Robert Taylor",
            profession: "Landscaper",
            rating: 4.6,
            img: "/images/user-6.jpg"
        }
    ];

    // Function to create simple provider card
    function createProviderCard(provider) {
        const card = document.createElement('div');
        card.className = 'modal-card';
        
        card.innerHTML = `
            <img src="${provider.img}" alt="${provider.name}" class="modal-card-img">
            <h3>${provider.name}</h3>
            <p>${provider.profession}</p>
            <div class="modal-card-rating">
                ${[1,2,3,4,5].map(i => 
                    `<i class="${i <= Math.floor(provider.rating) ? 'fas' : 'far'} fa-star"></i>`
                ).join('')}
                <span>${provider.rating}</span>
            </div>
            <button class="btn-profile" onclick="viewProfile('${provider.name}')">View Profile</button>
        `;
        
        return card;
    }

    // Function to load all providers in modal
    function loadAllProviders() {
        if (!providersGrid) return;
        providersGrid.innerHTML = '';
        allProvidersData.forEach(provider => {
            providersGrid.appendChild(createProviderCard(provider));
        });
    }

    // Event listeners for modal
    if (viewAllBtn && providersModal) {
        viewAllBtn.addEventListener('click', function() {
            loadAllProviders();
            providersModal.style.display = 'block';
        });
    }

    if (closeModal && providersModal) {
        closeModal.addEventListener('click', function() {
            providersModal.style.display = 'none';
        });
    }

    // Close modal when clicking outside
    if (providersModal) {
        window.addEventListener('click', function(event) {
            if (event.target === providersModal) {
                providersModal.style.display = 'none';
            }
        });
    }
});

// ===== POPUP FUNCTIONS =====
const aboutMeModal = document.getElementById('aboutMeModal');
const closePopup = document.querySelector('.close-popup');
const popupContent = document.getElementById('popupContent');

// Function to open About Me popup
function openAboutMe(providerName) {
    console.log("Opening About Me for:", providerName);
    const provider = providersData.find(p => p.name === providerName);
    if (provider && aboutMeModal && popupContent) {
        showProviderProfileInPopup(provider);
        aboutMeModal.style.display = 'block';
    } else {
        // Fallback - show first provider
        if (providersData.length > 0 && aboutMeModal && popupContent) {
            showProviderProfileInPopup(providersData[0]);
            aboutMeModal.style.display = 'block';
        }
    }
}

// Function to show provider profile in popup
function showProviderProfileInPopup(provider) {
    if (!popupContent) return;
    
    popupContent.innerHTML = `
        <div class="provider-profile">
            <div class="profile-container">
                <div class="profile-header">
                    <h1 class="provider-title">${provider.name}</h1>
                    <button class="email-button" onclick="window.location.href='mailto:${provider.email}'">
                        <i class="fa fa-envelope"></i> Email
                    </button>
                </div>

                <div class="profile-content">
                    <div class="profile-left">
                        <h2 class="greeting">Hi, I'm ${provider.name.split(' ')[0]} 👋</h2>
                        <p class="bio-text">${provider.bio}</p>
                    </div>

                    <div class="profile-right">
                        <img src="${provider.profileImage}" alt="${provider.name}" class="profile-large-img">
                    </div>
                </div>

                <div class="skills-section">
                    <h2 class="skills-title">Skills</h2>
                    <p class="skills-description">
                        With years of experience and specialized training, I offer comprehensive ${provider.service.toLowerCase()} 
                        services tailored to meet your specific needs and exceed your expectations.
                    </p>
                    <div class="skills-grid">
                        ${provider.skills.map(skill => `
                            <div class="skill-card">
                                <span class="skill-icon">${skill.icon}</span>
                                <span class="skill-name">${skill.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Close popup functions
if (closePopup && aboutMeModal) {
    closePopup.addEventListener('click', function() {
        aboutMeModal.style.display = 'none';
    });
}

if (aboutMeModal) {
    window.addEventListener('click', function(event) {
        if (event.target === aboutMeModal) {
            aboutMeModal.style.display = 'none';
        }
    });
}

// ===== HIRE ME & VIEW PROFILE FUNCTIONS =====
function hireProvider(providerName) {
    const providerData = {
        name: providerName,
    };
    
    sessionStorage.setItem('selectedProvider', JSON.stringify(providerData));
    window.location.href = '/profile_service_provider/profile.html';
}

function viewProfile(providerName) {
    const providerData = {
        name: providerName,
    };
    
    sessionStorage.setItem('selectedProvider', JSON.stringify(providerData));
    window.location.href = '/profile_service_provider/profile.html';
}

// Make functions global
window.openAboutMe = openAboutMe;
window.hireProvider = hireProvider;
window.viewProfile = viewProfile;