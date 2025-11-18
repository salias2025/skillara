document.addEventListener('DOMContentLoaded', () => {
    const servicesContainer = document.querySelector('.services-container');
    const addServiceBtn = document.querySelector('.add-service-btn');

    let isOwner = true; // owner flag

    let services = [
        { icon: "fa-laptop-code", title: "Web Design", description: "Modern, responsive websites." },
        { icon: "fa-paint-brush", title: "Graphic Design", description: "Logos, banners, marketing content." },
        { icon: "fa-search", title: "SEO Optimization", description: "Improve website ranking on search engines." },
        { icon: "fa-mug-saucer", title: "Coffee", description: "Just coffee." },
        { icon: "fa-robot", title: "AI Generative", description: "Everything related to ML." }
    ];

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
    window.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });

    // --- Render services ---
    function renderServices() {
        servicesContainer.innerHTML = '';
        services.forEach((service, index) => {
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
                card.addEventListener('dblclick', () => {
                    card.innerHTML = `
                        <input type="text" class="service-input service-input-title" value="${service.title}">
                        <input type="text" class="service-input service-input-icon" value="${service.icon}">
                        <textarea class="service-input service-input-desc">${service.description}</textarea>
                        <div style="margin-top:10px; display:flex; gap:10px;">
                            <button class="save-service-btn">Save</button>
                            <button class="cancel-service-btn">Cancel</button>
                        </div>
                    `;

                    // Cancel restores original content
                    card.querySelector('.cancel-service-btn').addEventListener('click', () => renderServices());

                    // Save updates service
                    card.querySelector('.save-service-btn').addEventListener('click', () => {
                        const newTitle = card.querySelector('.service-input-title').value.trim();
                        const newDesc = card.querySelector('.service-input-desc').value.trim();
                        const newIcon = card.querySelector('.service-input-icon').value.trim() || 'fa-laptop-code';

                        if (!newTitle || !newDesc) {
                            alert('Title and Description required');
                            return;
                        }

                        services[index] = { title: newTitle, description: newDesc, icon: newIcon };
                        renderServices();
                    });
                });
            }
        });
    }

    // --- Add Service button ---
    if (isOwner) {
        addServiceBtn.style.display = 'flex';
        addServiceBtn.addEventListener('click', () => {
            const card = document.createElement('div');
            card.classList.add('service-card');
            card.innerHTML = `
                <input type="text" class="service-input service-input-title" placeholder="Service Title">
                <input type="text" class="service-input service-input-icon" placeholder="FontAwesome Icon (fa-paint-brush)">
                <textarea class="service-input service-input-desc" placeholder="Service Description"></textarea>
                <div style="margin-top:10px; display:flex; gap:10px;">
                    <button class="save-service-btn">Save</button>
                    <button class="cancel-service-btn">Cancel</button>
                </div>
            `;

            // Cancel removes card
            card.querySelector('.cancel-service-btn').addEventListener('click', () => card.remove());

            // Save adds new service
            card.querySelector('.save-service-btn').addEventListener('click', () => {
                const title = card.querySelector('.service-input-title').value.trim();
                const desc = card.querySelector('.service-input-desc').value.trim();
                const icon = card.querySelector('.service-input-icon').value.trim() || 'fa-laptop-code';

                if (!title || !desc) return alert('Title and Description required');

                services.unshift({ title, description: desc, icon });
                renderServices();
            });

            servicesContainer.prepend(card);
            card.scrollIntoView({ behavior: 'smooth' });
        });
    } else {
        addServiceBtn.style.display = 'none';
    }

    // --- Initial render ---
    renderServices();
});
