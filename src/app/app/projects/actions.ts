"use server";

import { revalidatePath } from "next/cache";
import supabaseProjectsService from "@/services/supabase/projects";
import supabaseEngineersService from "@/services/supabase/engineers";
import type { ElectProject } from "@/services/mock/projects";
import type { Engineer } from "@/services/mock/engineers";

export async function getProjectById(id: string): Promise<ElectProject | null> {
  return supabaseProjectsService.getById(id);
}

export async function getEngineers(): Promise<Engineer[]> {
  return supabaseEngineersService.getAll({ inactive: false });
}

export async function assignEngineer(
  projectId: string,
  engineerId: string,
  engineerName: string,
  engineerPhone: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await supabaseProjectsService.upsert({
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
    await supabaseProjectsService.upsert({
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
    await supabaseProjectsService.stop(id, reason);
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
    await supabaseProjectsService.upsert({ id, isStop: false, stopDes: undefined });
    revalidatePath(`/app/projects/${id}`);
    revalidatePath(`/app/projects/${id}/process`);
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "خطای ناشناخته";
    return { ok: false, error: message };
  }
}
