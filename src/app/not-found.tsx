export default function NotFound() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-20 text-center">
      <h1 className="text-3xl font-medium text-brand">Страницата не е намерена</h1>
      <p className="mt-3 text-foreground/70">Моля, върнете се към началната страница.</p>
      <a href="/" className="inline-block mt-6 text-accent border-b border-accent/40">Начало</a>
    </main>
  );
}


