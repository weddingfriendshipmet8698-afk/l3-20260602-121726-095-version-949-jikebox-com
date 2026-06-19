(() => {
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let activeIndex = 0;

    const showSlide = (index) => {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    };

    dots.forEach((dot, dotIndex) => {
      dot.addEventListener('click', () => showSlide(dotIndex));
    });

    if (slides.length > 1) {
      window.setInterval(() => showSlide(activeIndex + 1), 5200);
    }
  }

  const normalize = (value) => String(value || '').trim().toLowerCase();

  document.querySelectorAll('[data-search-scope]').forEach((scope) => {
    const input = scope.querySelector('[data-search-input]');
    const yearSelect = scope.querySelector('[data-year-filter]');
    const cards = Array.from(scope.querySelectorAll('[data-movie-card]'));

    const applyFilters = () => {
      const query = normalize(input ? input.value : '');
      const year = yearSelect ? yearSelect.value : '';

      cards.forEach((card) => {
        const text = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.region,
          card.textContent
        ].join(' '));
        const matchedQuery = !query || text.includes(query);
        const matchedYear = !year || card.dataset.year === year;
        card.classList.toggle('is-hidden', !(matchedQuery && matchedYear));
      });
    };

    if (input) {
      input.addEventListener('input', applyFilters);
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilters);
    }
  });
})();
