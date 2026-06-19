/* Static interactions: navigation, hero carousel, filter panels. */
(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initNav() {
        var toggle = qs('.nav-toggle');
        var links = qs('.nav-links');
        if (!toggle || !links) {
            return;
        }
        toggle.addEventListener('click', function () {
            links.classList.toggle('is-open');
        });
    }

    function initHero() {
        var slides = qsa('[data-hero-slide]');
        var dots = qsa('[data-hero-dot]');
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });

        var prev = qs('[data-hero-prev]');
        var next = qs('[data-hero-next]');
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        start();
    }

    function normalize(text) {
        return String(text || '').toLowerCase().trim();
    }

    function initFilters() {
        qsa('[data-filter-scope]').forEach(function (form) {
            var section = form.closest('.section-block') || document;
            var list = qs('[data-filter-list]', section) || qs('[data-filter-list]');
            if (!list) {
                return;
            }
            var input = qs('[data-filter-input]', form);
            var year = qs('[data-filter-year]', form);
            var region = qs('[data-filter-region]', form);
            var count = qs('[data-filter-count]', form);
            var items = qsa('[data-title]', list);

            function applyFilter() {
                var keyword = normalize(input && input.value);
                var selectedYear = normalize(year && year.value);
                var selectedRegion = normalize(region && region.value);
                var visible = 0;

                items.forEach(function (item) {
                    var haystack = normalize([
                        item.dataset.title,
                        item.dataset.year,
                        item.dataset.region,
                        item.dataset.type,
                        item.dataset.genre,
                        item.dataset.tags
                    ].join(' '));
                    var itemYear = normalize(item.dataset.year);
                    var itemRegion = normalize(item.dataset.region);
                    var ok = true;

                    if (keyword && haystack.indexOf(keyword) === -1) {
                        ok = false;
                    }
                    if (selectedYear && itemYear !== selectedYear) {
                        ok = false;
                    }
                    if (selectedRegion && itemRegion !== selectedRegion) {
                        ok = false;
                    }
                    item.classList.toggle('is-hidden', !ok);
                    if (ok) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = visible + ' 部影片';
                }
            }

            ['input', 'change'].forEach(function (eventName) {
                if (input) {
                    input.addEventListener(eventName, applyFilter);
                }
                if (year) {
                    year.addEventListener(eventName, applyFilter);
                }
                if (region) {
                    region.addEventListener(eventName, applyFilter);
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initNav();
        initHero();
        initFilters();
    });
})();
