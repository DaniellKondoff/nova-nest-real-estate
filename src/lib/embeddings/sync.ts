import crypto from "crypto";
import { getServiceClient } from "@/lib/supabase/service";
import { generateEmbedding, EMBEDDING_MODEL } from "./openai";
import { buildPropertyEmbeddingText, buildNeighborhoodEmbeddingText } from "./text-builders";

export type SyncResult = {
  synced: number;
  skipped: number;
  errors: number;
};

function hashText(text: string): string {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

// ============================================================================
// Property Embeddings
// ============================================================================

export async function syncPropertyEmbedding(propertyId: number): Promise<void> {
  const supabase = getServiceClient();

  // Fetch property with category and neighborhood names
  const { data: property, error: fetchError } = await supabase
    .from("properties")
    .select(`
      *,
      property_categories ( name_bg ),
      neighborhoods ( name_bg )
    `)
    .eq("id", propertyId)
    .single();

  if (fetchError || !property) {
    throw new Error(`Failed to fetch property ${propertyId}: ${fetchError?.message}`);
  }

  const categoryName =
    (property.property_categories as { name_bg: string } | null)?.name_bg ?? "";
  const neighborhoodName =
    (property.neighborhoods as { name_bg: string } | null)?.name_bg ?? "";

  const text = buildPropertyEmbeddingText(property, categoryName, neighborhoodName);
  if (!text) return;

  const contentHash = hashText(text);

  // Check if embedding is already up to date
  const { data: existing } = await supabase
    .from("property_embeddings")
    .select("content_hash")
    .eq("property_id", propertyId)
    .maybeSingle();

  if (existing?.content_hash === contentHash) return;

  const vector = await generateEmbedding(text);

  const { error: upsertError } = await supabase
    .from("property_embeddings")
    .upsert(
      {
        property_id: propertyId,
        embedding: JSON.stringify(vector) as unknown as string,
        embedding_model: EMBEDDING_MODEL,
        content_hash: contentHash,
        source_language: "bg",
      },
      { onConflict: "property_id" }
    );

  if (upsertError) {
    throw new Error(`Failed to upsert embedding for property ${propertyId}: ${upsertError.message}`);
  }
}

export async function syncAllPropertyEmbeddings(batchSize = 50): Promise<SyncResult> {
  const supabase = getServiceClient();
  const result: SyncResult = { synced: 0, skipped: 0, errors: 0 };

  const { data: rows, error } = await supabase
    .from("properties")
    .select("id")
    .not("status", "eq", "archived");

  if (error || !rows) {
    throw new Error(`Failed to fetch property ids: ${error?.message}`);
  }

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);

    await Promise.allSettled(
      batch.map(async ({ id }) => {
        try {
          // Check for existing hash before calling generateEmbedding
          const { data: existing } = await supabase
            .from("property_embeddings")
            .select("content_hash")
            .eq("property_id", id)
            .maybeSingle();

          await syncPropertyEmbedding(id);

          // Determine if we skipped (hash check is inside syncPropertyEmbedding, so we re-check here)
          const { data: after } = await supabase
            .from("property_embeddings")
            .select("content_hash")
            .eq("property_id", id)
            .maybeSingle();

          if (existing?.content_hash === after?.content_hash && existing?.content_hash != null) {
            result.skipped++;
          } else {
            result.synced++;
          }
        } catch (err) {
          console.error(`Error syncing property ${id}:`, err);
          result.errors++;
        }
      })
    );

    // Small delay between batches to avoid hitting OpenAI rate limits
    if (i + batchSize < rows.length) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  return result;
}

// ============================================================================
// Neighborhood Embeddings
// ============================================================================

export async function syncNeighborhoodEmbedding(neighborhoodId: number): Promise<void> {
  const supabase = getServiceClient();

  const { data: neighborhood, error: fetchError } = await supabase
    .from("neighborhoods")
    .select("*")
    .eq("id", neighborhoodId)
    .single();

  if (fetchError || !neighborhood) {
    throw new Error(`Failed to fetch neighborhood ${neighborhoodId}: ${fetchError?.message}`);
  }

  const text = buildNeighborhoodEmbeddingText(neighborhood);
  if (!text) return;

  const contentHash = hashText(text);

  const { data: existing } = await supabase
    .from("neighborhood_embeddings")
    .select("content_hash")
    .eq("neighborhood_id", neighborhoodId)
    .maybeSingle();

  if (existing?.content_hash === contentHash) return;

  const vector = await generateEmbedding(text);

  const { error: upsertError } = await supabase
    .from("neighborhood_embeddings")
    .upsert(
      {
        neighborhood_id: neighborhoodId,
        embedding: JSON.stringify(vector) as unknown as string,
        embedding_model: EMBEDDING_MODEL,
        content_hash: contentHash,
        source_language: "bg",
      },
      { onConflict: "neighborhood_id" }
    );

  if (upsertError) {
    throw new Error(
      `Failed to upsert embedding for neighborhood ${neighborhoodId}: ${upsertError.message}`
    );
  }
}

export async function syncAllNeighborhoodEmbeddings(batchSize = 50): Promise<SyncResult> {
  const supabase = getServiceClient();
  const result: SyncResult = { synced: 0, skipped: 0, errors: 0 };

  const { data: rows, error } = await supabase.from("neighborhoods").select("id");

  if (error || !rows) {
    throw new Error(`Failed to fetch neighborhood ids: ${error?.message}`);
  }

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);

    await Promise.allSettled(
      batch.map(async ({ id }) => {
        try {
          const { data: existing } = await supabase
            .from("neighborhood_embeddings")
            .select("content_hash")
            .eq("neighborhood_id", id)
            .maybeSingle();

          await syncNeighborhoodEmbedding(id);

          const { data: after } = await supabase
            .from("neighborhood_embeddings")
            .select("content_hash")
            .eq("neighborhood_id", id)
            .maybeSingle();

          if (existing?.content_hash === after?.content_hash && existing?.content_hash != null) {
            result.skipped++;
          } else {
            result.synced++;
          }
        } catch (err) {
          console.error(`Error syncing neighborhood ${id}:`, err);
          result.errors++;
        }
      })
    );

    if (i + batchSize < rows.length) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  return result;
}
