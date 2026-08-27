/**
 * Slim girl.vrm without touching non-image glTF structures.
 *
 * Strategy: parse the source GLB read-only, derive remap tables, encode WebP,
 * rebuild a compacted BIN chunk, then assemble a brand-new document from
 * cloned pieces. Nothing in the source tree is mutated, so there is no risk
 * of index remapping stepping on itself.
 *
 * Transformations applied:
 *  1. Delete material.normalTexture bindings — all materials are
 *     KHR_materials_unlit, three.js renders them with MeshBasicMaterial and
 *     never samples normal maps.
 *  2. Prune textures/images/samplers left unreferenced after that (embedded
 *     VRM thumbnail, rim matcaps, face outline, dropped normal maps).
 *  3. Re-encode surviving PNGs larger than BYTES_REENCODE to WebP declared
 *     via EXT_texture_webp (GLTFLoader reads it natively).
 *  4. Compact the BIN chunk to surviving bufferViews and remap every numeric
 *     bufferView reference (accessors, sparse accessors included).
 *
 * The VRM root extension (blendShapeMaster, humanoid map, …), skins, meshes
 * and animation slots ride along untouched.
 *
 * Usage: node scripts/slim-vrm.mjs <in.vrm> <out.vrm>
 */
import fs from "node:fs";
import sharp from "sharp";

const BYTES_REENCODE = 100 * 1024;
const WEBP_QUALITY = 88;
const WEBP_ALPHA_QUALITY = 92;

const [, , inPath, outPath] = process.argv;
if (!inPath || !outPath) {
  console.error("usage: node scripts/slim-vrm.mjs <in.vrm> <out.vrm>");
  process.exit(1);
}

const align4 = (n) => Math.ceil(n / 4) * 4;
/** Map of oldIndex -> newIndex built over the ascending sort of `used`. */
const rankMap = (usedIterable) =>
  new Map([...usedIterable].sort((a, b) => a - b).map((oldIdx, nextIdx) => [oldIdx, nextIdx]));
const mb = (n) => `${(n / 1048576).toFixed(2)}MB`;

// ---------- parse ----------
const buf = fs.readFileSync(inPath);
if (buf.toString("ascii", 0, 4) !== "glTF") throw new Error("not a GLB");
const jsonLen = buf.readUInt32LE(12);
const src = JSON.parse(buf.subarray(20, 20 + jsonLen).toString("utf8"));
const binStart = 20 + jsonLen + 8;
const readRegion = (viewIdx) => {
  const view = src.bufferViews[viewIdx];
  const offset = view.byteOffset ?? 0;
  return buf.subarray(binStart + offset, binStart + offset + view.byteLength);
};

console.log(`input file : ${mb(buf.length)}`);
const before = {
  groups: src.extensions?.VRM?.blendShapeMaster?.blendShapeGroups?.length ?? 0,
  accessors: src.accessors?.length ?? 0,
  meshes: src.meshes?.length ?? 0,
  skins: src.skins?.length ?? 0,
};

// ---------- step 1: strip normalTexture bindings ----------
const materials = structuredClone(src.materials ?? []);
let strippedNormals = 0;
for (const mat of materials) {
  if ("normalTexture" in mat) {
    delete mat.normalTexture;
    strippedNormals++;
  }
}
console.log(`step 1     : stripped ${strippedNormals} normalTexture bindings`);

// ---------- step 2: find surviving slots ----------
const usedTextures = new Set();
for (const mat of materials) {
  const visit = (node) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach(visit);
    for (const [key, value] of Object.entries(node)) {
      if (/Texture$/i.test(key) && value && typeof value.index === "number") {
        usedTextures.add(value.index);
      }
      visit(value);
    }
  };
  visit(mat);
}

const usedSamplers = new Set();
const usedImagesOld = new Set();
for (const texIdx of usedTextures) {
  const tex = src.textures[texIdx];
  if (tex?.sampler != null) usedSamplers.add(tex.sampler);
  if (tex?.source != null) usedImagesOld.add(tex.source);
}

const textureRanks = rankMap(usedTextures);
const samplerRanks = rankMap(usedSamplers);
const imageRanks = rankMap(usedImagesOld);
console.log(
  `step 2     : textures ${textureRanks.size}/${src.textures.length}` +
    `, images ${imageRanks.size}/${src.images.length}, samplers ${samplerRanks.size}/${src.samplers?.length ?? 0}`,
);

// ---------- step 3: re-encode large PNGs to WebP ----------
const encodeTask = async (imgOld) => {
  const img = src.images[imgOld];
  const hasView = typeof img.bufferView === "number";
  const original = hasView ? readRegion(img.bufferView) : null;
  const result = { imgOld, viewOld: hasView ? img.bufferView : null, bytesBefore: original?.length ?? 0 };

  let data = original;
  const entry = { name: img.name, mimeType: img.mimeType };
  if (original && img.mimeType === "image/png" && original.length > BYTES_REENCODE) {
    try {
      data = await sharp(original, { failOn: "none" })
        .webp({ quality: WEBP_QUALITY, alphaQuality: WEBP_ALPHA_QUALITY, effort: 5 })
        .toBuffer();
      entry.mimeType = "image/webp";
    } catch (err) {
      console.warn(`  keep PNG for "${img.name ?? imgOld}": ${err.message}`);
    }
  }
  return { ...result, data, entry };
};

const imageResults = await Promise.all([...usedImagesOld].map(encodeTask));
const encodedResults = imageResults.filter((r) => r.entry.mimeType === "image/webp");
const savedBytes = encodedResults.reduce((sum, r) => sum + (r.bytesBefore - r.data.length), 0);
console.log(
  `step 3     : re-encoded ${encodedResults.length}/${imageResults.length} images -> saved ${mb(savedBytes)}`,
);
for (const r of [...encodedResults].sort((a, b) => b.bytesBefore - a.bytesBefore)) {
  console.log(`  ${String(r.entry.name ?? "?").padEnd(28)} ${mb(r.bytesBefore)} -> ${mb(r.data.length)}`);
}
const isWebpByImgOld = new Map();
for (const [imgOld] of imageRanks) {
  const result = imageResults.find((r) => r.imgOld === imgOld);
  isWebpByImgOld.set(imgOld, result.entry.mimeType === "image/webp");
}

/** viewOld -> replacement bytes for re-encoded images (empty when unchanged). */
const encodedOverride = new Map();
for (const r of encodedResults) {
  if (r.viewOld != null) encodedOverride.set(r.viewOld, r.data);
}
/** Bytes that a surviving view occupies in the OUTPUT file. */
const outputBytesOf = (viewOld) => encodedOverride.get(viewOld) ?? readRegion(viewOld);

// ---------- step 4: compact BIN chunk ----------
const referencedViews = new Set();
{
  // Everything that survives non-image-wise references its bytes through an
  // accessor (meshes, skins, morph targets, sparse values), so walking the
  // accessor table covers all geometry/animation bufferViews.
  const visit = (node) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach(visit);
    for (const [key, value] of Object.entries(node)) {
      if (key === "bufferView" && typeof value === "number") referencedViews.add(value);
      visit(value);
    }
  };
  visit(src.accessors ?? []);
}
for (const r of imageResults) {
  if (r.viewOld != null) referencedViews.add(r.viewOld);
}

const survivingViews = [...referencedViews].sort((a, b) => a - b);
const viewRanks = new Map(survivingViews.map((oldIdx, rank) => [oldIdx, rank]));

const placement = new Map(); // viewOld -> new byteOffset
{
  let cursor = 0;
  for (const viewOld of survivingViews) {
    cursor = align4(cursor);
    placement.set(viewOld, cursor);
    cursor += outputBytesOf(viewOld).length;
  }
  var binTotal = align4(cursor);
}
const binOut = Buffer.alloc(binTotal);
for (const viewOld of survivingViews) {
  Buffer.from(outputBytesOf(viewOld)).copy(binOut, placement.get(viewOld));
}
console.log(`step 4     : bufferViews ${survivingViews.length}/${src.bufferViews.length}, BIN ${mb(binOut.length)}`);

// ---------- assemble output document ----------
const out = { ...src };

// Materials: apply texture-rank remap on the already-stripped clones.
for (const mat of materials) {
  const visit = (node) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach(visit);
    for (const [key, value] of Object.entries(node)) {
      if (/Texture$/i.test(key) && value && typeof value.index === "number") {
        value.index = textureRanks.get(value.index);
      }
      visit(value);
    }
  };
  visit(mat);
}
out.materials = materials;

// Textures / images / samplers rebuilt compact.
out.textures = [...textureRanks.keys()].map((texOld) => {
  const tex = src.textures[texOld];
  const entry = {};
  if (typeof tex.sampler === "number") entry.sampler = samplerRanks.get(tex.sampler);
  const imageNext = imageRanks.get(tex.source);
  entry.source = imageNext;
  if (isWebpByImgOld.get(tex.source)) {
    entry.extensions = { EXT_texture_webp: { source: imageNext } };
  }
  return entry;
});

out.images = imageResults
  .sort((a, b) => imageRanks.get(a.imgOld) - imageRanks.get(b.imgOld))
  .map((r) => ({
    ...r.entry,
    bufferView: r.viewOld == null ? undefined : viewRanks.get(r.viewOld),
  }));

out.samplers = [...samplerRanks.keys()].map((oldIdx) => src.samplers[oldIdx]);

// BufferViews compacted; remaining old->rank references live in accessors.
out.bufferViews = survivingViews.map((viewOld) => {
  const v = src.bufferViews[viewOld];
  return {
    ...(v.byteStride != null ? { byteStride: v.byteStride } : {}),
    buffer: 0,
    byteOffset: placement.get(viewOld),
    byteLength: outputBytesOf(viewOld).length,
  };
});

// Accessor table is the last holder of old bufferView indices.
out.accessors = structuredClone(src.accessors ?? []).map((acc) => {
  const visit = (node) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach(visit);
    for (const [key, value] of Object.entries(node)) {
      if (key === "bufferView" && typeof value === "number") {
        const mapped = viewRanks.get(value);
        if (mapped === undefined) throw new Error(`stray bufferView ref ${value}`);
        node[key] = mapped;
      }
      visit(value);
    }
  };
  visit(acc);
  return acc;
});

if (encodedResults.length > 0 && !out.extensionsUsed?.includes("EXT_texture_webp")) {
  out.extensionsUsed = [...(out.extensionsUsed ?? []), "EXT_texture_webp"];
}
out.buffer = { ...src.buffer, byteLength: binOut.length };

// ---------- integrity checks ----------
const afterGroups = out.extensions?.VRM?.blendShapeMaster?.blendShapeGroups?.length ?? 0;
const checksOk =
  afterGroups === before.groups &&
  out.accessors.length === before.accessors &&
  out.meshes.length === before.meshes &&
  out.skins.length === before.skins &&
  out.images.every((img) => typeof img.bufferView === "number");

if (!checksOk) {
  console.error("integrity check FAILED — aborting without writing", {
    before,
    afterGroups,
    accessors: out.accessors.length,
  });
  process.exitCode = 1;
} else {
  // ---------- serialize GLB ----------
  const jsonBytes = Buffer.from(JSON.stringify(out), "utf8");
  const jsonPadLen = align4(jsonBytes.length) - jsonBytes.length;

  const headerSize = 12;
  const jsonChunkSize = 8 + align4(jsonBytes.length);
  const binChunkSize = 8 + binOut.length;
  const glb = Buffer.alloc(headerSize + jsonChunkSize + binChunkSize);

  glb.write("glTF", 0, "ascii");
  glb.writeUInt32LE(2, 4);
  glb.writeUInt32LE(glb.length, 8);

  glb.writeUInt32LE(jsonBytes.length + jsonPadLen, 12);
  glb.write("JSON", 16, "ascii");
  jsonBytes.copy(glb, 20);
  glb.fill(0x20, 20 + jsonBytes.length, 20 + jsonBytes.length + jsonPadLen); // spaces

  const binHeaderAt = 20 + jsonBytes.length + jsonPadLen;
  glb.writeUInt32LE(binOut.length, binHeaderAt);
  glb.write("BIN\0", binHeaderAt + 4, "ascii");
  binOut.copy(glb, binHeaderAt + 8);

  fs.writeFileSync(outPath, glb);
  console.log(`output file: ${mb(glb.length)}  (${(((buf.length - glb.length) / buf.length) * 100).toFixed(1)}% smaller)`);
  console.log(`integrity  : blendShapeGroups=${afterGroups}, accessors=${out.accessors.length}, OK`);
}
