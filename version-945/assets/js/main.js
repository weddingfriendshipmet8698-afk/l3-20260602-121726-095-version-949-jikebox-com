(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupFilterPanels();
    setupSearchPage();
  });

  function setupMobileMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");

    if (!button || !menu) {
      return;
    }

    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function setupFilterPanels() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));

    panels.forEach(function (panel) {
      var grid = document.querySelector("[data-filter-grid]");
      var keywordInput = panel.querySelector("[data-filter-keyword]");
      var genreSelect = panel.querySelector("[data-filter-genre]");
      var regionSelect = panel.querySelector("[data-filter-region]");
      var sortSelect = panel.querySelector("[data-sort-select]");
      var countNode = panel.querySelector("[data-filter-count]");

      if (!grid) {
        return;
      }

      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

      function normalize(value) {
        return String(value || "").toLowerCase().trim();
      }

      function cardText(card) {
        return normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.category,
          card.textContent
        ].join(" "));
      }

      function apply() {
        var keyword = normalize(keywordInput && keywordInput.value);
        var genre = normalize(genreSelect && genreSelect.value);
        var region = normalize(regionSelect && regionSelect.value);
        var visibleCards = [];

        cards.forEach(function (card) {
          var matched = true;

          if (keyword && cardText(card).indexOf(keyword) === -1) {
            matched = false;
          }

          if (genre && normalize(card.dataset.genre).indexOf(genre) === -1) {
            matched = false;
          }

          if (region && normalize(card.dataset.region).indexOf(region) === -1) {
            matched = false;
          }

          card.hidden = !matched;

          if (matched) {
            visibleCards.push(card);
          }
        });

        sortCards(visibleCards, sortSelect ? sortSelect.value : "default", grid);

        if (countNode) {
          countNode.textContent = "共 " + visibleCards.length + " 部";
        }
      }

      [keywordInput, genreSelect, regionSelect, sortSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      apply();
    });
  }

  function sortCards(cards, mode, grid) {
    var sorted = cards.slice();

    if (mode === "year-desc") {
      sorted.sort(function (a, b) {
        return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
      });
    }

    if (mode === "heat-desc") {
      sorted.sort(function (a, b) {
        return Number(b.dataset.heat || 0) - Number(a.dataset.heat || 0);
      });
    }

    if (mode === "rating-desc") {
      sorted.sort(function (a, b) {
        return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
      });
    }

    sorted.forEach(function (card) {
      grid.appendChild(card);
    });
  }

  function setupSearchPage() {
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    var results = document.querySelector("[data-search-results]");
    var summary = document.querySelector("[data-search-summary]");

    if (!form || !input || !results || !summary || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    input.value = initialQuery;

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      renderSearch(input.value);
    });

    input.addEventListener("input", function () {
      renderSearch(input.value);
    });

    renderSearch(initialQuery);

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function renderSearch(query) {
      var keyword = normalize(query);

      if (!keyword) {
        results.innerHTML = "";
        summary.textContent = "请输入关键词开始搜索。";
        return;
      }

      var matched = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          movie.category,
          movie.oneLine,
          movie.summary,
          (movie.tags || []).join(" ")
        ].join(" "));

        return haystack.indexOf(keyword) !== -1;
      }).slice(0, 120);

      summary.textContent = "找到 " + matched.length + " 条相关结果";
      results.innerHTML = matched.map(renderSearchCard).join("");
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function renderSearchCard(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");

      return [
        "<article class=\"movie-card movie-card-compact\" data-heat=\"" + escapeHtml(movie.heat) + "\" data-rating=\"" + escapeHtml(movie.rating) + "\" data-year=\"" + escapeHtml(movie.year) + "\">",
        "  <a class=\"poster-wrap\" href=\"" + escapeHtml(movie.url) + "\">",
        "    <img src=\"" + escapeHtml(movie.poster) + "\" alt=\"" + escapeHtml(movie.title) + "海报\" loading=\"lazy\">",
        "    <span class=\"poster-shade\"></span>",
        "    <span class=\"play-mark\">▶</span>",
        "  </a>",
        "  <div class=\"movie-card-body\">",
        "    <div class=\"movie-meta-line\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>",
        "    <h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>",
        "    <p>" + escapeHtml(movie.oneLine) + "</p>",
        "    <div class=\"tag-list\">" + tags + "</div>",
        "    <div class=\"card-bottom\"><span>" + escapeHtml(movie.category) + "</span><strong>评分 " + escapeHtml(movie.rating) + "</strong></div>",
        "  </div>",
        "</article>"
      ].join("");
    }
  }
})();
