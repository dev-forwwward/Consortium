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
                opacity: 1,
                duration: .8
            }, "<")
            .fromTo('.hp_hero_main_text_content-bottom', {
                yPercent: 100,
            }, {
                yPercent: 0,
                opacity: 1,
                duration: .8
            }, "<");
    }


    // WORKS
    const root = document.querySelector('.mwg_effect014'),
        images = [],
        classes = ['format1', 'format2', 'format3']

    if (root) {
        // 'scroll' (not 'wheel') so touch devices also hide the hint
        window.addEventListener('scroll', () => {
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
            currentIndex = 0,
            lastScroll = 0

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
            onEnter: (self) => {
                lastScroll = self.scroll()
            },
            onLeaveBack: () => {
                // Scrolled back above the section: reset so the effect replays on re-entry
                currentIndex = 0
                incr = 0
            },
            onEnterBack: (self) => {
                // Scrolled back above the section: reset so the effect replays on re-entry
                currentIndex = 0
                incr = 0
                lastScroll = self.scroll()
            },
            onUpdate: (self) => {
                // Distance scrolled since the last update — works for wheel, touch, keyboard, scrollbar
                const scroll = self.scroll()
                incr += Math.abs(scroll - lastScroll) // Math.abs() to ignore the scroll direction
                lastScroll = scroll

                if (currentIndex >= imagesLength) return

                if (incr > 500) {
                    newImage()
                    incr = 0 // Reset incr value
                }
            },
        })

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

        let finalImgX = '30vw';
        let finalImgY = 50;
        if(window.innerWidth <= 767) {
            finalImgX = '10vw';
            finalImgY = 125;
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
                x: finalImgX,
                yPercent: -finalImgY,
                rotation: () => (Math.random() - 0.5) * 20,
            });

    }


    // Text Scroller Timeline
    const scrollerContainer = document.querySelector('.hp_text_scroller_trigger');
    const textScrollerContainer = document.querySelector('.text-scroller-container');
    const scrollerSecondaryText = document.querySelector('.text-scroller-container-secondary-text');

    if (scrollerContainer && textScrollerContainer) {

        let textScrollerGrowTl;

        if (window.innerWidth > 767) {
            textScrollerGrowTl = gsap.timeline({
                scrollTrigger: {
                    trigger: scrollerContainer,
                    start: 'clamp(top top)',
                    end: 'clamp(bottom top-=200px)',
                    scrub: true,
                    // markers: true,
                },
            })
                .fromTo(textScrollerContainer, {
                    fontSize: '3rem',
                    paddingTop: '2rem',
                    paddingBottom: '4rem',
                }, {
                    // Explicit rem end values (match .text-scroller-container in Webflow) so GSAP
                    // never falls back to the computed px value at the end of the tween
                    fontSize: '7.25rem',
                    paddingTop: '12rem',
                    paddingBottom: '0rem',
                })
                .to('.scroller-main-text', {
                    height: '140px',
                }, '<');
        } else {
            textScrollerGrowTl = gsap.timeline({
                scrollTrigger: {
                    trigger: scrollerContainer,
                    start: 'clamp(top top)',
                    end: 'clamp(bottom 95%)',
                    scrub: true,
                    // markers: true,
                },
            })
                .fromTo(textScrollerContainer, {
                    fontSize: '3rem',
                    paddingTop: '2rem',
                    paddingBottom: '4rem',
                }, {
                    // Explicit rem end values (match .text-scroller-container in Webflow) so GSAP
                    // never falls back to the computed px value at the end of the tween
                    fontSize: '7.25rem',
                    paddingTop: '0rem',
                    paddingBottom: '12rem',
                })
                .to('.scroller-main-text', {
                    height: 'auto',
                }, '<');
        }


        // Distance the text travels so its right edge lands on the container's right edge.
        // Measured in the end state (full font size, single line) regardless of where the
        // page is scrolled when ScrollTrigger refreshes, then the previous state is restored.
        const getScrollDistance = () => {
            const growProgress = textScrollerGrowTl.progress();
            const hadNoWrap = textScrollerContainer.classList.contains('flex-no-wrap');

            textScrollerGrowTl.progress(1);
            textScrollerContainer.classList.add('flex-no-wrap');

            const distance = textScrollerContainer.scrollWidth - textScrollerContainer.clientWidth + 24;

            textScrollerContainer.classList.toggle('flex-no-wrap', hadNoWrap);
            textScrollerGrowTl.progress(growProgress);

            return -distance;
        };

        gsap.timeline({
            scrollTrigger: {
                trigger: '.hp_text_scroller_trigger-2',
                start: 'top 80%',
                end: ()=> {
                    if (window.innerWidth > 767) {
                        return 'bottom 60%';
                    } else {
                        return 'bottom 80%';
                    }
                },
                scrub: true,
                // markers: true,
                onEnter: () => textScrollerContainer.classList.add('flex-no-wrap'),
                onLeaveBack: () => textScrollerContainer.classList.remove('flex-no-wrap'),
            },
        })
            .to(textScrollerContainer, {
                x: getScrollDistance,
                ease: 'none',
            }, 0)
            .to(scrollerSecondaryText, {
                opacity: 1,
                duration: 0.1,
            }, 0);
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