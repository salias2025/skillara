// main_page/main.js

// ===== GLOBAL VARIABLES =====
let providersData = [];
let servicesData = [];
let allWebsiteProviders = [];
let cardsData = [];

// ===== SERVICE CARD CREATION =====
function createServiceCard(serviceData) {
    const card = document.createElement("div");
    card.classList.add("service-card");
    
    card.innerHTML = `
        <h3 class="service-title">${serviceData.title}</h3>
        <p class="service-description">${serviceData.description}</p>
    `;
    
    return card;
}

// ===== LOAD SERVICES DYNAMICALLY =====
async function loadServices() {
    const servicesContainer = document.querySelector(".services-grid");
    if (!servicesContainer) return;
    
    try {
        // Fetch popular services from backend
        const response = await fetch('popular_services_handler.php?limit=4');
        const result = await response.json();
        
        if (result.success) {
            servicesData = result.data;
            servicesContainer.innerHTML = "";
            
            // Display services
            servicesData.forEach(service => {
                servicesContainer.appendChild(createServiceCard(service));
            });
        } else {
            console.error('Failed to load services:', result.message);
            showDefaultServices();
        }
    } catch (error) {
        console.error('Error loading services:', error);
        showDefaultServices();
    }
}

function showDefaultServices() {
    const servicesContainer = document.querySelector(".services-grid");
    if (!servicesContainer) return;
    
    const defaultServices = [
        { title: "Web Development", description: "150+ providers" },
        { title: "Graphic Design", description: "200+ providers" },
        { title: "Home Services", description: "15+ providers" },
        { title: "Mobile Apps", description: "24+ providers" }
    ];
    
    servicesContainer.innerHTML = "";
    defaultServices.forEach(service => {
        servicesContainer.appendChild(createServiceCard(service));
    });
}

// ===== NAVIGATION FUNCTION =====
function navigateTo(page) {
    const routes = {
        'home': '/skillara/landing_page/index.html',
        'free-help': '/skillara/free_solutions/free_solution.html', 
        'ready-help': '/skillara/ready_solutions/ready_solutions.html',
        'contact': '/skillara/landing_page/index.html#contact'
    };

    if (routes[page]) {
        window.location.href = routes[page];
    } else {
        console.warn('Unknown page:', page);
    }
}

// Make function global
window.navigateTo = navigateTo;

// ===== ENHANCED CARD CREATION =====
function createCard(cardData) {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
    <div class="card-content">
        <div class="card-image">
            <img src="${cardData.img}" alt="${cardData.name}" onerror="this.src='/skillara/images/user-1.jpg'">
        </div>

        <div class="media-icons">
            ${cardData.icons.map(icon => `<a href="${icon.link}" target="_blank"><i class="${icon.class}"></i></a>`).join("")}
        </div>

        <div class="name-profession">
            <span class="name">${cardData.name}</span>
            <span class="profession">${cardData.profession}</span>
        </div>

        <div class="rating">
            ${[1,2,3,4,5].map(i => `<i class="${i <= cardData.rating ? 'fas' : 'far'} fa-star"></i>`).join("")}
            <span>${cardData.rating.toFixed(1)}</span>
        </div>

        <div class="card-button">
            <button class="aboutMe" onclick="openAboutMe('${cardData.id}')">About ME</button>
            <button class="hireMe" onclick="hireProvider('${cardData.id}', '${cardData.name}')">Hire ME</button>
        </div>
    </div>`;

    return card;
}

// ===== LOAD CARDS DYNAMICALLY =====
async function loadCards() {
    const container = document.querySelector(".cards-container");
    if (!container) return;
    
    try {
        // Fetch provider cards from backend
        const response = await fetch('providers_cards_handler.php?limit=9');
        const result = await response.json();
        
        if (result.success) {
            cardsData = result.data;
            container.innerHTML = "";
            
            // Sort by rating (highest first)
            const sorted = cardsData.sort((a, b) => b.rating - a.rating);
            sorted.forEach(cardData => {
                container.appendChild(createCard(cardData));
            });
            
            // Store for search functionality
            window.cardsData = cardsData;
            
            // Add horizontal scroll indicators
            addScrollIndicators();
        } else {
            console.error('Failed to load provider cards:', result.message);
            showDefaultCards();
        }
    } catch (error) {
        console.error('Error loading provider cards:', error);
        showDefaultCards();
    }
}

function showDefaultCards() {
    const container = document.querySelector(".cards-container");
    if (!container) return;
    
    const defaultCards = [
        {
            id: 1,
            name: "Jane Doe",
            profession: "Full Stack Developer",
            location: "New York",
            rating: 4.5,
            img: "/skillara/images/user-2.jpg",
            icons: [
                { class: "fa-brands fa-facebook", link: "https://facebook.com" },
                { class: "fa-brands fa-square-instagram", link: "https://instagram.com" },
                { class: "fa-solid fa-envelope", link: "mailto:jane@example.com" },
                { class: "fa-solid fa-map-location-dot", link: "https://www.google.com/maps" }
            ]
        },
        {
            id: 2,
            name: "John Smith",
            profession: "Web Designer",
            location: "Los Angeles",
            rating: 4.8,
            img: "/skillara/images/user-3.jpg",
            icons: [
                { class: "fa-brands fa-facebook", link: "https://facebook.com" },
                { class: "fa-brands fa-square-instagram", link: "https://instagram.com" },
                { class: "fa-solid fa-envelope", link: "mailto:john@example.com" },
                { class: "fa-solid fa-map-location-dot", link: "https://www.google.com/maps" }
            ]
        }
    ];
    
    container.innerHTML = "";
    defaultCards.forEach(cardData => {
        container.appendChild(createCard(cardData));
    });
    
    window.cardsData = defaultCards;
    addScrollIndicators();
}

function addScrollIndicators() {
    const container = document.querySelector('.cards-container');
    if (!container) return;
    
    // Only add indicators if content overflows
    setTimeout(() => {
        if (container.scrollWidth > container.clientWidth) {
            // Show scroll hint for mobile
            const scrollHint = document.querySelector('.scroll-hint');
            if (scrollHint) {
                scrollHint.style.display = 'flex';
            }
        }
    }, 100);
}

// ===== LOAD COUNTERS =====
async function loadCounters() {
    try {
        const response = await fetch('counters_handler.php');
        const result = await response.json();
        
        if (result.success) {
            const counters = result.data;
            
            // Update hero section counters
            const statNumbers = document.querySelectorAll('.stat-number');
            if (statNumbers.length >= 2) {
                statNumbers[0].textContent = counters.total_providers + '+';
                statNumbers[1].textContent = counters.total_services + '+';
            }
        }
    } catch (error) {
        console.error('Error loading counters:', error);
    }
}

// ===== LOAD ALL WEBSITE PROVIDERS =====
async function loadAllWebsiteProviders() {
    try {
        const response = await fetch('providers_cards_handler.php?limit=50');
        const result = await response.json();
        
        if (result.success) {
            allWebsiteProviders = result.data;
        }
    } catch (error) {
        console.error('Error loading all providers:', error);
    }
}

// ===== CREATE PROVIDER CARD FOR MODAL =====
function createProviderCard(provider) {
    const card = document.createElement('div');
    card.className = 'modal-card';
    
    card.innerHTML = `
        <img src="${provider.img}" alt="${provider.name}" class="modal-card-img" onerror="this.src='/skillara/images/user-1.jpg'">
        <h3>${provider.name}</h3>
        <p>${provider.profession}</p>
        <div class="modal-card-rating">
            ${[1,2,3,4,5].map(i => 
                `<i class="${i <= Math.floor(provider.rating) ? 'fas' : 'far'} fa-star"></i>`
            ).join('')}
            <span>${provider.rating.toFixed(1)}</span>
        </div>
        <button class="btn-profile" onclick="viewProfile('${provider.id}', '${provider.name}')">View Profile</button>
    `;
    
    return card;
}

// ===== ABOUT ME POPUP FUNCTIONS =====
async function openAboutMe(providerId) {
    console.log("Opening About Me for provider ID:", providerId);
    
    try {
        // Fetch about me data from backend
        const response = await fetch(`about_me_handler.php?provider_id=${providerId}`);
        const result = await response.json();
        
        const aboutMeModal = document.getElementById('aboutMeModal');
        const popupContent = document.getElementById('popupContent');
        
        if (result.success && aboutMeModal && popupContent) {
            const providerData = result.data;
            showProviderProfileInPopup(providerData, providerId);
            aboutMeModal.style.display = 'block';
        } else {
            console.error('Failed to load about me data:', result.message);
            // Fallback
            const fallbackProvider = cardsData.find(p => p.id == providerId) || cardsData[0];
            if (fallbackProvider && aboutMeModal && popupContent) {
                showFallbackProfileInPopup(fallbackProvider);
                aboutMeModal.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Error loading about me data:', error);
        // Fallback
        const aboutMeModal = document.getElementById('aboutMeModal');
        const popupContent = document.getElementById('popupContent');
        const fallbackProvider = cardsData.find(p => p.id == providerId) || cardsData[0];
        if (fallbackProvider && aboutMeModal && popupContent) {
            showFallbackProfileInPopup(fallbackProvider);
            aboutMeModal.style.display = 'block';
        }
    }
}

function showProviderProfileInPopup(providerData, providerId) {
    const popupContent = document.getElementById('popupContent');
    if (!popupContent) return;
    
    // Find provider from cardsData for additional info
    const cardData = cardsData.find(p => p.id == providerId);
    
    // Check if skills is an array
    let skillsHtml = '';
    if (Array.isArray(providerData.skills) && providerData.skills.length > 0) {
        skillsHtml = providerData.skills.map(skill => `
            <div class="skill-card">
                <i class="${skill.icon}"></i>
                <span class="skill-name">${skill.title}</span>
            </div>
        `).join('');
    } else {
        // Fallback if skills is empty or not an array
        skillsHtml = `
            <div class="skill-card">
                <i class="fas fa-code"></i>
                <span class="skill-name">Programming</span>
            </div>
            <div class="skill-card">
                <i class="fas fa-database"></i>
                <span class="skill-name">Database</span>
            </div>
            <div class="skill-card">
                <i class="fas fa-server"></i>
                <span class="skill-name">Backend</span>
            </div>
            <div class="skill-card">
                <i class="fas fa-paint-brush"></i>
                <span class="skill-name">Design</span>
            </div>
        `;
    }
    
    popupContent.innerHTML = `
        <div class="provider-profile">
            <div class="profile-container">
                <div class="profile-header">
                    <h1 class="provider-title">${providerData.name}</h1>
                    <button class="email-button" onclick="window.location.href='mailto:${providerData.email}'">
                        <i class="fa fa-envelope"></i> Email
                    </button>
                </div>

                <div class="profile-content">
                    <div class="profile-left">
                        <h2 class="greeting">Hi, I'm ${providerData.name.split(' ')[0]} 👋</h2>
                        <p class="bio-text">${providerData.bio}</p>
                    </div>

                    <div class="profile-right">
                        <img src="${cardData?.img || '/skillara/images/user-1.jpg'}" alt="${providerData.name}" class="profile-large-img">
                    </div>
                </div>

                <div class="skills-section">
                    <h2 class="skills-title">Skills</h2>
                    <p class="skills-description">
                        With years of experience and specialized training, I offer comprehensive services 
                        tailored to meet your specific needs and exceed your expectations.
                    </p>
                    <div class="skills-grid">
                        ${skillsHtml}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showFallbackProfileInPopup(provider) {
    const popupContent = document.getElementById('popupContent');
    if (!popupContent) return;
    
    const skills = [
        { name: "Professional", icon: "⭐" },
        { name: "Reliable", icon: "✅" },
        { name: "Experienced", icon: "📈" },
        { name: "Certified", icon: "🏆" }
    ];
    
    popupContent.innerHTML = `
        <div class="provider-profile">
            <div class="profile-container">
                <div class="profile-header">
                    <h1 class="provider-title">${provider.name}</h1>
                    <button class="email-button" onclick="window.location.href='${provider.icons[2]?.link || '#'}'">
                        <i class="fa fa-envelope"></i> Email
                    </button>
                </div>

                <div class="profile-content">
                    <div class="profile-left">
                        <h2 class="greeting">Hi, I'm ${provider.name.split(' ')[0]} 👋</h2>
                        <p class="bio-text">${provider.profession} with extensive experience in delivering high-quality services. Committed to exceeding client expectations.</p>
                    </div>

                    <div class="profile-right">
                        <img src="${provider.img}" alt="${provider.name}" class="profile-large-img">
                    </div>
                </div>

                <div class="skills-section">
                    <h2 class="skills-title">Skills</h2>
                    <p class="skills-description">
                        With years of experience and specialized training, I offer comprehensive ${provider.profession.toLowerCase()} 
                        services tailored to meet your specific needs and exceed your expectations.
                    </p>
                    <div class="skills-grid">
                        ${skills.map(skill => `
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

// ===== MAIN PAGE'S "VIEW ALL PROVIDERS" FUNCTION =====
async function openProvidersModal() {
    const providersModal = document.getElementById('providersModal');
    if (!providersModal) return;
    
    const providersGrid = document.getElementById('providersGrid');
    if (!providersGrid) return;
    
    try {
        // Load providers if not already loaded
        if (allWebsiteProviders.length === 0) {
            await loadAllWebsiteProviders();
        }
        
        providersGrid.innerHTML = '';
        
        if (allWebsiteProviders.length > 0) {
            allWebsiteProviders.forEach(provider => {
                providersGrid.appendChild(createProviderCard(provider));
            });
        } else {
            // Fallback to cardsData
            cardsData.forEach(provider => {
                providersGrid.appendChild(createProviderCard(provider));
            });
        }
        
        providersModal.style.display = 'block';
    } catch (error) {
        console.error('Error opening providers modal:', error);
        providersGrid.innerHTML = '<p style="padding: 20px; text-align: center;">Error loading providers</p>';
        providersModal.style.display = 'block';
    }
}

// ===== HIRE ME & VIEW PROFILE FUNCTIONS =====
function hireProvider(providerId, providerName) {
    console.log('Hire Me clicked - Provider ID:', providerId, 'Name:', providerName);
    
    // Store in BOTH formats for compatibility
    const providerData = {
        id: providerId,
        name: providerName,
        isOwner: false
    };
    
    // Set the new format that profile.js expects
    sessionStorage.setItem('profile_providerId', providerId);
    sessionStorage.setItem('profile_isOwner', 'false');
    
    // Also set the old format for backward compatibility
    sessionStorage.setItem('selectedProvider', JSON.stringify(providerData));
    
    console.log('SessionStorage set:', {
        profile_providerId: providerId,
        profile_isOwner: 'false',
        selectedProvider: providerData
    });
    
    window.location.href = '/skillara/profile_service_provider/profile.html';
}

function viewProfile(providerId, providerName) {
    console.log('View Profile clicked - Provider ID:', providerId, 'Name:', providerName);
    
    // Store in BOTH formats for compatibility
    const providerData = {
        id: providerId,
        name: providerName,
        isOwner: false
    };
    
    // Set the new format that profile.js expects
    sessionStorage.setItem('profile_providerId', providerId);
    sessionStorage.setItem('profile_isOwner', 'false');
    
    // Also set the old format for backward compatibility
    sessionStorage.setItem('selectedProvider', JSON.stringify(providerData));
    
    window.location.href = '/skillara/profile_service_provider/profile.html';
}

function viewProfile(providerId, providerName) {
    const providerData = {
        id: providerId,
        name: providerName,
        isOwner: false // This is a client viewing the profile
    };
    
    sessionStorage.setItem('selectedProvider', JSON.stringify(providerData));
    sessionStorage.setItem('profile_isOwner', 'false');
    window.location.href = '/skillara/profile_service_provider/profile.html';
}

// ===== MAIN INITIALIZATION =====
document.addEventListener("DOMContentLoaded", async () => {
    // Load all data
    await Promise.all([
        loadCards(),
        loadServices(),
        loadCounters(),
        loadAllWebsiteProviders()
    ]);
    
    const container = document.querySelector(".cards-container");
    const searchInput = document.querySelector(".providers-search-form input");
    
    // ===== SEARCH FUNCTIONALITY =====
    if (searchInput && container) {
        searchInput.addEventListener("input", () => {
            const query = searchInput.value.trim().toLowerCase();
            container.innerHTML = "";

            if (query === "") {
                // Show all cards sorted by rating
                const sorted = cardsData.sort((a, b) => b.rating - a.rating);
                sorted.forEach(cardData => {
                    container.appendChild(createCard(cardData));
                });
            } else {
                const filtered = cardsData.filter(card => 
                    card.profession.toLowerCase().includes(query) ||
                    card.name.toLowerCase().includes(query) ||
                    (card.location && card.location.toLowerCase().includes(query))
                );

                if (filtered.length === 0) {
                    container.innerHTML = `<p style="width:100%;text-align:center;padding:40px;color:#666;">No results found for "${query}"</p>`;
                } else {
                    filtered.sort((a, b) => b.rating - a.rating).forEach(cardData => {
                        container.appendChild(createCard(cardData));
                    });
                }
            }
            
            // Update scroll indicators after search
            addScrollIndicators();
        });
    }
    
    // ===== MODAL EVENT LISTENERS =====
    const providersModal = document.getElementById('providersModal');
    const closeModal = document.querySelector('.close-modal');
    const aboutMeModal = document.getElementById('aboutMeModal');
    const closePopup = document.querySelector('.close-popup');
    
    // Close modals when clicking close button
    if (closeModal && providersModal) {
        closeModal.addEventListener('click', function() {
            providersModal.style.display = 'none';
        });
    }
    
    if (closePopup && aboutMeModal) {
        closePopup.addEventListener('click', function() {
            aboutMeModal.style.display = 'none';
        });
    }
    
    // Close modals when clicking outside
    if (providersModal) {
        window.addEventListener('click', function(event) {
            if (event.target === providersModal) {
                providersModal.style.display = 'none';
            }
        });
    }
    
    if (aboutMeModal) {
        window.addEventListener('click', function(event) {
            if (event.target === aboutMeModal) {
                aboutMeModal.style.display = 'none';
            }
        });
    }
    
    // View All Providers button in featured section
    const viewAllBtn = document.querySelector('.view-all-btn');
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', openProvidersModal);
    }
});

// Make functions global
window.openAboutMe = openAboutMe;
window.hireProvider = hireProvider;
window.viewProfile = viewProfile;
window.openProvidersModal = openProvidersModal;