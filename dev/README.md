# /dev

Sandbox for prototyping and testing individual features in isolation, before they're integrated into the main project. Each subfolder is a self-contained demo focused on one feature — open its `index.html` directly in a browser to try it.

## Contents

- **map-3d/** — 3D terrain visualization built with Three.js. Renders a tiled, noise-displaced terrain shaped to a real US outline, with structures placed on top. Includes a control panel for tweaking terrain, structure, and lighting parameters live, plus perspective/isometric camera toggle and light/dark themes.

- **scroll-pin-demo/** — Scroll-driven pinning behavior using GSAP ScrollTrigger and Lenis smooth scroll. A section pins in place and locks scrolling until the user explicitly closes it (via a close button), then scrolling resumes normally.

- **scroll-pin-demo-v4/** — Builds on scroll-pin-demo-v3's pinned 3D map (Three.js terrain + GSAP/Lenis scroll lock) by adding `[T]`/`[I]` view-toggle buttons: clicking one types out its full label ("Top View" / "Isometric") and animates the camera to the default perspective view or a true isometric orthographic view, respectively.

## Adding a new demo

Create a new folder with its own `index.html` (and any assets/scripts it needs), then add an entry to this README describing what it tests.
