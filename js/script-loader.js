// Cache-busted dynamic imports: jsdelivr/browsers cache static `import` specifiers
// hard (branch-alias staleness even after purge). A fresh query param per load
// forces a real fetch every time, so pushes to main show up immediately
const v = Date.now();

// Add a script here to have it loaded and initialized automatically
const modules = [
    { path: 'main', exportName: 'mainInit' },
    { path: 'scroll-video-v1', exportName: 'scrollVideo' },
    { path: 'menu', exportName: 'navBarMenu' },
    { path: 'homepage', exportName: 'homepage' },
    { path: 'hp-map', exportName: 'homepageMap' },
    { path: 'swiper', exportName: 'swiperInit' },
    { path: 'services', exportName: 'services' },
    { path: 'works', exportName: 'works' },
    { path: 'form', exportName: 'form' },
    { path: 'faqs', exportName: 'faqs' },
    { path: 'process', exportName: 'process' },
    { path: 'footer-date', exportName: 'footerDate' },
    { path: 'next-page', exportName: 'nextPage' },
    { path: 'navbar-color-handler', exportName: 'navbarColorHandler' },
    { path: 'reveals', exportName: 'reveals' },
];

let inits = [];
try {
    const loaded = await Promise.all(
        modules.map(({ path }) => import(`./${path}.js?v=${v}`))
    );
    inits = loaded.map((mod, i) => mod[modules[i].exportName]);
} catch (err) {
    console.error('Failed to load one or more scripts:', err);
}

window.tabletBreakpoint = 991;
window.mobileBreakpoint = 767;

// Opt out of the browser restoring the previous scroll position on refresh
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

function init() {
    // scroll to top of page before any scripts load (including lenis init)
    window.scrollTo(0, 0);
    document.fonts.ready.then(() => {
        inits.forEach((initFn) => initFn());
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

console.log("Running V1 version - august 25th 2026");
