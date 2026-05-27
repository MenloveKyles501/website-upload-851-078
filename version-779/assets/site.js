(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(
      slider.querySelectorAll(".hero-slide"),
    );
    var dots = Array.prototype.slice.call(
      slider.querySelectorAll("[data-slide-dot]"),
    );
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide-dot")) || 0);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupPlayers() {
    var frames = Array.prototype.slice.call(
      document.querySelectorAll("[data-player]"),
    );
    frames.forEach(function (frame) {
      var video = frame.querySelector("video");
      var button = frame.querySelector("[data-player-button]");
      var stream = frame.getAttribute("data-stream");
      var hlsInstance = null;
      var started = false;
      if (!video || !stream) {
        return;
      }
      function attach() {
        if (started) {
          return;
        }
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
      }
      function play() {
        attach();
        if (button) {
          button.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }
      if (button) {
        button.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        if (button) {
          button.classList.add("is-hidden");
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  function movieCard(movie) {
    var tags = movie.tags
      .slice(0, 3)
      .map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      })
      .join("");
    return [
      '<a class="movie-card" href="./' + movie.file + '">',
      '  <span class="poster-box">',
      '    <img src="' +
        movie.cover +
        '" alt="' +
        escapeHtml(movie.title) +
        '">',
      '    <span class="poster-type">' +
        escapeHtml(movie.type || movie.category) +
        "</span>",
      "  </span>",
      '  <span class="movie-card-body">',
      "    <strong>" + escapeHtml(movie.title) + "</strong>",
      "    <em>" + escapeHtml(movie.description) + "</em>",
      '    <span class="movie-meta">' +
        escapeHtml(movie.year + " · " + movie.region + " · " + movie.genre) +
        "</span>",
      '    <span class="tag-row">' + tags + "</span>",
      "  </span>",
      "</a>",
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
      }[char];
    });
  }

  function setupSearch() {
    var page = document.querySelector("[data-search-page]");
    if (!page || !window.SEARCH_MOVIES) {
      return;
    }
    var input = page.querySelector("[data-search-input]");
    var typeFilter = page.querySelector("[data-type-filter]");
    var regionFilter = page.querySelector("[data-region-filter]");
    var results = page.querySelector("[data-search-results]");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (input) {
      input.value = initial;
    }
    function render() {
      var keyword = ((input && input.value) || "").trim().toLowerCase();
      var typeValue = (typeFilter && typeFilter.value) || "";
      var regionValue = (regionFilter && regionFilter.value) || "";
      var matches = window.SEARCH_MOVIES.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.description,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          movie.category,
          movie.tags.join(" "),
        ]
          .join(" ")
          .toLowerCase();
        if (keyword && haystack.indexOf(keyword) === -1) {
          return false;
        }
        if (typeValue && movie.type !== typeValue) {
          return false;
        }
        if (regionValue && movie.region !== regionValue) {
          return false;
        }
        return true;
      }).slice(0, 96);
      results.innerHTML = matches.map(movieCard).join("");
    }
    [input, typeFilter, regionFilter].forEach(function (control) {
      if (control) {
        control.addEventListener("input", render);
        control.addEventListener("change", render);
      }
    });
    render();
  }

  onReady(function () {
    setupMenu();
    setupHero();
    setupPlayers();
    setupSearch();
  });
})();
