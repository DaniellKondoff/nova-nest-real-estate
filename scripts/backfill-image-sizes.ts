/**
 * Recompresses oversized property images flagged by `scripts/audit-image-sizes.ts`.
 *
 * Reads the audit JSON report (does not re-scan Storage itself), downloads each
 * flagged file, recompresses it with sharp (max dimension 1920px, WebP, quality 80),
 * and re-uploads it under a new content-hashed path so the public URL always changes
 * (cache-busting — Vercel Image Optimization and the Supabase Storage CDN both cache
 * by URL, so overwriting bytes at an unchanged URL would keep serving the stale,
 * large version for up to the configured 31-day TTL).
 *
 * Usage:
 *   npx tsx scripts/backfill-image-sizes.ts [--report <path>] [--dry-run[=true|false]] [--limit N]
 *
 * Defaults to a dry run: pass --dry-run=false to actually write anything.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL to be set in the
 * environment, e.g. via:
 *   npm run backfill:image-sizes -- --limit 5
 * (which loads .env.local via Node's --env-file flag, see package.json)
 *
 * Safety chain per file (non-dry-run only): upload the recompressed file to a new
 * path -> update the property_images row to point at it (only if exactly one row
 * matches) -> only then remove the original Storage object. A Storage object is
 * never deleted unless the DB row referencing it was confirmably repointed first.
 */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { getServiceClient } from "@/lib/supabase/service";

const BUCKET = "property-images";
const MAX_DIMENSION = 1920;
const WEBP_QUALITY = 80;
const DEFAULT_REPORT_PATH = join(process.cwd(), "scripts", "output", "image-size-audit.json");

interface FlaggedFile {
  path: string;
  sizeBytes: number;
  excessBytes: number;
  propertyId: number | null;
  isPrimary: boolean | null;
  propertyStatus: string | null;
}

interface AuditReport {
  generatedAt: string;
  thresholdBytes: number;
  totalFilesScanned: number;
  totalFlagged: number;
  totalExcessBytes: number;
  flaggedFiles: FlaggedFile[];
}

interface CliOptions {
  reportPath: string;
  dryRun: boolean;
  limit: number | null;
}

type FileOutcome =
  | { status: "recompressed"; path: string; newPath: string; originalSize: number; newSize: number }
  | { status: "skipped"; path: string; reason: string }
  | { status: "failed"; path: string; reason: string };

/**
 * Parses CLI arguments: --report <path>, --dry-run / --dry-run=false, --limit N.
 * Any value other than an explicit "false" for --dry-run is treated as dry-run,
 * so writes only ever happen with an unambiguous --dry-run=false.
 */
function parseCliOptions(argv: string[]): CliOptions {
  let reportPath = DEFAULT_REPORT_PATH;
  let dryRun = true;
  let limit: number | null = null;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--report") {
      reportPath = argv[++i] ?? reportPath;
    } else if (arg.startsWith("--report=")) {
      reportPath = arg.slice("--report=".length);
    } else if (arg === "--dry-run") {
      dryRun = true;
    } else if (arg.startsWith("--dry-run=")) {
      dryRun = arg.slice("--dry-run=".length) !== "false";
    } else if (arg === "--limit") {
      const value = Number(argv[++i]);
      limit = Number.isFinite(value) && value > 0 ? value : null;
    } else if (arg.startsWith("--limit=")) {
      const value = Number(arg.slice("--limit=".length));
      limit = Number.isFinite(value) && value > 0 ? value : null;
    }
  }

  return { reportPath, dryRun, limit };
}

/**
 * Loads and parses the audit report produced by scripts/audit-image-sizes.ts.
 * Throws a descriptive error if the report is missing so the user knows to run
 * the audit script first.
 */
function loadAuditReport(reportPath: string): AuditReport {
  let raw: string;
  try {
    raw = readFileSync(reportPath, "utf-8");
  } catch {
    throw new Error(
      `Audit report not found at "${reportPath}". Run \`npm run audit:image-sizes\` first.`
    );
  }
  return JSON.parse(raw) as AuditReport;
}

/**
 * Downloads a file from the property-images bucket and returns it as a Buffer.
 * Read-only Storage operation.
 */
async function downloadImage(supabase: ReturnType<typeof getServiceClient>, path: string): Promise<Buffer> {
  const { data, error } = await supabase.storage.from(BUCKET).download(path);
  if (error || !data) {
    throw new Error(`Failed to download "${path}": ${error?.message ?? "no data returned"}`);
  }
  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Recompresses an image buffer: bakes in EXIF orientation, downsizes to fit within
 * MAX_DIMENSION (no upscaling), converts to WebP at WEBP_QUALITY, and drops
 * remaining metadata. Returns the new buffer plus its pixel dimensions.
 */
async function recompressImage(buffer: Buffer): Promise<{ buffer: Buffer; width: number; height: number }> {
  const pipeline = sharp(buffer)
    .rotate()
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY });

  const outputBuffer = await pipeline.toBuffer();
  const metadata = await sharp(outputBuffer).metadata();

  return {
    buffer: outputBuffer,
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
  };
}

/**
 * Builds a new, content-hashed Storage path for the recompressed buffer so the
 * public URL always changes, forcing the Vercel/Supabase CDN caches to fetch fresh
 * bytes. Never returns the original path unchanged, even when the extension (webp)
 * stays the same.
 */
function buildOutputPath(originalPath: string, recompressedBuffer: Buffer): { path: string } {
  const hash = createHash("sha256").update(recompressedBuffer).digest("hex").slice(0, 8);
  const lastSlash = originalPath.lastIndexOf("/");
  const dir = lastSlash >= 0 ? originalPath.slice(0, lastSlash + 1) : "";
  const filename = lastSlash >= 0 ? originalPath.slice(lastSlash + 1) : originalPath;
  const dotIndex = filename.lastIndexOf(".");
  const basename = dotIndex >= 0 ? filename.slice(0, dotIndex) : filename;

  return { path: `${dir}${basename}-${hash}.webp` };
}

/**
 * Uploads the recompressed buffer to its new, unique path. No upsert needed since
 * the content hash guarantees the path doesn't already exist.
 */
async function uploadRecompressed(
  supabase: ReturnType<typeof getServiceClient>,
  newPath: string,
  buffer: Buffer
): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).upload(newPath, buffer, {
    contentType: "image/webp",
  });
  if (error) {
    throw new Error(`Failed to upload "${newPath}": ${error.message}`);
  }
}

/**
 * Repoints the property_images row matching the given original public URL at the
 * new Storage path, updating url/file_size/width/height — but only when exactly
 * one row matches. Returns the match count so the caller can decide whether it's
 * safe to remove the original Storage object.
 */
async function updatePropertyImageRow(
  supabase: ReturnType<typeof getServiceClient>,
  originalUrl: string,
  newPath: string,
  width: number,
  height: number,
  newSizeBytes: number
): Promise<{ updated: boolean; matchCount: number }> {
  const { data: matches, error: selectError } = await supabase
    .from("property_images")
    .select("id")
    .eq("url", originalUrl);

  if (selectError) {
    throw new Error(`Failed to query property_images for "${originalUrl}": ${selectError.message}`);
  }

  const matchCount = matches?.length ?? 0;
  if (matchCount !== 1) {
    return { updated: false, matchCount };
  }

  const { data: newUrlData } = supabase.storage.from(BUCKET).getPublicUrl(newPath);

  const { error: updateError } = await supabase
    .from("property_images")
    .update({
      url: newUrlData.publicUrl,
      file_size: newSizeBytes,
      width,
      height,
    })
    .eq("id", matches![0].id);

  if (updateError) {
    throw new Error(`Failed to update property_images row ${matches![0].id}: ${updateError.message}`);
  }

  return { updated: true, matchCount: 1 };
}

/**
 * Processes a single flagged file end-to-end inside a try/catch so one failure
 * never halts the batch. In dry-run mode, computes and logs the projection without
 * performing any Storage/DB write. In live mode, follows the safety chain: upload
 * new file -> update DB row (only if exactly one match) -> remove original.
 *
 * If recompression does not actually reduce the file size (e.g. an
 * already-well-compressed JPEG can occasionally grow when re-encoded as WebP),
 * the file is skipped and the original is left untouched rather than replacing it
 * with a larger file.
 */
async function processFlaggedFile(
  supabase: ReturnType<typeof getServiceClient>,
  file: FlaggedFile,
  thresholdBytes: number,
  dryRun: boolean
): Promise<FileOutcome> {
  try {
    const originalBuffer = await downloadImage(supabase, file.path);

    if (originalBuffer.byteLength < thresholdBytes) {
      return { status: "skipped", path: file.path, reason: "already under threshold" };
    }

    const { buffer: newBuffer, width, height } = await recompressImage(originalBuffer);

    if (newBuffer.byteLength >= originalBuffer.byteLength) {
      return {
        status: "skipped",
        path: file.path,
        reason: `recompression did not reduce size (${originalBuffer.byteLength} -> ${newBuffer.byteLength} bytes), original left untouched`,
      };
    }

    const { path: newPath } = buildOutputPath(file.path, newBuffer);

    if (dryRun) {
      return {
        status: "recompressed",
        path: file.path,
        newPath,
        originalSize: originalBuffer.byteLength,
        newSize: newBuffer.byteLength,
      };
    }

    const { data: originalUrlData } = supabase.storage.from(BUCKET).getPublicUrl(file.path);

    await uploadRecompressed(supabase, newPath, newBuffer);

    const { updated, matchCount } = await updatePropertyImageRow(
      supabase,
      originalUrlData.publicUrl,
      newPath,
      width,
      height,
      newBuffer.byteLength
    );

    if (!updated) {
      return {
        status: "failed",
        path: file.path,
        reason: `no unique DB row match (found ${matchCount}, original file preserved)`,
      };
    }

    const { error: removeError } = await supabase.storage.from(BUCKET).remove([file.path]);
    if (removeError) {
      return {
        status: "failed",
        path: file.path,
        reason: `DB updated but failed to remove original: ${removeError.message}`,
      };
    }

    return {
      status: "recompressed",
      path: file.path,
      newPath,
      originalSize: originalBuffer.byteLength,
      newSize: newBuffer.byteLength,
    };
  } catch (err) {
    return { status: "failed", path: file.path, reason: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Prints a per-file log line and a final summary (total processed/succeeded/
 * skipped/failed, total bytes saved).
 */
function printSummary(outcomes: FileOutcome[], dryRun: boolean): void {
  const prefix = dryRun ? "[DRY RUN] " : "";

  let succeeded = 0;
  let skipped = 0;
  let failed = 0;
  let bytesSaved = 0;

  for (const outcome of outcomes) {
    if (outcome.status === "recompressed") {
      succeeded++;
      bytesSaved += outcome.originalSize - outcome.newSize;
      const pct = ((1 - outcome.newSize / outcome.originalSize) * 100).toFixed(1);
      console.log(
        `${prefix}${outcome.path} -> ${outcome.newPath}  ` +
          `${(outcome.originalSize / 1024).toFixed(1)}KB -> ${(outcome.newSize / 1024).toFixed(1)}KB  (-${pct}%)`
      );
    } else if (outcome.status === "skipped") {
      skipped++;
      console.log(`${prefix}${outcome.path}  SKIPPED (${outcome.reason})`);
    } else {
      failed++;
      console.log(`${prefix}${outcome.path}  FAILED (${outcome.reason})`);
    }
  }

  console.log("\n=== Backfill Summary ===");
  console.log(`Mode:        ${dryRun ? "DRY RUN (no writes performed)" : "LIVE"}`);
  console.log(`Processed:   ${outcomes.length}`);
  console.log(`Succeeded:   ${succeeded}`);
  console.log(`Skipped:     ${skipped}`);
  console.log(`Failed:      ${failed}`);
  console.log(`Bytes saved: ${(bytesSaved / 1024 / 1024).toFixed(2)} MB`);
  console.log("");
}

async function main(): Promise<void> {
  const { reportPath, dryRun, limit } = parseCliOptions(process.argv.slice(2));

  const report = loadAuditReport(reportPath);
  const files = limit !== null ? report.flaggedFiles.slice(0, limit) : report.flaggedFiles;

  console.log(
    `${dryRun ? "[DRY RUN] " : ""}Processing ${files.length} flagged file(s) from "${reportPath}"...\n`
  );

  const supabase = getServiceClient();

  const outcomes: FileOutcome[] = [];
  for (const file of files) {
    const outcome = await processFlaggedFile(supabase, file, report.thresholdBytes, dryRun);
    outcomes.push(outcome);
  }

  printSummary(outcomes, dryRun);
}

main().catch((err) => {
  console.error("Backfill failed:", err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
