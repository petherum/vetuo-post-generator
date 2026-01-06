"use client";

import { useMemo, useState } from "react";

export type SuggestItem = { label: string; value: string };

export default function SuggestInput({
  title,
  value,
  onChange,
  suggestions,
  placeholder,
}: {
  title: string;
  value: string;
  onChange: (v: string) => void;
  suggestions: SuggestItem[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [seed, setSeed] = useState(0);

  const rotated = useMemo(() => {
    const copy = [...suggestions];
    if (copy.length === 0) return copy;
    const shift = seed % copy.length;
    return [...copy.slice(shift), ...copy.slice(0, shift)];
  }, [suggestions, seed]);

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="mt-1 text-xs text-slate-500">
            Możesz wpisać własny opis lub skorzystać z podpowiedzi.
          </p>
        </div>
        <button
          className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Ukryj" : "Podpowiedzi"}
        </button>
      </div>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-3 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--vetuo-gold)]"
      />

      <div className="mt-3 flex gap-2">
        <button
          className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold"
          onClick={() => {
            setOpen(true);
            onChange(rotated[0]?.value ?? "");
          }}
        >
          Podpowiedz
        </button>
        <button
          className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold"
          onClick={() => {
            setOpen(true);
            setSeed((s) => s + 1);
            // pick the next suggestion after rotating
            const next = suggestions[(seed + 1) % suggestions.length];
            if (next) onChange(next.value);
          }}
        >
          Losuj inne
        </button>
      </div>

      {open && (
        <div className="mt-3 grid gap-2">
          {rotated.slice(0, 8).map((s) => (
            <button
              key={s.value}
              onClick={() => onChange(s.value)}
              className="rounded-xl border bg-white px-3 py-2 text-left text-sm hover:bg-slate-50"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
