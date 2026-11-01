import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLandingData } from "@/lib/queries/landing-data";
import { searchPropertyListings } from "@/lib/queries/property-listings";
import { generateMetadata as buildMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbs } from "@/lib/seo/breadcrumb-helpers";
import {
  OPERATION_LANDINGS,
  ROOM_LANDINGS,
  computeListingStats,
  filterListings,
  findApartmentCategory,
  isApartmentCategory,
  listingCountLabel,
  neighborhoodCategoryPath,
  neighborhoodPath,
  neighborhoodRoomsPath,
  operationCategoryPath,
  operationPath,
  operationRoomsPath,
  roomLandingBySlug,
  roomLandingsFor,
  type LandingCategory,
  type OperationType,
  type RoomCount,
} from "@/lib/seo/landing";
import { areaRangeSentence, roomTiles, statsFacts, statsSentence } from "@/lib/seo/landing-content";
import { buildPropertiesHref } from "@/lib/search/params";
import LandingPage, { type LandingLink, type LandingLinkGroup } from "@/components/property/listing/LandingPage";
import RoomTypeNav from "@/components/property/listing/RoomTypeNav";

/** Listings shown on a landing page; bigger sets link to the filterable /properties/ page */
export const LANDING_LIMIT = 24;

type Params = Promise<{ category?: string[] }>;

/**
 * Route factory for /imoti-za-prodazhba/[[...category]] and /imoti-pod-naem/[[...category]].
 * The segment is a category ("apartamenti") or an apartment rooms page ("dvustaini-apartamenti").
 * Unknown segments and empty category/rooms pages are 404s; the empty operation root is noindex.
 */
export function operationLanding(operation: OperationType) {
  const op = OPERATION_LANDINGS[operation];
  const isRent = operation === "rent";

  async function resolve(params: Params) {
    const { category: segments } = await params;
    if (segments && segments.length > 1) notFound();

    const data = await getLandingData();
    let category: LandingCategory | undefined;
    let room: RoomCount | undefined;
    if (segments?.[0]) {
      room = roomLandingBySlug(segments[0]);
      category = room ? findApartmentCategory(data.categories) : data.categories.find((c) => c.slug === segments[0]);
      if (!category) notFound();
    }

    const scoped = filterListings(data.listings, { operationType: operation, categoryId: category?.id, rooms: room });
    if (category && scoped.length === 0) notFound();

    const what = room ? ROOM_LANDINGS[room].plural : category?.plural;
    const h1 = what ? `${what} ${op.label} в Стара Загора` : `${op.title} в Стара Загора`;
    const path = room ? operationRoomsPath(operation, room) : category ? operationCategoryPath(operation, category) : operationPath(operation);
    return { data, category, room, scoped, stats: computeListingStats(scoped), h1, path };
  }

  async function generateStaticParams(): Promise<Array<{ category?: string[] }>> {
    const { categories, listings } = await getLandingData();
    const apartments = findApartmentCategory(categories);
    return [
      { category: undefined },
      ...categories
        .filter((c) => filterListings(listings, { operationType: operation, categoryId: c.id }).length > 0)
        .map((c) => ({ category: [c.slug] })),
      ...(apartments
        ? roomLandingsFor(listings, { operationType: operation }, apartments.id).map((r) => ({ category: [ROOM_LANDINGS[r.room].slug] }))
        : []),
    ];
  }

  async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { category, room, stats, h1, path } = await resolve(params);
    const what = room
      ? ROOM_LANDINGS[room].plural.toLowerCase()
      : category
        ? category.plural.toLowerCase()
        : "апартаменти, къщи, офиси и парцели";
    return buildMetadata({
      title: stats.count > 0 ? `${h1} – ${listingCountLabel(stats.count)}` : h1,
      description: `${h1}: ${what} ${op.label} със снимки, цени и описание. ${statsSentence(stats, isRent)} Консултация и оглед с Nova Nest.`,
      path,
      noIndex: stats.count === 0,
    });
  }

  async function Page({ params }: { params: Params }) {
    const { data, category, room, scoped, stats, h1 } = await resolve(params);
    const filters = { operationType: operation, categoryId: category?.id, rooms: room ? [room] : undefined };
    const result = await searchPropertyListings(filters, 1, LANDING_LIMIT);

    const breadcrumbs = buildBreadcrumbs([
      { name: "Начало", path: "/" },
      { name: op.title, path: operationPath(operation) },
      ...(category ? [{ name: category.plural, path: operationCategoryPath(operation, category) }] : []),
      ...(room ? [{ name: ROOM_LANDINGS[room].short, path: operationRoomsPath(operation, room) }] : []),
    ]);

    // Apartment pages: navigation by room count ("Всички · Двустайни · Тристайни …")
    const isApartments = isApartmentCategory(category);
    const roomPages = isApartments ? roomLandingsFor(data.listings, { operationType: operation }, category!.id) : [];
    const quickNav = isApartments ? (
      <RoomTypeNav
        label={`Апартаменти ${op.label} по брой стаи`}
        tiles={roomTiles(
          roomPages,
          {
            href: operationCategoryPath(operation, category!),
            listings: filterListings(data.listings, { operationType: operation, categoryId: category!.id }),
          },
          (r) => operationRoomsPath(operation, r),
          room
        )}
      />
    ) : undefined;

    const neighborhoodLinks: LandingLink[] = data.neighborhoods
      .map((n) => ({ n, count: filterListings(scoped, { neighborhoodId: n.id }).length }))
      .filter(({ count }) => count > 0)
      .sort((a, b) => b.count - a.count)
      .map(({ n, count }) => {
        // Rooms pages link to the matching neighborhood rooms page when it exists, else to its apartments page
        if (room && category) {
          const hasRoomsPage = roomLandingsFor(data.listings, { neighborhoodId: n.id }, category.id).some((r) => r.room === room);
          return hasRoomsPage
            ? { href: neighborhoodRoomsPath(n, room), label: `${ROOM_LANDINGS[room].plural} в ${n.name_bg}`, count }
            : { href: neighborhoodCategoryPath(n, category), label: `${category.plural} в ${n.name_bg}`, count };
        }
        return {
          href: category ? neighborhoodCategoryPath(n, category) : neighborhoodPath(n),
          label: category ? `${category.plural} в ${n.name_bg}` : `Имоти в ${n.name_bg}`,
          count,
        };
      });

    const categoryLinks: LandingLink[] = data.categories
      .filter((c) => c.id !== category?.id || room != null)
      .map((c) => ({ c, count: filterListings(data.listings, { operationType: operation, categoryId: c.id }).length }))
      .filter(({ count }) => count > 0)
      .map(({ c, count }) => ({ href: operationCategoryPath(operation, c), label: `${c.plural} ${op.label}`, count }));

    const scopeLabel = room ? ROOM_LANDINGS[room].plural : category?.plural;
    const linkGroups: LandingLinkGroup[] = [
      { title: scopeLabel ? `${scopeLabel} ${op.label} по квартали` : `${op.title} по квартали`, links: neighborhoodLinks },
      { title: category ? `Други имоти ${op.label}` : "По вид имот", links: categoryLinks },
    ];

    const what = room ? ROOM_LANDINGS[room].plural.toLowerCase() : category ? category.plural.toLowerCase() : "имоти";
    const intro = [
      `Разгледайте актуалните ${what} ${op.label} в Стара Загора и околността, публикувани от Nova Nest.`,
      statsSentence(stats, isRent),
      room ? areaRangeSentence(scoped) : "",
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
        quickNav={quickNav}
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
