(function () {
  function rootPath(path) {
    var root = document.body.getAttribute("data-root") || ".";
    if (root === ".") {
      return "./" + path;
    }
    return root + "/" + path;
  }

  function setHidden(element, hidden) {
    if (!element) {
      return;
    }
    element.hidden = hidden;
  }

  var toggle = document.querySelector(".nav-toggle");
  var mobileNav = document.querySelector(".mobile-nav");
  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var open = mobileNav.hidden;
      mobileNav.hidden = !open;
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
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

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    show(0);
    start();
  });

  document.querySelectorAll("[data-local-filter]").forEach(function (input) {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        card.classList.toggle("is-hidden", query && text.indexOf(query) === -1);
      });
    });
  });

  var panel = document.querySelector("[data-search-panel]");
  var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));

  function renderSearch(query) {
    if (!panel) {
      return;
    }
    var value = query.trim().toLowerCase();
    if (!value) {
      setHidden(panel, true);
      panel.innerHTML = "";
      return;
    }
    var source = window.SITE_SEARCH || [];
    var results = source.filter(function (item) {
      return item.s.toLowerCase().indexOf(value) !== -1;
    }).slice(0, 12);
    var content = "<h3>搜索结果</h3>";
    if (!results.length) {
      content += "<div class=\"search-empty\">未找到匹配影片</div>";
    } else {
      content += results.map(function (item) {
        return [
          "<a class=\"search-result\" href=\"" + rootPath(item.u) + "\">",
          "<img src=\"" + rootPath(item.c + ".jpg") + "\" alt=\"" + item.t.replace(/\"/g, "&quot;") + "\">",
          "<span><strong>" + item.t + "</strong><small>" + item.y + " · " + item.r + " · " + item.g + "</small></span>",
          "</a>"
        ].join("");
      }).join("");
    }
    panel.innerHTML = content;
    setHidden(panel, false);
  }

  forms.forEach(function (form) {
    var input = form.querySelector("input[type='search']");
    if (!input) {
      return;
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      renderSearch(input.value);
    });
    input.addEventListener("input", function () {
      renderSearch(input.value);
    });
    input.addEventListener("focus", function () {
      renderSearch(input.value);
    });
  });

  document.addEventListener("click", function (event) {
    if (!panel || panel.hidden) {
      return;
    }
    var insidePanel = panel.contains(event.target);
    var insideForm = forms.some(function (form) {
      return form.contains(event.target);
    });
    if (!insidePanel && !insideForm) {
      setHidden(panel, true);
    }
  });
})();
