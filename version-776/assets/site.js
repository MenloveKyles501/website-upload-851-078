(function () {
  function query(selector, root) {
    return Array.prototype.slice.call(
      (root || document).querySelectorAll(selector),
    );
  }

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = query("[data-hero-slide]", hero);
    var dots = query("[data-hero-dot]", hero);
    var previous = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (previous) {
      previous.addEventListener("click", function () {
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

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });

    show(0);
    restart();
  }

  function setupFilters() {
    var panels = query("[data-filter-panel]");
    panels.forEach(function (panel) {
      var form = panel.querySelector("[data-grid-search]");
      var grid = document.querySelector("[data-filter-grid]");
      if (!form || !grid) {
        return;
      }
      var cards = query("[data-movie-card]", grid);
      var count = panel.querySelector("[data-visible-count]");
      var empty = document.querySelector("[data-empty-state]");
      var params = new URLSearchParams(window.location.search);
      var controls = query("[data-filter]", form);

      controls.forEach(function (control) {
        var key = control.getAttribute("data-filter");
        if (params.has(key)) {
          control.value = params.get(key) || "";
        }
      });

      if (params.has("q")) {
        controls.forEach(function (control) {
          if (control.getAttribute("data-filter") === "q") {
            control.value = params.get("q") || "";
          }
        });
      }

      function values() {
        var result = {};
        controls.forEach(function (control) {
          result[control.getAttribute("data-filter")] = (control.value || "")
            .trim()
            .toLowerCase();
        });
        return result;
      }

      function matches(card, filterValues) {
        var search = (card.getAttribute("data-search") || "").toLowerCase();
        var region = (card.getAttribute("data-region") || "").toLowerCase();
        var type = (card.getAttribute("data-type") || "").toLowerCase();
        var year = (card.getAttribute("data-year") || "").toLowerCase();
        if (filterValues.q && search.indexOf(filterValues.q) === -1) {
          return false;
        }
        if (filterValues.region && region !== filterValues.region) {
          return false;
        }
        if (filterValues.type && type !== filterValues.type) {
          return false;
        }
        if (filterValues.year && year.indexOf(filterValues.year) === -1) {
          return false;
        }
        return true;
      }

      function apply() {
        var filterValues = values();
        var visible = 0;
        cards.forEach(function (card) {
          var show = matches(card, filterValues);
          card.style.display = show ? "" : "none";
          if (show) {
            visible += 1;
          }
        });
        if (count) {
          count.textContent = String(visible);
        }
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      controls.forEach(function (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      });

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        apply();
      });

      apply();
    });
  }

  function setupSearchForms() {
    query("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function () {
        var input = form.querySelector('input[name="q"]');
        if (input) {
          input.value = input.value.trim();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
    setupSearchForms();
  });
})();
