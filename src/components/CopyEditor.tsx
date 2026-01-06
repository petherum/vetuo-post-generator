"use client";

import { useState } from "react";
import PrimaryButton from "@/components/PrimaryButton";

function Card({
  title,
  text,
  onChoose,
}: {
  title: string;
  text: string;
  onChoose: () => void;
}) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold">{title}</div>
        <button
          className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold"
          onClick={onChoose}
        >
          Użyj
        </button>
      </div>
      <pre className="mt-3 whitespace-pre-wrap text-sm text-slate-800">{text}</pre>
    </div>
  );
}

export default function CopyEditor({
  main,
  alts,
  finalCopy,
  onSetFinal,
  onChoose,
  onRegenerate,
  onResetToAI,
}: {
  main: string;
  alts: string[];
  finalCopy: string;
  onSetFinal: (t: string) => void;
  onChoose: (t: string) => void;
  onRegenerate: () => void;
  onResetToAI: () => void;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Propozycje tekstu</h2>
            <p className="mt-1 text-xs text-slate-500">
              Wybierz wariant lub edytuj ręcznie (to Ty akceptujesz finalną wersję).
            </p>
          </div>
          <button
            className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold"
            onClick={onRegenerate}
          >
            Nowa propozycja
          </button>
        </div>
      </div>

      <Card title="Wariant główny" text={main} onChoose={() => onChoose(main)} />
      {alts.slice(0, 2).map((t, idx) => (
        <Card key={idx} title={`Alternatywa ${idx + 1}`} text={t} onChoose={() => onChoose(t)} />
      ))}

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold">Finalny tekst (edytowalny)</div>
          <div className="flex gap-2">
            <button
              className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold"
              onClick={() => navigator.clipboard.writeText(finalCopy)}
            >
              Kopiuj
            </button>
            <button
              className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold"
              onClick={() => {
                setEditing(false);
                onResetToAI();
              }}
            >
              Przywróć AI
            </button>
            <PrimaryButton
	  size="sm"
  	onClick={() => setEditing((v) => !v)}
	>
  	{editing ? "Podgląd" : "Edytuj"}
	</PrimaryButton>

          </div>
        </div>

        {editing ? (
          <textarea
            value={finalCopy}
            onChange={(e) => onSetFinal(e.target.value)}
            className="mt-3 h-44 w-full resize-none rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--vetuo-gold)]"
          />
        ) : (
          <pre className="mt-3 whitespace-pre-wrap text-sm text-slate-800">{finalCopy}</pre>
        )}

        <p className="mt-2 text-xs text-slate-500">
          Pamiętaj: bez porad medycznych — piszemy o funkcji wyszukiwarki Vetuo.
        </p>
      </div>
    </div>
  );
}
