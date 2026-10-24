/**
 * Shared select clause for property listing cards (client-safe, no server imports).
 */

/** Columns needed by property cards and the admin CRM picker – no SELECT * */
const LISTING_COLUMNS = [
  "id",
  "slug",
  "title_bg",
  "price_eur",
  "price_bgn",
  "operation_type",
  "status",
  "area_sqm",
  "rooms",
  "bedrooms",
  "bathrooms",
  "floor",
  "total_floors",
  "is_new",
  "is_featured",
  "og_image",
  "neighborhood_id",
  "category_id",
  "created_at",
].join(",");

export const LISTING_SELECT = `${LISTING_COLUMNS}, neighborhood:neighborhood_id(id,name_bg,slug), category:property_categories(id,name_bg,slug), images:property_images(id,url,is_primary,sort_order,alt_text_bg,width,height)`;
