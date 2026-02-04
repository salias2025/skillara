// Work To-Do List Application

// ============================================
// 1. INITIALIZATION
// ============================================
let currentFilter = "all";

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadWorkItems();
    setupEventListeners();
    setDefaultDates();
});

// Setup all event listeners
function setupEventListeners() {
    // Filter dropdown items
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            handleFilterClick(this);
        });
    });
    
    // Form submission
    const form = document.querySelector('form');
    const submitBtn = document.querySelector('.btn-submit');
    
    // Handle button click
    submitBtn.addEventListener('click', function(e) {
        e.preventDefault();
        addWorkItem();
    });
    
    // Handle form submit
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        addWorkItem();
    });
    
    // Close modal when clicking outside
    const modalOverlay = document.querySelector('.modal-overlay');
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            document.getElementById('modal-toggle').checked = false;
        }
    });
}

// Set default dates in form
function setDefaultDates() {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];
    
    // Set default dates in the form
    const dateInputs = document.querySelectorAll('.form-input[type="date"]');
    if (dateInputs.length >= 2) {
        dateInputs[0].value = today;      // Added date
        dateInputs[1].value = nextWeekStr; // Due date
    }
}

// Handle filter selection
function handleFilterClick(item) {
    const filterText = item.textContent.trim();
    const filterBtn = document.querySelector('.filter-btn');
    filterBtn.textContent = filterText;
    
    // Close dropdown
    document.getElementById('dropdown-toggle').checked = false;
    
    // Map filter text to filter value
    const filterMap = {
        "All Items": "all",
        "Pending": "pending",
        "In Progress": "in-progress",
        "Completed": "completed"
    };
    
    currentFilter = filterMap[filterText] || "all";
    loadWorkItems();
}

// ============================================
// 2. API FUNCTIONS
// ============================================

// Load work items from PHP backend
async function loadWorkItems() {
    const workList = document.querySelector('.work-list');
    
    // Show loading state
    workList.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #718096; background: white; border-radius: 12px;">
            <p style="font-size: 16px; margin-bottom: 8px;">Loading work items...</p>
            <p style="font-size: 14px;">Please wait</p>
        </div>
    `;
    
    try {
        const response = await fetch(`todo_handler.php?action=get_work&status=${currentFilter}`);
        const result = await response.json();
        
        if (result.success) {
            renderWorkItems(result.data);
        } else {
            throw new Error(result.message || 'Failed to load work items');
        }
    } catch (error) {
        console.error('Error loading work items:', error);
        showError('Failed to load work items. Please try again.');
    }
}

// Add new work item via PHP backend
async function addWorkItem() {
    // FIX: Check if we're in the profile edit popup context
    const profilePopup = document.getElementById('edit-popup');
    if (profilePopup && profilePopup.style.display === 'flex') {
        return; // Don't run todo validation when profile modal is open
    }
    
    // Get form values using your existing HTML structure
    const clientName = document.querySelector('.form-input[placeholder="John Doe"]').value.trim();
    const description = document.querySelector('.form-textarea').value.trim();
    const addedDate = document.querySelectorAll('.form-input[type="date"]')[0].value;
    const dueDate = document.querySelectorAll('.form-input[type="date"]')[1].value;
    const status = document.querySelector('.form-select').value;
    
    // Validation
    if (!clientName) {
        showError('Please enter a client name!');
        return;
    }
    
    if (!addedDate) {
        showError('Please enter an added date!');
        return;
    }
    
    if (!dueDate) {
        showError('Please enter a due date!');
        return;
    }
    
    // Check date logic
    if (new Date(dueDate) < new Date(addedDate)) {
        showError('Due date must be after added date!');
        return;
    }
    
    // Show loading state on button
    const submitBtn = document.querySelector('.btn-submit');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Adding...';
    submitBtn.disabled = true;
    
    try {
        // Create FormData for PHP
        const formData = new FormData();
        formData.append('action', 'add_work');
        formData.append('client_name', clientName);
        formData.append('description', description);
        formData.append('added_date', addedDate);
        formData.append('due_date', dueDate);
        formData.append('status', status);
        
        // Send to PHP
        const response = await fetch('todo_handler.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Success
            showSuccess('Work item added successfully!');
            
            // Reset form and close modal
            document.querySelector('form').reset();
            document.getElementById('modal-toggle').checked = false;
            setDefaultDates();
            
            // Reload work items
            await loadWorkItems();
        } else {
            throw new Error(result.message || 'Failed to add work item');
        }
        
    } catch (error) {
        console.error('Error adding work item:', error);
        showError('Failed to add work item: ' + error.message);
    } finally {
        // Restore button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Update work status via PHP backend
async function updateWorkStatus(workId, newStatus) {
    if (!confirm('Are you sure you want to update this work item?')) {
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('action', 'update_status');
        formData.append('work_id', workId);
        formData.append('status', newStatus);
        
        const response = await fetch('todo_handler.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess('Work item updated successfully!');
            await loadWorkItems();
        } else {
            throw new Error(result.message || 'Failed to update status');
        }
        
    } catch (error) {
        console.error('Error updating status:', error);
        showError('Failed to update status: ' + error.message);
    }
}

// Delete work item via PHP backend
async function deleteWorkItem(workId) {
    if (!confirm('Are you sure you want to delete this work item?')) {
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('action', 'delete_work');
        formData.append('work_id', workId);
        
        const response = await fetch('todo_handler.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess('Work item deleted successfully!');
            await loadWorkItems();
        } else {
            throw new Error(result.message || 'Failed to delete work item');
        }
        
    } catch (error) {
        console.error('Error deleting work item:', error);
        showError('Failed to delete work item: ' + error.message);
    }
}

// ============================================
// 3. UI RENDERING FUNCTIONS
// ============================================

// Render work items to the DOM
function renderWorkItems(workItems) {
    const workList = document.querySelector('.work-list');
    
    if (!workItems || workItems.length === 0) {
        workList.innerHTML = `
            <div style="text-align: center; padding: 60px; color: #718096; background: white; border-radius: 12px;">
                <div style="font-size: 48px; margin-bottom: 20px; opacity: 0.5;">📝</div>
                <div style="font-size: 18px; font-weight: 500; margin-bottom: 8px; color: #4a5568;">No work items found</div>
                <div style="font-size: 14px; margin-bottom: 24px;">Add a new work item to get started!</div>
                <label for="modal-toggle" class="add-btn" style="display: inline-flex;">
                    + Add Your First Work Item
                </label>
            </div>
        `;
        return;
    }
    
    workList.innerHTML = workItems.map(item => {
        const statusSlug = getStatusSlug(item.status);
        const statusText = getStatusText(item.status);
        
        return `
            <div class="work-item" data-status="${statusSlug}" data-id="${item.id_work}">
                <div class="work-item-header">
                    <div class="work-info">
                        <div class="work-top">
                            <div>
                                <div class="client-name">${escapeHtml(item.client_name)}</div>
                            </div>
                            <span class="status-badge ${statusSlug}">${statusText}</span>
                        </div>
                        <div class="description">${escapeHtml(item.description) || 'No description provided'}</div>
                        <div class="work-meta">
                            <span>Added ${item.added_date}</span>
                            <span>•</span>
                            <span>Due ${item.due_date}</span>
                        </div>
                    </div>
                </div>
                <div class="work-actions">
                    ${item.status !== 'Completed' ? 
                        `<button class="btn-to-do-list btn-complete-to-do-list" onclick="updateWorkStatus(${item.id_work}, 'completed')">Mark Complete</button>` :
                        `<button class="btn-to-do-list btn-complete-to-do-list" style="opacity: 0.5; cursor: not-allowed;" disabled>Completed</button>`
                    }
                    <button class="btn-to-do-list btn-delete-to-do-list" onclick="deleteWorkItem(${item.id_work})">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// 4. HELPER FUNCTIONS
// ============================================

// Get CSS class for status
function getStatusSlug(status) {
    const statusMap = {
        'Pending': 'pending',
        'In Progress': 'in-progress',
        'Completed': 'completed'
    };
    return statusMap[status] || 'pending';
}

// Get display text for status
function getStatusText(status) {
    return status;
}

// Show error message
function showError(message) {
    alert('Error: ' + message);
}

// Show success message
function showSuccess(message) {
    alert('Success: ' + message);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// 5. GLOBAL FUNCTIONS (for onclick attributes)
// ============================================

// Make functions available globally for onclick attributes
window.updateWorkStatus = updateWorkStatus;
window.deleteWorkItem = deleteWorkItem;