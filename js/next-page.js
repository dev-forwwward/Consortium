export function nextPage() {
    const nextPageContainer = document.querySelector('.next-up-container');
    const nextPageRevealContainer = document.querySelector('.next-up-reveal-container');
    const nextUpLink = document.querySelector('a.next-up-link-wrap');

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
        }).to({}, {
            duration: .2
        });

        const footer = document.querySelector('.footer');
        if (footer) {
            gsap.to('.next-up-load-bar', {
                width: "100%",
                scrollTrigger: {
                    delay: 1,
                    trigger: footer,
                    start: 'clamp(top 65%)',
                    end: '+=100%',
                    scrub: true,
                    // markers: true
                },
                onComplete: ()=> {
                    gsap.to('.next-up-load-container', {
                        opacity: 0,
                        duration: .25,
                        onComplete: ()=> {
                            nextUpLink.click();
                        }
                    })
                }
            });
        }
    }
}