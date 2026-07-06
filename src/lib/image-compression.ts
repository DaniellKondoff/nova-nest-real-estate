import imageCompression from "browser-image-compression";

const TARGET_MAX_SIZE_BYTES = 300 * 1024; // ~300KB
const MAX_DIMENSION = 1920; // matches scripts/backfill-image-sizes.ts
const WEBP_QUALITY = 0.8; // matches scripts/backfill-image-sizes.ts

/**
 * Compresses and resizes an image file client-side before upload.
 * Skips files already at or under the ~300KB target to avoid wasted work.
 * Forces WebP output — this assumes evergreen-browser canvas WebP support
 * (fine for this admin-only tool; the library has no JPEG-fallback hook).
 * Fails open: if compression throws, the original (already-validated) file
 * is returned so a compression bug can never break the upload flow itself.
 * @param file - The original image file selected by the user.
 * @returns The compressed file, or the original file if compression was skipped or failed.
 */
export async function compressImage(file: File): Promise<File> {
  if (file.size <= TARGET_MAX_SIZE_BYTES) return file;

  try {
    return await imageCompression(file, {
      maxSizeMB: TARGET_MAX_SIZE_BYTES / (1024 * 1024),
      maxWidthOrHeight: MAX_DIMENSION,
      useWebWorker: true,
      fileType: "image/webp",
      initialQuality: WEBP_QUALITY,
    });
  } catch (error) {
    console.error("Image compression failed, uploading original file:", error);
    return file;
  }
}
