document.addEventListener('DOMContentLoaded', () => {
  const timeline = document.querySelector('.timeline');
  const addCertBtn = document.querySelector('.add-cert-btn');
  const isOwner = true;

 let certifications = [
  { 
    date: "Feb 2025", 
    title: "Full-Stack Web Development", 
    issuer: "Udemy", 
    desc: "Completed a comprehensive full-stack web development course covering HTML, CSS, JavaScript, Node.js, and React.", 
    link: "https://www.example.com/fullstack-web-dev-cert", 
    logo: "/images/udemy.jpg" 
  },
  { 
    date: "Jan 2025", 
    title: "JavaScript Algorithms and Data Structures", 
    issuer: "freeCodeCamp", 
    desc: "Mastered JavaScript fundamentals, algorithms, and data structures for efficient problem-solving.", 
    link: "https://www.example.com/js-algo-cert", 
    logo: "/images/freecodecamp.png"  
  },
  { 
    date: "Dec 2024", 
    title: "Python for Data Science", 
    issuer: "Coursera", 
    desc: "Learned Python programming, data analysis, and visualization for data-driven projects.", 
    link: "https://www.example.com/python-data-science-cert", 
    logo: "/images/coursera.png"
  },
  { 
    date: "Nov 2024", 
    title: "React Development Bootcamp", 
    issuer: "LinkedIn Learning", 
    desc: "Hands-on projects building dynamic web apps using React, Redux, and REST APIs.", 
    link: "https://www.example.com/react-bootcamp-cert", 
    logo: "/images/linkdin.png"
  },
  { 
    date: "Oct 2024", 
    title: "SQL & Database Design", 
    issuer: "Pluralsight", 
    desc: "Learned relational database design, SQL querying, and data management best practices.", 
    link: "https://www.example.com/sql-cert", 
    logo: "/images/pluralsight-skills.webp" 
  }
];

  function renderCertifications() {
    timeline.innerHTML = '';
    certifications.forEach(cert => {
      timeline.appendChild(createCertificationCard(cert));
    });
  }

  function createCertificationCard(cert) {
    const card = document.createElement('div');
    card.classList.add('timeline-item');

    card.innerHTML = `
      <div class="cert-logo">
        <img src="${cert.logo || 'default-logo.png'}" alt="${cert.issuer} Logo">
      </div>
      <div class="content">
        <div class="cert-header">
          <h3>${cert.title}</h3>
          ${isOwner ? `<div class="actions">
            <i class="fas fa-pen edit"></i>
            <i class="fas fa-trash delete"></i>
          </div>` : ''}
        </div>
        <div class="date">${cert.date}</div>
        <p class="cert-issuer">Issued by ${cert.issuer}</p>
        <p class="cert-desc">${cert.desc || ''}</p>
        <a href="${cert.link}" target="_blank" class="cert-link">View Certificate</a>
      </div>
    `;

    if (isOwner) {
      card.querySelector('.delete').addEventListener('click', () => {
        if (!confirm(`Delete certification "${cert.title}"?`)) return;
        certifications = certifications.filter(c => c !== cert);
        renderCertifications();
      });

      card.querySelector('.edit').addEventListener('click', () => {
        const editCard = createEditableCard(cert);
        card.replaceWith(editCard);
        editCard.scrollIntoView({ behavior: 'smooth' });
      });
    }

    return card;
  }

  function createEditableCard(cert = { date: '', title: '', issuer: '', desc: '', link: '', logo: '' }) {
    const card = document.createElement('div');
    card.classList.add('timeline-item', 'editing'); // stacked inputs

    card.innerHTML = `
      <input type="text" class="cert-input" placeholder="Title" value="${cert.title}">
      <input type="text" class="cert-input" placeholder="Issuer" value="${cert.issuer}">
      <input type="text" class="cert-input" placeholder="Date" value="${cert.date}">
      <input type="text" class="cert-input" placeholder="Short Description" value="${cert.desc}">
      <input type="text" class="cert-input" placeholder="Certificate Link" value="${cert.link}">
      <input type="text" class="cert-input" placeholder="Logo URL" value="${cert.logo}">
      <div class="cert-edit-buttons" style="display:flex; gap:10px; margin-top:10px;">
        <button class="save-cert-btn">Save</button>
        <button class="cancel-cert-btn">Cancel</button>
      </div>
    `;

    card.querySelector('.cancel-cert-btn').addEventListener('click', () => {
      if (cert.title) card.replaceWith(createCertificationCard(cert));
      else card.remove();
    });

    card.querySelector('.save-cert-btn').addEventListener('click', () => {
      const inputs = {
        title: card.querySelectorAll('.cert-input')[0].value.trim(),
        issuer: card.querySelectorAll('.cert-input')[1].value.trim(),
        date: card.querySelectorAll('.cert-input')[2].value.trim(),
        desc: card.querySelectorAll('.cert-input')[3].value.trim(),
        link: card.querySelectorAll('.cert-input')[4].value.trim(),
        logo: card.querySelectorAll('.cert-input')[5].value.trim(),
      };

      if (!inputs.title || !inputs.issuer || !inputs.date || !inputs.link) {
        alert("All fields except description/logo are required!");
        return;
      }

      if (cert.title) Object.assign(cert, inputs);
      else certifications.unshift(inputs);

      renderCertifications();
    });

    return card;
  }

  if (isOwner) {
    addCertBtn.style.display = 'flex';
    addCertBtn.addEventListener('click', () => {
      const card = createEditableCard();
      timeline.prepend(card);
      card.scrollIntoView({ behavior: 'smooth' });
    });
  } else addCertBtn.style.display = 'none';

  renderCertifications();
});
