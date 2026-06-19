(function () {
  const toggle = document.querySelector('[data-menu-toggle]');
  const nav = document.getElementById('main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  document.querySelectorAll('.global-search').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      const input = form.querySelector('input[name="q"]');
      const value = input ? input.value.trim() : '';
      if (!value) {
        event.preventDefault();
        return;
      }
      const root = form.getAttribute('data-search-root') || './';
      event.preventDefault();
      window.location.href = root + 'search.html?q=' + encodeURIComponent(value);
    });
  });

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  if (slides.length) {
    let index = 0;
    const show = function (next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    show(0);
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  const filterInput = document.querySelector('[data-filter-input]');
  const cards = Array.from(document.querySelectorAll('[data-filter-text]'));
  const empty = document.querySelector('[data-no-results]');
  if (filterInput && cards.length) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';
    if (query) {
      filterInput.value = query;
    }
    const apply = function () {
      const terms = filterInput.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      let shown = 0;
      cards.forEach(function (card) {
        const text = card.getAttribute('data-filter-text') || '';
        const match = terms.length === 0 || terms.every(function (term) {
          return text.indexOf(term) !== -1;
        });
        card.classList.toggle('hidden-card', !match);
        if (match) {
          shown += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('show', shown === 0);
      }
    };
    filterInput.addEventListener('input', apply);
    apply();
  }
})();
