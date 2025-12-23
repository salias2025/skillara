document.addEventListener('DOMContentLoaded', () => {
    const skillsContainer = document.querySelector('.skills-container');
    const addSkillBtn = document.querySelector('.add-skill-btn');

    // Get providerId and isOwner from the global profileData
    let providerId = window.profileData?.providerId;
    let isOwner = window.profileData?.isOwner || false;
    const API_BASE = 'skills_handler.php';

    // Skills model
    const SkillsModel = {
        skills: [],

        async loadSkills() {
            if (!providerId) return [];
            
            try {
                console.log('🔍 Loading skills for provider:', providerId);
                const response = await fetch(`${API_BASE}?action=getSkills&providerId=${providerId}`);
                const result = await response.json();
                
                if (result.success) {
                    this.skills = result.data.map(skill => ({
                        id_skill: skill.id_skill,
                        name: skill.title,
                        icon: skill.icon,
                        color: skill.color || this.getRandomColor(),
                        proficiency: parseInt(skill.mastery)
                    }));
                    console.log('✅ Loaded skills:', this.skills);
                    return this.skills;
                } else {
                    throw new Error(result.message || 'Failed to load skills');
                }
            } catch (error) {
                console.error('Failed to load skills:', error);
                this.showNotification('Failed to load skills', 'error');
                return [];
            }
        },

        async addSkill(name, icon, proficiency, color = '#7B3FE4') {
            if (!isOwner || !providerId) {
                throw new Error('Not authorized to add skills');
            }
            
            try {
                const formData = new FormData();
                formData.append('action', 'addSkill');
                formData.append('providerId', providerId);
                formData.append('title', name);
                formData.append('icon', icon);
                formData.append('mastery', proficiency);
                formData.append('color', color);
                
                const response = await fetch(API_BASE, {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                return result;
            } catch (error) {
                console.error('Add skill error:', error);
                throw error;
            }
        },

        async updateSkill(skillId, name, icon, proficiency, color = null) {
            if (!isOwner || !providerId) {
                throw new Error('Not authorized to update skills');
            }
            
            try {
                const formData = new FormData();
                formData.append('action', 'updateSkill');
                formData.append('providerId', providerId);
                formData.append('skillId', skillId);
                formData.append('title', name);
                formData.append('icon', icon);
                formData.append('mastery', proficiency);
                
                // Include color if provided
                if (color) {
                    formData.append('color', color);
                }
                
                const response = await fetch(API_BASE, {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                return result;
            } catch (error) {
                console.error('Update skill error:', error);
                throw error;
            }
        },

        async updateSkillColor(skillId, name, icon, proficiency, color) {
            if (!isOwner || !providerId) {
                throw new Error('Not authorized to update skills');
            }
            
            try {
                const formData = new FormData();
                formData.append('action', 'updateSkill');
                formData.append('providerId', providerId);
                formData.append('skillId', skillId);
                formData.append('title', name);
                formData.append('icon', icon);
                formData.append('mastery', proficiency);
                formData.append('color', color);
                
                const response = await fetch(API_BASE, {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                return result;
            } catch (error) {
                console.error('Update skill color error:', error);
                throw error;
            }
        },

        async deleteSkill(skillId) {
            if (!isOwner || !providerId) {
                throw new Error('Not authorized to delete skills');
            }
            
            try {
                const formData = new FormData();
                formData.append('action', 'deleteSkill');
                formData.append('providerId', providerId);
                formData.append('skillId', skillId);
                
                const response = await fetch(API_BASE, {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                return result;
            } catch (error) {
                console.error('Delete skill error:', error);
                throw error;
            }
        },

        getRandomColor() {
            const colors = [
                '#7B3FE4', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
                '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE',
                '#85C1E9', '#82E0AA', '#F8C471', '#F1948A', '#85C1E9',
                '#A569BD', '#5DADE2', '#73C6B6', '#D7BDE2', '#F0B27A'
            ];
            return colors[Math.floor(Math.random() * colors.length)];
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
        },

        hexToRgb(hex) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? 
                `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` 
                : '123, 63, 228';
        }
    };

    // --- Render all skills ---
    async function renderSkills() {
        // Load skills from database
        await SkillsModel.loadSkills();
        
        skillsContainer.innerHTML = '';
        
        if (SkillsModel.skills.length === 0) {
            skillsContainer.innerHTML = `
                <div class="no-skills">
                    <i class="fas fa-code"></i>
                    <h3>No skills added yet</h3>
                    <p>${isOwner ? 'Add your first skill to showcase your expertise!' : 'This provider hasn\'t added any skills yet.'}</p>
                </div>
            `;
            return;
        }
        
        SkillsModel.skills.forEach(skill => {
            const card = createSkillCard(skill);
            skillsContainer.appendChild(card);
        });
        
        // Animate proficiency bars when they come into view
        animateProficiencyBars();
    }

    // --- Create skill card (view mode) ---
    function createSkillCard(skill) {
        const card = document.createElement('div');
        card.classList.add('skill-card');
        card.style.setProperty('--skill-color', skill.color);
        card.style.setProperty('--skill-color-rgb', SkillsModel.hexToRgb(skill.color));
        
        card.innerHTML = `
            <div class="skill-header">
                <i class="${skill.icon} skill-icon" style="color: ${skill.color}"></i>
                <div class="skill-name">${skill.name}</div>
            </div>
            
            <div class="skill-proficiency">
                <div class="proficiency-header">
                    <span class="proficiency-label">Mastery Level</span>
                    <span class="proficiency-percentage">${skill.proficiency}%</span>
                </div>
                <div class="proficiency-bar">
                    <div class="proficiency-fill" style="width: ${skill.proficiency}%; background: linear-gradient(90deg, ${skill.color}, rgba(${SkillsModel.hexToRgb(skill.color)}, 0.7))"></div>
                </div>
            </div>
            
            ${isOwner ? `
            <div class="skill-actions">
                <button class="edit">
                    <i class="fas fa-pen"></i>
                    <span>Edit</span>
                </button>
                <button class="delete">
                    <i class="fas fa-trash"></i>
                    <span>Delete</span>
                </button>
            </div>
            
            <div class="color-picker-container">
                <span class="color-picker-label">Icon Color:</span>
                <input type="color" class="color-picker" value="${skill.color}" title="Change icon color">
            </div>
            ` : ''}
        `;

        const iconEl = card.querySelector('.skill-icon');
        const proficiencyFill = card.querySelector('.proficiency-fill');
        
        // Color picker functionality for owners
        if (isOwner) {
            const colorPicker = card.querySelector('.color-picker');
            
            // Function to update color
            const updateColor = async (newColor) => {
                iconEl.style.color = newColor;
                skill.color = newColor;
                card.style.setProperty('--skill-color', newColor);
                card.style.setProperty('--skill-color-rgb', SkillsModel.hexToRgb(newColor));
                
                // Update proficiency bar color
                proficiencyFill.style.background = `linear-gradient(90deg, ${newColor}, rgba(${SkillsModel.hexToRgb(newColor)}, 0.7))`;
                
                // Save color to database
                try {
                    const result = await SkillsModel.updateSkillColor(
                        skill.id_skill, 
                        skill.name, 
                        skill.icon, 
                        skill.proficiency, 
                        newColor
                    );
                    
                    if (!result.success) {
                        console.error('Failed to save color:', result.message);
                        SkillsModel.showNotification('Failed to save color', 'error');
                    }
                } catch (error) {
                    console.error('Error saving color:', error);
                    SkillsModel.showNotification('Error saving color', 'error');
                }
            };
            
            // Handle color picker changes
            colorPicker.addEventListener('input', (e) => {
                updateColor(e.target.value);
            });
            
            // Delete skill
            card.querySelector('.delete').addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm(`Delete skill "${skill.name}"?`)) {
                    try {
                        const result = await SkillsModel.deleteSkill(skill.id_skill);
                        if (result.success) {
                            await renderSkills();
                            SkillsModel.showNotification(`Skill "${skill.name}" deleted!`, 'success');
                        } else {
                            SkillsModel.showNotification(result.message, 'error');
                        }
                    } catch (error) {
                        SkillsModel.showNotification(`Error deleting skill: ${error.message}`, 'error');
                    }
                }
            });

            // Edit skill
            card.querySelector('.edit').addEventListener('click', (e) => {
                e.stopPropagation();
                const editCard = createEditableCard(skill);
                card.replaceWith(editCard);
                editCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        }

        return card;
    }

    // --- Animate proficiency bars on scroll ---
    function animateProficiencyBars() {
        const proficiencyBars = document.querySelectorAll('.proficiency-fill');
        
        proficiencyBars.forEach(bar => {
            // Reset width to 0 for animation
            const finalWidth = bar.style.width;
            bar.style.width = '0%';
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Animate the bar filling up
                        setTimeout(() => {
                            bar.style.width = finalWidth;
                        }, 200);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3 });
            
            observer.observe(bar.parentElement.parentElement.parentElement);
        });
    }

    // --- Create editable skill card ---
    function createEditableCard(skill = { 
        id_skill: null,
        name: '', 
        icon: '', 
        color: SkillsModel.getRandomColor(), 
        proficiency: 70 
    }) {
        const card = document.createElement('div');
        card.classList.add('skill-card', 'editing');
        card.style.setProperty('--skill-color', skill.color);
        
        card.innerHTML = `
            <input type="text" class="skill-input skill-input-name" 
                   placeholder="Skill Name (e.g., React Development)" 
                   value="${skill.name}" />
            
            <input type="text" class="skill-input skill-input-icon" 
                   placeholder="FontAwesome Icon (e.g., fab fa-react)" 
                   value="${skill.icon}" />
            
            <div style="margin: 15px 0;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="color: #666; font-size: 14px;">Proficiency Level</span>
                    <span style="font-weight: 600; color: var(--skill-color);" class="proficiency-display">
                        ${skill.proficiency}%
                    </span>
                </div>
                <input type="range" class="skill-proficiency-slider" 
                       min="0" max="100" value="${skill.proficiency}" />
            </div>
            
            <div style="margin-top: 20px; display: flex; gap: 10px;">
                <button class="save-skill-btn">
                    <i class="fas fa-check"></i>
                    ${skill.id_skill ? 'Update' : 'Add'}
                </button>
                <button class="cancel-skill-btn">
                    <i class="fas fa-times"></i>
                    Cancel
                </button>
            </div>
        `;

        // Proficiency slider
        const slider = card.querySelector('.skill-proficiency-slider');
        const display = card.querySelector('.proficiency-display');
        
        slider.addEventListener('input', (e) => {
            display.textContent = `${e.target.value}%`;
            slider.style.setProperty('--skill-color', skill.color);
        });

        // Cancel button
        card.querySelector('.cancel-skill-btn').addEventListener('click', () => {
            if (skill.id_skill) {
                const viewCard = createSkillCard(skill);
                card.replaceWith(viewCard);
            } else {
                card.remove();
            }
        });

        // Save/Update button
        card.querySelector('.save-skill-btn').addEventListener('click', async () => {
            const name = card.querySelector('.skill-input-name').value.trim();
            const icon = card.querySelector('.skill-input-icon').value.trim();
            const proficiency = parseInt(slider.value);

            if (!name || !icon) {
                SkillsModel.showNotification('Skill name and icon are required!', 'error');
                return;
            }

            try {
                if (skill.id_skill) {
                    // Update existing skill (with current color)
                    const result = await SkillsModel.updateSkill(
                        skill.id_skill, 
                        name, 
                        icon, 
                        proficiency, 
                        skill.color
                    );
                    
                    if (result.success) {
                        skill.name = name;
                        skill.icon = icon;
                        skill.proficiency = proficiency;
                        await renderSkills();
                        SkillsModel.showNotification(`Skill "${name}" updated!`, 'success');
                    } else {
                        SkillsModel.showNotification(result.message, 'error');
                    }
                } else {
                    // Add new skill (with default color)
                    const result = await SkillsModel.addSkill(
                        name, 
                        icon, 
                        proficiency, 
                        skill.color
                    );
                    
                    if (result.success) {
                        await renderSkills();
                        SkillsModel.showNotification(`Skill "${name}" added!`, 'success');
                    } else {
                        SkillsModel.showNotification(result.message, 'error');
                    }
                }
            } catch (error) {
                SkillsModel.showNotification(`Error: ${error.message}`, 'error');
            }
        });

        // Save on Enter key
        card.querySelector('.skill-input-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                card.querySelector('.save-skill-btn').click();
            }
        });

        return card;
    }

   

    // --- Initialize ---
    async function init() {
        console.log('🚀 Initializing skills section...');
        console.log('✅ Provider ID:', providerId);
        console.log('✅ Is Owner:', isOwner);
        
        if (!providerId) {
            console.error('No provider ID available');
            return;
        }

         // --- Add Skill button ---
    if (isOwner && addSkillBtn) {
        addSkillBtn.style.display = 'flex';
        addSkillBtn.addEventListener('click', () => {
            const newCard = createEditableCard();
            skillsContainer.prepend(newCard);
            newCard.scrollIntoView({ behavior: 'smooth' });
            
            // Focus on the first input
            setTimeout(() => {
                newCard.querySelector('.skill-input-name').focus();
            }, 100);
        });
    } else if (addSkillBtn) {
        addSkillBtn.style.display = 'none';
    }
        
        await renderSkills();
        console.log('✅ Skills section initialized');
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