(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-mobile-nav]');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var active = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    active = (index + slides.length) % slides.length;

    slides.forEach(function (slide, current) {
      slide.classList.toggle('is-active', current === active);
    });

    dots.forEach(function (dot, current) {
      dot.classList.toggle('is-active', current === active);
    });
  }

  function startCarousel() {
    if (slides.length < 2) {
      return;
    }

    timer = window.setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      if (timer) {
        window.clearInterval(timer);
      }

      showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      startCarousel();
    });
  });

  showSlide(0);
  startCarousel();

  var filterBoxes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-box]'));

  filterBoxes.forEach(function (box) {
    var input = box.querySelector('[data-filter-input]');
    var year = box.querySelector('[data-filter-year]');
    var list = document.querySelector('[data-filter-list]');
    var items = list ? Array.prototype.slice.call(list.querySelectorAll('.movie-item')) : [];

    function runFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var yearValue = year ? year.value : '';

      items.forEach(function (item) {
        var text = [
          item.getAttribute('data-title'),
          item.getAttribute('data-region'),
          item.getAttribute('data-type'),
          item.getAttribute('data-genre'),
          item.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var itemYear = item.getAttribute('data-year') || '';
        var matched = (!query || text.indexOf(query) !== -1) && (!yearValue || itemYear === yearValue);

        item.classList.toggle('is-hidden', !matched);
      });
    }

    if (input) {
      input.addEventListener('input', runFilter);
    }

    if (year) {
      year.addEventListener('change', runFilter);
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q');

    if (initial && input) {
      input.value = initial;
      runFilter();
    }
  });
})();
