"use client";

export default function Stepper({
  current,
  steps,
  onGo,
}: {
  current: number;
  steps: { id: number; title: string }[];
  onGo: (id: number) => void;
}) {
  return (
    <div className="rounded-2xl border bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        {steps.map((s, idx) => {
          const active = s.id === current;
          const done = s.id < current;
          return (
            <button
              key={s.id}
              onClick={() => onGo(s.id)}
              className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2 text-left"
              aria-current={active ? "step" : undefined}
            >
              <div
                className={[
                  "grid h-7 w-7 place-items-center rounded-lg text-xs font-bold",
                  active
                    ? "bg-[color:var(--vetuo-navy)] text-white"
                    : done
                    ? "bg-[color:var(--vetuo-gold)] text-slate-900"
                    : "bg-slate-100 text-slate-700",
                ].join(" ")}
              >
                {idx + 1}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{s.title}</div>
                <div className="text-xs text-slate-500">{active ? "aktualnie" : done ? "gotowe" : "kolejny"}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
