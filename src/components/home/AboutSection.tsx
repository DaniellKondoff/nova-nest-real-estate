import Link from "next/link";
import { Award, Eye, Heart, Shield, Star, TrendingUp, Users, Zap } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { Button } from "@/components/ui/button";

const values = [
  {
    icon: Shield,
    title: "Професионализъм",
    description: "Работим с най-високи стандарти и етични принципи в областта на недвижимите имоти.",
  },
  {
    icon: Users,
    title: "Личен подход",
    description: "Всеки клиент е уникален за нас и получава индивидуално внимание и грижа.",
  },
  {
    icon: Eye,
    title: "Прозрачност",
    description: "Осигуряваме пълна прозрачност в процеса и честни съвети за всяка сделка.",
  },
  {
    icon: Zap,
    title: "Иновации",
    description: "Използваме най-съвременните технологии за по-ефективно обслужване.",
  },
];

const stats = [
  { icon: Star, value: "Десетки", label: "доволни клиенти" },
  { icon: Award, value: "100%", label: "Качество" },
  { icon: TrendingUp, value: "95%", label: "Успешни сделки" },
  { icon: Heart, value: "24/7", label: "Поддръжка" },
];

/** About – server component; CSS-only reveal (content is never hidden without JS). */
export default function AboutSection() {
  return (
    <Section id="about" tone="muted" aria-labelledby="about-heading" className="scroll-mt-[var(--header-h)]">
      <SectionHeading
        id="about-heading"
        eyebrow="Водеща агенция в Стара Загора"
        title="Nova Nest Real Estate"
        description={
          <>
            Вашият доверен партньор за перфектния дом. Познаваме местния пазар в детайли и помагаме на хората да
            намерят мястото, което да наричат &bdquo;дом&ldquo; &ndash; тяхното ново гнездо.
          </>
        }
        className="reveal"
      />

      {/* Stats */}
      <dl className="reveal grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {stats.map(({ icon: Icon, value, label }) => (
          <div key={label} className="flex flex-col items-center rounded-card bg-white p-5 text-center shadow-card sm:p-6">
            <Icon className="mb-2 h-6 w-6 text-accent-dark" aria-hidden="true" />
            <dd className="text-2xl font-bold text-primary sm:text-3xl">{value}</dd>
            <dt className="order-last mt-1 text-sm text-charcoal/70">{label}</dt>
          </div>
        ))}
      </dl>

      {/* Values */}
      <ul className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {values.map(({ icon: Icon, title, description }) => (
          <li
            key={title}
            className="reveal group flex gap-4 rounded-card border border-border bg-white p-5 shadow-card transition-shadow hover:shadow-lift sm:flex-col sm:p-6"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/15 transition-colors group-hover:bg-accent sm:h-14 sm:w-14">
              <Icon className="h-6 w-6 text-accent-dark transition-colors group-hover:text-primary sm:h-7 sm:w-7" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-primary">{title}</h3>
              <p className="mt-1.5 leading-relaxed text-charcoal/75">{description}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* CTA panel */}
      <div className="reveal relative mt-10 overflow-hidden rounded-3xl bg-primary px-6 py-10 text-center text-white sm:mt-14 sm:px-12 sm:py-14">
        <div aria-hidden="true" className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative">
          <h3 className="text-h3 font-bold sm:text-3xl">Повече от посредничество</h3>
          <p className="mx-auto mt-4 max-w-3xl leading-relaxed text-white/80 sm:text-lg">
            Nova Nest е нова, но амбициозна агенция за недвижими имоти в Стара Загора, създадена с мисия да бъде
            вашият личен съветник и партньор при всяка сделка. Подхождаме индивидуално към всеки клиент, за да
            открием най-добрите възможности за вашия нов дом или инвестиция.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/properties/">Започнете търсенето</Link>
            </Button>
            <Button asChild variant="outline-light" size="lg" className="w-full sm:w-auto">
              <a href="#contact">Свържете се с нас</a>
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
