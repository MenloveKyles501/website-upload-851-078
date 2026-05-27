(function () {
  var shells = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  shells.forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-play]');
    var stream = video ? video.getAttribute('data-stream') : '';
    var loaded = false;
    var instance = null;

    function load() {
      if (!video || !stream || loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        instance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        instance.loadSource(stream);
        instance.attachMedia(video);
        return;
      }

      video.src = stream;
    }

    function play() {
      load();
      shell.classList.add('is-playing');
      video.setAttribute('controls', 'controls');
      var request = video.play();

      if (request && typeof request.catch === 'function') {
        request.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });

      window.addEventListener('beforeunload', function () {
        if (instance) {
          instance.destroy();
        }
      });
    }
  });
})();
