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

// HERO BACKGROUND FILL
// The hero background is one flat image (a grid of beige/white cells, plus a few
// dark ones) pinned full-screen behind the page. The next section is solid beige and
// slides up over it, leaving a hard edge where the image's white bottom meets it.
// A canvas laid between the image and the orange circle fills the white and dark
// cells with beige, bottom to top, as the hero scrolls away, so the whole screen is
// beige by the time the next section arrives. The orange circle shows the same
// pattern in orange (its own fixed background, aligned with the image), so a second
// canvas, clipped to the circle, fills the same cells with orange at the same moment
// and the pattern stays continuous across the circle's edge. The fill follows scroll
// progress, so scrolling back up empties the cells again.

// Cell grid of services_bg_pattern_beige.avif, measured on its 2880x1800 original.
// Cells aren't square, and the export isn't perfectly even (rows drift by up to
// ~4px), so this is only the starting estimate: each line is then snapped to the
// edges actually found in the image (see measureLines).
const HERO_BG_GRID = {
    width: 2880,
    height: 1800,
    cellW: 17.3714,
    cellH: 18.64,
    // left/top edge of the first full column/row; anything before it is a partial cell
    offsetX: 9.19,
    offsetY: 6.6,
};
const HERO_FILL_COLOR = '#ede5de';
// Orange of services_bg_pattern_orange.avif (the circle's background)
const HERO_FILL_CIRCLE_COLOR = '#fe6f3f';
// The fill completes when this share of the hero has scrolled past the top
const HERO_FILL_END = '70% top';
// Height of the dithered front, as a share of the fill: 0 = a hard horizontal
// line sweeping up, 1 = cells fill at random with no direction at all
const HERO_FILL_BAND = 0.3;
// Front starts fast so the edge above the incoming section dissolves within the
// first bit of scroll, then slows down as it climbs
const HERO_FILL_EASE = 'power1.out';

// Cell kinds read from the image. CELL_WHITE (any white in them) and CELL_DARK cells
// get filled; beige ones already match.
const CELL_BEIGE = 0;
const CELL_WHITE = 1;
const CELL_DARK = 2;

// Grid line positions (in the image's 2880px units) for one axis, from the image
// itself. `edges[i]` counts colour changes between sample pixel i-1 and i along that
// axis; each estimated line moves to the centroid of the changes around it. Lines
// with too few changes nearby (large plain areas) keep the drift of their measured
// neighbours, interpolated.
function measureLines(size, offset, pitch, edges, toSample) {
    const lines = [0];
    for (let position = offset; position < size; position += pitch) { lines.push(position) }
    lines.push(size);

    const window = Math.max(1, Math.floor((pitch * toSample) / 3));
    const drift = new Array(lines.length).fill(null);
    drift[0] = 0;
    drift[lines.length - 1] = 0;
    for (let j = 1; j < lines.length - 1; j++) {
        const center = lines[j] * toSample;
        const lo = Math.max(1, Math.round(center) - window);
        const hi = Math.min(edges.length - 1, Math.round(center) + window);
        let count = 0;
        let weighted = 0;
        for (let i = lo; i <= hi; i++) {
            count += edges[i];
            weighted += i * edges[i];
        }
        if (count >= 8) { drift[j] = weighted / count / toSample - lines[j] }
    }

    // fill the gaps: linear between the nearest measured lines on either side
    for (let j = 1; j < lines.length - 1; j++) {
        if (drift[j] !== null) { continue }
        let before = j - 1;
        while (drift[before] === null) { before-- }
        let after = j + 1;
        while (drift[after] === null) { after++ }
        // the image borders aren't real measurements: don't pull drift towards 0 there
        const from = before === 0 && after < lines.length - 1 ? drift[after] : drift[before];
        const to = after === lines.length - 1 && before > 0 ? drift[before] : drift[after];
        drift[j] = from + ((to - from) * (j - before)) / (after - before);
    }

    return lines.map((line, j) => Math.min(Math.max(line + drift[j], 0), size));
}

function initHeroBackgroundFill(hero) {
    const wrapper = hero.querySelector('.services-background-wrapper');
    const img = wrapper?.querySelector('img.bg_img');
    const src = img?.getAttribute('src');
    if (!img || !src || typeof createImageBitmap !== 'function') { return }

    const createCanvas = (className) => {
        const element = document.createElement('canvas');
        element.className = className;
        element.setAttribute('aria-hidden', 'true');
        Object.assign(element.style, { position: 'fixed', pointerEvents: 'none' });
        return element;
    };
    // Right after the image: above it, below the orange circle (same stacking
    // context, painted in DOM order)
    const canvas = createCanvas('services-background-fill');
    img.after(canvas);
    // Right after the circle, clipped to it (see syncCircleClip)
    const circle = wrapper.querySelector('.services-background-circle');
    const circleCanvas = circle ? createCanvas('services-background-fill-circle') : null;
    circle?.after(circleCanvas);
    const layers = [
        { canvas, ctx: canvas.getContext('2d'), color: HERO_FILL_COLOR },
        circleCanvas && { canvas: circleCanvas, ctx: circleCanvas.getContext('2d'), color: HERO_FILL_CIRCLE_COLOR },
    ].filter(Boolean);

    let colLines = null; // cell edges, in the image's 2880px units
    let rowLines = null;
    let cellTypes = null; // Uint8Array of CELL_*, one per cell, row by row
    let darkBoxes = new Map(); // dark cell id -> [x0, y0, x1, y1] of its dot, in 2880px units
    let cols = 0;
    let rows = 0;
    let cells = []; // visible cells to fill, sorted by the progress at which they fill
    let rankOf = null; // Int32Array: cell id -> index in `cells` (-1 if not filled)
    let drawn = 0; // cells[0..drawn) are currently painted
    let progress = 0;

    // Same seed every time, so the fill pattern is identical across resizes/reloads
    const random = (seed) => {
        let t = (seed + 0x6d2b79f5) | 0;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    // Read the full-size image once: find its exact grid lines and each cell's colour.
    // Reading the image (instead of hardcoding a map) keeps this working if the
    // pattern is re-exported on the same grid.
    async function readCells() {
        const response = await fetch(src, { mode: 'cors' });
        const bitmap = await createImageBitmap(await response.blob());
        const { width, height, cellW, cellH, offsetX, offsetY } = HERO_BG_GRID;
        // grid constants are in 2880px units; sample at half that
        const toSample = (bitmap.width / width) * 0.5;
        const sw = Math.round(width * toSample);
        const sh = Math.round(height * toSample);
        const sample = document.createElement('canvas');
        sample.width = sw;
        sample.height = sh;
        const sctx = sample.getContext('2d', { willReadFrequently: true });
        sctx.drawImage(bitmap, 0, 0, sw, sh);
        bitmap.close?.();
        const data = sctx.getImageData(0, 0, sw, sh).data;

        // white (255) vs beige (229) / dark, on the green channel
        const isLight = (x, y) => data[(y * sw + x) * 4 + 1] > 242;
        const colEdges = new Uint32Array(sw);
        const rowEdges = new Uint32Array(sh);
        for (let y = 0; y < sh; y++) {
            for (let x = 0; x < sw; x++) {
                const light = isLight(x, y);
                if (x > 0 && light !== isLight(x - 1, y)) { colEdges[x]++ }
                if (y > 0 && light !== isLight(x, y - 1)) { rowEdges[y]++ }
            }
        }
        colLines = measureLines(width, offsetX, cellW, colEdges, toSample);
        rowLines = measureLines(height, offsetY, cellH, rowEdges, toSample);
        cols = colLines.length - 1;
        rows = rowLines.length - 1;

        // A few squares in the export sit slightly off the grid, so a cell can be
        // beige in the middle with a strip of white inside it. Any pure white inside
        // a cell (away from its soft edges) makes it a cell to fill: painting beige
        // over its beige part changes nothing.
        const inside = (from, to) => [
            Math.max(Math.ceil(from + (to - from) * 0.15), 0),
            Math.floor(to - (to - from) * 0.15),
        ];
        const isWhitePixel = (i) => data[i] > 250 && data[i + 1] > 250 && data[i + 2] > 250;
        // The dots don't sit exactly on the grid either, and their soft edges show
        // up clearly on beige. Measure each dot's real extent (anything darker than
        // the beige, within a cell's reach of its centre) so the fill can cover it.
        const measureDot = (cx, cy, reach) => {
            let x0 = cx;
            let y0 = cy;
            let x1 = cx;
            let y1 = cy;
            const span = Math.ceil(reach);
            for (let y = Math.max(cy - span, 0); y <= Math.min(cy + span, sh - 1); y++) {
                for (let x = Math.max(cx - span, 0); x <= Math.min(cx + span, sw - 1); x++) {
                    if (data[(y * sw + x) * 4 + 1] >= 222) { continue }
                    x0 = Math.min(x0, x);
                    y0 = Math.min(y0, y);
                    x1 = Math.max(x1, x);
                    y1 = Math.max(y1, y);
                }
            }
            // back to 2880px units, one sample pixel of margin on every side
            return [x0 - 1, y0 - 1, x1 + 2, y1 + 2].map((value) => value / toSample);
        };
        darkBoxes = new Map();
        cellTypes = new Uint8Array(cols * rows);
        for (let r = 0; r < rows; r++) {
            const [top, bottom] = inside(rowLines[r] * toSample, rowLines[r + 1] * toSample);
            const cy = Math.min(Math.floor(((rowLines[r] + rowLines[r + 1]) / 2) * toSample), sh - 1);
            for (let c = 0; c < cols; c++) {
                const [left, right] = inside(colLines[c] * toSample, colLines[c + 1] * toSample);
                const cx = Math.min(Math.floor(((colLines[c] + colLines[c + 1]) / 2) * toSample), sw - 1);
                // the dots are dark (~34), the beige is 238,229,222
                if (data[(cy * sw + cx) * 4 + 1] < 150) {
                    cellTypes[r * cols + c] = CELL_DARK;
                    darkBoxes.set(r * cols + c, measureDot(cx, cy, (colLines[c + 1] - colLines[c]) * toSample));
                    continue;
                }
                let type = CELL_BEIGE;
                for (let y = top; y <= Math.min(bottom, sh - 1) && type === CELL_BEIGE; y++) {
                    for (let x = left; x <= Math.min(right, sw - 1); x++) {
                        if (isWhitePixel((y * sw + x) * 4)) {
                            type = CELL_WHITE;
                            break;
                        }
                    }
                }
                cellTypes[r * cols + c] = type;
            }
        }
    }

    // Map the grid onto the screen the same way object-fit: cover places the image,
    // and work out when each visible white cell fills
    function layout() {
        if (!cellTypes) { return }

        const box = img.getBoundingClientRect();
        if (box.width === 0 || box.height === 0) { return }
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        layers.forEach((layer) => {
            Object.assign(layer.canvas.style, {
                left: `${box.left}px`,
                top: `${box.top}px`,
                width: `${box.width}px`,
                height: `${box.height}px`,
            });
            layer.canvas.width = Math.round(box.width * dpr);
            layer.canvas.height = Math.round(box.height * dpr);
        });
        syncCircleClip(true);

        const { width, height } = HERO_BG_GRID;
        const scale = Math.max(box.width / width, box.height / height);
        const [posX, posY] = getComputedStyle(img).objectPosition.split(' ')
            .map((value) => (value.endsWith('%') ? parseFloat(value) / 100 : 0.5));
        const dx = (box.width - width * scale) * posX;
        const dy = (box.height - height * scale) * posY;

        // Shared, rounded cell edges in device pixels: neighbouring cells meet with
        // no gaps or overlaps
        const xs = colLines.map((x) => Math.round((dx + x * scale) * dpr));
        const ys = rowLines.map((y) => Math.round((dy + y * scale) * dpr));

        // The image's cell edges are soft (resampled), so a square cut exactly on the
        // edge leaves a faint light outline where it meets a beige cell. Each square
        // bleeds a little into its beige neighbours to hide it, and each dark cell
        // covers its whole measured dot. Beige cells are never drawn themselves; where
        // two squares' bleeds overlap, render() repaints the one still filled.
        const bleed = Math.max(1, Math.round(dpr));
        const typeAt = (r, c) => (r >= 0 && r < rows && c >= 0 && c < cols ? cellTypes[r * cols + c] : -1);
        const isBeige = (r, c) => typeAt(r, c) === CELL_BEIGE;
        const isFilled = (r, c) => typeAt(r, c) === CELL_WHITE || typeAt(r, c) === CELL_DARK;
        const toDeviceX = (x) => (dx + x * scale) * dpr;
        const toDeviceY = (y) => (dy + y * scale) * dpr;

        cells = [];
        for (let r = 0; r < rows; r++) {
            const y0 = ys[r];
            const y1 = ys[r + 1];
            if (y1 <= 0 || y0 >= canvas.height || y1 === y0) { continue }
            // 0 at the bottom of the screen, 1 at the top
            const fromBottom = Math.min(Math.max(1 - (y0 + y1) / 2 / canvas.height, 0), 1);
            for (let c = 0; c < cols; c++) {
                const x0 = xs[c];
                const x1 = xs[c + 1];
                if (!isFilled(r, c) || x1 <= 0 || x0 >= canvas.width || x1 === x0) { continue }

                const id = r * cols + c;
                const rects = [[x0, y0, x1 - x0, y1 - y0]];
                const dot = darkBoxes.get(id);
                if (dot) {
                    const left = Math.min(x0, Math.floor(toDeviceX(dot[0])));
                    const top = Math.min(y0, Math.floor(toDeviceY(dot[1])));
                    const right = Math.max(x1, Math.ceil(toDeviceX(dot[2])));
                    const bottom = Math.max(y1, Math.ceil(toDeviceY(dot[3])));
                    rects[0] = [left, top, right - left, bottom - top];
                } else {
                    if (isBeige(r - 1, c)) { rects.push([x0, y0 - bleed, x1 - x0, bleed]) }
                    if (isBeige(r + 1, c)) { rects.push([x0, y1, x1 - x0, bleed]) }
                    if (isBeige(r, c - 1)) { rects.push([x0 - bleed, y0, bleed, y1 - y0]) }
                    if (isBeige(r, c + 1)) { rects.push([x1, y0, bleed, y1 - y0]) }
                }

                const at = fromBottom * (1 - HERO_FILL_BAND) + random(id) * HERO_FILL_BAND;
                cells.push({ at, rects, id });
            }
        }
        cells.sort((a, b) => a.at - b.at);
        rankOf = new Int32Array(cols * rows).fill(-1);
        cells.forEach((cell, index) => { rankOf[cell.id] = index });

        // Resizing the canvases wiped them (and their fill style): repaint up to the
        // current progress
        drawn = 0;
        layers.forEach((layer) => { layer.ctx.fillStyle = layer.color });
        render(progress);
    }

    // The circle scrolls with the hero while its pattern stays fixed to the screen,
    // so its fill canvas (fixed, full-screen) is clipped to wherever the circle is.
    // Runs every frame while the hero is on screen: the circle can also move or
    // resize without a scroll (intro animations, breakpoints).
    let lastClip = '';
    function syncCircleClip(force = false) {
        if (!circleCanvas || (!heroOnScreen && !force)) { return }
        const area = circleCanvas.getBoundingClientRect();
        const rect = circle.getBoundingClientRect();
        const clip = `ellipse(${rect.width / 2}px ${rect.height / 2}px at ${rect.left + rect.width / 2 - area.left}px ${rect.top + rect.height / 2 - area.top}px)`;
        if (clip !== lastClip) {
            circleCanvas.style.clipPath = clip;
            lastClip = clip;
        }
    }
    let heroOnScreen = true;
    if (circleCanvas) {
        ScrollTrigger.create({
            trigger: hero,
            start: 'top bottom',
            end: 'bottom top',
            onToggle: (self) => { heroOnScreen = self.isActive },
        });
        gsap.ticker.add(() => syncCircleClip());
    }

    function render(value) {
        progress = value;
        if (cells.length === 0) { return }

        // number of cells whose fill point has been reached
        let lo = 0;
        let hi = cells.length;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (cells[mid].at <= value) { lo = mid + 1 } else { hi = mid }
        }

        const fill = (ctx, cell) => cell.rects.forEach(([x, y, w, h]) => ctx.fillRect(x, y, w, h));
        if (lo > drawn) {
            layers.forEach(({ ctx }) => {
                for (let i = drawn; i < lo; i++) { fill(ctx, cells[i]) }
            });
        } else if (lo < drawn) {
            // Bleeds of cells up to two apart can overlap (both reaching into the beige
            // cell between them), so clearing a cell can nick a neighbour that's still
            // filled: repaint those neighbours afterwards.
            const repaint = new Set();
            for (let i = lo; i < drawn; i++) {
                const r = Math.floor(cells[i].id / cols);
                const c = cells[i].id % cols;
                for (let nr = Math.max(r - 2, 0); nr <= Math.min(r + 2, rows - 1); nr++) {
                    for (let nc = Math.max(c - 2, 0); nc <= Math.min(c + 2, cols - 1); nc++) {
                        const rank = rankOf[nr * cols + nc];
                        if (rank !== -1 && rank < lo) { repaint.add(rank) }
                    }
                }
            }
            layers.forEach(({ ctx }) => {
                for (let i = lo; i < drawn; i++) {
                    cells[i].rects.forEach(([x, y, w, h]) => ctx.clearRect(x, y, w, h));
                }
                repaint.forEach((rank) => fill(ctx, cells[rank]));
            });
        }
        drawn = lo;
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

    // ScrollTrigger skips refreshes for mobile address-bar resizes, but the fixed
    // image still changes size: follow the image directly
    new ResizeObserver(() => layout()).observe(img);

    readCells()
        .then(layout)
        .catch((error) => {
            console.error('Hero background fill: could not read the background image', error);
            layers.forEach((layer) => layer.canvas.remove());
        });
}

export function services() {
    const servicesHeroSection = document.querySelector('.section-services-hero');
    if (!servicesHeroSection) { return }

    initProcessTags(document);
    initProcessCircleLabels(document);
    initHeroBackgroundFill(servicesHeroSection);


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