/**
 * Read-only audit of property images stored in the Supabase Storage `property-images`
 * bucket. Flags every file above a size threshold so oversized images can be identified
 * before any recompression work begins.
 *
 * Usage:
 *   npx tsx scripts/audit-image-sizes.ts [thresholdKB]
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL to be set in the
 * environment. Load them from .env.local via Node's built-in flag, e.g.:
 *   node --env-file=.env.local --import tsx scripts/audit-image-sizes.ts
 *
 * This script performs ZERO writes: no Storage upload/remove/update, no DB
 * INSERT/UPDATE/DELETE. It only reads via storage.list() and SELECT queries.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const BUCKET = "property-images";
const DEFAULT_THRESHOLD_BYTES = 300 * 1024; // 300KB
const LIST_PAGE_SIZE = 1000;
const OUTPUT_DIR = join(process.cwd(), "scripts", "output");

interface StorageFileEntry {
  /** Full path within the bucket, e.g. "42/167233-abc123.webp" */
  path: string;
  sizeBytes: number;
}

interface PropertyContext {
  propertyId: number | null;
  isPrimary: boolean | null;
  propertyStatus: string | null;
}

interface FlaggedFile extends StorageFileEntry, PropertyContext {
  excessBytes: number;
}

interface AuditReport {
  generatedAt: string;
  thresholdBytes: number;
  totalFilesScanned: number;
  totalFlagged: number;
  totalExcessBytes: number;
  flaggedFiles: FlaggedFile[];
}

/**
 * Builds a Supabase client authenticated with the service-role key.
 * Never expose this key to the browser; this script is server/CLI-only.
 */
function createServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable.");
  }
  if (!serviceKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable (server-only, never NEXT_PUBLIC_).");
  }

  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

/**
 * Recursively lists every file in the bucket, fully paginating each folder and
 * descending into subfolders (property images are stored under `${propertyId}/...`).
 * Read-only: uses storage.list() exclusively.
 */
async function listAllStorageFiles(supabase: SupabaseClient, folder = ""): Promise<StorageFileEntry[]> {
  const files: StorageFileEntry[] = [];
  let offset = 0;

  for (;;) {
    const { data, error } = await supabase.storage.from(BUCKET).list(folder, {
      limit: LIST_PAGE_SIZE,
      offset,
      sortBy: { column: "name", order: "asc" },
    });

    if (error) {
      throw new Error(`Storage list() failed for folder "${folder}": ${error.message}`);
    }
    if (!data || data.length === 0) break;

    for (const entry of data) {
      const entryPath = folder ? `${folder}/${entry.name}` : entry.name;
      // Supabase Storage represents subfolders as entries with `id === null` and no metadata.
      const isFolder = entry.id === null && entry.metadata === null;
      if (isFolder) {
        const nested = await listAllStorageFiles(supabase, entryPath);
        files.push(...nested);
      } else {
        files.push({ path: entryPath, sizeBytes: entry.metadata?.size ?? 0 });
      }
    }

    if (data.length < LIST_PAGE_SIZE) break;
    offset += LIST_PAGE_SIZE;
  }

  return files;
}

/**
 * Filters a list of storage files down to those at or above the given threshold.
 */
function filterOversizedFiles(files: StorageFileEntry[], thresholdBytes: number): StorageFileEntry[] {
  return files.filter((f) => f.sizeBytes >= thresholdBytes);
}

/**
 * Cross-references flagged storage paths against the `property_images` table to attach
 * property ID, primary-image flag, and the owning property's status. Builds the public
 * URL the same way the app does (bucket public URL + path) to match rows by `url`.
 */
async function attachPropertyContext(
  supabase: SupabaseClient,
  files: StorageFileEntry[]
): Promise<Map<string, PropertyContext>> {
  const contextByPath = new Map<string, PropertyContext>();
  if (files.length === 0) return contextByPath;

  const pathToUrl = new Map<string, string>();
  for (const file of files) {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(file.path);
    pathToUrl.set(file.path, data.publicUrl);
  }

  const { data: imageRows, error: imagesError } = await supabase
    .from("property_images")
    .select("url, property_id, is_primary")
    .in("url", Array.from(pathToUrl.values()));

  if (imagesError) {
    throw new Error(`Failed to query property_images: ${imagesError.message}`);
  }

  const urlToImageRow = new Map((imageRows ?? []).map((row) => [row.url, row]));

  const propertyIds = Array.from(
    new Set((imageRows ?? []).map((row) => row.property_id).filter((id): id is number => id != null))
  );

  const statusByPropertyId = new Map<number, string>();
  if (propertyIds.length > 0) {
    const { data: propertyRows, error: propertiesError } = await supabase
      .from("properties")
      .select("id, status")
      .in("id", propertyIds);

    if (propertiesError) {
      throw new Error(`Failed to query properties: ${propertiesError.message}`);
    }
    for (const row of propertyRows ?? []) {
      statusByPropertyId.set(row.id, row.status);
    }
  }

  for (const file of files) {
    const url = pathToUrl.get(file.path);
    const imageRow = url ? urlToImageRow.get(url) : undefined;
    contextByPath.set(file.path, {
      propertyId: imageRow?.property_id ?? null,
      isPrimary: imageRow?.is_primary ?? null,
      propertyStatus: imageRow ? statusByPropertyId.get(imageRow.property_id) ?? null : null,
    });
  }

  return contextByPath;
}

/**
 * Writes the audit report as both JSON and CSV to scripts/output/ and prints a
 * console summary (total flagged, total excess bytes, top 10 offenders).
 */
function reportResults(report: AuditReport): void {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const jsonPath = join(OUTPUT_DIR, "image-size-audit.json");
  writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf-8");

  const csvHeader = "path,sizeBytes,excessBytes,propertyId,isPrimary,propertyStatus";
  const csvRows = report.flaggedFiles.map((f) =>
    [f.path, f.sizeBytes, f.excessBytes, f.propertyId ?? "", f.isPrimary ?? "", f.propertyStatus ?? ""].join(",")
  );
  const csvPath = join(OUTPUT_DIR, "image-size-audit.csv");
  writeFileSync(csvPath, [csvHeader, ...csvRows].join("\n"), "utf-8");

  const topOffenders = [...report.flaggedFiles].sort((a, b) => b.sizeBytes - a.sizeBytes).slice(0, 10);

  console.log("\n=== Image Size Audit ===");
  console.log(`Threshold:            ${(report.thresholdBytes / 1024).toFixed(0)} KB`);
  console.log(`Total files scanned:  ${report.totalFilesScanned}`);
  console.log(`Total flagged:        ${report.totalFlagged}`);
  console.log(`Total excess bytes:   ${(report.totalExcessBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`\nReports written to:\n  ${jsonPath}\n  ${csvPath}`);

  console.log("\nTop 10 offenders:");
  for (const f of topOffenders) {
    const sizeKB = (f.sizeBytes / 1024).toFixed(1);
    console.log(
      `  ${sizeKB.padStart(8)} KB  ${f.path}  (property ${f.propertyId ?? "?"}, ` +
        `primary=${f.isPrimary ?? "?"}, status=${f.propertyStatus ?? "?"})`
    );
  }
  console.log("");
}

async function main(): Promise<void> {
  const cliArgKB = process.argv[2] ? Number(process.argv[2]) : undefined;
  const thresholdBytes =
    cliArgKB !== undefined && !Number.isNaN(cliArgKB) ? cliArgKB * 1024 : DEFAULT_THRESHOLD_BYTES;

  const supabase = createServiceClient();

  console.log(`Scanning bucket "${BUCKET}" (read-only)...`);
  const allFiles = await listAllStorageFiles(supabase);

  const flagged = filterOversizedFiles(allFiles, thresholdBytes);
  const contextByPath = await attachPropertyContext(supabase, flagged);

  const flaggedFiles: FlaggedFile[] = flagged
    .map((f) => {
      const context = contextByPath.get(f.path) ?? { propertyId: null, isPrimary: null, propertyStatus: null };
      return { ...f, ...context, excessBytes: f.sizeBytes - thresholdBytes };
    })
    .sort((a, b) => b.sizeBytes - a.sizeBytes);

  const report: AuditReport = {
    generatedAt: new Date().toISOString(),
    thresholdBytes,
    totalFilesScanned: allFiles.length,
    totalFlagged: flaggedFiles.length,
    totalExcessBytes: flaggedFiles.reduce((sum, f) => sum + f.excessBytes, 0),
    flaggedFiles,
  };

  reportResults(report);
}

main().catch((err) => {
  console.error("Audit failed:", err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
