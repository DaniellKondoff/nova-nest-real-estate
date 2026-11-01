/**
 * Generates the logo, favicon and PWA icons from the brand master image.
 *
 *   node scripts/generate-icons.mjs
 *
 * Source: scripts/assets/logo-source.jpg (1024×1024, house-in-nest mark + "NOVA NEST REAL ESTATE").
 * Icons use only the mark – the wordmark is unreadable at favicon sizes.
 */
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = path.join(root, "scripts/assets/logo-source.jpg");

/** Region of the master that holds the mark (house + nest), above the wordmark */
const MARK_REGION = { left: 200, top: 140, width: 624, height: 500 };

async function main() {
  // Background colour of the artwork (top-left pixel) – used for padding so edges blend in
  const { data: px } = await sharp(SOURCE).extract({ left: 4, top: 4, width: 1, height: 1 }).raw().toBuffer({ resolveWithObject: true });
  const background = { r: px[0], g: px[1], b: px[2], alpha: 1 };

  // Tight crop around the mark
  // (two pipelines: sharp would otherwise trim before extracting)
  const region = await sharp(SOURCE).extract(MARK_REGION).png().toBuffer();
  const mark = await sharp(region)
    .trim({ background, threshold: 40 })
    .png()
    .toBuffer();

  /** Square icon: mark centred, `padding` = share of the side left empty on each edge */
  async function markIcon(size, padding, { rgba = false } = {}) {
    const inner = Math.round(size * (1 - padding * 2));
    const resized = await sharp(mark).resize(inner, inner, { fit: "inside" }).toBuffer();
    const canvas = sharp({ create: { width: size, height: size, channels: 4, background } })
      .composite([{ input: resized, gravity: "center" }]);
    // ICO decoders only accept RGBA frames; everything else is quantized to a palette
    return rgba
      ? canvas.png({ compressionLevel: 9 }).toBuffer()
      : canvas.flatten({ background }).removeAlpha().png({ compressionLevel: 9, palette: true }).toBuffer();
  }

  const out = async (rel, buf) => {
    const file = path.join(root, rel);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, buf);
    console.log(`${rel}  ${(buf.length / 1024).toFixed(1)} KB`);
  };

  // Full logo (mark + wordmark) – header and Organization schema
  await out(
    "public/images/logo.png",
    await sharp(SOURCE).resize(512, 512).png({ compressionLevel: 9, palette: true }).toBuffer()
  );

  // Next.js file-convention icons
  await out("src/app/icon.png", await markIcon(512, 0.1));
  await out("src/app/apple-icon.png", await markIcon(180, 0.1));
  await out("src/app/favicon.ico", toIco(await Promise.all([16, 32, 48].map((s) => markIcon(s, 0.04, { rgba: true }))), [16, 32, 48]));

  // PWA manifest icons; maskable keeps the mark inside the 80% safe zone
  await out("public/icons/icon-192.png", await markIcon(192, 0.1));
  await out("public/icons/icon-512.png", await markIcon(512, 0.1));
  await out("public/icons/icon-maskable-512.png", await markIcon(512, 0.2));
}

/** ICO container with embedded PNG images (supported by all current browsers) */
function toIco(pngs, sizes) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(pngs.length, 4);

  let offset = 6 + 16 * pngs.length;
  const entries = pngs.map((png, i) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(sizes[i] % 256, 0); // width (0 = 256)
    entry.writeUInt8(sizes[i] % 256, 1); // height
    entry.writeUInt8(0, 2); // palette colours
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...pngs]);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
