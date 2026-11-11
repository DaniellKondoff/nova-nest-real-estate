import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type SharpFn from "sharp";

/** Social preview cards (Facebook, Viber, LinkedIn, X) – PNG 1200×630; SVG is not supported by those crawlers */
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const NAVY = "#1a2642";
const GOLD = "#d4af37";

/** next/og ships only a Latin font – Inter is bundled for Cyrillic text */
async function loadFonts() {
  const dir = join(process.cwd(), "src/assets/fonts");
  const [medium, bold] = await Promise.all([readFile(join(dir, "Inter-500.ttf")), readFile(join(dir, "Inter-700.ttf"))]);
  return [
    { name: "Inter", data: medium, weight: 500 as const, style: "normal" as const },
    { name: "Inter", data: bold, weight: 700 as const, style: "normal" as const },
  ];
}

async function publicImageDataUrl(file: string): Promise<string> {
  const data = await readFile(join(process.cwd(), "public", file));
  return `data:image/jpeg;base64,${data.toString("base64")}`;
}

let sharpPromise: Promise<typeof SharpFn | null> | null = null;

/**
 * sharp is a native module – loaded lazily so a broken binary degrades the card instead of
 * crashing the route at import time. Keep package.json `sharp` on Next's version: two copies mean
 * two libvips builds in one process (GLib "VipsInterpretation" criticals, failures on Vercel).
 */
function loadSharp(): Promise<typeof SharpFn | null> {
  sharpPromise ??= import("sharp")
    .then((mod) => mod.default)
    .catch((error) => {
      console.error("[og] sharp unavailable:", error);
      return null;
    });
  return sharpPromise;
}

/**
 * Satori (next/og) cannot decode WebP, and most listing photos are WebP – a remote WebP URL renders as nothing.
 * Every photo is fetched and re-encoded as a 1200×630 JPEG. Without sharp, JPEG/PNG photos are passed through
 * as-is; anything else (or any failure) falls back to the brand hero image.
 */
async function photoDataUrl(url: string): Promise<string> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const bytes = Buffer.from(await res.arrayBuffer());
    const sharp = await loadSharp();
    if (sharp) {
      const jpeg = await sharp(bytes)
        .rotate()
        .resize(OG_SIZE.width, OG_SIZE.height, { fit: "cover" })
        .jpeg({ quality: 82 })
        .toBuffer();
      return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
    }
    const type = res.headers.get("content-type")?.split(";")[0].trim();
    if (type === "image/jpeg" || type === "image/png") return `data:${type};base64,${bytes.toString("base64")}`;
    throw new Error(`cannot render ${type ?? "unknown type"} without sharp`);
  } catch (error) {
    console.error("[og] photo failed, using fallback:", url, error);
    return publicImageDataUrl("images/hero-building.jpg");
  }
}

export interface OgCardProps {
  /** Small line above the title, e.g. "Апартамент за продажба" */
  eyebrow: string;
  title: string;
  /** Short facts shown as pills, e.g. ["89 000 €", "68 м²", "Аязмото"] */
  facts?: string[];
  /** Absolute URL of the background photo; falls back to the brand hero image */
  imageUrl?: string | null;
  /** "brand": photo under a dark navy overlay (site default). "photo": listing photo stays visible, gradient only at the bottom */
  variant?: "brand" | "photo";
}

/**
 * Re-encodes a rendered card as JPEG. Photo cards are ~1.2 MB as PNG; WhatsApp/Viber skip preview images
 * over ~600 KB and Messenger loads them slowly, while the JPEG is ~10× smaller.
 * If sharp is unavailable or fails, the PNG is served instead – a share card must never be a 500.
 */
export async function toJpegResponse(card: Response, headers: Record<string, string> = {}): Promise<Response> {
  const png = Buffer.from(await card.arrayBuffer());
  const sharp = await loadSharp();
  if (sharp) {
    try {
      const jpeg = await sharp(png).jpeg({ quality: 85, mozjpeg: true }).toBuffer();
      return new Response(new Uint8Array(jpeg), {
        headers: { "Content-Type": "image/jpeg", "Content-Length": String(jpeg.length), ...headers },
      });
    } catch (error) {
      console.error("[og] JPEG conversion failed, serving PNG:", error);
    }
  }
  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png", "Content-Length": String(png.length), ...headers },
  });
}

function FactPills({ facts, size }: { facts: string[]; size: number }) {
  return (
    <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
      {facts.map((fact, i) => (
        <div
          key={fact}
          style={{
            display: "flex",
            padding: size > 28 ? "10px 22px" : "8px 20px",
            borderRadius: 999,
            fontSize: size,
            fontWeight: 700,
            color: i === 0 ? NAVY : "white",
            backgroundColor: i === 0 ? GOLD : "rgba(255,255,255,0.18)",
          }}
        >
          {fact}
        </div>
      ))}
    </div>
  );
}

/** Renders the branded social card used by every OG image route */
export async function renderOgCard({
  eyebrow,
  title,
  facts = [],
  imageUrl,
  variant = "brand",

}: OgCardProps): Promise<ImageResponse> {
  const [fonts, background] = await Promise.all([
    loadFonts(),
    imageUrl ? photoDataUrl(imageUrl) : publicImageDataUrl("images/hero-building.jpg"),
  ]);

  const photo = (
    // eslint-disable-next-line @next/next/no-img-element -- next/og renders plain <img>
    <img src={background} alt="" width={1200} height={630} style={{ position: "absolute", top: 0, left: 0, objectFit: "cover", width: "100%", height: "100%" }} />
  );

  if (variant === "photo") {
    return new ImageResponse(
      (
        <div style={{ display: "flex", width: "100%", height: "100%", position: "relative", fontFamily: "Inter", backgroundColor: NAVY }}>
          {photo}
          <div
            style={{
              position: "absolute",
              left: 0,
              bottom: 0,
              width: "100%",
              height: "52%",
              display: "flex",
              // Only the bottom part is darkened so the photo stays the main subject; listing photos are often
              // marketing graphics with their own text, so the band under our text must be nearly opaque
              backgroundImage: "linear-gradient(180deg, rgba(26,38,66,0) 0%, rgba(26,38,66,0.82) 30%, rgba(26,38,66,0.95) 55%, rgba(26,38,66,0.97) 100%)",
            }}
          />
          <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", padding: "36px 48px 40px" }}>
            <div style={{ display: "flex" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 20px 10px 14px",
                  borderRadius: 999,
                  backgroundColor: "rgba(26,38,66,0.82)",
                }}
              >
                <div style={{ display: "flex", width: 8, height: 26, backgroundColor: GOLD, borderRadius: 3 }} />
                <div style={{ display: "flex", fontSize: 26, fontWeight: 700, color: "white", letterSpacing: -0.4 }}>Nova Nest</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", fontSize: 24, fontWeight: 500, color: GOLD }}>{eyebrow}</div>
              <div style={{ display: "flex", fontSize: title.length > 44 ? 42 : 50, fontWeight: 700, color: "white", lineHeight: 1.12, letterSpacing: -0.8 }}>
                {title}
              </div>
              {facts.length > 0 && <FactPills facts={facts} size={28} />}
            </div>
          </div>
        </div>
      ),
      { ...OG_SIZE, fonts }
    );
  }

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", position: "relative", fontFamily: "Inter", backgroundColor: NAVY }}>
        {photo}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            // Satori has no `inset`; explicit box + gradient keeps text readable on bright photos
            backgroundImage: "linear-gradient(180deg, rgba(26,38,66,0.55) 0%, rgba(26,38,66,0.8) 45%, rgba(26,38,66,0.97) 100%)",
          }}
        />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", padding: "56px 64px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", width: 14, height: 44, backgroundColor: GOLD, borderRadius: 4 }} />
            <div style={{ display: "flex", fontSize: 34, fontWeight: 700, color: "white", letterSpacing: -0.5 }}>Nova Nest</div>
            <div style={{ display: "flex", fontSize: 24, fontWeight: 500, color: "rgba(255,255,255,0.75)", marginLeft: 6 }}>
              Недвижими имоти · Стара Загора
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", fontSize: 28, fontWeight: 500, color: GOLD }}>{eyebrow}</div>
            <div style={{ display: "flex", fontSize: title.length > 48 ? 52 : 62, fontWeight: 700, color: "white", lineHeight: 1.1, letterSpacing: -1 }}>
              {title}
            </div>
            {facts.length > 0 && <FactPills facts={facts} size={30} />}
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts }
  );
}
