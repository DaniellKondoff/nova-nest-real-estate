import { getBrowserClient } from "@/lib/supabase/client";
import type {
  CrmContact,
  CrmContactWithRelations,
  CrmActivity,
  CrmContactFilters,
  CreateCrmActivityInput,
} from "@/types/crm";

/**
 * Fetch all CRM contacts, optionally filtered by status, client type, or search term.
 * Results are ordered newest-first.
 * Client-side variant — uses the browser Supabase client.
 */
export async function getCrmContacts(
  filters?: CrmContactFilters
): Promise<CrmContact[]> {
  const supabase = getBrowserClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from("crm_contacts" as any) as any)
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.client_type) {
    query = query.contains("client_types", [filters.client_type]);
  }
  if (filters?.search) {
    const term = filters.search;
    query = query.or(
      `full_name.ilike.%${term}%,phone.ilike.%${term}%,email.ilike.%${term}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching CRM contacts:", error);
    return [];
  }

  return (data as CrmContact[]) ?? [];
}

/**
 * Fetch a single CRM contact by ID, including linked neighborhoods, properties, and activities.
 * Returns null if no contact with the given ID exists.
 * Client-side variant — uses the browser Supabase client.
 */
export async function getCrmContactById(
  id: string
): Promise<CrmContactWithRelations | null> {
  const supabase = getBrowserClient();

  const { data, error } = await (supabase.from("crm_contacts" as any) as any)
    .select(
      `
      *,
      neighborhoods:crm_contact_neighborhoods(neighborhood:neighborhoods(*)),
      properties:crm_contact_properties(property:properties(*)),
      activities:crm_activities(*)
    `
    )
    .eq("id", id)
    .order("occurred_at", { referencedTable: "crm_activities", ascending: false })
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("Error fetching CRM contact by id:", error);
    throw error;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = data as any;
  const contact: CrmContactWithRelations = {
    ...raw,
    neighborhoods: (raw.neighborhoods ?? [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((j: any) => j.neighborhood)
      .filter(Boolean),
    properties: (raw.properties ?? [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((j: any) => j.property)
      .filter(Boolean),
    activities: raw.activities ?? [],
  };

  return contact;
}

/**
 * Log a new activity (note, call, or meeting) for a contact. Throws on database error.
 * Client-side variant — uses the browser Supabase client.
 */
export async function createCrmActivity(
  input: CreateCrmActivityInput
): Promise<CrmActivity> {
  const supabase = getBrowserClient();

  const { data, error } = await (supabase.from("crm_activities" as any) as any)
    .insert(input)
    .select()
    .single();

  if (error) {
    console.error("Error creating CRM activity:", error);
    throw error;
  }

  return data as CrmActivity;
}
