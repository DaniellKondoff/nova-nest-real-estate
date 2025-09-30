export { getBrowserClient } from "./client";
export { getServerClient } from "./server";

export type { Database } from "@/types/database.generated";

export async function getSupabaseClient() {
  if (typeof window !== "undefined") {
    const { getBrowserClient } = require("./client");
    return getBrowserClient();
  }
  const { getServerClient } = require("./server");
  return await getServerClient();
}


