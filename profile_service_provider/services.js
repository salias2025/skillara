document.addEventListener('DOMContentLoaded', () => {
    const servicesContainer = document.querySelector('.services-container');
    const addServiceBtn = document.querySelector('.add-service-btn');

    // Get providerId and isOwner from the global profileData (set in profile.js)
    let providerId = window.profileData?.providerId;
    let isOwner = window.profileData?.isOwner || false;
    const API_BASE = 'services_handler.php';

    // Services model
    const ServicesModel = {
        services: [],

        async loadServices() {
            if (!providerId) return [];
            
            try {
                console.log('🔍 Loading services for provider:', providerId);
                const response = await fetch(`${API_BASE}?action=getServices&providerId=${providerId}`);
                const result = await response.json();
                
                if (result.success) {
                    this.services = result.data;
                    console.log('✅ Loaded services:', this.services);
                    return this.services;
                } else {
                    throw new Error(result.message || 'Failed to load services');
                }
            } catch (error) {
                console.error('Failed to load services:', error);
                this.showNotification('Failed to load services', 'error');
                return [];
            }
        },

        async addService(icon, title, description) {
            if (!isOwner || !providerId) {
                throw new Error('Not authorized to add services');
            }
            
            try {
                const formData = new FormData();
                formData.append('action', 'addService');
                formData.append('providerId', providerId);
                formData.append('title', title);
                formData.append('description', description);
                formData.append('icon', icon);
                
                const response = await fetch(API_BASE, {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                return result;
            } catch (error) {
                console.error('Add service error:', error);
                throw error;
            }
        },

        async updateService(serviceId, icon, title, description) {
            if (!isOwner || !providerId) {
                throw new Error('Not authorized to update services');
            }
            
            try {
                const formData = new FormData();
                formData.append('action', 'updateService');
                formData.append('providerId', providerId);
                formData.append('serviceId', serviceId);
                formData.append('title', title);
                formData.append('description', description);
                formData.append('icon', icon);
                
                const response = await fetch(API_BASE, {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                return result;
            } catch (error) {
                console.error('Update service error:', error);
                throw error;
            }
        },

        showNotification(message, type = 'success') {
            // Reuse the notification function from profile.js if available
            if (window.Utils && window.Utils.showNotification) {
                return window.Utils.showNotification(message, type);
            }
            
            // Fallback notification
            console.log(`💬 Notification (${type}):`, message);
            
            const existing = document.querySelector('.notification');
            if (existing) existing.remove();

            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.innerHTML = `
                <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}"></i>
                <span>${message}</span>
                <button class="close-notification">&times;</button>
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translateY(-20px)';
                setTimeout(() => notification.remove(), 300);
            }, 4000);
            
            notification.querySelector('.close-notification').addEventListener('click', () => {
                notification.remove();
            });
        }
    };

    // --- Modal setup ---
    const modal = document.createElement('div');
    modal.classList.add('service-modal');
    modal.innerHTML = `
        <div class="service-modal-content">
            <span class="service-modal-close">&times;</span>
            <i class="fas service-modal-icon"></i>
            <h3 class="service-modal-title"></h3>
            <p class="service-modal-desc"></p>
        </div>
    `;
    document.body.appendChild(modal);

    const modalIcon = modal.querySelector('.service-modal-icon');
    const modalTitle = modal.querySelector('.service-modal-title');
    const modalDesc = modal.querySelector('.service-modal-desc');
    const modalClose = modal.querySelector('.service-modal-close');

    modalClose.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', e => { 
        if (e.target === modal) modal.style.display = 'none'; 
    });

    // --- Render services ---
    async function renderServices() {
        // Load services from database
        await ServicesModel.loadServices();
        
        servicesContainer.innerHTML = '';
        
        ServicesModel.services.forEach((service, index) => {
            const card = document.createElement('div');
            card.classList.add('service-card');
            card.innerHTML = `
                <i class="fas ${service.icon} service-icon"></i>
                <h3>${service.title}</h3>
                <p class="service-text">${service.description}</p>
                <button class="service-btn">Read More</button>
            `;
            servicesContainer.appendChild(card);

            // Read More modal
            const readMoreBtn = card.querySelector('.service-btn');
            readMoreBtn.addEventListener('click', () => {
                modalIcon.className = `fas ${service.icon} service-modal-icon`;
                modalTitle.textContent = service.title;
                modalDesc.textContent = service.description;
                modal.style.display = 'flex';
            });

            // Owner double-click to edit
            if (isOwner) {
                card.style.cursor = 'pointer';
                card.title = 'Double-click to edit';
                
                card.addEventListener('dblclick', () => {
                    card.innerHTML = `
                        <input type="text" class="service-input service-input-title" value="${service.title}">
                        <input type="text" class="service-input service-input-icon" value="${service.icon}" placeholder="FontAwesome icon (fa-laptop-code)">
                        <textarea class="service-input service-input-desc">${service.description}</textarea>
                        <div style="margin-top:10px; display:flex; gap:10px;">
                            <button class="save-service-btn">Save</button>
                            <button class="cancel-service-btn">Cancel</button>
                        </div>
                    `;

                    // Cancel restores original content
                    card.querySelector('.cancel-service-btn').addEventListener('click', async () => {
                        await renderServices();
                        ServicesModel.showNotification('Edit cancelled', 'error');
                    });

                    // Save updates service
                    card.querySelector('.save-service-btn').addEventListener('click', async () => {
                        const newTitle = card.querySelector('.service-input-title').value.trim();
                        const newDesc = card.querySelector('.service-input-desc').value.trim();
                        const newIcon = card.querySelector('.service-input-icon').value.trim() || 'fa-laptop-code';

                        if (!newTitle || !newDesc) {
                            ServicesModel.showNotification('Title and Description required', 'error');
                            return;
                        }

                        try {
                            const result = await ServicesModel.updateService(
                                service.id_service, 
                                newIcon, 
                                newTitle, 
                                newDesc
                            );
                            
                            if (result.success) {
                                await renderServices();
                                ServicesModel.showNotification('Service updated successfully!', 'success');
                            } else {
                                ServicesModel.showNotification(result.message, 'error');
                            }
                        } catch (error) {
                            ServicesModel.showNotification(`Error updating service: ${error.message}`, 'error');
                        }
                    });
                });
            }
        });
        
        // Show empty state if no services
        if (ServicesModel.services.length === 0) {
            servicesContainer.innerHTML = `
                <div class="no-services">
                    <i class="fas fa-box-open"></i>
                    <h3>No Services Yet</h3>
                    <p>${isOwner ? 'Click "Add Service" to get started!' : 'This provider hasn\'t added any services yet.'}</p>
                </div>
            `;
        }
    }

    // --- Add Service button ---
    if (isOwner && addServiceBtn) {
        addServiceBtn.style.display = 'flex';
        addServiceBtn.addEventListener('click', () => {
            const card = document.createElement('div');
            card.classList.add('service-card');
            card.innerHTML = `
                <input type="text" class="service-input service-input-title" placeholder="Service Title">
                <input type="text" class="service-input service-input-icon" placeholder="FontAwesome Icon (fa-paint-brush)">
                <textarea class="service-input service-input-desc" placeholder="Service Description"></textarea>
                <div style="margin-top:10px; display:flex; gap:10px;">
                    <button class="save-service-btn">Add Service</button>
                    <button class="cancel-service-btn">Cancel</button>
                </div>
            `;

            // Cancel removes card
            card.querySelector('.cancel-service-btn').addEventListener('click', () => {
                card.remove();
                ServicesModel.showNotification('Service creation cancelled', 'error');
            });

            // Save adds new service
            card.querySelector('.save-service-btn').addEventListener('click', async () => {
                const title = card.querySelector('.service-input-title').value.trim();
                const desc = card.querySelector('.service-input-desc').value.trim();
                const icon = card.querySelector('.service-input-icon').value.trim() || 'fa-laptop-code';

                if (!title || !desc) {
                    ServicesModel.showNotification('Title and Description required', 'error');
                    return;
                }

                try {
                    const result = await ServicesModel.addService(icon, title, desc);
                    
                    if (result.success) {
                        await renderServices();
                        ServicesModel.showNotification('Service added successfully!', 'success');
                    } else {
                        ServicesModel.showNotification(result.message, 'error');
                    }
                } catch (error) {
                    ServicesModel.showNotification(`Error adding service: ${error.message}`, 'error');
                }
            });

            servicesContainer.prepend(card);
            card.scrollIntoView({ behavior: 'smooth' });
        });
    } else if (addServiceBtn) {
        addServiceBtn.style.display = 'none';
    }

    // --- Initialize ---
    async function init() {
        console.log('🚀 Initializing services section...');
        console.log('✅ Provider ID:', providerId);
        console.log('✅ Is Owner:', isOwner);
        
        if (!providerId) {
            console.error('No provider ID available');
            return;
        }
        
        await renderServices();
        console.log('✅ Services section initialized');
    }

    // Wait a bit for profile.js to set window.profileData
    setTimeout(() => {
        if (!providerId) {
            // Try to get from profile.js again
            providerId = window.profileData?.providerId;
            isOwner = window.profileData?.isOwner || false;
        }
        init();
    }, 500);
});