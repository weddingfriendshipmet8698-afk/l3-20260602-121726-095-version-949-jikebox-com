/* HLS player initializer. Uses the uploaded hls module and falls back to native playback. */
async function loadHlsModule() {
    try {
        var module = await import('./hls.js');
        return module.H || module.default || null;
    } catch (error) {
        console.warn('HLS module load failed, falling back to native video source.', error);
        return null;
    }
}

function canPlayNative(video) {
    return Boolean(video.canPlayType('application/vnd.apple.mpegurl'));
}

async function startPlayer(frame) {
    var video = frame.querySelector('video');
    var source = frame.getAttribute('data-src');
    if (!video || !source) {
        return;
    }

    frame.classList.add('is-playing');
    video.controls = true;

    if (canPlayNative(video)) {
        video.src = source;
        video.play().catch(function () {});
        return;
    }

    var Hls = await loadHlsModule();
    if (Hls && Hls.isSupported && Hls.isSupported()) {
        var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
        });
        frame.__hlsInstance = hls;
        return;
    }

    video.src = source;
    video.play().catch(function () {});
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-player]').forEach(function (frame) {
        var button = frame.querySelector('.player-start');
        if (button) {
            button.addEventListener('click', function () {
                startPlayer(frame);
            });
        }
    });
});
