import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

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

export interface OgCardProps {
  /** Small line above the title, e.g. "Апартамент за продажба" */
  eyebrow: string;
  title: string;
  /** Short facts shown as pills, e.g. ["89 000 €", "68 м²", "Аязмото"] */
  facts?: string[];
  /** Absolute URL of the background photo; falls back to the brand hero image */
  imageUrl?: string | null;
}

/** Renders the branded social card used by every opengraph-image route */
export async function renderOgCard({ eyebrow, title, facts = [], imageUrl }: OgCardProps): Promise<ImageResponse> {
  const [fonts, background] = await Promise.all([
    loadFonts(),
    imageUrl ? Promise.resolve(imageUrl) : publicImageDataUrl("images/hero-building.jpg"),
  ]);

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", position: "relative", fontFamily: "Inter", backgroundColor: NAVY }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- next/og renders plain <img> */}
        <img src={background} alt="" width={1200} height={630} style={{ position: "absolute", top: 0, left: 0, objectFit: "cover", width: "100%", height: "100%" }} />
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
            {facts.length > 0 && (
              <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
                {facts.map((fact, i) => (
                  <div
                    key={fact}
                    style={{
                      display: "flex",
                      padding: "10px 22px",
                      borderRadius: 999,
                      fontSize: 30,
                      fontWeight: 700,
                      color: i === 0 ? NAVY : "white",
                      backgroundColor: i === 0 ? GOLD : "rgba(255,255,255,0.14)",
                    }}
                  >
                    {fact}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts }
  );
}
