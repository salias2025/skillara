
function updateCommentCount() {
    const count = document.querySelectorAll('#commentsList .comment').length;
    document.getElementById('commentCount').innerText = count;
}

/* -----------------------------
   إضافة تعليق جديد
----------------------------- */
function addComment() {
    const input = document.getElementById('commentInput');
    const text = input.value.trim();

    if (text === "") return;

    const commentsList = document.getElementById('commentsList');

    const newComment = document.createElement('div');
    newComment.className = 'comment';

    newComment.innerHTML = `
        <img src="images/img1.jpg" class="comment-pic" />
        <div class="comment-content">
            <p><strong>You:</strong> ${text}</p>
            <small class="time">${new Date().toLocaleString()}</small>
        </div>
    `;

    commentsList.appendChild(newComment);
    input.value = '';
    updateCommentCount();
}

/* -----------------------------
   إظهار/إخفاء التعليقات
----------------------------- */
function toggleComments() {
    const commentsList = document.getElementById('commentsList');
    const btn = document.getElementById('toggleComments');
    const icon = btn.querySelector('i'); // نحصل على الأيقونة داخل الزر

    if (!commentsList.style.display || commentsList.style.display === 'none') {
        // إظهار التعليقات
        commentsList.style.display = 'block';
        btn.classList.add('active');
        icon.classList.remove('fa-regular', 'fa-light'); // إزالة أي نوع سابق
        icon.classList.add('fa-solid'); // أيقونة صلبة عند التفعيل
    } else {
        // إخفاء التعليقات
        commentsList.style.display = 'none';
        btn.classList.remove('active');
        icon.classList.remove('fa-solid'); 
        icon.classList.add('fa-regular'); // أيقونة عادية عند الإخفاء
    }
}


document.addEventListener("DOMContentLoaded", function() {
    const searchInput = document.getElementById('searchInput');

    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault(); // منع السلوك الافتراضي للإنتر
            const filter = searchInput.value.toLowerCase().trim();
            const posts = document.querySelectorAll('.post'); // كل البوستات حتى الجديدة

            posts.forEach(post => {
                const contentEl = post.querySelector('.post-content p');
                const content = contentEl ? contentEl.innerText.toLowerCase() : "";

                post.style.display = (filter === "" || content.includes(filter)) ? "block" : "none";
            });
        }
    });
});



document.addEventListener("DOMContentLoaded", () => {
    const postInput = document.querySelector(".post-input-container textarea");
    const postsContainer = document.getElementById("postsContainer");

    postInput.addEventListener("keydown", function(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            const text = postInput.value.trim();
            if (text !== "") {
                createPost(text);
                postInput.value = "";
            }
        }
    });

    function createPost(text) {
        const post = document.createElement("div");
        post.className = "post";
        post.innerHTML = `
            <div class="post-header">
                <img src="images/img1.jpg" class="profile-pic">
                <div class="post-user-info">
                    <h3>normal user</h3>
                </div>
            </div>
            <div class="post-content">
                <p>${escapeHtml(text)}</p>
            </div>
            <div class="comments-section">
                <div class="comments-header">
                    <h4>Comments (<span class="commentCount">0</span>)</h4>
                    <button class="toggleComments"><i class="fa-regular fa-comments"></i></button>
                </div>
                <div class="commentsList" style="display:none;">
                    <div class="add-comment">
                        <img src="images/img1.jpg" class="comment-pic">
                        <input type="text" placeholder="Write a comment..." class="commentInput">
                        <button class="postComment">Post</button>
                    </div>
                </div>
            </div>
        `;
        postsContainer.prepend(post);

        const toggleBtn = post.querySelector(".toggleComments");
        const commentsList = post.querySelector(".commentsList");
        const commentInput = post.querySelector(".commentInput");
        const postCommentBtn = post.querySelector(".postComment");
        const commentCountSpan = post.querySelector(".commentCount");

        toggleBtn.addEventListener("click", () => {
            if (commentsList.style.display === "none") {
                commentsList.style.display = "block";
                toggleBtn.querySelector("i").classList.replace("fa-regular", "fa-solid");
            } else {
                commentsList.style.display = "none";
                toggleBtn.querySelector("i").classList.replace("fa-solid", "fa-regular");
            }
        });

        postCommentBtn.addEventListener("click", () => {
            const text = commentInput.value.trim();
            if (!text) return;
            const comment = document.createElement("div");
            comment.className = "comment";
            comment.innerHTML = `
                <img src="images/img1.jpg" class="comment-pic">
                <div class="comment-content">
                    <p><strong>You:</strong> ${escapeHtml(text)}</p>
                    <small class="time">${new Date().toLocaleString()}</small>
                </div>
            `;
            commentsList.appendChild(comment);
            commentInput.value = "";
            commentCountSpan.innerText = commentsList.querySelectorAll(".comment").length;
        });
    }

    function escapeHtml(str) {
        return str.replace(/[&<>"'`=\/]/g, function(s) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
                '/': '&#x2F;',
                '`': '&#x60;',
                '=': '&#x3D;'
            }[s];
        });
    }
});
