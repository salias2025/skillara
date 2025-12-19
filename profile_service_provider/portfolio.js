document.addEventListener('DOMContentLoaded', () => {
    console.log('🔄 Portfolio.js loaded');
    
    const portfolioGrid = document.querySelector('.portfolio-grid');
    const addPortfolioBtn = document.querySelector('.add-portfolio-btn');
    
    console.log('🔍 Debug - Add button element:', addPortfolioBtn);
    console.log('🔍 Debug - Add button HTML:', addPortfolioBtn?.outerHTML);
    
    // Get providerId and isOwner from the global profileData (set in profile.js)
    let providerId = window.profileData?.providerId;
    let isOwner = window.profileData?.isOwner || false;
    
    console.log('🎯 Debug - Initial values:', { providerId, isOwner });
    
    const API_BASE = 'portfolio_handler.php';

    // Portfolio model
    const PortfolioModel = {
        portfolioItems: [],

        async loadPortfolio() {
            if (!providerId) return [];
            
            try {
                console.log('🔍 Loading portfolio for provider:', providerId);
                const response = await fetch(`${API_BASE}?action=getPortfolio&providerId=${providerId}`);
                const result = await response.json();
                
                if (result.success) {
                    this.portfolioItems = result.data;
                    console.log('✅ Loaded portfolio items:', this.portfolioItems);
                    return this.portfolioItems;
                } else {
                    throw new Error(result.message || 'Failed to load portfolio');
                }
            } catch (error) {
                console.error('Failed to load portfolio:', error);
                this.showNotification('Failed to load portfolio items', 'error');
                return [];
            }
        },

        async addPortfolioItem(title, category, imageFile, link = '') {
            if (!isOwner || !providerId) {
                throw new Error('Not authorized to add portfolio items');
            }
            
            try {
                const formData = new FormData();
                formData.append('action', 'addPortfolio');
                formData.append('providerId', providerId);
                formData.append('title', title);
                formData.append('category', category);
                formData.append('link', link);
                
                if (imageFile) {
                    formData.append('image', imageFile);
                }
                
                const response = await fetch(API_BASE, {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                return result;
            } catch (error) {
                console.error('Add portfolio item error:', error);
                throw error;
            }
        },

        async updatePortfolioItem(portfolioId, title, category, imageFile = null, link = '', existingImage = '') {
            if (!isOwner || !providerId) {
                throw new Error('Not authorized to update portfolio items');
            }
            
            try {
                const formData = new FormData();
                formData.append('action', 'updatePortfolio');
                formData.append('providerId', providerId);
                formData.append('portfolioId', portfolioId);
                formData.append('title', title);
                formData.append('category', category);
                formData.append('link', link);
                formData.append('existing_image', existingImage);
                
                if (imageFile) {
                    formData.append('image', imageFile);
                }
                
                const response = await fetch(API_BASE, {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                return result;
            } catch (error) {
                console.error('Update portfolio item error:', error);
                throw error;
            }
        },

        showNotification(message, type = 'success') {
            // Reuse the notification function from Utils if available
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
        },

        // Helper to create image preview URL
        createImagePreview(file) {
            return new Promise((resolve) => {
                if (!file) {
                    resolve('');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    resolve(e.target.result);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    // --- Render portfolio ---
    async function renderPortfolio() {
        // Load portfolio from database
        await PortfolioModel.loadPortfolio();
        
        portfolioGrid.innerHTML = '';
        
        PortfolioModel.portfolioItems.forEach((item) => {
            const card = createPortfolioCard(item);
            portfolioGrid.appendChild(card);
        });
        
        // Show empty state if no portfolio items
        if (PortfolioModel.portfolioItems.length === 0) {
            portfolioGrid.innerHTML = `
                <div class="no-portfolio">
                    <i class="fas fa-images"></i>
                    <h3>No Portfolio Items Yet</h3>
                    <p>${isOwner ? 'Click "Add Project" to showcase your work!' : 'This provider hasn\'t added any portfolio items yet.'}</p>
                </div>
            `;
        }
    }

    function createPortfolioCard(item) {
        const card = document.createElement('div');
        card.classList.add('portfolio-item');
        
        // Use the FULL URL from backend
        const imageSrc = item.img || getDefaultImage();
        
        card.innerHTML = `
            <img src="${imageSrc}" alt="${item.title}" 
                 onerror="this.onerror=null; this.src='${getDefaultImage()}'">
            <div class="portfolio-info">
                <div class="info-text">
                    <h3>${item.title}</h3>
                    <p>${item.category}</p>
                </div>
                ${item.link ? `<a href="${item.link}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-arrow-up-right-from-square overlay-arrow"></i></a>` : ''}
            </div>
        `;

        if (isOwner) {
            // Owner mode: Double-click to edit
            card.style.cursor = 'pointer';
            card.title = 'Double-click to edit';
            
            card.addEventListener('dblclick', () => {
                showEditPortfolioForm(card, item);
            });
        } else {
            // Non-owner mode: Click to visit link (if exists)
            if (item.link) {
                card.style.cursor = 'pointer';
                card.title = 'Click to visit project';
                
                card.addEventListener('click', (e) => {
                    // Don't trigger if clicking on the external link icon
                    if (!e.target.closest('a')) {
                        window.open(item.link, '_blank', 'noopener,noreferrer');
                    }
                });
            }
        }

        return card;
    }

    function getDefaultImage() {
        // Use a data URL for a placeholder image
        return 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
                <rect width="100%" height="100%" fill="#f5f5f5"/>
                <rect x="50" y="40" width="200" height="120" fill="#e0e0e0" rx="8"/>
                <rect x="100" y="85" width="100" height="30" fill="#7B3FE4" rx="4"/>
                <text x="150" y="103" text-anchor="middle" fill="white" font-family="Arial" font-size="14">
                    No Image
                </text>
                <text x="150" y="180" text-anchor="middle" fill="#666" font-family="Arial" font-size="12">
                    Portfolio Image
                </text>
            </svg>
        `);
    }

    function showEditPortfolioForm(originalCard, item) {
        const editCard = document.createElement('div');
        editCard.classList.add('portfolio-item', 'editing');
        
        // Extract just the filename from the URL for existing_image
        const existingImage = item.img ? item.img.split('/').pop() : '';
        
        editCard.innerHTML = `
            <div class="portfolio-image-preview">
                <img src="${item.img || getDefaultImage()}" 
                     alt="Current image" 
                     id="current-image-${item.id_portfolio}" 
                     style="max-width: 100%; max-height: 150px; margin-bottom: 10px; border-radius: 4px;">
            </div>
            <input type="text" class="portfolio-input portfolio-input-title" placeholder="Project Title *" value="${item.title}" />
            <input type="text" class="portfolio-input portfolio-input-category" placeholder="Category (ex: Web Design) *" value="${item.category}" />
            <input type="text" class="portfolio-input portfolio-input-link" placeholder="Link (optional)" value="${item.link || ''}" />
            <div class="portfolio-file-input">
                <label for="image-input-${item.id_portfolio}">
                    <i class="fas fa-upload"></i> Change Image
                </label>
                <input type="file" id="image-input-${item.id_portfolio}" class="portfolio-input-image" accept="image/*" />
                <span class="file-name" style="font-size: 12px; color: #666; margin-left: 10px;"></span>
            </div>
            <div style="margin-top:15px; display:flex; gap:10px; justify-content: flex-end;">
                <button class="save-portfolio-btn">Save</button>
                <button class="cancel-portfolio-btn">Cancel</button>
            </div>
        `;

        const imageInput = editCard.querySelector(`#image-input-${item.id_portfolio}`);
        const fileNameSpan = editCard.querySelector('.file-name');
        const currentImage = editCard.querySelector(`#current-image-${item.id_portfolio}`);
        let selectedImageFile = null;
        let imagePreviewUrl = item.img || '';

        imageInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                selectedImageFile = file;
                fileNameSpan.textContent = file.name;
                
                // Create preview
                const previewUrl = await PortfolioModel.createImagePreview(file);
                if (previewUrl) {
                    currentImage.src = previewUrl;
                    imagePreviewUrl = previewUrl;
                }
                PortfolioModel.showNotification('New image selected', 'success');
            }
        });

        editCard.querySelector('.cancel-portfolio-btn').addEventListener('click', () => {
            editCard.replaceWith(originalCard);
            PortfolioModel.showNotification('Edit cancelled', 'error');
        });

        editCard.querySelector('.save-portfolio-btn').addEventListener('click', async () => {
            const title = editCard.querySelector('.portfolio-input-title').value.trim();
            const category = editCard.querySelector('.portfolio-input-category').value.trim();
            const link = editCard.querySelector('.portfolio-input-link').value.trim();

            // Validation
            if (!title) {
                PortfolioModel.showNotification('Project title is required', 'error');
                return;
            }
            if (!category) {
                PortfolioModel.showNotification('Project category is required', 'error');
                return;
            }

            try {
                const result = await PortfolioModel.updatePortfolioItem(
                    item.id_portfolio,
                    title,
                    category,
                    selectedImageFile,
                    link,
                    existingImage
                );
                
                if (result.success) {
                    await renderPortfolio();
                    PortfolioModel.showNotification('Portfolio item updated successfully!', 'success');
                } else {
                    PortfolioModel.showNotification(result.message, 'error');
                }
            } catch (error) {
                PortfolioModel.showNotification(`Error updating portfolio item: ${error.message}`, 'error');
            }
        });

        originalCard.replaceWith(editCard);
    }

    function showAddPortfolioForm() {
        const addCard = document.createElement('div');
        addCard.classList.add('portfolio-item', 'editing');
        
        addCard.innerHTML = `
            <div class="portfolio-image-preview">
                <img src="${getDefaultImage()}" 
                     alt="Image preview" 
                     id="new-image-preview" 
                     style="max-width: 100%; max-height: 150px; margin-bottom: 10px; border-radius: 4px; opacity: 0.5;">
                <p style="font-size: 12px; color: #888; margin-bottom: 15px; text-align: center;">No image selected</p>
            </div>
            <input type="text" class="portfolio-input portfolio-input-title" placeholder="Project Title *" />
            <input type="text" class="portfolio-input portfolio-input-category" placeholder="Category (ex: Web Design) *" />
            <input type="text" class="portfolio-input portfolio-input-link" placeholder="Link (optional)" />
            <div class="portfolio-file-input">
                <label for="new-image-input">
                    <i class="fas fa-upload"></i> Upload Image *
                </label>
                <input type="file" id="new-image-input" class="portfolio-input-image" accept="image/*" required />
                <span class="file-name"></span>
            </div>
            <div style="margin-top:15px; display:flex; gap:10px; justify-content: flex-end;">
                <button class="save-portfolio-btn">Add Project</button>
                <button class="cancel-portfolio-btn">Cancel</button>
            </div>
        `;

        const imageInput = addCard.querySelector('#new-image-input');
        const fileNameSpan = addCard.querySelector('.file-name');
        const imagePreview = addCard.querySelector('#new-image-preview');
        const previewText = addCard.querySelector('.portfolio-image-preview p');
        let selectedImageFile = null;
        let imagePreviewUrl = '';

        imageInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                selectedImageFile = file;
                fileNameSpan.textContent = file.name;
                
                // Create preview
                const previewUrl = await PortfolioModel.createImagePreview(file);
                if (previewUrl) {
                    imagePreview.src = previewUrl;
                    imagePreview.style.opacity = '1';
                    previewText.style.display = 'none';
                    imagePreviewUrl = previewUrl;
                }
                PortfolioModel.showNotification('Image selected', 'success');
            }
        });

        addCard.querySelector('.cancel-portfolio-btn').addEventListener('click', () => {
            addCard.remove();
            PortfolioModel.showNotification('Portfolio item creation cancelled', 'error');
        });

        addCard.querySelector('.save-portfolio-btn').addEventListener('click', async () => {
            const title = addCard.querySelector('.portfolio-input-title').value.trim();
            const category = addCard.querySelector('.portfolio-input-category').value.trim();
            const link = addCard.querySelector('.portfolio-input-link').value.trim();

            // Validation
            if (!title) {
                PortfolioModel.showNotification('Project title is required', 'error');
                return;
            }
            if (!category) {
                PortfolioModel.showNotification('Project category is required', 'error');
                return;
            }
            if (!selectedImageFile) {
                PortfolioModel.showNotification('Project image is required', 'error');
                return;
            }

            try {
                const result = await PortfolioModel.addPortfolioItem(
                    title,
                    category,
                    selectedImageFile,
                    link
                );
                
                if (result.success) {
                    await renderPortfolio();
                    PortfolioModel.showNotification('Portfolio item added successfully!', 'success');
                } else {
                    PortfolioModel.showNotification(result.message, 'error');
                }
            } catch (error) {
                PortfolioModel.showNotification(`Error adding portfolio item: ${error.message}`, 'error');
            }
        });

        portfolioGrid.prepend(addCard);
        addCard.scrollIntoView({ behavior: 'smooth' });
    }

    // --- Initialize ---
    async function init() {
        console.log('🚀 Initializing portfolio section...');
        console.log('✅ Provider ID:', providerId);
        console.log('✅ Is Owner:', isOwner);
        
        if (!providerId) {
            console.error('No provider ID available');
            return;
        }
        
        // Set up add button (MUST BE IN init, not at top level)
        if (isOwner && addPortfolioBtn) {
            console.log('👑 Owner mode detected, showing add button');
            addPortfolioBtn.style.display = 'flex';
            addPortfolioBtn.style.backgroundColor = '#7B3FE4'; // Make sure it's visible
            addPortfolioBtn.style.color = 'white';
            addPortfolioBtn.style.padding = '10px 20px';
            addPortfolioBtn.style.borderRadius = '5px';
            addPortfolioBtn.style.border = 'none';
            addPortfolioBtn.style.cursor = 'pointer';
            addPortfolioBtn.style.fontSize = '16px';
            
            addPortfolioBtn.addEventListener('click', () => {
                console.log('➕ Add button clicked');
                showAddPortfolioForm();
            });
        } else if (addPortfolioBtn) {
            console.log('👤 Visitor mode or button not found');
            addPortfolioBtn.style.display = 'none';
        }
        
        await renderPortfolio();
        console.log('✅ Portfolio section initialized');
    }

    // Wait a bit for profile.js to set window.profileData
    setTimeout(() => {
        if (!providerId) {
            // Try to get from profile.js again
            providerId = window.profileData?.providerId;
            isOwner = window.profileData?.isOwner || false;
        }
        console.log('⏳ After timeout, values:', { providerId, isOwner });
        init();
    }, 500);
});