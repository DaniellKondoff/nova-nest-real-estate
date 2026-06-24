import { getServerClient } from "@/lib/supabase/server";
import type {
  CrmContact,
  CrmContactWithRelations,
  CrmActivity,
  CrmContactFilters,
  CreateCrmContactInput,
  UpdateCrmContactInput,
  CreateCrmActivityInput,
  CrmTask,
  CrmTaskWithContact,
  CreateCrmTaskInput,
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
      properties:crm_contact_properties(property:properties(*)),
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const linkedProperties: any[] = (raw.properties ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((j: any) => j.property)
    .filter(Boolean);

  // Fetch only the primary image per linked property — avoids downloading all images in the join
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const primaryImagesByPropertyId: Record<string, any> = {};
  if (linkedProperties.length > 0) {
    const propertyIds = linkedProperties.map((p) => p.id);
    const { data: images } = await supabase
      .from("property_images")
      .select("property_id, url, is_primary, sort_order, alt_text_bg")
      .in("property_id", propertyIds)
      .eq("is_primary", true);
    for (const img of images ?? []) {
      primaryImagesByPropertyId[img.property_id] = img;
    }
  }

  const contact: CrmContactWithRelations = {
    ...raw,
    neighborhoods: (raw.neighborhoods ?? [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((j: any) => j.neighborhood)
      .filter(Boolean),
    properties: linkedProperties.map((p) => ({
      ...p,
      property_images: primaryImagesByPropertyId[p.id] ? [primaryImagesByPropertyId[p.id]] : [],
    })),
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
 * Update an existing CRM activity by ID. Throws on database error.
 */
export async function updateCrmActivity(
  id: string,
  input: Partial<Omit<CrmActivity, "id" | "created_at" | "contact_id">>
): Promise<CrmActivity> {
  const supabase = await getServerClient();

  const { data, error } = await (supabase.from("crm_activities" as any) as any)
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating CRM activity:", error);
    throw error;
  }

  return data as CrmActivity;
}

/**
 * Delete a CRM activity by ID. Throws on database error.
 */
export async function deleteCrmActivity(id: string): Promise<void> {
  const supabase = await getServerClient();

  const { error } = await (supabase.from("crm_activities" as any) as any)
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting CRM activity:", error);
    throw error;
  }
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
 * Uses HEAD-only count queries so zero row data is transferred from Supabase.
 */
export async function getCrmDashboardStats(): Promise<{
  total: number;
  active: number;
  closed: number;
}> {
  const supabase = await getServerClient();

  const [totalRes, activeRes, closedRes] = await Promise.all([
    (supabase.from("crm_contacts" as any) as any).select("*", { count: "exact", head: true }),
    (supabase.from("crm_contacts" as any) as any).select("*", { count: "exact", head: true }).eq("status", "active"),
    (supabase.from("crm_contacts" as any) as any).select("*", { count: "exact", head: true }).eq("status", "closed"),
  ]);

  if (totalRes.error || activeRes.error || closedRes.error) {
    console.error("Error fetching CRM dashboard stats:", totalRes.error ?? activeRes.error ?? closedRes.error);
    return { total: 0, active: 0, closed: 0 };
  }

  return {
    total: totalRes.count ?? 0,
    active: activeRes.count ?? 0,
    closed: closedRes.count ?? 0,
  };
}

const TASK_SELECT =
  "id, created_at, contact_id, type, title, due_date, is_done, completed_at";

/**
 * Fetch all tasks for a contact.
 * Open tasks come first (ordered by due_date asc), done tasks come second (ordered by completed_at desc).
 * Two queries are needed because Supabase doesn't support a conditional ORDER BY in a single call.
 */
export async function getContactTasks(contactId: string): Promise<CrmTask[]> {
  const supabase = await getServerClient();
  const [open, done] = await Promise.all([
    (supabase.from("crm_tasks" as any) as any)
      .select(TASK_SELECT)
      .eq("contact_id", contactId)
      .eq("is_done", false)
      .order("due_date", { ascending: true }),
    (supabase.from("crm_tasks" as any) as any)
      .select(TASK_SELECT)
      .eq("contact_id", contactId)
      .eq("is_done", true)
      .order("completed_at", { ascending: false }),
  ]);
  return [...(open.data ?? []), ...(done.data ?? [])] as CrmTask[];
}

/**
 * Fetch all incomplete tasks due today or earlier (overdue included).
 * Enriches each task with the contact's id and full_name for the dashboard widget.
 */
export async function getTodaysTasks(): Promise<CrmTaskWithContact[]> {
  const supabase = await getServerClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: tasks, error } = await (supabase.from("crm_tasks" as any) as any)
    .select(TASK_SELECT)
    .eq("is_done", false)
    .lte("due_date", today)
    .order("due_date", { ascending: true });

  if (error) {
    console.error("Error fetching today's tasks:", error);
    return [];
  }
  if (!tasks?.length) return [];

  const contactIds = [...new Set((tasks as CrmTask[]).map((t) => t.contact_id))];
  const { data: contacts } = await (supabase.from("crm_contacts" as any) as any)
    .select("id, full_name")
    .in("id", contactIds);

  const contactMap = Object.fromEntries(
    ((contacts ?? []) as { id: string; full_name: string }[]).map((c) => [c.id, c])
  );

  return (tasks as CrmTask[]).map((t) => ({
    ...t,
    contact: contactMap[t.contact_id] ?? { id: t.contact_id, full_name: "Неизвестен" },
  })) as CrmTaskWithContact[];
}

/**
 * Create a new task for a contact. is_done is always false on creation.
 */
export async function createTask(input: CreateCrmTaskInput): Promise<CrmTask> {
  const supabase = await getServerClient();
  const { data, error } = await (supabase.from("crm_tasks" as any) as any)
    .insert({ ...input, is_done: false })
    .select(TASK_SELECT)
    .single();
  if (error) throw error;
  return data as CrmTask;
}

/**
 * Mark a task as done and record the completion timestamp.
 */
export async function completeTask(taskId: string): Promise<CrmTask> {
  const supabase = await getServerClient();
  const { data, error } = await (supabase.from("crm_tasks" as any) as any)
    .update({ is_done: true, completed_at: new Date().toISOString() })
    .eq("id", taskId)
    .select(TASK_SELECT)
    .single();
  if (error) throw error;
  return data as CrmTask;
}

/**
 * Reopen an accidentally completed task, clearing its completion timestamp.
 */
export async function reopenTask(taskId: string): Promise<CrmTask> {
  const supabase = await getServerClient();
  const { data, error } = await (supabase.from("crm_tasks" as any) as any)
    .update({ is_done: false, completed_at: null })
    .eq("id", taskId)
    .select(TASK_SELECT)
    .single();
  if (error) throw error;
  return data as CrmTask;
}

/** Delete a task permanently. */
export async function deleteTask(taskId: string): Promise<void> {
  const supabase = await getServerClient();
  const { error } = await (supabase.from("crm_tasks" as any) as any)
    .delete()
    .eq("id", taskId);
  if (error) throw error;
}
