const PROCESS_TAG_CONTENT = {
    'master-planning': {
        bullets: [
            'Long-term development roadmap',
            'Aligning vision with feasibility',
            'Site and zoning strategy',
        ],
        tagline: '// The blueprint before the build',
    },
    'architecture': {
        bullets: [
            'Concept through construction documentation',
            'Contextual and sustainable design',
            'Detailed technical coordination',
        ],
        tagline: '// Where form meets function',
    },
    'feasibility': {
        bullets: [
            'Site and market assessment',
            'Risk and cost evaluation',
            'Informed go / no-go decisions',
        ],
        tagline: '// Testing the vision before investing',
    },
    'project-management': {
        bullets: [
            'Initiating, planning, and execution',
            'Process to achieve your goals',
            'Meet specific success criteria on time',
        ],
        tagline: '// The art or practice of planning',
    },
    'building-survey': {
        bullets: [
            'Structural condition assessment',
            'Defect identification and reporting',
            'Guidance for renovation planning',
        ],
        tagline: '// Know the building before you build',
    },
    'rendering': {
        bullets: [
            'Photorealistic 3D renderings',
            'Immersive walkthroughs and animation',
            'Clear visual communication of intent',
        ],
        tagline: "// Seeing the design before it's real",
    },
};

// EXPANDABLE "OUR PROCESS" TAGS
// Each tag's .process-tag_label is the click target and the panel that grows;
// the bullet list + tagline are injected once (on first expand) into the
// empty .process-tag_details placeholder already sitting in the Webflow
// structure, then just shown/hidden via the .is-active class after that.
function initProcessTags(scope) {
    const tags = scope.querySelectorAll('.process-tag[data-tag-id]');
    if (tags.length === 0) { return }

    tags.forEach((tag) => {
        const label = tag.querySelector('.process-tag_label');
        const details = tag.querySelector('.process-tag_details');
        const content = PROCESS_TAG_CONTENT[tag.dataset.tagId];
        if (!label || !details || !content) { return }

        let populated = false;
        function populateDetails() {
            if (populated) { return }
            populated = true;

            const list = document.createElement('ul');
            content.bullets.forEach((bullet) => {
                const li = document.createElement('li');
                const dash = document.createElement('span');
                dash.className = 'dash';
                dash.textContent = '--';
                li.appendChild(dash);
                li.appendChild(document.createTextNode(bullet));
                list.appendChild(li);
            });
            details.appendChild(list);

            const tagline = document.createElement('p');
            tagline.className = 'tagline';
            tagline.textContent = content.tagline;
            details.appendChild(tagline);
        }

        tag.addEventListener('click', () => {
            const isActive = tag.classList.contains('is-active');

            // Accordion behaviour: collapse any other open tag first.
            tags.forEach((otherTag) => {
                if (otherTag !== tag) { otherTag.classList.remove('is-active') }
            });

            if (!isActive) { populateDetails() }
            tag.classList.toggle('is-active', !isActive);
        });
    });
}

// "OUR PROCESS" CIRCLE LABELS (PLANNING / DESIGNING)
function initProcessCircleLabels(scope) {
    const svgs = scope.querySelectorAll('.our-process_embed svg[data-arc-center]');
    if (svgs.length === 0) { return }

    const ARC_HALF_SPAN = 89; // degrees either side of the centre angle
    const mobileQuery = window.matchMedia('(max-width: 767px)');

    const pointAt = (cx, cy, r, deg) => {
        const rad = (deg * Math.PI) / 180;
        return `${(cx + r * Math.cos(rad)).toFixed(2)},${(cy + r * Math.sin(rad)).toFixed(2)}`;
    };

    const layout = (svg) => {
        const path = svg.querySelector('path');
        const size = svg.getBoundingClientRect().width;
        if (!path || size === 0) { return }

        const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
        const isMobile = mobileQuery.matches;
        const inset = parseFloat(
            (isMobile && svg.dataset.arcInsetMobile) || svg.dataset.arcInset || '0.75'
        ) * rootFontSize;
        const center = parseFloat(
            (isMobile && svg.dataset.arcCenterMobile) || svg.dataset.arcCenter
        );
        const c = size / 2;
        const r = Math.max(c - inset, 0);

        const start = pointAt(c, c, r, center + ARC_HALF_SPAN);
        const end = pointAt(c, c, r, center - ARC_HALF_SPAN);
        path.setAttribute('d', `M ${start} A ${r},${r} 0 0,0 ${end}`);
        svg.style.visibility = 'visible';
    };

    const observer = new ResizeObserver((entries) => {
        entries.forEach((entry) => layout(entry.target));
    });
    svgs.forEach((svg) => {
        layout(svg);
        observer.observe(svg);
    });
    // The circle doesn't necessarily resize when crossing 767px, so re-lay out
    // on the breakpoint change too.
    mobileQuery.addEventListener('change', () => svgs.forEach(layout));
}

export function services() {
    const servicesHeroSection = document.querySelector('.section-services-hero');
    if (!servicesHeroSection) { return }

    initProcessTags(document);
    initProcessCircleLabels(document);


    // SCROLL-IN TABLE SECTION
    const scrollinSection = document.querySelector('.scroll-in-table-section');

    if (scrollinSection) {

        if (window.innerWidth > 991) {
            const headings = scrollinSection.querySelectorAll('.grid-row-content .work-title');

            if (headings.length > 0) {
                const splitHeadings = Array.from(headings).map((heading) =>
                    new SplitText(heading, { type: 'lines, words', linesClass: 'line', wordsClass: 'word' })
                );

                const words = splitHeadings.flatMap((split) => split.words);
                const lines = splitHeadings.flatMap((split) => split.lines);
                // gsap.set(lines, { overflow: 'hidden' });

                gsap.timeline({
                    scrollTrigger: {
                        trigger: scrollinSection,
                        start: 'top top',
                        end: '+=250%',
                        scrub: true,
                        pin: true,
                        pinSpacing: true,
                    },
                }).fromTo(words, {
                    x: '100vw',
                }, {
                    x: '0',
                    stagger: 0.2,
                    ease: 'power1.inOut',
                    duration: 1,
                    onComplete: () => {
                        scrollinSection.classList.add('ready');
                    },
                    onReverseComplete: () => {
                        scrollinSection.classList.remove('ready');
                    }
                })
                    .to({}, {
                        duration: .5
                    });
            }
        } else {
            // mobile
            const gridItems = scrollinSection.querySelectorAll('.grid_item');
            gridItems.forEach((item) => {
                item.addEventListener('click', () => {
                    if (scrollinSection.querySelector('.active')) {
                        scrollinSection.querySelector('.active').classList.remove('active');
                    }
                    item.classList.toggle('active');
                });
            });
        }
    }











    const brandCarouselSection = document.querySelector('.brand-carousel-section');
    if (!brandCarouselSection) { return }

    // CURVED PARTNER-LOGO CAROUSEL
    gsap.registerPlugin(MotionPathPlugin);

    const carouselItems = gsap.utils.toArray('.brand-carousel-item', brandCarouselSection);
    if (carouselItems.length === 0) { return }

    let itemStagger = .135;
    let itemDuration = 1.5;

    if(window.innerWidth < 991) {
        document.querySelector('.brand-carousel-item').offsetWidth * 0.25 / 100;
    }

    // #carousel-path has off-canvas tails at both ends: progress 1 is the
    // top-right entrance, 0 the bottom-left exit, so items travel 1 -> 0.

    // Park every item at the path entrance so queued items don't sit at
    // their raw CSS (top:0/left:0) position.
    const queueItemsAtPathEntrance = () => {
        gsap.set(carouselItems, {
            motionPath: {
                path: '#carousel-path',
                align: '#carousel-path',
                alignOrigin: [0.5, 0.5],
                autoRotate: true,
                start: 0,
                end: 0,
            },
        });
    };

    queueItemsAtPathEntrance();

    const carouselTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: brandCarouselSection,
            start: 'top top',
            end: `+=${carouselItems.length * 400}`,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            scrub: true,
            // The full-bleed path is baked in at build time, so re-measure on
            // resize (and re-queue, since that lives outside the timeline).
            invalidateOnRefresh: true,
            onRefresh: queueItemsAtPathEntrance,
            // markers: true,
        }
    });

    // Each item runs the full path; a short stagger relative to the
    // duration keeps several items visible at once, reading as a queue.
    carouselItems.forEach((item, i) => {
        carouselTimeline.to(item, {
            motionPath: {
                path: '#carousel-path',
                align: '#carousel-path',
                alignOrigin: [0.5, 0.5],
                autoRotate: true,
                start: 0,
                end: 1,
            },
            duration: itemDuration,
            ease: 'none',
        }, i * itemStagger);
    });
}