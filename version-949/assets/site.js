(function() {
    var menuToggle = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function() {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dotsWrap = document.querySelector('.hero-dots');
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function(slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
        dots.forEach(function(dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    function startHero() {
        if (timer || slides.length < 2) {
            return;
        }
        timer = setInterval(function() {
            showSlide(current + 1);
        }, 5200);
    }

    function stopHero() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    }

    if (slides.length && dotsWrap) {
        slides.forEach(function(_, index) {
            var dot = document.createElement('button');
            dot.type = 'button';
            dot.setAttribute('aria-label', '切换推荐影片');
            dot.addEventListener('click', function() {
                showSlide(index);
                stopHero();
                startHero();
            });
            dotsWrap.appendChild(dot);
        });
        var prev = document.querySelector('.hero-prev');
        var next = document.querySelector('.hero-next');
        if (prev) {
            prev.addEventListener('click', function() {
                showSlide(current - 1);
                stopHero();
                startHero();
            });
        }
        if (next) {
            next.addEventListener('click', function() {
                showSlide(current + 1);
                stopHero();
                startHero();
            });
        }
        showSlide(0);
        startHero();
    }

    var searchInput = document.querySelector('[data-search-input]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var sortableButton = document.querySelector('[data-sort-button]');

    function filterCards() {
        var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var year = yearFilter ? yearFilter.value : '';
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        cards.forEach(function(card) {
            var haystack = (card.getAttribute('data-search') || '').toLowerCase();
            var cardYear = card.getAttribute('data-year') || '';
            var matchQuery = !query || haystack.indexOf(query) !== -1;
            var matchYear = !year || cardYear === year;
            card.classList.toggle('is-filtered-out', !(matchQuery && matchYear));
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterCards);
    }

    if (yearFilter) {
        yearFilter.addEventListener('change', filterCards);
    }

    if (sortableButton) {
        sortableButton.addEventListener('click', function() {
            var grids = Array.prototype.slice.call(document.querySelectorAll('.searchable-grid, .ranking-list-page'));
            grids.forEach(function(grid) {
                var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
                cards.sort(function(a, b) {
                    return Number(b.getAttribute('data-score') || 0) - Number(a.getAttribute('data-score') || 0);
                });
                cards.forEach(function(card) {
                    grid.appendChild(card);
                });
            });
            filterCards();
        });
    }
})();

function initMoviePlayer(sourceUrl) {
    var video = document.getElementById('moviePlayer');
    var overlay = document.querySelector('.player-overlay');
    var hlsInstance = null;
    var isReady = false;

    if (!video || !sourceUrl) {
        return;
    }

    function attachSource() {
        if (isReady) {
            return;
        }
        isReady = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = sourceUrl;
        }
    }

    function beginPlay() {
        attachSource();
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function() {});
        }
    }

    if (overlay) {
        overlay.addEventListener('click', beginPlay);
    }

    video.addEventListener('click', function() {
        if (!isReady || video.paused) {
            beginPlay();
        }
    });

    video.addEventListener('play', function() {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    });

    window.addEventListener('pagehide', function() {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}
