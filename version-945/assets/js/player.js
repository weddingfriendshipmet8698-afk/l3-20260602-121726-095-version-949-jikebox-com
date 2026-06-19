(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-hls-player]"));

    players.forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector("[data-play-button]");
      var status = shell.querySelector("[data-player-status]");
      var src = shell.getAttribute("data-src");
      var started = false;

      if (!video || !button || !src) {
        return;
      }

      button.addEventListener("click", function () {
        if (!started) {
          started = true;
          setupSource(video, src, status);
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            updateStatus(status, "浏览器阻止了自动播放，请再次点击播放器播放。");
          });
        }
      });

      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
        updateStatus(status, "正在播放");
      });

      video.addEventListener("pause", function () {
        shell.classList.remove("is-playing");
        updateStatus(status, "已暂停，可再次点击播放。");
      });

      video.addEventListener("error", function () {
        updateStatus(status, "视频加载失败，请检查 m3u8 地址或网络连接。");
      });
    });
  });

  function setupSource(video, src, status) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      updateStatus(status, "已使用浏览器原生 HLS 播放。");
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        updateStatus(status, "HLS 清单已加载，准备播放。");
      });

      hls.on(window.Hls.Events.ERROR, function (eventName, data) {
        if (data && data.fatal) {
          updateStatus(status, "HLS 播放发生错误，请检查播放源。" );
          hls.destroy();
        }
      });

      return;
    }

    updateStatus(status, "当前浏览器不支持 HLS 播放，请使用现代浏览器访问。");
  }

  function updateStatus(node, message) {
    if (node) {
      node.textContent = message;
    }
  }
})();
