// main_page/sidebar.js

// ===== SIDEBAR MANAGEMENT =====
document.addEventListener("DOMContentLoaded", () => {
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
    let currentUserType = null;
    let userData = null;

    // ===== PROFILE PICTURE UPLOAD FUNCTIONALITY =====
    function setupProfilePictureChange() {
        const profilePicContainer = document.querySelector('.customer-profile-pic-container');
        const profilePicInput = document.getElementById('customerProfilePicInput');
        const profilePic = document.querySelector('.customer-profile-pic');
        
        if (!profilePicContainer || !profilePicInput || !profilePic) return;
        
        // Store original image URL for fallback
        let originalImageUrl = profilePic.src;
        
        // Open file dialog
        profilePicContainer.addEventListener('click', function() {
            profilePicInput.click();
        });
        
        // Handle file selection and UPLOAD
        profilePicInput.addEventListener('change', async function(event) {
            const file = event.target.files[0];
            
            if (!file) return;
            
            // Validate file type
            if (!file.type.match('image.*')) {
                alert('Please select an image file (JPG, PNG, GIF, etc.)');
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }
            
            // Show preview immediately
            const reader = new FileReader();
            reader.onload = function(e) {
                profilePic.src = e.target.result;
            };
            reader.readAsDataURL(file);
            
            // Upload to server
            try {
                const formData = new FormData();
                formData.append('action', 'uploadClientImage');
                formData.append('image', file);
                
                const response = await fetch('sidebar_handler.php', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showSuccessMessage('Profile picture saved successfully!');
                    // Update with server URL
                    if (result.imageUrl) {
                        profilePic.src = result.imageUrl;
                        originalImageUrl = result.imageUrl; // Update fallback URL
                    }
                } else {
                    alert('Error: ' + result.message);
                    // Revert to original image on error
                    profilePic.src = originalImageUrl;
                }
            } catch (error) {
                console.error('Upload error:', error);
                alert('Failed to upload image. Please try again.');
                // Revert to original image on error
                profilePic.src = originalImageUrl;
            }
            
            // Reset input
            profilePicInput.value = '';
        });
    }

    // Helper function to show success message
    function showSuccessMessage(message) {
        // Remove any existing success message
        const existingMessage = document.querySelector('.profile-pic-success');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create new success message
        const successDiv = document.createElement('div');
        successDiv.className = 'profile-pic-success';
        successDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(successDiv);
        
        // Remove message after 3 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.remove();
            }
        }, 3000);
    }

    // Initialize sidebars based on user type from session
    async function initializeSidebars() {
        if (!providerSidebar || !customerSidebar) return;

        try {
            // Fetch user data from backend
            const response = await fetch('sidebar_handler.php');
            const result = await response.json();
            
            if (result.success) {
                currentUserType = result.user_type;
                userData = result.data;
                
                if (currentUserType === "provider") {
                    showSidebar(providerSidebar);
                    activeSidebar = providerSidebar;
                    loadProviderInfo();
                } else if (currentUserType === "client") {
                    showSidebar(customerSidebar);
                    activeSidebar = customerSidebar;
                    loadCustomerInfo();
                    loadFollowedProviders();
                    setupProfilePictureChange(); // ADDED THIS LINE
                }
            } else {
                // If not logged in, default to customer view
                console.warn('Not logged in, defaulting to customer view');
                currentUserType = "customer";
                showSidebar(customerSidebar);
                activeSidebar = customerSidebar;
                loadCustomerInfo();
                loadFollowedProviders();
                setupProfilePictureChange(); // ADDED THIS LINE
            }
            
            updateToggleIcon();
        } catch (error) {
            console.error('Error fetching user data:', error);
            // Fallback to customer view on error
            currentUserType = "customer";
            showSidebar(customerSidebar);
            activeSidebar = customerSidebar;
            loadCustomerInfo();
            loadFollowedProviders();
            setupProfilePictureChange(); // ADDED THIS LINE
        }
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

    // ===== LOAD PROVIDER INFO =====
    function loadProviderInfo() {
        if (!userData || !userData.provider) return;
        
        const provider = userData.provider;
        
        // Update provider info in sidebar
        const providerNameElement = document.querySelector('.provider-name');
        const providerProfessionElement = document.querySelector('.provider-profession');
        const providerEmailElement = document.querySelector('.provider-email');
        const profilePicElement = document.querySelector('.profile-pic');
        
        if (providerNameElement) {
            providerNameElement.textContent = provider.fullname || provider.username;
        }
        
        if (providerProfessionElement) {
            providerProfessionElement.textContent = provider.profession;
        }
        
        if (providerEmailElement) {
            providerEmailElement.textContent = provider.email;
        }
        
        if (profilePicElement) {
            profilePicElement.src = provider.profile_picture || '/skillara/images/user-1.jpg';
            profilePicElement.alt = provider.fullname || provider.username;
        }
    }

    // ===== LOAD CUSTOMER INFO =====
    function loadCustomerInfo() {
        if (!userData || !userData.client) return;
        
        const client = userData.client;
        const customerProfileSection = document.querySelector('.customer-profile-info');
        
        if (customerProfileSection) {
            // Update customer info in sidebar
            const customerNameElement = document.querySelector('.customer-name');
            const customerEmailElement = document.querySelector('.customer-email');
            const profilePicElement = document.querySelector('.customer-profile-pic');
            
            if (customerNameElement) {
                customerNameElement.textContent = client.fullName || client.username;
            }
            
            if (customerEmailElement) {
                customerEmailElement.textContent = client.email;
            }
            
            if (profilePicElement) {
                profilePicElement.src = client.profileImage || '/skillara/images/user-1.jpg';
                profilePicElement.alt = client.fullName || client.username;
            }
            
            // Add username if not already present
            const usernameElement = document.querySelector('.customer-username');
            if (!usernameElement) {
                const profileInfo = document.querySelector('.customer-profile-info');
                if (profileInfo) {
                    const customerName = profileInfo.querySelector('.customer-name');
                    if (customerName) {
                        customerName.insertAdjacentHTML('afterend',
                            `<p class="customer-username">@${client.username}</p>`
                        );
                    }
                }
            }
        }
    }

    // ===== LOAD FOLLOWED PROVIDERS =====
    function loadFollowedProviders() {
        if (!userData || !userData.followedProviders) return;
        
        const providersContainer = document.querySelector('.customer-providers-cards');
        if (!providersContainer) return;
        
        providersContainer.innerHTML = '';
        
        userData.followedProviders.forEach(provider => {
            const providerCard = document.createElement('div');
            providerCard.className = 'customer-provider';
            providerCard.innerHTML = `
                <img class="customer-provider-img" src="${provider.img}" alt="${provider.name}">
                <div class="customer-text">
                    <span class="customer-name-card">${provider.name}</span> 
                    <span class="customer-service">${provider.service}</span>
                </div>
                <div class="customer-rating">
                    <i class="fa fa-star"></i>
                    <span>${provider.rating}</span>
                </div>
            `;
            providersContainer.appendChild(providerCard);
        });
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

    // ===== SIDEBAR'S VIEW ALL PROVIDERS (FOLLOWED PROVIDERS) =====
    const viewAllBtn = document.querySelector('.customer-view-all');
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', function() {
            if (!userData || !userData.followedProviders) {
                alert('No followed providers found.');
                return;
            }
            
            // This shows ONLY providers the customer follows
            const modal = document.createElement('div');
            modal.id = 'followedProvidersModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Your Followed Providers</h2>
                        <span class="close-followed-modal">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div class="followed-providers-grid" id="followedProvidersGrid">
                            <!-- Followed providers will be loaded here -->
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Load followed providers into modal
            const followedGrid = document.getElementById('followedProvidersGrid');
            if (followedGrid) {
                followedGrid.innerHTML = '';
                userData.followedProviders.forEach(provider => {
                    const card = document.createElement('div');
                    card.className = 'modal-card';
                    card.innerHTML = `
                        <img src="${provider.img}" alt="${provider.name}" class="modal-card-img">
                        <h3>${provider.name}</h3>
                        <p>${provider.service}</p>
                        <div class="modal-card-rating">
                            ${[1,2,3,4,5].map(i => 
                                `<i class="${i <= Math.floor(provider.rating) ? 'fas' : 'far'} fa-star"></i>`
                            ).join('')}
                            <span>${provider.rating}</span>
                        </div>
                        <button class="btn-profile" onclick="viewProfile('${provider.id}', '${provider.name}')">View Profile</button>
                    `;
                    followedGrid.appendChild(card);
                });
            }
            
            // Show modal
            modal.style.display = 'block';
            
            // Close modal handlers
            const closeBtn = modal.querySelector('.close-followed-modal');
            if (closeBtn) {
                closeBtn.addEventListener('click', function() {
                    modal.style.display = 'none';
                    document.body.removeChild(modal);
                });
            }
            
            window.addEventListener('click', function(event) {
                if (event.target === modal) {
                    modal.style.display = 'none';
                    document.body.removeChild(modal);
                }
            });
        });
    }

    // ===== EDIT PROFILE BUTTON REDIRECT =====
    const editProfileBtn = document.getElementById('btn-edit');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', function() {
            // Add isOwner flag to indicate this is the owner accessing the profile
            sessionStorage.setItem('profile_isOwner', 'true');
            window.location.href = '/skillara/profile_service_provider/profile.html';
        });
    }

    // Initialize
    initializeSidebars();
});

// Make functions global if needed
window.changeUserType = function(type) {
    currentUserType = type;
    // You might want to reload the sidebar here
    console.log('User type changed to:', type);
};