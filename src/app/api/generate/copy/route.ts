import { NextResponse } from "next/server";
import { openai, TEXT_MODEL } from "@/lib/openai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json();
  const goal = String(body.goal || "traffic");
  const city = String(body.city || "");
  const linkUrl = String(body.linkUrl || "https://vetuo.pl");
  const tone = String(body.tone || "neutral");

  const system = `
Jesteś asystentem marketingowym marki Vetuo (wyszukiwarka gabinetów weterynaryjnych).
TWARDE ZASADY:
- Nie udzielaj porad medycznych.
- Nie opisuj objawów, leczenia, leków.
- Mów o funkcjach: wyszukiwanie gabinetu, filtry, mapa, "otwarte teraz/24h", oszczędność czasu, mniej stresu.
FORMAT:
- max 3–5 krótkich linijek
- 1 CTA + link
- 1–3 emoji
Zwróć WYŁĄCZNIE JSON: {"main":"...","alts":["...","..."]}.
`.trim();

  const user = `
Cel: ${goal}
Ton: ${tone}
Miasto/kontekst: ${city || "-"}
Link docelowy: ${linkUrl}

Wygeneruj 1 główny tekst i 2 alternatywy.
`.trim();

  const r = await openai.responses.create({
    model: TEXT_MODEL,
    input: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const text = r.output_text?.trim() || "";
  const parsed = safeJson(text);

  if (!parsed?.main || !Array.isArray(parsed?.alts)) {
    // fallback bezpieczny
    const fallback = {
      main:
        `Szukasz weterynarza w swojej okolicy?\nVetuo pomoże Ci znaleźć gabinet szybciej — bez stresu i długiego szukania.\n👇 Sprawdź dostępne lecznice\n🔎 ${linkUrl}\n🐶🐱`,
      alts: [
        `Znalezienie gabinetu to stres — Vetuo skraca drogę do kontaktu i informacji.\n👇 Sprawdź mapę i filtry\n🔎 ${linkUrl}\n🐾`,
        `Potrzebujesz szybko znaleźć gabinet w pobliżu?\nWejdź na Vetuo i oszczędź czas.\n👇\n🔎 ${linkUrl}\n🐶🐱`,
      ],
    };
    return NextResponse.json(fallback);
  }

  return NextResponse.json({
    main: String(parsed.main),
    alts: parsed.alts.map((x: unknown) => String(x)),
  });
}

function safeJson(t: string) {
  try {
    const start = t.indexOf("{");
    const end = t.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(t.slice(start, end + 1));
    return JSON.parse(t);
  } catch {
    return null;
  }
}
