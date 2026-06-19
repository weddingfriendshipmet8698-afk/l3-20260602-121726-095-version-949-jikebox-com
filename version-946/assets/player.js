export function initVideo(videoId, buttonId, streamUrl) {
  const video = document.getElementById(videoId);
  const button = document.getElementById(buttonId);
  const box = video ? video.closest('.player-box') : null;
  let hlsInstance = null;
  let prepared = false;

  if (!video || !button || !streamUrl) {
    return;
  }

  const prepare = () => {
    if (prepared) {
      return;
    }

    prepared = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  };

  const start = () => {
    prepare();
    button.classList.add('is-hidden');
    if (box) {
      box.classList.add('is-playing');
    }
    video.controls = true;
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        button.classList.remove('is-hidden');
        if (box) {
          box.classList.remove('is-playing');
        }
      });
    }
  };

  button.addEventListener('click', start);

  if (box) {
    box.addEventListener('click', (event) => {
      if (event.target === button || button.contains(event.target)) {
        return;
      }
      if (video.paused) {
        start();
      }
    });
  }

  video.addEventListener('play', () => {
    button.classList.add('is-hidden');
    if (box) {
      box.classList.add('is-playing');
    }
  });

  video.addEventListener('pause', () => {
    if (!video.ended) {
      return;
    }
    button.classList.remove('is-hidden');
    if (box) {
      box.classList.remove('is-playing');
    }
  });

  window.addEventListener('pagehide', () => {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
