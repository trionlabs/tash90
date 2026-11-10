// TASH90 mosaic: the Bosphorus looking south, laid in tesserae on a canvas. Classic script, no imports.
// Scene is composed on a 240-column grid; narrow screens crop towards the bridge, wide ones extend water and shores.
var M_PAL = {
  light: { hex: ['#063a4d', '#0a6685', '#1380a6', '#3fa3c6', '#7cc4dc', '#b4dfec', '#e1f3f8', '#fefefe', '#fefefe', '#1380a6', '#e1f3f8'],
    glyph: { '#': 0, w: 6, b: 3, f: 7 }, far: 1, lit: 7, glint: 7, glow: 6, flood: 5, dome: 4, panel: { frame: 5, field: 6, ground: 5, figure: 1 } },
  dark: { hex: ['#0d1430', '#1a2a5e', '#24408a', '#3559a8', '#5b7cc0', '#9fb2dc', '#e3e6ef', '#f8f3e6', '#e0b955', '#94585e', '#e6d8b2', '#2e7d6e'],
    glyph: { '#': 0, w: 7, b: 8, f: 8 }, far: 9, lit: 8, glint: 8, glow: 8, flood: 6, dome: 9,
    // Byzantine tesserae of other stones: verdigris in the water, gold flecks in the moon's haze, rose along the horizon.
    accents: { water: [11, 0.035], haze: [8, 0.018], horizon: [9, 0.014] }, paper: 0, panel: { frame: 4, field: 10, ground: 1, figure: 8 } }
};
// Istanbul city ferries: double-ended, two decks of windows, one funnel with a dark cap, a mast at each end.
var M_SHIP = {
  far: ['....#....', '..wwwww..', '#########'],
  mid: ['.......#.......', '.......f.......', '...wwwwwwwww...', '..wbbwbbwbbww..', '.wwwwwwwwwwwww.', '###############', '.#############.'],
  near: ['...........##...........', '...........ff...........', '..#........ff........#..', '..wwwwwwwwwwwwwwwwwwww..', '.wwbbwbbwbbwbbwbbwbbwww.', 'wwwwwwwwwwwwwwwwwwwwwwww', '########################', '.######################.']
};
// Landmarks as tile art: '#' the silhouette, 'L' a light, 'B' a blinking beacon, 'd' a dark arch.
var M_HAGIA = ['.#.............#.', '.#.....###.....#.', '.#...#######...#.', '.#.###########.#.', '.#.##L#L#L#L##.#.', '.###############.', '#################'];
var M_CAMLICA = ['..B...', '..#...', '..#...', '..#...', '..#...', '..##..', '.####.', '######', '#L##L#', '######', '.####.', '.####.', '..##..', '..##..', '..##..', '..##..', '..##..', '..##..', '..##..', '..##..', '..##..'];
var M_ORTAKOY = ['.#....#....#.', '.#..#####..#.', '.#.#######.#.', '.#.#d#d#d#.#.', '#############'];
var M_BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
var M_MAIDEN = ['.....#.....', '....###....', '....#L#....', '...#####...', '....###....', '....###....', '....###.##.', '...#######.', '.#########.', '###########'];
// Topic emblems, 11×11 tesserae, figure and ground both laid: an eye that checks from outside,
// a tower of the city walls with its gate, and a gauge whose needle measures risk.
var M_ICON = {
  check: ['...........', '...........', '...#####...', '..##...##..', '.##.###.##.', '##..###..##', '.##.###.##.', '..##...##..', '...#####...', '...........', '...........'],
  lock: ['..#.#.#.#..', '..#######..', '..#.....#..', '..#..#..#..', '..#..#..#..', '..#.....#..', '#.#.....#.#', '####...####', '#..#...#..#', '#..#...#..#', '####...####'],
  scales: ['...........', '...#####...', '..#..#..#..', '.#.......#.', '.#.......#.', '#......#..#', '#.....#...#', '#....#....#', '###########', '...........', '...........']
};

function mClamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function mHash(x, y, s) {
  var h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1103515245);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function mRgb(h) { return [1, 3, 5].map(function (i) { return parseInt(h.slice(i, i + 2), 16); }); }

// Thresholds come in horizontal runs, so tones mix in short courses of tiles rather than as speckle.
function mRuns(rows, P, lenOf) {
  var t = new Float32Array(rows * P);
  for (var r = 0; r < rows; r++) {
    for (var x = 0, k = 0; x < P; k++) {
      var len = lenOf(r, mHash(r, k, 5)), v = mHash(r, k, 6);
      for (var i = 0; i < len && x < P; i++) t[r * P + x++] = v;
    }
  }
  return t;
}

function mBlank(cols, rows) {
  var n = cols * rows, P = cols + 61;
  return { cols: cols, rows: rows, P: P, lvl: new Float32Array(n).fill(1), solid: new Int8Array(n).fill(-1), idx: new Uint8Array(n),
    front: new Int16Array(n), tex: new Float32Array(rows).fill(1), off: new Int16Array(rows), every: new Uint8Array(rows),
    thr: new Float32Array(rows * P), top: 0, hy: -1, accents: null, paper: 7, glitter: [], ships: [], gulls: [], lights: [], cable: [], icon: [], focus: null };
}

// Tones sit in calm bands; only the middle of each step mixes the two neighbouring tints.
function mQuant(s, c, r) {
  var i = r * s.cols + c;
  if (s.solid[i] >= 0) return s.solid[i];
  var l = s.lvl[i], f = l - Math.floor(l);
  if (r < s.hy) {
    var ks = mClamp(Math.floor(l) + (f > (M_BAYER[(r & 3) * 4 + (c & 3)] + 0.5) / 16 ? 1 : 0), 0, 7), A = s.accents;
    if (A && ks >= 3 && r >= s.hy - 6 && mHash(c, r, 31) < A.horizon[1]) return A.horizon[0];
    if (A && ks >= 3 && Math.hypot((c - s.focus[0]) / 1.4, r - s.focus[1]) < 16 && mHash(c, r, 29) < A.haze[1] * 2.5) return A.haze[0];
    return ks;
  }
  var p = ((c + s.off[r]) % s.P + s.P) % s.P, t = s.thr[r * s.P + p];
  var k = mClamp(Math.floor(l) + (mClamp((f - 0.3) / 0.4, 0, 1) > t ? 1 : 0), 0, 7);
  // A few tesserae of a second hue in the water, moving with its runs (dark theme only).
  // Verdigris gathers in the open water and thins out towards the far shore and the foam.
  if (s.accents && r > s.hy + 3 && k >= 1 && k <= 3 && mHash(Math.floor(p / 2), r, 23) < s.accents.water[1] * 1.6 * Math.sin(Math.PI * mClamp((r - s.hy - 3) / (s.rows - s.hy - 18), 0, 1))) return s.accents.water[0];
  return k;
}

// Rows melt into paper: tiles thin out, then the grout goes.
function mMelt(s, r, fade) {
  var P = s.paper;
  for (var c = 0; c < s.cols; c++) {
    var i = r * s.cols + c, e = fade + (mHash(Math.floor(c / 3), r, 8) - 0.5) * 0.66 + 0.1 * Math.sin(c / 6);
    s.lvl[i] += (P - s.lvl[i]) * mClamp(e * 1.5, 0, 1);
    if (e > 0.75) s.solid[i] = P;
  }
}

function mShip(kind, x, hull, dir, every) {
  var rows = M_SHIP[kind];
  return { rows: rows, w: rows[0].length, h: rows.length, x: x, y: hull - rows.length + 1, dir: dir, every: every,
    wake: kind === 'near' ? 10 : kind === 'mid' ? 7 : 4, prev: [] };
}

function mHero(cols, rows, pal) {
  // On narrow screens the frame centres on the bridge, so the moon moves in between the towers.
  var W = 240, narrow = cols < 120, FOCUS = cols < 200 ? 157 : 138;
  if (cols < 200 && cols >= 134) FOCUS = 91 + Math.floor(cols / 2);
  var _unused = 0, WATER = 42, MELT = 16;
  var s = mBlank(cols, rows), hy = rows - WATER;
  var ox = cols >= W ? Math.floor((cols - W) / 2) : -mClamp(FOCUS - Math.floor(cols / 2), 0, W - cols);
  var mx = narrow ? 148 : 174, my = hy - (narrow ? 27 : 24), t1 = 92, t2 = 164, deck = hy - 6, tt = hy - 20, F = pal.far;
  s.top = Math.max(0, hy - 46);
  s.hy = hy;
  s.accents = pal.accents || null;
  if (pal.paper != null) s.paper = pal.paper;
  s.focus = [mx + ox, my];
  s.thr = mRuns(rows, s.P, function (r, u) { return r < hy ? 3 + Math.floor(u * 9) : 2 + Math.floor(u * (3 + (r - hy) * 0.12)); });
  for (var r = 0; r < rows; r++) s.tex[r] = Math.min(mClamp((r - s.top) / 8, 0, 1), mClamp((rows - 2 - r) / 9, 0, 1));

  function at(sc, r) { var c = sc + ox; return c >= 0 && c < cols && r >= 0 && r < rows ? r * cols + c : -1; }
  function put(sc, r, k) { var i = at(sc, r); if (i >= 0) s.solid[i] = k; return i; }
  function rect(a, b, r0, r1, k) { for (var r = r0; r <= r1; r++) for (var x = a; x <= b; x++) put(x, r, k); }
  function art(rows, x, b, k) {
    for (var j = 0; j < rows.length; j++) for (var q = 0; q < rows[j].length; q++) {
      var ch = rows[j][q], y = b - rows.length + 1 + j;
      if (ch === '#') put(x + q, y, k); else if (ch === 'd') put(x + q, y, 0);
      else if (ch === 'L') light(x + q, y, k === 0 ? 'deck' : 'dome', k); else if (ch === 'B') light(x + q, y, 'beacon', k);
    }
  }
  function light(sc, r, kind, k) { var i = put(sc, r, k); if (i >= 0) s.lights.push({ i: i, kind: kind, off: k, n: s.lights.length }); return i; }
  function wide(sc) { return 0.35 + 0.65 * Math.exp(-Math.pow((sc - mx) / 90, 2)); }

  // Sky: flat field above, a haze that brightens towards the horizon and the moon, a glow behind the bridge.
  for (r = s.top; r < hy; r++) {
    for (var c = 0; c < cols; c++) {
      var sc = c - ox, d = Math.hypot((sc - mx) / 1.4, r - my), up = hy - 1 - r;
      s.lvl[r * cols + c] = 1 + mClamp((r - s.top) / 16, 0, 1) * (2.6 * Math.exp(-up / (6 + 4 * mClamp((sc - 140) / 60, 0, 1))) * wide(sc) + 1.6 * Math.exp(-d / 7) + 0.6 * Math.exp(-d / 18)
        + (sc > t1 && sc < t2 + 3 ? 1.1 * Math.exp(-up * up / 5) : 0) + 2.0 * Math.exp(-up / 9) * mClamp((sc - 200) / 10, 0, 1));
    }
  }
  for (r = my - 4; r <= my + 4; r++) for (sc = mx - 4; sc <= mx + 4; sc++) if (Math.hypot(sc - mx, r - my) < 3.3) put(sc, r, pal.lit);
  // Behind and just above Hagia Sophia's dome (rows hy-11..hy-5), a flat, undithered sky two steps darker than the dome.
  // Its edges blend into the haze over three columns and rows, so there is no visible box.
  for (r = hy - 13; r <= hy - 4; r++) for (sc = 203; sc <= 223; sc++) {
    var hi = at(sc, r), wq = mClamp(Math.min(sc - 203, 223 - sc, r - (hy - 13)) / 3, 0, 1);
    if (hi >= 0) s.lvl[hi] = s.lvl[hi] * (1 - wq) + 2 * wq;
  }

  // The far shore all along, one step lighter than the near shores: depth by value.
  for (c = 0; c < cols; c++) {
    sc = c - ox;
    rect(sc, sc, hy - Math.round(2.2 + 1.2 * Math.sin(sc / 17) + 0.8 * Math.sin(sc / 6.3 + 2)), hy - 1, 2);
  }

  // Far right: the historic peninsula with Hagia Sophia (its ring of dome windows lights up), and the Galata Tower.
  // A dark body and drum; the dome light against the light theme's haze, muted rose in the dark theme.
  art(M_HAGIA, 205, hy - 3, 0);
  for (var dr = 0; dr < 3; dr++) for (var dq = 3; dq < 14; dq++) if (M_HAGIA[1 + dr][dq] === '#') put(205 + dq, hy - 3 - 6 + 1 + dr, pal.dome);
  var G2 = F === 9 ? 1 : F;
  rect(224, 234, hy - 2, hy - 1, G2);
  rect(228, 230, hy - 9, hy - 2, G2); rect(227, 231, hy - 8, hy - 8, G2); put(229, hy - 10, G2); put(229, hy - 11, G2);

  // Near shores: the Asian hills on the left, the Ortaköy promontory on the right.
  function hill(sc) { return 3.5 + 6 * Math.exp(-Math.pow((sc - 14) / 20, 2)) + 0.9 * Math.sin(sc / 5.3); }
  for (c = 0; c < cols; c++) {
    sc = c - ox;
    var h = 0;
    if (sc <= 82) h = hill(sc) * mClamp((82 - sc) / 14, 0, 1) + (sc > 40 && sc < 76 && mHash(Math.floor(sc / 3), 0, 11) < 0.4 ? 1 : 0);
    if (sc >= 182 && sc <= 214) h = 6 * Math.sin(Math.PI * (sc - 182) / 32) + (mHash(Math.floor(sc / 3), 1, 11) < 0.4 ? 1 : 0);
    h = Math.round(h);
    if (h > 0) rect(sc, sc, hy - h, hy - 1, 0);
  }

  // Çamlıca Tower on its hill: slender shaft, a tulip head with a lit deck, antenna, aviation light.
  art(M_CAMLICA, 14, hy - Math.round(hill(16)), 0);

  // Ortaköy Mosque at the European foot of the bridge.
  art(M_ORTAKOY, 186, hy - 1, pal.flood);

  // The bridge: portal towers, a sagging main cable, side cables to the anchorages, fine hangers.
  rect(64, 196, deck, deck, 0);
  [t1, t2].forEach(function (t) {
    rect(t, t, tt, hy + 1, 0); rect(t + 2, t + 2, tt, hy + 1, 0);
    rect(t, t + 2, tt, tt, 0); rect(t, t + 2, tt + 5, tt + 5, 0); rect(t, t + 2, deck + 1, deck + 1, 0);
  });
  var mid = (t1 + t2 + 2) / 2, half = (t2 - t1 - 2) / 2;
  for (sc = 64; sc <= 196; sc++) {
    var y = -1;
    if (sc > t1 + 2 && sc < t2) { var u = (sc - mid) / half; y = Math.round(tt + (deck - 2 - tt) * (1 - u * u)); }
    else if (sc < t1) y = Math.round(deck - (deck - tt) * Math.pow((sc - 64) / (t1 - 64), 1.3));
    else if (sc > t2 + 2) y = Math.round(deck - (deck - tt) * Math.pow((196 - sc) / (196 - t2 - 2), 1.3));
    if (y < 0 || y >= deck) continue;
    var ci = put(sc, y, 0);
    if (ci >= 0) s.cable.push(ci);
    if ((sc - t1) % 4 === 0 && y < deck - 1) rect(sc, sc, y + 1, deck - 1, 1);
  }

  // Water: lighter towards the viewer, the moon's path, mirrored silhouettes.
  for (r = hy; r < rows; r++) {
    var dp = r - hy, w = 2.5 + dp * 0.42;
    for (c = 0; c < cols; c++) {
      sc = c - ox;
      s.lvl[r * cols + c] = 2.1 + 1.3 * dp / WATER + 1.2 * Math.exp(-dp / 5) * (0.2 + 0.8 * Math.exp(-Math.pow((sc - mx) / 100, 2)))
        + 3.4 * Math.exp(-1.4 * Math.pow((sc - mx) / w, 2)) * Math.exp(-dp / 42);
    }
    s.every[r] = r > hy && r < rows - MELT ? 6 + Math.floor(mHash(r, 0, 13) * 10) : 0;
  }
  for (r = hy; r < hy + 18; r++) {
    var m = hy - 1 - (r - hy), shift = Math.round(1.4 * Math.sin(r * 1.3));
    for (c = 0; c < cols; c++) {
      var src = c - shift;
      if (src < 0 || src >= cols || s.solid[m * cols + src] !== 0) continue;
      if (mHash(c, r, 3) > (r - hy) / 20) s.lvl[r * cols + c] = 1 + (s.lvl[r * cols + c] - 1) * 0.42;
    }
  }

  // The Maiden's Tower on its islet, with a lantern; it stands in front of the far ferries.
  var kb = hy + 12, kx = 111, top = kb - M_MAIDEN.length + 1;
  for (var j = 0; j < M_MAIDEN.length; j++) {
    for (var q = 0; q < M_MAIDEN[j].length; q++) {
      var ch = M_MAIDEN[j][q];
      if (ch === '.') continue;
      var ki = ch === 'L' ? light(kx + q, top + j, 'lantern', 0) : put(kx + q, top + j, 0);
      if (ki >= 0) s.front[ki] = kb;
    }
  }

  for (r = rows - MELT; r < rows; r++) mMelt(s, r, (r - (rows - MELT)) / (MELT - 3));
  for (var i = (rows - 3) * cols; i < rows * cols; i++) s.solid[i] = s.paper;
  for (r = hy + 1; r < rows - MELT; r++) {
    w = 2.5 + (r - hy) * 0.42 + 1.5;
    for (c = 0; c < cols; c++) if (Math.abs(c - ox - mx) < w && s.solid[r * cols + c] < 0) s.glitter.push(r * cols + c);
  }
  s.ships = [mShip('far', Math.round(cols * 0.22), hy + 5, 1, 6), mShip('far', Math.round(cols * 0.74), hy + 8, -1, 7),
    mShip('mid', Math.round(cols * 0.6), hy + 15, -1, 4), mShip('near', Math.round(cols * 0.12), hy + 24, 1, 3)];
  return s;
}

// The footer strip: the same water rising out of the paper and settling into the footer colour.
function mStrip(cols, rows, pal) {
  var s = mBlank(cols, rows);
  if (pal && pal.paper != null) s.paper = pal.paper;
  s.thr = mRuns(rows, s.P, function (r, u) { return 2 + Math.floor(u * 6); });
  for (var r = 0; r < rows; r++) {
    s.tex[r] = Math.min(mClamp(r / 9, 0, 1), mClamp((rows - 3 - r) / 8, 0, 1));
    for (var c = 0; c < cols; c++) s.lvl[r * cols + c] = 3.4 - 2.4 * mClamp((r - 10) / (rows - 14), 0, 1);
    s.every[r] = r > 14 && r < rows - 8 ? 6 + Math.floor(mHash(r, 0, 13) * 10) : 0;
  }
  for (r = 0; r < 15; r++) mMelt(s, r, (15 - r) / 13);
  for (var i = 0; i < 3 * cols; i++) s.solid[i] = s.paper;
  return s;
}

// A topic emblem: an 11×11 square of tesserae, figure and ground.
function mEmblem(cols, rows, glyph, P) {
  var s = mBlank(cols, rows), art = M_ICON[glyph] || M_ICON.check;
  for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
    var ch = art[r] && art[r][c], i = r * cols + c;
    s.solid[i] = ch === '#' ? P.figure : P.ground;
    if (ch === '#') s.icon.push(i);
  }
  s.icon.sort(function (a, b) { return b - a; });
  return s;
}

function mountMosaic(canvas, kind, opts) {
  opts = opts || {};
  var pal = M_PAL[opts.palette] || M_PAL.light, RGB = pal.hex.map(mRgb), ink = RGB[0];
  var ctx = canvas.getContext('2d', { alpha: false });
  var mq = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : null;
  var calm = !!opts.still || !!(mq && mq.matches);
  var s = null, T = 6, G = 1, raf = 0, seen = false, dead = false, order = null, at = 0, began = 0, acc = 0, last = 0, step = 0;
  var sweep = [], lit = new Map(), shown = false, timers = [], revealed = false;

  function css(c) { return 'rgb(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ')'; }
  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function paint(c, r, k) {
    if (c < 0 || c >= s.cols || r < s.top || r >= s.rows) return;
    var g = s.tex[r], rgb = RGB[k], x = c * T, y = r * T;
    if (g <= 0) { ctx.fillStyle = css(rgb); ctx.fillRect(x, y, T, T); return; }
    var j = 1 + (mHash(c, r, 7) - 0.5) * (s.calmField === k ? 0.07 : k >= 1 && k <= 4 ? 0.08 : 0.04) * g;
    ctx.fillStyle = css(k === 0 ? mix(rgb, RGB[2], 0.3 * g) : mix(rgb, ink, (k >= 5 ? (kind === 'emblem' ? 0.12 : 0.06) : 0.14) * g));
    ctx.fillRect(x, y, T, T);
    ctx.fillStyle = css(k === 0 ? rgb : [Math.min(255, rgb[0] * j), Math.min(255, rgb[1] * j), Math.min(255, rgb[2] * j)]);
    var dx = T >= 6 && g >= 1 && mHash(c, r, 9) < 0.25 ? G : 0;
    ctx.fillRect(x + dx, y, T - G - dx, T - G);
  }
  function base(i) { paint(i % s.cols, (i / s.cols) | 0, s.idx[i]); }
  function restore(list) { for (var n = 0; n < list.length; n++) { lit.delete(list[n]); base(list[n]); } list.length = 0; }
  function stamp(art, x, y, list, depth) {
    for (var j = 0; j < art.length; j++) for (var i = 0; i < art[j].length; i++) {
      var k = pal.glyph[art[j][i]], c = x + i, r = y + j;
      if (k === undefined || c < 0 || c >= s.cols || r < s.top || r >= s.rows || s.front[r * s.cols + c] > depth) continue;
      paint(c, r, k); list.push(r * s.cols + c);
    }
  }

  function sprites() {
    s.ships.forEach(function (f) {
      restore(f.prev);
      var hull = f.y + f.h - 1;
      stamp(f.rows, f.x, f.y, f.prev, hull);
      for (var t = 1; t <= f.wake; t++) {
        var c = f.dir > 0 ? f.x - t : f.x + f.w - 1 + t;
        if (c < 0 || c >= s.cols || s.front[hull * s.cols + c] > hull) continue;
        paint(c, hull, 6 - Math.floor((t - 1) * 3 / f.wake)); f.prev.push(hull * s.cols + c);
      }
    });
  }

  function lights() {
    s.lights.forEach(function (L) {
      var on = L.kind === 'beacon' ? step % 6 === 0
        : L.kind === 'lantern' ? (step + 3) % 16 < 2
        : L.kind === 'deck' ? true
        : step > 10 + L.n * 2 && mHash(L.i, step >> 3, 17) > 0.04;
      var k = on ? pal.lit : L.off;
      if (s.idx[L.i] !== k) { s.idx[L.i] = k; base(L.i); }
    });
    // A light runs along the bridge's cables now and then, the way the bridge is lit at night.
    sweep.forEach(function (i) { s.idx[i] = 0; base(i); });
    sweep = [];
    if (calm) return;
    var head = (step + 420) % 480;
    if (head < s.cable.length + 8) for (var n = Math.max(0, head - 6); n <= Math.min(head, s.cable.length - 1); n++) {
      s.idx[s.cable[n]] = pal.glow; base(s.cable[n]); sweep.push(s.cable[n]);
    }
  }

  function tick() {
    step++;
    for (var r = s.top; r < s.rows; r++) {
      if (!s.every[r] || step % s.every[r]) continue;
      s.off[r]--;
      for (var c = 0; c < s.cols; c++) {
        var i = r * s.cols + c;
        if (s.solid[i] >= 0) continue;
        var k = mQuant(s, c, r);
        if (k !== s.idx[i]) { s.idx[i] = k; if (!lit.has(i)) base(i); }
      }
    }
    s.ships.forEach(function (f) {
      if (step % f.every) return;
      f.x += f.dir;
      if (f.dir > 0 && f.x > s.cols + 30) f.x = -f.w - 10;
      if (f.dir < 0 && f.x + f.w < -30) f.x = s.cols + 10;
    });
    lit.forEach(function (ttl, i) { if (ttl <= 1) { lit.delete(i); base(i); } else lit.set(i, ttl - 1); });
    for (var n = Math.max(1, Math.round(s.glitter.length * 0.004)); n > 0 && s.glitter.length; n--) {
      var g = s.glitter[Math.floor(Math.random() * s.glitter.length)];
      if (lit.has(g)) continue;
      lit.set(g, 2 + Math.floor(Math.random() * 3));
      paint(g % s.cols, (g / s.cols) | 0, s.idx[g] >= 6 ? 5 : pal.glint);
    }
    if (s.lights.length || s.cable.length) lights();
    sprites();
  }

  function frame(now) {
    raf = 0;
    if (dead) return;
    if (order) {
      var t = now - began;
      while (at < order.length && order[at].t <= t) base(order[at++].i);
      if (at >= order.length) { order = null; revealed = true; sprites(); last = now; }
    } else {
      acc += Math.min(500, now - last); last = now;
      while (acc >= 250) { acc -= 250; tick(); }
    }
    if (seen && !document.hidden) raf = requestAnimationFrame(frame);
  }
  function run() { if (!raf && !calm && !dead && seen && !document.hidden && kind !== 'emblem') { last = performance.now(); raf = requestAnimationFrame(frame); } }

  // Panels lay their emblem row by row, from the bottom, the first time they are seen.
  function layEmblem() {
    if (shown || !s || !s.icon.length) return;
    shown = true;
    if (calm) return;
    var rowOf = {}, n = 0, icon = s.icon;
    icon.forEach(function (i) { s.idx[i] = pal.panel.ground; base(i); });
    icon.forEach(function (i) {
      var r = (i / s.cols) | 0;
      if (!(r in rowOf)) rowOf[r] = n++;
      timers.push(setTimeout(function () { if (!dead && s.icon === icon) { s.idx[i] = pal.panel.figure; base(i); } }, 120 + (opts.order || 0) * 250 + rowOf[r] * 70));
    });
  }

  function setup(first) {
    var dpr = window.devicePixelRatio || 1, w = canvas.clientWidth;
    T = Math.max(2, Math.floor((kind === 'emblem' ? 6 : Math.min(mClamp(window.innerWidth / 240, 3, 6), window.innerWidth >= 720 ? 6 : window.innerWidth / 134)) * dpr));
    G = Math.max(1, Math.round(T / 10));
    if (kind === 'strip') canvas.style.height = Math.round(34 * T / dpr) + 'px';
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    var cols = kind === 'emblem' ? 11 : Math.ceil(canvas.width / T), rows = kind === 'emblem' ? 11 : Math.ceil(canvas.height / T);
    if (kind === 'emblem') { canvas.style.width = canvas.style.height = 11 * T / dpr + 'px'; canvas.width = canvas.height = 11 * T; }
    if (!cols || !rows) return;
    s = kind === 'strip' ? mStrip(cols, rows, pal) : kind === 'emblem' ? mEmblem(cols, rows, opts.glyph, pal.panel) : mHero(cols, rows, pal);
    lit.clear(); sweep = []; step = 0;
    for (var i = 0; i < s.idx.length; i++) s.idx[i] = mQuant(s, i % cols, (i / cols) | 0);
    ctx.fillStyle = css(RGB[kind === 'hero' ? 1 : pal.paper == null ? 7 : pal.paper]);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (!first || calm || !s.focus) {
      revealed = true;
      for (i = s.top * cols; i < s.idx.length; i++) base(i);
      if (calm) { step = 432; lights(); }
      sprites();
      if (kind === 'emblem' && !shown && !calm) s.icon.forEach(function (i) { s.idx[i] = pal.panel.ground; base(i); });
      if (seen) { layEmblem(); run(); }
      return;
    }
    // Lay the tiles outward from the moon, once.
    var far = Math.hypot(Math.max(s.focus[0], cols - s.focus[0]) / 1.6, Math.max(s.focus[1], rows - s.focus[1]));
    order = [];
    for (i = s.top * cols; i < s.idx.length; i++) {
      var c = i % cols, r = (i / cols) | 0;
      order.push({ i: i, t: Math.hypot((c - s.focus[0]) / 1.6, r - s.focus[1]) / far * 1000 + mHash(c, r, 9) * 260 });
    }
    order.sort(function (a, b) { return a.t - b.t; });
    at = 0; began = performance.now();
    raf = requestAnimationFrame(frame);
    // If frames are throttled (background tab, embedded preview), finish the picture anyway.
    timers.push(setTimeout(function () { if (order && !dead) { while (at < order.length) base(order[at++].i); order = null; revealed = true; sprites(); run(); } }, 2200));
  }

  setup(true);
  var size = canvas.clientWidth + 'x' + canvas.clientHeight + 'x' + window.innerWidth, queued = 0;
  function resized() {
    var next = canvas.clientWidth + 'x' + canvas.clientHeight + 'x' + window.innerWidth;
    if (next === size) return;
    size = next;
    cancelAnimationFrame(queued);
    queued = requestAnimationFrame(function () { cancelAnimationFrame(raf); raf = 0; order = null; setup(!revealed); });
  }
  var ro = new ResizeObserver(resized);
  ro.observe(canvas);
  var io = new IntersectionObserver(function (e) { seen = e[0].isIntersecting; if (seen) layEmblem(); run(); }, { threshold: kind === 'emblem' ? 0.3 : 0 });
  io.observe(canvas);
  document.addEventListener('visibilitychange', run);
  function motionPref() { calm = !!opts.still || mq.matches; cancelAnimationFrame(raf); raf = 0; order = null; setup(false); }
  if (mq && mq.addEventListener) mq.addEventListener('change', motionPref);
  function stopper() {
    if (mq && mq.removeEventListener) mq.removeEventListener('change', motionPref);
    dead = true; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
    timers.forEach(clearTimeout); document.removeEventListener('visibilitychange', run);
  }
  stopper.hold = function (on) { opts.still = !!on; calm = opts.still || !!(mq && mq.matches); cancelAnimationFrame(raf); raf = 0; order = null; revealed = true; setup(false); };
  return stopper;
}

export { mountMosaic };
