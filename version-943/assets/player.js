import { H as Hls } from './hls.mjs';

(function () {
  document.querySelectorAll('.video-shell').forEach(function (shell) {
    const video = shell.querySelector('video');
    const button = shell.querySelector('.player-overlay');
    const stream = shell.getAttribute('data-stream');
    let hls = null;
    let ready = false;

    const bind = function () {
      if (!video || !stream || ready) {
        return;
      }
      if (Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      }
      ready = true;
    };

    const play = function () {
      bind();
      shell.classList.add('is-playing');
      video.controls = true;
      video.play().catch(function () {});
    };

    if (button && video) {
      button.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (!ready) {
          play();
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  });
})();
