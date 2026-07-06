import { getBrowserClient } from "@/lib/supabase/client";
import { getServiceClient } from "@/lib/supabase/service";
import { compressImage } from "@/lib/image-compression";
import { validateImageFile } from "@/lib/validations";

export { validateImageFile };

export type UploadResult = { path: string; url: string };

const BUCKET = "property-images"; // Make sure this bucket exists in Supabase Storage

export async function uploadPropertyImage(propertyId: number, file: File): Promise<UploadResult> {
  const check = validateImageFile(file);
  if (!check.valid) throw new Error(check.error);

  const compressedFile = await compressImage(file);

  const supabase = getBrowserClient();
  const fileExt = compressedFile.type === "image/webp" ? "webp" : (compressedFile.name.split(".").pop() || "jpg");
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
  const filePath = `${propertyId}/${fileName}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(filePath, compressedFile, {
    cacheControl: "3600",
    upsert: false,
  });
  if (uploadError) throw new Error("Качването на изображение неуспешно. Опитайте отново.");

  const url = getImageUrl(filePath);
  return { path: filePath, url };
}

export async function deletePropertyImage(imagePath: string): Promise<void> {
  const supabase = getBrowserClient();
  const { error } = await supabase.storage.from(BUCKET).remove([imagePath]);
  if (error) throw new Error("Изтриването на изображение неуспешно.");
}

export function getImageUrl(imagePath: string): string {
  const supabase = getBrowserClient();
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(imagePath);
  return data.publicUrl;
}

/**
 * Server-side batch removal of property images from Storage, derived from their public URLs.
 * Uses the service-role client since this runs in admin API routes without a browser session.
 */
export async function deletePropertyImagesByUrls(urls: string[]): Promise<void> {
  const paths = urls
    .map((url) => {
      try {
        const idx = new URL(url).pathname.indexOf(`/${BUCKET}/`);
        return idx >= 0 ? new URL(url).pathname.substring(idx + BUCKET.length + 2) : null;
      } catch {
        return null;
      }
    })
    .filter((p): p is string => !!p);

  if (paths.length === 0) return;

  const supabase = getServiceClient();
  const { error } = await supabase.storage.from(BUCKET).remove(paths);
  if (error) throw new Error("Изтриването на изображенията от хранилището неуспешно.");
}


