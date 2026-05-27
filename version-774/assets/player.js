(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
    script.onload = callback;
    script.onerror = callback;
    document.head.appendChild(script);
  }

  function attach(video, src, done) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      done();
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, done);
      return;
    }
    video.src = src;
    done();
  }

  function setupPlayer(box) {
    var video = box.querySelector('video');
    var cover = box.querySelector('[data-play]');
    if (!video || !cover) {
      return;
    }
    var src = cover.getAttribute('data-hls');
    var started = false;

    function play() {
      if (!src) {
        return;
      }
      cover.classList.add('is-hidden');
      if (started) {
        video.play().catch(function () {});
        return;
      }
      started = true;
      loadHls(function () {
        attach(video, src, function () {
          video.play().catch(function () {});
        });
      });
    }

    cover.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
  });
})();
