document.addEventListener('DOMContentLoaded', () => {
  const skillsContainer = document.querySelector('.skills-container');
  const addSkillBtn = document.querySelector('.add-skill-btn');

  // Owner flag
  let isOwner = true; // set true or false

  // In-memory skills array (with color property)
 let skills = [
    { name: "Modern Web Development", icon: "fab fa-html5", color: "#e34c26" },
    { name: "Advanced Styling Techniques", icon: "fab fa-css3-alt", color: "#264de4" },
    { name: "Interactive Web Applications", icon: "fab fa-js-square", color: "#f0db4f" },
    { name: "Clean Code Writing", icon: "fa-solid fa-code", color: "#000000" },
    { name: "Modern UI Development", icon: "fab fa-react", color: "#61dafb" },
    { name: "Backend Server Development", icon: "fab fa-node-js", color: "#3c873a" },
    { name: "Python Scripting Development", icon: "fab fa-python", color: "#306998" },
    { name: "Version Control Management", icon: "fab fa-git-alt", color: "#f1502f" },
    { name: "System Programming Development", icon: "fa-solid fa-laptop-code", color: "#00599C" },
    { name: "Database Management Systems", icon: "fa-solid fa-database", color: "#f29111" },
    { name: "Web Backend Development", icon: "fab fa-php", color: "#8993be" },
    { name: "Linux System Administration", icon: "fab fa-linux", color: "#FCC624" },
    { name: "Containerization Technology Management", icon: "fab fa-docker", color: "#2496ed" },
    { name: "REST API Development", icon: "fa-solid fa-plug", color: "#ff6600" },
    { name: "Software Bug Fixing", icon: "fa-solid fa-bug", color: "#ff0000" },
    { name: "Type-Safe JavaScript Development", icon: "fab fa-js", color: "#3178c6" },
    { name: "Vue Framework Development", icon: "fab fa-vuejs", color: "#42b883" },
    { name: "Enterprise Application Development", icon: "fab fa-java", color: "#007396" },
    { name: "UI/UX Design Collaboration", icon: "fab fa-figma", color: "#f24e1e" },
    { name: "Responsive Web Design", icon: "fa-solid fa-mobile-screen", color: "#4CAF50" },
    { name: "Cross-Browser Compatibility", icon: "fa-solid fa-globe", color: "#2196F3" },
    { name: "Performance Optimization Techniques", icon: "fa-solid fa-gauge-high", color: "#FF9800" },
    { name: "Security Best Practices", icon: "fa-solid fa-shield-halved", color: "#9C27B0" },
    { name: "Agile Development Methodology", icon: "fa-solid fa-people-group", color: "#795548" },
    { name: "Cloud Infrastructure Management", icon: "fa-solid fa-cloud", color: "#00BCD4" },
    { name: "Mobile App Development", icon: "fa-solid fa-mobile", color: "#8BC34A" },
    { name: "Data Structure Implementation", icon: "fa-solid fa-diagram-project", color: "#607D8B" },
    { name: "Algorithm Design Development", icon: "fa-solid fa-brain", color: "#E91E63" },
    { name: "Testing Automation Framework", icon: "fa-solid fa-vial", color: "#3F51B5" },
    { name: "Continuous Integration Deployment", icon: "fa-solid fa-arrows-rotate", color: "#FF5722" }
];

  // --- Render all skills ---
  function renderSkills() {
    skillsContainer.innerHTML = '';
    skills.forEach(skill => {
      const card = createSkillCard(skill);
      skillsContainer.appendChild(card);
    });
  }

  // --- Create skill card (view mode) ---
  function createSkillCard(skill) {
    const card = document.createElement('div');
    card.classList.add('skill-card');
    card.innerHTML = `
      <i class="${skill.icon} skill-icon"></i>
      <span class="skill-name">${skill.name}</span>
      ${isOwner ? `
      <div class="skill-actions">
        <button class="edit"><i class="fas fa-pen"></i></button>
        <button class="delete"><i class="fas fa-trash"></i></button>
      </div>` : ''}
    `;

    const iconEl = card.querySelector('.skill-icon');
    iconEl.style.color = skill.color || '#000';

    // Double-click to change icon color
    iconEl.addEventListener('dblclick', () => {
      if (!isOwner) return;
      if (card.querySelector('.color-picker')) return;

      const colorInput = document.createElement('input');
      colorInput.type = 'color';
      colorInput.value = skill.color || '#000000';
      colorInput.classList.add('color-picker');
      colorInput.style.marginLeft = '10px';

      colorInput.addEventListener('input', () => {
        iconEl.style.color = colorInput.value;
        skill.color = colorInput.value;
      });

      colorInput.addEventListener('blur', () => colorInput.remove());
      card.appendChild(colorInput);
      colorInput.focus();
    });

    if (isOwner) {
      // Delete skill
      card.querySelector('.delete').addEventListener('click', () => {
        if (!confirm(`Delete skill "${skill.name}"?`)) return;
        skills = skills.filter(s => s !== skill);
        renderSkills();
      });

      // Edit skill
      card.querySelector('.edit').addEventListener('click', () => {
        const editCard = createEditableCard(skill);
        card.replaceWith(editCard);
      });
    }

    return card;
  }

  // --- Create editable skill card ---
  function createEditableCard(skill = { name: '', icon: '', color: '#000000' }) {
    const card = document.createElement('div');
    card.classList.add('skill-card');
    card.innerHTML = `
      <input type="text" class="skill-input skill-input-name" placeholder="Skill Name" value="${skill.name}" />
      <input type="text" class="skill-input skill-input-icon" placeholder="FontAwesome Icon (fab fa-js-square)" value="${skill.icon}" />
      <div style="display:flex; gap:10px; margin-left:auto; margin-top:5px;">
        <button class="save-skill-btn">Save</button>
        <button class="cancel-skill-btn">Cancel</button>
      </div>
    `;

    // Cancel button
    card.querySelector('.cancel-skill-btn').addEventListener('click', () => {
      if (skill.name) {
        const viewCard = createSkillCard(skill);
        card.replaceWith(viewCard);
      } else {
        card.remove();
      }
    });

    // Save button
    card.querySelector('.save-skill-btn').addEventListener('click', () => {
      const name = card.querySelector('.skill-input-name').value.trim();
      const icon = card.querySelector('.skill-input-icon').value.trim();

      if (!name || !icon) {
        alert('Name and Icon are required!');
        return;
      }

      if (skill.name) {
        skill.name = name;
        skill.icon = icon;
      } else {
        skills.unshift({ name, icon, color: '#000000' });
      }

      renderSkills();
    });

    return card;
  }

  // --- Add Skill button ---
  if (isOwner) {
    addSkillBtn.style.display = 'flex';
    addSkillBtn.addEventListener('click', () => {
      const newCard = createEditableCard();
      skillsContainer.prepend(newCard);
      newCard.scrollIntoView({ behavior: 'smooth' });
    });
  } else {
    addSkillBtn.style.display = 'none';
  }

  // --- Initial render ---
  renderSkills();
});
