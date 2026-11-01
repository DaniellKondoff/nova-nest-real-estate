import type { Metadata } from "next";
import Link from "next/link";
import { generateMetadata as buildMetadata } from "@/lib/seo/metadata";
import { getPrivacyBreadcrumbs } from "@/lib/seo/breadcrumb-helpers";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { containerClass } from "@/components/ui/section";
import { site } from "@/config/site";

const PATH = site.legal.privacyPolicyPath;

export const metadata: Metadata = buildMetadata({
  title: "Политика за поверителност",
  description: `Как ${site.legal.companyName} (Nova Nest) обработва и защитава личните данни, които ни изпращате чрез формите за запитване, чата и сайта.`,
  path: PATH,
});

const updated = new Date(site.legal.privacyPolicyUpdated).toLocaleDateString("bg-BG", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const h2 = "mt-10 text-xl font-bold text-primary sm:text-2xl";
const p = "mt-3";
const list = "mt-3 list-disc space-y-2 pl-5";
const link = "font-medium text-primary underline decoration-accent underline-offset-4";

/** GDPR Art. 13 information for visitors. Controller data comes from site.legal (src/config/site.ts). */
export default function PrivacyPolicyPage() {
  const breadcrumbs = getPrivacyBreadcrumbs(PATH);
  const { legal, contact } = site;

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <div className={containerClass}>
        <article className="mx-auto max-w-prose py-8 text-base leading-7 text-charcoal sm:py-12">
          <Breadcrumbs items={breadcrumbs} className="mb-4" />
          <h1 className="text-h2 font-bold text-primary">Политика за поверителност</h1>
          <p className="mt-2 text-sm text-charcoal/75">Последна актуализация: {updated}</p>

          <p className="mt-6">
            Тази политика обяснява какви лични данни събираме, когато използвате сайта {site.url.replace("https://", "")},
            защо го правим, колко дълго ги пазим и какви са правата ви съгласно Регламент (ЕС) 2016/679 (GDPR) и Закона за
            защита на личните данни.
          </p>

          <h2 className={h2}>1. Кой обработва данните ви</h2>
          <p className={p}>Администратор на личните данни е:</p>
          <ul className={list}>
            <li>
              <strong>{legal.companyName}</strong>
              {legal.eik ? `, ЕИК ${legal.eik}` : ""}
            </li>
            <li>Адрес: {contact.address}</li>
            <li>
              Имейл за въпроси относно личните данни:{" "}
              <a href={`mailto:${legal.privacyEmail}`} className={link}>
                {legal.privacyEmail}
              </a>
            </li>
            <li>
              Телефон:{" "}
              <a href={`tel:${contact.phone}`} className={link}>
                {contact.phoneDisplay}
              </a>
            </li>
          </ul>

          <h2 className={h2}>2. Какви данни събираме и защо</h2>
          <ul className={list}>
            <li>
              <strong>Форми за запитване и контакт</strong> – име, телефон и/или имейл, съобщението ви и имота, за който
              питате. Използваме ги само за да отговорим на запитването, да уговорим оглед и да ви предложим подходящи
              имоти.
            </li>
            <li>
              <strong>AI асистент (чат)</strong> – текстът, който въвеждате. Той се изпраща на доставчика на AI модела, за
              да бъде генериран отговор, и не се съхранява в нашата база данни. Моля, не въвеждайте лични данни в чата.
            </li>
            <li>
              <strong>Технически данни</strong> – IP адрес и данни за браузъра, които сървърът получава при всяко посещение.
              За защита от злоупотреби и спам пазим само необратимо хеширана (анонимизирана) форма на IP адреса.
            </li>
            <li>
              <strong>Статистика за посещенията</strong> – обобщени данни за прегледите на страниците (без бисквитки и без
              проследяване на отделни посетители), които ни помагат да подобряваме сайта.
            </li>
          </ul>
          <p className={p}>Не продаваме данните ви и не ги използваме за реклама.</p>

          <h2 className={h2}>3. Правно основание</h2>
          <ul className={list}>
            <li>
              Отговор на запитване и уговаряне на оглед – предприемане на стъпки по ваше искане преди сключване на договор
              (чл. 6, ал. 1, буква „б“ от GDPR).
            </li>
            <li>
              Защита на сайта от спам и злоупотреби, статистика за посещенията – наш легитимен интерес (чл. 6, ал. 1, буква
              „е“ от GDPR).
            </li>
          </ul>

          <h2 className={h2}>4. С кого споделяме данните</h2>
          <p className={p}>
            Данните се обработват от доставчици, които ни предоставят техническите услуги за работата на сайта, само по
            наше указание и само доколкото е необходимо:
          </p>
          <ul className={list}>
            <li>Supabase – база данни, в която се съхраняват запитванията;</li>
            <li>Vercel – хостинг на сайта и обобщена статистика за посещенията;</li>
            <li>Resend – изпращане на имейл известие до нас при ново запитване;</li>
            <li>Anthropic – AI модел, който генерира отговорите в чата.</li>
          </ul>
          <p className={p}>
            Някои от тези доставчици може да обработват данни извън Европейския съюз (например в САЩ). В тези случаи
            предаването се извършва въз основа на Рамката за защита на данните между ЕС и САЩ или на стандартни договорни
            клаузи, одобрени от Европейската комисия.
          </p>

          <h2 className={h2}>5. Колко дълго пазим данните</h2>
          <ul className={list}>
            <li>
              Запитвания – до {legal.inquiryRetentionMonths} месеца от последния ни контакт с вас, след което ги изтриваме,
              освен ако между нас не бъде сключен договор (тогава данните се пазят според законовите срокове).
            </li>
            <li>Хеширани IP адреси за защита от злоупотреби – до 2 дни.</li>
            <li>Съобщенията в чата не се съхраняват от нас.</li>
          </ul>

          <h2 className={h2}>6. Вашите права</h2>
          <p className={p}>По всяко време имате право да:</p>
          <ul className={list}>
            <li>получите достъп до данните, които пазим за вас;</li>
            <li>поискате коригиране на неточни данни;</li>
            <li>поискате изтриване на данните си;</li>
            <li>поискате ограничаване на обработването;</li>
            <li>възразите срещу обработване, основано на легитимен интерес;</li>
            <li>получите данните си в структуриран, машинночетим формат (преносимост).</li>
          </ul>
          <p className={p}>
            За да упражните правата си, пишете ни на{" "}
            <a href={`mailto:${legal.privacyEmail}`} className={link}>
              {legal.privacyEmail}
            </a>
            . Ще отговорим в срок до един месец.
          </p>
          <p className={p}>
            Имате право да подадете жалба до Комисията за защита на личните данни (КЗЛД), гр. София 1592, бул. „Проф.
            Цветан Лазаров“ № 2,{" "}
            <a href="https://www.cpdp.bg/" className={link} rel="noopener noreferrer" target="_blank">
              www.cpdp.bg
            </a>
            .
          </p>

          <h2 className={h2}>7. Бисквитки</h2>
          <p className={p}>
            Публичната част на сайта не използва бисквитки за проследяване или реклама. Статистиката за посещенията се
            събира без бисквитки. Технически бисквитки се използват само във вътрешния административен панел за вход на
            служителите.
          </p>
          <p className={p}>
            Картата на страницата{" "}
            <Link href={site.pages.contact} className={link}>
              Контакти
            </Link>{" "}
            се зарежда от Google Maps едва след като натиснете „Покажи картата“. След това Google може да постави свои
            бисквитки съгласно{" "}
            <a href="https://policies.google.com/privacy" className={link} target="_blank" rel="noopener noreferrer">
              политиката си за поверителност
            </a>
            .
          </p>

          <h2 className={h2}>8. Промени в политиката</h2>
          <p className={p}>
            Можем да актуализираме тази политика, когато променим начина, по който работим с данни. Датата на последната
            актуализация е посочена в началото на страницата.
          </p>

          <p className="mt-10">
            <Link href="/" className={link}>
              Към началната страница
            </Link>
          </p>
        </article>
      </div>
    </>
  );
}
