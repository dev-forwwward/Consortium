export function homepageMap() {

    // MAP RENDER
    const canvas = document.querySelector('.scene');
    const tooltip = document.getElementById('tooltip');

    // MAP INTERFACE CONST
    const mapSection = document.getElementById('mapSection');
    const closeBtn = document.getElementById('closeMap');
    const openBtn = document.getElementById('openMap');
    const mapToggleBtnWrapper = document.querySelector('.map-button-toggles');

    if (!canvas && !mapSection) {
        return
    }


    const BG = 0xf3f1ec;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(BG);
    scene.fog = new THREE.FogExp2(BG, 0.017);

    // ---- cameras: perspective ("iso") + orthographic ----
    let aspect = window.innerWidth / window.innerHeight;
    const perspCamera = new THREE.PerspectiveCamera(42, aspect, 0.1, 300);
    const orthoCamera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 300);
    let isOrtho = false;
    let activeCamera = perspCamera;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const sun = new THREE.DirectionalLight(0xfff9f0, 0.55);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1536, 1536);
    sun.shadow.bias = -0.0006;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 120;
    sun.shadow.camera.left = -26;
    sun.shadow.camera.right = 26;
    sun.shadow.camera.top = 16;
    sun.shadow.camera.bottom = -16;
    scene.add(sun);
    const SUN_DISTANCE = 30;
    function updateSun() {
        sun.intensity = controls.lightOn ? controls.lightIntensity : 0;
        const rad = controls.lightAngle * Math.PI / 180;
        sun.position.set(Math.cos(rad) * SUN_DISTANCE, controls.lightHeight, Math.sin(rad) * SUN_DISTANCE);
        sun.shadow.camera.updateProjectionMatrix();
    }

    // ---- real continental-US outline (mainland/CONUS boundary), simplified from
    // actual Census/Natural Earth coastline+border data via us-atlas, normalized
    // to (0..US_W, 0..US_H) using a geographically accurate aspect ratio ----
    const US_W = 100, US_H = 53.19;
    const US_POLY = [
        [0, 2.64], [0.13, 2.16], [1.3, 2.65], [2.77, 2.62], [3.21, 3.02], [3.41, 2.7], [3.67, 3.25], [2.73, 4.41], [3.15, 4.33], [2.79, 4.33],
        [3.82, 3.21], [3.78, 4.56], [3.47, 4.46], [3.49, 4.9], [3.23, 4.59], [3.56, 4.95], [4.16, 4.42], [3.98, 3.75], [4.33, 3.07], [4.04, 2.51],
        [4.08, 2.88], [3.84, 2.72], [4.02, 2.3], [3.49, 2], [3.99, 1.71], [3.8, 1.32], [3.56, 1.42], [3.41, 0.83], [51.22, 0.84], [51.22, 0],
        [51.56, 0.03], [52.1, 1.4], [53.57, 1.89], [54.97, 1.65], [55.58, 1.83], [55.44, 2], [55.8, 2.04], [56.04, 2.53], [56.58, 2.23], [57.42, 2.91],
        [58.61, 2.47], [58.82, 2.79], [61.02, 2.98], [58.64, 3.97], [56.57, 5.59], [56.78, 5.87], [58.63, 5.26], [58.84, 5.42], [58.49, 6.06], [58.87, 5.85],
        [59.38, 6.13], [61.94, 5.16], [63.29, 4.19], [63.95, 4.15], [64.1, 4.31], [63.2, 4.75], [62.74, 5.71], [63.35, 5.25], [63.11, 5.54], [63.92, 5.42],
        [64.73, 6.26], [65.65, 6.4], [66.83, 5.89], [68.89, 5.68], [68.76, 6.3], [70.31, 6.2], [70.33, 6.84], [70.1, 6.97], [71.44, 7.39], [69.88, 7.5],
        [69.4, 7.24], [69.24, 7.71], [67.91, 7.15], [66.59, 7.48], [66, 8.21], [65.82, 8.07], [66.13, 7.59], [65.4, 8.06], [65.24, 7.74], [63.53, 10.47],
        [64.67, 9.82], [64.92, 9.16], [65.37, 8.89], [64.52, 10.5], [63.76, 13.36], [64.01, 14.34], [63.89, 15.39], [64.45, 16.7], [64.77, 16.86], [65.83, 16.43],
        [66.62, 15.08], [66.67, 13.83], [66.13, 12.44], [66.62, 10.19], [67.86, 9.07], [67.67, 9.85], [67.98, 9.54], [67.88, 10.07], [68.16, 8.94], [68.94, 8.67],
        [68.59, 8.28], [68.77, 7.87], [70.16, 8.15], [71.6, 8.94], [71.69, 10.96], [70.61, 12.24], [71.08, 12.59], [71.56, 11.87], [72.41, 11.54], [72.88, 12.02],
        [73.27, 13.94], [73.09, 14.72], [72.81, 14.91], [72.91, 14.6], [72.61, 14.62], [71.48, 16.67], [73.16, 17.38], [74.45, 17.15], [78.93, 14.84], [79.45, 14.34],
        [79.07, 13.3], [80.28, 13.05], [82.73, 13.28], [83.98, 12.72], [83.86, 12.05], [84.16, 11.92], [83.73, 11.63], [83.84, 11.26], [86.16, 9.56], [92.17, 9.49],
        [92.55, 8.87], [93.29, 9.03], [94.33, 7.59], [94.27, 6.95], [94.78, 5.84], [96.12, 4.18], [96.67, 4.79], [97.83, 4.41], [98.6, 5.03], [98.58, 8.05],
        [99.19, 8.21], [99.12, 8.92], [99.7, 9.18], [100, 9.93], [99.52, 10.38], [99.27, 10.22], [98.95, 10.72], [98.64, 10.51], [97.92, 10.86], [97.91, 11.18],
        [97.54, 11.15], [97.41, 10.76], [97.2, 11.67], [96.81, 11.02], [96.89, 10.63], [96.51, 10.77], [96.37, 11.75], [94.48, 12.4], [93.82, 13.17], [93.36, 14.19],
        [93.74, 14.61], [93.26, 14.85], [93.03, 15.43], [93.52, 15.59], [93.56, 16.07], [94.06, 16.6], [94.73, 16.5], [94.36, 15.88], [94.72, 16], [94.79, 17.03],
        [94.78, 16.76], [94.16, 16.83], [93.13, 17.32], [93.64, 17.03], [93.53, 16.61], [92.71, 17.22], [92.62, 16.87], [92.45, 17.24], [92.7, 16.75], [92.37, 16.51],
        [92.21, 17.41], [89.74, 17.57], [88.46, 18.21], [88.23, 18.66], [90.83, 17.87], [91.13, 18.23], [91.56, 18.06], [89.22, 19.01], [87.95, 19.2], [87.74, 18.91],
        [87.38, 19.32], [87.87, 19.41], [87.68, 20.9], [86.35, 22.69], [86.16, 22.69], [86.31, 22.21], [85.19, 21.56], [85.19, 21.05], [85.1, 21.56], [85.95, 22.99],
        [86.02, 23.83], [84.49, 26.71], [84.35, 26.21], [84.96, 24.81], [84.57, 24.91], [84.62, 23.95], [84.28, 24.24], [83.94, 24.02], [83.9, 23.41], [84.34, 23.5],
        [83.78, 23.24], [84.03, 22.71], [83.73, 22.88], [83.86, 22.5], [84.1, 22.56], [83.9, 22.24], [84.44, 21.35], [83.9, 21.91], [83.77, 21.7], [83.62, 22.13],
        [83.39, 21.98], [83.7, 22.53], [83.42, 23.06], [83.83, 24.65], [82.62, 23.76], [82.22, 23.9], [82.47, 23.35], [82.22, 23.35], [82.19, 24.01], [82.58, 23.86],
        [82.71, 24.26], [83.98, 24.97], [83.76, 25.58], [82.81, 24.79], [83.86, 25.68], [83.91, 26.23], [83.67, 26.03], [83.78, 26.31], [83.53, 26.36], [83.86, 26.9],
        [82.74, 26.4], [83.19, 26.47], [83.55, 27.13], [84.39, 27.07], [85.19, 29.53], [84.39, 27.93], [84.73, 28.92], [84.06, 28.43], [84.28, 28.74], [83.59, 28.67],
        [83.86, 28.85], [83.39, 29.06], [83.18, 28.47], [83.22, 29.21], [84.27, 29.09], [84.31, 29.8], [84.47, 29.16], [84.72, 29.16], [84.85, 29.89], [84.14, 30.53],
        [83.54, 30.44], [83.37, 30.14], [83.59, 30.05], [83.29, 30.14], [83.38, 30.4], [82.61, 30.13], [83.57, 30.68], [82.99, 31.32], [82.69, 31.23], [83.88, 31.22],
        [83.47, 31.94], [83.22, 31.88], [83.48, 32], [84.32, 31.12], [83.45, 32.14], [82.6, 31.98], [81.69, 32.51], [80.99, 33.74], [80.25, 33.63], [79.51, 33.97],
        [78.56, 35.58], [76.64, 36.68], [76.67, 37.05], [76.15, 37.1], [76.3, 37.29], [75.37, 38.37], [75.22, 39.49], [74.87, 39.98], [74.95, 41.01], [75.44, 43.07],
        [76.55, 45.45], [76.47, 46.24], [77.4, 49.06], [77.23, 51.29], [76.83, 52.26], [77.15, 51.91], [76.32, 53.19], [76.69, 52.56], [75.48, 52.61], [75.23, 51.47],
        [74.53, 51.12], [74.22, 49.97], [73.81, 49.74], [73.86, 48.71], [73.53, 49.23], [72.71, 47.45], [73.28, 46.66], [73.04, 46.78], [72.8, 46.39], [72.98, 46.85],
        [72.73, 47.29], [72.52, 46.75], [72.8, 44.48], [72.6, 43.96], [72.17, 43.99], [71.16, 42.35], [70.07, 41.89], [69.94, 42.32], [68.59, 42.72], [68.78, 42.93],
        [69.33, 42.62], [68.72, 43], [68.19, 42.84], [68.06, 42.21], [66.55, 41.32], [63.6, 41.62], [64.03, 41.47], [63.59, 40.62], [63.37, 41.41], [61.33, 41.29],
        [60.39, 42.1], [60.73, 42.4], [61.04, 41.93], [61.23, 42.3], [61.5, 42.17], [61.12, 42.85], [60.69, 42.92], [60.99, 43.44], [61.87, 43.89], [61.15, 44.43],
        [61.38, 43.88], [60.41, 43.59], [59.76, 44.09], [59.39, 43.52], [59.14, 43.6], [58.64, 44.16], [57.83, 43.63], [58.18, 43.54], [57.61, 43.26], [57.33, 42.68],
        [56.93, 42.74], [56.97, 42.48], [56.33, 42.64], [56.65, 42.94], [56.24, 43.11], [54.12, 42.61], [51.95, 43.48], [52.36, 43.14], [51.88, 43.09], [51.91, 42.58],
        [51.58, 42.76], [51.67, 43.61], [51.2, 44.03], [51.95, 43.56], [48.51, 46.09], [47.65, 47.33], [47.36, 48.49], [47.75, 50.61], [47.38, 49.59], [47.39, 47.86],
        [47.88, 46.64], [49.02, 45.57], [48.42, 45.56], [48.13, 46.18], [47.75, 46.16], [47.98, 46.36], [47.7, 46.82], [47.13, 46.77], [47.58, 47.11], [47.31, 47.92],
        [46.91, 48.03], [47.29, 48.05], [47.25, 49.47], [47.75, 50.66], [47.37, 51.14], [44.42, 49.93], [43.78, 48.57], [43.67, 47.4], [42.31, 45.83], [41.44, 43.74],
        [40.38, 42.63], [38.84, 42.37], [38.2, 42.67], [37.82, 43.82], [37.14, 44.32], [35.02, 42.89], [34.3, 40.79], [31.66, 38.27], [28.61, 38.23], [28.61, 39.21],
        [23.64, 39.21], [17.17, 36.69], [17.33, 36.2], [13.17, 36.6], [12.51, 34.86], [11.5, 34], [10.94, 33.98], [10.72, 33.33], [9.7, 33.2], [8.96, 32.52],
        [7.11, 32.21], [7.09, 30.98], [4.94, 28.45], [4.77, 27.83], [5.05, 27.59], [4.97, 27.05], [4.03, 26.48], [3.83, 25.21], [4.65, 25.91], [3.98, 24.81],
        [4.21, 24.5], [3.88, 24.49], [3.81, 25.12], [2.98, 24.72], [3.05, 24.19], [1.72, 22.66], [1.52, 20.75], [0.63, 19.82], [1.16, 17.26], [0.3, 14.22],
        [1.01, 11.89], [1.26, 6.84], [2.04, 6.78], [1.12, 6.77], [1.14, 5.97], [1.34, 6.53], [1.55, 5.79], [1.1, 5.73], [1.03, 5.39], [1.5, 5.29],
        [1.05, 5.09], [0.95, 5.34], [0.53, 3.58], [0, 2.64]
    ];
    function pointInPolygon(x, y, poly) {
        let inside = false;
        for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
            const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
            const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }
    const COAST_MARGIN = 1.4; // us-space units — how close to the real edge a stray tile can appear
    const COAST_DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [0.7, 0.7], [-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7]];
    function nearCoastline(x, y) {
        for (const [dx, dy] of COAST_DIRS) {
            if (pointInPolygon(x + dx * COAST_MARGIN, y + dy * COAST_MARGIN, US_POLY)) return true;
        }
        return false;
    }
    // ---- gradient (Perlin-style) noise, layered across octaves ----
    // replaces a plain sine/cosine combo, which has an obvious repeating
    // period — this has none, at any zoom or density level
    const PERM = (() => {
        const p = new Uint8Array(256);
        for (let i = 0; i < 256; i++) p[i] = i;
        let seed = 1337;
        function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(rnd() * (i + 1));
            const t = p[i]; p[i] = p[j]; p[j] = t;
        }
        const perm = new Uint8Array(512);
        for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
        return perm;
    })();
    function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    function lerp(t, a, b) { return a + t * (b - a); }
    function grad2(hash, x, y) {
        switch (hash & 7) {
            case 0: return x + y;
            case 1: return x - y;
            case 2: return -x + y;
            case 3: return -x - y;
            case 4: return x;
            case 5: return -x;
            case 6: return y;
            default: return -y;
        }
    }
    function perlin2(x, y) {
        const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
        const xf = x - Math.floor(x), yf = y - Math.floor(y);
        const u = fade(xf), v = fade(yf);
        const aa = PERM[PERM[X] + Y], ab = PERM[PERM[X] + Y + 1];
        const ba = PERM[PERM[X + 1] + Y], bb = PERM[PERM[X + 1] + Y + 1];
        const x1 = lerp(u, grad2(aa, xf, yf), grad2(ba, xf - 1, yf));
        const x2 = lerp(u, grad2(ab, xf, yf - 1), grad2(bb, xf - 1, yf - 1));
        return lerp(v, x1, x2); // roughly -1..1
    }
    function noise(x, z) {
        // fractal Brownian motion: several octaves layered for organic, non-repeating relief
        let amp = 1, freq = 0.045, sum = 0, norm = 0;
        for (let i = 0; i < 4; i++) {
            sum += perlin2(x * freq, z * freq) * amp;
            norm += amp;
            amp *= 0.5;
            freq *= 2.15;
        }
        return sum / norm; // roughly -1..1
    }
    function tone(usX, usZ) {
        // dot footprint size now driven by real elevation — mountains read as
        // larger/denser tiles, plains as smaller/sparser ones — with a little
        // independent fine-grain noise so it's not perfectly flat within a region
        const rel = realElevation01(usX, usZ);
        const grain = perlin2(usX * 0.4 + 700, usZ * 0.4 - 700) * 0.12;
        return Math.max(0, Math.min(1, 0.12 + rel * 0.8 + grain));
    }

    // ---- real elevation data, sampled from an actual grayscale relief map ----
    // (baked offline from a hillshade image the user provided — genuine terrain
    // shading, not a hand-placed approximation). Decoded once at load, then
    // bilinear-sampled at runtime; fine noise above just adds small texture on top.
    const ELEV_W = 240, ELEV_H = 128;
    const ELEV_B64 = 'LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0t7C0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0t0qYtLS3GLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS3rLZSCj5ugoKOrr66xubstyi3ULS0tLS0tzy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS3k3q6CgomLjpGWl5ufnZijsbOyq6Kor7Grp6mtrrUtLS0tLS0tLcUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS2iLS0tLS0t3rOCfYOIj4+Qk5mdlpKfqainnZadpKKZmJualp6pqaytqq6uo6GuusLFxMXEwS3IyC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLZ2Ah56yv8At2rqGe4SLkpCNj5SXkZCcoqSjmZWbop2TlpqakpeipaiqpqSkmpKesLm5trSxsLGysKynpainqayvs6+urKy1sqy0vb+6tS0tsrYtLS0tLS0tLS0tLdAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLcwtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1/gI6WmpmmxsSQeYeSl5OPjY+PiouQl5ydl5eYnZeNkZeXj5SepqqsqaSjnpWbq7a3s7Ctq6qnpaOgnp+goZ+foJ+empmbnJ6ipaWkop+enJqXj5CYmZugo6Gbmp2dmZGPk5idoaCXkZGUlpWSj4+XnqGkpqeqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS2Wg4yWlo+WtLaJc4OUnJmVk4+NjI2OkZSTk5aWlpGKkZmYj5ahqKyvrKajoJqaoa21tbGuq6ilo6Kgoaesq6afm5mYlpSVlpibnZ2dm5mXlJCNh4eQk5SVlZSSj4uIh4WEhYaIiYiGhoaHhoF6c2xyen+BgoOGjZanLS0tLeItLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS2XfYKOkI6ZrKB2comYnpmUko+Sk5GQkZGRkZKRko+Ll6SjlZiiqaytq6akoZ6al56vtrKurKmmo6Khpa6zsauloZyZl5aXlpSVlpiYl5WTkY6Nh4ePk5OTlJOSkIuIhoWEhISFhYSEg4SEg353b2ZrdHl7e3x9fYCHjpOfLa+lrMAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS2Xd3N8gI2ap5t2eI+cnpaQj5CSkI2MjY+TlZSTko6Onqmom5egpaeoqKSioJuWkpiqtbOxrqunpKOjpaqtrKipqKGbmJmZmJWTlJSUk5KRkJCPhYWOkpGRkZGRkI2Kh4aFhYWFhYSDgoODgn53b2drc3h6e3x8fHx8fX6DioeDiZuwLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tgWtqb4mtr414hZefnpyakoqKiISFiIyQk5SVlY+Nm6Snopeeo6WmpqSinpeTkpqstba1sq2pqKinpaSkpaSlpKCcmpqbmZaVlZWVlJSUlJSQhIaPkpKRj4+PkI+Oi4iHhoaGhYWDgoODgn55cWhrc3h6e3x8fH19fX19fn5+gIaRnK29LS26LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS3LnnNjZ3qLgXR/k5+koZ2cl4iBf36BhYmMjpCUlo+PnKOmopSZoaOkpKSin5eSk5yttra1sq+vsK6sqqinqKWin52bmpydm5mYmJiYl5eYmJeRhomSk5ORkI6Oj5CPjIqJiIeGhoWEg4ODgoB7dGppcnd6e3x9fX1+fn5/f39/gIGDhYqRlZaUkoyLncUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tn3VmZGNob32Rmp2io52VkoZ8enp9goaJiouRlZCUo6ipp56XmJ+jo6WioZ+XlJeksrSysrO0tLCxsa+wr6umop6cnKCgnpybmpubmpydm5eRh4uUlJSTkZCOjo2Mi4uLiomIh4WEhISEg4B8d25ocHd6fH5/f39+fn9/f4CAgYGCg4SHiYmIiY2WLdMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLd+6qi3PLS0tLS0tLS0tLS0tLS0tLX9tZ2NsfIqWmJyin5aPjoR3dHZ6f4KEhYeNko+WpKiopKGckpago6WipKmnn5meq7Gwsa+rqquytbW2tbCrpaGen6OioZ+dnZ6foKCdmZWRio6VlpaVk5GQjo2MjIyMi4uLiYeFhISEgoB8eHFobnZ6fYCCgoB/f39/f3+AgIGChIWGhomWpC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS2djpqXiYwtLS0tLS0tLS0tLS0tqop7cWdsfImRmaGjm4uDiYV2bW91en1+f4GIkI2TnaKioqKgmZKaoaWmqKurqaSiqayop6adlpmotLe1tLOwqKKhoqWlpKKfn6GioZ+bl5eXj5KYmZiWlJGQj4+OjIyMi4uLioiGhISDgX98eXJpbXV6foKFg4F/f39/f39/f3+AgoSEh5y+LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLaSJfn96cXGCLS0tLS0tLS0tLS0tuqSSe2lyh5Waoqemm4h8fX97cGxwdXt/gomPjoaKlJmeqKyoo5aNjZqmpaapqaakqq6ppaaglZWfrLGrqbCxqqSio6WmpaOioqKgnZqZmJuckpSampqYlZOSkZCPjIuLi4uLiomHhYSDgX57eHJqbnZ6foKEgoGAf39/f35+fn5/gIKImS0tLS0tLS0tLS2rLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tpYx9e3t1b216LS0tLS0tLS0tLS0tpY2EdWVxhpKcoqCgopeJf3p5dG5tcXmDkZ6hlISNnZ2eqKynop2Qg5einZ+hpKago6mrqKWkn5+krrSxr7Kwq6elpaWjoqGhoaCdmpmZm56elJWcnJuZl5WUkpGPjYuLi4uLioqIhoSDgX57eHNqbnh8f4GBgYCAf35+fn5+fX5+f4qmLS0tLS0tLS0tqpSMoC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tmYN7e3p0b255LS0tLS0tLS0tLS0tl314cGFjeIqWmZKUnJ2XjHtxcXBtbXOEm6Sjm4+XqKOcoqSgnJmNh5ycl5iSm6CXmZ6mrKWkoaGpsra3trKvraqopqOgn5+fnp2dnZ6fn6GflZifn52bmZeVk5KPjIuLi4yMjIuKh4SDgX57eXVsbXh9f4CAgH9/fn59fX19fX15fi0tq5ehLS0tLaibioGClJyapi0tLS0t3i0tLaEtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tl4N8eXhzcXF7ly0tLS0tLS0tLS0tmoJ6bVtXbH6Af32AhISBeWlgYmdvdHuLmZmYl4+PoaSipaahnZiHhJuYj4uMmZ2UmKOusKijn5adrrW3trSxrquopaSjoqGgn56foKGjo6SglpuhoZ6cm5mXlZKPjIuLjIyNjYyLh4SDgH58endubHd8foCAgH9+fX19fX59fXtzc4OHhYGOny2ekomEgYGDiImIi5stxS0toY+HfX+RLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS2jj4J8eXhzcXF6ny0tLS0tLS0tLS0tj391ZFlWYHOBg3xyc3RwbW1vdHqAh5ajpqarq6CRlaCnp6ilnZeGg5WVjoqKkpiZoquzs6qioZmer7W2t7WxrKmmpaepqaajoqGhoqKjpqehlZyhoJ6cm5mXlJCOjYyLi4yNjY2LiISBf317enhxa3N7foCAgH9+fX19fX19fHlycXl8fX+DhoV+fX+Bg4SFhISCgIKJjYiCeHNxcHJ5g4ylLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS2iioB8e3x0bmx1oi0tLS0tLS0tLS0thHptXlpfboaZnZSHhYaCg4SJkJWVnKmrqKuus6yXipadmJqblJCDg4eJkY6Gi5Wbn6WvsqyhpKartLa2trOvrq6qp6msrKqmpaWlpaSlqaqikpWZl5WTkpGQjYmJiYeFhYaHiIeGgn57enl5eHdzanF6foCAgH9+fX19fHt6eXVub3h7foCBg4SBfXt7fH6Af359e3l3dHJxb290foN8eH6Vty0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS2ih318e3ZuaGdwmS0tLS0tLS0tLS2ggXJkWltrg5ilo5eOkJGTl5mfqKysr7Ktp6SepKWRhZCTkZKTkop/fYB/iYmAi5+ilJagnpqXmpeapLC1tbOys7CqqKuvsbCsqquqqKeoq6uik5WYlpORj4yJhoODg4F/fn5+fn57eHRzc3R2d3JsZ3F6fX9/f359fHx8e3l3c2xrc3p8fn+AgYOEhIOCf3t4dXJ0d3Z2fH19gYeOLbmpoi22vi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS2Tgnx9fHJnYmJpgabMLS0tLS0tLS2Pf3JhXWh/laGppZqUmZmcpauvsbOzs7CqqKSUj5WKjJOPjYuLjYiFhoqEgIaKlqShmJWQg4CHh3p3g5yus7SzsK+sra+ztrOvr7GuqqmqraykmqCioaCdmZaUkY+OjYqHh4eIh4aDf3x7fH+DhH1wbHV5e31+fn18e3p5eHd0bGpzeXx8fn5/gYOEhYWFhIOCfXJqbXOCnamvLS0tLeMtuS3T4C0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0twJ2IgHt7d21kX19jaoEtLS0tLS0tLS2Idm5iYG+GmKOpo5iWnp2epaioqa+yraWfpqqglpKToJ+TjYiFh4WDhoyMgIeUm5yWkY+JfXt+e3JraXeTqrOrpamrsLO1tbKytLSwrKyur62km6Kko6Kfm5iVlJKRjouJiYuMi4mFgX9+gISJioR0b3Z5enx9fXx7enl4d3Zzamx2ent8fH19gIOFhYSEhIWEf3ZpZHGVyC0tLS0tLdmui4iasi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0trZODfHl1bWVeXF5gYm4tLS0tLS0tLS2Odm1iYXKKm6WmoJmfqaeiqKqnq7GvqaWjqayom5Gap6abj4aEhYSChImKgIGMkI2LhoSCenRzdXFqY2N3mqumnpuUnamurq6wsrGurK2traqgmKGkoqGem5iWlZOQjo2KiouMi4iEgH9/gYaKi4h7cHJ3eXp7e3t6eXl4d3VzbGt2enp6enp7foKDg4KDg4OBfHRnYnctLS0tLS0tLS2egHZ6g5ClLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLZyQkYqBd3JsZV9aWl1fXV1tlS0tLS0tLbmLd29kaHmNnqqpo5+mrq+trq2qrK6uq6uurqyklZWgp6SdkIaEg39/iY+GgHh6hoqHg4J/eHR1dnNsZmp9m6epppuDfoyep6mpp6anpaWlpKGWkp+joZ+enJmXlZOPjYyKiYuLi4mEgH9/gYaKi4qEdnF2eHl5enp6enl4dnVzbGx3enh3eHl6fH9/f3+AgH96dnFscy0tLS0tLS3WLZSBfHl3dnWFrS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tzC0tLS20LS2Oj5mopKCekoh+hId9b2ZjX1tXWFxdXF1sly0tLS0tLaiBc25ocICQnKanpqeqsLKysa+trKyrp6etr6udj5mmq6Wek4qEf3t/jJCHfnpzeX+Af394dHR7fHlvaXGGoa62uLGcgn2TqrS1tLS0tLSzsq6gmaKioZ+fnZeUkpCMi4qJiYqKioiEgH9/gYaKi4qIfHV5eXl5enp6eXh3dnVya2x3eHZ1dnh5e3x+fn59fXp1cnF4mC0tLS0tLS2yr4p7fHx6d3WCLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS2vlHtze4aMhWtda3mDgoSBfH95fn51aWBcXV5gYGNmbXuPpy0tLS0tLZl4b25tdYOSoKekqK6wsrO0tbSyr62rp6itr6eYh46iq6agl42EgX1/hYOAf310doSLj46MhXV5fXluanSHnKqyuLmxlHZ3mLG4ubm4ubm6uLKmoKiloJ+em5eUkpCOjYyJiImKiYiEgX9/gYWJiomIf3h7enp6enl5eHh3d3d1bmtydXR0dnh4eXp7fHt7enZxcHOJLactLS0tLZSNlIR8fXx7eXZ7lS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS2CcG12f4SFe2NUZXZ6fHx2dH12dnRtZV5bX2uCiZGZoy0tLS0tLS0tLZB0b3F1gIyXo6utsLGytLS0tbSwrq2trq+wraOZiomcp6ilnJCCe3d3fX55f4SEkaKpqKWilYB8e3VrYmd2j6Outbm3p4Ryjay2uLe3uLm5uLGinamqpJ+dmpmYl5WRjoyIhoiJioqIhIF/gIOHiIiGfnuAfnx7enl5eHd3eHl5dW9rbXB0dnd3eHh5eXl5eHNwb3OJkI0tLS0tLX55fX19fHt5d3R6my0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tuYRubXZ/g4aIgGlYaHd5e3NweoN2b25oYV1cYHqtwcUtLS0tLS0tLS0tLYVyb3B7i5acpKqyta+vs7W1tbSxsbGwsrKxraeejY2bpqypoZaFe3Vxcnl+hY6Xp7GysK6pmYJ9fnVoXVpng5uqs7i4s5uEkay2uLa2t7i4uLOglqSsqaOenJualpOQjoyKiYiIiImKiIN/f4GFiIeFfX6Fg398enl5eHd4eXp6enh0bGlvcnV2d3d3d3h4dnJwb3B2fpYtLS0tLXh2e3x8e3p2c3OFtS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLewtkXVtdX+Fh4uPhmxabXt8enB5iIZwZWViX2dudpAtLS3pLS0tLS0tLS0tLXx2dHJ/kZuipqqytbK0tba2tba3t7e3tbO0s6+lk5KbpKurpJiMg39+eXiEk5unsLKysa2hkXt8gHVpYl9gdpKmsba2s6aSmq63t7W0tba3uLSjmKOtq6SfnJuZlZKQj4+NjIqIhoaHh4R/foCEh4eEfH2GhYJ/fXt5eHh4eXt8fHt6dm1pbHF1d3d3dnZ2dHJxcXF0hrAtLS0tiXR1eXt6eXVycXqZLdrYLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS2rgHFze4WJiouLg21ecYB+d3B8g3xnX2BhbZKwui0tLS0tLS0tLS0tLS2/hW54enaCk5+nqKmurrG3uLe3tba5ubm5trS0tLGqnZqdpKuvqqCZlJSVk5CVoamvsLCxsKiaiHh+eXFvcXRyfZCfqKysqJ2UobC2tbKys7W3ubanoamtqqWgnZuZlpSTkpCNi4qIh4aGhoSAfn+DhYWDe32FhYOBf316eXh5ent8fX18endwaW11eHh3dXRzcnJyc3V5k8QtLS2lgnN1eHl4dnFvdZIts5aYLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS2phn18f4eMjoyHfW1gcH97cXF5dnBlXl5pj7/f6i0tLS0tLS0tLS0tLS0tfXB9gH6HlqOqqKuvrrC0tbW3tbW2t7i5trOzs7Ovop+gpKmtramnp6mqqqmprK6xs7Oyq6GWhXl+dnBsZ3KGk5ykp6Ogm5CSo6+ysK6ws7a3ubaopq+tqKWioZ+enZuYlZKQjoyKioiGhYWDgH+Cg4J/d3iAgYGAfnx4d3d3eHl7e3x8e3l1bWt1eXl3dXNycnNzdXd7lS0tLS0tfnN0dnd2c29udy0tj3d7lC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS2ZfX+BgIaNj4uFeWldb396bnN2cGxlXWB6LS0tLS0tLS0tLS0tLS0tLS22iICJiYmRmaSqp62yraurr7K1tLKxsrSzra6ztLayoZ+ioqOlp6eorbK1tra1srG0trWupJuTg3l9fXluXWB9maatr6unopqdp6ytq6uvtLa3ubepp66sqaWlpqempaKem5iWk5GPjoqGhYWEgoCAgYB7b291dnd3dnRxb29wcHFycnNzcnJvaWdydnZ2dXN0dHNzdXd+oi0tLS2ifnFxc3V1cm5sb32BdXB1kcYtLS0tLS0tLS0tLS0tLS0tLS0tLS0tyi1/b3J3eoGIioWAdGRfcn92bHV0bGpjWWWQLS0tLS0tLS0tLS0tLS0tLS25kYiMio2TlZ+oqbGzr6umqrGzs7Kys7GnoqyztbeyoaGlpaSkpaanrLS4ubm4tbS2trCloJ2Ug3t6e4F8al1oi6StrauopaKjp6mqqaqtsbW3uLappKqqqKWmqKimpaShnZuYlpORkIyGhIODgoB/f396cHR7fHx8fHt5d3d2dnZ2dnZ1dXV0bmZuc3Jzc3N1dXNydXeDLS0tLS0tiXNvcXJzcW1ra2xub29yjsgtLS0tLS0tLS0tLS0tLZaUjoiRnS2pk3ZnZGdscXh+gn94bGJld4B0bXZyaWVeWW0tLS0tLS0tLS0tLS0tLS0tLS0tj4iNiIeJjp6orLOysq6koqutra2ws7CjprO2t7evnqGmqKyvsrGvrrO4urq5uLe0rqWen56Ugnl1eoWIgG1idJalpKGgm5qepKenp6qtr7Kzs7KknqSin56foaCcmpiWk5GOi4mHhoN/fXt+f318e3x6cXZ+gICAf358e3t7e3p6eXl5eXl5dGhtdHV2dXV2dXJydHWJty0tLS0tmHZucHFxcG5tbW5vcHBwgy0tLS0tLS0tLS0tLS0tnnx0dHF0d3VzbGlrbHF1d3h2dnRvZGFneoFwbHZxZ19aZy0tLS0tLS0tLS0tLS0tLS0tLS0tlYqMi4yNk6KrrbGxsq+ooqSkpqeqra2qsba0s7KqnaSoqK2ztra2tre4ubm2trKqpKKhnpuQf3dzeoeLioBwboOWmZaXlpWboqOalpulrbGwr66kp7Gvr66tq6qnpKGdmpmWko6LiYeEgX14dnV0cnNybnd9f4CAf358e3p7e3p6eXh4eXl4dGpsc3Z3d3Z1dHNzc3OBqS0tLS0tLXhub3FxcHBxcXJ0dHFvfKUtLS0tLS0tLS0tLS0tLX53e3dzdXNtanF4fICAgYF9eHRsYGNpdXlnZG9tYFVSay3oLS0tLS0tLS0tLS0tLS0tLS0to4eHjI2QlJqipqqsrKmjoaGeo6WlpqaprqqmqqiknaeqqKitsbKysrKsra2orquko6KioJiRgnl3fYiMjIqDfoONkpKSlZicnZmQiYmWpq+xsK+mqrW4ubi2tbOyr6unpKKgnJmWlJGPjIqDfoCAe3RraHV8fn5/fn18e3p6enp5eHd3d3h4dW5oanBzdHNycXFycnB5nS0tLS0tLX1ucHJycnJyc3R1c3F3iqwtLS0tLS0tLS0tLS3Mn4KAgn98fnt1cnZ9gYODg4SEg31zY2RpcXNkYmpoW1JUcKotLS0tLS0tLS0tLS0tLS0tLS0tpIuTlpKVlpeepaipqaSenJmPkpaWlZmbm5aan5uYl6Gjn5qdoKGeoKKamZuaoaKlpqOipJaRiIB+goyRkZGNiYqOkY+Mj5KWlI6LioaLna60tLKnq7W5ubm4t7e1sayppqShnpuZl5WSj42KiIeGhIB4a3B7fX5+fn18enl5eXl4eHd2dnZ2dnNuZGFnamloZ2hpaWl1oi0tLS0tp31vcXN0dHR0dHRybnKKLS0tLS0tLS0tLS0tLS2fjISFhoWEg4B8eXp9gICBgoSHiYV3ZWJmdXZoZm1tYllghS0tLS0tLS0tLS0tLS0tLS0tLS0tLZiZmJmcoKGnrbGxtrWvrKWXlpuamp+hn5+ioZaXnKCgmY6KhoWKkJOPiYmLkJmgn5ucmYaEgoSFiZOYl5WQjY+Sk5KQkpGTk42NjoyNnK61tbSprba5urm4uLe1sq2qqKWin5yZlpWTkI6LioiHhoSCd3B5fX5+fn17enl4eHh3d3d2dXR0dHNyamBlbGxsbGxsbGx4oy0tLS0tm3dwcnN1dnZ1dXNvb4QtLS0tLS0tLS0tLS0tLZaJhoaHiIqJhoJ+e3t8fX1/goaKjIp6ZF9kdW9gYWlpYVpfeq0tLS0tLS0tLS0tLS0tLS0tLS0tupuXmZyepqWlpaqqs7e0saibm6GgnZ+krK+vpp6iqKqqoJSQiYmSl5qWjZKao6yvq6ennYqGg4WKj5aamZWRkJKTk5OSkZGSkY2PkI+Pm6qws7Oqr7i5ubm4t7e1sq2qqKWin5yZlpWTkY+Ni4mHhoSDfXJ1e35+fn17eXh3d3d3dnZ1c3JycnJwbmdjam9wcHFxcXF2jS0tLS2vhHJxcnN1d3d3dHBtd54tLS0tLS0tLS0tLS2ahX9/gYGBgoSFgXx5dnRzdXZ4e4OKjINwYV5faWBUWmBcWFVWXoYtLestLS0tLS0tLS0tLS0tLS0tLYuNlZyfo6Kfo62xtbWxsaWVmaKkoqSrr7SzqaurqKeknJWWlpaXnJ+clqGrsba4tLOtnY2IhIWOlJiamZWTkpCQkZKQjIuOi4SFio2NlKCorrCor7i3t7e3trW0sq2qqKWioJyZlpSSkY+Ni4iHhoSBfXVweX1+fn17eXh3dXV1dXVzcXFxcXBvbWhhZm1vcHFxcG9wfi0tLS2Icm1ubm9ydXZzcGxviy0tLS0tLS0tLS2ShoaCe3l6fX+AgIGCfnt6d3JxdHZ4dXaBgXdnYGFla2BXXV9ZWWNnYHOp0S0tLS0tLS0tLS0tLS0tLS0tpImLmaCem5qdpq6xtLOtqp6Ol6GkqK+wrrW0sLGupqKdmJicnp+dnqGenK21t7m6t7eumYuHg4aOlJeZmpWPjYyOkZKQioaJh3pzf4mJjpqjqaujq7a4t7a1s7KysKyqp6WioJ6alpSSkI6MiYeFhYOAfXVtdn1+fn18enh3dXNzc3NycG9vbm1samNgZ2xub29tbGtsco4tLYtvZmZnaWtraGdmZWRulS0tLS0tLS0tmYd5dHyAgIGChYmKiYiIhoWFg4B+e3x/e3B1eG1jYGFkaWJbX11WXYaTgi2vwy0tLS0tLS0tLS0tLS0tLS0toYiNmJ2YlpSTnaitsrCppp+TnaGkrra1tLe0srCxrKehmpueo6KdnJycnbC5urq6urmznpGKgYKFiYuQl5CHh4mNkpORioF8gHdve4eGiJWfpaaeqbS3uLi2s7CvraqopqSioJ6ZlpORj4yKiIaEhIN/fHZscnx9fX18enl3dXNycnFwb25tbGdkY2FmamtsbGtqaWpqamt5e3JsbG5wcnNwZ2VoaGlseZQtLdEtLS2Of3hzcnt/gIKEhoiJiIaGhIKAgIOFf3yAf3RramdlZmBeY2JhZmphZI0tLdTaLe8tLS0tLS0tLS0tLS0tLS0thIOSl5iWlIiElqitrqqmpqOYoKSptLe2tbSwqq60sauooqCkpJmYnJ2dnrC4ube3u7y2oZSLeG5oaG55hYN7e4GHjI6MhHhubnFvdn19gpCan6CZo66xsrKxrqysq6mnpaOhn5yYlZOQjYuJiIaFhIN/fHlwb3p8e3x8e3l4d3RzcnBvbm5ta2JfZ2ttbWtqamppaWlqZ2JobGxsbnBxc3NvZmdqbGxtbnaDjpWHgH56eHdzcHl+fn+BhIaIh4SCf3t3dXp8e36Eg3dlYGRscWBfcIGKmKabLS0tLeYtLfMtLS0tLS0tLS0tLS0tLduge4KVm5+bjnh1j6alo6KkqKecpayvsrGwsbCspqivr6ysp6Wkl5Kcn5+corS5ubW0tri1oY6GcF1SUVdjcnl4fYaMjo2HfHFqZGptampzhJOZm5uZnqWoqKimop+mqqmmpKKgnJmXlJKQjYuKiYaFg4J+e3pybnd6enp7enp5eHZ0c3Fvbm5tbGRham5ubWtqamtqampqZ2Fna2tsbW9wcHBuZmhsbW5vcHJ1eHt6eXh4eHhzb3h8fX1/goWGhYN/fH12b3F1eoCBeWlkaGJkeXV+LS3D0NYtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0th4CQn6SZgW5uiaSioKKmrKygqrCvsK+uraqopKatqqmrpKCdjpWcm56apLa6uLKrp6inmYWCcGBdYmx1goqChpKXmZeSi4F4bXJ0aGV1kKSrrK2usbS2trW0rqGkqqmmo6Cem5iWlJGQjYuKiYeFg4F+fHpzbHR4eXl5eXh4d3Z1dHFubGtramNja2xra2pqa2tra2trZ2Joa2tsbW9vcHBuZ2lucHFxcnN2eXp6eXh4eXhzbnd6ent9goaGhYF9fHpybnJ4fHlzal5laWFojJiPjI2kwi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0toIeImqacgm1rhKGoqKilqKqhq66usLKwr62rpaaooqOkoZ2ZkpiZm56borW5uLGpoJ2hnYqBdnR8iZadoqGNh5KXl5eVkIqBc29sYFtvkaqxs7S1t7m5ubm4sqKjqaeloZ6bmJeVlJKQjYuKiIaFg4F/fXp0aGpub3Bwb25ubm5tbGpoZmRjYV9ma2ppaGhqa2xtbm1saGNpbGtsbW9wcHFvaGxwcnR1dHR3enp5eHh4eXhwa3V5eXp9g4iHgnt4dXJubnJzcW5nXlddXmOGo5OALS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0txJyMlKKeh21kdpelpaekoqCbpKqtsLO0ta+rqqeloZ+en5yXk5WRlpmXmq65uLavpaSop5SEfIKPnaiusKuXkpmYko2Hfnl4cW5rY11xl62ytLW3uLm5ubi3sqGiqKainpuZlpSTkpGPjYuKh4WEgoB/fnx4a2ducHFxcG9ubm5ubWxqaGVdWWNpaWlnZmdpa21ub25taWNpbGxub3BxcXJyam5zdXd4dnR3eXl4eHh4eXdqZ3V4eHp+hYuIf3l1cm5ra2xpZ2dlX1VTVWMtxC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLbSVkJmchmteZYKbpammo5yUoKmusbS2tayqrKmkn5qXmpuWk5OPkJGQkKq3trSroaCkoJKHfX2FkqKusKuamJmUkot8amJrcHJyamBwl6yxsbO2uLm4uLi3sZ+doqCdmpiVkY+OjIqJh4aGg4KBf319fXp3cGdudHZ2dnV0cnJzc3JxbmpgXGdpaWhmZmdoamxtbW1taGFnbG9xcnFxc3V1bXB0dnh5d3V2eHh3dnd4eXdpZXV4eH2EiYuGf3x4c21oZWRlZWRgXVZNUFhxri0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLbKOjJidiGpaWGmHoamjoJuRoqitsrS2sailpKGZk5WWmZiWlJGMjZCKiaewsK6tqKShlYqAfYCBhpemp6KSj46Mi4J1Y2Fwc2tmXlpukqqtra+ytbe2t7i4s56YnJqWkpCNiYaDgH9+fXx7eXh3dnV1dHNwbmdmbXN2dnVycXBxcnFwbmtiX2hpaGZmZ2doaWtsbGxsZ19mbXFycnFxdHd2bnB0dnh5d3Nzdnd2dXV3eXZoaHV4eoKLjoqCfnp1cm9pZGNjZWRfXVpOTVNlLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS2AhZObjG1YVFt1laWilpGMn6ats7a1rqScm5mTkpSXl5aXlZCJiI2KlKirrK6xr6ijlot7gZSTio6TlZOGhoaIiIN+cHB2bV5WUlVtj6aop6qusLKztbi5tKOlqaainpuXk5CLiIaFhIKBf359fHt6enl4dnRuZmt1dnNxb25vcG9vbmxlXmVpZ2ZnaGhoaWpra2tsZ2BmbXFycXBxdHd1bHB0dXd4dnJwdHV1dHR2d3Npa3R3fIWMjYR7dnFsbWxmZmVhYV9dZmhVUFViLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS2Df4eSi3BYU1VnhZ6mmIuFmaavtba0sKeZlZWWmZGPkZaVkI6IgoeDl6inqLC0sKWhloV3iZ+jmpGFhYyLk5KVkoSBeXduXVNRUVdsiZufn6Ooq62wtLi5tKaprammo5+alpOPjIuJh4WEgoGBf359fX18enl0aGtzdXNwbm1tbW5vbm1qYmBnaGdoaWlpaWpqa2trZl9mbG9vbm9wc3Vya25zdHZ3dHBwdHRzcnN0c21sbW9zeX2Dfm5mX1lZYV9eYV9bXFtkbV5TUVlpLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS2Lf4GIhnVdUlFceJSknouFmKKss7SzrqebkIyUkomHjpaUjJCKhYmDl6OjqbK1sqKbl357laKkpqCNjJqaoqObkH51bmhiV1JTWV9pfIqSl5+kqKyvs7e4taerrqqmo5+blpSRj42LiIaEgoGAf318e3t5eHh2a2pxc3Jwbm1sbG5vb25ua2RhZGZoaWlpaWlqamppY1xlam1tbW5vcnRxaWxxc3Z2c3BvcnNycG5samtzd3l+goKEdWZhXFdTXmFjY2FrgnlzcVlTXHYtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0thn6DhHpmVVBWbImipZCCjpmorq+xr6yejYWOh4KEjJWYkJWNioqEl6GkrrG0r5qVk32GnKCkrq6jo6qbmJ6WgXZybFxUUFJYY2ptdH2Lk5uhqK2xtLa3tKerrKilop6al5SSj42KiIaEgX9+fXx7e3p4d3d2cGdqcHFwbm1sbG5vcG9ubWliX2RmaGlpaGhoaGhmX1tkaGtsbWxscHRwZGZscXV1dHFvcHFwbWZkaXJ3en6EiYaCeHVuYVtUV19jYmstm3RqhndlfK4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tlH1zeHZpVlBTZICdqZSBgouboqWrqqmfjYSGgICGkJigmpuRj5CIlJ+mrq6topCOg36Snp2ntLezsaqQg4uZlpOGcV9ZVFNfaWtwb3eRm5+kqq+0tre4taeqq6ejoJyZlpSRjoyJiIeFgX59fH1+fn17eXd2dGxpcXJwb25tbW1ucG9tbWtkXF5hZmhoZ2dnZmVkXlpjZmlra2lpbnJtXV1ibHN0dHFub25qY2Ntc3Z4fIOKkZOLgX5xaGVcVlZZXHgtkFlWjrmfoy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLYFqbHBpV1BRXHWWp5iDfHt/jpilo6Gfm5WOh4iPmaGlnp+WlZeOkJ2kqamfj4d+c3iVo6aus7OxrpiDhYOQoJyHbWRoXlZia2x2eoOcpqmrr7K1t7i4taerrKijoJ2ZlpSRjoyLiYiGgn9+f3+Af318enh3dnBscnJxcHBvb25tbm1ra2tnX1pZYWZlZWZlZGNjXllhZWhqa2lpbGplXWRlZmxwcG5sbWtiXGVydXd5gIuUnJuMf3dxcm5lXFhZWn69lVhOeL7MLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS14bXVyZV1UV2uJoaGLdnB1fYiXnqChp6OakJObo6afm6OempWKjJigpqOVgH16d32VqLCxra6up4x+kIyHjY98b3BwaV9ibHWDkZ6prrGztLa3uLi4tKerrKikop+bl5SRjo2Mi4mHhIGBgIB/fnx7enl3dm9rcXFxcXJycXBubGxsbGxpZWBaYGNjZGRkY2JiXFlhZGdqbGxqZWBhZWxsaGVlZmViZ2hiaG5zdnl+iJagopqKenZ5dmtjX2h0aYctnl1KXZbVLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS2XiJGEf3ZdVWN9lqaWeWt1foCNm6Wnqaiim5ugpqKYoKajnZWIipagqKGUgoB9dXWNpKetqKirpJOHl5iJfXttYmVkZGRobnJ9iqCus7a3uLm5ube1saOpq6ekoqCcl5SRjo2Ni4mHhYOCgX9/fnx7enl4dm5qcHFwcHFycXBubm5wcG5qZ19eYmJiY2RjYmJdWFxiY2ZpbG1mX2ZsbnBxcG5tbWpmYWBkbnJ1eH+JlaCilomDfX5+cmVfYXyHdpQtmWRKU4fULS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS3FuKB5bWFVU11wh56fh2xtgoKAjaOoqKmppZyaoqCepqano52PkqGpqZ2OhX95cXWLmpmnqKKdlo+HkpB+cGRaU1RWW2V1em9xdY6nsbW4ubq6uri1rp+lqaajop+cmJSRj46Ni4iGhYOCgX9/f3x6eXh4dm1obnBwcHFxcHBwcnJzcXBuamBeYmJjY2NjYl9WV2BiYmRkZGdfYGpucHJ0c3Jzc3JuZGRtc3d6fYeUn6KWioiFgH10aWJeXnaQlJu7rINYV4UtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS2EcGVYU1ZgdpKhkXNndoCAfJKfqKipp6CaoaekpKmrqaWVm6mpo5GBg4F9gZOeoaOsqpiLiYqFiIRxYFVPTVFUWWp9gnhvdYihqbC2uLm5urq4r5+kqKWjoZ+cmZWSj46MioeFhIKBgH+Af3t5eHd3dm1obnByc3R0dHN0dHR1c3N0cmpgXWBiYmJiYlxQVVpdXVxaWV1fZmptcHN0c3N1dXVxaWt0eH2BhY6ZnJaJhYmIg3dqY2BcWV54k5q3LaRqbS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLYl6dn9vWVNYZ4GYmIFzbXiNfYCSn6Woqaagoaalpq2tqaWWm6OclH93gIaMk6Cnqq+xqZqTmZiNjIRxYFhRT1JVXW5/hH1udoydpKuxtbe4ubq5saCjpqWjoZ6cmZaTj46MiYaEgoGAf35/fnl3dnZ2dW1pb3J0dnd3eHh3d3d4eHh4dnJqXltgYmNjYllNUFNWV1lcZGZnaWtucXNzc3V2d3d1b2p0e4KKjZGTkYiAg4SGgXJlYF5cWVZhen6ULS1/LdctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLX1sb4Z9YFJUXXCHmJWFamiMjYeLk6Wsq6egoaerrbCsp6SanqCUk4iFiZCboKOmrrSyq6Wkq6eYlo56amllY2RbVGF5g39xbH+ToaitsLKztLa4saGkpqSjoZ6bmZWSj42LiIaEgX9+fn5+fHh1dHR1dG5qcnV2d3h6fHx7e3t7enl3dXNvZ11bY2RkYllVXF9fX2JlaWxtbm9ydHR1dnd3d3h4dG9veYONlJGNioB/gX98dGtjX1xbWFNUZ3+azy2awy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS2EeHt8Z1ZTWGFyh5WLbVtyjpGWk56vsKihp6+ur6yoqKidnqKfopyZmpykqaqoqrCvrqqssaqcm5SKgoSBfHxtV152gYBzZHWMm6SpqamssbS2sKGkpqSin5yZlZGOjIuJhoSBfn18fHx8enZzcXJzcm1sdHh5eXp9fn59fXx7eHZzb21rZ19YXl9fWlhdYWJjY2Rnamxub3F0d3d3eHh4eHt8e3ducoKLkYyFgn2Af3pzbmlkYF1aV1NWY3mhLaaxLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0thG90c2FWV1tjcYaNfGNkh42ZlY+drayqr7GurKSho6GPjpieoJqZmZaan6SinZqbnp+jo5uSmZWQjYqJhH5yX1tqdnZnXnF/hY2UmJyhpqusppuenZqYlZKOi4eFg4J/fHl3dnZ2dXZ2dHBtbGxtbWlrd3t7e3t+f359fX16dXFuaWZlYl1UU1ZXVVtiY2NkZWZnaWxubnB0d3h4eHl7fH+Afnl5fYGFiIOBhYaAeHNvbWhkYV5bWF5wfI6xz7ctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0thG12gXVgV1hcYnGJjXVigIuTk3yCl6OrsK+sqp2YlZOKlqSqqqamn5OXn6anoJWQmaGlo5WOn6GdmpaSioF7cGJmcnBeYXSAhYWKk5yfnaisqKCdmZaTkY6MiISBf316dXJycXBwb29wbWlmZmdnZ2NqeXx9fHt7fHp5eXp3c3BsZ2JgX1xSSlVZWF5iZGVmZ2hoam1vcHBzdnd4eXt/gYOCgIWKj46Rk46OkI2AdXBtaGVjYV5cV1hmfJW0LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tinJ5hod0X1dZXGR7jHlfdI+Wl4F1g5GgrK2qo5eUjo6So66vrKyqmoubpaWlopqUmaOpp5ePpaumop+akoqFgHFyfnllbIOTlpKUnaanoq+zsauloJybmpeUkY+NiYWDfnp6eXh3dnZ1dHFtbGxsbGhseHt7enh1dXZ0dXZzb2toZF9dXFtWT1lgYWBfYWNkZWZnamxubm5zd3d5en1/f3t9hImNkJWbmpWUk4h7dHBqZWJiYF1bVlJSWneVLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tooh4fpCMb1tYWV1qhIBnbpSgmpF4gIuRoJ6en5iVj42PnqqopKWjlISToqSkop+YlJehpZGCnKmkn5uXkYuGhX+AiIBsb4ibnZmco6mmnaeppaCbl5WUko+Nio+QjImFgH18fHp5d3Z0c3FubGxtcGtocHJzcm9rampqamtoZGBcWVhXWVZNTFddXltXW1xcX2FjZWZmZmhucnN1dndybm51e36Dh4+YlY6IhHtybWlkYF5cW1lXUk9OT1dfai0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLamEd4aOeWNaWFpjfYt/e5WhmI54gJONk5eVmJKMg4WJm6WioKKjmYuQoaqsqKWdl5SdoY18lKakn5mUkImBgomSjXlqdIucoaGjqa2ppbO0r6qmo6GfnZmUi4yRjouHgn18e3p4d3VzcnFua2pscm9sdXd5eXZxbWpoaGdkYVxXV1VQU05KUlZZW1pdY2RkZmZlZmlrbXN4e3t8eXZ0dHV4e3+FiYmQiX51cWxnY2BeXFpXVlRRTEpJSUlKXS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS2VfXyHgW5dV1lheJONhpSgl42DfpCPjpaenZOEf4WSn6CenqCkopmVoK+vqaWgnJidnYp6jKGin5qVkYp8dn+TiWxtgI+coqSor7Grqbe4ta+rqKWjn5yYi4yQjIuIhH57enl4dnVzcnBtamlscnFveoCDhIF7dXJva2pnY15aW1VNUExTW1xfYWFjZmlqamdmaW1xdn6Dg4KAe3l6e3x/hImPkZGPhH13cnBta2lnY2BeXFlVUE5NVVldfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS2qiXuBhHZiWVlifJqVkZSYlpSUhH+GlZiboJqJi6Cmp6Shnp+kpZ+Xnq+yqqekn5ial4V8jpmZmJaTlJGFfIOUgmp2i5Wepaiss7SsqbW2tK+rp6WjoJyXiYqMiYmIhYB8enl4dnVzcW9tamlrcHFue4OGhoN+enh1bmlkX1pZWVNOTExYXV9hYmJjZ2ptbWtpbHF0eIGHhH55dnZ4e36Ag4mPk4yDfnp0cHBwbmtoY19dXFlUUU9QZn+SrdQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tp4l9gn9sXltlgJ2fn5yZl5ufloeElaSbm5+Mjaanq66spKGkpaGZnKy0sKyooZ2blYeCkJCNjo+SlJiWlJiaiHqDkZigqrGztratp7Cwr62qqKemo56XiYqLiIeHhYJ+e3p4d3RycG5samlqbW9rdHp9fn5+fXlzcWtjXFlZWVdTS1BbXmBhY2NkaGtsbW1tb3R3fIOEfHZ1dnp/hYWEiZSVioF9enVwb29ua2hlYF1bWldTUVBQZIiapC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0t06GDhoqAamFldpSipKGhoKSmo5mLlKyonZmIh6SprbGuqaWkpJuPjZ+wsq+ooqGfmY2GjoqIioqIjJmgo6KelIySmqCosbe4uLasprCxrqurq6qno52ViIiKh4aFhIJ/fXt5d3ZzcW9ta2loaGhiZmprbW1vcG5ramdhW1lZWVdPS1ddYGFiY2Nla29vb25wdHh+g4N9dXR3eoGIjJGUlZWKgH16dnJvbm1raGRgXVxaWFZTUVBQVF1kf5MtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLa2HhY6PgGtjbpCmo5yeoKWmnpOIjKauqpmEgZ2or7GtqamqpJaLiJaosLCsp6aloZWIjImGiYqFkJ+lo5iZmJOapKqvtbi4uLiuqba3tK6srKmmoZuShYWHhoWEgoF/fXt5eHZ0cnBubGpoZmVeYWZpaGRjZGVlZWFcWVlZWFVLUVteYWJjY2Nob3JycnJ0d3uCg351cXV7f4WLkp+gl42AeHZ1cnBubGpoZWFeW1pYV1RTUlJcZ3Npc5YtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS2De4uVkYF2fZmlnpmampqblI+HiZqnp5t+dZGhqa2vqaitq6GXkpOgq6+vrKqppZiMkIyJio+UnqWqppaYmpadpqyxtLa3ubmwrLi5trGsqaSgnZePg4SFhISEgn9+fHp5eHd0cnBubGxsa2hiZmpsaWRjYmBfXlxaWFhYV1FKU1pcXl9gYGBnbW1tbW5wdHl8eXZxcXZ4fo6ZmaCYin1xbGlpaGlqaGRiYmBcWlZVVVNTUlFdc5ktmcAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1+c4aZoKGbmaGfmZicnJqdmZSPkJqdmZSCcIKYo6euqqmvr6uooJKYo6msrKuppJmNkIyKi4yUnqasp5aanZmepayxtLW2t7euqri3tbGspZ+al5KMf4CDgoKDgn58e3l4d3d1cW9vbm9wbmxobnFwbWxrZ2BcWllZV1dXU0lKU1dZW1tcW1ddYmJjZGVobW9samppbHZ2fIeNioN6dHBrZmJhX11jZWFeX15bWFRSU1NTU1RgcaAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS2AfIaWpKqjm5udnZ6ioqOoqZ+VjIqKkJKHdXmQnZ+orK6urKmsqZeTmZ+kp6mopZyPko2JiImRmqWup5ebnp2fpayytba2t7atqra3tbKtqJ+XkY2Ie3p/fn6Afnx7enl4d3d1b21ucXN0dHNudHd0b25tZ2BbWVhYV1ZVSkdTWV1gYmJiYVxfZ2doaGlsb3BwbW9ub32DiImFdmxwc3JuaGRjY15bXltWVlhYVlJRUlJTVFdnhqfJLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tsS2os6mSiYqUoaOkqKemp6Oai315hImHeXKBj5OcprCwqayuqZ6WkpSaoKKfnpiMkYyFhIeRmqSup5uam5yfpq2zt7i4uLeuqbW2tLCsqaSZkIyJfnVzcnd7enl5eXh3dXZ0bmtsb3BzdXNsc3h0bmtoYl1aV1dXVlZSSU5YXF9gYWFgYF1lbGtra2xvcXR3bm9xcX2GiIV/b2dsb25raGRjY2FfXFhSTk9TVFFQUVBSXWptjazGLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0t6i0tLb+LfoKGkJKRmJ+amaKcj4R8eX2CeGxzhIyUn6quqKirqKmmnJaZm5iOjYuCiIaDgoaMlKGspp+cmZmgqK+2uLm5ubetqbS1sa6rqaWckoyJhX53cG5yc3FxdHV1c3JwbGloaGlrbW1ma29taWZiXVtZV1ZWVVNKSVJYXF5fYF9eXVxmbW5ubnBxc3Z0aWpwcnl9fXx4b2ZjaGtpZ2RiYWBgXltWUU5NUFBQUFBVcC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLdvb5y0tmpl/bXJ5f42RjJehmYuDfHp5a2V0g46UmJ2hnZ6lo6eqp6SjopeCeXl2gYOEh4mKjpqrqqSfnJqirLO4ubm5ubitqbSzr62rqKWflY6KhoN+eXRxbmlmaW1ubGppaWdkYWBhY2NbYGVkYV9cW1lYV1ZVVExFTlRXW11eX15cW1ljaWtsbW5wc3JtZWhwc3Z4eHdybmpgX2ZmZWNiYF5bWlhVU1FMS05QUFdvLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLdwtLS0tLS0tbWVwfIeRjoGKmJOFd3ZzY2l4go2Sk5KRjY+Ym6CjpKmrqp6Fd3J1hoaFiIiIkaKwr6WjoZqgq7W4t7i5ubitqLOxrqyppqSgl4+Lh4J/fXp4dnJsZmdkXl5eXl1bWVhYWVpUWl5eXVtZWFhXV1dUUEZJUlRXW11eXl1bWVdhZGVmZ2lvb2xsamt0dXV2dnRvbWlhWV5iZGRiXVtZV1VTUlBOS0xSWHGmLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tpoJ6hIeSm4dxeoiFeW5nYHF/goaJioaFgYOJjpqfpq2trKSThn6AioOEhoeLma+2samqn5WZqLW3tbe5ubisqLGwraqmpKCblI6KhoJ/fnt6eHd1c3NtZWZmX15hYWBfWlROU1hbXFtZVldXV1ZUTEFMUlNXW11eX1xaV1ZgYmNjZGlua2tvcG93d3RzcnBtamhlXlhdYmRiXVlXVVNSUVBPUFhxh6AtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0t58aYh4OVqJp2X2h8gHJhYHmJiIOBf3t9fH1/hpWkrK2srqiemJGNi4KHiImVpbKzra+ulYyZqbW1s7a4ubirp6+vq6ikoJqVkI2JhYKAf317enl4d3Rxa2pqaGdlY2JgXlpUUVNZW1tZVlVWVlZUSUFOUVNXXF5gYF1aVFReYGJjZWlqaGxycm10dHNxb2xqaGhlYlpVXGFgXVlWVFNSUVBTXy25LeAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLe0tkHqOo5Z1WlNfcnVlaH6HhH15d3V5fn19g4ycpaipqqqmpJ6Vk4qMiYicrbOsqLOyl4mYqbS0sbS4ubeqpq6tqaajnpeTj4yIhYOBgH58e3p5d3Rva2loZ2dlYmFgXlxbV1JXWVpYVlRTU1RSS0ROUVJXXF9hYV5aUlNbXWBjZWdmaHB0cWpvcnJxbWhmZmZlY15VU1tdWldUU1JRUFJniS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLXyBmJp7XVFRXWxnYXN8dnFvbnF5gYB/hImXoKOrqaiqq6aaoZ+UjIifsLOurLa1m4iWqbSzsLO3uLaopKuqp6WhnZeUkI2Kh4SCgH18e3p4d3JuaWhmZWVjYmJhXl1cV05RU1RSUE9OTU1NSEROUVNYXF9hYl9aUVFXWV1hZGVma3Fxb2dqcHFwa2ZkZGNjYF5ZT1NYVlNSUVFQUF2PLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS3wLS0tLYV5kqCIaFdUWWVoW2RsaGdobXN+iIiEhYuap6atraanrqqhqaifmZemsrS0r7W1moeXqbOzr6+ztrSmoqmopaKemZaVko6LiYaDgH59fHl2dXJtaWdkY2NjYmJhXl1cVk5SVFRTUlFPTUxLRUNPUlZZXGBhYmFcUVBVV1tdYWRlaWtsbGVncHBtaWRjYmBfXVtaVE5RU1FQUFBSXHquLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLZSAlq6ehXdxh5F/YGJkZGVqcnyIkY6Hh42bqqmrraemrquosquqqaevtLa2sLS3p5eeqbC0r6uusrGkn6enpKCcl5STkpGOi4iFg4GAfXl2dHJva2hjYGFiYmJhX15cVlBWWFlZWFdVUlJQSkRPVVhaXV9hYmJdUVFUVllbX2JiY2VoamVkbGtoZWFhYF5cXFtZV1BMUVBQUFRmirctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS2nLS0tLS0t1S2if3ZzcW5weIOOk46KjJGZoqWsr7Gwr6qota+vs7K1tra3sbW5s62tra6zr6mssK6gnqalop+cmZWSk5SSj4qIhoSCf315dHFwbGhiXl9hYmJhYF5cV1JWV1hZWVhWU1JRTEJOV1lbXV9gYWFeUlNUVVdYWVtcXV9iZWJbY2dkYWBfXl1bXFtZV1FKTlRZXmmSLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS2UjYB3fIaOkJCRlZeanqWssrS1sauntbW2t7i4ubm4srS1r6+ysKmpqqWlqKeanaaloZ+cmpeSkpWTkIyJh4aDgH56dXBua2diXl5fYWJiYF9cV1NWVVdYWVhVU1JRTUNNV1pcXmBgYGBcU1RVVVVWVldYWVteYV5VXWVjX15dXFtbW1lXVlJMTGWHmqctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLaqTjo2QkJGYn6Gjo6uvs7S3saSltLa2uLq6u7q1qKmnoqKlopqcoZqVlpaSnKWkoZ6cm5mWkpGOjIuJh4aEgHx6dnBsaWZiX11dYGFiYGBeV1JXVlZWV1ZUU1FRS0RQWFxcXmBgYF1YUlRWV1VVWFpbXF1fX1tTXGNhXl1cWllZWVhWVVNPS26rLeMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tuqehmJSapKqsq7GztbW3rpufsLW7xcbDw8e/r7OwrKyurKmrraWdmpman6GhoJ6cnJqYlI+LiImIhYSEgn57d3BqZmVjYV9dX19hX19eWlJVWVdVVVRTU1FPSU9YXF5dYF9dXVpVUFNXWVZXW15fYGFhYFlVX2BeXV1cWVlYWFdVU1JQU38tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLbCvrrKxr7Cytre2sKOgqrTELS0tLS0tLcq7trW3tbO1ta2knpycnJydnp2cm5qWko6KiIeGhIKCgoB7d3FpZGNjYmBdXF5dXV5dXFZSWVhVVFRTU1FJSlddYF9dYF9bWllUT1NXWVhbXl9gYWFhYVlVXV1cXF1dW1pZV1ZUUlFZea0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS3WLcG/ubWxtLa5ubSqrbrM6C0tLS0tLS3Hvbe3tLC0ta+mn5ycnJuanJycm5qWkY6MiomHhYF/gIB7dnFrZGFiYmBcWlxcW1tbW1hRWFlWVFNTUk9FT1pfYWBdXFxZWFhUT1NVWFpdXV1eXl9fX1hTWlpaWlxdXFtZV1VTUVJrpi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS3XLS0tLS0tLc0tLS0tLS0tLS0tLS0tyby3tLG1trKqop6enJuampydnJqYlZORj4yJhoOAf397dXBqZGBhYV9bWFpaWlpZWFlTU1hWVVNSUUtGUlpeX19dWVlYVlZTT1JTV1tbW1tcXFxcXFZQV1dYWlxcXFpYVlRSUVaALS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLcu8tra5t7GtqqWjoZ6cm5ubm5qYl5WUkY6Jh4SCgH56dW5nYmBgYF5aWFhYWFlZV1lUTlZVVFNRT0tHUFNUVVZWU1dYVlVST1JSVVZUVFZYVlVWV1FNVFVXWVpaWllXVFJRUWCXLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLdzLwLm6tKqrsK2sqqejoJqXmJiXlZWUko6JhoJ+fHx7dW5mYmBeXVxbWlpYV1lZV1ZQTVNSUlFQUE5MT1FRUVJRTVNYVlRRTlNVUU5PT1BRUE1NTktIUVVXWFhYWFhWVFJQUG60LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0t2MC3s6mqsbS1tK6ooJmVlJSUk5SUko6LiIWBfHl3c2xmYmBcW1tbW1tYVVZWVFFKTlFQUFBPT09OT1BRUlRSS1BVVVRPTl9lU05YWlZXVlNSUlBLTlFTU1NTVFRTUlFNTG/ALS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS23s7Cws7e2trGpn5eSkZGQkZKTkpCOjYuHgXt1b2hlYl5bWlpaWVhWU1JSUU1HTU9PT09PTk5OTk5OUV5hUE1aY2diYICJYmeEgWpubFpTU1NRT05NTEtMTExMTEtISWYtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS26sbO0s7S1s6yjmZKNjI6OjpCSkpGPjIqHgn13bWZjYV5cW1pZV1RTUlFQT01HS01OT09OTU1NTk5PWoctfGl8LS2ppi0tkqfILS0tpXxoWlNSUlFQT05PT05OTUlHTWItLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS27r7K0s7GvrKKalo+Ni4qKjI6QkZGOioiEgHpza2ViYF1cW1hWVFJSU1JQUFZVUFFPTk5PUVBOTk5PW4WfpC0tLS0tLS0tLS0tLS0tLS2gdVVQUVZcWlNQUVFSUk9MTlstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tr7G0sq6loaKgo52noIyGiIuMjIyJhYSBfHVtZmNhXl1bWVZUU1JXaWdXXnqAbnBlVVFeeXFaUU5OUFlieqMtLS0tLS0tLS0tLS0tLS0tmGJXXnUtLXNZUVBRUlJRT1mcLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tuLO1r6qkpC0tLS0t0aeKgoOEhIN/fHt6dW5nY2BeXltYVlRTUlJgLZ2DmC0tLS0tcGmKti2GaFROT1ZhcaotLS0tLS0tLS0tLS0tLS0tLYiHmi0tLS12VlBQUVJRUFaO2y0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLca3q6mmtNgtLS0tLdejhH18e3p2cnJwbGdkYV5cW1hVU1JRUVJio9QtLS0tLS0tLS3GLdYtoWhTW2uOmq8tLS0tLS0tLS0tLS0tLS0tLS0t3i0tLS2lZ1FQUVFQUFJzLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tsqumvC0tLS0tLS0tLXx2dHJva2tqZmRiYF1aV1RTUlFQT1V+wC0tLS0tLS0tLS0tLS0txZByLZuqLamdLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tf11RUFBRUFBgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLcnELS0tLS0tLfctLYJxbm1qaGdlY2BfXlxZVFJTUlJSV2qqLS0tLS0tLS0tLS0tLS0tLcwtLcvNLS27wS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tsYRlUlBRUVBWgC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLZh1bGpoZ2VjYF1dXVxYU1NjbmNshaAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS2QWlFRUVFSby0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1/bWhmZWNgXVpbXFlVU1qDLS0tzC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tYFFSUlFQXqAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS2Sc2lmY2BeXFpZWVVTXXyiLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tX1NSUlFQW57bLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS2+iW5pY19eX15ZVVNaibwtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tW1JRUlFRWJEtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLXpqZGFiY19ZVFpzp94tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1/V1FRUlJRU3UtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLYxxaGdoZV5XU2CPLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS2KZlNRUlJSUWAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS2HbGtrZFtVWGGLLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS2pkFtSUlNSUFiGLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS2ccGpqYllUZ4EtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS2+jVlSUlJSUFFxLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS23emdoYVhSXHotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS28clNRUlJRUFBkLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0ti2dlYFhSU3YtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0teFRRUlFQUFBeni0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLWpiX1dRUmwtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS3gjmZZUlFPT09VeS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLXJmX1ZQUGEtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLZNoUlBPT09QYC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS2OdF5SUF2VLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLbd8WVBPT09PVy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tqoNlYF98LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS2RXVBPT09OUy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLYKU1C0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tX05OT05OUi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0ta1JPTk5OVi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tk21TTk5QXS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1iT05Xcy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLdR+U1BkLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS2kal6DLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS29kIotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0t';
    function base64ToUint8Array(b64) {
        const binary = atob(b64);
        const arr = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
        return arr;
    }
    const ELEV_DATA = base64ToUint8Array(ELEV_B64);
    const ELEV_MIN = 45, ELEV_MAX = 247; // observed range in the baked data

    function realElevation01(usX, usY) {
        const fx = (usX / US_W) * (ELEV_W - 1);
        const fy = (usY / US_H) * (ELEV_H - 1);
        const x0 = Math.max(0, Math.min(ELEV_W - 1, Math.floor(fx)));
        const y0 = Math.max(0, Math.min(ELEV_H - 1, Math.floor(fy)));
        const x1 = Math.min(x0 + 1, ELEV_W - 1), y1 = Math.min(y0 + 1, ELEV_H - 1);
        const tx = fx - x0, ty = fy - y0;
        const g = (x, y) => ELEV_DATA[y * ELEV_W + x];
        const v = g(x0, y0) * (1 - tx) * (1 - ty) + g(x1, y0) * tx * (1 - ty) + g(x0, y1) * (1 - tx) * ty + g(x1, y1) * tx * ty;
        return Math.max(0, (v - ELEV_MIN) / (ELEV_MAX - ELEV_MIN)); // 0..1
    }

    // ---- live control state ----
    const controls = {
        tileScale: 1.26, density: 270, spread: 1.4,
        bobAmount: 0.05, bobSpeed: 2.62, tileAngle: 43, tileAngleJitter: 4.2,
        elevationIntensity: 4.9,
        structHeight: 2.41, structColor: '#ff6e3e',
        lightOn: true, lightIntensity: 0.84, lightHeight: 23, lightAngle: 169,
        shadowsOn: false, theme: 'light'
    };
    updateSun();
    sun.castShadow = controls.shadowsOn;

    const RELIEF_Y = 0.42;
    const TARGET_WORLD_W = 39; // physical map size stays constant as density changes
    let GRID_X, GRID_Z, CELL, WORLD_W, WORLD_D;
    function computeGridParams(density) {
        GRID_X = Math.round(density);
        GRID_Z = Math.round(GRID_X * (US_H / US_W));
        CELL = TARGET_WORLD_W / GRID_X;
        WORLD_W = GRID_X * CELL;
        WORLD_D = GRID_Z * CELL;
    }
    computeGridParams(controls.density);

    function usToWorld(usX, usY) {
        return {
            x: (usX / US_W) * WORLD_W - WORLD_W / 2,
            z: (usY / US_H) * WORLD_D - WORLD_D / 2
        };
    }
    function terrainHeightAt(usX, usY) {
        const elevation = Math.max(0, realElevation01(usX, usY) + noise(usX, usY) * 0.18) * 1.1;
        return elevation * RELIEF_Y * controls.elevationIntensity;
    }

    // ---- terrain ----
    const terrainGroup = new THREE.Group();
    scene.add(terrainGroup);
    const dotGeo = new THREE.BoxGeometry(1, 1, 1);
    const dotMat = new THREE.MeshLambertMaterial({ color: 0x171512 }); // lit enough to receive shadows, minimal shading otherwise
    let dotMesh = null;
    let liveTiles = [];

    function buildTerrain() {
        computeGridParams(controls.density);
        if (dotMesh) { terrainGroup.remove(dotMesh); }
        liveTiles = [];

        const maxInstances = GRID_X * GRID_Z;
        dotMesh = new THREE.InstancedMesh(dotGeo, dotMat, maxInstances);
        dotMesh.castShadow = true;
        dotMesh.receiveShadow = true;
        const dummy = new THREE.Object3D();
        let idx = 0;

        for (let ix = 0; ix < GRID_X; ix++) {
            for (let iz = 0; iz < GRID_Z; iz++) {
                const usX = (ix / (GRID_X - 1)) * US_W;
                const usY = (iz / (GRID_Z - 1)) * US_H;
                const inside = pointInPolygon(usX, usY, US_POLY);

                let keep = false;
                if (inside) {
                    keep = Math.random() > 0.08;
                } else if (nearCoastline(usX, usY)) {
                    keep = Math.random() > 0.92; // occasional stray dot right at the edge, not out in open ocean
                }

                const gx = (ix - GRID_X / 2) * CELL;
                const gz = (iz - GRID_Z / 2) * CELL;
                const elevation = Math.max(0, realElevation01(usX, usY) + noise(usX, usY) * 0.18) * 1.1;
                const t = tone(usX, usY);
                const rotJitterRaw = Math.random() - 0.5; // -0.5..0.5, scaled live by the angle-variation control
                const myIdx = idx++;

                if (!keep) {
                    dummy.scale.set(0, 0, 0);
                    dummy.position.set(gx, elevation * RELIEF_Y * controls.elevationIntensity, gz);
                    dummy.updateMatrix();
                    dotMesh.setMatrixAt(myIdx, dummy.matrix);
                    continue;
                }

                const footprint = CELL * (0.22 + t * 0.55) * (0.7 + Math.random() * 0.4);
                const thickness = CELL * 0.02; // proportional to cell size — stays flat at any density
                const jitterXRaw = (Math.random() - 0.5) * CELL * 0.4;
                const jitterZRaw = (Math.random() - 0.5) * CELL * 0.4;

                liveTiles.push({
                    i: myIdx, gx, gz, jx: jitterXRaw, jz: jitterZRaw,
                    elevRaw: elevation, rotJitterRaw,
                    sx: footprint, sy: thickness, sz: footprint,
                    phase: Math.random() * Math.PI * 2,
                    speedBase: 0.35 + Math.random() * 0.35
                });
            }
        }
        dotMesh.instanceMatrix.needsUpdate = true;
        terrainGroup.add(dotMesh);
    }
    buildTerrain();

    // ---- buildings ----
    // description: shown in the hover tooltip. url: where a click navigates to (fill in real destinations
    // per city — currently a Google Images search for the city name as a placeholder).
    function imgSearchUrl(query) {
        return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;
    }
    const locations = [
        { name: 'Nashville, TN', count: 96, usX: 65.72, usY: 28.73, description: '96 projects completed', url: imgSearchUrl('Nashville, TN') },
        { name: 'Chattanooga, TN', count: 22, usX: 68.26, usY: 31.14, description: '22 projects completed', url: imgSearchUrl('Chattanooga, TN') },
        { name: 'Knoxville, TN', count: 27, usX: 70.67, usY: 29.16, description: '27 projects completed', url: imgSearchUrl('Knoxville, TN') },
        { name: 'Memphis, TN', count: 24, usX: 60.05, usY: 30.92, description: '24 projects completed', url: imgSearchUrl('Memphis, TN') },
        { name: 'Atlanta, GA', count: 41, usX: 69.86, usY: 33.96, description: '41 projects completed', url: imgSearchUrl('Atlanta, GA') },
        { name: 'Charlotte, NC', count: 33, usX: 76.00, usY: 30.75, description: '33 projects completed', url: imgSearchUrl('Charlotte, NC') },
        { name: 'Raleigh, NC', count: 18, usX: 79.81, usY: 29.55, description: '18 projects completed', url: imgSearchUrl('Raleigh, NC') },
        { name: 'Birmingham, AL', count: 15, usX: 65.68, usY: 34.46, description: '15 projects completed', url: imgSearchUrl('Birmingham, AL') },
        { name: 'Louisville, KY', count: 19, usX: 67.48, usY: 24.19, description: '19 projects completed', url: imgSearchUrl('Louisville, KY') },
        { name: 'Indianapolis, IN', count: 14, usX: 66.79, usY: 20.88, description: '14 projects completed', url: imgSearchUrl('Indianapolis, IN') },
        { name: 'Kansas City, MO', count: 11, usX: 52.21, usY: 22.34, description: '11 projects completed', url: imgSearchUrl('Kansas City, MO') },
        { name: 'Chicago, IL', count: 20, usX: 64.24, usY: 16.30, description: '20 projects completed', url: imgSearchUrl('Chicago, IL') },
        { name: 'Dallas, TX', count: 29, usX: 48.37, usY: 36.07, description: '29 projects completed', url: imgSearchUrl('Dallas, TX') },
        { name: 'Houston, TX', count: 23, usX: 50.84, usY: 42.63, description: '23 projects completed', url: imgSearchUrl('Houston, TX') },
        { name: 'Orlando, FL', count: 16, usX: 75.07, usY: 45.28, description: '16 projects completed', url: imgSearchUrl('Orlando, FL') },
        { name: 'Miami, FL', count: 13, usX: 77.13, usY: 51.32, description: '13 projects completed', url: imgSearchUrl('Miami, FL') },
        { name: 'Denver, CO', count: 9, usX: 34.18, usY: 20.95, description: '9 projects completed', url: imgSearchUrl('Denver, CO') },
        { name: 'Phoenix, AZ', count: 10, usX: 21.92, usY: 34.61, description: '10 projects completed', url: imgSearchUrl('Phoenix, AZ') },
        { name: 'Los Angeles, CA', count: 12, usX: 11.24, usY: 33.31, description: '12 projects completed', url: imgSearchUrl('Los Angeles, CA') },
        { name: 'San Francisco,CA', count: 8, usX: 4.00, usY: 25.23, description: '8 projects completed', url: imgSearchUrl('San Francisco, CA') },
        { name: 'Seattle, WA', count: 7, usX: 4.16, usY: 3.85, description: '7 projects completed', url: imgSearchUrl('Seattle, WA') },
        { name: 'New York, NY', count: 17, usX: 87.83, usY: 18.84, description: '17 projects completed', url: imgSearchUrl('New York, NY') },
        { name: 'Boston, MA', count: 10, usX: 92.94, usY: 15.26, description: '10 projects completed', url: imgSearchUrl('Boston, MA') },
    ];

    const barMat = new THREE.MeshStandardMaterial({ color: controls.structColor, roughness: 0.5, metalness: 0.08 });
    const structGeo = new THREE.BoxGeometry(1, 1, 1); // unit box — footprint baked via mesh scale, height via group scale
    const STRUCT_BASE_HEIGHT = 0.55; // reference height at structHeight=1
    let buildings = [];

    function buildBuildings() {
        buildings.forEach(g => scene.remove(g));
        buildings = [];
        const footprint = CELL * 0.55; // matches the terrain's own average tile size — reads as "one tile, extruded"

        locations.forEach(loc => {
            const group = new THREE.Group();
            const mesh = new THREE.Mesh(structGeo, barMat);
            mesh.scale.set(footprint, STRUCT_BASE_HEIGHT, footprint);
            mesh.position.y = STRUCT_BASE_HEIGHT / 2; // sits on the ground, extrudes upward
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            group.add(mesh);
            const { x, z } = usToWorld(loc.usX, loc.usY);
            group.position.set(x, terrainHeightAt(loc.usX, loc.usY), z);
            group.userData = { name: loc.name, description: loc.description, url: loc.url, usX: loc.usX, usY: loc.usY };
            scene.add(group);
            buildings.push(group);
        });
    }
    buildBuildings();

    // ---- camera rig: orbit (drag), pan (space+drag or middle-drag), zoom (wheel) ----
    let radius = 26, theta = Math.PI * 0.32, phi = Math.PI * 0.4;
    let target = new THREE.Vector3(0, 0.3, 0);
    let dragging = false, mode = null, lastX = 0, lastY = 0, spaceDown = false;
    let interactionEnabled = false;

    // ---- named view presets: default (perspective) + isometric (orthographic) ----
    const DEFAULT_RADIUS = radius, DEFAULT_THETA = theta, DEFAULT_PHI = phi;
    const DEFAULT_TARGET = target.clone();
    const ISO_THETA = Math.PI / 4, ISO_PHI = Math.acos(1 / Math.sqrt(3));

    const camState = { radius, theta, phi, tx: target.x, ty: target.y, tz: target.z };
    function syncCamState() {
        radius = camState.radius; theta = camState.theta; phi = camState.phi;
        target.set(camState.tx, camState.ty, camState.tz);
        updateCamera();
    }

    window.setDefaultView = () => {
        isOrtho = false;
        activeCamera = perspCamera;
        gsap.to(camState, {
            radius: DEFAULT_RADIUS, theta: DEFAULT_THETA, phi: DEFAULT_PHI,
            tx: DEFAULT_TARGET.x, ty: DEFAULT_TARGET.y, tz: DEFAULT_TARGET.z,
            duration: 0.9, ease: 'power2.inOut', onUpdate: syncCamState
        });
    };

    window.setIsometricView = () => {
        isOrtho = true;
        activeCamera = orthoCamera;
        gsap.to(camState, {
            radius: DEFAULT_RADIUS, theta: ISO_THETA, phi: ISO_PHI,
            tx: DEFAULT_TARGET.x, ty: DEFAULT_TARGET.y, tz: DEFAULT_TARGET.z,
            duration: 0.9, ease: 'power2.inOut', onUpdate: syncCamState
        });
    };

    window.setMapInteraction = enabled => {
        interactionEnabled = enabled;
        if (!enabled) {
            dragging = false; mode = null; spaceDown = false;
            canvas.classList.remove('panning');
        }
    };

    function updateCamera() {
        const cx = target.x + radius * Math.sin(phi) * Math.cos(theta);
        const cy = target.y + radius * Math.cos(phi);
        const cz = target.z + radius * Math.sin(phi) * Math.sin(theta);

        perspCamera.position.set(cx, cy, cz);
        perspCamera.lookAt(target);

        orthoCamera.position.set(cx, cy, cz);
        orthoCamera.lookAt(target);
        const halfH = radius * 0.5;
        const halfW = halfH * (window.innerWidth / window.innerHeight);
        orthoCamera.left = -halfW; orthoCamera.right = halfW;
        orthoCamera.top = halfH; orthoCamera.bottom = -halfH;
        orthoCamera.updateProjectionMatrix();
    }
    updateCamera();

    window.addEventListener('keydown', e => {
        if (!interactionEnabled) return;
        if (e.code === 'Space') { spaceDown = true; e.preventDefault(); }
    });
    window.addEventListener('keyup', e => {
        if (e.code === 'Space') { spaceDown = false; }
    });

    canvas.addEventListener('pointerdown', e => {
        if (!interactionEnabled) return;
        dragging = true; lastX = e.clientX; lastY = e.clientY;
        if (e.button === 1 || (e.button === 0 && spaceDown)) {
            mode = 'pan'; canvas.classList.add('panning'); e.preventDefault();
        } else if (e.button === 0) {
            mode = 'orbit';
        }
    });
    window.addEventListener('pointerup', () => { dragging = false; mode = null; canvas.classList.remove('panning'); });

    // ---- hover to inspect, click to open ----
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    function pickBuilding(e) {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, activeCamera);
        const meshes = buildings.flatMap(g => g.children);
        const hits = raycaster.intersectObjects(meshes);
        return hits.length ? hits[0].object.parent : null;
    }

    window.addEventListener('pointermove', e => {
        if (!interactionEnabled) return;
        if (dragging) {
            const dx = e.clientX - lastX, dy = e.clientY - lastY;
            lastX = e.clientX; lastY = e.clientY;

            if (mode === 'orbit') {
                theta -= dx * 0.005;
                phi = Math.min(Math.PI * 0.49, Math.max(0.04, phi - dy * 0.005));
                updateCamera();
            } else if (mode === 'pan') {
                const camPos = activeCamera.position;
                const forward = new THREE.Vector3().subVectors(target, camPos).normalize();
                const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
                const camUp = new THREE.Vector3().crossVectors(right, forward).normalize();
                const panScale = radius * 0.0018;
                target.addScaledVector(right, -dx * panScale);
                target.addScaledVector(camUp, dy * panScale);
                updateCamera();
            }
            return;
        }

        const group = pickBuilding(e);
        if (group) {
            const { name, description } = group.userData;
            tooltip.style.display = 'block';
            tooltip.style.left = e.clientX + 'px';
            tooltip.style.top = e.clientY + 'px';
            tooltip.querySelector('.loc').textContent = name;
            tooltip.querySelector('.count').textContent = description;
            canvas.style.cursor = 'pointer';
        } else {
            tooltip.style.display = 'none';
            canvas.style.cursor = '';
        }
    });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    canvas.addEventListener('wheel', e => {
        if (!interactionEnabled) return;
        radius = Math.min(55, Math.max(5, radius + e.deltaY * 0.015));
        updateCamera();
        e.preventDefault();
    }, { passive: false });

    canvas.addEventListener('click', e => {
        if (!interactionEnabled) return;
        const group = pickBuilding(e);
        if (group && group.userData.url) {
            window.location.href = group.userData.url;
        }
    });

    window.addEventListener('resize', () => {
        perspCamera.aspect = window.innerWidth / window.innerHeight;
        perspCamera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        updateCamera();
    });

    // ---- render loop ----
    function animate() {
        requestAnimationFrame(animate);
        const t = performance.now() * 0.001;
        const dummy = new THREE.Object3D();

        for (let k = 0; k < liveTiles.length; k++) {
            const d = liveTiles[k];
            const wx = d.gx + d.jx * controls.spread;
            const wz = d.gz + d.jz * controls.spread;
            const wy = d.elevRaw * RELIEF_Y * controls.elevationIntensity + Math.sin(t * d.speedBase * controls.bobSpeed + d.phase) * controls.bobAmount;
            dummy.position.set(wx, wy, wz);
            dummy.rotation.y = (controls.tileAngle * Math.PI / 180) + d.rotJitterRaw * 2 * (controls.tileAngleJitter * Math.PI / 180);
            dummy.scale.set(d.sx * controls.tileScale, d.sy * controls.tileScale, d.sz * controls.tileScale);
            dummy.updateMatrix();
            dotMesh.setMatrixAt(d.i, dummy.matrix);
        }
        if (dotMesh) dotMesh.instanceMatrix.needsUpdate = true;

        buildings.forEach(g => {
            g.scale.set(controls.tileScale, controls.structHeight, controls.tileScale);
            g.rotation.y = controls.tileAngle * Math.PI / 180;
            g.position.y = terrainHeightAt(g.userData.usX, g.userData.usY);
        });

        updateCamera();
        renderer.render(scene, activeCamera);
    }
    animate();


    // MAP DOM INTERFACE

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
        mapSection.classList.add('active');

        gsap.to('.border-bottom-el-container-inner', {
            y: '4rem',
            opacity: 0,
            duration: .2
        });
    }

    function unlockScroll() {
        locked = false;
        lenis.start();
        window.removeEventListener('wheel', preventScrollEvent);
        window.removeEventListener('touchmove', preventScrollEvent);
        window.removeEventListener('keydown', preventScrollKey);
        window.setMapInteraction(false);

        mapSection.classList.remove('active');
        mapToggleBtnWrapper.classList.remove('locked');

        gsap.to('.border-bottom-el-container-inner', {
            y: '0rem',
            opacity: 1,
            duration: .2
        });
    }

    const mapSectionTrigger = document.querySelector('.map-section-trigger');
    const border = document.querySelector('.border-bottom-el-container-inner');

    const mapTrigger = ScrollTrigger.create({
        // trigger: mapSection,
        trigger: mapSectionTrigger,
        start: 'top top',
        end: '+=50px',
        // pin: true,
        pinSpacing: true,
        // markers: true,
        onEnter: pinHandler,
        onEnterBack: pinHandler,
    });

    function pinHandler() {
        if (!permanentlyUnpinned) {
            lockScroll();
        } else {
            mapSection.classList.remove('active');
            openBtn.classList.add('show');

            gsap.to('.border-bottom-el-container-inner', {
                y: '0rem',
                opacity: 1,
                duration: .2
            });
        }
    }

    closeBtn.addEventListener('click', () => {
        unlockScroll();
        mapSection.classList.remove('active');
        openBtn.classList.add('show');
    });

    openBtn.addEventListener('click', () => {
        permanentlyUnpinned = false;

        lenis.scrollTo('#canvas-wrap');
        mapSection.classList.add('active');
        openBtn.classList.remove('show');

        gsap.to('.border-bottom-el-container-inner', {
            y: '-4rem',
            opacity: 0,
            duration: .2
        });
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

}