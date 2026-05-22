"use server";

import { revalidatePath } from "next/cache";
import mockProjectsService from "@/services/mock/projects";
import type { ElectProject } from "@/services/mock/projects";
import mockEngineersService from "@/services/mock/engineers";
import type { Engineer } from "@/services/mock/engineers";

async function getProjectsService() {
  const provider = process.env.NEXT_PUBLIC_DATA_PROVIDER ?? "mock";
  if (provider === "supabase") {
    const mod = await import("@/services/supabase/projects");
    return mod.default;
  }
  return mockProjectsService;
}

async function getEngineersServiceImpl() {
  const provider = process.env.NEXT_PUBLIC_DATA_PROVIDER ?? "mock";
  if (provider === "supabase") {
    const mod = await import("@/services/supabase/engineers");
    return mod.default;
  }
  return mockEngineersService;
}

export async function getProjectById(id: string): Promise<ElectProject | null> {
  const svc = await getProjectsService();
  return svc.getById(id);
}

export async function getEngineers(): Promise<Engineer[]> {
  const svc = await getEngineersServiceImpl();
  return svc.getAll({ inactive: false });
}

export async function assignEngineer(
  projectId: string,
  engineerId: string,
  engineerName: string,
  engineerPhone: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const svc = await getProjectsService();
    await svc.upsert({
      id: projectId,
      supervisorName: engineerName,
      supervisorPhoneNumber: engineerPhone,
      hasSupervision: true,
    });
    revalidatePath(`/app/projects/${projectId}`);
    revalidatePath(`/app/projects/${projectId}/process`);
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "خطای ناشناخته";
    return { ok: false, error: message };
  }
}

export async function updateProjectLevel(
  projectId: string,
  level: number
): Promise<{ ok: boolean; error?: string }> {
  try {
    const svc = await getProjectsService();
    await svc.upsert({
      id: projectId,
      projectLevel: level,
    });
    revalidatePath(`/app/projects/${projectId}`);
    revalidatePath(`/app/projects/${projectId}/process`);
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "خطای ناشناخته";
    return { ok: false, error: message };
  }
}

export async function stopProject(
  id: string,
  reason: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const svc = await getProjectsService();
    await svc.stop(id, reason);
    revalidatePath(`/app/projects/${id}`);
    revalidatePath(`/app/projects/${id}/process`);
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "خطای ناشناخته";
    return { ok: false, error: message };
  }
}

export async function resumeProject(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const svc = await getProjectsService();
    await svc.upsert({ id, isStop: false, stopDes: undefined });
    revalidatePath(`/app/projects/${id}`);
    revalidatePath(`/app/projects/${id}/process`);
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "خطای ناشناخته";
    return { ok: false, error: message };
  }
}
