# White-label Defaults

Shared JS/CSS asset bundle served via jsDelivr and embedded as custom code across Forwwward's Webflow sites. Rather than being built/bundled per project, this repo is loaded directly from the CDN. The Consortium site loads it from a **pinned commit**, so a push to `main` only goes live once that commit hash is updated in Webflow and the site is published — see [Pinned commit (Webflow)](#pinned-commit-webflow).

## How it loads

[`js/script-loader.js`](js/script-loader.js) is the single entry point embedded in Webflow. It:

- Cache-busts every module import with a `Date.now()` query param, so browsers never serve a stale copy of the modules at the loaded commit (or from the local dev server).
- Dynamically imports and initializes each feature module (`main`, `menu`, `swiper`, `works`, `form`, `faqs`, `footer-date`) once fonts are ready, on `DOMContentLoaded`.
- Exposes global breakpoints (`window.tabletBreakpoint = 991`, `window.mobileBreakpoint = 767`) for other modules to consume.

Add a new module to the `modules` array in `script-loader.js` to have it loaded and initialized automatically.

## Pinned commit (Webflow)

The Consortium site (`fwd-consortium.webflow.io`) doesn't load `@main`. It loads a specific commit, pinned by its full hash:

```
https://cdn.jsdelivr.net/gh/dev-forwwward/Consortium@<commit-hash>/<path>
```

> **Rule: every commit that lands on `main` gets pinned.** After each push to `main` (merges included), update **all four places below** to the new commit's full hash, so the site always runs the latest `main` and every file comes from the same commit. No exceptions for "small" or docs-only commits.

| # | Where in Webflow | What it loads |
|---|---|---|
| 1 | Site settings → [Custom code](https://webflow.com/dashboard/sites/fwd-consortium/custom-code) → Head code (`cdnHref`) | `css/styles.css` |
| 2 | Site settings → Custom code → Footer code (`cdnSrc`) | `js/script-loader.js` (it imports every module from the same commit) |
| 3 | Home page → hero video embed (class `video-loop_embed`) | `media/Consortium_idle-loop-mobile.mp4`, `media/Consortium_idle-loop-compressed.mp4` and the two `media/c-*-vid-poster.webp` posters |
| 4 | Home page → `video_background_container_outer` → attribute `data-frame-base` | `video/frames/` (the scroll-scrubbed hero frames) |

To see what's pinned right now, view the page source of the live site and search for `Consortium@`. (A hash written in this README would always be one commit behind: committing it creates a new commit.)

**To release a change:**

1. Merge it into `main` and push.
2. If the push touched `js/` or `css/`, wait for the README bot ([`update-readme.yml`](.github/workflows/update-readme.yml)) to push its `docs: auto-update README features [skip readme]` commit, then `git pull`. That commit is the new `main`.
3. Copy the full hash: `git rev-parse HEAD`.
4. Replace the old hash with the new one in **all four places** above, and save.
5. Check that the new URLs load: `curl -sI https://cdn.jsdelivr.net/gh/dev-forwwward/Consortium@<hash>/js/script-loader.js` should return `200`.
6. Publish the site. Until it's published, the live site keeps running the old commit (Designer changes and custom code only go live on publish).
7. Check it: the page source (or the Network tab) should show the new hash in every URL.

Pushing to `main` alone changes nothing on the live site, which also means a bad push can't break it: to roll back, put the previous hash back in all four places and publish.

The `Video Scroll Test v1` test page has its own `data-frame-base` pin; it isn't part of the live site and isn't kept up to date.

### Testing locally (`?dev=true`)

Add `?dev=true` to any page URL (e.g. `https://fwd-consortium.webflow.io/services?dev=true`) and the custom code loads `css/styles.css` and `js/script-loader.js` from `http://127.0.0.1:5500` instead of the pinned commit. Serve the repo root there with VS Code Live Server. It needs:

- **CORS on in Live Server:** add `"liveServer.settings.cors": true` to VS Code settings, then restart Live Server. The script loader is a module, and the browser blocks a module from another origin without an `Access-Control-Allow-Origin` header.
- **Chrome's local network access permission:** allow it when Chrome asks on the first `?dev=true` load. If it was blocked, re-allow it in the site settings (icon left of the URL).

If either is missing, the page **silently falls back to the pinned commit** while the CSS may still load locally, so it looks half-working. Check the console for `Local JS failed, loading CDN fallback...`. Also note `?dev=true` is read from the URL only: it's lost when you navigate to another page.

## Features

<!-- AUTO-GENERATED:FEATURES:START -->

_Regenerated automatically from the current contents of `js/` and `css/` on every push to `main` — see [`scripts/generate-readme.js`](scripts/generate-readme.js) and [`.github/workflows/update-readme.yml`](.github/workflows/update-readme.yml). Do not hand-edit inside this block; edit the script instead._

## JavaScript modules

### [`js/faqs.js`](js/faqs.js) — `faqs()`

- Initialize

### [`js/footer-date.js`](js/footer-date.js) — `footerDate()`

- Set dynamic date in Footer Components

### [`js/form-multistep-calendly.js`](js/form-multistep-calendly.js)

_Entire file is commented out — not currently active or wired into `script-loader.js`._

### [`js/form.js`](js/form.js) — `form()`

- Form validation
- Disable native HTML5 validation
- Find the field wrapper using jQuery
- Find the existing label-error-wrapper
- Append error to the existing wrapper
- Fallback to default behavior
- Radio Button
- Remove selected class from all s_cfo_radio elements
- Add selected class to the parent .s_cfo_radio of the checked input

### [`js/homepage.js`](js/homepage.js) — `homepage()`

- HERO REVEAL
- The logo and both text blocks start at opacity 0 from the head custom
- STICKY TEXT REVEAL
- Timeline runs on a 0 -> 1 scale: words reveal over the first 75%,
- the whole text fades out over the last 5%
- WORKS + TEXT SCROLLER
- 2. hand-off: the pile slides out, the end photo and both lines travel into their in-flow
- 3. release: the page scrolls on and the line slides left until "PILLARS" meets the right edge
- Cards are built once and kept: the scrubbed timeline fades them in, so
- scrolling back up replays the sequence in reverse.

### [`js/hp-map.js`](js/hp-map.js) — `homepageMap()`

- MAP RENDER
- MAP INTERFACE CONST
- MAP HINT
- the toggle buttons and the hint must never be visible together:
- activating the hint always hides the toggles, and showing the toggles always deactivates the hint
- MAP PINNING
- trigger: mapSectionTrigger,
- start: 'top top',
- pinSpacing: true,
- // while the map is active the toggles must stay visible, so the hint can't come back

### [`js/main.js`](js/main.js) — `mainInit()`

- LENIS
- Sync Lenis scrolling with ScrollTrigger
- This ensures Lenis's smooth scroll animation updates on each GSAP tick
- Disable lag smoothing in GSAP to prevent any delay in scroll animations
- List-Grid View Toggle
- clear previously active btn
- reset any open grid accordion items
- Text pin in About - text shrinks/tracks in from Body-L while its container widens
- Timeline in About
- set random left position for mock achievements in timeline

### [`js/menu.js`](js/menu.js) — `navBarMenu()`

- NAV MENU
- Hide initially with class
- CLOSE MENU
- Restore scroll
- OPEN MENU
- Lock scroll
- Remove display none
- MENU - ACCORDION
- Initialize
- ACTIVE STATES

### [`js/navbar-color-handler.js`](js/navbar-color-handler.js) — `navbarColorHandler()`

- markers: true,
- Visibility Handler
- toggleActions: 'play complete none reverse',

### [`js/next-page.js`](js/next-page.js) — `nextPage()`

- Re-entrancy guard only: prevents a second exit sequence from stacking on top
- of one already running. It must never be used to skip the animation itself
- Single source of truth for the exit animation, shared by both triggers:
- a direct click on the link, and the .next-up-load-bar tween completing
- With a cross-document View Transition the browser snapshots this page at
- navigation commit, so whatever the exit animation leaves on screen IS the
- "old" half of the morph. The fallback exit wipes .next-up-container away,
- and .section_next-up — the element being morphed — lives inside it, so
- on the transition path that wipe is dropped and the reveal is settled
- open instead. The name pairing itself lives in the site's head custom

### [`js/process.js`](js/process.js) — `process()`

- Accordion behavior for the About page "Our process" section.
- Initialize

### [`js/reveals.js`](js/reveals.js) — `reveals()`

- The hidden start state comes from the head custom code
- place on first paint. Setting it from here instead would run after
- fonts load, once the page has been painted, and the content would

### [`js/scroll-video-v1.js`](js/scroll-video-v1.js) — `scrollVideo()`

- SCROLL-SCRUBBED VIDEO
- rewind only once the fade-out finishes, so the jump to frame 0 isn't visible
- stop just short of the end: seeking to exactly `duration` can show a blank frame
- fall back to the <source> children so the scrub never stays frozen
- the swap resets iOS's activation, so unlock again on the next touch
- keep streaming from the original source

### [`js/services-hero-pattern.js`](js/services-hero-pattern.js)

- SERVICES HERO PATTERN
- The grid of squares behind the Services hero, cell by cell, as designed in Figma
- first, base64. Whitespace is ignored.
- The dark squares drawn on top of the pattern, as [column, row]. Same cells in the
- desktop and mobile designs.
- both are the same grid, so the squares line up across the circle's edge.

### [`js/services.js`](js/services.js) — `services()`

- EXPANDABLE "OUR PROCESS" TAGS
- empty .process-tag_details placeholder already sitting in the Webflow
- structure, then just shown/hidden via the .is-active class after that.
- Accordion behaviour: collapse any other open tag first.
- The circle doesn't necessarily resize when crossing 767px, so re-lay out
- on the breakpoint change too.
- HERO BACKGROUND
- The hero background is drawn here instead of being an image: the design's grid of
- an orange circle showing the same squares in orange. Pattern, dark squares and
- the circle are the very same cells as outside and line up exactly.

### [`js/swiper.js`](js/swiper.js) — `swiperInit()`

- Init all Swipers
- for screens 500px wide and up
- for screens 768px wide and up

### [`js/works.js`](js/works.js) — `works()`

- Building Location Numbering in Works

## Stylesheets

### [`css/faqs.css`](css/faqs.css)

Imported by `css/styles.css`.

### [`css/form-multistep-calendly.css`](css/form-multistep-calendly.css)

_Not currently imported by `css/styles.css` — verify it is still in use._

### [`css/menu.css`](css/menu.css)

Imported by `css/styles.css`.

### [`css/process.css`](css/process.css)

Imported by `css/styles.css`.

### [`css/services.css`](css/services.css)

Imported by `css/styles.css`.

### [`css/styles.css`](css/styles.css)

Root stylesheet.

<!-- AUTO-GENERATED:FEATURES:END -->

## Deployment

[`.github/workflows/purge-jsdelivr.yml`](.github/workflows/purge-jsdelivr.yml) runs on push to `main` (or manual dispatch): it diffs changed `.js`/`.css`/`.html` files and purges each from the jsDelivr CDN cache, so client sites pick up changes right away.

[`.github/workflows/update-readme.yml`](.github/workflows/update-readme.yml) runs on every push to `main` touching `js/**` or `css/**` (additions, edits, and deletions all count): it re-runs [`scripts/generate-readme.js`](scripts/generate-readme.js), which rescans those directories from scratch and rewrites the Features section above, then commits the result straight back to `main` if anything changed. No AI/API calls involved — it's a plain script, so there's no added cost beyond the CI minutes.

## Dependencies

Assumed to be loaded externally by the host page (not bundled here): jQuery + jQuery Validate, GSAP + ScrollTrigger, Lenis, Swiper, Fancybox, and Calendly's embed script.
