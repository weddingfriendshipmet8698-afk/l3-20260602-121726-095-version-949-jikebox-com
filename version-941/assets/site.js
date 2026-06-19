(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var button = document.querySelector('.mobile-toggle');
    var nav = document.querySelector('.main-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('.hero-slide', hero);
    var dots = selectAll('.hero-dot', hero);
    var current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupFilters() {
    selectAll('.filter-list').forEach(function (list) {
      var section = list.closest('section') || document;
      var input = section.querySelector('.movie-search');
      var year = section.querySelector('.movie-year-filter');
      var cards = selectAll('.movie-card', list);

      function apply() {
        var text = normalize(input ? input.value : '');
        var selectedYear = year ? year.value : '';
        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.year,
            card.dataset.region,
            card.dataset.genre,
            card.dataset.type
          ].join(' '));
          var matchedText = !text || haystack.indexOf(text) !== -1;
          var matchedYear = !selectedYear || card.dataset.year === selectedYear;
          card.classList.toggle('hidden-card', !(matchedText && matchedYear));
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (year) {
        year.addEventListener('change', apply);
      }
    });
  }

  function playVideo(video, cover, url) {
    if (!video || !url) {
      return;
    }
    if (cover) {
      cover.classList.add('hidden');
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.src) {
        video.src = url;
      }
      video.play().catch(function () {});
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (!video._hlsBound) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        video._hlsBound = true;
      }
      video.play().catch(function () {});
      return;
    }
    if (!video.src) {
      video.src = url;
    }
    video.play().catch(function () {});
  }

  window.MovieSite = {
    initPlayer: function (url) {
      var shell = document.querySelector('.video-shell');
      if (!shell) {
        return;
      }
      var video = shell.querySelector('.movie-video');
      var cover = shell.querySelector('.player-cover');
      if (cover) {
        cover.addEventListener('click', function () {
          playVideo(video, cover, url);
        });
      }
      if (video) {
        video.addEventListener('click', function () {
          playVideo(video, cover, url);
        });
      }
    }
  };

  setupMobileMenu();
  setupHero();
  setupFilters();
})();
