export function scrollVideoAlt() {

    // SCROLL-SCRUBBED VIDEO
    const container = document.querySelector('.scroll-video');
    if (!container) return;

    const video = container.querySelector('.video_background video');
    if (!video) return;

    // Take manual control of playback — the scrub drives currentTime instead
    video.autoplay = false;
    video.loop = false;
    video.pause();

    // iOS Safari blocks currentTime scrubbing until the video has had a
    // user-gesture-triggered play/pause — unlock it on first touch.
    const once = (el, event, fn, opts) => {
        const onceFn = (e) => {
            el.removeEventListener(event, onceFn);
            fn.apply(this, arguments);
        };
        el.addEventListener(event, onceFn, opts);
        return onceFn;
    };

    once(document.documentElement, 'touchstart', () => {
        video.play();
        video.pause();
    });

    const fps = parseFloat(container.dataset.fps) || 30;
    const frameDuration = 1 / fps;

    function whenReady() {
        return new Promise((resolve) => {
            const ready = () => {
                const duration = video.duration ? video.duration : 10;
                resolve(duration);
            }

            if (video.readyState >= 1) {
                ready();
            } else {
                video.addEventListener('loadedmetadata', ready, { once: true });
            }
        });
    }

    whenReady().then((duration) => {
        const proxy = {
            time: 0,
        }

        let lastTime = -1;
        let pendingTime = null;

        // Never overlap seeks — a new currentTime assignment while one is
        // still resolving makes the browser abandon the in-flight frame,
        // which is what reads as skipping/stutter during fast scrubs.
        const seekTo = (t) => {
            if (video.seeking) {
                pendingTime = t;
                return;
            }
            video.currentTime = t;
            lastTime = t;
        };

        video.addEventListener('seeked', () => {
            if (pendingTime !== null) {
                const t = pendingTime;
                pendingTime = null;
                seekTo(t);
            }
        });

        const setFrame = () => {
            const t = proxy.time;

            // Skip redundant seeks smaller than a single frame's worth of time
            if (Math.abs(t - lastTime) >= frameDuration) {
                seekTo(t);
            }
        }

        const tl = gsap.timeline({
            defaults: {
                ease: 'none'
            },
            scrollTrigger: {
                trigger: '.hp_video_space_wrapper',
                start: 'top top',
                end: 'bottom bottom',
                scrub: .6,
                // markers: true,
            }
        });

        tl.to(proxy, {
            time: duration,
            duration: duration,
            onUpdate: setFrame,
        });

        setFrame();
        ScrollTrigger.refresh();
    });
}
