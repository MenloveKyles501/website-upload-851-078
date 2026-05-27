import { H as Hls } from "./hls-vendor-dru42stk.js";

function setupPlayer(root) {
  var video = root.querySelector("video");
  var button = root.querySelector("[data-play-button]");
  var overlay = root.querySelector(".player-overlay");
  var source = root.getAttribute("data-src");
  var ready = false;
  var hls = null;

  function loadSource() {
    if (ready || !video || !source) {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
    ready = true;
  }

  function hideOverlay() {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  }

  function showOverlay() {
    if (overlay && video && video.paused) {
      overlay.classList.remove("is-hidden");
    }
  }

  function playVideo() {
    loadSource();
    hideOverlay();
    var attempt = video.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(showOverlay);
    }
  }

  if (button) {
    button.addEventListener("click", playVideo);
  }

  if (overlay) {
    overlay.addEventListener("click", playVideo);
  }

  if (video) {
    video.addEventListener("play", hideOverlay);
    video.addEventListener("pause", showOverlay);
    video.addEventListener("ended", showOverlay);
  }

  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("[data-player]").forEach(setupPlayer);
});
