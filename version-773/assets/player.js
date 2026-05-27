
(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var video = document.querySelector(".movie-video");
    var posterButton = document.querySelector(".video-poster");
    var configNode = document.getElementById("media-config");

    if (!video || !posterButton || !configNode) {
      return;
    }

    var config = {};

    try {
      config = JSON.parse(configNode.textContent || "{}");
    } catch (error) {
      config = {};
    }

    var source = config.src;
    var hlsInstance = null;
    var activated = false;

    function attachSource() {
      if (!source || activated) {
        return;
      }

      activated = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function playMovie() {
      attachSource();
      posterButton.classList.add("is-hidden");
      video.controls = true;

      var playRequest = video.play();
      if (playRequest && typeof playRequest.catch === "function") {
        playRequest.catch(function () {
          video.muted = true;
          video.play().catch(function () {});
        });
      }
    }

    posterButton.addEventListener("click", playMovie);
    video.addEventListener("click", function () {
      if (!activated || video.paused) {
        playMovie();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  });
})();
