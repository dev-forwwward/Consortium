export function homepage() {

    // HERO REVEAL
    const hpHero = document.querySelector('.section_hero_hp');
    if (hpHero) {
        // The logo and both text blocks start at opacity 0 from the head custom
        // code (html.w-mod-js ...), so they are already hidden on first paint —
        // hiding them from here would let them flash first (see reveals.js)
        gsap.set('.hp_hero_main_text_content-top', {
            yPercent: 100
        });

        gsap.timeline()
            .to('.hp_hero_logo_container', {
                delay: .5,
                opacity: 1,
                duration: 1
            })
            .to('.hp_hero_main_text_content-top', {
                delay: .1,
                opacity: 1,
                duration: .5
            }, "<")
            .to('.hp_hero_main_text_content-top', {
                delay: .4,
                yPercent: 0,
                duration: .8
            })
            .from('.hp_hero_main_text_content-top .heading-style-h3_custom', {
                opacity: 0,
                duration: .8
            }, "<")
            .fromTo('.hp_hero_main_text_content-bottom', {
                yPercent: 100,
                opacity: 0,
            }, {
                yPercent: 0,
                opacity: 1,
                duration: .8
            }, "<")
            .from('.hp-icon-embed-custom', {
                opacity: 0,
                duration: .8
            }, "<");
    }


    // WORKS + TEXT SCROLLER
    // One pinned stage (.hp_text_scroller_trigger) runs the whole sequence:
    // 1. shuffle: portfolio cards pile up between "ONE TEAM." (top left) and "ONE METHOD." (bottom right)
    // 2. hand-off: the pile slides out, the end photo and both lines travel into their in-flow
    //    spots (photo above a single line at the bottom of the stage)
    // 3. release: the page scrolls on and the line slides left until "PILLARS" meets the right edge
    // The in-flow layout IS the final state; the shuffle state is a transform measured from it
    // (FLIP), so the pin release never jumps and every value is re-measured on refresh.
    const stage = document.querySelector('.hp_text_scroller_trigger');
    const root = stage && stage.querySelector('.mwg_effect014');

    if (stage && root) {
        const outer = stage.querySelector('.text-scroller-container-outer');
        const line = stage.querySelector('.text-scroller-container');
        const wordTop = stage.querySelector('.scroller-main-text.top');
        const wordBottom = stage.querySelector('.scroller-main-text.bottom');
        const secondaryText = stage.querySelector('.text-scroller-container-secondary-text');
        const photo = stage.querySelector('.hp_portfolio-media-end');
        const classes = ['format1', 'format2', 'format3'];

        // Cards are built once and kept: they stay piled up instead of fading out, and the
        // scrubbed timeline shows/hides them, so scrolling back up replays the pile in reverse
        const cards = [...root.querySelectorAll('.medias img')].map(source => {
            const card = document.createElement('img');
            card.setAttribute('src', source.getAttribute('src'));
            card.setAttribute('alt', '');
            card.classList.add(classes[Math.floor(Math.random() * classes.length)]);
            root.appendChild(card);

            gsap.set(card, {
                xPercent: -50 + (Math.random() - 0.5) * 100,
                yPercent: -50 + (Math.random() - 0.5) * 20,
                rotation: (Math.random() - 0.5) * 20,
            });
            return card;
        });

        // Position of an element inside the stage, ignoring transforms
        const offsetIn = (el) => {
            let top = 0, left = 0;
            while (el && el !== stage) {
                top += el.offsetTop;
                left += el.offsetLeft;
                el = el.offsetParent;
            }
            return { top, left };
        };

        // Right edge of the text content (container minus its padding-global)
        const contentRight = () =>
            offsetIn(outer).left + outer.clientWidth - parseFloat(getComputedStyle(line).paddingRight);

        // Scroll distances, in viewport heights
        const STEP = 0.5; // between two cards
        const HANDOFF = 1;
        const handoffAt = (cards.length + 1) * STEP + 0.25;

        const mm = gsap.matchMedia();

        mm.add({
            isDesktop: `(min-width: ${window.mobileBreakpoint + 1}px)`,
            isMobile: `(max-width: ${window.mobileBreakpoint}px)`,
        }, (context) => {
            const { isDesktop } = context.conditions;

            // Shuffle-time text size relative to the final line (3rem -> 7.25rem on desktop, no growth on mobile)
            const startScale = isDesktop ? 3 / 7.25 : 1;

            const master = gsap.timeline({
                defaults: { ease: 'none' },
                scrollTrigger: {
                    trigger: stage,
                    start: 'top top',
                    end: () => `+=${window.innerHeight * (handoffAt + HANDOFF)}`,
                    pin: true,
                    pinSpacing: true,
                    anticipatePin: 1,
                    scrub: true,
                    invalidateOnRefresh: true,
                    // markers: true,
                },
            });

            // 1. Shuffle: one card per step, then the end photo unrotated in the middle of the stage
            cards.forEach((card, i) => {
                master.fromTo(card, {
                    autoAlpha: 0,
                    scale: 1.02,
                }, {
                    autoAlpha: 1,
                    scale: 1,
                    duration: 0.05,
                }, i * STEP + 0.25);
            });

            master.fromTo(photo, {
                autoAlpha: 0,
                scale: 1.02,
            }, {
                autoAlpha: 1,
                scale: 1,
                duration: 0.05,
            }, cards.length * STEP + 0.25);

            // 2. Hand-off: pile leaves upwards, photo and words travel back to their in-flow spots
            master
                .to(root, {
                    yPercent: -100,
                    duration: HANDOFF * 0.8,
                }, handoffAt)
                .fromTo(photo, {
                    x: () => (stage.offsetWidth - photo.offsetWidth) / 2 - offsetIn(photo).left,
                    y: () => (stage.offsetHeight - photo.offsetHeight) / 2 - offsetIn(photo).top,
                }, {
                    x: 0,
                    y: 0,
                    duration: HANDOFF,
                    ease: 'power1.inOut',
                }, handoffAt)
                // Lines first close the vertical gap...
                .fromTo(wordTop, {
                    y: () => stage.offsetHeight * 0.15 - offsetIn(wordTop).top,
                }, {
                    y: 0,
                    duration: HANDOFF * 0.7,
                    ease: 'power1.inOut',
                }, handoffAt)
                .fromTo(wordBottom, {
                    y: () => stage.offsetHeight * 0.78 - offsetIn(wordBottom).top,
                }, {
                    y: 0,
                    duration: HANDOFF * 0.7,
                    ease: 'power1.inOut',
                }, handoffAt)
                // ...then join into one line
                .fromTo(wordBottom, {
                    x: () => contentRight() - wordBottom.offsetWidth * startScale - offsetIn(wordBottom).left,
                }, {
                    x: 0,
                    duration: HANDOFF * 0.4,
                    ease: 'power1.inOut',
                }, handoffAt + HANDOFF * 0.6)
                .fromTo(secondaryText, {
                    opacity: 0,
                }, {
                    opacity: 1,
                    duration: HANDOFF * 0.2,
                }, handoffAt + HANDOFF * 0.8);

            if (isDesktop) {
                master.fromTo([wordTop, wordBottom], {
                    scale: startScale,
                    transformOrigin: '0 0',
                }, {
                    scale: 1,
                    duration: HANDOFF,
                    ease: 'power1.inOut',
                }, handoffAt);
            }

            // 3. Release: slide the line left until its last word ends on the right content edge
            gsap.fromTo(line, {
                x: 0,
            }, {
                x: () => -Math.max(0, line.offsetWidth - outer.clientWidth),
                ease: 'none',
                scrollTrigger: {
                    trigger: stage,
                    start: () => master.scrollTrigger.end,
                    end: () => master.scrollTrigger.end + window.innerHeight * 0.6,
                    scrub: true,
                    invalidateOnRefresh: true,
                    // markers: true,
                },
            });
        });
    }



    // 4 keywords Rotator with Scroll
    const rotatorSection = document.querySelector('.hp_rotator_section');
    const circle = document.querySelector('.hp_circle');
    const navigatorItems = gsap.utils.toArray('.circle_navigator_item');
    const taglineText = document.querySelector('.tagline-written-text');
    const taglineWords = [
        'The way is to',
        'Always aiming to',
        'As we carry the responsibility to',
        'Our goal is to',
    ];

    if (rotatorSection && circle) {
        let activeIndex = -1;
        const stepRotation = 360 / navigatorItems.length;
        let typingTl;

        const typeTagline = (word) => {
            if (!taglineText) return;
            if (typingTl) typingTl.kill();

            const currentWord = taglineText.textContent;
            const proxy = { chars: currentWord.length };

            typingTl = gsap.timeline()
                .to(proxy, {
                    chars: 0,
                    duration: Math.max(currentWord.length * 0.03, 0.05),
                    ease: 'none',
                    onUpdate: () => {
                        taglineText.textContent = currentWord.slice(0, Math.round(proxy.chars));
                    },
                })
                .to(proxy, {
                    chars: word.length,
                    duration: Math.max(word.length * 0.03, 0.05),
                    ease: 'none',
                    onUpdate: () => {
                        taglineText.textContent = word.slice(0, Math.round(proxy.chars));
                    },
                });
        };

        const border = document.querySelector('.border-bottom-el-container-inner');
        ScrollTrigger.create({
            trigger: rotatorSection,
            start: 'clamp(top top)',
            end: '+=200%',
            scrub: true,
            pin: true,
            onUpdate: (self) => {
                const newIndex = Math.min(
                    navigatorItems.length - 1,
                    Math.floor(self.progress * navigatorItems.length)
                )
                if (newIndex === activeIndex) return;
                activeIndex = newIndex;

                gsap.set(circle, { rotation: activeIndex * stepRotation });
                navigatorItems.forEach((item, i) => item.classList.toggle('active', i === activeIndex))

                if (taglineWords[activeIndex] !== undefined) {
                    typeTagline(taglineWords[activeIndex]);
                }
            },
            onEnter: ()=> {
                if(window.innerWidth <= 767) {
                    border.classList.add('hide-down');
                }
            },
            onEnterBack: ()=> {
                if(window.innerWidth <= 767) {
                    border.classList.add('hide-down');
                }
            },
            onLeave: ()=> {
                if(window.innerWidth <= 767) {
                    border.classList.remove('hide-down');
                }
            },
            onLeaveBack: ()=> {
                if(window.innerWidth <= 767) {
                    border.classList.remove('hide-down');
                }
            }
        });
    }


    // Grid Items Slide Down
    const stickyGridSection = document.querySelector('.hp_grid_sticky');
    const stickyGridItems = document.querySelectorAll('.hp_grid_sticky .grid_slide_down');

    if (stickyGridSection && stickyGridItems.length > 0 && window.innerWidth > 767) {
        gsap.to(stickyGridItems, {
            scrollTrigger: {
                trigger: stickyGridSection,
                start: 'top center',
                end: 'clamp(bottom top)',
                scrub: true,
            },
            yPercent: (i, target) => (i + 1) * 42,
            // paddingTop: (i, target) => {
            //     const elHeight = parseFloat(getComputedStyle(target).offsetHeight);
            //     return (elHeight * 0.42);
            // },
            stagger: .025
        });
    }
}