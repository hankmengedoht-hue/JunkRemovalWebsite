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

      const normPath = (p) => p ? p.replace(/^\//, '') : '';
      grid.innerHTML = photos.map((photo, i) => `
        <div class="gallery-full-item" data-category="${photo.category || 'all'}" data-anim data-anim-delay="${(i % 4) + 1}">
          <img src="${normPath(photo.image)}" alt="${photo.alt || photo.caption || 'Junk removal job in Charleston SC'}" loading="lazy">
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

  /* ---- Scroll Progress Bar (#19) ---- */
  const progressBar = document.createElement('div');
  progressBar.id = 'scroll-progress';
  document.body.prepend(progressBar);
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }, { passive: true });

  /* ---- Back-to-top Button (#20) ---- */
  const btt = document.createElement('button');
  btt.id = 'back-to-top';
  btt.setAttribute('aria-label', 'Back to top');
  btt.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>`;
  document.body.appendChild(btt);
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) { btt.classList.add('visible'); }
    else { btt.classList.remove('visible'); }
  }, { passive: true });
  btt.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* ---- FAQ Accordion (#12) ---- */
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      // Close all
      document.querySelectorAll('.faq-question').forEach(b => {
        b.setAttribute('aria-expanded', 'false');
        b.nextElementSibling?.classList.remove('open');
      });
      // Open clicked (toggle)
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        btn.nextElementSibling?.classList.add('open');
      }
    });
  });

  /* ---- Home Gallery Preview Loading (#14 + #22 skeleton) ---- */
  async function loadHomeGallery() {
    const homeGrid = document.getElementById('home-gallery-grid');
    if (!homeGrid) return;

    // Inject skeleton placeholders
    homeGrid.innerHTML = Array(4).fill(0).map(() =>
      `<div class="gallery-item skeleton" style="aspect-ratio:1;"></div>`
    ).join('');

    try {
      const res = await fetch('_data/gallery.json');
      const data = await res.json();
      const photos = (data.photos || []).filter(p => p.published !== false).slice(0, 4);

      if (photos.length === 0) {
        homeGrid.innerHTML = Array(4).fill(0).map((_, i) => `
          <div class="gallery-item" data-anim data-anim-delay="${i + 1}">
            <div class="gallery-placeholder" style="background:var(--light-gray);height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.5rem;color:var(--gray);font-size:.78rem;font-family:var(--font-head);font-weight:600;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:30px;height:30px;opacity:.38;"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              Coming Soon
            </div>
          </div>`).join('');
        initScrollAnimations();
        return;
      }

      const normPath = (p) => p ? p.replace(/^\//, '') : '';
      homeGrid.innerHTML = photos.map((photo, i) => `
        <div class="gallery-item" data-anim data-anim-delay="${i + 1}">
          <img src="${normPath(photo.image)}" alt="${photo.alt || photo.caption || 'Junk removal job in Charleston SC'}" loading="lazy">
        </div>`).join('');

      initScrollAnimations();

    } catch {
      // On fetch failure show coming soon placeholders
      homeGrid.innerHTML = Array(4).fill(0).map((_, i) => `
        <div class="gallery-item" data-anim data-anim-delay="${i + 1}">
          <div class="gallery-placeholder" style="background:var(--light-gray);height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.5rem;color:var(--gray);font-size:.78rem;font-family:var(--font-head);font-weight:600;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:30px;height:30px;opacity:.38;"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            Coming Soon
          </div>
        </div>`).join('');
      initScrollAnimations();
    }
  }

  /* ---- Gallery skeleton loading enhancement (#22) ---- */
  const galleryGrid = document.getElementById('gallery-grid');
  if (galleryGrid) {
    galleryGrid.innerHTML = Array(8).fill(0).map(() =>
      `<div class="gallery-full-item skeleton" style="aspect-ratio:4/3;cursor:default;"></div>`
    ).join('');
  }

  const reviewsContainer = document.getElementById('reviews-container');
  if (reviewsContainer) {
    reviewsContainer.innerHTML = `
      <div class="testimonials-grid">
        ${Array(3).fill(0).map(() => `
          <div class="testimonial-card skeleton" style="height:160px;"></div>
        `).join('')}
      </div>`;
  }

  /* ---- Team Photo Loading ---- */
  async function loadTeam() {
    try {
      const res = await fetch('_data/team.json');
      const data = await res.json();

      // CMS saves paths with a leading slash; strip it so they resolve correctly on GitHub Pages
      const normPath = (p) => p ? p.replace(/^\//, '') : '';

      const setPhoto = (id, src, name) => {
        const el = document.getElementById(id);
        const path = normPath(src);
        if (!el || !path) return;
        el.innerHTML = `<img src="${path}" alt="${name}" style="width:100%;height:100%;object-fit:cover;">`;
      };

      const setBio = (id, text) => {
        const el = document.getElementById(id);
        if (!el || !text) return;
        el.textContent = text;
      };

      setPhoto('hank-photo',  data.hank_photo,  'Hank');
      setPhoto('jacob-photo', data.jacob_photo, 'Jacob');
      setPhoto('team-photo',  data.team_photo,  'Hank and Jacob');
      setBio('hank-bio',  data.hank_bio);
      setBio('jacob-bio', data.jacob_bio);
    } catch {
      // silently keep placeholders if fetch fails
    }
  }

  /* ---- Homepage Background Image ---- */
  async function loadHomepageBg() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    try {
      const res = await fetch('_data/homepage-bg.json');
      const data = await res.json();
      const normPath = (p) => p ? p.replace(/^\//, '') : '';
      const path = normPath(data.image);
      if (path) {
        hero.style.backgroundImage = `linear-gradient(145deg, rgba(14,77,146,0.72) 0%, rgba(14,77,146,0.55) 100%), url('${path}')`;
        hero.style.backgroundSize = 'auto, cover';
        hero.style.backgroundPosition = 'auto, center';
      }
    } catch {
      // silently keep default CSS background
    }
  }

  /* ---- Init ---- */
  initScrollAnimations();
  loadGallery();
  loadReviews();
  loadHomeGallery();
  loadTeam();
  loadHomepageBg();
  bindLightboxItems();

});
