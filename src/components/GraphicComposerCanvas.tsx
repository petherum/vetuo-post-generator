"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type ComposerBranding = {
  navy: string;
  gold: string;
  siteText: string; // always www.vetuo.pl on the graphic
  logoPlacement: "bottom-right";
};

export type ComposerInput = {
  imageUrl: string | null;
  headline: string;
  subheadline?: string;
};

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = (text || "").split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    const m = ctx.measureText(test).width;
    if (m > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  return await new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = url;
  });
}

async function loadLogo(): Promise<HTMLImageElement | null> {
  // Put logo at: src/assets/vetuo-logo.png -> will be served as /_next/static... only via import
  // In MVP we try to load from public path for simplicity:
  // Place a copy also in /public/vetuo-logo.png (recommended).
  try {
    return await loadImage("/vetuo-logo.png");
  } catch {
    return null;
  }
}

export default function GraphicComposerCanvas({
  input,
  branding,
}: {
  input: ComposerInput;
  branding: ComposerBranding;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
  const [bgImg, setBgImg] = useState<HTMLImageElement | null>(null);
  const [bgErr, setBgErr] = useState<string | null>(null);

  const size = useMemo(() => ({ w: 1080, h: 1350 }), []);

  useEffect(() => {
    (async () => {
      const logo = await loadLogo();
      setLogoImg(logo);
    })();
  }, []);

  useEffect(() => {
    setBgErr(null);
    setBgImg(null);
    if (!input.imageUrl) return;

    (async () => {
      try {
        const img = await loadImage(input.imageUrl!);
        setBgImg(img);
      } catch (e) {
        setBgErr("Nie udało się wczytać obrazu (CORS). W Etapie 2 użyjemy źródeł z poprawnym CORS / własnego storage.");
      }
    })();
  }, [input.imageUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = size.w;
    canvas.height = size.h;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // background
    ctx.clearRect(0, 0, size.w, size.h);

    if (bgImg) {
      // cover crop
      const iw = bgImg.width;
      const ih = bgImg.height;
      const cw = size.w;
      const ch = size.h;

      const scale = Math.max(cw / iw, ch / ih);
      const sw = cw / scale;
      const sh = ch / scale;
      const sx = (iw - sw) / 2;
      const sy = (ih - sh) / 2;
      ctx.drawImage(bgImg, sx, sy, sw, sh, 0, 0, cw, ch);
    } else {
      // fallback background
      ctx.fillStyle = "#EEF2F7";
      ctx.fillRect(0, 0, size.w, size.h);

      // subtle navy block
      ctx.fillStyle = branding.navy;
      ctx.globalAlpha = 0.08;
      ctx.fillRect(0, 0, size.w, size.h);
      ctx.globalAlpha = 1;
    }

    // premium margins and overlay for text readability
    const margin = 72;
    const topBlockH = 360;

    // gradient overlay at top
    const grad = ctx.createLinearGradient(0, 0, 0, topBlockH);
    grad.addColorStop(0, "rgba(10,53,92,0.78)");
    grad.addColorStop(1, "rgba(10,53,92,0.00)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size.w, topBlockH);

    // gold accent line
    ctx.fillStyle = branding.gold;
    ctx.globalAlpha = 0.95;
    ctx.fillRect(margin, margin + 12, 96, 6);
    ctx.globalAlpha = 1;

    // headline
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    const headlineFontSize = 62;
    ctx.font = `800 ${headlineFontSize}px Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial`;
    const maxTextW = size.w - margin * 2;

    const headlineLines = wrapText(ctx, input.headline || "", maxTextW);
    let y = margin + 40;

    for (let i = 0; i < Math.min(3, headlineLines.length); i++) {
      ctx.fillText(headlineLines[i], margin, y);
      y += headlineFontSize * 1.12;
    }

    // subheadline
    const sub = (input.subheadline || "").trim();
    if (sub) {
      ctx.globalAlpha = 0.95;
      const subFont = 34;
      ctx.font = `600 ${subFont}px Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial`;
      const subLines = wrapText(ctx, sub, maxTextW);
      y += 14;
      for (let i = 0; i < Math.min(2, subLines.length); i++) {
        ctx.fillText(subLines[i], margin, y);
        y += subFont * 1.25;
      }
      ctx.globalAlpha = 1;
    }

    // bottom-right brand block: logo + site
    const brPad = 42;
    const siteFont = 30;
    ctx.font = `700 ${siteFont}px Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial`;

    const siteText = branding.siteText;
    const siteW = ctx.measureText(siteText).width;

    const logoSize = 120; // small
    const gap = 18;

    const blockW = (logoImg ? logoSize + gap : 0) + siteW;
    const xRight = size.w - brPad;
    const yBottom = size.h - brPad;

    // dark backing pill for readability
    const pillH = Math.max(logoImg ? logoSize : siteFont, siteFont) + 28;
    const pillW = blockW + 44;
    const pillX = xRight - pillW;
    const pillY = yBottom - pillH;

    ctx.fillStyle = "rgba(10,53,92,0.72)";
    roundRect(ctx, pillX, pillY, pillW, pillH, 26);
    ctx.fill();



    let x = pillX + 32;
    const contentY = pillY + 14;

    if (logoImg) {
      ctx.drawImage(logoImg, x, contentY, logoSize, logoSize);
      x += logoSize + gap;
    }

    ctx.fillStyle = "white";
    ctx.textBaseline = "middle";
    ctx.fillText(siteText, x, pillY + pillH / 2);
  }, [bgImg, logoImg, input.headline, input.subheadline, branding, size]);

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <canvas
          id="vetuo-composer-canvas"
          ref={canvasRef}
          className="h-auto w-full"
        />
      </div>
      {bgErr && (
        <div className="rounded-xl border bg-amber-50 p-3 text-xs text-amber-800">
          {bgErr}
          <div className="mt-1">
            Tip: na Etapie 1 mock obrazki z Unsplash czasem blokują CORS. To nie błąd Twojej aplikacji.
          </div>
        </div>
      )}
      <div className="text-xs text-slate-500">
        Jeśli chcesz logo na pewno widoczne: skopiuj plik do <span className="font-semibold">/public/vetuo-logo.png</span>.
      </div>
    </div>
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}
