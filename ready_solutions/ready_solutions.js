// DOM Elements
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.querySelector('.mobile-menu');
const searchInput = document.querySelector('form input');
const addSolutionBtn = document.getElementById('addSolutionBtn');
const addSolutionModal = document.getElementById('addSolutionModal');
const closeModalBtn = document.querySelector('.close-modal');
const cancelBtn = document.querySelector('.cancel-btn');
const solutionForm = document.getElementById('solutionForm');
const solutionsGrid = document.getElementById('solutionsGrid');
const loadingSpinner = document.getElementById('loadingSpinner');

// API URL
const API_URL = 'ready_solutions_handler.php?action=getAll';

// ==================== SIMPLE FUNCTIONS ====================

// Show/hide loading
function showLoading() {
    if (loadingSpinner) loadingSpinner.style.display = 'flex';
}

function hideLoading() {
    if (loadingSpinner) loadingSpinner.style.display = 'none';
}

// Check if user is provider (simple)
function checkUser() {
    return true; // Change later to check session
}

// Open/close modal
function openModal() {
    if (!checkUser()) {
        alert('Only providers can add solutions');
        return;
    }
    if (addSolutionModal) addSolutionModal.style.display = 'flex';
}

function closeModal() {
    if (addSolutionModal) addSolutionModal.style.display = 'none';
    if (solutionForm) solutionForm.reset();
}

// ==================== LOAD SOLUTIONS ====================

async function loadSolutions() {
    showLoading();
    
    try {
        const response = await fetch(API_URL);
        const result = await response.json();
        
        if (result.success && result.data) {
            showSolutions(result.data);
        } else {
            showNoSolutions();
        }
    } catch (error) {
        console.error('Error:', error);
        showNoSolutions();
    } finally {
        hideLoading();
    }
}

function showSolutions(solutions) {
    if (!solutionsGrid) return;
    
    if (solutions.length === 0) {
        showNoSolutions();
        return;
    }
    
    let html = '';
    solutions.forEach(sol => {
        html += `
            <section class="card">
                <img src="${sol.img || '/skillara/images/default.jpg'}" class="card-image"
                     onerror="this.src='/skillara/images/default.jpg'">
                <div class="card-content">
                    <h4>${sol.title || 'No title'}</h4>
                    <p>${(sol.description || 'No description').substring(0, 100)}...</p>
                    <p class="publisher">By: ${sol.publisher_username || 'Unknown'}</p>
                    <button class="card-btn" onclick="window.open('${sol.link || '#'}', '_blank')">
                        View <i class="fas fa-external-link-alt"></i>
                    </button>
                </div>
            </section>
        `;
    });
    
    solutionsGrid.innerHTML = html;
}

function showNoSolutions() {
    if (!solutionsGrid) return;
    solutionsGrid.innerHTML = '<p style="text-align:center; padding:40px;">No solutions found.</p>';
}

// ==================== SEARCH ====================

function handleSearch(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        const query = searchInput.value.toLowerCase();
        
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            const title = card.querySelector('h4').textContent.toLowerCase();
            const desc = card.querySelector('p').textContent.toLowerCase();
            
            if (title.includes(query) || desc.includes(query)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
}

// ==================== FORM SUBMIT ====================

async function handleSubmit(e) {
    e.preventDefault();
    
    if (!checkUser()) {
        alert('Only providers can add solutions');
        return;
    }
    
    // Get form data
    const formData = new FormData(solutionForm);
    
    // Validate
    const title = formData.get('title')?.trim();
    const description = formData.get('description')?.trim();
    const imageFile = solutionForm.querySelector('#solutionImage').files[0];
    
    if (!title || !description) {
        alert('Title and description are required');
        return;
    }
    
    if (!imageFile) {
        alert('Please select an image');
        return;
    }
    
    // Disable submit button
    const submitBtn = solutionForm.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
    submitBtn.disabled = true;
    
    try {
        // Send to backend
        const response = await fetch('ready_solutions_handler.php?action=add', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Solution added successfully!');
            closeModal();
            loadSolutions();
        } else {
            alert('Error: ' + (result.message || 'Failed to add solution'));
        }
    } catch (error) {
        console.error('Submit error:', error);
        alert('Network error. Please try again.');
    } finally {
        // Re-enable button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// ==================== SETUP ====================

function setupEvents() {
    // Mobile menu
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileMenu.classList.toggle('active');
        });
        
        document.addEventListener('click', (e) => {
            if (!mobileMenu.contains(e.target) && e.target !== menuToggle) {
                mobileMenu.classList.remove('active');
            }
        });
    }
    
    // Search
    if (searchInput) {
        searchInput.addEventListener('keypress', handleSearch);
    }
    
    // Modal buttons
    if (addSolutionBtn) addSolutionBtn.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    
    // Close modal on outside click
    if (addSolutionModal) {
        addSolutionModal.addEventListener('click', (e) => {
            if (e.target === addSolutionModal) closeModal();
        });
    }
    
    // Form
    if (solutionForm) {
        solutionForm.addEventListener('submit', handleSubmit);
    }
    
    // Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && addSolutionModal.style.display === 'flex') {
            closeModal();
        }
    });
}

// ==================== START ====================

function init() {
    setupEvents();
    
    // Show/hide add button
    if (addSolutionBtn) {
        addSolutionBtn.style.display = checkUser() ? 'block' : 'none';
    }
    
    loadSolutions();
}

// Run when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}