// free_solutions/free_solutions.js

document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

async function initApp() {
    try {
        const userInfo = await getUserInfo();
        
        if (!userInfo) {
            window.location.href = '/htdocs/skillara/registration/login.html';
            return;
        }
        
        updateUserDisplay(userInfo);
        
        await Promise.all([
            loadPosts(),
            loadAdvertisements()
        ]);
        
        setupEventListeners();
        toggleAddAdButton(userInfo.can_add_ads);
        
    } catch (error) {
        console.error('Initialization error:', error);
        showMessage('error', 'Failed to load page. Please refresh.');
    }
}

/* -----------------------------
   USER & SESSION FUNCTIONS
----------------------------- */
async function getUserInfo() {
    try {
        const response = await fetch('free_solutions_handler.php?action=getUserInfo');
        const result = await response.json();
        
        if (result.success) {
            return result.user;
        } else {
            if (result.redirect) {
                window.location.href = result.redirect;
            }
            return null;
        }
    } catch (error) {
        console.error('Error getting user info:', error);
        return null;
    }
}

function updateUserDisplay(userInfo) {
    const usernameDisplay = document.getElementById('usernameDisplay');
    const userAvatar = document.getElementById('userAvatar');
    
    if (usernameDisplay) {
        usernameDisplay.textContent = userInfo.username;
    }
    
    if (userAvatar && userInfo.profile_picture) {
        userAvatar.src = userInfo.profile_picture;
        userAvatar.onerror = function() {
            this.src = '/skillara/images/default_avatar.jpg';
        };
    }
}

function toggleAddAdButton(canAddAds) {
    const addAdBtn = document.getElementById('addAdBtn');
    if (addAdBtn) {
        addAdBtn.style.display = canAddAds ? 'block' : 'none';
    }
}

/* -----------------------------
   POST FUNCTIONS
----------------------------- */
async function loadPosts() {
    try {
        const postsContainer = document.getElementById('postsContainer');
        postsContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading posts...</div>';
        
        const response = await fetch('free_solutions_handler.php?action=getAll');
        const result = await response.json();
        
        if (result.success) {
            renderPosts(result.data);
        } else {
            postsContainer.innerHTML = `<div class="error">${result.message}</div>`;
        }
    } catch (error) {
        console.error('Error loading posts:', error);
        document.getElementById('postsContainer').innerHTML = 
            '<div class="error">Failed to load posts. Please try again.</div>';
    }
}

function renderPosts(posts) {
    const postsContainer = document.getElementById('postsContainer');
    
    if (!posts || posts.length === 0) {
        postsContainer.innerHTML = '<div class="no-posts">No posts yet. Be the first to post!</div>';
        return;
    }
    
    postsContainer.innerHTML = '';
    
    posts.forEach(post => {
        const postElement = createPostElement(post);
        postsContainer.appendChild(postElement);
    });
}

function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';
    postDiv.dataset.postId = post.id_post;
    
    const postDate = new Date(post.post_date).toLocaleString();
    
    postDiv.innerHTML = `
        <div class="post-header">
            <img src="${post.author_avatar || '/skillara/images/default_avatar.jpg'}" 
                 class="profile-pic" 
                 onerror="this.src='/skillara/images/default_avatar.jpg'">
            <div class="post-user-info">
                <h3 class="username">${escapeHtml(post.post_author)}</h3>
                <small class="post-time">${postDate}</small>
            </div>
        </div>
        
        <div class="post-content">
            <p>${escapeHtml(post.post_content)}</p>
            ${post.post_image && post.post_image !== 'default_avatar.jpg' ? 
                `<img src="${post.post_image}" class="post-image" onerror="this.style.display='none'">` : ''}
        </div>
        
        <div class="comments-section">
            <div class="comments-header">
                <h4>Comments (<span class="commentCount">${post.comments ? post.comments.length : 0}</span>)</h4>
                <button class="toggleComments"><i class="fa-regular fa-comments"></i></button>
            </div>
            
            <div class="commentsList" style="display: none;">
                ${renderComments(post.comments)}
                
                <div class="add-comment">
                    <img id="currentUserAvatar" src="/skillara/images/default_avatar.jpg" class="comment-pic">
                    <input type="text" placeholder="Write a comment..." class="commentInput">
                    <button class="postComment" data-post-id="${post.id_post}">Post</button>
                </div>
            </div>
        </div>
    `;
    
    const toggleBtn = postDiv.querySelector('.toggleComments');
    const commentsList = postDiv.querySelector('.commentsList');
    const postCommentBtn = postDiv.querySelector('.postComment');
    const commentInput = postDiv.querySelector('.commentInput');
    const commentCountSpan = postDiv.querySelector('.commentCount');
    
    toggleBtn.addEventListener('click', () => {
        if (commentsList.style.display === 'none') {
            commentsList.style.display = 'block';
            toggleBtn.querySelector('i').classList.replace('fa-regular', 'fa-solid');
        } else {
            commentsList.style.display = 'none';
            toggleBtn.querySelector('i').classList.replace('fa-solid', 'fa-regular');
        }
    });
    
    postCommentBtn.addEventListener('click', () => {
        addCommentToPost(post.id_post, commentInput, commentCountSpan, commentsList);
    });
    
    commentInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addCommentToPost(post.id_post, commentInput, commentCountSpan, commentsList);
        }
    });
    
    return postDiv;
}

function renderComments(comments) {
    if (!comments || comments.length === 0) {
        return '<div class="no-comments">No comments yet.</div>';
    }
    
    let commentsHTML = '';
    comments.forEach(comment => {
        const commentDate = new Date(comment.date).toLocaleString();
        commentsHTML += `
            <div class="comment">
                <img src="${comment.avatar || '/skillara/images/default_avatar.jpg'}" 
                     class="comment-pic"
                     onerror="this.src='/skillara/images/default_avatar.jpg'">
                <div class="comment-content">
                    <p><strong>${escapeHtml(comment.author)}:</strong> ${escapeHtml(comment.text)}</p>
                    <small class="time">${commentDate}</small>
                </div>
            </div>
        `;
    });
    
    return commentsHTML;
}

async function addCommentToPost(postId, commentInput, commentCountSpan, commentsList) {
    const text = commentInput.value.trim();
    
    if (!text) return;
    
    try {
        const response = await fetch('free_solutions_handler.php?action=addComment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                post_id: postId,
                text: text
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            const newComment = document.createElement('div');
            newComment.className = 'comment';
            
            const userInfo = await getUserInfo();
            
            newComment.innerHTML = `
                <img src="${userInfo?.profile_picture || '/skillara/images/default_avatar.jpg'}" 
                     class="comment-pic"
                     onerror="this.src='/skillara/images/default_avatar.jpg'">
                <div class="comment-content">
                    <p><strong>${userInfo?.username || 'You'}:</strong> ${escapeHtml(text)}</p>
                    <small class="time">${new Date().toLocaleString()}</small>
                </div>
            `;
            
            const addCommentForm = commentsList.querySelector('.add-comment');
            commentsList.insertBefore(newComment, addCommentForm);
            
            const currentCount = parseInt(commentCountSpan.textContent) || 0;
            commentCountSpan.textContent = currentCount + 1;
            
            commentInput.value = '';
            
            showMessage('success', 'Comment added successfully');
        } else {
            showMessage('error', result.message);
        }
    } catch (error) {
        console.error('Error adding comment:', error);
        showMessage('error', 'Failed to add comment');
    }
}

/* -----------------------------
   CREATE NEW POST WITH IMAGE
----------------------------- */
async function createNewPost() {
    const postInput = document.getElementById('postInput');
    const postImage = document.getElementById('postImage');
    const text = postInput.value.trim();
    
    if (!text) {
        showMessage('error', 'Please enter some text for your post');
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('text', text);
        
        // Add image if selected
        if (postImage.files[0]) {
            formData.append('image', postImage.files[0]);
        }
        
        const response = await fetch('free_solutions_handler.php?action=addPost', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('success', 'Post created successfully');
            postInput.value = '';
            postImage.value = ''; // Clear file input
            await loadPosts();
        } else {
            showMessage('error', result.message);
        }
    } catch (error) {
        console.error('Error creating post:', error);
        showMessage('error', 'Failed to create post');
    }
}

/* -----------------------------
   ADVERTISEMENT FUNCTIONS
----------------------------- */
async function loadAdvertisements() {
    try {
        const adsContainer = document.getElementById('adsContainer');
        
        const response = await fetch('free_solutions_handler.php?action=getAds');
        const result = await response.json();
        
        if (result.success) {
            renderAdvertisements(result.data);
        } else {
            adsContainer.innerHTML = `<div class="error">${result.message}</div>`;
        }
    } catch (error) {
        console.error('Error loading ads:', error);
        document.getElementById('adsContainer').innerHTML = 
            '<div class="error">Failed to load advertisements</div>';
    }
}

function renderAdvertisements(ads) {
    const adsContainer = document.getElementById('adsContainer');
    
    if (!ads || ads.length === 0) {
        adsContainer.innerHTML = '<div class="no-ads">No advertisements available</div>';
        return;
    }
    
    adsContainer.innerHTML = '';
    
    ads.forEach(ad => {
        const adCard = document.createElement('div');
        adCard.className = 'ad-card';
        
        // FIXED: Don't escape the link URL, only escape the text content
        adCard.innerHTML = `
            ${ad.img ? `<img src="${ad.img}" alt="Advertisement" onerror="this.style.display='none'">` : ''}
            <p>${escapeHtml(ad.text)}</p>
            ${ad.link ? `<a href="${ad.link}" target="_blank" class="ad-link">Learn More</a>` : ''}
        `;
        
        adsContainer.appendChild(adCard);
    });
}

/* -----------------------------
   SEARCH FUNCTIONALITY
----------------------------- */
async function searchPosts(keyword) {
    if (!keyword.trim()) {
        await loadPosts();
        return;
    }
    
    try {
        const response = await fetch(`free_solutions_handler.php?action=search&keyword=${encodeURIComponent(keyword)}`);
        const result = await response.json();
        
        if (result.success) {
            renderPosts(result.data);
        } else {
            showMessage('error', result.message);
        }
    } catch (error) {
        console.error('Search error:', error);
        showMessage('error', 'Search failed');
    }
}

/* -----------------------------
   ADD ADVERTISEMENT MODAL
----------------------------- */
function setupAdvertisementModal() {
    const addAdBtn = document.getElementById('addAdBtn');
    const addAdModal = document.getElementById('addAdModal');
    const closeModalBtn = addAdModal.querySelector('.close-modal');
    const addAdForm = document.getElementById('addAdForm');
    
    if (!addAdBtn || !addAdModal) return;
    
    addAdBtn.addEventListener('click', () => {
        addAdModal.style.display = 'block';
    });
    
    closeModalBtn.addEventListener('click', () => {
        addAdModal.style.display = 'none';
        addAdForm.reset();
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === addAdModal) {
            addAdModal.style.display = 'none';
            addAdForm.reset();
        }
    });
    
    addAdForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(addAdForm);
        
        try {
            const response = await fetch('free_solutions_handler.php?action=addAd', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                showMessage('success', 'Advertisement added successfully');
                addAdModal.style.display = 'none';
                addAdForm.reset();
                await loadAdvertisements();
            } else {
                showMessage('error', result.message);
            }
        } catch (error) {
            console.error('Error adding advertisement:', error);
            showMessage('error', 'Failed to add advertisement');
        }
    });
}

/* -----------------------------
   EVENT LISTENERS SETUP
----------------------------- */
function setupEventListeners() {
    const postBtn = document.getElementById('postBtn');
    if (postBtn) {
        postBtn.addEventListener('click', createNewPost);
    }
    
    const postInput = document.getElementById('postInput');
    if (postInput) {
        postInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                createNewPost();
            }
        });
    }
    
    // Setup click handler for the image upload button
    const imageUploadLabel = document.querySelector('label[for="postImage"]');
    if (imageUploadLabel) {
        imageUploadLabel.addEventListener('click', function(e) {
            // Prevent the default label behavior if needed
            e.preventDefault();
            // Trigger the hidden file input
            document.getElementById('postImage').click();
        });
    }
    
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    
    if (searchForm && searchInput) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            searchPosts(searchInput.value.trim());
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchPosts(searchInput.value.trim());
            }
        });
    }
    
    setupAdvertisementModal();
}

/* -----------------------------
   UTILITY FUNCTIONS
----------------------------- */
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function showMessage(type, text) {
    const existingMsg = document.querySelector('.message');
    if (existingMsg) {
        existingMsg.remove();
    }
    
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${text}</span>
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        if (message.parentNode) {
            message.remove();
        }
    }, 5000);
    
    message.addEventListener('click', () => {
        message.remove();
    });
}

// Add CSS for messages
if (!document.querySelector('#message-styles')) {
    const style = document.createElement('style');
    style.id = 'message-styles';
    style.textContent = `
        .message {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease;
            cursor: pointer;
        }
        
        .message.success {
            background-color: #4CAF50;
        }
        
        .message.error {
            background-color: #f44336;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .loading, .no-posts, .error, .no-ads, .no-comments {
            text-align: center;
            padding: 40px;
            color: #666;
            font-size: 16px;
        }
        
        .loading i {
            margin-right: 10px;
        }
    `;
    document.head.appendChild(style);
}