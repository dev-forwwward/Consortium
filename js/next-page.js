export function nextPage() {
    const nextPageContainer = document.querySelector('.next-up-container');
    const nextPageRevealContainer = document.querySelector('.next-up-reveal-container');

    if (nextPageContainer) {
        gsap.timeline({
            scrollTrigger: {
                trigger: nextPageContainer,
                start: 'top top',
                end: '+=100%',
                scrub: true,
                pin: true,
                // markers: true
            },
        }).to(nextPageRevealContainer, {
            duration: .8,
            clipPath: 'inset(0%)',
            ease: 'none',
        }).to({},{
            duration: .2
        });
    }
}