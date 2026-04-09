/* ==========================================
   Palmetto Haul Co. — Main JavaScript
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Mobile Menu ---- */
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });

    // Close when a link inside the menu is clicked
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });
  }

  /* ---- Active Nav Link ---- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ---- Modals ---- */
  const openModal = (id) => {
    const overlay = document.getElementById(id);
    if (overlay) {
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeModal = (overlay) => {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  // Open triggers
  document.querySelectorAll('[data-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(btn.dataset.modal);
    });
  });

  // Close on X button
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal(btn.closest('.modal-overlay'));
    });
  });

  // Close on overlay backdrop click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay);
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(closeModal);
      closeLightbox();
    }
  });

  /* ---- Booking Form ---- */
  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(bookingForm);
      const data = Object.fromEntries(formData);
      console.log('Booking request:', data); // Replace with actual API call

      bookingForm.innerHTML = `
        <div class="form-success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <h3>Request Received!</h3>
          <p>We'll contact you within 1 hour to confirm your pickup. For faster service, call or text us directly.</p>
        </div>
      `;
    });
  }

  /* ---- Review Form ---- */
  const reviewForm = document.getElementById('review-form');
  if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
      e.preventDefault();
      reviewForm.innerHTML = `
        <div class="form-success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <h3>Thanks for Your Review!</h3>
          <p>We appreciate your feedback. It means the world to us as a small, local business.</p>
        </div>
      `;
    });
  }

  /* ---- Contact Form ---- */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      contactForm.innerHTML = `
        <div class="form-success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <h3>Message Sent!</h3>
          <p>Thanks for reaching out. We typically respond within a few hours. You can also call or text us for a faster response.</p>
        </div>
      `;
    });
  }

  /* ---- Lightbox (Gallery) ---- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');

  const openLightbox = (src, alt) => {
    if (!lightbox || !lightboxImg || !src) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('.gallery-full-item img').forEach(img => {
    img.parentElement.addEventListener('click', () => {
      openLightbox(img.src, img.alt);
    });
  });

  if (lightbox) {
    document.getElementById('lightbox-close')?.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  }

  /* ---- Scroll Animations ---- */
  const animEls = document.querySelectorAll('[data-anim]');
  if (animEls.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    animEls.forEach(el => observer.observe(el));
  } else {
    // Fallback: show everything immediately
    animEls.forEach(el => el.classList.add('visible'));
  }

  /* ---- Star Rating (review modal) ---- */
  const stars = document.querySelectorAll('.star-rating .star');
  const ratingInput = document.getElementById('rating-value');
  stars.forEach((star, i) => {
    star.addEventListener('click', () => {
      stars.forEach((s, j) => {
        s.classList.toggle('active', j <= i);
      });
      if (ratingInput) ratingInput.value = i + 1;
    });
    star.addEventListener('mouseover', () => {
      stars.forEach((s, j) => s.classList.toggle('active', j <= i));
    });
  });
  document.querySelector('.star-rating')?.addEventListener('mouseleave', () => {
    const val = parseInt(ratingInput?.value || 0);
    stars.forEach((s, j) => s.classList.toggle('active', j < val));
  });

  /* ---- Header scroll shadow ---- */
  const siteHeader = document.querySelector('.site-header');
  if (siteHeader) {
    window.addEventListener('scroll', () => {
      siteHeader.style.boxShadow = window.scrollY > 10
        ? '0 2px 24px rgba(0,0,0,.22)'
        : '0 2px 16px rgba(0,0,0,.18)';
    }, { passive: true });
  }

});
