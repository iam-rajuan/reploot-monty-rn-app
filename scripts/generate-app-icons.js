const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

// --- CRC32 & PNG Encoding ---
function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xEDB88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function makePng(width, height, rgbaBuffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, "ascii");
    const crcBuf = Buffer.alloc(4);
    const toCrc = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(toCrc), 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const scanlines = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + width * 4);
    scanlines[rowOffset] = 0; // Filter: None
    rgbaBuffer.copy(
      scanlines,
      rowOffset + 1,
      y * width * 4,
      (y + 1) * width * 4
    );
  }

  const idatData = zlib.deflateSync(scanlines, { level: 9 });
  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", idatData),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// --- Geometry Helpers ---
function pointInPoly(px, py, vertices) {
  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i][0],
      yi = vertices[i][1];
    const xj = vertices[j][0],
      yj = vertices[j][1];
    const intersect =
      yi > py !== yj > py &&
      px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// Check if point (px, py) is inside the REPLOOT emblem (normalized to -1..1 space)
function isInsideEmblem(nx, ny) {
  // Emblem bounding box in normalized space:
  // ny from -0.55 to 0.55 (height 1.1)
  // nx from -0.44 to 0.44 (width 0.88)
  const stemL = -0.38, stemR = -0.16;
  const topY = -0.52, midY = 0.02, botY = 0.52;

  // 1. Vertical Stem (with cyber chamfers at top-left and bottom-left)
  if (nx >= stemL && nx <= stemR && ny >= topY && ny <= botY) {
    // Chamfer top-left
    if (nx <= stemL + 0.07 && ny <= topY + (0.07 - (nx - stemL))) return false;
    // Chamfer bottom-left
    if (nx <= stemL + 0.07 && ny >= botY - (0.07 - (nx - stemL))) return false;
    return true;
  }

  // 2. Upper Loop
  // Outer loop: horizontal bar + right rounded arc
  const loopCenterY = (topY + midY) / 2;
  const loopRadius = (midY - topY) / 2; // ~0.27
  const loopRight = 0.36;

  // Loop upper horizontal bar
  if (nx >= stemR && nx <= loopRight - loopRadius && ny >= topY && ny <= topY + 0.16) {
    return true;
  }

  // Loop lower horizontal junction bar
  if (nx >= stemR && nx <= loopRight - loopRadius && ny >= midY - 0.16 && ny <= midY) {
    return true;
  }

  // Loop right semicircle/pill
  const arcCenterX = loopRight - loopRadius;
  const distArc = Math.hypot(nx - arcCenterX, ny - loopCenterY);
  if (nx >= arcCenterX && distArc <= loopRadius && ny >= topY && ny <= midY) {
    // Check inner counter cutout
    const innerRadius = loopRadius - 0.16;
    if (distArc <= innerRadius) return false;
    return true;
  }

  // Loop inner counter cutout in horizontal section
  if (nx >= stemR && nx <= arcCenterX && ny > topY + 0.16 && ny < midY - 0.16) {
    return false;
  }

  // 3. Cyber Diagonal Kick (Right Leg)
  // Dynamic 45-degree angled pillar with floating Reploot gap from stem
  const legPoly = [
    [-0.04, midY - 0.02],
    [0.12, midY - 0.02],
    [0.40, botY],
    [0.22, botY],
  ];
  if (pointInPoly(nx, ny, legPoly)) {
    // Cyber slice: 45 degree gap line between stem and leg
    // ny - nx <= 0.22 line
    const sliceDist = ny - nx;
    if (sliceDist >= 0.16 && sliceDist <= 0.21 && nx <= 0.06) {
      return false; // Floating tech gap
    }
    return true;
  }

  return false;
}

// Check if point (nx, ny) is inside the outer HUD Telemetry Ring (normalized -1..1)
function isInsideHudRing(nx, ny) {
  const dist = Math.hypot(nx, ny);
  const ringR = 0.76;
  const ringThick = 0.038;

  if (Math.abs(dist - ringR) <= ringThick / 2) {
    // 4 angular gaps at 45, 135, 225, 315 deg (+/- 7 degrees)
    const angleDeg = ((Math.atan2(ny, nx) * 180) / Math.PI + 360) % 360;
    const gap1 = Math.abs(angleDeg - 45);
    const gap2 = Math.abs(angleDeg - 135);
    const gap3 = Math.abs(angleDeg - 225);
    const gap4 = Math.abs(angleDeg - 315);
    if (gap1 < 6.5 || gap2 < 6.5 || gap3 < 6.5 || gap4 < 6.5) return false;
    return true;
  }

  // 4 Cardinal Micro Nodes (tiny dots at 0, 90, 180, 270 deg)
  const nodeDist = Math.hypot(nx, ny);
  if (Math.abs(nodeDist - ringR) <= ringThick * 1.6) {
    const angleDeg = ((Math.atan2(ny, nx) * 180) / Math.PI + 360) % 360;
    const isNorth = Math.abs(angleDeg - 270) < 2.5;
    const isSouth = Math.abs(angleDeg - 90) < 2.5;
    const isEast = angleDeg < 2.5 || angleDeg > 357.5;
    const isWest = Math.abs(angleDeg - 180) < 2.5;
    if (isNorth || isSouth || isEast || isWest) return true;
  }

  return false;
}

// Render an icon of specified size
// mode: "full" (solid background for icon.png, webp)
//       "foreground" (transparent background for android adaptive foreground)
//       "background" (solid background only)
//       "monochrome" (pure white on transparent)
function renderIcon(size, mode = "full") {
  const buf = Buffer.alloc(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;
  // Radius scale: safe zone is 66% (radius = size * 0.33)
  // We place outer ring at size * 0.28, emblem at size * 0.22, 100% inside safe zone!
  const scale = size * 0.36;

  // Supersampling: 3x3 subpixels per pixel for ultra-smooth anti-aliasing
  const subSamples = 3;
  const subStep = 1 / subSamples;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let emblemHits = 0;
      let ringHits = 0;

      for (let sy = 0; sy < subSamples; sy++) {
        const py = y + (sy + 0.5) * subStep;
        for (let sx = 0; sx < subSamples; sx++) {
          const px = x + (sx + 0.5) * subStep;

          // Normalized coords (-1 to 1 based on scale)
          const nx = (px - cx) / scale;
          const ny = (py - cy) / scale;

          if (mode !== "background") {
            if (isInsideEmblem(nx, ny)) emblemHits++;
            else if (isInsideHudRing(nx, ny)) ringHits++;
          }
        }
      }

      const totalSamples = subSamples * subSamples;
      const emblemAlpha = emblemHits / totalSamples;
      const ringAlpha = ringHits / totalSamples;

      const idx = (y * size + x) * 4;

      if (mode === "background") {
        // Deep Obsidian #070A11 with subtle radial glow
        const distCenter = Math.hypot(x - cx, y - cy);
        const glow = Math.max(0, 1 - distCenter / (size * 0.55));
        const r = Math.min(255, Math.round(7 + 10 * glow));
        const g = Math.min(255, Math.round(10 + 26 * glow));
        const b = Math.min(255, Math.round(17 + 45 * glow));
        buf[idx] = r;
        buf[idx + 1] = g;
        buf[idx + 2] = b;
        buf[idx + 3] = 255;
      } else if (mode === "monochrome") {
        // Solid white with coverage alpha
        const cov = Math.max(emblemAlpha, ringAlpha);
        if (cov > 0) {
          buf[idx] = 255;
          buf[idx + 1] = 255;
          buf[idx + 2] = 255;
          buf[idx + 3] = Math.round(cov * 255);
        } else {
          buf[idx] = 0;
          buf[idx + 1] = 0;
          buf[idx + 2] = 0;
          buf[idx + 3] = 0;
        }
      } else if (mode === "foreground") {
        // Transparent background, glowing gradient on emblem & ring
        if (emblemAlpha > 0 || ringAlpha > 0) {
          // Normalized Y for gradient (0 at top, 1 at bottom of emblem)
          const t = Math.max(0, Math.min(1, (y - (cy - scale * 0.55)) / (scale * 1.1)));
          // Color gradient:
          // t=0: #00F2FE (0, 242, 254)
          // t=0.5: #38BDF8 (56, 189, 248)
          // t=1: #2DD4BF (45, 212, 191)
          let er, eg, eb;
          if (t < 0.5) {
            const k = t / 0.5;
            er = Math.round(0 * (1 - k) + 56 * k);
            eg = Math.round(242 * (1 - k) + 189 * k);
            eb = Math.round(254 * (1 - k) + 248 * k);
          } else {
            const k = (t - 0.5) / 0.5;
            er = Math.round(56 * (1 - k) + 45 * k);
            eg = Math.round(189 * (1 - k) + 212 * k);
            eb = Math.round(248 * (1 - k) + 191 * k);
          }

          if (emblemAlpha > 0) {
            buf[idx] = er;
            buf[idx + 1] = eg;
            buf[idx + 2] = eb;
            buf[idx + 3] = Math.round(emblemAlpha * 255);
          } else if (ringAlpha > 0) {
            // Ring with slightly softer intensity
            buf[idx] = Math.round(er * 0.95);
            buf[idx + 1] = Math.round(eg * 0.95);
            buf[idx + 2] = Math.round(eb * 0.95);
            buf[idx + 3] = Math.round(ringAlpha * 210);
          }
        }
      } else {
        // Full icon: solid background + radial glow + gradient emblem
        const distCenter = Math.hypot(x - cx, y - cy);
        const glow = Math.max(0, 1 - distCenter / (size * 0.55));
        let bgR = Math.min(255, Math.round(7 + 10 * glow));
        let bgG = Math.min(255, Math.round(10 + 26 * glow));
        let bgB = Math.min(255, Math.round(17 + 45 * glow));

        // Subtle ambient ring glow
        const ringDist = Math.abs(distCenter - scale * 0.76);
        if (ringDist < scale * 0.08) {
          const rg = 1 - ringDist / (scale * 0.08);
          bgR = Math.min(255, bgR + Math.round(0 * rg * 0.15));
          bgG = Math.min(255, bgG + Math.round(242 * rg * 0.15));
          bgB = Math.min(255, bgB + Math.round(254 * rg * 0.15));
        }

        const t = Math.max(0, Math.min(1, (y - (cy - scale * 0.55)) / (scale * 1.1)));
        let er, eg, eb;
        if (t < 0.5) {
          const k = t / 0.5;
          er = Math.round(0 * (1 - k) + 56 * k);
          eg = Math.round(242 * (1 - k) + 189 * k);
          eb = Math.round(254 * (1 - k) + 248 * k);
        } else {
          const k = (t - 0.5) / 0.5;
          er = Math.round(56 * (1 - k) + 45 * k);
          eg = Math.round(189 * (1 - k) + 212 * k);
          eb = Math.round(248 * (1 - k) + 191 * k);
        }

        if (emblemAlpha > 0) {
          const a = emblemAlpha;
          buf[idx] = Math.round(er * a + bgR * (1 - a));
          buf[idx + 1] = Math.round(eg * a + bgG * (1 - a));
          buf[idx + 2] = Math.round(eb * a + bgB * (1 - a));
          buf[idx + 3] = 255;
        } else if (ringAlpha > 0) {
          const a = ringAlpha * 0.85;
          buf[idx] = Math.round(er * a + bgR * (1 - a));
          buf[idx + 1] = Math.round(eg * a + bgG * (1 - a));
          buf[idx + 2] = Math.round(eb * a + bgB * (1 - a));
          buf[idx + 3] = 255;
        } else {
          buf[idx] = bgR;
          buf[idx + 1] = bgG;
          buf[idx + 2] = bgB;
          buf[idx + 3] = 255;
        }
      }
    }
  }

  return makePng(size, size, buf);
}

// Generate all project and native assets
console.log("Generating REPLOOT App Icons...");

// 1. Root assets
console.log("1. Writing assets/icon.png (1024x1024)...");
fs.writeFileSync("assets/icon.png", renderIcon(1024, "full"));

console.log("2. Writing assets/android-icon-foreground.png (512x512)...");
fs.writeFileSync("assets/android-icon-foreground.png", renderIcon(512, "foreground"));

console.log("3. Writing assets/android-icon-background.png (512x512)...");
fs.writeFileSync("assets/android-icon-background.png", renderIcon(512, "background"));

console.log("4. Writing assets/android-icon-monochrome.png (432x432)...");
fs.writeFileSync("assets/android-icon-monochrome.png", renderIcon(432, "monochrome"));

console.log("5. Writing assets/favicon.png (48x48)...");
fs.writeFileSync("assets/favicon.png", renderIcon(48, "full"));

// 2. Android Mipmap native resources
const mipmaps = [
  { dir: "mipmap-mdpi", launcher: 48, adaptive: 108 },
  { dir: "mipmap-hdpi", launcher: 72, adaptive: 162 },
  { dir: "mipmap-xhdpi", launcher: 96, adaptive: 216 },
  { dir: "mipmap-xxhdpi", launcher: 144, adaptive: 324 },
  { dir: "mipmap-xxxhdpi", launcher: 192, adaptive: 432 },
];

mipmaps.forEach(({ dir, launcher, adaptive }) => {
  const targetDir = path.join("android/app/src/main/res", dir);
  if (!fs.existsSync(targetDir)) return;

  console.log(`Writing Android mipmap: ${dir}...`);
  const launcherPng = renderIcon(launcher, "full");
  const foregroundPng = renderIcon(adaptive, "foreground");
  const backgroundPng = renderIcon(adaptive, "background");
  const monochromePng = renderIcon(adaptive, "monochrome");

  // Write existing webp targets (containing valid PNG data)
  fs.writeFileSync(path.join(targetDir, "ic_launcher.webp"), launcherPng);
  fs.writeFileSync(path.join(targetDir, "ic_launcher_round.webp"), launcherPng);
  fs.writeFileSync(path.join(targetDir, "ic_launcher_foreground.webp"), foregroundPng);
  fs.writeFileSync(path.join(targetDir, "ic_launcher_background.webp"), backgroundPng);
  fs.writeFileSync(path.join(targetDir, "ic_launcher_monochrome.webp"), monochromePng);
});

console.log("All app icons successfully generated!");
