export function nextPage() {
    const nextPageContainer = document.querySelector('.next-up-container');
    const nextPageRevealContainer = document.querySelector('.next-up-reveal-container');
    const nextUpLink = document.querySelector('a.next-up-link-wrap');

    const nextUpLoader = document.querySelector('.next-up-load-container');
    const footer = document.querySelector('.footer');

    if (!nextPageContainer) { return }

    let loadBarScrollAnimation;
    let revealScrollAnimation;
    let exitTimeline;

    // Re-entrancy guard only: prevents a second exit sequence from stacking on top
    // of one already running. It must never be used to skip the animation itself
    let isExiting = false;

    // Single source of truth for the exit animation, shared by both triggers:
    // a direct click on the link, and the .next-up-load-bar tween completing
    function runExitAnimation({ scrollTo = true } = {}) {
        if (isExiting || !nextUpLink) { return }
        isExiting = true;

        const href = nextUpLink.href;
        const footerParent = footer?.parentElement;

        // With a cross-document View Transition the browser snapshots this page at
        // navigation commit, so whatever the exit animation leaves on screen IS the
        // "old" half of the morph. The fallback exit wipes .next-up-container away,
        // and .section_next-up — the element being morphed — lives inside it, so
        // on the transition path that wipe is dropped and the reveal is settled
        // open instead. The name pairing itself lives in the site's head custom
        // code; see the CROSS-DOCUMENT VIEW TRANSITION note in css/styles.css
        const useViewTransition = 'onpagereveal' in window;

        // Read the mask as it is on screen before anything below is killed:
        // killing the triggers resets the reveal to its closed CSS state, and the
        // exit would then visibly replay the whole opening from scratch
        const revealClip = nextPageRevealContainer && getComputedStyle(nextPageRevealContainer).clipPath;

        // Park the shared hero in the viewport rather than the footer: on the
        // transition path it is what gets captured. The scroll must settle well
        // inside the exit timeline (~.9s) — Lenis' default (~1.2s) could still be
        // moving when navigation commits and the old snapshot is taken
        if (scrollTo) { lenis.scrollTo(useViewTransition ? nextPageContainer : footer, { duration: .25 }) }

        // Stop the scroll-driven load bar so it doesn't fight the exit tween (one has
        // scrub, the other is auto). Disable, don't kill: neither reverts the pin, so
        // .next-up-container (which holds the footer) stays as it is on screen, but a
        // killed trigger is gone for good and a back/forward-cache restore would come
        // back with the footer stuck in position: fixed. A disabled one can be
        // re-enabled in the pageshow handler below
        loadBarScrollAnimation?.scrollTrigger?.disable(false);

        exitTimeline = gsap.timeline({
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
            });

        if (useViewTransition) {
            // A direct click can land while the reveal scrub is only part-way
            // open. Kill the scrub and finish the reveal on the timeline so the
            // transition is handed a fully open block instead of a clipped one.
            // disable(false, true) stops the trigger without reverting the
            // timeline (and keeps it for the pageshow restore); pausing stops the
            // scrub from writing over the exit, and the set puts back whatever
            // the visitor was looking at
            revealScrollAnimation?.scrollTrigger?.disable(false, true);
            revealScrollAnimation?.pause();
            gsap.set(nextPageRevealContainer, { clipPath: revealClip });
            exitTimeline.to(nextPageRevealContainer, {
                clipPath: 'inset(0%)',
                duration: .25,
            }, 0);
        } else if (footerParent) {
            exitTimeline.fromTo(footerParent, {
                clipPath: 'inset(0% 0 0)'
            }, {
                clipPath: 'inset(100% 0 0)',
                duration: .25,
            }, "<");
        }
    }

    nextUpLink?.addEventListener('click', (e) => {
        // always intercept, even while exiting — letting the anchor navigate
        // natively would cut the running animation short
        e.preventDefault();
        runExitAnimation();
    });

    // Restored from the back/forward cache: the page comes back exactly as the exit
    // left it (pin frozen in position: fixed, reveal open, footer clipped on the
    // fallback path, triggers disabled). Undo the exit and re-arm the triggers
    window.addEventListener('pageshow', (e) => {
        if (!e.persisted) { return }

        // clear the guard or the next click would navigate with no animation
        isExiting = false;
        sessionStorage.removeItem('skipPreloader');

        exitTimeline?.kill();
        exitTimeline = null;

        // exit-only inline styles
        gsap.set(nextUpLoader, { opacity: 0 });
        gsap.set('.next-up-load-bar', { clearProps: 'width' });
        footer?.parentElement && gsap.set(footer.parentElement, { clearProps: 'clipPath' });
        nextPageRevealContainer && gsap.set(nextPageRevealContainer, { clearProps: 'clipPath' });

        // enable() refreshes the trigger: it reverts the pin to its original
        // styles and re-applies it for the current scroll position
        revealScrollAnimation?.scrollTrigger?.enable();
        const loadBarTrigger = loadBarScrollAnimation?.scrollTrigger;
        loadBarTrigger?.enable();

        // Back would otherwise land at max scroll with a full bar whose onComplete
        // already fired. Return to the start of the load-bar range instead: the
        // next-up block in view, the bar empty and the auto-advance re-armed
        if (loadBarTrigger) {
            lenis.scrollTo(loadBarTrigger.start, { immediate: true, force: true });
        }

        ScrollTrigger.refresh();
    });

    revealScrollAnimation = gsap.timeline({
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

        const newPadding = footer.offsetHeight + 60;
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
            // ease: 'power2.inOut',
            ease: 'none',
            scrollTrigger: {
                trigger: footer,
                start: 'bottom bottom',
                end: '+=200%',
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
