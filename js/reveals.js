export function reveals() {

    const heroFadeIn = document.querySelectorAll('[hero-fade-in]');
    if (heroFadeIn.length > 0) {
        gsap.from(heroFadeIn, {
            delay: .75,
            opacity: 0,
            yPercent: 25,
            stagger: .2,
            duration: .25,
        });
    }

}