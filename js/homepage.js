export function homepage() {

    // HERO REVEAL
    const hpHero = document.querySelector('.section_hero_hp');
    if(hpHero) {
        gsap.set('.hp_hero_main_text_content-top', {
            yPercent: 100
        });

        gsap.timeline()
        .from('.hp_hero_logo_container', {
            delay: .5,
            opacity: 0,
            duration: 1
        })
        .from('.hp_hero_main_text_content-top', {
            delay: .1,
            opacity: 0,
            duration: .5
        }, "<")
        .to('.hp_hero_main_text_content-top', {
            delay: .4,
            yPercent: 0,
            duration: .8
        })
        .from('.hp_hero_main_text_content-top .heading-style-h3_custom', {
            opacity: 1,
            duration: .8
        }, "<")
        .from('.hp_hero_main_text_content-bottom', {
            yPercent: 100,
            opacity: 0,
            duration: .8
        }, "<");
    }


    // WORKS
    const root = document.querySelector('.mwg_effect014'),
        images = [],
        classes = ['format1', 'format2', 'format3']

    if (root) {
        document.addEventListener('wheel', () => {
            gsap.to('.scroll', {
                autoAlpha: 0,
                duration: 0.15,
            })
        }, { once: true })

        root.querySelectorAll('.medias img').forEach(image => {
            images.push(image.getAttribute('src'))
        })

        const imagesLength = images.length

        let incr = 0,
            currentIndex = 0

        // Pin the section for a scroll distance proportional to the image count, so the
        // shuffling effect has room to play out in place before the page continues
        // scrolling into whatever section comes after it.
        const trigger = ScrollTrigger.create({
            trigger: root,
            start: 'top top',
            // end: 'bottom bottom',
            end: `+=${imagesLength * 600}`,
            pin: true,
            // markers: true,
            pinSpacing: true,
            anticipatePin: 1,
            onLeaveBack: () => {
                // Scrolled back above the section: reset so the effect replays on re-entry
                currentIndex = 0
                incr = 0
            },
            onEnterBack: () => {
                // Scrolled back above the section: reset so the effect replays on re-entry
                currentIndex = 0
                incr = 0
            },
        })

        document.addEventListener('wheel', (e) => {
            if (!trigger.isActive || currentIndex >= imagesLength) return

            incr += Math.abs(e.deltaY); // Math.abs() to ignore the scroll direction

            if (incr > 500) {
                newImage()
                incr = 0; // Reset incr value
            }
        }, { passive: true })

        function newImage() {
            // We pick a random value from the list of predefined classes
            const randomIndex = Math.floor(Math.random() * classes.length),
                // We create an image
                image = document.createElement("img")

            // We assign it a URL and add a randomly chosen class
            image.setAttribute('src', images[currentIndex])
            image.classList.add(classes[randomIndex])

            // We add this image to the DOM
            root.appendChild(image);

            gsap.fromTo(image, {
                xPercent: -50 + (Math.random() - 0.5) * 100,
                yPercent: -50 + (Math.random() - 0.5) * 20,
                rotation: (Math.random() - 0.5) * 20,
                // Different values for X and Y to create a slight squish effect on appearance
                scaleX: 1.02,
                scaleY: 1.02,
                opacity: 0
            }, {
                scaleX: 1,
                scaleY: 1,
                opacity: 1,
                ease: 'power4.out',
                duration: 0.15
            })

            gsap.to(image, {
                // // Slightly reduce the image size
                // scaleX: 0.96,
                // scaleY: 0.96,
                // ease: 'power4.in',
                duration: .5,
                opacity: 0,
                delay: 1.5, // Wait before hiding
                onComplete: () => {
                    // Remove the image from the DOM for better performance
                    root.removeChild(image);
                }
            })

            currentIndex++
        }

        // Transition last portfolio image reveal into fixed spot
        gsap.timeline({
            scrollTrigger: {
                trigger: '.hp_portfolio-media-end-trigger',
                start: 'top center',
                end: '+=100%',
                pin: '.hp_portfolio-media-end-wrapper',
                scrub: true,
                // markers: true,
                onEnter: () => {
                    gsap.fromTo('.hp_portfolio-media-end', {
                        opacity: 0,
                    }, {
                        opacity: 1,
                        duration: .8,
                    })
                },
                onLeaveBack: () => {
                    gsap.fromTo('.hp_portfolio-media-end', {
                        opacity: 1,
                    }, {
                        opacity: 0,
                        duration: 1,
                    })
                }
            }
        })
            .from('.hp_portfolio-media-end', {
                delay: .25,
                x: '30vw',
                yPercent: -50,
                rotation: () => (Math.random() - 0.5) * 20,
            });

    }


    // Text Scroller Timeline
    const scrollerContainer = document.querySelector('.hp_text_scroller_trigger');
    const textScrollerContainer = document.querySelector('.text-scroller-container');
    const scrollerMainText = document.querySelector('.text-scroller-container-main-text');

    let containerWidth = document.querySelector('.container-large').offsetWidth;
    let scrollerWidth = document.querySelector('.scroller-main-text.top').offsetWidth + document.querySelector('.scroller-main-text.bottom').offsetWidth + document.querySelector('.text-scroller-container-secondary-text').offsetWidth;

    if (scrollerContainer) {
        const textScrollerTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: scrollerContainer,
                start: 'clamp(top top)',
                end: 'clamp(bottom top-=200px)',
                scrub: true,
                // markers: true,
            },
            duration: 1,
        })
            .from(textScrollerContainer, {
                fontSize: "3rem",
                duration: 1,
            })
            .to('.scroller-main-text', {
                height: 'auto',
                duration: 1,
            }, "<");
        // .to('.text-scroller-container-outer', {
        //     paddingBottom: '12.5rem'
        // }, "<");

        gsap.to(textScrollerContainer, {
            scrollTrigger: {
                trigger: '.hp_text_scroller_trigger-2',
                start: 'top 25%',
                end: 'bottom 60%',
                scrub: true,
                // markers: true,
                onEnter: () => {
                    textScrollerContainer.classList.add('flex-no-wrap');
                    gsap.set('.text-scroller-container-secondary-text', {
                        opacity: 1,
                    });
                },
                onLeaveBack: () => {
                    textScrollerContainer.classList.remove('flex-no-wrap');
                    gsap.set('.text-scroller-container-secondary-text', {
                        opacity: 0,
                    });
                }
            },
            x: () => {

                let returnValue = -(scrollerWidth * .9725 - containerWidth);

                console.log('containerWidth: ', containerWidth);
                console.log('scrollerWidth: ', scrollerWidth);
                console.log('returnValue: ', returnValue);
                return returnValue
            }
        })
    }



    // 4 keywords Rotator with Scroll
    const rotatorSection = document.querySelector('.hp_rotator_section');
    const circle = document.querySelector('.hp_circle');
    const navigatorItems = gsap.utils.toArray('.circle_navigator_item');
    const taglineText = document.querySelector('.tagline-written-text');
    const taglineWords = [
        'The way is to',
        'then we must',
        'which means we',
        'until we become',
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
                    duration: Math.max(currentWord.length * 0.03, 0.08),
                    ease: 'none',
                    onUpdate: () => {
                        taglineText.textContent = currentWord.slice(0, Math.round(proxy.chars));
                    },
                })
                .to(proxy, {
                    chars: word.length,
                    duration: Math.max(word.length * 0.03, 0.08),
                    ease: 'none',
                    onUpdate: () => {
                        taglineText.textContent = word.slice(0, Math.round(proxy.chars));
                    },
                });
        };

        ScrollTrigger.create({
            trigger: rotatorSection,
            start: 'top top',
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
        });
    }


    // Grid Items Slide Down
    const stickyGridSection = document.querySelector('.hp_grid_sticky');
    const stickyGridItems = document.querySelectorAll('.hp_grid_sticky .grid_slide_down');

    if (stickyGridSection && stickyGridItems.length > 0) {
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