document.addEventListener('DOMContentLoaded', function () {
    // ============================
    // CONFIGURATION & SESSION MANAGEMENT
    // ============================
    let providerId = null;
    let isOwner = false;
    const API_BASE = 'profile_handler.php';
    
    // Initialize from sessionStorage
    async function initializeSession() {
        try {
            // Try to get from sessionStorage first (for visitor mode)
            const storedProviderId = sessionStorage.getItem('profile_providerId');
            const storedIsOwner = sessionStorage.getItem('profile_isOwner');
            
            if (storedProviderId) {
                providerId = storedProviderId;
                isOwner = storedIsOwner === 'true';
                
                // Clear storage after reading
                sessionStorage.removeItem('profile_providerId');
                sessionStorage.removeItem('profile_isOwner');
            } else if (storedIsOwner === 'true') {
                // Owner mode without providerId - get from backend session
                isOwner = true;
                const response = await fetch(`${API_BASE}?action=getCurrentProvider`);
                const result = await response.json();
                
                if (result.success) {
                    providerId = result.providerId;
                } else {
                    throw new Error('Not logged in as provider');
                }
            } else {
                // No session data - redirect to homepage
                throw new Error('No provider specified');
            }
            
            return true;
        } catch (error) {
            console.error('Session initialization error:', error);
            Utils.showNotification('Session error. Redirecting...', 'error');
            setTimeout(() => {
                window.location.href = '/skillara/';
            }, 2000);
            return false;
        }
    }
    
    // ============================
    // CACHED DOM ELEMENTS
    // ============================
    const DOM = {
        flipCard: document.querySelector('.flip-card'),
        editPopup: document.getElementById('edit-popup'),
        editForm: document.getElementById('edit-form'),
        profileImageInput: document.getElementById('profile-image-input'),
        profileImg: document.querySelector('.profile-picture img'),
        bannerDiv: document.querySelector('.flip-card-front .banner'),
        bannerInput: document.getElementById('banner-image-input'),
        backgroundInput: document.getElementById('card-background-input'),
        slider: document.querySelector('.slider'),
        pages: document.querySelectorAll('.slider .pages'),
        infoList: document.querySelector('.info-list'),
        socialIconsContainer: document.querySelector('.social-icons'),
        clientsContainer: document.querySelector('.my-clients'),
        editUsername: document.getElementById('edit-username'),
        editBusiness: document.getElementById('edit-business'),
        editLocation: document.getElementById('edit-location'),
        editBio: document.getElementById('edit-bio'),
        editService: document.getElementById('edit-service')
    };

    // ============================
    // USER DATA MODEL (Updated for Backend)
    // ============================
    const UserModel = {
        data: {
            profileIMG: "/skillara/images/user-2.jpg",
            bannerIMG: "/skillara/images/coding.webp",
            backgroundIMG: "/skillara/images/bg.jpg",
            username: "Loading...",
            businessname: "Loading...",
            location: "Loading...",
            servicetype: "Loading...",
            bio: "Loading...",
            fullname: "Loading...",
            email: "Loading...",
            phone: "Loading...",
            password: "*********",
            social: { 
                facebook: "#", 
                twitter: "#", 
                linkedin: "#", 
                instagram: "#", 
                whatsapp: "#" 
            }
        },

        async loadFromBackend() {
            if (!providerId) return null;
            
            try {
                console.log('🔍 Fetching profile for provider ID:', providerId);
                const response = await fetch(`${API_BASE}?action=getProfile&providerId=${providerId}`);
                const result = await response.json();
                
                console.log('📊 Profile API response:', result);
                
                if (result.success) {
                    this.data = result.data;
                    
                    // Debug image paths
                    console.log('📸 Loaded image paths:', {
                        profile: this.data.profileIMG,
                        banner: this.data.bannerIMG,
                        background: this.data.backgroundIMG
                    });
                    
                    return this.data;
                } else {
                    throw new Error(result.message || 'Failed to load profile');
                }
            } catch (error) {
                console.error('Failed to load profile:', error);
                Utils.showNotification('Failed to load profile data', 'error');
                return null;
            }
        },

        async updateProfile(updates) {
            if (!isOwner || !providerId) {
                throw new Error('Not authorized to update profile');
            }
            
            try {
                const formData = new FormData();
                formData.append('action', 'updateProfile');
                formData.append('providerId', providerId);
                
                for (const key in updates) {
                    if (updates[key] !== undefined) {
                        formData.append(key, updates[key]);
                    }
                }
                
                console.log('📤 Updating profile with:', updates);
                const response = await fetch(API_BASE, {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                console.log('✅ Profile update result:', result);
                return result;
            } catch (error) {
                console.error('Update error:', error);
                throw error;
            }
        },

        async uploadImage(file, imageType) {
            if (!isOwner || !providerId) {
                throw new Error('Not authorized to upload images');
            }
            
            try {
                const formData = new FormData();
                formData.append('action', 'uploadImage');
                formData.append('providerId', providerId);
                formData.append('imageType', imageType);
                formData.append('image', file);
                
                console.log(`📤 Uploading ${imageType} image:`, file.name, file.size, file.type);
                const response = await fetch(API_BASE, {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                console.log(`✅ ${imageType} upload result:`, result);
                return result;
            } catch (error) {
                console.error('Upload error:', error);
                throw error;
            }
        },

        async updateSocialMedia(platform, link) {
            if (!isOwner || !providerId) {
                throw new Error('Not authorized to update social media');
            }
            
            try {
                const formData = new FormData();
                formData.append('action', 'updateSocial');
                formData.append('providerId', providerId);
                formData.append('platform', platform);
                formData.append('link', link);
                
                const response = await fetch(API_BASE, {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                return result;
            } catch (error) {
                console.error('Social media update error:', error);
                throw error;
            }
        },

        updateLocal(updates) {
            this.data = { ...this.data, ...updates };
            return this.data;
        },

        get() {
            return { ...this.data };
        }
    };

    // ============================
    // UTILITY FUNCTIONS
    // ============================
    const Utils = {
        showNotification(message, type = 'success') {
            console.log(`💬 Notification (${type}):`, message);
            
            // Ensure notification styles exist
            this.ensureNotificationStyles();
            
            // Remove existing notification
            const existing = document.querySelector('.notification');
            if (existing) existing.remove();

            // Create notification element
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.innerHTML = `
                <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}"></i>
                <span>${message}</span>
                <button class="close-notification">&times;</button>
            `;
            
            document.body.appendChild(notification);
            
            // Auto remove after 4 seconds
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translateY(-20px)';
                setTimeout(() => notification.remove(), 300);
            }, 4000);
            
            // Close button handler
            notification.querySelector('.close-notification').addEventListener('click', () => {
                notification.remove();
            });
            
            return notification;
        },

        ensureNotificationStyles() {
            if (!document.querySelector('#notification-styles')) {
                const style = document.createElement('style');
                style.id = 'notification-styles';
                style.textContent = `
                    .notification {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: white;
                        color: #333;
                        padding: 15px 20px;
                        border-radius: 10px;
                        box-shadow: 0 5px 20px rgba(0,0,0,0.15);
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        z-index: 10000;
                        transition: all 0.3s ease;
                        border-left: 4px solid #7B3FE4;
                        max-width: 350px;
                    }
                    .notification.success {
                        border-left-color: #4CAF50;
                    }
                    .notification.error {
                        border-left-color: #ff4757;
                    }
                    .notification i {
                        font-size: 18px;
                    }
                    .notification.success i {
                        color: #4CAF50;
                    }
                    .notification.error i {
                        color: #ff4757;
                    }
                    .notification span {
                        flex: 1;
                        font-size: 14px;
                    }
                    .close-notification {
                        background: none;
                        border: none;
                        color: #999;
                        font-size: 20px;
                        cursor: pointer;
                        padding: 0;
                        width: 24px;
                        height: 24px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 50%;
                        transition: all 0.3s;
                    }
                    .close-notification:hover {
                        background: #f5f5f5;
                        color: #333;
                    }
                `;
                document.head.appendChild(style);
            }
        },

        validateForm(formData) {
            const errors = [];
            
            if (!formData.username.trim()) {
                errors.push('Username is required');
            }
            
            if (!formData.businessname.trim()) {
                errors.push('Business name is required');
            }
            
            if (!formData.location.trim()) {
                errors.push('Location is required');
            }
            
            if (formData.bio.length > 1000) {
                errors.push('Bio cannot exceed 1000 characters');
            }
            
            return errors;
        },

        sanitizeInput(input) {
            const div = document.createElement('div');
            div.textContent = input;
            return div.innerHTML;
        },

        setBackgroundImage(element, imageUrl) {
            if (!element) return;
            
            const img = new Image();
            img.onload = () => {
                element.style.background = `url('${imageUrl}') center/cover no-repeat`;
            };
            img.onerror = () => {
                element.style.background = 'none';
                console.log(`Background image failed to load: ${imageUrl}`);
            };
            img.src = imageUrl;
        },

        formatPhoneNumber(phone) {
            if (!phone) return 'No phone';
            // Format Algerian phone number: +213 XXX XX XX XX
            const clean = phone.replace(/\D/g, '');
            if (clean.length === 10) {
                return `+213 ${clean.substring(1, 4)} ${clean.substring(4, 6)} ${clean.substring(6, 8)} ${clean.substring(8, 10)}`;
            }
            return phone;
        }
    };

    // ============================
    // RENDER FUNCTIONS
    // ============================
    const Render = {
        async profile(user) {
            console.log('🎨 Rendering profile for:', user.username);
            
            // Set profile image
            if (DOM.profileImg) {
                DOM.profileImg.src = user.profileIMG;
                DOM.profileImg.onerror = function() {
                    console.log('❌ Profile image failed, using fallback');
                    this.src = '/skillara/images/user-1.jpg';
                };
            }
            
            // Set banner image
            if (DOM.bannerDiv) {
                Utils.setBackgroundImage(DOM.bannerDiv, user.bannerIMG);
            }
            
            // Set body background - FIXED: Less opaque gradient
            const bodyBgImg = new Image();
            bodyBgImg.onload = () => {
                console.log('✅ Background image loaded:', user.backgroundIMG);
                document.body.style.background = `
                    linear-gradient(rgba(245, 247, 250, 0.7), rgba(195, 207, 226, 0.7)),
                    url('${user.backgroundIMG}') center/cover no-repeat fixed
                `;
            };
            bodyBgImg.onerror = () => {
                console.log('❌ Background image failed, using fallback');
                document.body.style.background = `
                    linear-gradient(rgba(245, 247, 250, 0.7), rgba(195, 207, 226, 0.7)),
                    url('/skillara/images/contact-us.png') center/cover no-repeat fixed
                `;
            };
            bodyBgImg.src = user.backgroundIMG;

            // Update text content
            this.updateTextContent('.username', user.username);
            this.updateTextContent('.location', `<i class="fas fa-map-marker-alt"></i> ${user.location}`);
            this.updateTextContent('.bio', user.bio);
            
            // Update business info
            document.querySelectorAll('.business-name').forEach(el => {
                el.textContent = user.businessname;
            });
            
            document.querySelectorAll('.service-type').forEach(el => {
                el.textContent = user.servicetype;
            });
            
            document.querySelectorAll('.business-location').forEach(el => {
                el.textContent = user.location;
            });

            // Update personal info list
            if (DOM.infoList) {
                const formattedPhone = Utils.formatPhoneNumber(user.phone);
                DOM.infoList.innerHTML = `
                    <p><i class="fas fa-user"></i> <strong>Username:</strong> ${Utils.sanitizeInput(user.username)}</p>
                    <p><i class="fas fa-id-card"></i> <strong>Full Name:</strong> ${Utils.sanitizeInput(user.fullname)}</p>
                    <p><i class="fas fa-envelope"></i> <strong>Email:</strong> ${Utils.sanitizeInput(user.email)}</p>
                    <p><i class="fas fa-phone"></i> <strong>Phone:</strong> ${Utils.sanitizeInput(formattedPhone)}</p>
                    <p><i class="fas fa-lock"></i> <strong>Password:</strong> ${user.password}</p>
                `;
            }

            // Update social media links
            if (DOM.socialIconsContainer) {
                const platforms = ['facebook', 'twitter', 'linkedin', 'instagram', 'whatsapp'];
                DOM.socialIconsContainer.innerHTML = '';
                
                platforms.forEach(platform => {
                    const link = user.social?.[platform] || '#';
                    const a = document.createElement('a');
                    a.href = link;
                    a.className = platform;
                    a.innerHTML = `<i class="fab fa-${platform}"></i>`;
                    a.title = `${platform.charAt(0).toUpperCase() + platform.slice(1)} profile`;
                    DOM.socialIconsContainer.appendChild(a);
                });
            }
        },

        updateTextContent(selector, content) {
            const element = document.querySelector(selector);
            if (element) {
                element.innerHTML = content;
            }
        },

        async clients() {
            if (!DOM.clientsContainer || !providerId) return;
            
            try {
                const response = await fetch(`${API_BASE}?action=getClients&providerId=${providerId}`);
                const result = await response.json();
                
                if (result.success) {
                    DOM.clientsContainer.innerHTML = '';
                    
                    result.data.forEach((client, index) => {
                        const card = document.createElement('div');
                        card.className = 'client-item';
                        card.style.animationDelay = `${index * 0.1}s`;
                        card.style.opacity = '0';
                        card.style.animation = 'fadeIn 0.5s ease forwards';
                        
                        const img = document.createElement('img');
                        img.src = client.photo;
                        img.alt = `Profile picture of ${client.name}`;
                        img.className = 'client-photo';
                        img.onerror = function() {
                            this.src = '/skillara/images/user-1.jpg';
                        };
                        
                        card.innerHTML = `
                            <div class="client-info">
                                <span class="name">${Utils.sanitizeInput(client.name)}</span>
                                <span class="email">${Utils.sanitizeInput(client.email)}</span>
                                <span class="phone">${Utils.formatPhoneNumber(client.phone)}</span>
                            </div>
                        `;
                        card.insertBefore(img, card.firstChild);
                        DOM.clientsContainer.appendChild(card);
                    });
                }
            } catch (error) {
                console.error('Failed to load clients:', error);
            }
        }
    };

    // ============================
    // EVENT HANDLERS
    // ============================
    const EventHandlers = {
        editPopup: {
            open() {
                const user = UserModel.get();
                DOM.editUsername.value = user.username;
                DOM.editBusiness.value = user.businessname;
                DOM.editLocation.value = user.location;
                DOM.editBio.value = user.bio;
                DOM.editService.value = user.servicetype;
                
                DOM.editPopup.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            },

            close() {
                DOM.editPopup.style.display = 'none';
                document.body.style.overflow = 'auto';
                
                DOM.profileImageInput.value = '';
                DOM.bannerInput.value = '';
                DOM.backgroundInput.value = '';
            }
        },

        async formSubmit(e) {
            e.preventDefault();
            e.stopPropagation();

            const formData = {
                username: DOM.editUsername.value.trim(),
                businessname: DOM.editBusiness.value.trim(),
                location: DOM.editLocation.value.trim(),
                bio: DOM.editBio.value.trim(),
                servicetype: DOM.editService.value.trim()
            };

            // Validate form
            const errors = Utils.validateForm(formData);
            if (errors.length > 0) {
                errors.forEach(error => Utils.showNotification(error, 'error'));
                return;
            }

            try {
                // Update text fields first
                const updateResult = await UserModel.updateProfile(formData);
                
                if (updateResult.success) {
                    // Update local data
                    UserModel.updateLocal(formData);
                    
                    // Handle file uploads SEPARATELY (not in Promise.all)
                    await this.handleFileUploads();
                    
                    // Re-render profile with updated data
                    await Render.profile(UserModel.get());
                    
                    // Close popup
                    EventHandlers.editPopup.close();
                    
                    // Show success message
                    Utils.showNotification('Profile updated successfully!', 'success');
                    
                    // Animation
                    if (DOM.flipCard) {
                        DOM.flipCard.style.animation = 'pulse 0.5s ease';
                        setTimeout(() => {
                            DOM.flipCard.style.animation = '';
                        }, 500);
                    }
                } else {
                    Utils.showNotification(updateResult.message, 'error');
                }
            } catch (error) {
                Utils.showNotification(`Error updating profile: ${error.message}`, 'error');
            }
        },

        async handleFileUploads() {
            console.log('🔄 Starting file uploads...');
            
            // Upload files one by one to avoid conflicts
            if (DOM.profileImageInput.files[0]) {
                console.log('📸 Uploading profile image...');
                try {
                    const result = await UserModel.uploadImage(DOM.profileImageInput.files[0], 'profile');
                    if (result.success) {
                        UserModel.updateLocal({ profileIMG: result.imageUrl });
                        console.log('✅ Profile image uploaded:', result.imageUrl);
                    } else {
                        Utils.showNotification(`Profile image: ${result.message}`, 'error');
                    }
                } catch (error) {
                    console.error('Profile upload error:', error);
                    Utils.showNotification('Failed to upload profile image', 'error');
                }
            }
            
            if (DOM.bannerInput.files[0]) {
                console.log('🎬 Uploading banner image...');
                try {
                    const result = await UserModel.uploadImage(DOM.bannerInput.files[0], 'banner');
                    if (result.success) {
                        UserModel.updateLocal({ bannerIMG: result.imageUrl });
                        console.log('✅ Banner image uploaded:', result.imageUrl);
                    } else {
                        Utils.showNotification(`Banner image: ${result.message}`, 'error');
                    }
                } catch (error) {
                    console.error('Banner upload error:', error);
                    Utils.showNotification('Failed to upload banner image', 'error');
                }
            }
            
            if (DOM.backgroundInput.files[0]) {
                console.log('🌅 Uploading background image...');
                try {
                    const result = await UserModel.uploadImage(DOM.backgroundInput.files[0], 'background');
                    if (result.success) {
                        UserModel.updateLocal({ backgroundIMG: result.imageUrl });
                        console.log('✅ Background image uploaded:', result.imageUrl);
                    } else {
                        Utils.showNotification(`Background image: ${result.message}`, 'error');
                    }
                } catch (error) {
                    console.error('Background upload error:', error);
                    Utils.showNotification('Failed to upload background image', 'error');
                }
            }
            
            console.log('✅ All file uploads attempted');
        },

        sliderNavigation(index) {
            DOM.pages.forEach((page, i) => {
                page.classList.toggle('active', i === index);
            });
            
            const sections = [
                document.querySelector('.my-profile'),
                document.querySelector('.my-clients'),
                document.querySelector('.to-do-list')
            ];
            
            sections.forEach((section, i) => {
                if (section) {
                    section.style.display = i === index ? 'block' : 'none';
                    if (i === index) {
                        section.style.animation = 'fadeIn 0.5s ease';
                        
                        // Load clients data when clients section is shown
                        if (i === 1) {
                            Render.clients();
                        }
                    }
                }
            });
        },

        async socialMediaClick(e) {
            const icon = e.target.closest('a');
            if (!icon) return;
            
            e.preventDefault();
            const platform = icon.classList[0];
            
            if (isOwner) {
                await this.handleSocialMediaEdit(icon, platform);
            } else {
                this.handleSocialMediaVisit(icon, platform);
            }
        },

        async handleSocialMediaEdit(icon, platform) {
            if (icon.parentElement.querySelector('.social-input')) return;

            const container = document.createElement('div');
            container.className = 'social-edit-container';
            container.style.display = 'flex';
            container.style.gap = '8px';
            container.style.marginTop = '10px';
            container.style.alignItems = 'center';

            const input = document.createElement('input');
            input.type = 'url';
            input.placeholder = `https://${platform}.com/username`;
            input.className = 'social-input';
            input.value = UserModel.get().social[platform] || '';
            input.style.flex = '1';

            const saveBtn = document.createElement('button');
            saveBtn.innerHTML = '<i class="fas fa-check"></i>';
            saveBtn.className = 'social-save-btn';
            saveBtn.title = 'Save';

            const cancelBtn = document.createElement('button');
            cancelBtn.innerHTML = '<i class="fas fa-times"></i>';
            cancelBtn.className = 'social-save-btn';
            cancelBtn.title = 'Cancel';

            container.appendChild(input);
            container.appendChild(saveBtn);
            container.appendChild(cancelBtn);
            icon.parentElement.appendChild(container);

            setTimeout(() => input.focus(), 10);

            // Save handler
            saveBtn.addEventListener('click', async () => {
                const newLink = input.value.trim();
                if (newLink) {
                    try {
                        const result = await UserModel.updateSocialMedia(platform, newLink);
                        
                        if (result.success) {
                            const social = { ...UserModel.get().social };
                            social[platform] = newLink;
                            UserModel.updateLocal({ social });
                            icon.href = newLink;
                            Utils.showNotification(`${platform} link updated!`, 'success');
                        } else {
                            Utils.showNotification(result.message, 'error');
                        }
                    } catch (error) {
                        Utils.showNotification(`Error updating ${platform}: ${error.message}`, 'error');
                    }
                }
                container.remove();
            }, { once: true });

            // Cancel handler
            cancelBtn.addEventListener('click', () => {
                container.remove();
            }, { once: true });

            input.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    saveBtn.click();
                }
            });
        },

        handleSocialMediaVisit(icon, platform) {
            const link = UserModel.get().social[platform];
            if (link && link !== '#') {
                window.open(link, '_blank', 'noopener,noreferrer');
            } else {
                Utils.showNotification(`No ${platform} link available`, 'error');
            }
        }
    };

    // ============================
    // INITIALIZATION
    // ============================
    async function init() {
        console.log('🚀 Initializing profile page...');
        
        // Initialize session
        const sessionOk = await initializeSession();
        if (!sessionOk) return;
        
        console.log('✅ Session initialized:', { providerId, isOwner });
        
        // Set global variables for other scripts
        window.profileData = {
            providerId: providerId,
            isOwner: isOwner
        };
        
        // Load profile data
        await UserModel.loadFromBackend();
        
        // Initial render
        await Render.profile(UserModel.get());
        
        // Setup event listeners
        setupEventListeners();
        
        // Initialize slider based on ownership
        if (DOM.slider) {
            if (isOwner) {
                DOM.slider.style.display = 'flex';
                if (DOM.pages.length > 0) {
                    DOM.pages[0].classList.add('active');
                }
            } else {
                DOM.slider.style.display = 'none';
                // Show only profile section for visitors
                document.querySelector('.my-profile').style.display = 'block';
                document.querySelector('.my-clients').style.display = 'none';
                document.querySelector('.to-do-list').style.display = 'none';
            }
        }
        
        // Update page title
        document.title = `Skillara - ${UserModel.get().username}'s Profile`;
        
        console.log('✅ Profile page initialization complete');
    }

    function setupEventListeners() {
        console.log('🔗 Setting up event listeners, isOwner:', isOwner);
        
        // Edit popup (only for owners)
        if (isOwner && DOM.flipCard && DOM.editPopup) {
            DOM.flipCard.addEventListener('dblclick', EventHandlers.editPopup.open);
            DOM.flipCard.style.cursor = 'pointer';
            DOM.flipCard.title = 'Double-click to edit profile';
        } else if (DOM.flipCard) {
            DOM.flipCard.style.cursor = 'default';
            DOM.flipCard.title = '';
        }

        // Close popup buttons
        if (DOM.editPopup) {
            const closeBtn = DOM.editPopup.querySelector('.close-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', EventHandlers.editPopup.close);
            }
            
            DOM.editPopup.addEventListener('click', (e) => {
                if (e.target === DOM.editPopup) {
                    EventHandlers.editPopup.close();
                }
            });
        }

        // Form submission (only for owners)
        if (DOM.editForm && isOwner) {
            DOM.editForm.addEventListener('submit', (e) => EventHandlers.formSubmit(e));
        } else if (DOM.editForm) {
            DOM.editForm.style.display = 'none';
        }

        // Slider navigation
        if (DOM.slider && DOM.pages.length > 0) {
            DOM.pages.forEach((page, index) => {
                page.addEventListener('click', () => {
                    EventHandlers.sliderNavigation(index);
                });
            });
        }

        // Social media icons
        if (DOM.socialIconsContainer) {
            DOM.socialIconsContainer.addEventListener('click', (e) => EventHandlers.socialMediaClick(e));
        }

        // Keyboard shortcuts (owner only)
        if (isOwner) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && DOM.editPopup && DOM.editPopup.style.display === 'flex') {
                    EventHandlers.editPopup.close();
                }
                
                if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                    e.preventDefault();
                    EventHandlers.editPopup.open();
                }
            });
        }
    }

    // Start the application
    init();
});