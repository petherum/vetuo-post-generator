import { NextResponse } from "next/server";
import { openai, TEXT_MODEL } from "@/lib/openai";

export const runtime = "nodejs";

function curated() {
  return [
    "radosny, energiczny, naturalny",
    "spokojny, ciepły, wspierający",
    "nowoczesny, neutralny",
    "premium, elegancki, czysty",
    "pozytywny, lekki",
    "przyjazny, rodzinny",
    "dynamiczny, w ruchu",
    "jasny, optymistyczny",
  ];
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const goal = String(body.goal || "");
  const tone = String(body.tone || "");

  const base = curated();

  try {
    const prompt = `
Zaproponuj 8 krótkich opisów nastroju zdjęcia szczęśliwych zwierząt.
Bez dramatyzmu, bez niepokoju, bez odniesień do zdrowia/objawów.
Dopasuj delikatnie do celu: ${goal} oraz tonu: ${tone}.
Zwróć WYŁĄCZNIE JSON: {"suggestions":[...]}.
`.trim();

    const r = await openai.responses.create({
      model: TEXT_MODEL,
      input: prompt,
    });

    const text = r.output_text?.trim() || "";
    const parsed = safeJson(text);
    const suggestions: string[] = Array.isArray(parsed?.suggestions) ? parsed.suggestions : [];
    const merged = uniq([...suggestions, ...base]).slice(0, 10);

    return NextResponse.json({ suggestions: merged });
  } catch {
    return NextResponse.json({ suggestions: base });
  }
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

function uniq(arr: string[]) {
  const s = new Set<string>();
  const out: string[] = [];
  for (const a of arr) {
    const v = String(a || "").trim();
    if (!v) continue;
    if (s.has(v)) continue;
    s.add(v);
    out.push(v);
  }
  return out;
}
