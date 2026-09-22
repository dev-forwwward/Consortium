export function mainInit() {

    // LENIS
    window.lenis = new Lenis(); // globally available

    // Sync Lenis scrolling with ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    // Add Lenis's requestAnimationFrame (raf) method to GSAP's ticker
    // This ensures Lenis's smooth scroll animation updates on each GSAP tick
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    // Disable lag smoothing in GSAP to prevent any delay in scroll animations
    gsap.ticker.lagSmoothing(0);


    const preloader = document.querySelector('.preloader');
    if (preloader) {
        if (sessionStorage.getItem('skipPreloader')) {
            sessionStorage.removeItem('skipPreloader');
            preloader.style.display = 'none';
        } else {
            gsap.to('.preloader', {
                opacity: 0,
                delay: .1,
                duration: .5,
                ease: "power2.out",
                onComplete: () => {
                    preloader.remove();
                }
            });
        }
    }

    // List-Grid View Toggle
    const listGridToggle = document.querySelectorAll('.view-toggle-container');
    const viewContainer = document.querySelector('.grid-list-view-container');
    if (listGridToggle && viewContainer) {
        const toggleBtns = document.querySelectorAll('.view-toggle-btn');
        toggleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // clear previously active btn
                document.querySelector('.view-toggle-btn.active')?.classList.remove('active');
                btn.classList.add('active');

                if (btn.getAttribute('data-view-type') === 'grid') {
                    viewContainer.classList.add('grid-view');
                } else {
                    viewContainer.classList.remove('grid-view');

                    // reset any open grid accordion items
                    const openItems = document.querySelectorAll('[pb-accordion-element="trigger"]');
                    openItems.forEach(item => {
                        if (item.getAttribute('aria-expanded') === 'true') {
                            item.click();
                        }
                    });
                }
            });
        });
    }

    // Timeline in About
    const timelineSection = document.querySelector('.timeline-section');
    const timelineContainer = document.querySelector('.timeline-container');

    if (timelineSection && timelineContainer) {
        const years = timelineSection.querySelectorAll('.timeline-year-item');

        // set random left position for mock achievements in timeline
        if (years.length > 0) {
            years.forEach(year => {
                const achievsList = year.querySelectorAll('.achevements-list-item');
                const hasMockAchiev = year.querySelectorAll('[is-mock-achiev="1"]');

                if (hasMockAchiev.length > 0) {
                    hasMockAchiev.forEach((mock, i) => {
                        let xVal = (i + 1) * 100 / achievsList.length;
                        mock.style.left = `${xVal + Math.random(-5, 5)}%`;
                    });
                }
            });
        }

        const border = document.querySelector('.border-bottom-el-container-inner');
        // pin section and animate timeline years
        gsap.to(timelineContainer, {
            x: -(timelineContainer.offsetWidth - window.innerWidth / 2),
            ease: "none",
            scrollTrigger: {
                trigger: timelineSection,
                pin: true,
                scrub: 1,
                // snap: 1 / update(years.length - 1),
                start: 'top top',
                end: () => "+=150%",
                onEnter: () => {
                    border.classList.add('hide-down');
                },
                onLeave: () => {
                    border.classList.remove('hide-down');
                },
                onEnterBack: () => {
                    border.classList.add('hide-down');
                },
                onLeaveBack: () => {
                    border.classList.remove('hide-down');
                }
            }
        });
    }

    // Copy link share
    const copyShare = document.querySelectorAll(".copy-to-clipboard");
    copyShare?.forEach(shareBtn => {
        shareBtn.addEventListener("click", function (e) {
            e.preventDefault();
            let tooltip = shareBtn.querySelector(".tooltip");
            tooltip?.classList.add("show");
            setTimeout(() => {
                tooltip?.classList.remove("show");
            }, 1500);
            navigator.clipboard.writeText(location.href);
        });
    });

    console.log("Loading mainInit()");

}