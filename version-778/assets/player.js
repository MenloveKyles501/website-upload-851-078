(function () {
  function begin(player) {
    var video = player.querySelector("video");
    var overlay = player.querySelector(".player-overlay");
    var error = player.querySelector(".player-error");
    var stream = player.getAttribute("data-stream");
    if (!video || !stream || player.getAttribute("data-started") === "1") {
      return;
    }
    player.setAttribute("data-started", "1");
    if (overlay) {
      overlay.classList.add("hidden");
    }
    function showError() {
      if (error) {
        error.textContent = "播放暂不可用，请稍后再试";
        error.classList.add("is-visible");
      }
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      video.play().catch(showError);
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(showError);
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          showError();
        }
      });
      return;
    }
    video.src = stream;
    video.play().catch(showError);
  }

  document.querySelectorAll("[data-player]").forEach(function (player) {
    var video = player.querySelector("video");
    var overlay = player.querySelector(".player-overlay");
    var buttons = Array.prototype.slice.call(player.querySelectorAll(".player-button"));
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        begin(player);
      });
    });
    if (overlay) {
      overlay.addEventListener("click", function () {
        begin(player);
      });
    }
    if (video) {
      video.addEventListener("click", function () {
        if (player.getAttribute("data-started") !== "1") {
          begin(player);
        }
      });
    }
  });
})();
