// skillara/profile_service_provider/testimonials.js

let swiperInstance;

// 1. Load testimonials from database
async function loadTestimonials() {
    try {
        console.log('🚀 Starting testimonials load...');
        
        // Get provider ID from profile.js (set globally)
        const providerId = window.profileData?.providerId;
        
        if (!providerId) {
            console.error('❌ No provider ID found in testimonials.js');
            console.log('Debug: window.profileData =', window.profileData);
            return;
        }
        
        console.log(`🔍 Loading testimonials for provider: ${providerId}`);
        
        // Call your API handler
        const response = await fetch(`testimonials_handler.php?action=getTestimonials&providerId=${providerId}`);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('📊 API response:', result);
        
        if (result.success) {
            console.log(`✅ Loaded ${result.testimonials.length} testimonials from database`);
            renderTestimonials(result.testimonials);
        } else {
            console.error('❌ API returned error:', result.message);
            showNoTestimonials();
        }
        
    } catch (error) {
        console.error('❌ Error loading testimonials:', error);
        showNoTestimonials();
    }
}

// 2. Render testimonials
function renderTestimonials(testimonials) {
    const wrapper = document.querySelector('.testimonials-swiper .swiper-wrapper');
    
    if (!wrapper) {
        console.error('❌ Swiper wrapper not found');
        return;
    }
    
    wrapper.innerHTML = '';
    
    // If no testimonials in database
    if (testimonials.length === 0) {
        showNoTestimonials();
        return;
    }
    
    // Render real testimonials from database
    testimonials.forEach((testimonial) => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        
        // Create stars HTML
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            starsHtml += i <= testimonial.rating ? '★' : '☆';
        }
        
        slide.innerHTML = `
            <div class="testimonial-bubble">
                <div class="testimonial-header">
                    <img src="${testimonial.image}" 
                         alt="${testimonial.name}" 
                         class="testimonial-avatar"
                         onerror="this.src='/skillara/uploads/profile/default_avatar.jpg'">
                    <div class="testimonial-client-info">
                        <h4 class="testimonial-client-name">${testimonial.name}</h4>
                    </div>
                </div>
                <p class="testimonial-text">"${testimonial.text}"</p>
                <div class="testimonial-rating">${starsHtml}</div>
            </div>
        `;
        
        wrapper.appendChild(slide);
    });
    
    // Initialize or update Swiper
    initializeSwiper(testimonials.length > 1);
}

// 3. Show "no testimonials" message
function showNoTestimonials() {
    const wrapper = document.querySelector('.testimonials-swiper .swiper-wrapper');
    if (!wrapper) return;
    
    wrapper.innerHTML = `
        <div class="swiper-slide">
            <div class="testimonial-bubble">
                <div class="no-testimonials">
                    <i class="fas fa-comment-alt"></i>
                    <p>No testimonials yet</p>
                    <small>Be the first to leave a review!</small>
                </div>
            </div>
        </div>
    `;
    
    initializeSwiper(false);
}

// 4. Initialize Swiper
function initializeSwiper(loopEnabled) {
    const swiperElement = document.querySelector('.testimonials-swiper');
    if (!swiperElement) return;
    
    if (!swiperInstance) {
        swiperInstance = new Swiper('.testimonials-swiper', {
            slidesPerView: 3,
            spaceBetween: 20,
            loop: loopEnabled,
            pagination: {
                el: '.swiper-pagination',
                clickable: true
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev'
            },
            breakpoints: {
                1024: { slidesPerView: 3 },
                768: { slidesPerView: 2 },
                480: { slidesPerView: 1 }
            }
        });
        
        console.log('✅ Swiper initialized');
    } else {
        swiperInstance.update();
        console.log('✅ Swiper updated');
    }
}

// 5. Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 Testimonials.js DOM loaded');
    
    // Wait for profile.js to set window.profileData
    setTimeout(() => {
        console.log('⏳ Checking window.profileData:', window.profileData);
        loadTestimonials();
    }, 1000);
});

// For debugging
window.debugTestimonials = function() {
    console.log('=== TESTIMONIALS DEBUG ===');
    console.log('window.profileData:', window.profileData);
    console.log('Provider ID:', window.profileData?.providerId);
    
    // Test API directly
    fetch('testimonials_handler.php?action=getTestimonials&providerId=1')
        .then(r => r.json())
        .then(d => console.log('Direct API test:', d));
};