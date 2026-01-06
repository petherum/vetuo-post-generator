import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-dvh">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-[color:var(--vetuo-navy)]" />
            <div className="leading-tight">
              <div className="text-sm font-semibold">Vetuo</div>
              <div className="text-xs text-slate-500">Post Generator</div>
            </div>
          </div>
          <Link
            href="/create"
            className="vetuo-primary rounded-xl px-4 py-2 text-sm font-semibold shadow-sm"
           >
            Zaczynamy
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">
          Stwórz post na Facebooka w 3 krokach
        </h1>
        <p className="mt-2 text-slate-600">
          Grafika 4:5 + tekst, gotowe do ręcznego wrzucenia na FB. Mobile-first, spójny branding Vetuo.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold">1) Obraz</div>
            <div className="mt-1 text-sm text-slate-600">
              Wybierz zwierzęta, tło i nastrój (lub podpowiedzi).
            </div>
          </div>
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold">2) Tekst posta</div>
            <div className="mt-1 text-sm text-slate-600">
              Propozycja + pełna edycja manualna.
            </div>
          </div>
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold">3) Grafika</div>
            <div className="mt-1 text-sm text-slate-600">
              Skład 4:5 z logo (prawy-dół), adresem i eksport PNG.
            </div>
          </div>
        </div>

        <div className="mt-10 flex gap-3">
          <Link
            href="/create"
            className="vetuo-primary rounded-xl px-5 py-3 text-sm font-semibold shadow-sm"
           >
            Stwórz post
          </Link>
          <a
            href="https://vetuo.pl"
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm"
          >
            Otwórz vetuo.pl
          </a>
        </div>
      </section>
    </main>
  );
}
