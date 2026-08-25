export function nextPage() {
    const nextPageContainer = document.querySelector('.next-up-container');
    const nextPageRevealContainer = document.querySelector('.next-up-reveal-container');
    const nextUpLink = document.querySelector('a.next-up-link-wrap');

    const nextUpLoader = document.querySelector('.next-up-load-container');
    const footer = document.querySelector('.footer');

    if (!nextPageContainer) { return }

    let loadBarScrollAnimation;

    // Re-entrancy guard only: prevents a second exit sequence from stacking on top
    // of one already running. It must never be used to skip the animation itself
    let isExiting = false;

    // Single source of truth for the exit animation, shared by both triggers:
    // a direct click on the link, and the .next-up-load-bar tween completing
    function runExitAnimation({ scrollTo = true } = {}) {
        if (isExiting || !nextUpLink) { return }
        isExiting = true;

        const href = nextUpLink.href;
        const footerParent = footer.parentElement;

        if (scrollTo) { lenis.scrollTo(footer) }

        // kill scrollTrigger load animation to avoid animation conflicts on page exit (one animation has scrub, other is auto)
        loadBarScrollAnimation.kill();

        gsap.timeline({
            onComplete: () => {
                // set as late as possible: an exit that never navigates must not
                // leave the flag behind to suppress an unrelated later preloader
                sessionStorage.setItem('skipPreloader', '1');
                window.location.href = href;
            }
        })
            .to(nextUpLoader, {
                opacity: 1,
                duration: .25,
            })
            .to('.next-up-load-bar', {
                duration: .25,
                width: "100%",
            }, "<")
            .to(nextUpLoader, {
                opacity: 0,
                duration: .5,
                delay: .15,
            })
            .fromTo(footerParent, {
                clipPath: 'inset(0% 0 0)'
            }, {
                clipPath: 'inset(100% 0 0)',
                duration: .25,
            }, "<");
    }

    nextUpLink?.addEventListener('click', (e) => {
        // always intercept, even while exiting — letting the anchor navigate
        // natively would cut the running animation short
        e.preventDefault();
        runExitAnimation();
    });

    // restored from the back/forward cache: the closure survives, so clear the
    // guard or the next click would navigate with no animation
    window.addEventListener('pageshow', (e) => {
        if (e.persisted) {
            isExiting = false;
            sessionStorage.removeItem('skipPreloader');
        }
    });

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

    if (footer) {

        const newPadding = footer.offsetHeight + 100;
        gsap.set(nextUpLoader, {
            bottom: `${newPadding}`
        });

        window.addEventListener('resize', () => {
            gsap.set(nextUpLoader, {
                bottom: `${newPadding}`
            });
        });

        loadBarScrollAnimation = gsap.to('.next-up-load-bar', {
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
            // skip the lenis scroll: nextPageContainer is pinned here, so driving
            // the scroll to .footer would fight the pin
            onComplete: () => runExitAnimation({ scrollTo: false })
        });
    }
}
