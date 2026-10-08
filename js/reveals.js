export function reveals() {

    const heroFadeIn = document.querySelectorAll('[hero-fade-in]');
    if (heroFadeIn.length > 0) {
        // The hidden start state comes from the head custom code
        // (html.w-mod-js [hero-fade-in] { opacity: 0 }), so it is already in
        // place on first paint. Setting it from here instead would run after
        // fonts load, once the page has been painted, and the content would
        // show, vanish, then fade in (visible when the preloader is skipped)
        gsap.fromTo(heroFadeIn, {
            opacity: 0,
            yPercent: 25,
        }, {
            delay: .75,
            opacity: 1,
            yPercent: 0,
            stagger: .2,
            duration: .25,
        });
    }

}