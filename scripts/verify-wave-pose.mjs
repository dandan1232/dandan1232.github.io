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

// --- relaxed standing pose: keep in sync with girl.ts RELAXED_* ---
// This is what the wave now blends out of. Before it existed the arm sat where
// the seated source clip left it — measured from avatar.glb at t=0, upper
// [-0.734, -0.666, 0.135] (-42° elevation), forearm [0.016, 0.193, -0.981],
// elbow 106° bent, i.e. the hand parked in front of the chest.
const RELAXED = { abductDeg: 16, carryDeg: 12, forwardDeg: 9 };
const qAxisY = (deg) => [0, Math.sin((deg * D) / 2), 0, Math.cos((deg * D) / 2)];
// sign +1 = left arm (rests along -X), -1 = right. carryDeg is positive outward.
const relaxedUpperQ = (sign) => qMul(qAxisZ(sign * (90 - RELAXED.abductDeg)), qAxisY(-sign * RELAXED.forwardDeg));
const relaxedForeQ = (sign) => qMul(relaxedUpperQ(sign), qAxisZ(-sign * RELAXED.carryDeg));

const IDLE_UPPER_Q = relaxedUpperQ(1);
const IDLE_FORE_Q = relaxedForeQ(1);

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

/**
 * Silhouette of the one-piece dress, measured from girl.vrm's Onepice material
 * (rest pose, model space, front = -Z). `a` is the lateral half-width, `b` the
 * forward reach; both are running maxima from the waist down, so the check is a
 * conservative envelope rather than the pleated surface itself. The dress flares
 * hard: 0.09 at the waist, 0.19 at hand height, 0.27 near the hem — a straight
 * hanging arm lands well inside it, which is why the hands went missing.
 */
const SKIRT = [
  [1.0, 0.093, 0.11], [0.96, 0.093, 0.11], [0.92, 0.093, 0.11], [0.88, 0.104, 0.122],
  [0.84, 0.131, 0.127], [0.8, 0.152, 0.14], [0.76, 0.173, 0.14], [0.72, 0.191, 0.145],
  [0.68, 0.21, 0.155], [0.64, 0.225, 0.164], [0.6, 0.241, 0.173], [0.56, 0.269, 0.181],
];
const FINGER_REACH = 0.102; // wrist -> Middle3 in the rest pose

/** Positive = the point sits outside the dress and stays visible from the front. */
const skirtMargin = ([x, y, z]) => {
  if (y > SKIRT[0][0] || y < SKIRT[SKIRT.length - 1][0]) return Infinity;
  let i = 0;
  while (i < SKIRT.length - 2 && SKIRT[i + 1][0] > y) i++;
  const [y0, a0, b0] = SKIRT[i], [y1, a1, b1] = SKIRT[i + 1];
  const t = (y0 - y) / (y0 - y1);
  const a = a0 + (a1 - a0) * t, b = b0 + (b1 - b0) * t;
  // elliptical cross-section: outside when the normalised radius exceeds 1
  const r = Math.hypot(x / a, z / b);
  return (r - 1) * a; // approximate clearance in metres
};

const relaxedArm = (sign) => {
  const rest = [sign > 0 ? -1 : 1, 0, 0];
  const upperQ = relaxedUpperQ(sign);
  const foreQ = relaxedForeQ(sign);
  const shoulder = [-sign * (0.019 + 0.0736), UPPER_CHEST_Y + 0.0744 - 0.0127, 0.0234 - 0.0046];
  const uDir = qRot(upperQ, rest), fDir = qRot(foreQ, rest);
  const elbow = addV(shoulder, uDir.map((v) => v * 0.1861));
  const hand = addV(elbow, fDir.map((v) => v * 0.1792));
  const dot = uDir[0] * fDir[0] + uDir[1] * fDir[1] + uDir[2] * fDir[2];
  const tip = addV(hand, fDir.map((v) => v * FINGER_REACH));
  // worst clearance anywhere from the elbow down through the fingertips
  let worst = Infinity, worstAt = null;
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const p = [0, 1, 2].map((k) => elbow[k] + (tip[k] - elbow[k]) * t);
    const m = skirtMargin(p);
    if (m < worst) { worst = m; worstAt = p; }
  }
  return { uDir, fDir, hand, tip, worst, worstAt, bend: Math.acos(Math.min(1, dot)) / D };
};

const report = (label, sign, opts = RELAXED) => {
  const saved = { ...RELAXED };
  Object.assign(RELAXED, opts);
  const r = relaxedArm(sign);
  Object.assign(RELAXED, saved);
  console.log(
    `${label.padEnd(22)} elbow bend=${r.bend.toFixed(1).padStart(4)}° | ` +
      `wrist [${r.hand.map(f).join(", ")}] tip y=${f(r.tip[1])} | ` +
      `skirt clearance ${(r.worst >= 0 ? "+" : "") + r.worst.toFixed(3)}m ` +
      `${r.worst > 0.02 ? "visible ✓" : r.worst > 0 ? "grazing ~" : "SWALLOWED ✗"}`,
  );
  return r.worst;
};

console.log("=== relaxed arm vs. the dress ===");
report("straight hang", -1, { abductDeg: 10, carryDeg: -8, forwardDeg: 9 }); // forearm tucked in
report("shoulder only", -1, { ...RELAXED, abductDeg: 24, carryDeg: -8 }); // clears, but penguin
console.log();
console.log("=== chosen pose ===");
for (const [label, sign] of [["right", -1], ["left", 1]]) report(label, sign);
console.log();

console.log(`=== left-arm wave, abduct ${TUNE.abductDeg}° bend ${TUNE.bendDeg}° ` +
  `(forearm ${90 - TUNE.abductDeg - TUNE.bendDeg === 0 ? "vertical" : "OFF vertical"}), ` +
  `skull top y=${f(HEAD_TOP_Y)} ===`);
row("overlay weight 1  (mix 0.50)", 0.5);
row("overlay weight 9  (mix 0.90)", 0.9);
row("overlay weight 49 (mix 0.98)", 0.98);
row("intended pose     (mix 1.00)", 1);
