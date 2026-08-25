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
    // Nothing is going to animate the hero in, so release the pre-paint start
    // states now rather than making the page wait out the head's 4s backstop
    document.documentElement.classList.remove('pre-paint');
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
        // Hand the pre-paint start states (declared in the site's head custom
        // code) over to GSAP. Same task as the inits, so no paint happens in
        // between and nothing flashes; the modules re-declare these states via
        // gsap.set() as inline styles, which outrank the class rules anyway
        document.documentElement.classList.remove('pre-paint');
        inits.forEach((initFn) => initFn());
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

