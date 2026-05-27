(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function initMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    function initHero() {
        var root = document.querySelector('[data-hero]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        var next = root.querySelector('[data-hero-next]');
        var prev = root.querySelector('[data-hero-prev]');
        var index = 0;
        var timer = null;

        function show(target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
        scopes.forEach(function (scope) {
            var text = scope.querySelector('[data-filter-text]');
            var region = scope.querySelector('[data-filter-region]');
            var year = scope.querySelector('[data-filter-year]');
            var reset = scope.querySelector('[data-filter-reset]');
            var section = scope.closest('section');
            var cards = section ? Array.prototype.slice.call(section.querySelectorAll('.movie-card')) : [];

            function apply() {
                var q = text ? text.value.trim().toLowerCase() : '';
                var selectedRegion = region ? region.value : '';
                var selectedYear = year ? year.value : '';
                cards.forEach(function (card) {
                    var title = (card.getAttribute('data-title') || '').toLowerCase();
                    var cardRegion = card.getAttribute('data-region') || '';
                    var cardYear = card.getAttribute('data-year') || '';
                    var cardGenre = (card.getAttribute('data-genre') || '').toLowerCase();
                    var matchesText = !q || title.indexOf(q) > -1 || cardGenre.indexOf(q) > -1;
                    var matchesRegion = !selectedRegion || cardRegion === selectedRegion;
                    var matchesYear = !selectedYear || cardYear === selectedYear;
                    card.hidden = !(matchesText && matchesRegion && matchesYear);
                });
            }

            [text, region, year].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });

            if (reset) {
                reset.addEventListener('click', function () {
                    if (text) {
                        text.value = '';
                    }
                    if (region) {
                        region.value = '';
                    }
                    if (year) {
                        year.value = '';
                    }
                    apply();
                });
            }
        });
    }

    function initSearchPage() {
        var root = document.querySelector('[data-search-page]');
        if (!root || !window.MOVIE_SEARCH_DATA) {
            return;
        }
        var form = root.querySelector('[data-search-form]');
        var input = root.querySelector('[data-search-input]');
        var status = root.querySelector('[data-search-status]');
        var results = root.querySelector('[data-search-results]');
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';

        function createCard(movie) {
            var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
                return '<span class="tag">' + escapeHtml(tag) + '</span>';
            }).join('');
            return '<article class="movie-card">' +
                '<a class="poster-link" href="' + movie.file + '" aria-label="' + escapeHtml(movie.title) + '">' +
                    '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                    '<span class="poster-shade"></span>' +
                    '<span class="heat-badge">热度 ' + movie.heat + '</span>' +
                '</a>' +
                '<div class="movie-card-body">' +
                    '<a class="movie-title" href="' + movie.file + '">' + escapeHtml(movie.title) + '</a>' +
                    '<div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + movie.year + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
                    '<p class="movie-desc">' + escapeHtml(movie.oneLine) + '</p>' +
                    '<div class="tag-row">' + tags + '</div>' +
                '</div>' +
            '</article>';
        }

        function escapeHtml(value) {
            return String(value || '').replace(/[&<>"]/g, function (char) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;'
                }[char];
            });
        }

        function search(query) {
            var q = String(query || '').trim().toLowerCase();
            var list = window.MOVIE_SEARCH_DATA;
            var matched = q ? list.filter(function (movie) {
                return movie.title.toLowerCase().indexOf(q) > -1 ||
                    movie.region.toLowerCase().indexOf(q) > -1 ||
                    String(movie.year).indexOf(q) > -1 ||
                    movie.type.toLowerCase().indexOf(q) > -1 ||
                    movie.genre.toLowerCase().indexOf(q) > -1 ||
                    movie.tags.join(' ').toLowerCase().indexOf(q) > -1;
            }) : list.slice(0, 60);
            var display = matched.slice(0, 120);
            results.innerHTML = display.map(createCard).join('');
            status.textContent = q ? '找到 ' + matched.length + ' 个结果，当前显示 ' + display.length + ' 个。' : '默认显示 60 部影片，可输入关键词继续搜索。';
        }

        if (initial && input) {
            input.value = initial;
        }

        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                search(input ? input.value : '');
            });
        }

        if (input) {
            input.addEventListener('input', function () {
                search(input.value);
            });
        }

        search(input ? input.value : '');
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (shell) {
            var video = shell.querySelector('video');
            var trigger = shell.querySelector('[data-play-trigger]');
            if (!video || !trigger) {
                return;
            }
            var source = video.getAttribute('data-src');
            var loaded = false;

            function load() {
                if (loaded || !source) {
                    return Promise.resolve();
                }
                loaded = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    return Promise.resolve();
                }
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    return new Promise(function (resolve) {
                        hls.on(window.Hls.Events.MANIFEST_PARSED, resolve);
                        window.setTimeout(resolve, 1200);
                    });
                }
                video.src = source;
                return Promise.resolve();
            }

            function play() {
                load().then(function () {
                    shell.classList.add('is-playing');
                    var attempt = video.play();
                    if (attempt && typeof attempt.catch === 'function') {
                        attempt.catch(function () {
                            shell.classList.remove('is-playing');
                        });
                    }
                });
            }

            trigger.addEventListener('click', play);
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (!video.ended) {
                    shell.classList.remove('is-playing');
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initSearchPage();
        initPlayers();
    });
}());
