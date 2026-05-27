
(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".main-nav");

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var carousel = document.querySelector("[data-carousel]");

    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
      var prev = carousel.querySelector(".hero-prev");
      var next = carousel.querySelector(".hero-next");
      var current = 0;
      var timer = null;

      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === current);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          restart();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          restart();
        });
      }

      restart();
    }

    var filterInput = document.querySelector(".filter-input");

    if (filterInput) {
      var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-grid .movie-card"));
      filterInput.addEventListener("input", function () {
        var value = filterInput.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year")
          ].join(" ").toLowerCase();
          card.classList.toggle("is-hidden-card", value && haystack.indexOf(value) === -1);
        });
      });
    }

    var searchInput = document.getElementById("searchInput");
    var searchResults = document.getElementById("searchResults");
    var searchStatus = document.getElementById("searchStatus");

    if (searchInput && searchResults && searchStatus && window.SEARCH_INDEX) {
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q") || "";
      searchInput.value = initial;

      function cardTemplate(item) {
        return [
          '<article class="movie-card">',
          '  <a class="movie-cover" href="' + item.href + '" aria-label="' + escapeHtml(item.title) + '">',
          '    <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
          '    <span class="play-mark">▶</span>',
          '  </a>',
          '  <div class="movie-body">',
          '    <div class="movie-tags"><span>' + escapeHtml(item.category) + '</span><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span></div>',
          '    <h3><a href="' + item.href + '">' + escapeHtml(item.title) + '</a></h3>',
          '    <p>' + escapeHtml(item.oneLine || item.genre || "") + '</p>',
          '  </div>',
          '</article>'
        ].join("");
      }

      function escapeHtml(text) {
        return String(text || "").replace(/[&<>"]/g, function (value) {
          return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;"
          }[value];
        });
      }

      function runSearch() {
        var value = searchInput.value.trim().toLowerCase();
        var results = [];

        if (value) {
          results = window.SEARCH_INDEX.filter(function (item) {
            var haystack = [item.title, item.year, item.region, item.genre, item.category, item.oneLine].join(" ").toLowerCase();
            return haystack.indexOf(value) !== -1;
          }).slice(0, 80);
        } else {
          results = window.SEARCH_INDEX.slice(0, 40);
        }

        searchResults.innerHTML = results.map(cardTemplate).join("");
        searchStatus.textContent = value ? "搜索结果" : "热门推荐";
      }

      searchInput.addEventListener("input", runSearch);
      runSearch();
    }
  });
})();
