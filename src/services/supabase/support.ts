import { createClient } from "@supabase/supabase-js";

interface Support {
  id: string;
  clientId: string;
  userId: string;
  toUserId?: string;
  ticketNumber?: string;
  userType: number;
  title: string;
  fileNumber?: string;
  rate?: number;
  isRead: boolean;
  closed: boolean;
  field1?: string;
  field2?: string;
  solarCreated?: string;
  createdAt: string;
  messageCount?: number;
}

interface SupportMessage {
  id: string;
  clientId: string;
  supportId: string;
  userId: string;
  message: string;
  createdAt: string;
  userName?: string;
}

interface SupportFile {
  id: string;
  clientId: string;
  supportId: string;
  storagePath: string;
  name?: string;
  createdAt: string;
}

export interface SupportFilter {
  closed?: boolean;
  search?: string;
}

export interface SupportService {
  getAll(filter?: SupportFilter): Promise<Support[]>;
  getById(id: string): Promise<Support | null>;
  getMessages(supportId: string): Promise<SupportMessage[]>;
  addTicket(data: Omit<Support, "id" | "clientId" | "createdAt" | "messageCount">): Promise<Support>;
  addMessage(supportId: string, message: string, userId?: string, userName?: string): Promise<SupportMessage>;
  closeSupport(id: string): Promise<void>;
  getFiles(supportId: string): Promise<SupportFile[]>;
}

function getClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

function rowToSupport(row: Record<string, unknown>): Support {
  const msgArr = row.support_messages as Array<{ count: number }> | undefined;
  const count =
    Array.isArray(msgArr) && msgArr.length > 0 ? Number(msgArr[0].count) : 0;
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    userId: row.user_id as string,
    toUserId: row.to_user_id as string | undefined,
    ticketNumber: row.ticket_number as string | undefined,
    userType: (row.user_type as number) ?? 0,
    title: row.title as string,
    fileNumber: row.file_number as string | undefined,
    rate: row.rate as number | undefined,
    isRead: (row.is_read as boolean) ?? false,
    closed: (row.closed as boolean) ?? false,
    field1: row.field_1 as string | undefined,
    field2: row.field_2 as string | undefined,
    solarCreated: row.solar_created as string | undefined,
    createdAt: row.created_at as string,
    messageCount: count,
  };
}

function rowToMessage(row: Record<string, unknown>): SupportMessage {
  const profile = row.profiles as Record<string, unknown> | undefined;
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    supportId: row.support_id as string,
    userId: row.user_id as string,
    message: row.message as string,
    createdAt: row.created_at as string,
    userName: profile
      ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || undefined
      : undefined,
  };
}

function rowToFile(row: Record<string, unknown>): SupportFile {
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    supportId: row.support_id as string,
    storagePath: row.storage_path as string,
    name: row.name as string | undefined,
    createdAt: row.created_at as string,
  };
}

export const supabaseSupportService: SupportService = {
  async getAll(filter?: SupportFilter): Promise<Support[]> {
    const client = getClient();
    let query = client
      .from("supports")
      .select("*, support_messages(count)");

    if (filter?.closed !== undefined) {
      query = query.eq("closed", filter.closed);
    }

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;

    let result = (data ?? []).map(rowToSupport);

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.ticketNumber?.toLowerCase().includes(q) ||
          s.fileNumber?.toLowerCase().includes(q)
      );
    }

    return result;
  },

  async getById(id: string): Promise<Support | null> {
    const client = getClient();
    const { data, error } = await client
      .from("supports")
      .select("*, support_messages(count)")
      .eq("id", id)
      .single();
    if (error) return null;
    return rowToSupport(data);
  },

  async getMessages(supportId: string): Promise<SupportMessage[]> {
    const client = getClient();
    const { data, error } = await client
      .from("support_messages")
      .select("*, profiles(first_name, last_name)")
      .eq("support_id", supportId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(rowToMessage);
  },

  async addTicket(data): Promise<Support> {
    const client = getClient();
    const { data: row, error } = await client
      .from("supports")
      .insert({
        user_id: data.userId,
        to_user_id: data.toUserId,
        ticket_number: data.ticketNumber,
        user_type: data.userType,
        title: data.title,
        file_number: data.fileNumber,
        is_read: data.isRead,
        closed: false,
        field_1: data.field1,
        field_2: data.field2,
        solar_created: data.solarCreated,
      })
      .select("*, support_messages(count)")
      .single();
    if (error) throw error;
    return rowToSupport(row);
  },

  async addMessage(supportId: string, message: string, userId = "00000000-0000-0000-0000-000000000000"): Promise<SupportMessage> {
    const client = getClient();
    const { data: row, error } = await client
      .from("support_messages")
      .insert({
        support_id: supportId,
        user_id: userId,
        message,
      })
      .select("*, profiles(first_name, last_name)")
      .single();
    if (error) throw error;
    return rowToMessage(row);
  },

  async closeSupport(id: string): Promise<void> {
    const client = getClient();
    const { error } = await client
      .from("supports")
      .update({ closed: true, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },

  async getFiles(supportId: string): Promise<SupportFile[]> {
    const client = getClient();
    const { data, error } = await client
      .from("support_files")
      .select("*")
      .eq("support_id", supportId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(rowToFile);
  },
};

export default supabaseSupportService;
