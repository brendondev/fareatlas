import { ImageResponse } from "next/og";
import { SITE } from "@/lib/content";

export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const HEADLINE_1 = "Points and cash.";
const HEADLINE_2 = "One clear decision.";
const PILLS = ["Loyalty offers", "Award seats", "Cash fares"];

/** Google's CSS endpoint returns a @font-face src url we resolve to raw bytes. */
async function loadGoogleFont(family: string, weight: number, text: string) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    family,
  )}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(cssUrl)).text();
  const match = css.match(/src: url\(([^)]+)\) format\('(?:opentype|truetype)'\)/);
  if (match?.[1]) {
    const res = await fetch(match[1]);
    if (res.ok) return res.arrayBuffer();
  }
  throw new Error(`opengraph-image: failed to load font ${family} ${weight}`);
}

export default async function Image() {
  const text = `${SITE.name}${HEADLINE_1}${HEADLINE_2}${SITE.description}${PILLS.join("")}`;

  const [jakartaBold, interRegular, interSemibold] = await Promise.all([
    loadGoogleFont("Plus Jakarta Sans", 700, text),
    loadGoogleFont("Inter", 400, text),
    loadGoogleFont("Inter", 600, text),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 88px",
          background:
            "linear-gradient(135deg, #0f172a 0%, #14123a 55%, #1e1b4b 100%)",
          fontFamily: "Inter",
          position: "relative",
        }}
      >
        {/* Ambient glow, top-right */}
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -140,
            width: 560,
            height: 560,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(99,102,241,0.35) 0%, rgba(99,102,241,0) 70%)",
            display: "flex",
          }}
        />

        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "linear-gradient(135deg, #818cf8, #4338ca)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Plus Jakarta Sans",
              fontWeight: 700,
              fontSize: 20,
              color: "#ffffff",
              marginRight: 16,
            }}
          >
            FA
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: 21,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "rgba(226,232,240,0.72)",
            }}
          >
            {SITE.name}
          </div>
        </div>

        {/* Headline + description */}
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 900 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === 11 ? 10 : 6,
                  height: i === 11 ? 10 : 6,
                  borderRadius: "50%",
                  marginRight: 20,
                  background: i === 11 ? "#a5b4fc" : "rgba(148,163,184,0.4)",
                  display: "flex",
                }}
              />
            ))}
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Plus Jakarta Sans",
              fontWeight: 700,
              fontSize: 66,
              lineHeight: 1.1,
              color: "#f8fafc",
            }}
          >
            {HEADLINE_1}
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Plus Jakarta Sans",
              fontWeight: 700,
              fontSize: 66,
              lineHeight: 1.1,
              color: "#a5b4fc",
              marginBottom: 28,
            }}
          >
            {HEADLINE_2}
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Inter",
              fontWeight: 400,
              fontSize: 26,
              lineHeight: 1.45,
              color: "rgba(203,213,225,0.88)",
              maxWidth: 780,
            }}
          >
            {SITE.description}
          </div>
        </div>

        {/* Feature pills */}
        <div style={{ display: "flex", alignItems: "center" }}>
          {PILLS.map((label, i) => (
            <div key={label} style={{ display: "flex", alignItems: "center" }}>
              {i > 0 && (
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "rgba(148,163,184,0.5)",
                    margin: "0 18px",
                    display: "flex",
                  }}
                />
              )}
              <div
                style={{
                  display: "flex",
                  fontFamily: "Inter",
                  fontWeight: 600,
                  fontSize: 19,
                  color: "rgba(226,232,240,0.72)",
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Plus Jakarta Sans", data: jakartaBold, weight: 700, style: "normal" },
        { name: "Inter", data: interRegular, weight: 400, style: "normal" },
        { name: "Inter", data: interSemibold, weight: 600, style: "normal" },
      ],
    },
  );
}
