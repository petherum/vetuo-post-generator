import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Animals = {
  dog: number;
  cat: number;
  otherName?: string;
  otherCount?: number;
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const animals: Animals = body.animals || { dog: 1, cat: 0 };
  const background = String(body.background || "");
  const mood = String(body.mood || "");
  const style = (body.style === "illustration" ? "illustration" : "photo") as
    | "photo"
    | "illustration";
  const seed = Number(body.seed || 0);

  const prompt = buildImagePrompt({
    animals,
    background,
    mood,
    style,
    seed,
  });

  return NextResponse.json({ prompt });
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
