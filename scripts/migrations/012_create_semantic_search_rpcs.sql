-- Migration 012: Create semantic search RPC functions for pgvector similarity search
-- Used by the AI Property Assistant RAG retrieval layer.

BEGIN;

CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- match_properties
-- Returns top-K available properties ordered by cosine similarity to the
-- provided query embedding, with optional hard filters.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.match_properties(
  query_embedding        vector(1536),
  match_count            int     DEFAULT 10,
  filter_operation_type  text    DEFAULT NULL,
  filter_category_id     bigint  DEFAULT NULL,
  filter_neighborhood_id bigint  DEFAULT NULL,
  filter_min_price       float8  DEFAULT NULL,
  filter_max_price       float8  DEFAULT NULL,
  filter_min_area        float8  DEFAULT NULL,
  filter_max_area        float8  DEFAULT NULL,
  filter_max_rooms       int     DEFAULT NULL
)
RETURNS TABLE (
  property_id     bigint,
  similarity      float8,
  price_eur       numeric,
  price_bgn       numeric,
  area_sqm        numeric,
  rooms           int,
  bedrooms        int,
  category_id     bigint,
  neighborhood_id bigint,
  operation_type  text,
  is_featured     boolean
)
LANGUAGE sql STABLE
AS $$
  SELECT
    p.id                                        AS property_id,
    1.0 - (pe.embedding <=> query_embedding)    AS similarity,
    p.price_eur,
    p.price_bgn,
    p.area_sqm,
    p.rooms,
    p.bedrooms,
    p.category_id,
    p.neighborhood_id,
    p.operation_type::text,
    p.is_featured
  FROM property_embeddings pe
  JOIN properties p ON p.id = pe.property_id
  WHERE
    p.status = 'available'
    AND pe.embedding IS NOT NULL
    AND (filter_operation_type  IS NULL OR p.operation_type::text = filter_operation_type)
    AND (filter_category_id     IS NULL OR p.category_id           = filter_category_id)
    AND (filter_neighborhood_id IS NULL OR p.neighborhood_id       = filter_neighborhood_id)
    AND (filter_min_price       IS NULL OR p.price_eur            >= filter_min_price)
    AND (filter_max_price       IS NULL OR p.price_eur            <= filter_max_price)
    AND (filter_min_area        IS NULL OR p.area_sqm             >= filter_min_area)
    AND (filter_max_area        IS NULL OR p.area_sqm             <= filter_max_area)
    AND (filter_max_rooms       IS NULL OR p.rooms                <= filter_max_rooms)
  ORDER BY pe.embedding <=> query_embedding
  LIMIT match_count;
$$;

GRANT EXECUTE ON FUNCTION public.match_properties TO anon, authenticated;

-- ============================================================================
-- match_neighborhoods
-- Returns top-K neighborhoods ordered by cosine similarity to the query
-- embedding. Used to surface relevant area context alongside property results.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.match_neighborhoods(
  query_embedding vector(1536),
  match_count     int DEFAULT 5
)
RETURNS TABLE (
  neighborhood_id bigint,
  similarity      float8,
  name_bg         text,
  slug            text
)
LANGUAGE sql STABLE
AS $$
  SELECT
    n.id                                        AS neighborhood_id,
    1.0 - (ne.embedding <=> query_embedding)    AS similarity,
    n.name_bg,
    n.slug
  FROM neighborhood_embeddings ne
  JOIN neighborhoods n ON n.id = ne.neighborhood_id
  WHERE ne.embedding IS NOT NULL
  ORDER BY ne.embedding <=> query_embedding
  LIMIT match_count;
$$;

GRANT EXECUTE ON FUNCTION public.match_neighborhoods TO anon, authenticated;

COMMIT;
