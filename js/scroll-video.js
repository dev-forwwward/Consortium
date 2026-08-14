export function scrollVideo() {

    console.log("running scroll-video.js");

    // SCROLL-SCRUBBED FRAME SEQUENCE
    const container = document.querySelector('.scroll-video');
    if (!container) return;

    console.log("found container in scroll-video.js");

    const frameImg = container.querySelector('.bg_img');
    const frameCount = parseInt(container.dataset.frameCount, 10);
    const base = container.dataset.frameBase;
    const ext = container.dataset.frameExt || 'webp';

    if (!frameImg || !frameCount || !base) return;

    console.log("frame image, framecount and base found");

    const frames = Array.from({ length: frameCount }, (_, i) =>
        `${base}/frame-${String(i + 1).padStart(4, '0')}.${ext}`
    );

    // Preload every frame so scrubbing is smooth from the first scroll
    frames.forEach((src) => {
        const preload = new Image();
        preload.decoding = 'async';
        preload.src = src;
    });

    let lastIndex = -1;
    

    ScrollTrigger.create({
        trigger: '.hp_video_space_wrapper',
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        markers: true,
        onUpdate: (self) => {
            const index = Math.min(frameCount - 1, Math.floor(self.progress * frameCount));
            if (index !== lastIndex) {
                frameImg.src = frames[index];
                lastIndex = index;
            }
        },
    });
}
