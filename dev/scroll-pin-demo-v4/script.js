gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis();
const mapToggleBtnWrapper = document.querySelector('.map-button-toggles');

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

const mapSection = document.getElementById('mapSection');
const closeBtn = document.getElementById('closeMap');
const openBtn = document.getElementById('openMap');

let permanentlyUnpinned = false;
let locked = false;

const BLOCKED_KEYS = new Set([
  'ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '
]);

function preventScrollKey(e) {
  if (BLOCKED_KEYS.has(e.key)) e.preventDefault();
}

function preventScrollEvent(e) {
  e.preventDefault();
}

function lockScroll() {
  if (locked) return;
  locked = true;
  permanentlyUnpinned = true;
  lenis.stop();
  window.addEventListener('wheel', preventScrollEvent, { passive: false });
  window.addEventListener('touchmove', preventScrollEvent, { passive: false });
  window.addEventListener('keydown', preventScrollKey);
  window.setMapInteraction(true);

  mapToggleBtnWrapper.classList.add('locked');
}

function unlockScroll() {
  locked = false;
  lenis.start();
  window.removeEventListener('wheel', preventScrollEvent);
  window.removeEventListener('touchmove', preventScrollEvent);
  window.removeEventListener('keydown', preventScrollKey);
  window.setMapInteraction(false);

  mapToggleBtnWrapper.classList.remove('locked');
}

const mapTrigger = ScrollTrigger.create({
  trigger: mapSection,
  start: 'top top',
  end: '+=50px',
  pin: true,
  pinSpacing: true,
  // markers: true,
  onEnter: pinHandler,
  onEnterBack: pinHandler
});

function pinHandler() {
  if (!permanentlyUnpinned) {
    lockScroll();
  } else {
    openBtn.classList.add('show');
  }
}

closeBtn.addEventListener('click', () => {
  unlockScroll();
  openBtn.classList.add('show');
});

openBtn.addEventListener('click', () => {
  permanentlyUnpinned = false;

  lenis.scrollTo('#canvas-wrap');
  openBtn.classList.remove('show');
});

const viewBtns = document.querySelectorAll('.view-btn');

function collapseViewBtn(btn) {
  clearInterval(btn._typeInterval);
  btn.textContent = btn.dataset.key;
  btn.classList.remove('active');
}

function typeViewBtn(btn) {
  clearInterval(btn._typeInterval);
  const text = btn.dataset.label;
  let i = 0;
  btn.textContent = '';
  btn._typeInterval = setInterval(() => {
    i++;
    btn.textContent = text.slice(0, i);
    if (i >= text.length) clearInterval(btn._typeInterval);
  }, 35);
}

function activateViewBtn(btn) {
  viewBtns.forEach(b => { if (b !== btn) collapseViewBtn(b); });
  btn.classList.add('active');
  typeViewBtn(btn);
}

document.getElementById('viewTop').addEventListener('click', () => {
  activateViewBtn(document.getElementById('viewTop'));
  window.setDefaultView();
});

document.getElementById('viewIso').addEventListener('click', () => {
  activateViewBtn(document.getElementById('viewIso'));
  window.setIsometricView();
});
