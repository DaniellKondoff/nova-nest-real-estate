export function Header() {
  return (
    <header className="w-full border-b border-foreground/10">
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
        <div className="text-brand font-medium">Nova Nest</div>
        <nav className="hidden md:flex gap-6 text-sm text-foreground/80">
          <a href="/" className="hover:text-foreground">Начало</a>
          <a href="/imoti" className="hover:text-foreground">Имоти</a>
          <a href="/za-nas" className="hover:text-foreground">За нас</a>
          <a href="/kontakt" className="hover:text-foreground">Контакт</a>
        </nav>
      </div>
    </header>
  );
}


