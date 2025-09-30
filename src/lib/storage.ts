import { getSupabaseClient, getBrowserClient } from "@/lib/supabase";

export type UploadResult = { path: string; url: string };

const BUCKET = "property-images"; // Make sure this bucket exists in Supabase Storage

const ACCEPTED_IMAGE_MIME = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export function validateImageFile(file: File): { valid: true } | { valid: false; error: string } {
  if (!ACCEPTED_IMAGE_MIME.includes(file.type)) {
    return { valid: false, error: "Невалиден тип на файл (jpg, jpeg, png, webp)." };
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return { valid: false, error: "Файлът е твърде голям (макс. 5MB)." };
  }
  return { valid: true };
}

export async function uploadPropertyImage(propertyId: number, file: File): Promise<UploadResult> {
  const check = validateImageFile(file);
  if (!check.valid) throw new Error(check.error);

  const supabase = typeof window !== "undefined" ? getBrowserClient() : await getSupabaseClient();
  const fileExt = file.name.split(".").pop() || "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
  const filePath = `${propertyId}/${fileName}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (uploadError) throw new Error("Качването на изображение неуспешно. Опитайте отново.");

  const url = await getImageUrl(filePath);
  return { path: filePath, url };
}

export async function deletePropertyImage(imagePath: string): Promise<void> {
  const supabase = typeof window !== "undefined" ? getBrowserClient() : await getSupabaseClient();
  const { error } = await supabase.storage.from(BUCKET).remove([imagePath]);
  if (error) throw new Error("Изтриването на изображение неуспешно.");
}

export async function getImageUrl(imagePath: string): Promise<string> {
  const supabase = typeof window !== "undefined" ? getBrowserClient() : await getSupabaseClient();
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(imagePath);
  return data.publicUrl;
}


