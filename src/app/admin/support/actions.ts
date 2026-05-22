"use server";

import { revalidatePath } from "next/cache";

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

async function getSupportService() {
  const provider = process.env.NEXT_PUBLIC_DATA_PROVIDER ?? "mock";
  if (provider === "supabase") {
    const mod = await import("@/services/supabase/support");
    return mod.default;
  }
  const mod = await import("@/services/mock/support");
  return mod.default;
}

export async function getSupports(filter?: {
  closed?: boolean;
  search?: string;
}): Promise<Support[]> {
  const svc = await getSupportService();
  return svc.getAll(filter);
}

export async function getSupportById(id: string): Promise<{
  support: Support;
  messages: SupportMessage[];
  files: SupportFile[];
} | null> {
  const svc = await getSupportService();
  const support = await svc.getById(id);
  if (!support) return null;
  const [messages, files] = await Promise.all([
    svc.getMessages(id),
    svc.getFiles(id),
  ]);
  return { support, messages, files };
}

export async function createSupport(
  title: string,
  description: string,
  fileNumber?: string
): Promise<{ ok: boolean; id?: string }> {
  try {
    const svc = await getSupportService();
    const ticket = await svc.addTicket({
      userId: "user-current",
      userType: 1,
      title,
      fileNumber: fileNumber || undefined,
      isRead: false,
      closed: false,
      field1: description,
    });
    revalidatePath("/admin/support");
    return { ok: true, id: ticket.id };
  } catch {
    return { ok: false };
  }
}

export async function addMessage(
  supportId: string,
  message: string
): Promise<{ ok: boolean }> {
  try {
    const svc = await getSupportService();
    await svc.addMessage(supportId, message);
    revalidatePath(`/admin/support/${supportId}`);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function closeSupport(id: string): Promise<{ ok: boolean }> {
  try {
    const svc = await getSupportService();
    await svc.closeSupport(id);
    revalidatePath("/admin/support");
    revalidatePath(`/admin/support/${id}`);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
