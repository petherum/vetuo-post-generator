"use client";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function AnimalCounter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border p-3">
      <div className="text-sm font-semibold">{label}</div>
      <div className="flex items-center gap-2">
        <button
          className="h-9 w-9 rounded-lg border bg-white text-lg"
          onClick={() => onChange(clamp(value - 1, 0, 6))}
          aria-label="Minus"
        >
          −
        </button>
        <div className="w-8 text-center text-sm font-semibold">{value}</div>
        <button
          className="h-9 w-9 rounded-lg border bg-white text-lg"
          onClick={() => onChange(clamp(value + 1, 0, 6))}
          aria-label="Plus"
        >
          +
        </button>
      </div>
    </div>
  );
}
