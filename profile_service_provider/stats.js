// skillara/profile_service_provider/stats.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('📊 Stats.js initialized');
    
    // Initialize when profile data is available
    setTimeout(() => {
        initStats();
    }, 1000);
});

async function initStats() {
    try {
        const profileData = window.profileData;
        if (!profileData) {
            console.error('❌ No profileData found');
            return;
        }
        
        const providerId = profileData.providerId;
        const isOwner = profileData.isOwner;
        
        console.log(`📊 Loading stats for provider: ${providerId}, Owner: ${isOwner}`);
        
        // Load stats from API - FIXED: Make sure stats_handler.php exists
        const response = await fetch(`stats_handler.php?action=getStats&providerId=${providerId}`);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Stats loaded:', result);
            renderStats(result, isOwner);
        } else {
            console.error('❌ Stats API error:', result.message);
            renderFallbackStats(isOwner);
        }
        
    } catch (error) {
        console.error('❌ Error loading stats:', error);
        renderFallbackStats(false);
    }
}

function renderStats(data, isOwner) {
    const stats = data.stats || {};
    const profileCompletion = data.profileCompletion || 0;
    const globalRating = data.globalRating || 0;
    const currentTasks = data.currentTasks || 0;
    
    // Calculate Skillara time (years on platform)
    const joinDate = stats.join_date ? new Date(stats.join_date) : new Date();
    const currentDate = new Date();
    const yearsOnSkillara = Math.floor((currentDate - joinDate) / (365 * 24 * 60 * 60 * 1000));
    
    // Update UI with real data
    updateStatsUI({
        profileCompletion,
        globalRating,
        currentTasks,
        yearsOnSkillara,
        stats: {
            clients: stats.client_count || 0,
            testimonials: stats.testimonial_count || 0,
            services: stats.service_count || 0,
            skills: stats.skill_count || 0,
            certifications: stats.certification_count || 0,
            portfolios: stats.portfolio_count || 0
        },
        isOwner
    });
}

function renderFallbackStats(isOwner) {
    // Use fallback data if API fails
    updateStatsUI({
        profileCompletion: 65,
        globalRating: 4.5,
        currentTasks: 7,
        yearsOnSkillara: 2,
        stats: {
            clients: 35,
            testimonials: 20,
            services: 12,
            skills: 25,
            certifications: 8,
            portfolios: 5
        },
        isOwner
    });
}

function updateStatsUI(data) {
    const {
        profileCompletion,
        globalRating,
        currentTasks,
        yearsOnSkillara,
        stats,
        isOwner
    } = data;
    
    // 1. Hide buttons based on ownership
    const subscribeBtn = document.getElementById('subscribeBtn');
    const rateBtn = document.getElementById('rateBtn');
    
    if (isOwner) {
        if (subscribeBtn) subscribeBtn.style.display = 'none';
        if (rateBtn) rateBtn.style.display = 'none';
        console.log('👤 Owner mode - buttons hidden');
    } else {
        if (subscribeBtn) subscribeBtn.style.display = 'block';
        if (rateBtn) rateBtn.style.display = 'block';
        console.log('👥 Visitor mode - buttons shown');
    }
    
    // 2. Initialize counters with real data
    function initializeCounters() {
        const numberEls = document.querySelectorAll('.stat-number');
        const statValues = [
            stats.clients,
            stats.testimonials,
            stats.services,
            stats.skills,
            stats.certifications,
            stats.portfolios
        ];
        
        numberEls.forEach((el, i) => {
            if (i < statValues.length) {
                el.textContent = '0'; // Start from 0 for animation
            }
        });
        
        // Update mini stats
        const miniStats = document.querySelectorAll('.mini-stat h4');
        if (miniStats[0]) miniStats[0].textContent = '0y';
        if (miniStats[1]) miniStats[1].textContent = '0';
    }
    
    // 3. Animate progress circle
    function animateProgress() {
        const progress = document.querySelector('.profile-completion');
        const percentageEl = document.querySelector('.percentage');
        
        if (!progress || !percentageEl) return;
        
        let current = 0;
        const duration = 2000;
        const steps = 100;
        const increment = profileCompletion / steps;
        const stepTime = duration / steps;
        
        function step() {
            if (current <= profileCompletion) {
                const gradientStop = (current / 100) * 360;
                
                progress.style.background = `
                    conic-gradient(
                        from -90deg,
                        #6a11cb 0deg,
                        #2575fc ${gradientStop}deg,
                        rgba(224, 224, 224, 0.3) ${gradientStop}deg,
                        rgba(224, 224, 224, 0.3) 360deg
                    )
                `;
                
                percentageEl.textContent = `${Math.floor(current)}%`;
                current += increment;
                setTimeout(step, stepTime);
            } else {
                progress.style.background = `
                    conic-gradient(
                        from -90deg,
                        #6a11cb 0deg,
                        #2575fc ${(profileCompletion / 100) * 360}deg,
                        rgba(224, 224, 224, 0.3) ${(profileCompletion / 100) * 360}deg,
                        rgba(224, 224, 224, 0.3) 360deg
                    )
                `;
                percentageEl.textContent = `${profileCompletion}%`;
            }
        }
        step();
    }
    
    // 4. Animate stats counters
    function animateStats() {
        const statValues = [
            stats.clients,
            stats.testimonials,
            stats.services,
            stats.skills,
            stats.certifications,
            stats.portfolios
        ];
        const numberEls = document.querySelectorAll('.stat-number');
        
        numberEls.forEach((el, i) => {
            if (i < statValues.length) {
                const targetValue = statValues[i];
                let currentValue = 0;
                const duration = 1500;
                const stepTime = Math.max(20, Math.floor(duration / targetValue));
                const increment = Math.max(1, Math.floor(targetValue / (duration / stepTime)));
                
                function updateCounter() {
                    if (currentValue < targetValue) {
                        currentValue = Math.min(currentValue + increment, targetValue);
                        el.textContent = currentValue;
                        
                        // Add pulse animation
                        el.style.transform = 'scale(1.1)';
                        setTimeout(() => {
                            el.style.transform = 'scale(1)';
                        }, 100);
                        
                        setTimeout(updateCounter, stepTime);
                    }
                }
                updateCounter();
            }
        });
        
        // Animate mini stats
        const miniStatYears = document.querySelector('.mini-stat:nth-child(1) h4');
        const miniStatTasks = document.querySelector('.mini-stat:nth-child(2) h4');
        
        if (miniStatYears) {
            let currentYear = 0;
            const yearInterval = setInterval(() => {
                if (currentYear < yearsOnSkillara) {
                    currentYear++;
                    miniStatYears.textContent = `${currentYear}y`;
                } else {
                    clearInterval(yearInterval);
                }
            }, 300);
        }
        
        if (miniStatTasks) {
            let currentTask = 0;
            const taskInterval = setInterval(() => {
                if (currentTask < currentTasks) {
                    currentTask++;
                    miniStatTasks.textContent = currentTask;
                } else {
                    clearInterval(taskInterval);
                }
            }, 100);
        }
    }
    
    // 5. Animate stars rating
    function animateStars() {
        const starsContainer = document.querySelector('.global-rating .stars');
        const ratingNum = document.querySelector('.rating-number');
        
        if (!starsContainer || !ratingNum) return;
        
        starsContainer.innerHTML = '';
        const fullStarsCount = Math.floor(globalRating);
        const hasHalfStar = globalRating % 1 >= 0.5;
        const totalStars = 5;
        
        function addStar(index) {
            if (index < fullStarsCount) {
                const star = document.createElement('span');
                star.textContent = '★';
                star.style.color = '#ffc107';
                star.style.fontSize = '42px';
                star.style.opacity = '0';
                star.style.transform = 'scale(0)';
                star.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                starsContainer.appendChild(star);
                
                setTimeout(() => {
                    star.style.opacity = '1';
                    star.style.transform = 'scale(1)';
                    star.style.textShadow = '0 0 15px rgba(255, 193, 7, 0.6), 0 4px 20px rgba(255, 193, 7, 0.3)';
                }, 50);
                
                setTimeout(() => addStar(index + 1), 300);
            } else if (index === fullStarsCount && hasHalfStar) {
                const halfStarEl = document.createElement('span');
                halfStarEl.textContent = '★';
                halfStarEl.style.color = '#ffc107';
                halfStarEl.style.fontSize = '42px';
                halfStarEl.style.opacity = '0.5';
                halfStarEl.style.opacity = '0';
                halfStarEl.style.transform = 'scale(0)';
                starsContainer.appendChild(halfStarEl);
                
                setTimeout(() => {
                    halfStarEl.style.opacity = '0.7';
                    halfStarEl.style.transform = 'scale(1)';
                }, 50);
                
                setTimeout(() => addStar(index + 1), 300);
            } else if (index < totalStars) {
                const emptyStar = document.createElement('span');
                emptyStar.textContent = '★';
                emptyStar.style.color = '#e0e0e0';
                emptyStar.style.fontSize = '42px';
                emptyStar.style.opacity = '0';
                emptyStar.style.transform = 'scale(0)';
                starsContainer.appendChild(emptyStar);
                
                setTimeout(() => {
                    emptyStar.style.opacity = '0.5';
                    emptyStar.style.transform = 'scale(1)';
                }, 50);
                
                setTimeout(() => addStar(index + 1), 200);
            } else {
                // Animate rating number
                ratingNum.style.opacity = '0';
                ratingNum.style.transform = 'translateY(10px)';
                ratingNum.textContent = `${globalRating.toFixed(1)}/5`;
                
                setTimeout(() => {
                    ratingNum.style.transition = 'all 0.5s ease';
                    ratingNum.style.opacity = '1';
                    ratingNum.style.transform = 'translateY(0)';
                }, 300);
            }
        }
        
        addStar(0);
    }
    
    // 6. Setup button event listeners WITH PROVIDER ID
    const providerId = window.profileData?.providerId;
    setupButtonListeners(isOwner, providerId);
    
    // 7. Initialize and animate
    initializeCounters();
    
    // Animation observer
    const dashboardSection = document.getElementById('profile-dashboard');
    if (dashboardSection) {
        let animated = false;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !animated) {
                    animated = true;
                    
                    // Stagger animations
                    setTimeout(() => animateProgress(), 300);
                    setTimeout(() => animateStars(), 800);
                    setTimeout(() => animateStats(), 1300);
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '0px 0px -50px 0px'
        });
        
        observer.observe(dashboardSection);
    }
    
    // 8. Add hover effects
    document.querySelectorAll('.stat-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            const icon = card.querySelector('.stat-icon');
            if (icon) {
                icon.style.transform = 'scale(1.15) rotate(5deg)';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            const icon = card.querySelector('.stat-icon');
            if (icon) {
                icon.style.transform = '';
            }
        });
    });
}

function setupButtonListeners(isOwner, providerId) {
    const subscribeBtn = document.getElementById('subscribeBtn');
    const rateBtn = document.getElementById('rateBtn');
    
    console.log('🔧 Setting up listeners:', {
        isOwner,
        providerId,
        subscribeBtnExists: !!subscribeBtn,
        rateBtnExists: !!rateBtn
    });
    
    // Enhanced subscribe functionality
    if (subscribeBtn && !isOwner) {
        subscribeBtn.addEventListener('click', async function() {
            console.log('🔔 SUBSCRIBE button clicked');
            console.log('📋 Provider ID:', providerId);
            
            if (!providerId) {
                console.error('❌ No provider ID available');
                alert('Error: No provider ID found');
                return;
            }
            
            // Show loading state
            subscribeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
            subscribeBtn.disabled = true;
            
            try {
                console.log('📤 Making request to subscribe_handler.php');
                
                const formData = new FormData();
                formData.append('providerId', providerId);
                
                const response = await fetch('subscribe_handler.php', {
                    method: 'POST',
                    body: formData,
                    credentials: 'same-origin'
                });
                
                console.log('📥 Response status:', response.status);
                
                const result = await response.json();
                console.log('✅ Parsed JSON:', result);
                
                if (result.success) {
                    // Create success modal
                    const subscribeModal = document.createElement('div');
                    subscribeModal.style.cssText = `
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0,0,0,0.7);
                        backdrop-filter: blur(5px);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        z-index: 10000;
                        animation: fadeIn 0.3s ease;
                    `;
                    
                    subscribeModal.innerHTML = `
                        <div style="
                            background: linear-gradient(135deg, #f8f9ff, #f1f4ff);
                            padding: 40px;
                            border-radius: 25px;
                            text-align: center;
                            max-width: 450px;
                            width: 90%;
                            box-shadow: 
                                0 20px 60px rgba(0,0,0,0.3),
                                0 10px 40px rgba(106, 17, 203, 0.3);
                            animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                            border: 2px solid rgba(106, 17, 203, 0.2);
                            position: relative;
                        ">
                            <div style="
                                font-size: 64px;
                                margin-bottom: 20px;
                                background: linear-gradient(90deg, #6a11cb, #2575fc);
                                -webkit-background-clip: text;
                                -webkit-text-fill-color: transparent;
                                background-clip: text;
                            ">✓</div>
                            <h3 style="
                                margin: 0 0 15px 0; 
                                color: #1a1a2e;
                                font-size: 24px;
                                font-weight: 800;
                            ">${result.message || 'Subscription Successful!'}</h3>
                            <p style="
                                color: #666; 
                                margin-bottom: 30px;
                                line-height: 1.6;
                                font-size: 16px;
                            ">
                                You have successfully subscribed to this service provider. 
                                You will now receive updates and can book their services directly.
                            </p>
                            <button onclick="this.closest('div').parentElement.remove()" style="
                                background: linear-gradient(90deg, #6a11cb, #2575fc);
                                color: white;
                                border: none;
                                padding: 15px 40px;
                                border-radius: 30px;
                                font-size: 16px;
                                font-weight: 700;
                                cursor: pointer;
                                transition: all 0.3s ease;
                                box-shadow: 0 10px 30px rgba(106, 17, 203, 0.3);
                                letter-spacing: 0.5px;
                            ">Got It!</button>
                        </div>
                    `;
                    
                    document.body.appendChild(subscribeModal);
                    
                    // Add modal animations
                    const style = document.createElement('style');
                    style.textContent = `
                        @keyframes fadeIn {
                            from { opacity: 0; }
                            to { opacity: 1; }
                        }
                        @keyframes slideUp {
                            from { 
                                opacity: 0;
                                transform: translateY(30px) scale(0.95);
                            }
                            to { 
                                opacity: 1;
                                transform: translateY(0) scale(1);
                            }
                        }
                    `;
                    document.head.appendChild(style);
                    
                } else {
                    alert(result.message || 'Subscription failed. Please try again.');
                }
                
            } catch (error) {
                console.error('❌ Network/Fetch error:', error);
                
                // Check if it's a CORS error
                if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                    alert('Network error. Please check:\n1. subscribe_handler.php exists\n2. Check browser console (F12)');
                } else {
                    alert('Error: ' + error.message);
                }
                
            } finally {
                // Reset button
                subscribeBtn.innerHTML = '<i class="fas fa-bell"></i> Hire Me';
                subscribeBtn.disabled = false;
            }
        });
    }
    
    // Rate me functionality
    if (rateBtn && !isOwner) {
        rateBtn.addEventListener('click', function() {
            console.log('⭐ RATE button clicked');
            console.log('📋 Provider ID:', providerId);
            
            if (!providerId) {
                console.error('❌ No provider ID available');
                alert('Error: No provider ID found');
                return;
            }
            
            // Create testimonial form modal
            const testimonialModal = document.createElement('div');
            testimonialModal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                backdrop-filter: blur(5px);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease;
            `;
            
            testimonialModal.innerHTML = `
                <div style="
                    background: white;
                    padding: 30px;
                    border-radius: 20px;
                    max-width: 500px;
                    width: 90%;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                ">
                    <h3 style="margin: 0 0 20px 0; color: #333;">Leave a Testimonial</h3>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; color: #666;">Your Rating:</label>
                        <div class="star-rating" style="display: flex; gap: 10px; font-size: 30px; margin-bottom: 20px;">
                            <span class="star" data-value="1" style="cursor: pointer; color: #e0e0e0;">★</span>
                            <span class="star" data-value="2" style="cursor: pointer; color: #e0e0e0;">★</span>
                            <span class="star" data-value="3" style="cursor: pointer; color: #e0e0e0;">★</span>
                            <span class="star" data-value="4" style="cursor: pointer; color: #e0e0e0;">★</span>
                            <span class="star" data-value="5" style="cursor: pointer; color: #e0e0e0;">★</span>
                        </div>
                        <input type="hidden" id="selectedRating" value="0">
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; color: #666;">Your Message:</label>
                        <textarea id="testimonialMessage" 
                                  style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 10px; 
                                         min-height: 120px; font-family: inherit;"
                                  placeholder="Share your experience..."></textarea>
                    </div>
                    
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button id="cancelTestimonial" style="
                            background: #f5f5f5;
                            color: #666;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 8px;
                            cursor: pointer;
                        ">Cancel</button>
                        <button id="submitTestimonial" style="
                            background: linear-gradient(90deg, #6a11cb, #2575fc);
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 8px;
                            cursor: pointer;
                        ">Submit Testimonial</button>
                    </div>
                    
                    <div id="testimonialStatus" style="margin-top: 15px; display: none;"></div>
                </div>
            `;
            
            document.body.appendChild(testimonialModal);
            
            // Add star rating functionality
            const stars = testimonialModal.querySelectorAll('.star');
            let selectedRating = 0;
            
            stars.forEach(star => {
                star.addEventListener('click', () => {
                    const value = parseInt(star.getAttribute('data-value'));
                    selectedRating = value;
                    
                    // Update stars display
                    stars.forEach((s, index) => {
                        s.style.color = index < value ? '#ffc107' : '#e0e0e0';
                    });
                    
                    // Update hidden input
                    testimonialModal.querySelector('#selectedRating').value = value;
                });
            });
            
            // Submit testimonial
            testimonialModal.querySelector('#submitTestimonial').addEventListener('click', async () => {
                const message = testimonialModal.querySelector('#testimonialMessage').value.trim();
                const submitBtn = testimonialModal.querySelector('#submitTestimonial');
                const statusDiv = testimonialModal.querySelector('#testimonialStatus');
                
                if (selectedRating === 0) {
                    statusDiv.innerHTML = '<p style="color: #f44336;">Please select a rating</p>';
                    statusDiv.style.display = 'block';
                    return;
                }
                
                if (message.length === 0) {
                    statusDiv.innerHTML = '<p style="color: #f44336;">Please enter a testimonial message</p>';
                    statusDiv.style.display = 'block';
                    return;
                }
                
                // Show loading
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
                submitBtn.disabled = true;
                statusDiv.style.display = 'none';
                
                try {
                    const formData = new FormData();
                    formData.append('providerId', providerId);
                    formData.append('message', message);
                    formData.append('rating', selectedRating);
                    
                    const response = await fetch('add_testimonial_handler.php', {
                        method: 'POST',
                        body: formData,
                        credentials: 'same-origin'
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        statusDiv.innerHTML = `<p style="color: #4CAF50;">${result.message}</p>`;
                        statusDiv.style.display = 'block';
                        
                        // Close modal after 2 seconds
                        setTimeout(() => {
                            testimonialModal.remove();
                            // Optionally refresh testimonials section
                            if (typeof loadTestimonials === 'function') {
                                console.log('🔄 Refreshing testimonials...');
                                setTimeout(() => loadTestimonials(), 500);
                            }
                        }, 2000);
                    } else {
                        statusDiv.innerHTML = `<p style="color: #f44336;">${result.message || 'Failed to submit testimonial'}</p>`;
                        statusDiv.style.display = 'block';
                        submitBtn.innerHTML = 'Submit Testimonial';
                        submitBtn.disabled = false;
                    }
                    
                } catch (error) {
                    console.error('❌ Network error:', error);
                    statusDiv.innerHTML = `<p style="color: #f44336;">Network error: ${error.message}</p>`;
                    statusDiv.style.display = 'block';
                    submitBtn.innerHTML = 'Submit Testimonial';
                    submitBtn.disabled = false;
                }
            });
            
            // Cancel button
            testimonialModal.querySelector('#cancelTestimonial').addEventListener('click', () => {
                testimonialModal.remove();
            });
        });
    }
}

// Debug functions
window.debugSubscribe = async function() {
    const providerId = window.profileData?.providerId;
    console.log('🔍 Debugging subscribe for provider:', providerId);
    
    const formData = new FormData();
    formData.append('providerId', providerId);
    
    try {
        console.log('📤 Making debug request...');
        const response = await fetch('subscribe_handler.php', {
            method: 'POST',
            body: formData
        });
        
        const text = await response.text();
        console.log('📥 Full response:', text);
        
        try {
            const json = JSON.parse(text);
            console.log('✅ Parsed JSON:', json);
        } catch (e) {
            console.error('❌ JSON parse failed:', e.message);
        }
        
    } catch (error) {
        console.error('❌ Fetch error:', error);
    }
};

window.debugTestimonial = async function() {
    const providerId = window.profileData?.providerId;
    console.log('🔍 Debugging testimonial for provider:', providerId);
    
    const formData = new FormData();
    formData.append('providerId', providerId);
    formData.append('message', 'Test testimonial message');
    formData.append('rating', 5);
    
    try {
        const response = await fetch('add_testimonial_handler.php', {
            method: 'POST',
            body: formData
        });
        
        const text = await response.text();
        console.log('📥 Testimonial response:', text);
        
    } catch (error) {
        console.error('❌ Testimonial fetch error:', error);
    }
};

// Add this to your HTML or call from console to debug
window.debugStats = function() {
    console.log('=== STATS DEBUG ===');
    console.log('window.profileData:', window.profileData);
    
    // Test API directly
    if (window.profileData?.providerId) {
        const providerId = window.profileData.providerId;
        
        // Test stats handler
        fetch(`stats_handler.php?action=getStats&providerId=${providerId}`)
            .then(r => r.text())
            .then(text => console.log('Stats handler response:', text.substring(0, 200)))
            .catch(e => console.log('Stats handler error:', e));
    }
};