/**
 * ItemList structured data for listing pages: tells search engines which detail pages the list contains
 */
export function ItemListSchema({ name, urls }: { name: string; urls: string[] }) {
  if (urls.length === 0) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: urls.length,
    itemListElement: urls.map((url, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 0)
      }}
    />
  );
}
