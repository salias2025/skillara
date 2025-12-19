// Work To-Do List Application (In-Memory Version)

// Default sample data
let workItems = [
    {
        id: 1,
        clientName: "John Smith",
        description: "Fix leaking kitchen faucet and check water pressure",
        addedDate: "10/15/2025",
        dueDate: "10/22/2025",
        status: "in-progress"
    },
    {
        id: 2,
        clientName: "Emily Davis",
        description: "Replace bathroom fixtures and repair shower drain",
        addedDate: "10/18/2025",
        dueDate: "10/25/2025",
        status: "pending"
    }
];

let nextId = Math.max(...workItems.map(item => item.id)) + 1;
let currentFilter = "all";

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    renderWorkItems();
    setupEventListeners();
});

// Setup all event listeners
function setupEventListeners() {
    // Filter dropdown items
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const filterText = this.textContent.trim();
            const filterBtn = document.querySelector('.filter-btn');
            filterBtn.textContent = filterText;
            
            // Close dropdown
            document.getElementById('dropdown-toggle').checked = false;
            
            // Apply filter
            if (filterText === "All Items") currentFilter = "all";
            else if (filterText === "Pending") currentFilter = "pending";
            else if (filterText === "In Progress") currentFilter = "in-progress";
            else if (filterText === "Completed") currentFilter = "completed";
            
            renderWorkItems();
        });
    });
    
    // Form submission - SPECIFICALLY target the to-do list modal form
    const todoForm = document.querySelector('.modal-overlay form');
    const submitBtn = document.querySelector('.btn-submit');
    
    if (todoForm) {
        todoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addWorkItem();
        });
    }
    
    if (submitBtn) {
        submitBtn.addEventListener('click', function(e) {
            e.preventDefault();
            addWorkItem();
        });
    }
    
    // Close modal when clicking outside
    const modalOverlay = document.querySelector('.modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                document.getElementById('modal-toggle').checked = false;
            }
        });
    }
}

// Validate date
function isValidDate(dateString) {
    if (!dateString) return false;
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;

    const parts = dateString.split('-');
    if (parts.length !== 3) return false;

    const inputYear = parseInt(parts[0]);
    const inputMonth = parseInt(parts[1]);
    const inputDay = parseInt(parts[2]);

    if (date.getFullYear() !== inputYear || 
        date.getMonth() + 1 !== inputMonth || 
        date.getDate() !== inputDay) {
        return false;
    }
    
    return true;
}

// Add new work item
function addWorkItem() {
    const todoForm = document.querySelector('.modal-overlay form');
    if (!todoForm) return;
    
    const clientName = todoForm.querySelector('.form-input[placeholder="John Doe"]')?.value.trim();
    const description = todoForm.querySelector('.form-textarea')?.value.trim();
    const addedDate = todoForm.querySelectorAll('.form-input[type="date"]')[0]?.value;
    const dueDate = todoForm.querySelectorAll('.form-input[type="date"]')[1]?.value;
    const status = todoForm.querySelector('.form-select')?.value;

    if (!clientName) {
        alert('Please enter a client name!');
        return;
    }
    if (!addedDate) {
        alert('Please enter an added date!');
        return;
    }
    if (!dueDate) {
        alert('Please enter a due date!');
        return;
    }
    if (!isValidDate(addedDate)) {
        alert('Invalid added date!');
        return;
    }
    if (!isValidDate(dueDate)) {
        alert('Invalid due date!');
        return;
    }

    const addedDateObj = new Date(addedDate);
    const dueDateObj = new Date(dueDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    addedDateObj.setHours(0,0,0,0);
    dueDateObj.setHours(0,0,0,0);

    if (addedDateObj > today) {
        alert('Added date cannot be in the future!');
        return;
    }
    if (dueDateObj < addedDateObj) {
        alert('Due date cannot be before added date!');
        return;
    }

    const newItem = {
        id: nextId++,
        clientName,
        description,
        addedDate: formatDate(addedDate),
        dueDate: formatDate(dueDate),
        status
    };

    workItems.push(newItem);
    renderWorkItems();
    todoForm.reset();
    document.getElementById('modal-toggle').checked = false;
    alert('Work item added successfully!');
}

// Format date from YYYY-MM-DD to MM/DD/YYYY
function formatDate(dateString) {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}

// Delete work item
function deleteWorkItem(id) {
    if (confirm('Are you sure you want to delete this work item?')) {
        workItems = workItems.filter(item => item.id !== id);
        renderWorkItems();
    }
}

// Mark work item as complete
function completeWorkItem(id) {
    const item = workItems.find(item => item.id === id);
    if (item) {
        item.status = "completed";
        renderWorkItems();
    }
}

// Get status badge HTML
function getStatusBadge(status) {
    const statusText = status === "in-progress" ? "In Progress" : 
                       status === "pending" ? "Pending" : "Completed";
    return `<span class="status-badge ${status}">${statusText}</span>`;
}

// Render all work items
function renderWorkItems() {
    const workList = document.querySelector('.work-list');
    if (!workList) return;
    
    let filteredItems = currentFilter === "all" ? workItems : workItems.filter(item => item.status === currentFilter);
    
    if (filteredItems.length === 0) {
        workList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #718096; background: white; border-radius: 12px;">
                <p style="font-size: 16px; margin-bottom: 8px;">No work items found</p>
                <p style="font-size: 14px;">Add a new work item to get started!</p>
            </div>
        `;
        return;
    }
    
    workList.innerHTML = filteredItems.map(item => `
        <div class="work-item" data-status="${item.status}">
            <div class="work-item-header">
                <div class="work-info">
                    <div class="work-top">
                        <div class="client-name">${item.clientName}</div>
                        ${getStatusBadge(item.status)}
                    </div>
                    <div class="description">${item.description || 'No description provided'}</div>
                    <div class="work-meta">
                        <span>Added ${item.addedDate}</span> • <span>Due ${item.dueDate}</span>
                    </div>
                </div>
            </div>
            <div class="work-actions">
                ${item.status !== "completed" ? 
                    `<button class="btn-to-do-list btn-complete-to-do-list" onclick="completeWorkItem(${item.id})">Mark Complete</button>` :
                    `<button class="btn-to-do-list btn-complete-to-do-list" disabled>Completed</button>`}
                <button class="btn-to-do-list btn-delete-to-do-list" onclick="deleteWorkItem(${item.id})">Delete</button>
            </div>
        </div>
    `).join('');
}