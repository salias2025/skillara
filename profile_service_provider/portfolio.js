document.addEventListener('DOMContentLoaded', () => {
  const portfolioGrid = document.querySelector('.portfolio-grid');
  const addPortfolioBtn = document.querySelector('.add-portfolio-btn');

  let isOwner = true;

  let portfolioItems = [
    { title: "Website Redesign", category: "Web Development", image: "/images/portfolio-1.webp", link: "https://example.com/portfolio1" },
    { title: "Branding Project", category: "Graphic Design", image: "/images/portfolio-2.webp", link: "https://example.com/portfolio2" },
    { title: "Mobile App UI", category: "UI/UX Design", image: "/images/portfolio-3.avif", link: "#" }
  ];

  function renderPortfolio() {
    portfolioGrid.innerHTML = '';
    portfolioItems.forEach(item => {
      portfolioGrid.appendChild(createPortfolioCard(item));
    });
  }

  function createPortfolioCard(item) {
    const card = document.createElement('div');
    card.classList.add('portfolio-item');
    card.innerHTML = `
      <img src="${item.image || '/images/default.webp'}" alt="${item.title}">
      <div class="portfolio-info">
        <div class="info-text">
          <h3>${item.title}</h3>
          <p>${item.category}</p>
        </div>
        <a href="${item.link}" target="_blank">
          <i class="fa-solid fa-arrow-up-right-from-square overlay-arrow"></i>
        </a>
      </div>
    `;

    if (isOwner) {
      card.addEventListener('dblclick', () => {
        const editCard = createEditablePortfolioCard(item);
        card.replaceWith(editCard);
      });
    }

    return card;
  }

  function createEditablePortfolioCard(item = { title: '', category: '', image: '', link: '' }) {
    const card = document.createElement('div');
    card.classList.add('portfolio-item', 'editing');

    card.innerHTML = `
      <input type="text" class="portfolio-input-title" placeholder="Project Title" value="${item.title}" />
      <input type="text" class="portfolio-input-category" placeholder="Category (ex: Web Design)" value="${item.category}" />
      <input type="file" class="portfolio-input-image" accept="image/*" />
      <input type="text" class="portfolio-input-link" placeholder="Link (optional)" value="${item.link}" />
      <div style="margin-top:10px; display:flex; gap:10px;">
        <button class="save-portfolio-btn">Save</button>
        <button class="cancel-portfolio-btn">Cancel</button>
      </div>
    `;

    const imageInput = card.querySelector('.portfolio-input-image');
    let uploadedImage = item.image;

    imageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
          uploadedImage = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    });

    card.querySelector('.cancel-portfolio-btn').addEventListener('click', () => {
      if (item.title) card.replaceWith(createPortfolioCard(item));
      else card.remove();
    });

    card.querySelector('.save-portfolio-btn').addEventListener('click', () => {
      const title = card.querySelector('.portfolio-input-title').value.trim();
      const category = card.querySelector('.portfolio-input-category').value.trim();
      const link = card.querySelector('.portfolio-input-link').value.trim();

      if (!title || !category || !uploadedImage) {
        alert('Title, Category, and Image are required!');
        return;
      }

      if (item.title) {
        Object.assign(item, { title, category, image: uploadedImage, link });
      } else {
        portfolioItems.unshift({ title, category, image: uploadedImage, link });
      }

      renderPortfolio();
    });

    return card;
  }

  if (isOwner) {
    addPortfolioBtn.style.display = 'flex';
    addPortfolioBtn.addEventListener('click', () => {
      const editableCard = createEditablePortfolioCard();
      portfolioGrid.prepend(editableCard);
    });
  } else addPortfolioBtn.style.display = 'none';

  renderPortfolio();
});

