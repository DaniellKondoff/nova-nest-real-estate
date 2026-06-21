import { getServerClient } from "@/lib/supabase/server";
import type {
  CrmContact,
  CrmContactWithRelations,
  CrmActivity,
  CrmContactFilters,
  CreateCrmContactInput,
  UpdateCrmContactInput,
  CreateCrmActivityInput,
} from "@/types/crm";

/**
 * Fetch all CRM contacts, optionally filtered by status, client type, or search term.
 * Results are ordered newest-first.
 */
export async function getCrmContacts(
  filters?: CrmContactFilters
): Promise<{ contacts: CrmContact[]; total: number }> {
  const supabase = await getServerClient();
  const page = Math.max(1, filters?.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters?.limit ?? 20));
  const offset = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from("crm_contacts" as any) as any)
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.client_type) {
    // TEXT[] — use Postgres @> (array contains) operator
    query = query.contains("client_types", [filters.client_type]);
  }
  if (filters?.search) {
    const term = filters.search;
    query = query.or(
      `full_name.ilike.%${term}%,phone.ilike.%${term}%,email.ilike.%${term}%`
    );
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching CRM contacts:", error);
    return { contacts: [], total: 0 };
  }

  return { contacts: (data as CrmContact[]) ?? [], total: count ?? 0 };
}

/**
 * Fetch a single CRM contact by ID, including linked neighborhoods, properties, and activities.
 * Returns null if no contact with the given ID exists.
 */
export async function getCrmContactById(
  id: string
): Promise<CrmContactWithRelations | null> {
  const supabase = await getServerClient();

  const { data, error } = await (supabase.from("crm_contacts" as any) as any)
    .select(
      `
      *,
      neighborhoods:crm_contact_neighborhoods(neighborhood:neighborhoods(*)),
      properties:crm_contact_properties(property:properties(*, property_images(url, is_primary, sort_order))),
      activities:crm_activities(*)
    `
    )
    .eq("id", id)
    .order("occurred_at", { referencedTable: "crm_activities", ascending: false })
    .single();

  if (error) {
    // PGRST116 = no rows returned
    if (error.code === "PGRST116") return null;
    console.error("Error fetching CRM contact by id:", error);
    throw error;
  }

  // Flatten junction wrapper objects returned by PostgREST nested selects
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
      .filter(Boolean)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((p: any) => ({ ...p, property_images: p.property_images ?? [] })),
    activities: raw.activities ?? [],
  };

  return contact;
}

/**
 * Create a new CRM contact. Throws on database error.
 */
export async function createCrmContact(
  input: CreateCrmContactInput
): Promise<CrmContact> {
  const supabase = await getServerClient();

  const { data, error } = await (supabase.from("crm_contacts" as any) as any)
    .insert(input)
    .select()
    .single();

  if (error) {
    console.error("Error creating CRM contact:", error);
    throw error;
  }

  return data as CrmContact;
}

/**
 * Update an existing CRM contact by ID. Throws on database error.
 */
export async function updateCrmContact(
  id: string,
  input: UpdateCrmContactInput
): Promise<CrmContact> {
  const supabase = await getServerClient();

  const { data, error } = await (supabase.from("crm_contacts" as any) as any)
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating CRM contact:", error);
    throw error;
  }

  return data as CrmContact;
}

/**
 * Delete a CRM contact by ID. Junction rows and activities are removed via CASCADE.
 * Throws on database error.
 */
export async function deleteCrmContact(id: string): Promise<void> {
  const supabase = await getServerClient();

  const { error } = await (supabase.from("crm_contacts" as any) as any)
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting CRM contact:", error);
    throw error;
  }
}

/**
 * Fetch all activities for a contact, ordered by occurrence date descending.
 */
export async function getCrmActivities(
  contactId: string
): Promise<CrmActivity[]> {
  const supabase = await getServerClient();

  const { data, error } = await (supabase.from("crm_activities" as any) as any)
    .select("*")
    .eq("contact_id", contactId)
    .order("occurred_at", { ascending: false });

  if (error) {
    console.error("Error fetching CRM activities:", error);
    return [];
  }

  return (data as CrmActivity[]) ?? [];
}

/**
 * Log a new activity (note, call, or meeting) for a contact. Throws on database error.
 */
export async function createCrmActivity(
  input: CreateCrmActivityInput
): Promise<CrmActivity> {
  const supabase = await getServerClient();

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

/**
 * Link a property to a contact. Silently ignores if the link already exists (upsert).
 * propertyId is a BIGINT in the database.
 */
export async function linkPropertyToContact(
  contactId: string,
  propertyId: number
): Promise<void> {
  const supabase = await getServerClient();

  const { error } = await (
    supabase.from("crm_contact_properties" as any) as any
  ).upsert(
    { contact_id: contactId, property_id: propertyId },
    { onConflict: "contact_id,property_id" }
  );

  if (error) {
    console.error("Error linking property to CRM contact:", error);
    throw error;
  }
}

/**
 * Remove the link between a property and a contact.
 * propertyId is a BIGINT in the database.
 */
export async function unlinkPropertyFromContact(
  contactId: string,
  propertyId: number
): Promise<void> {
  const supabase = await getServerClient();

  const { error } = await (
    supabase.from("crm_contact_properties" as any) as any
  )
    .delete()
    .eq("contact_id", contactId)
    .eq("property_id", propertyId);

  if (error) {
    console.error("Error unlinking property from CRM contact:", error);
    throw error;
  }
}

/**
 * Link a neighborhood to a contact. Silently ignores if the link already exists (upsert).
 * neighborhoodId is a BIGINT in the database.
 */
export async function linkNeighborhoodToContact(
  contactId: string,
  neighborhoodId: number
): Promise<void> {
  const supabase = await getServerClient();

  const { error } = await (
    supabase.from("crm_contact_neighborhoods" as any) as any
  ).upsert(
    { contact_id: contactId, neighborhood_id: neighborhoodId },
    { onConflict: "contact_id,neighborhood_id" }
  );

  if (error) {
    console.error("Error linking neighborhood to CRM contact:", error);
    throw error;
  }
}

/**
 * Remove the link between a neighborhood and a contact.
 * neighborhoodId is a BIGINT in the database.
 */
export async function unlinkNeighborhoodFromContact(
  contactId: string,
  neighborhoodId: number
): Promise<void> {
  const supabase = await getServerClient();

  const { error } = await (
    supabase.from("crm_contact_neighborhoods" as any) as any
  )
    .delete()
    .eq("contact_id", contactId)
    .eq("neighborhood_id", neighborhoodId);

  if (error) {
    console.error("Error unlinking neighborhood from CRM contact:", error);
    throw error;
  }
}

/**
 * Returns aggregate counts for the CRM dashboard: total contacts, active, and closed.
 */
export async function getCrmDashboardStats(): Promise<{
  total: number;
  active: number;
  closed: number;
}> {
  const supabase = await getServerClient();

  const { data, error } = await (supabase.from("crm_contacts" as any) as any)
    .select("status");

  if (error) {
    console.error("Error fetching CRM dashboard stats:", error);
    return { total: 0, active: 0, closed: 0 };
  }

  const rows = (data as { status: string }[]) ?? [];
  return {
    total: rows.length,
    active: rows.filter((r) => r.status === "active").length,
    closed: rows.filter((r) => r.status === "closed").length,
  };
}
