import {
    HERO_PATTERN_COLUMNS,
    HERO_PATTERN_ROWS,
    HERO_PATTERN_SQUARES,
    HERO_PATTERN_DARK,
    HERO_PATTERN_CIRCLE,
} from './services-hero-pattern.js';

const PROCESS_TAG_CONTENT = {
    'master-planning': {
        bullets: [
            'Develops or improves land, community, or buildings',
            'Envisions through a long-range plan',
            'Balances and harmonizes all elements',
        ],
        tagline: '// An overarching planning document used to structure land use and development',
    },
    'architecture': {
        bullets: [
            'Includes planning, studies, and design development',
            'Specifications and working drawings',
            'General administration of construction contracts',
        ],
        tagline: '// The art and science of designing buildings and structures',
    },
    'feasibility': {
        bullets: [
            'Analyzes and evaluates a proposed project',
            'Determines if it´s technically feasible',
            'Evalutates within the estimated cost parameters',
        ],
        tagline: '// An assessment of the practicality of a proposed plan or method',
    },
    'project-management': {
        bullets: [
            'The art or practice of planning',
            'Assistance in getting a project off the ground',
            'Achieve specific goals',
        ],
        tagline: '// The practice of initiaing, planning, and executing the work of a team to achieve specific goals and meet specific success criteria at the right time',
    },
    'building-survey': {
        bullets: [
            'Documents walls, floors, and roof conditions',
            'Documents existing building structure',
            'Verifies any other major building elements',
        ],
        tagline: '// Documentation of the conditions within an existing structure',
    },
    'rendering': {
        bullets: [
            'Interprets ideas in visual terms',
            'Puts into visible form',
        ],
        tagline: "// To reproduce or represent by artistic means",
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

// HERO BACKGROUND
// The hero background is drawn here instead of being an image: the design's grid of
// beige squares (dense at the top, thinning out downwards), a few dark squares, and
// an orange circle showing the same squares in orange. Pattern, dark squares and
// circle are all set in grid cells (services-hero-pattern.js), so the squares inside
// the circle are the very same cells as outside and line up exactly.
//
// The grid covers the screen like object-fit: cover, from the top, and stays still
// while the hero scrolls away; the circle scrolls with the hero. On the way out, the
// squares turn into the next section's look, bottom to top: plain beige on desktop,
// inverted on mobile (beige background, white squares). Then the grid leaves with the
// top of the next section. Scrolling back up turns them back.

const HERO_COLORS = ['#ffffff', '#ede5de', '#ff6e3e', '#2b2b2b'];
const HERO_WHITE = 0;
const HERO_BEIGE = 1;
const HERO_ORANGE = 2;
const HERO_DARK = 3;

// Colour of each kind of cell [before, after] the transition, on the grid and inside
// the circle. Kinds: empty, square, dark square on an empty cell, dark square on a
// square. Dark squares sit under the circle in the design, so it shows the cell below.
const HERO_LOOKS = {
    // desktop: everything ends beige (the circle orange)
    plain: {
        grid: [[HERO_WHITE, HERO_BEIGE], [HERO_BEIGE, HERO_BEIGE], [HERO_DARK, HERO_BEIGE], [HERO_DARK, HERO_BEIGE]],
        circle: [[HERO_WHITE, HERO_ORANGE], [HERO_ORANGE, HERO_ORANGE], [HERO_WHITE, HERO_ORANGE], [HERO_ORANGE, HERO_ORANGE]],
    },
    // mobile: every cell swaps colours
    inverted: {
        grid: [[HERO_WHITE, HERO_BEIGE], [HERO_BEIGE, HERO_WHITE], [HERO_DARK, HERO_BEIGE], [HERO_DARK, HERO_WHITE]],
        circle: [[HERO_WHITE, HERO_ORANGE], [HERO_ORANGE, HERO_WHITE], [HERO_WHITE, HERO_ORANGE], [HERO_ORANGE, HERO_WHITE]],
    },
};

// The transition completes when this share of the hero has scrolled past the top
const HERO_FILL_END = '70% top';
// Height of the dithered front, as a share of the transition: 0 = a hard horizontal
// line sweeping up, 1 = cells turn at random with no direction at all
const HERO_FILL_BAND = 0.3;
// Front starts fast so the edge above the incoming section dissolves within the
// first bit of scroll, then slows down as it climbs
const HERO_FILL_EASE = 'power1.out';

// One kind (see HERO_LOOKS) per cell, row by row
function decodeHeroPattern() {
    const bytes = atob(HERO_PATTERN_SQUARES.replace(/\s/g, ''));
    const kinds = new Uint8Array(HERO_PATTERN_COLUMNS * HERO_PATTERN_ROWS);
    for (let i = 0; i < kinds.length; i++) {
        kinds[i] = (bytes.charCodeAt(i >> 3) >> (7 - (i & 7))) & 1;
    }
    HERO_PATTERN_DARK.forEach(([column, row]) => { kinds[row * HERO_PATTERN_COLUMNS + column] |= 2 });
    return kinds;
}

function initHeroBackground(hero) {
    const wrapper = hero.querySelector('.services-background-wrapper');
    if (!wrapper) { return }

    const kinds = decodeHeroPattern();
    const columns = HERO_PATTERN_COLUMNS;
    const mobileQuery = window.matchMedia('(max-width: 767px)');

    const createCanvas = () => {
        const element = document.createElement('canvas');
        element.setAttribute('aria-hidden', 'true');
        Object.assign(element.style, { display: 'block', opacity: '0', transition: 'opacity 0.6s ease' });
        return element;
    };

    // The grid: a sticky canvas in a track running from the top of the hero to one
    // screen into the next section, so it holds still at the top of the screen until
    // the hero has scrolled past, then leaves with the next section. The track sits
    // behind the hero (both z-index -1, the track first) and the next section (made
    // transparent in services.css).
    const track = document.createElement('div');
    track.className = 'services-background-track';
    track.setAttribute('aria-hidden', 'true');
    Object.assign(track.style, { position: 'absolute', left: '0', width: '100%', zIndex: '-1', pointerEvents: 'none' });
    const canvas = createCanvas();
    Object.assign(canvas.style, { position: 'sticky', top: '0', width: '100%' });
    track.append(canvas);
    hero.before(track);

    // The circle's squares: a canvas fixed to the screen like the grid, inside the
    // circle and clipped to it. Wherever the circle has scrolled to, it shows the
    // cells of the grid behind it, with no script keeping the two in step.
    const circle = wrapper.querySelector('.services-background-circle');
    let circleCanvas = null;
    if (circle) {
        circleCanvas = createCanvas();
        Object.assign(circleCanvas.style, { position: 'fixed', top: '0' });
        circle.append(circleCanvas);
        Object.assign(circle.style, {
            position: 'absolute',
            margin: '0',
            maxWidth: 'none',
            maxHeight: 'none',
            clipPath: 'circle(50%)',
        });
    }

    const layers = [
        { canvas, look: 'grid' },
        circleCanvas && { canvas: circleCanvas, look: 'circle' },
    ].filter(Boolean).map((layer) => ({ ...layer, ctx: layer.canvas.getContext('2d'), cells: [], drawn: 0 }));

    let progress = 0;
    let shown = false;

    // Same seed every time, so the order cells turn in is identical across resizes/reloads
    const random = (seed) => {
        let t = (seed + 0x6d2b79f5) | 0;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    // Paint a layer's cells in [columnFrom, columnTo) x [0, rowTo) at the current
    // progress, and list the ones that change colour, sorted by when they do
    function paintLayer(layer, looks, grid, columnFrom, columnTo, rowTo, offsetX) {
        const { ctx, canvas: element } = layer;
        const { xs, ys, rowAt } = grid;
        const look = looks[layer.look];
        ctx.fillStyle = HERO_COLORS[HERO_WHITE];
        ctx.fillRect(0, 0, element.width, element.height);

        const byColor = HERO_COLORS.map(() => []);
        layer.cells = [];
        for (let row = 0; row < rowTo; row++) {
            const y = ys(row);
            const height = ys(row + 1) - y;
            if (height === 0) { continue }
            for (let column = columnFrom; column < columnTo; column++) {
                const x = xs[column] - offsetX;
                const width = xs[column + 1] - xs[column];
                if (width === 0) { continue }
                // past the bottom of the pattern (very tall screens): empty cells
                const kind = row < HERO_PATTERN_ROWS ? kinds[row * columns + column] : 0;
                const [from, to] = look[kind];
                const cell = { x, y, width, height, from, to, at: rowAt(row) + random(row * columns + column) * HERO_FILL_BAND };
                if (from !== to) { layer.cells.push(cell) }
                byColor[cell.at <= progress ? to : from].push(cell);
            }
        }
        byColor.forEach((cells, color) => {
            if (color === HERO_WHITE || cells.length === 0) { return }
            ctx.fillStyle = HERO_COLORS[color];
            cells.forEach(({ x, y, width, height }) => ctx.fillRect(x, y, width, height));
        });
        layer.cells.sort((a, b) => a.at - b.at);
        layer.drawn = countReached(layer.cells, progress);
    }

    // Number of cells (sorted by `at`) that have turned at `value`
    function countReached(cells, value) {
        let lo = 0;
        let hi = cells.length;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (cells[mid].at <= value) { lo = mid + 1 } else { hi = mid }
        }
        return lo;
    }

    function layout() {
        const width = document.documentElement.clientWidth;
        // The grid is sized on the hero's height (100svh), not the window's: on mobile
        // the window grows and shrinks with the address bar while scrolling, which would
        // rescale the squares mid-scroll. The canvas still covers the whole window.
        const heroHeight = hero.offsetHeight;
        const height = window.innerHeight;
        if (!width || !heroHeight || !height) { return }

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const cell = Math.max(width / columns, heroHeight / HERO_PATTERN_ROWS);
        const left = (width - columns * cell) / 2;
        // Cell edges in device pixels, shared by neighbours: no gaps, no overlaps
        const grid = {
            xs: Array.from({ length: columns + 1 }, (_, i) => Math.round((left + i * cell) * dpr)),
            ys: (row) => Math.round(row * cell * dpr),
            // when a row starts turning: 0 at the bottom of the hero, up to 1 - band at the top
            rowAt: (row) => Math.min(Math.max(1 - ((row + 0.5) * cell) / heroHeight, 0), 1) * (1 - HERO_FILL_BAND),
        };
        const looks = mobileQuery.matches ? HERO_LOOKS.inverted : HERO_LOOKS.plain;
        const deviceWidth = Math.round(width * dpr);
        // only the columns on screen (the grid is wider than the screen on mobile)
        const columnFrom = Math.max(grid.xs.findIndex((x) => x > 0) - 1, 0);
        const lastEdge = grid.xs.findIndex((x) => x >= deviceWidth);
        const columnTo = lastEdge === -1 ? columns : lastEdge;
        const rowTo = Math.ceil(height / cell);

        track.style.top = `${hero.offsetTop}px`;
        track.style.height = `${heroHeight + height}px`;
        canvas.style.height = `${height}px`;
        canvas.width = deviceWidth;
        canvas.height = Math.round(height * dpr);
        paintLayer(layers[0], looks, grid, columnFrom, columnTo, rowTo, 0);

        if (circleCanvas) {
            const { x, y, radius } = HERO_PATTERN_CIRCLE;
            const size = 2 * radius * cell;
            const centerX = left + x * cell;
            const centerY = y * cell;
            // Where the grid's circle is with the hero at the top of the screen, in the
            // wrapper's coordinates
            const wrapperBox = wrapper.getBoundingClientRect();
            const heroBox = hero.getBoundingClientRect();
            Object.assign(circle.style, {
                left: `${centerX - size / 2 - wrapperBox.left}px`,
                top: `${heroBox.top - wrapperBox.top + centerY - size / 2}px`,
                width: `${size}px`,
                height: `${size}px`,
            });

            // Only the columns the circle spans, and the rows down to its bottom (it
            // only ever scrolls up from there). Starts on a device pixel so its cells
            // land exactly on the grid's.
            const circleFrom = Math.max(Math.floor(x - radius) - 1, 0);
            const circleTo = Math.min(Math.ceil(x + radius) + 1, columns);
            const circleRows = Math.ceil(y + radius) + 1;
            const offsetX = grid.xs[circleFrom];
            Object.assign(circleCanvas.style, {
                left: `${offsetX / dpr}px`,
                width: `${(grid.xs[circleTo] - offsetX) / dpr}px`,
                height: `${grid.ys(circleRows) / dpr}px`,
            });
            circleCanvas.width = grid.xs[circleTo] - offsetX;
            circleCanvas.height = grid.ys(circleRows);
            paintLayer(layers[1], looks, grid, circleFrom, circleTo, circleRows, offsetX);
        }

        if (!shown) {
            shown = true;
            requestAnimationFrame(() => layers.forEach((layer) => { layer.canvas.style.opacity = '1' }));
        }
    }

    // Repaint only the cells that changed colour since the last call
    function render(value) {
        progress = value;
        layers.forEach((layer) => {
            const { cells, ctx } = layer;
            const reached = countReached(cells, value);
            if (reached === layer.drawn) { return }
            const forward = reached > layer.drawn;
            const [start, end] = forward ? [layer.drawn, reached] : [reached, layer.drawn];
            let fillColor = -1;
            for (let i = start; i < end; i++) {
                const { x, y, width, height, from, to } = cells[i];
                const color = forward ? to : from;
                if (color !== fillColor) {
                    ctx.fillStyle = HERO_COLORS[color];
                    fillColor = color;
                }
                ctx.fillRect(x, y, width, height);
            }
            layer.drawn = reached;
        });
    }

    const ease = gsap.parseEase(HERO_FILL_EASE);
    ScrollTrigger.create({
        trigger: hero,
        start: 'top top',
        end: HERO_FILL_END,
        onUpdate: (self) => render(ease(self.progress)),
        onRefresh: (self) => {
            progress = ease(self.progress);
            layout();
        },
    });

    // ScrollTrigger skips refreshes for mobile address-bar resizes, but the canvas
    // still has to cover the window
    let pending = false;
    const scheduleLayout = () => {
        if (pending) { return }
        pending = true;
        requestAnimationFrame(() => {
            pending = false;
            layout();
        });
    };
    window.addEventListener('resize', scheduleLayout);
    mobileQuery.addEventListener('change', scheduleLayout);
    layout();
}

export function services() {
    const servicesHeroSection = document.querySelector('.section-services-hero');
    if (!servicesHeroSection) { return }

    initProcessTags(document);
    initProcessCircleLabels(document);
    initHeroBackground(servicesHeroSection);


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
    if (brandCarouselSection && window.innerWidth > 767) {

        // CURVED PARTNER-LOGO CAROUSEL
        gsap.registerPlugin(MotionPathPlugin);

        // Skip the mobile-only second track (.hide-desktop): its items would
        // otherwise join the path queue and double the pinned scroll length.
        const carouselItems = gsap.utils.toArray(
            '.brand-carousel-track:not(.hide-desktop) .brand-carousel-item',
            brandCarouselSection
        );
        if (carouselItems.length === 0) { return }

        let itemStagger = .135;
        let itemDuration = 1.5;

        // Share of each item's run spent fading in (opacity 0 -> 1). 0.14 covers the
        // entrance tail: progress 1 -> ~0.91 is above the viewBox, and ~0.86 is where
        // the vertical stretch meets the curve, so logos are fully visible by then
        const FADE_IN_SHARE = 0.14;

        if (window.innerWidth < 991) {
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
                    start: 1,
                    end: 1,
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
                    // Travelling 1 -> 0 makes autoRotate face backwards along
                    // the path; the 180 offset keeps logos upright.
                    autoRotate: 180,
                    start: 1,
                    end: 0,
                },
                duration: itemDuration,
                ease: 'none',
            }, i * itemStagger);

            // fade in while entering, on the same scrubbed timeline so scrolling back
            // fades it out again. fromTo renders opacity 0 immediately, so every
            // logo starts hidden on load
            carouselTimeline.fromTo(item, {
                opacity: 0,
            }, {
                opacity: 1,
                duration: itemDuration * FADE_IN_SHARE,
                ease: 'none',
            }, i * itemStagger);
        });
    } else if (brandCarouselSection) {

        // MOBILE MARQUEE
        // The scroll itself is the Webflow interaction "Brand Carousel Marquee
        // (mobile)": the first track runs xPercent 0 -> -50, the second
        // (.hide-desktop) -50 -> 0, both repeating. Doubling each track's items
        // makes +/-50% land exactly on the copy of item 1, so the loop is
        // seamless; the track's mobile padding-right (= its gap) keeps the
        // halves equal.
        brandCarouselSection.querySelectorAll('.brand-carousel-track').forEach((track) => {
            track.querySelectorAll('.brand-carousel-item').forEach((item) => {
                const clone = item.cloneNode(true);
                clone.setAttribute('aria-hidden', 'true');
                track.appendChild(clone);
            });
        });
    }
}