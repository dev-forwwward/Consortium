export function nextPage() {
    const nextPageContainer = document.querySelector('.next-up-container');
    const nextPageRevealContainer = document.querySelector('.next-up-reveal-container');
    const nextUpLink = document.querySelector('a.next-up-link-wrap');

    const nextUpLoader = document.querySelector('.next-up-load-container');

    if (!nextPageContainer) { return }

    let skipExitAnimation = false;

    function playExitAnimation(e) {
        // prevent redirect trigger if the loader animation is executing
        if (skipExitAnimation) { return }
        e.preventDefault();

        const href = nextUpLink.href;

        lenis.scrollTo('.footer');

        gsap.timeline({
            onComplete: () => {
                window.location.href = href;
            }
        })
            .to(nextUpLoader, {
                opacity: 1,
                duration: .25,
            })
            .to(nextUpLoader, {
                opacity: 0,
                duration: .5,
                delay: .25,
            })
            .fromTo('.footer', {
                clipPath: 'inset(0% 0 0)'
            }, {
                clipPath: 'inset(100% 0 0)',
                duration: .25,
            }, "<");
    }

    nextUpLink?.addEventListener('click', playExitAnimation);

    gsap.timeline({
        scrollTrigger: {
            trigger: nextPageContainer,
            start: 'top top',
            // end: `+=${nextPageContainer.offsetHeight}`,
            end: 'bottom bottom',
            scrub: .95,
            // pin: '.next-up-reveal-container-outer',
            // pinSpacing: false,
        },
    }).to(nextPageRevealContainer, {
        clipPath: 'inset(0%)',
        ease: 'none'
    });

    const footer = document.querySelector('.footer');
    if (footer) {

        gsap.set(nextUpLoader, {
            paddingBottom: `${footer.offsetHeight}`
        });

        window.addEventListener('resize', () => {
            gsap.set(nextUpLoader, {
                paddingBottom: `${footer.offsetHeight}`
            });
        });

        gsap.to('.next-up-load-bar', {
            delay: 2,
            duration: 2,
            width: "100%",
            scrollTrigger: {
                trigger: footer,
                start: 'bottom bottom',
                end: '+=400%',
                scrub: true,
                pin: nextPageContainer,
                onEnter: () => {
                    gsap.to(nextUpLoader, {
                        opacity: 1,
                        duration: .25,
                    })
                },
                onLeaveBack: () => {
                    gsap.to(nextUpLoader, {
                        opacity: 0,
                        duration: .15,
                    })
                }
            },
            onComplete: () => {
                gsap.timeline()
                    .to(nextUpLoader, {
                        opacity: 0,
                        duration: .5,
                    })
                    .fromTo('.footer', {
                        clipPath: 'inset(0% 0 0)'
                    }, {
                        clipPath: 'inset(100% 0 0)',
                        duration: .25,
                        onComplete: () => {
                            skipExitAnimation = true;
                            nextUpLink.click();
                        }
                    }, "<")
            }
        });
    }
}