/**
 * Offline verification for the procedural wave pose (see girl.ts WAVE_*).
 *
 * Simulates the LEFT arm chain — all rest rotations are identity in this VRM,
 * so local quaternions compose directly — and reports where the hand travels.
 *
 * It models the OVERLAY BLEND too, which is the part that used to be missing:
 * `contact-wave` rides on top of `contact-idle` (weight 1), and three.js
 * normalises overlapping non-additive actions, so an overlay at weight w only
 * reaches w/(1+w) of its own pose. Tuning against the unblended pose is how the
 * abduction ended up cranked to 98° — it was compensating for a halved blend.
 *
 * Run: node scripts/verify-wave-pose.mjs
 */
const D = Math.PI / 180;

// --- minimal quat helpers (x,y,z,w) ---
const qAxisZ = (deg) => [0, 0, Math.sin((deg * D) / 2), Math.cos((deg * D) / 2)];
const qMul = (a, b) => [
  a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
  a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
  a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
  a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2],
];
const qRot = (q, [vx, vy, vz]) => {
  const [qx, qy, qz, qw] = q;
  return [
    (1 - 2 * (qy * qy + qz * qz)) * vx + 2 * (qx * qy - qz * qw) * vy + 2 * (qx * qz + qy * qw) * vz,
    2 * (qx * qy + qz * qw) * vx + (1 - 2 * (qx * qx + qz * qz)) * vy + 2 * (qy * qz - qx * qw) * vz,
    2 * (qx * qz - qy * qw) * vx + 2 * (qy * qz + qx * qw) * vy + (1 - 2 * (qx * qx + qy * qy)) * vz,
  ];
};
const qSlerp = (a, b, t) => {
  let dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
  let e = b;
  if (dot < 0) { e = b.map((v) => -v); dot = -dot; }
  if (dot > 0.9995) return a.map((v, i) => v + (e[i] - v) * t);
  const th0 = Math.acos(dot), th = th0 * t;
  const s0 = Math.cos(th) - (dot * Math.sin(th)) / Math.sin(th0);
  const s1 = Math.sin(th) / Math.sin(th0);
  return a.map((v, i) => v * s0 + e[i] * s1);
};
/** Shortest rotation taking `from` to `to` (both unit). */
const qBetween = (from, to) => {
  const c = [
    from[1] * to[2] - from[2] * to[1],
    from[2] * to[0] - from[0] * to[2],
    from[0] * to[1] - from[1] * to[0],
  ];
  const w = 1 + from[0] * to[0] + from[1] * to[1] + from[2] * to[2];
  const l = Math.hypot(c[0], c[1], c[2], w);
  return [c[0] / l, c[1] / l, c[2] / l, w / l];
};

// --- rest offsets measured from girl.vrm (meters, model space; front = -Z) ---
// Left arm extends along -X. Everything above UpperChest is identity-rest too.
const UPPER_CHEST_Y = 0.777 + 0.0451 + 0.1042 + 0.1058; // ≈ 1.032
const L = {
  shoulder: [-0.019, 0.0744, 0.0234],
  upper: [-0.0736, -0.0127, -0.0046],
  lower: [-0.1861, -0.0087, -0.0016], // upper-arm length
  hand: [-0.1792, 0.0, -0.0148], // forearm length
};
const HEAD_TOP_Y = UPPER_CHEST_Y + 0.0977 + 0.0616 + 0.1; // skull top ≈ 1.29
const REST_DIR = [-1, 0, 0];

// --- what contact-idle actually does with the arm, measured from avatar.glb ---
// (world-space bone directions at t=0; the source rig is what gets retargeted)
const IDLE_UPPER_DIR = [-0.734, -0.666, 0.135]; // hangs down & out, -42° elevation
const IDLE_FORE_DIR = [0.016, 0.193, -0.981]; // forearm points forward, elbow ~106° bent
const IDLE_UPPER_Q = qBetween(REST_DIR, IDLE_UPPER_DIR);
const IDLE_FORE_Q = qBetween(REST_DIR, IDLE_FORE_DIR);

// --- pose constants: keep in sync with girl.ts WAVE_* ---
const TUNE = {
  abductDeg: 38,
  bendDeg: 52,
  swingFoldDeg: 16,
  swingUpperDeg: 4,
  frequencyHz: 1.6,
  lagDeg: 30,
};

const addV = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const SHOULDER_W = addV(addV([0, UPPER_CHEST_Y, 0], L.shoulder), L.upper);

/** Absolute (parent-space) arm rotations for one instant of the wave. */
const wavePose = (t) => {
  const phase = t * TUNE.frequencyHz * Math.PI * 2;
  const arm = -TUNE.abductDeg + TUNE.swingUpperDeg * Math.sin(phase);
  const fold = -TUNE.bendDeg + TUNE.swingFoldDeg * Math.sin(phase - TUNE.lagDeg * D);
  return { upperQ: qAxisZ(arm), foreQ: qMul(qAxisZ(arm), qAxisZ(fold)) };
};

/** Hand position for a pair of absolute upper/fore rotations. */
const handAt = (upperQ, foreQ) =>
  addV(addV(SHOULDER_W, qRot(upperQ, L.lower)), qRot(foreQ, L.hand));

/**
 * `mix` = fraction of the wave pose the mixer actually renders.
 *   overlay weight w, idle weight 1  ->  mix = w / (1 + w)
 */
const span = (mix, steps = 48) => {
  const period = 1 / TUNE.frequencyHz;
  const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
  for (let i = 0; i < steps; i++) {
    const { upperQ, foreQ } = wavePose((i / steps) * period);
    const h = handAt(qSlerp(IDLE_UPPER_Q, upperQ, mix), qSlerp(IDLE_FORE_Q, foreQ, mix));
    for (let a = 0; a < 3; a++) { lo[a] = Math.min(lo[a], h[a]); hi[a] = Math.max(hi[a], h[a]); }
  }
  const mid = wavePose(0.25 / TUNE.frequencyHz); // swing centre
  const c = handAt(qSlerp(IDLE_UPPER_Q, mid.upperQ, mix), qSlerp(IDLE_FORE_Q, mid.foreQ, mix));
  return {
    dx: hi[0] - lo[0], dy: hi[1] - lo[1], dz: hi[2] - lo[2],
    handX: c[0], handY: c[1],
  };
};

const f = (n) => n.toFixed(3);
const row = (label, mix) => {
  const s = span(mix);
  const lateral = s.dx > Math.max(s.dy, s.dz) * 1.4;
  const clearsHead = s.handY > HEAD_TOP_Y - 0.02;
  const ownSide = s.handX < -0.05; // stays on her left, does not cross the midline
  console.log(
    `${label.padEnd(34)} travel dx=${f(s.dx)} dy=${f(s.dy)} dz=${f(s.dz)} | ` +
      `hand x=${f(s.handX)} y=${f(s.handY)} | ` +
      `${lateral ? "lateral ✓" : "lateral ✗"} ${clearsHead ? "clears head ✓" : "clears head ✗"} ` +
      `${ownSide ? "own side ✓" : "own side ✗ (crosses midline)"}`,
  );
};

console.log(`=== left-arm wave, abduct ${TUNE.abductDeg}° bend ${TUNE.bendDeg}° ` +
  `(forearm ${90 - TUNE.abductDeg - TUNE.bendDeg === 0 ? "vertical" : "OFF vertical"}), ` +
  `skull top y=${f(HEAD_TOP_Y)} ===`);
row("overlay weight 1  (mix 0.50)", 0.5);
row("overlay weight 9  (mix 0.90)", 0.9);
row("overlay weight 49 (mix 0.98)", 0.98);
row("intended pose     (mix 1.00)", 1);
