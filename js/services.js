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

export function services() {
    const servicesHeroSection = document.querySelector('.section-services-hero');
    if (!servicesHeroSection) { return }

    initProcessTags(document);


    // SCROLL-IN TABLE SECTION
    const scrollinSection = document.querySelector('.scroll-in-table-section');

    if (scrollinSection) {
        const headings = scrollinSection.querySelectorAll('.grid-row-content h3');

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
    }











    const brandCarouselSection = document.querySelector('.brand-carousel-section');
    if (!brandCarouselSection) { return }

    // CURVED PARTNER-LOGO CAROUSEL
    gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

    const carouselItems = gsap.utils.toArray('.brand-carousel-item', brandCarouselSection);
    if (carouselItems.length === 0) { return }

    const itemStagger = 0.18;
    const itemDuration = 1.5;

    // The path itself (#carousel-path) is authored from its top-right end to
    // its bottom-left end, with straight off-canvas tails extended past both
    // ends, so a plain forward 0 -> 1 traversal is enough: 0 sits off-canvas
    // top-right, 1 sits off-canvas bottom-left, and autoRotate's tangent
    // lines up with the actual direction of travel (a reversed traversal of
    // the path flips autoRotate 180 degrees, which is why an earlier out-of-
    // range 1.2 -> -0.3 attempt rendered every card upside down).

    // Position every item at its path entrance point up front, so items
    // whose turn hasn't come up yet sit correctly queued on the path
    // instead of at their raw CSS (top:0/left:0) default.
    gsap.set(carouselItems, {
        motionPath: {
            path: '#carousel-path',
            align: '#carousel-path',
            alignOrigin: [0.5, 0.5],
            autoRotate: true,
            start: 1,
            end: 1,
        },
    });

    const carouselTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: brandCarouselSection,
            start: 'top top',
            end: `+=${carouselItems.length * 400}`,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            scrub: true,
            // markers: true,
        }
    });

    // Every item travels the same full path (queued in off-canvas top-right,
    // exiting off-canvas bottom-left); staggering each item's start time on
    // the timeline is what makes them read as a queue. A short stagger
    // relative to the duration keeps several items visible along the path
    // at once instead of spread too far apart.
    carouselItems.forEach((item, i) => {
        carouselTimeline.to(item, {
            motionPath: {
                path: '#carousel-path',
                align: '#carousel-path',
                alignOrigin: [0.5, 0.5],
                autoRotate: true,
                start: 1,
                end: 0,
            },
            duration: itemDuration,
            ease: 'none',
        }, i * itemStagger);
    });
}