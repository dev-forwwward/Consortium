export function scrollVideo() {
    // SCROLL-SCRUBBED VIDEO
    const video = document.querySelector(".main-video_background");
    const videoLoop = document.querySelector('.video-loop_embed video');

    if (!video) {
        return
    }

    /* Hide + rewind the loop video once the page is scrolled, show + play it at the top */
    let loopHidden = false;

    if (videoLoop) {
        const loopWrapper = videoLoop.parentElement;

        // rewind only once the fade-out finishes, so the jump to frame 0 isn't visible
        loopWrapper.addEventListener('transitionend', (e) => {
            if (e.target === loopWrapper && e.propertyName === 'opacity' && loopHidden) {
                videoLoop.currentTime = 0;
            }
        });

        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY > 1;

            // Only act on state changes so play()/rewind don't fire on every scroll event
            if (scrolled === loopHidden) return;
            loopHidden = scrolled;

            if (scrolled) {
                loopWrapper.classList.add('hide');
                videoLoop.pause();
            } else {
                loopWrapper.classList.remove('hide');
                videoLoop.play().catch(() => { });
            }
        }, { passive: true });
    }

    /* Make sure the video is 'activated' on iOS */
    function once(el, event, fn, opts) {
        var onceFn = function (e) {
            el.removeEventListener(event, onceFn);
            fn.apply(this, arguments);
        };
        el.addEventListener(event, onceFn, opts);
        return onceFn;
    }

    function unlockOnTouch() {
        once(document.documentElement, "touchstart", function () {
            const playing = video.play();
            if (videoLoop && !loopHidden) { videoLoop.play().catch(() => { }) }
            if (playing) { playing.catch(() => { }) }
            video.pause();
        });
    }

    unlockOnTouch();

    /* ---------------------------------- */
    /* Seek queue
       Only one seek is in flight at a time: scroll updates just move the target, and the next
       seek is issued once the previous one lands ('seeked'). Setting currentTime on every tick
       floods Firefox with seeks it processes one by one, so it lags further and further behind.
       Every frame is a keyframe, so fastSeek (Firefox/Safari) lands on the exact frame and
       skips the slower accurate-seek path. */
    let targetTime = 0;
    let requestedTime = -1;
    let seeking = false;
    let swapping = false;

    function seekTo(time) {
        requestedTime = time;
        seeking = true;
        if (typeof video.fastSeek === "function") {
            video.fastSeek(time);
        } else {
            video.currentTime = time;
        }
    }

    function flushSeek() {
        if (seeking || swapping || video.readyState < 1) { return }
        if (Math.abs(targetTime - requestedTime) < 0.001) { return }
        seekTo(targetTime);
    }

    video.addEventListener("seeked", () => {
        seeking = false;
        flushSeek();
    });

    /* ---------------------------------- */
    /* Scroll Control! */

    gsap.registerPlugin(ScrollTrigger);

    function initScrub() {
        const duration = video.duration || 1;
        // stop just short of the end: seeking to exactly `duration` can show a blank frame
        const maxTime = Math.max(duration - 0.001, 0);

        ScrollTrigger.create({
            trigger: '.hp_video_space_wrapper',
            start: 'top top',
            end: 'bottom top',
            onUpdate: (self) => {
                targetTime = self.progress * maxTime;
                flushSeek();
            }
        });

        loadIntoMemory();
    }

    if (video.readyState >= 1) {
        initScrub();
    } else {
        once(video, "loadedmetadata", initScrub);
    }

    /* ---------------------------------- */
    /* Keep the whole video in memory
       Browsers can drop already-played ranges and re-request them over the network when
       scrubbing back, which shows up as stalls on replay. Once the file is fully fetched it's
       swapped in as a blob URL. currentSrc is only read after loadedmetadata (before that it
       can still be empty, since the sources are <source> children and video.src is ''). */
    function loadIntoMemory() {
        const src = video.currentSrc;

        if (!src || !window.fetch || src.startsWith("blob:")) {
            return
        }

        fetch(src)
            .then((response) => {
                if (!response.ok) { throw new Error(`Video fetch failed: ${response.status}`) }
                return response.blob();
            })
            .then((blob) => {
                if (!blob.type.startsWith("video/") && blob.type !== "application/octet-stream") {
                    throw new Error(`Unexpected video blob type: ${blob.type}`);
                }

                const blobURL = URL.createObjectURL(blob);

                // pause the seek queue while the element reloads; the target keeps updating
                swapping = true;

                function onSwapped() {
                    video.removeEventListener("error", onSwapFailed);
                    swapping = false;
                    seeking = false;
                    requestedTime = -1;
                    flushSeek();
                }

                // fall back to the <source> children so the scrub never stays frozen
                function onSwapFailed() {
                    video.removeEventListener("loadeddata", onSwapped);
                    URL.revokeObjectURL(blobURL);
                    video.removeAttribute("src");
                    video.load();
                    video.addEventListener("loadeddata", onSwapped, { once: true });
                }

                video.addEventListener("loadeddata", onSwapped, { once: true });
                video.addEventListener("error", onSwapFailed, { once: true });

                // the swap resets iOS's activation, so unlock again on the next touch
                unlockOnTouch();

                video.src = blobURL;
            })
            .catch((err) => {
                // keep streaming from the original source
                swapping = false;
                console.warn(err);
            });
    }
}
