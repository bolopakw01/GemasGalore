document.addEventListener('DOMContentLoaded', async function () {
  // ===== Dynamic Copyright Year =====
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ===== Navbar Scroll Effect =====
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // ===== Smooth Scrolling =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId.startsWith('#')) return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        window.scrollTo({
          top: targetElement.offsetTop - 75,
          behavior: 'smooth'
        });

        // Close mobile navbar collapse if open
        const navbarCollapse = document.getElementById('navbarNav');
        if (navbarCollapse && navbarCollapse.classList.contains('show')) {
          const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
          if (bsCollapse) bsCollapse.hide();
        }
      }
    });
  });

  // ===== Back to Top Button =====
  const backToTopButton = document.getElementById('back-to-top');
  if (backToTopButton) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 300) {
        backToTopButton.style.display = 'block';
      } else {
        backToTopButton.style.display = 'none';
      }
    });

    backToTopButton.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ===== Form Submission: Simpan ke Supabase & Buka WhatsApp =====
  const contactForm = document.querySelector('#contact form');
  if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const name = document.getElementById('name')?.value || '';
      const email = document.getElementById('email')?.value || '';
      const phone = document.getElementById('phone')?.value || '';
      const message = document.getElementById('message')?.value || '';

      // 1. Simpan pesan ke Supabase database (jika tersedia)
      if (typeof saveMessage === 'function') {
        saveMessage({ name, email, phone, message });
      }

      // 2. Format dan buka pesan via WhatsApp
      const waNumber = '6289656759653';
      const text = `Halo Gemas Galore!%0A%0A*Nama:* ${encodeURIComponent(name)}%0A*Email:* ${encodeURIComponent(email)}%0A*No HP:* ${encodeURIComponent(phone)}%0A*Pesan:* ${encodeURIComponent(message)}`;
      const waUrl = `https://wa.me/${waNumber}?text=${text}`;

      window.open(waUrl, '_blank');
      alert('Terima kasih! Pesan Anda telah tersimpan dan disiapkan untuk dikirimkan melalui WhatsApp.');
      this.reset();
    });
  }

  // ===== Dynamic Product Catalog (Supabase / Fallback) =====
  async function loadAndRenderProducts() {
    let products = [];
    if (typeof getProducts === 'function') {
      products = await getProducts();
    } else if (typeof DEFAULT_PRODUCTS !== 'undefined') {
      products = DEFAULT_PRODUCTS;
    }

    if (products && products.length > 0) {
      renderProductCards(products);
    }
  }

  function renderProductCards(products) {
    const productList = document.getElementById('productList');
    if (!productList) return;

    productList.innerHTML = products.map((p, idx) => `
      <div class="col-md-6 col-lg-4 product-item" data-category="${p.category}" data-aos="fade-up" data-aos-delay="${((idx % 3) + 1) * 100}">
        <div class="card product-card h-100 border-0 shadow-sm">
          <div class="position-relative overflow-hidden">
            <img src="${p.image_url}" class="card-img-top w-100" alt="${p.title}"
                 style="height: 280px; object-fit: cover; transition: transform 0.5s ease;"
                 onerror="this.src='asset/img/logo1.png'">
            <span class="position-absolute top-0 end-0 px-3 py-1 m-2 rounded fw-bold small text-white"
                  style="background-color: #491937;">${p.badge || 'Koleksi'}</span>
            <div class="position-absolute bottom-0 start-0 end-0 p-3 text-center"
                 style="background: linear-gradient(to top, rgba(73,25,55,0.85) 0%, transparent 100%);">
              <h5 class="text-white mb-0">${p.title}</h5>
            </div>
          </div>
          <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h5 class="card-title mb-0" style="color: #491937;">${p.title}</h5>
              <span class="badge" style="background-color: rgba(73,25,55,0.1); color: #491937;">${p.badge || 'Koleksi'}</span>
            </div>
            <p class="card-text text-muted small flex-grow-1">${p.description || ''}</p>
            <div class="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
              <span class="fw-bold fs-5" style="color: #491937;">${p.price}</span>
              <div class="d-flex gap-2">
                <button type="button" class="btn btn-sm btn-brand-primary btn-quick-view"
                  data-title="${p.title}"
                  data-price="${p.price}"
                  data-img="${p.image_url}"
                  data-badge="${p.badge || 'Koleksi'}"
                  data-desc="${p.description || ''}"
                  data-material="${p.material || 'Bahan Premium Berkualitas'}">
                  <i class="bi bi-eye me-1"></i>Detail
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    // Pasang event listener setelah render
    setupQuickViewEvents();
    setupHoverEffects();
    setupFilterEvents();
  }

  // ===== Setup Filter Tabs =====
  function setupFilterEvents() {
    const filterBtns = document.querySelectorAll('.product-filter-btn');
    const productItems = document.querySelectorAll('.product-item');

    filterBtns.forEach(btn => {
      btn.onclick = function () {
        filterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const filterValue = this.getAttribute('data-filter');

        productItems.forEach(item => {
          const category = item.getAttribute('data-category');
          if (filterValue === 'all' || category === filterValue) {
            item.classList.remove('filter-hidden');
          } else {
            item.classList.add('filter-hidden');
          }
        });
      };
    });
  }

  // ===== Setup Quick View Modal =====
  function setupQuickViewEvents() {
    const quickViewBtns = document.querySelectorAll('.btn-quick-view');
    const modalImg = document.getElementById('quickViewImg');
    const modalTitle = document.getElementById('quickViewTitle');
    const modalBadge = document.getElementById('quickViewBadge');
    const modalPrice = document.getElementById('quickViewPrice');
    const modalDesc = document.getElementById('quickViewDesc');
    const modalMaterial = document.getElementById('quickViewMaterial');
    const modalWaBtn = document.getElementById('quickViewWaBtn');

    quickViewBtns.forEach(btn => {
      btn.onclick = function (e) {
        e.preventDefault();
        const title = this.getAttribute('data-title') || '';
        const price = this.getAttribute('data-price') || '';
        const img = this.getAttribute('data-img') || '';
        const badge = this.getAttribute('data-badge') || 'Koleksi';
        const desc = this.getAttribute('data-desc') || '';
        const material = this.getAttribute('data-material') || 'Bahan Premium Berkualitas';

        if (modalImg) modalImg.src = img;
        if (modalTitle) modalTitle.textContent = title;
        if (modalBadge) modalBadge.textContent = badge;
        if (modalPrice) modalPrice.textContent = price;
        if (modalDesc) modalDesc.textContent = desc;
        if (modalMaterial) modalMaterial.textContent = material;

        if (modalWaBtn) {
          const waMsg = `Halo Gemas Galore, saya tertarik memesan produk *${encodeURIComponent(title)}* (${encodeURIComponent(price)}). Boleh info detail dan ketersediaannya?`;
          modalWaBtn.href = `https://wa.me/6289656759653?text=${waMsg}`;
        }

        const modalElement = document.getElementById('productQuickViewModal');
        if (modalElement) {
          const productModal = new bootstrap.Modal(modalElement);
          productModal.show();
        }
      };
    });
  }

  // ===== Setup Hover Effects =====
  function setupHoverEffects() {
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
      card.onmouseenter = function () {
        const img = this.querySelector('.card-img-top');
        if (img) img.style.transform = 'scale(1.05)';
      };

      card.onmouseleave = function () {
        const img = this.querySelector('.card-img-top');
        if (img) img.style.transform = 'scale(1)';
      };
    });
  }

  // Muat produk dinamis
  await loadAndRenderProducts();

  // ===== Timeline Animation =====
  const timelineItems = document.querySelectorAll('.timeline-item');
  function animateTimeline() {
    timelineItems.forEach((item, index) => {
      setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateX(0)';
      }, index * 200);
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateTimeline();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  const timelineSection = document.querySelector('#history');
  if (timelineSection) {
    observer.observe(timelineSection);
  }

  // ===== Initialize AOS with Mobile Optimization =====
  if (typeof AOS !== 'undefined') {
    const isMobile = window.innerWidth <= 768;
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      disable: isMobile
    });
  }
});
