export default function Home() {
  return (
    <main className="min-h-dvh px-6 py-16 md:px-10">
      <section className="mx-auto max-w-5xl">
        <h1 className="font-sans text-3xl md:text-4xl font-medium text-brand tracking-tight">
          Nova Nest — Недвижими имоти в Стара Загора
        </h1>
        <p className="mt-4 text-balance text-[15px] md:text-base text-foreground/80">
          Модерна минималистична агенция за продажби и наеми. Фокус върху местния пазар,
          качествено обслужване и прозрачност.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#imoti"
            className="inline-flex items-center rounded-md border border-brand/20 bg-brand px-4 py-2 text-white transition-colors hover:bg-brand/90"
          >
            Разгледай имоти
          </a>
          <a
            href="#kontakt"
            className="inline-flex items-center rounded-md border border-accent/30 text-accent px-4 py-2 hover:bg-accent/10"
          >
            Свържи се с нас
          </a>
        </div>
      </section>
    </main>
  );
}
