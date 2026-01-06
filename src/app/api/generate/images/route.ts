import { NextResponse } from "next/server";
import { openai, IMAGE_MODEL } from "@/lib/openai";

export const runtime = "nodejs";

type Animals = {
  dog: number;
  cat: number;
  otherName?: string;
  otherCount?: number;
};

export async function POST(req: Request) {
    try {
    const body = await req.json();
    const animals: Animals = body.animals || { dog: 1, cat: 0 };
    const background = String(body.background || "");
    const mood = String(body.mood || "");
    const style = (body.style === "illustration" ? "illustration" : "photo") as "photo" | "illustration";
    const seed = Number(body.seed || 0);

    // NEW: liczba obrazów (1–4)
    const countRaw = Number(body.count ?? 4);
    const count = Math.max(1, Math.min(4, Number.isFinite(countRaw) ? countRaw : 4));

   const prompt = buildImagePrompt({ animals, background, mood, style, seed });

    // gpt-image-1 zwraca base64 (b64_json) domyślnie; response_format nie jest potrzebny
    const img = await openai.images.generate({
      model: IMAGE_MODEL,
      prompt,
      size: "1024x1536",
      n: count,
    });

    const images = (img.data || []).map((d: any, idx: number) => {
      const b64 = d?.b64_json ? `data:image/png;base64,${d.b64_json}` : null;
      const url = typeof d?.url === "string" ? d.url : null;
      return {
        id: `ai_${Date.now()}_${idx}`,
        url: b64 || url || "",
      };
    }).filter((x: any) => x.url);

    if (!images.length) {
      return NextResponse.json(
        { error: "OpenAI nie zwróciło obrazów.", prompt },
        { status: 502 }
      );
    }

    return NextResponse.json({ images, prompt });
  } catch (err: any) {
    console.error("generate/images error:", err?.status, err?.message || err);
    const status = typeof err?.status === "number" ? err.status : 500;
    return NextResponse.json(
      { error: err?.message || "Błąd generowania obrazów (server)."},
      { status }
    );
  }
}

function buildImagePrompt({
  animals,
  background,
  mood,
  style,
  seed,
}: {
  animals: Animals;
  background: string;
  mood: string;
  style: "photo" | "illustration";
  seed: number;
}) {
  const list: string[] = [];
  if (animals.dog > 0) list.push(`${animals.dog} pies/piesy`);
  if (animals.cat > 0) list.push(`${animals.cat} kot/koty`);
  if (animals.otherName?.trim() && (animals.otherCount || 0) > 0) {
    list.push(`${animals.otherCount} ${animals.otherName}`);
  }

  const animalsText = list.length ? list.join(", ") : "1 pies";

  const bg = background.trim() || "jasne, naturalne tło plenerowe, lekki bokeh";
  const md = mood.trim() || "radosny, naturalny, pozytywny";

  const styleLine =
    style === "illustration"
      ? "Styl: lekka ilustracja, nowoczesna, naturalne kolory, bez przerysowania."
      : "Styl: realistyczne zdjęcie, naturalne światło, wysoka jakość.";

  return `
${styleLine}
Realistyczna, pozytywna scena ze zwierzętami: ${animalsText}.
Tło: ${bg}.
Nastrój: ${md}.
Zwierzęta szczęśliwe, naturalne, w ruchu lub spokojne.
Kompozycja z wolnym miejscem na tekst w górnej części kadru (negatywna przestrzeń).
BEZ klinik, BEZ lekarzy, BEZ sprzętu medycznego.
BEZ tekstu, BEZ logotypów, BEZ znaków wodnych.
Kadr pionowy 4:5, premium, czyste, estetyczne.
Wariant: ${seed}.
`.trim();
}
