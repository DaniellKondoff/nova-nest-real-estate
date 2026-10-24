import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLandingData } from "@/lib/queries/landing-data";
import { searchPropertyListings } from "@/lib/queries/property-listings";
import { generateMetadata as buildMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbs } from "@/lib/seo/breadcrumb-helpers";
import {
  OPERATION_LANDINGS,
  computeListingStats,
  filterListings,
  listingCountLabel,
  neighborhoodCategoryPath,
  neighborhoodPath,
  operationCategoryPath,
  operationPath,
  type LandingCategory,
  type OperationType,
} from "@/lib/seo/landing";
import { statsFacts, statsSentence } from "@/lib/seo/landing-content";
import { buildPropertiesHref } from "@/lib/search/params";
import LandingPage, { type LandingLinkGroup } from "@/components/property/listing/LandingPage";

/** Listings shown on a landing page; bigger sets link to the filterable /properties/ page */
export const LANDING_LIMIT = 24;

type Params = Promise<{ category?: string[] }>;

/**
 * Route factory for /imoti-za-prodazhba/[[...category]] and /imoti-pod-naem/[[...category]].
 * Unknown categories and empty category pages are 404s; the empty operation root is noindex.
 */
export function operationLanding(operation: OperationType) {
  const op = OPERATION_LANDINGS[operation];
  const isRent = operation === "rent";

  async function resolve(params: Params) {
    const { category: segments } = await params;
    if (segments && segments.length > 1) notFound();

    const data = await getLandingData();
    let category: LandingCategory | undefined;
    if (segments?.[0]) {
      category = data.categories.find((c) => c.slug === segments[0]);
      if (!category) notFound();
    }

    const scoped = filterListings(data.listings, { operationType: operation, categoryId: category?.id });
    if (category && scoped.length === 0) notFound();

    const h1 = category ? `${category.plural} ${op.label} в Стара Загора` : `${op.title} в Стара Загора`;
    const path = category ? operationCategoryPath(operation, category) : operationPath(operation);
    return { data, category, scoped, stats: computeListingStats(scoped), h1, path };
  }

  async function generateStaticParams(): Promise<Array<{ category?: string[] }>> {
    const { categories, listings } = await getLandingData();
    return [
      { category: undefined },
      ...categories
        .filter((c) => filterListings(listings, { operationType: operation, categoryId: c.id }).length > 0)
        .map((c) => ({ category: [c.slug] })),
    ];
  }

  async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { category, stats, h1, path } = await resolve(params);
    const what = category ? category.plural.toLowerCase() : "апартаменти, къщи, офиси и парцели";
    return buildMetadata({
      title: stats.count > 0 ? `${h1} – ${listingCountLabel(stats.count)}` : h1,
      description: `${h1}: ${what} ${op.label} със снимки, цени и описание. ${statsSentence(stats, isRent)} Консултация и оглед с Nova Nest.`,
      path,
      noIndex: stats.count === 0,
    });
  }

  async function Page({ params }: { params: Params }) {
    const { data, category, scoped, stats, h1 } = await resolve(params);
    const filters = { operationType: operation, categoryId: category?.id };
    const result = await searchPropertyListings(filters, 1, LANDING_LIMIT);

    const breadcrumbs = buildBreadcrumbs([
      { name: "Начало", path: "/" },
      { name: op.title, path: operationPath(operation) },
      ...(category ? [{ name: category.plural, path: operationCategoryPath(operation, category) }] : []),
    ]);

    const neighborhoodLinks = data.neighborhoods
      .map((n) => ({ n, count: filterListings(scoped, { neighborhoodId: n.id }).length }))
      .filter(({ count }) => count > 0)
      .sort((a, b) => b.count - a.count)
      .map(({ n, count }) => ({
        href: category ? neighborhoodCategoryPath(n, category) : neighborhoodPath(n),
        label: category ? `${category.plural} в ${n.name_bg}` : `Имоти в ${n.name_bg}`,
        count,
      }));

    const categoryLinks = data.categories
      .filter((c) => c.id !== category?.id)
      .map((c) => ({ c, count: filterListings(data.listings, { operationType: operation, categoryId: c.id }).length }))
      .filter(({ count }) => count > 0)
      .map(({ c, count }) => ({ href: operationCategoryPath(operation, c), label: `${c.plural} ${op.label}`, count }));

    const linkGroups: LandingLinkGroup[] = [
      { title: category ? `${category.plural} ${op.label} по квартали` : `${op.title} по квартали`, links: neighborhoodLinks },
      { title: category ? `Други имоти ${op.label}` : "По вид имот", links: categoryLinks },
    ];

    const what = category ? category.plural.toLowerCase() : "имоти";
    const intro = [
      `Разгледайте актуалните ${what} ${op.label} в Стара Загора и околността, публикувани от Nova Nest.`,
      statsSentence(stats, isRent),
      isRent
        ? "Помагаме с огледите, договора за наем и комуникацията със собственика."
        : "Съдействаме с огледите, проверката на документите, финансирането и сделката при нотариус.",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <LandingPage
        h1={h1}
        intro={intro}
        breadcrumbs={breadcrumbs}
        facts={statsFacts(stats, isRent)}
        properties={result.properties}
        total={result.total}
        allHref={buildPropertiesHref(filters)}
        linkGroups={linkGroups}
        emptyTitle={`В момента няма ${what} ${op.label}`}
        emptyDescription="Оставете запитване и ще ви уведомим първи, когато се появи подходящ имот."
      />
    );
  }

  return { generateStaticParams, generateMetadata, Page };
}
