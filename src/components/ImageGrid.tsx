"use client";

export type MockImage = { id: string; url: string; alt?: string };

export default function ImageGrid({
  images,
  selectedId,
  onSelect,
}: {
  images: MockImage[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {images.map((img) => {
        const selected = img.id === selectedId;
        return (
          <button
            key={img.id}
            onClick={() => onSelect(img.id)}
            className={[
              "group relative overflow-hidden rounded-2xl border shadow-sm",
              selected ? "ring-2 ring-[color:var(--vetuo-gold)]" : "",
            ].join(" ")}
            aria-pressed={selected}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={img.alt ?? "mock image"}
              className="aspect-[4/5] w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2">
              <span className="rounded-lg bg-white/90 px-2 py-1 text-xs font-semibold">
                {selected ? "Wybrano" : "Wybierz"}
              </span>
              <span className="rounded-lg bg-[color:var(--vetuo-navy)]/90 px-2 py-1 text-xs font-semibold text-white">
                4:5
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
