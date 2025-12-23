document.addEventListener('DOMContentLoaded', () => {
  const timeline = document.querySelector('.timeline');
  const addCertBtn = document.querySelector('.add-cert-btn');

  // Get providerId and isOwner from the global profileData
  let providerId = window.profileData?.providerId;
  let isOwner = window.profileData?.isOwner || false;
  const API_BASE = 'certifications_handler.php';

  // Certifications model
  const CertificationsModel = {
    certifications: [],

    async loadCertifications() {
      if (!providerId) return [];
      
      try {
        console.log('🔍 Loading certifications for provider:', providerId);
        const response = await fetch(`${API_BASE}?action=getCertifications&providerId=${providerId}`);
        const result = await response.json();
        
        if (result.success) {
          this.certifications = result.data.map(cert => ({
            id_certification: cert.id_certification,
            title: cert.title,
            issuer: cert.issuer,
            date: cert.date,
            description: cert.description || '',
            link: cert.link || '#',
            logo: cert.logo || this.getDefaultLogoUrl(cert.issuer)
          }));
          console.log('✅ Loaded certifications:', this.certifications);
          return this.certifications;
        } else {
          throw new Error(result.message || 'Failed to load certifications');
        }
      } catch (error) {
        console.error('Failed to load certifications:', error);
        this.showNotification('Failed to load certifications', 'error');
        return [];
      }
    },

    async addCertification(title, issuer, date, description, link, logo) {
      if (!isOwner || !providerId) {
        throw new Error('Not authorized to add certifications');
      }
      
      try {
        const formData = new FormData();
        formData.append('action', 'addCertification');
        formData.append('providerId', providerId);
        formData.append('title', title);
        formData.append('issuer', issuer);
        formData.append('date', date);
        formData.append('description', description);
        formData.append('link', link);
        formData.append('logo', logo || this.getDefaultLogoUrl(issuer));
        
        const response = await fetch(API_BASE, {
          method: 'POST',
          body: formData
        });
        
        const result = await response.json();
        return result;
      } catch (error) {
        console.error('Add certification error:', error);
        throw error;
      }
    },

    async updateCertification(certificationId, title, issuer, date, description, link, logo) {
      if (!isOwner || !providerId) {
        throw new Error('Not authorized to update certifications');
      }
      
      try {
        const formData = new FormData();
        formData.append('action', 'updateCertification');
        formData.append('providerId', providerId);
        formData.append('certificationId', certificationId);
        formData.append('title', title);
        formData.append('issuer', issuer);
        formData.append('date', date);
        formData.append('description', description);
        formData.append('link', link);
        formData.append('logo', logo || this.getDefaultLogoUrl(issuer));
        
        const response = await fetch(API_BASE, {
          method: 'POST',
          body: formData
        });
        
        const result = await response.json();
        return result;
      } catch (error) {
        console.error('Update certification error:', error);
        throw error;
      }
    },

    async deleteCertification(certificationId) {
      if (!isOwner || !providerId) {
        throw new Error('Not authorized to delete certifications');
      }
      
      try {
        const formData = new FormData();
        formData.append('action', 'deleteCertification');
        formData.append('providerId', providerId);
        formData.append('certificationId', certificationId);
        
        const response = await fetch(API_BASE, {
          method: 'POST',
          body: formData
        });
        
        const result = await response.json();
        return result;
      } catch (error) {
        console.error('Delete certification error:', error);
        throw error;
      }
    },

    getDefaultLogoUrl(issuer) {
      const logoUrls = {
        'Udemy': 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Udemy_logo.svg',
        'freeCodeCamp': 'https://cdn.freecodecamp.org/platform/universal/fcc_primary.svg',
        'Coursera': 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera.s3.amazonaws.com/media/coursera-logo-square.png',
        'LinkedIn Learning': 'https://content.linkedin.com/content/dam/me/learning/blog/2016/september/logo.jpg',
        'Pluralsight': 'https://www.pluralsight.com/content/dam/pluralsight2/company/global/brand-assets/logos/pluralsight-logo-vrt-color-2.png',
        'Google': 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
        'Microsoft': 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg',
        'AWS': 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
        'IBM': 'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg',
        'Oracle': 'https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg',
        'Cisco': 'https://upload.wikimedia.org/wikipedia/commons/0/08/Cisco_logo_blue_2016.svg',
        'default': 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
      };
      
      // Clean issuer name for matching
      const cleanIssuer = issuer.trim();
      
      // Check for exact match
      if (logoUrls[cleanIssuer]) {
        return logoUrls[cleanIssuer];
      }
      
      // Check for partial match (case insensitive)
      const issuerLower = cleanIssuer.toLowerCase();
      for (const [key, url] of Object.entries(logoUrls)) {
        if (issuerLower.includes(key.toLowerCase()) || key.toLowerCase().includes(issuerLower)) {
          return url;
        }
      }
      
      // Try to find by common patterns
      if (issuerLower.includes('udemy')) return logoUrls['Udemy'];
      if (issuerLower.includes('freecodecamp') || issuerLower.includes('free code camp')) return logoUrls['freeCodeCamp'];
      if (issuerLower.includes('coursera')) return logoUrls['Coursera'];
      if (issuerLower.includes('linkedin')) return logoUrls['LinkedIn Learning'];
      if (issuerLower.includes('plural')) return logoUrls['Pluralsight'];
      if (issuerLower.includes('google')) return logoUrls['Google'];
      if (issuerLower.includes('microsoft')) return logoUrls['Microsoft'];
      if (issuerLower.includes('amazon') || issuerLower.includes('aws')) return logoUrls['AWS'];
      if (issuerLower.includes('ibm')) return logoUrls['IBM'];
      if (issuerLower.includes('oracle')) return logoUrls['Oracle'];
      if (issuerLower.includes('cisco')) return logoUrls['Cisco'];
      
      return logoUrls.default;
    },

    showNotification(message, type = 'success') {
      // Reuse the notification function from profile.js if available
      if (window.Utils && window.Utils.showNotification) {
        return window.Utils.showNotification(message, type);
      }
      
      // Fallback notification
      console.log(`💬 Notification (${type}):`, message);
      
      const existing = document.querySelector('.notification');
      if (existing) existing.remove();

      const notification = document.createElement('div');
      notification.className = `notification ${type}`;
      notification.innerHTML = `
          <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}"></i>
          <span>${message}</span>
          <button class="close-notification">&times;</button>
      `;
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => notification.remove(), 300);
      }, 4000);
      
      notification.querySelector('.close-notification').addEventListener('click', () => {
        notification.remove();
      });
    },

    validateLogoUrl(url) {
      if (!url || url.trim() === '') return true; // Empty is okay (will use default)
      
      try {
        const urlObj = new URL(url);
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
      } catch {
        return false; // Invalid URL
      }
    }
  };

  async function renderCertifications() {
    // Load certifications from database
    await CertificationsModel.loadCertifications();
    
    timeline.innerHTML = '';
    
    if (CertificationsModel.certifications.length === 0) {
      timeline.innerHTML = `
        <div class="no-certifications">
          <i class="fas fa-award"></i>
          <h3>No certifications yet</h3>
          <p>${isOwner ? 'Add your first certification to showcase your achievements!' : 'This provider hasn\'t added any certifications yet.'}</p>
        </div>
      `;
      return;
    }
    
    // Sort by date (newest first)
    CertificationsModel.certifications.sort((a, b) => {
      // Convert dates to comparable format
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    });
    
    CertificationsModel.certifications.forEach(cert => {
      timeline.appendChild(createCertificationCard(cert));
    });
  }

  function createCertificationCard(cert) {
    const card = document.createElement('div');
    card.classList.add('timeline-item');

    // Use logo URL, fallback to default if invalid
    const logoUrl = cert.logo && cert.logo.startsWith('http') ? cert.logo : CertificationsModel.getDefaultLogoUrl(cert.issuer);

    card.innerHTML = `
      <div class="cert-logo">
        <img src="${logoUrl}" alt="${cert.issuer} Logo" 
             onerror="this.onerror=null; this.src='https://cdn-icons-png.flaticon.com/512/3135/3135715.png'">
      </div>
      <div class="content">
        <div class="cert-header">
          <h3>${cert.title}</h3>
          ${isOwner ? `<div class="actions">
            <i class="fas fa-pen edit" title="Edit certification"></i>
            <i class="fas fa-trash delete" title="Delete certification"></i>
          </div>` : ''}
        </div>
        <div class="date">${cert.date}</div>
        <p class="cert-issuer">Issued by ${cert.issuer}</p>
        <p class="cert-desc">${cert.description || ''}</p>
        ${cert.link && cert.link !== '#' && cert.link.startsWith('http') ? 
          `<a href="${cert.link}" target="_blank" rel="noopener noreferrer" class="cert-link">
            <i class="fas fa-external-link-alt"></i> View Certificate
          </a>` : 
          '<span class="no-link"><i class="fas fa-ban"></i> No certificate link</span>'}
      </div>
    `;

    if (isOwner) {
      card.querySelector('.delete').addEventListener('click', async () => {
        if (confirm(`Delete certification: "${cert.title}"?`)) {
          try {
            const result = await CertificationsModel.deleteCertification(cert.id_certification);
            if (result.success) {
              await renderCertifications();
              CertificationsModel.showNotification(`Deleted certification: "${cert.title}"`, 'success');
            } else {
              CertificationsModel.showNotification(result.message, 'error');
            }
          } catch (error) {
            CertificationsModel.showNotification(`Error deleting certification: ${error.message}`, 'error');
          }
        }
      });

      card.querySelector('.edit').addEventListener('click', () => {
        const editCard = createEditableCard(cert);
        card.replaceWith(editCard);
        editCard.scrollIntoView({ behavior: 'smooth' });
      });
    }

    return card;
  }

  function createEditableCard(cert = { 
    id_certification: null,
    title: '', 
    issuer: '', 
    date: '', 
    description: '', 
    link: '', 
    logo: '' 
  }) {
    const card = document.createElement('div');
    card.classList.add('timeline-item', 'editing');

    card.innerHTML = `
      <div class="cert-edit-form">
        <input type="text" class="cert-input" placeholder="Certification Title*" value="${cert.title}">
        <input type="text" class="cert-input" placeholder="Issuing Organization*" value="${cert.issuer}">
        <input type="text" class="cert-input" placeholder="Date (e.g., Feb 2025)*" value="${cert.date}">
        <textarea class="cert-textarea" placeholder="Description">${cert.description}</textarea>
        <input type="url" class="cert-input" placeholder="Certificate URL (https://...)" value="${cert.link}">
        <input type="url" class="cert-input" placeholder="Logo URL (https://...)" value="${cert.logo}">
        <small style="color: #666; font-size: 12px; margin-top: -8px; margin-bottom: 10px; display: block;">
          Leave logo URL empty to use default logo
        </small>
        <div class="cert-edit-buttons">
          <button class="save-cert-btn">
            <i class="fas fa-check"></i>
            ${cert.id_certification ? 'Update' : 'Add'} Certification
          </button>
          <button class="cancel-cert-btn">
            <i class="fas fa-times"></i>
            Cancel
          </button>
        </div>
      </div>
    `;

    card.querySelector('.cancel-cert-btn').addEventListener('click', () => {
      if (cert.id_certification) {
        card.replaceWith(createCertificationCard(cert));
        CertificationsModel.showNotification('Edit cancelled', 'error');
      } else {
        card.remove();
        CertificationsModel.showNotification('Certification creation cancelled', 'error');
      }
    });

    card.querySelector('.save-cert-btn').addEventListener('click', async () => {
      const title = card.querySelector('.cert-input:nth-child(1)').value.trim();
      const issuer = card.querySelector('.cert-input:nth-child(2)').value.trim();
      const date = card.querySelector('.cert-input:nth-child(3)').value.trim();
      const description = card.querySelector('.cert-textarea').value.trim();
      const link = card.querySelector('.cert-input:nth-child(5)').value.trim();
      const logo = card.querySelector('.cert-input:nth-child(6)').value.trim();

      // Validation
      if (!title) {
        CertificationsModel.showNotification('Title is required', 'error');
        return;
      }
      if (!issuer) {
        CertificationsModel.showNotification('Issuer is required', 'error');
        return;
      }
      if (!date) {
        CertificationsModel.showNotification('Date is required', 'error');
        return;
      }
      
      // Validate URLs if provided
      if (link && !link.startsWith('http')) {
        CertificationsModel.showNotification('Certificate URL must start with http:// or https://', 'error');
        return;
      }
      
      if (logo && !CertificationsModel.validateLogoUrl(logo)) {
        CertificationsModel.showNotification('Logo URL must be a valid URL starting with http:// or https://', 'error');
        return;
      }

      try {
        if (cert.id_certification) {
          // Update existing certification
          const result = await CertificationsModel.updateCertification(
            cert.id_certification,
            title,
            issuer,
            date,
            description,
            link,
            logo
          );
          
          if (result.success) {
            await renderCertifications();
            CertificationsModel.showNotification('Certification updated successfully!', 'success');
          } else {
            CertificationsModel.showNotification(result.message, 'error');
          }
        } else {
          // Add new certification
          const result = await CertificationsModel.addCertification(
            title,
            issuer,
            date,
            description,
            link,
            logo
          );
          
          if (result.success) {
            await renderCertifications();
            CertificationsModel.showNotification('Certification added successfully!', 'success');
          } else {
            CertificationsModel.showNotification(result.message, 'error');
          }
        }
      } catch (error) {
        CertificationsModel.showNotification(`Error: ${error.message}`, 'error');
      }
    });

    return card;
  }

 

  // --- Initialize ---
  async function init() {
    console.log('🚀 Initializing certifications section...');
    console.log('✅ Provider ID:', providerId);
    console.log('✅ Is Owner:', isOwner);
    
    if (!providerId) {
      console.error('No provider ID available');
      return;
    }

     if (isOwner && addCertBtn) {
    addCertBtn.style.display = 'flex';
    addCertBtn.addEventListener('click', () => {
      const card = createEditableCard();
      timeline.prepend(card);
      card.scrollIntoView({ behavior: 'smooth' });
      
      // Focus on the first input
      setTimeout(() => {
        card.querySelector('.cert-input:nth-child(1)').focus();
      }, 100);
    });
  } else if (addCertBtn) {
    addCertBtn.style.display = 'none';
  }
    
    await renderCertifications();
    console.log('✅ Certifications section initialized');
  }

  // Wait a bit for profile.js to set window.profileData
  setTimeout(() => {
    if (!providerId) {
      // Try to get from profile.js again
      providerId = window.profileData?.providerId;
      isOwner = window.profileData?.isOwner || false;
    }
    init();
  }, 500);
});