"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Stepper from "@/components/Stepper";
import AnimalCounter from "@/components/AnimalCounter";
import SuggestInput, { SuggestItem } from "@/components/SuggestInput";
import ImageGrid, { MockImage } from "@/components/ImageGrid";
import CopyEditor from "@/components/CopyEditor";
import GraphicComposerCanvas, { ComposerBranding, ComposerInput } from "@/components/GraphicComposerCanvas";

type Goal = "awareness" | "traffic" | "engagement";
type Tone = "neutral" | "light" | "premium";

const VETUO = {
  navy: "#0A355C",
  gold: "#E4AE49",
  site: "www.vetuo.pl",
  claim: "Znajdź weterynarza w 10 sekund.",
};

const BACKGROUND_SUGGESTIONS: SuggestItem[] = [
  { label: "Park w mieście, poranek", value: "park w mieście, poranek" },
  { label: "Domowe wnętrze premium, jasne", value: "domowe wnętrze premium, jasne" },
  { label: "Spacer w mieście, miękkie światło", value: "spacer w mieście, miękkie światło" },
  { label: "Ogród, natura, wiosna", value: "ogród, natura, wiosna" },
  { label: "Jasne tło, minimalizm", value: "jasne tło, minimalizm" },
  { label: "Łąka, złota godzina", value: "łąka, złota godzina" },
];

const MOOD_SUGGESTIONS: SuggestItem[] = [
  { label: "Radosny, energiczny, naturalny", value: "radosny, energiczny, naturalny" },
  { label: "Spokojny, ciepły, wspierający", value: "spokojny, ciepły, wspierający" },
  { label: "Nowoczesny, neutralny", value: "nowoczesny, neutralny" },
  { label: "Premium, elegancki, czysty", value: "premium, elegancki, czysty" },
  { label: "Pozytywny, lekki", value: "pozytywny, lekki" },
];

const DEFAULT_COPY_MAIN =
  "Szukasz weterynarza w swojej okolicy?\nVetuo pomoże Ci znaleźć gabinet szybciej — bez stresu i długiego szukania.\n👇 Sprawdź dostępne lecznice w Twoim mieście\n🔎 https://vetuo.pl\n🐶🐱";

// (Etap 2) obrazy przyjdą z API jako data URL (base64), więc nie ma problemu CORS w canvas.

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function CreatePage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Etap 2: stany ładowania + seed do "kolejne 4"
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [imageSeed, setImageSeed] = useState(0);
  const [imageCount, setImageCount] = useState<1 | 2 | 3 | 4>(1);
  const [lastImagePrompt, setLastImagePrompt] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  // Step 1
  const [dog, setDog] = useState(1);
  const [cat, setCat] = useState(0);
  const [otherName, setOtherName] = useState("");
  const [otherCount, setOtherCount] = useState(0);
  const [background, setBackground] = useState("");
  const [mood, setMood] = useState("");
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [images, setImages] = useState<MockImage[]>([]);

  // Step 2
  const [goal, setGoal] = useState<Goal>("traffic");
  const [city, setCity] = useState("");
  const [linkUrl, setLinkUrl] = useState("https://vetuo.pl");
  const [tone, setTone] = useState<Tone>("neutral");

  const [copyMain, setCopyMain] = useState(DEFAULT_COPY_MAIN);
  const [copyAlts, setCopyAlts] = useState<string[]>([
    "Znalezienie gabinetu to stres — Vetuo skraca drogę do weterynarza.\n👇 Sprawdź mapę i filtry\n🔎 https://vetuo.pl\n🐾",
    "Szukasz gabinetu otwartego teraz?\nWejdź na Vetuo i znajdź lecznicę szybciej.\n👇\n🔎 https://vetuo.pl\n🐶🐱",
  ]);

  const [finalCopy, setFinalCopy] = useState(DEFAULT_COPY_MAIN);

  // Step 3
  const [headline, setHeadline] = useState("Znajdź najbliższego weterynarza");
  const [subheadline, setSubheadline] = useState(VETUO.claim);

  const selectedImage = useMemo(
    () => images.find((i) => i.id === selectedImageId) ?? null,
    [images, selectedImageId]
  );

  const canGoStep2 = useMemo(() => {
    const total = dog + cat + (otherName.trim() ? otherCount : 0);
    return total >= 1 && !!selectedImageId;
  }, [dog, cat, otherName, otherCount, selectedImageId]);

  const canGoStep3 = useMemo(() => {
    return finalCopy.trim().length > 0 && linkUrl.trim().length > 0;
  }, [finalCopy, linkUrl]);

  // Persist to localStorage (MVP)
  useEffect(() => {
    const payload = {
      step,
      dog, cat, otherName, otherCount,
      background, mood,
      selectedImageId,
      goal, city, linkUrl, tone,
      copyMain, copyAlts, finalCopy,
      headline, subheadline,
    };
    localStorage.setItem("vetuo_pg_draft_v1", JSON.stringify(payload));
  }, [step, dog, cat, otherName, otherCount, background, mood, selectedImageId, goal, city, linkUrl, tone, copyMain, copyAlts, finalCopy, headline, subheadline]);

  useEffect(() => {
    const raw = localStorage.getItem("vetuo_pg_draft_v1");
    if (!raw) return;
    try {
      const d = JSON.parse(raw);
      if (d.step) setStep(d.step);
      if (typeof d.dog === "number") setDog(clamp(d.dog, 0, 6));
      if (typeof d.cat === "number") setCat(clamp(d.cat, 0, 6));
      if (typeof d.otherName === "string") setOtherName(d.otherName);
      if (typeof d.otherCount === "number") setOtherCount(clamp(d.otherCount, 0, 6));
      if (typeof d.background === "string") setBackground(d.background);
      if (typeof d.mood === "string") setMood(d.mood);
      if (typeof d.selectedImageId === "string") setSelectedImageId(d.selectedImageId);

      if (d.goal) setGoal(d.goal);
      if (typeof d.city === "string") setCity(d.city);
      if (typeof d.linkUrl === "string") setLinkUrl(d.linkUrl);
      if (d.tone) setTone(d.tone);

      if (typeof d.copyMain === "string") setCopyMain(d.copyMain);
      if (Array.isArray(d.copyAlts)) setCopyAlts(d.copyAlts);
      if (typeof d.finalCopy === "string") setFinalCopy(d.finalCopy);

      if (typeof d.headline === "string") setHeadline(d.headline);
      if (typeof d.subheadline === "string") setSubheadline(d.subheadline);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

    async function generateImages(nextSeed?: number) {
    try {
      setIsGeneratingImages(true);
      setSelectedImageId(null);

      const seedToUse = typeof nextSeed === "number" ? nextSeed : imageSeed;

      const res = await fetch("/api/generate/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
         animals: { dog, cat, otherName, otherCount },
          background,
          mood,
          style: "photo",
          seed: seedToUse,
	  count: imageCount,
        }),
      });

            if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        const msg = errJson?.error ? String(errJson.error) : `HTTP ${res.status}`;
        throw new Error(`generate/images failed: ${msg}`);
      }

      const data = await res.json();
      setLastImagePrompt(String(data.prompt || ""));
      const newImages = Array.isArray(data.images) ? data.images : [];
      // jeśli user ma upload, trzymamy go jako pierwszą opcję
      setImages((prev) => {
        const keepUpload = uploadedImageUrl
          ? [{ id: "upload", url: uploadedImageUrl, alt: "Uploaded image" }]
          : [];
        return [...keepUpload, ...newImages];
      });
    } catch (e) {
       console.error(e);
       alert("Nie udało się wygenerować obrazów. Spróbuj ponownie.");
     } finally {
       setIsGeneratingImages(false);
     }
   }

  async function generateImagePrompt(nextSeed?: number) {
    const seedToUse = typeof nextSeed === "number" ? nextSeed : imageSeed;
    const res = await fetch("/api/generate/image-prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        animals: { dog, cat, otherName, otherCount },
        background,
        mood,
        style: "photo",
        seed: seedToUse,
      }),
    });
    if (!res.ok) {
      alert("Nie udało się wygenerować promptu.");
      return;
    }
    const data = await res.json();
    setLastImagePrompt(String(data.prompt || ""));
  }

  function onUploadFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || "");
      setUploadedImageUrl(url);
      // wstawiamy upload jako pierwszą opcję wyboru
      setImages((prev) => {
        const withoutUpload = prev.filter((x) => x.id !== "upload");
        return [{ id: "upload", url, alt: "Uploaded image" }, ...withoutUpload];
      });
      setSelectedImageId("upload");
    };
    reader.readAsDataURL(file);
  }

async function generateCopy() {
  try {
    setIsGeneratingCopy(true);

    const res = await fetch("/api/generate/copy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal, city, linkUrl, tone }),
    });

    if (!res.ok) {
      throw new Error(`generate/copy failed: ${res.status}`);
    }

    const data = await res.json();
    setCopyMain(data.main);
    setCopyAlts(data.alts);
    setFinalCopy(data.main);
  } catch (e) {
    console.error(e);
    alert("Nie udało się wygenerować tekstu.");
  } finally {
    setIsGeneratingCopy(false);
  }
}

  const branding: ComposerBranding = {
    navy: VETUO.navy,
    gold: VETUO.gold,
    siteText: VETUO.site,
    logoPlacement: "bottom-right",
  };

  const composerInput: ComposerInput = {
    imageUrl: selectedImage?.url ?? null,
    headline,
    subheadline: subheadline || "",
  };

  return (
    <main className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-[color:var(--vetuo-navy)]" />
            <div className="leading-tight">
              <div className="text-sm font-semibold">Vetuo</div>
              <div className="text-xs text-slate-500">Post Generator</div>
            </div>
          </div>
          <div className="text-xs text-slate-500">MVP · ręczna publikacja</div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-5 pb-28">
        <Stepper
          current={step}
          steps={[
            { id: 1, title: "Obraz" },
            { id: 2, title: "Tekst" },
            { id: 3, title: "Grafika" },
          ]}
          onGo={(s) => setStep(s as 1 | 2 | 3)}
        />

        {step === 1 && (
          <section className="mt-5 space-y-4">
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold">Zwierzęta</h2>
              <div className="mt-3 grid gap-3">
                <AnimalCounter label="🐶 Pies" value={dog} onChange={setDog} />
                <AnimalCounter label="🐱 Kot" value={cat} onChange={setCat} />
                <div className="rounded-xl border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold">🐾 Inne</div>
                    <div className="flex items-center gap-2">
                      <button
                        className="h-9 w-9 rounded-lg border bg-white text-lg"
                        onClick={() => setOtherCount((v) => clamp(v - 1, 0, 6))}
                        aria-label="Minus"
                      >
                        −
                      </button>
                      <div className="w-8 text-center text-sm font-semibold">{otherCount}</div>
                      <button
                        className="h-9 w-9 rounded-lg border bg-white text-lg"
                        onClick={() => setOtherCount((v) => clamp(v + 1, 0, 6))}
                        aria-label="Plus"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <input
                    value={otherName}
                    onChange={(e) => setOtherName(e.target.value)}
                    placeholder="np. królik"
                    className="mt-3 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--vetuo-gold)]"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Jeśli zostawisz pustą nazwę, „Inne” nie będzie liczone.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <SuggestInput
                title="Tło (opcjonalne)"
                value={background}
                onChange={setBackground}
                suggestions={BACKGROUND_SUGGESTIONS}
                placeholder="np. park w mieście, poranek"
              />
              <SuggestInput
                title="Nastrój (opcjonalne)"
                value={mood}
                onChange={setMood}
                suggestions={MOOD_SUGGESTIONS}
                placeholder="np. radosny, naturalny"
              />
            </div>

            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold">Wybierz obraz (mock w Etapie 1)</h2>
                <button
                  onClick={() => {
                    const s = imageSeed + 1;
                    setImageSeed(s);
                    generateImages(s);
                  }}
                  className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold disabled:opacity-50"
                  disabled={isGeneratingImages}
                >
                  {isGeneratingImages ? "Generuję..." : "Kolejne 4"}
                </button>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                W Etapie 2 podmienimy to na generowanie AI (4 obrazy + „dalej”).
              </p>

              <div className="mt-3 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1">
                    <span className="text-xs font-semibold text-slate-700">Ile obrazów (1–4)</span>
                    <select
                      value={imageCount}
                      onChange={(e) => setImageCount(Number(e.target.value) as 1 | 2 | 3 | 4)}
                      className="rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--vetuo-gold)]"
                    >
                      <option value={1}>1 (taniej)</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                      <option value={4}>4 (więcej opcji)</option>
                    </select>
                  </label>

                  <label className="grid gap-1">
                    <span className="text-xs font-semibold text-slate-700">Upload własnego obrazu</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) onUploadFile(f);
                      }}
                      className="rounded-xl border bg-white px-3 py-2 text-sm"
                    />
                  </label>
                </div>

                {uploadedImageUrl && (
                  <div className="flex items-center justify-between gap-3 rounded-xl border bg-slate-50 p-3 text-xs text-slate-700">
                    <div>
                      <span className="font-semibold">Upload aktywny</span> — możesz wybrać go w siatce obrazów.
                    </div>
                    <button
                      className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold"
                      onClick={() => {
                        setUploadedImageUrl(null);
                        setImages((prev) => prev.filter((x) => x.id !== "upload"));
                        if (selectedImageId === "upload") setSelectedImageId(null);
                      }}
                    >
                      Usuń upload
                    </button>
                  </div>
                )}

                <button
                  onClick={() => generateImages(imageSeed)}
                  className="vetuo-primary w-full rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-50"
  		  disabled={isGeneratingImages}

                >
                  {isGeneratingImages ? "Generuję obrazy..." : "✨ Generuj obrazy"}
                </button>


                <button
                  onClick={() => generateImagePrompt(imageSeed)}
                  className="w-full rounded-xl border bg-white px-4 py-3 text-sm font-semibold"
                >
                  Generuj prompt (bez kosztu obrazów)
                </button>

                {lastImagePrompt && (
                  <div className="rounded-xl border bg-white p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs font-semibold text-slate-700">Prompt użyty / proponowany</div>
                      <button
                        className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold"
                        onClick={() => navigator.clipboard.writeText(lastImagePrompt)}
                      >
                        Kopiuj
                      </button>
                    </div>
                    <pre className="mt-2 whitespace-pre-wrap text-xs text-slate-700">{lastImagePrompt}</pre>
                  </div>
                )}

                {images.length === 0 ? (
                  <div className="rounded-xl border bg-slate-50 p-3 text-sm text-slate-600">
                   Jeszcze nie ma obrazów. Kliknij <span className="font-semibold">„Generuj obrazy”</span>.
                  </div>
                ) : (
                  <ImageGrid
                    images={images}
                    selectedId={selectedImageId}
                    onSelect={setSelectedImageId}
                  />
                )}
              </div>
            </div>

              <div className="sticky bottom-3 z-20">
              <div className="rounded-2xl border bg-white p-3 shadow-lg">
                <button
                  className="vetuo-primary w-full rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-50"
                  disabled={!canGoStep2}
                  onClick={() => setStep(2)}
                >
                  Dalej: Tekst posta
                </button>
              </div>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="mt-5 space-y-4">
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold">Wybierz obraz</h2>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-xs font-semibold text-slate-700">Cel posta</span>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value as Goal)}
                    className="rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--vetuo-gold)]"
                  >
                    <option value="awareness">Świadomość marki</option>
                    <option value="traffic">Ruch na stronę</option>
                    <option value="engagement">Zaangażowanie</option>
                  </select>
                </label>

                <label className="grid gap-1">
                  <span className="text-xs font-semibold text-slate-700">Ton</span>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as Tone)}
                    className="rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--vetuo-gold)]"
                  >
                    <option value="neutral">Neutralny</option>
                    <option value="light">Lekki</option>
                    <option value="premium">Premium</option>
                  </select>
                </label>

                <label className="grid gap-1 sm:col-span-2">
                  <span className="text-xs font-semibold text-slate-700">Miasto / kontekst (opcjonalnie)</span>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="np. Warszawa"
                    className="rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--vetuo-gold)]"
                  />
                </label>

                <label className="grid gap-1 sm:col-span-2">
                  <span className="text-xs font-semibold text-slate-700">Link docelowy</span>
                  <input
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://vetuo.pl/..."
                    className="rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--vetuo-gold)]"
                  />
                  <span className="text-xs text-slate-500">
                    W MVP wpisujesz ręcznie (sitemap + podpowiedzi dołożymy później).
                  </span>
                </label>
              </div>
            </div>

            <CopyEditor
              main={copyMain}
              alts={copyAlts}
              finalCopy={finalCopy}
              onSetFinal={setFinalCopy}
              onChoose={(text) => setFinalCopy(text)}
              onRegenerate={() => generateCopy()}
              onResetToAI={() => setFinalCopy(copyMain)}
            />

            <div className="sticky bottom-3 z-20">
              <div className="rounded-2xl border bg-white p-3 shadow-lg space-y-2">
                <button
                  className="w-full rounded-xl border bg-white px-4 py-3 text-sm font-semibold"
                  onClick={() => setStep(1)}
                >
                  Wróć: Obraz
                </button>
                <button
                  className="vetuo-primary w-full rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-50"
  		  disabled={!canGoStep3}
                  onClick={() => setStep(3)}
                >
                  Dalej: Grafika
                </button>
              </div>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="mt-5 space-y-4">
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold">Podgląd grafiki 4:5</h2>
              <p className="mt-1 text-xs text-slate-500">
                Kliknij „Generuj obrazy”, a dostaniesz 4 propozycje do wyboru.
              </p>
              <div className="mt-3">
                <GraphicComposerCanvas input={composerInput} branding={branding} />
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold">Tekst na grafice</h2>
              <div className="mt-3 grid gap-3">
                <label className="grid gap-1">
                  <span className="text-xs font-semibold text-slate-700">Nagłówek</span>
                  <input
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--vetuo-gold)]"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-xs font-semibold text-slate-700">Podtytuł (opcjonalnie)</span>
                  <input
                    value={subheadline}
                    onChange={(e) => setSubheadline(e.target.value)}
                    className="rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--vetuo-gold)]"
                  />
                </label>

                <div className="rounded-xl border bg-slate-50 p-3 text-xs text-slate-600">
                  <div className="font-semibold text-slate-700">Domyślne ustawienia (OK):</div>
                  <ul className="mt-1 list-disc pl-5">
                    <li>Tekst na górze</li>
                    <li>Na grafice zawsze: <span className="font-semibold">{VETUO.site}</span></li>
                    <li>Pełny link idzie do treści posta</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold">Gotowe do publikacji</h2>
              <p className="mt-1 text-xs text-slate-500">
                Pobierz PNG i skopiuj tekst — wrzuć ręcznie na Facebooka.
              </p>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <button
                  className="rounded-xl border bg-white px-4 py-3 text-sm font-semibold"
                  onClick={() => navigator.clipboard.writeText(finalCopy)}
                >
                  Kopiuj tekst posta
                </button>

                <DownloadFromCanvasButton />
              </div>
            </div>

            <div className="sticky bottom-3 z-20">
              <div className="rounded-2xl border bg-white p-3 shadow-lg space-y-2">
                <button
                  className="w-full rounded-xl border bg-white px-4 py-3 text-sm font-semibold"
                  onClick={() => setStep(2)}
                >
                  Wróć: Tekst
                </button>
                <button
                  className="vetuo-primary w-full rounded-xl px-4 py-3 text-sm font-semibold"
                  onClick={() => {
                    localStorage.removeItem("vetuo_pg_draft_v1");
                    location.href = "/create";
                  }}
                >
                  Stwórz kolejny post
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

// Button triggers download from the composer canvas (by id).
function DownloadFromCanvasButton() {
  const onDownload = () => {
    const canvas = document.getElementById("vetuo-composer-canvas") as HTMLCanvasElement | null;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "vetuo-post-4x5.png";
    a.click();
  };

  return (
    <button
      className="vetuo-primary rounded-xl px-4 py-3 text-sm font-semibold"
      onClick={onDownload}
    >
      Pobierz grafikę (PNG)
    </button>
  );
}
