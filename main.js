/* ==========================================
   Palmetto Haul Co. — Main JavaScript
   ========================================== */

// ─── Formspree endpoint — replace with your real ID after signing up at formspree.io ───
// Get yours at: https://formspree.io → New Form → copy the endpoint URL
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Mobile Menu ---- */
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', hamburger.classList.contains('open'));
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });
  }

  /* ---- Active Nav Link ---- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ---- Modals ---- */
  const openModal = (id) => {
    const overlay = document.getElementById(id);
    if (overlay) { overlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
  };
  const closeModal = (overlay) => {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('[data-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => { e.preventDefault(); openModal(btn.dataset.modal); });
  });
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.closest('.modal-overlay')));
  });
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(overlay); });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(closeModal);
      closeLightbox();
    }
  });

  /* ---- Formspree Form Submission ---- */
  async function submitToFormspree(form, successHTML) {
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        form.innerHTML = successHTML;
      } else {
        const data = await res.json();
        const msg = data?.errors?.map(e => e.message).join(', ') || 'Something went wrong. Please try again or call us directly.';
        if (btn) { btn.disabled = false; btn.textContent = originalText; }
        showFormError(form, msg);
      }
    } catch {
      if (btn) { btn.disabled = false; btn.textContent = originalText; }
      showFormError(form, 'Network error. Please call or text us directly.');
    }
  }

  function showFormError(form, message) {
    let err = form.querySelector('.form-error');
    if (!err) {
      err = document.createElement('p');
      err.className = 'form-error';
      err.style.cssText = 'color:#dc2626;font-size:.85rem;margin-top:.75rem;font-weight:600;';
      form.appendChild(err);
    }
    err.textContent = message;
  }

  const successHTML = (title, body) => `
    <div class="form-success">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <h3>${title}</h3>
      <p>${body}</p>
    </div>`;

  /* Booking form */
  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      submitToFormspree(bookingForm, successHTML(
        'Request Received!',
        "We'll contact you within 1 hour to confirm your pickup. For faster service, call or text us directly."
      ));
    });
  }

  /* Contact form */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      submitToFormspree(contactForm, successHTML(
        'Message Sent!',
        "Thanks for reaching out. We typically respond within a few hours. You can also call or text us for a faster response."
      ));
    });
  }

  /* Review form */
  const reviewForm = document.getElementById('review-form');
  if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
      e.preventDefault();
      submitToFormspree(reviewForm, successHTML(
        "Thanks for Your Review!",
        "We appreciate your feedback. It means the world to us as a small, local business."
      ));
    });
  }

  /* ---- Lightbox ---- */
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

  const bindLightboxItems = () => {
    document.querySelectorAll('.gallery-full-item').forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        if (img) openLightbox(img.src, img.alt);
      });
    });
  };

  if (lightbox) {
    document.getElementById('lightbox-close')?.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  }

  /* ---- Dynamic Gallery Loading ---- */
  async function loadGallery() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;

    try {
      const res = await fetch('_data/gallery.json');
      const data = await res.json();
      const photos = (data.photos || []).filter(p => p.published !== false);

      if (photos.length === 0) {
        grid.innerHTML = `
          <div style="grid-column:1/-1;text-align:center;padding:4rem 1rem;color:var(--gray);">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 1rem;opacity:.35;display:block;">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <p style="font-family:var(--font-head);font-weight:600;">Photos coming soon — check back after our first jobs!</p>
          </div>`;
        return;
      }

      grid.innerHTML = photos.map((photo, i) => `
        <div class="gallery-full-item" data-category="${photo.category || 'all'}" data-anim data-anim-delay="${(i % 4) + 1}">
          <img src="${photo.image}" alt="${photo.alt || photo.caption || 'Junk removal job in Charleston SC'}" loading="lazy">
          <div class="gallery-overlay">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
            ${photo.caption || 'View'}
          </div>
        </div>`).join('');

      // Re-bind lightbox and animations for new elements
      bindLightboxItems();
      initScrollAnimations();

    } catch {
      // silently show nothing if fetch fails (e.g. during local dev without a server)
    }
  }

  /* ---- Dynamic Reviews Loading ---- */
  async function loadReviews() {
    const container = document.getElementById('reviews-container');
    if (!container) return;

    try {
      const res = await fetch('_data/reviews.json');
      const data = await res.json();
      const reviews = (data.reviews || []).filter(r => r.published !== false);

      if (reviews.length === 0) {
        container.innerHTML = `
          <div class="testimonials-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            <p>Be the first to write a review!</p>
            <button class="btn btn-primary" data-modal="review-modal">Leave a Review</button>
          </div>`;
        // Re-bind modal trigger for newly injected button
        container.querySelector('[data-modal]')?.addEventListener('click', (e) => {
          e.preventDefault();
          openModal('review-modal');
        });
        return;
      }

      const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

      container.innerHTML = `
        <div class="testimonials-grid">
          ${reviews.map((r, i) => `
            <div class="testimonial-card" data-anim data-anim-delay="${(i % 3) + 1}">
              <div class="stars" aria-label="${r.rating} out of 5 stars">${stars(r.rating)}</div>
              <p>"${r.body}"</p>
              <div class="testimonial-author">${r.name}</div>
              ${r.location ? `<div class="testimonial-loc">${r.location}</div>` : ''}
            </div>`).join('')}
        </div>`;

      initScrollAnimations();

    } catch {
      // silently fail during local dev
    }
  }

  /* ---- Gallery Filter (works for both static and dynamic content) ---- */
  window.filterGallery = function(cat) {
    const items = document.querySelectorAll('#gallery-grid .gallery-full-item');
    const btns  = document.querySelectorAll('.gallery-filter');
    btns.forEach(btn => {
      const isActive = btn.dataset.filter === cat;
      btn.style.background = isActive ? 'var(--blue)' : 'transparent';
      btn.style.color      = isActive ? 'var(--white)' : 'var(--blue)';
    });
    items.forEach(item => {
      item.style.display = (cat === 'all' || item.dataset.category === cat) ? '' : 'none';
    });
  };

  /* ---- Scroll Animations ---- */
  function initScrollAnimations() {
    const animEls = document.querySelectorAll('[data-anim]:not(.visible)');
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
      animEls.forEach(el => observer.observe(el));
    } else {
      animEls.forEach(el => el.classList.add('visible'));
    }
  }

  /* ---- Star Rating (review modal) ---- */
  const stars = document.querySelectorAll('.star-rating .star');
  const ratingInput = document.getElementById('rating-value');
  if (stars.length) {
    stars.forEach((star, i) => {
      star.addEventListener('click', () => {
        stars.forEach((s, j) => s.classList.toggle('active', j <= i));
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
  }

  /* ---- Header scroll shadow ---- */
  const siteHeader = document.querySelector('.site-header');
  if (siteHeader) {
    window.addEventListener('scroll', () => {
      siteHeader.style.boxShadow = window.scrollY > 10
        ? '0 2px 24px rgba(0,0,0,.22)'
        : '0 2px 16px rgba(0,0,0,.18)';
    }, { passive: true });
  }

  /* ---- Init ---- */
  initScrollAnimations();
  loadGallery();
  loadReviews();
  bindLightboxItems();

});
