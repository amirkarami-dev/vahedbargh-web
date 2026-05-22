export const dynamic = "force-dynamic";

import { getEngineersService, getProjectsService, getQuotasService } from "@/services";
import { getUserRoles, getCurrentUser, hasRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import EngWorkTabs from "./EngWorkTabs";
import type { Engineer } from "@/services/mock/engineers";
import type { ElectProject } from "@/services/mock/projects";

// ─── Types passed to client ─────────────────────────────────────────────────

export interface EngWorkRow {
  engineerId: string;
  engineerName: string;
  total: number;
  completed: number;
  inProgress: number;
}

export interface QuotaRow {
  id: string;
  engineerId: string;
  engineerName: string;
  quarterLabel: string;
  amountRemaining: number;
  amountBurning: number;
  ertCountRemaining: number;
  ertCountBurning: number;
  isApproved: boolean;
}

export interface AdminStats {
  totalEngineers: number;
  totalProjects: number;
  completedProjects: number;
}

export interface EngineerStats {
  myTotal: number;
  myCompleted: number;
  myInProgress: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildWorkRows(
  engineers: Engineer[],
  projects: ElectProject[],
  filterEngineerId?: string
): EngWorkRow[] {
  const engMap = new Map<string, Engineer>();
  for (const eng of engineers) {
    engMap.set(eng.id, eng);
  }

  const grouped = new Map<string, { total: number; completed: number; inProgress: number }>();

  for (const p of projects) {
    if (!p.userId) continue;
    if (filterEngineerId && p.userId !== filterEngineerId) continue;

    const existing = grouped.get(p.userId) ?? { total: 0, completed: 0, inProgress: 0 };
    existing.total += 1;
    if (p.projectLevel === 9 || p.isOk) {
      existing.completed += 1;
    } else if (!p.isStop && !p.isDelete) {
      existing.inProgress += 1;
    }
    grouped.set(p.userId, existing);
  }

  const rows: EngWorkRow[] = [];
  for (const [engId, counts] of grouped.entries()) {
    const eng = engMap.get(engId);
    rows.push({
      engineerId: engId,
      engineerName: eng?.fullName ?? engId,
      ...counts,
    });
  }

  // Sort by total desc
  rows.sort((a, b) => b.total - a.total);
  return rows;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function EngWorkPage() {
  const [user, roles] = await Promise.all([getCurrentUser(), getUserRoles()]);

  if (!user) {
    redirect("/app/login");
  }

  const isAdmin = hasRole(roles, "Administrator", "SuperUser");
  const isEngineer = hasRole(roles, "Engineer");

  if (!isAdmin && !isEngineer) {
    redirect("/app");
  }

  const [engService, projectService, quotaService] = await Promise.all([
    getEngineersService(),
    getProjectsService(),
    getQuotasService(),
  ]);

  const [allEngineers, allProjects, allQuotas] = await Promise.all([
    engService.getAll(),
    projectService.getAll({ pageSize: 9999 }),
    isAdmin ? quotaService.getAll() : Promise.resolve([]),
  ]);

  // Build work rows
  let workRows: EngWorkRow[];
  let adminStats: AdminStats | null = null;
  let engineerStats: EngineerStats | null = null;

  if (isAdmin) {
    workRows = buildWorkRows(allEngineers, allProjects);

    const completedProjects = allProjects.filter(
      (p) => p.projectLevel === 9 || p.isOk
    ).length;

    adminStats = {
      totalEngineers: allEngineers.filter((e) => !e.inactive && !e.isDelete).length,
      totalProjects: allProjects.length,
      completedProjects,
    };
  } else {
    // Engineer: filter by their user id
    workRows = buildWorkRows(allEngineers, allProjects, user.id);

    const myProjects = allProjects.filter((p) => p.userId === user.id);
    const myCompleted = myProjects.filter((p) => p.projectLevel === 9 || p.isOk).length;
    const myInProgress = myProjects.filter((p) => !p.isStop && !p.isDelete && p.projectLevel !== 9 && !p.isOk).length;

    engineerStats = {
      myTotal: myProjects.length,
      myCompleted,
      myInProgress,
    };
  }

  // Build quota rows for admin
  const quotaRows: QuotaRow[] = allQuotas.map((q) => ({
    id: q.id,
    engineerId: q.engineerId,
    engineerName: q.engineerName ?? q.engineerId,
    quarterLabel: q.quarterLabel ?? "—",
    amountRemaining: q.amountRemaining,
    amountBurning: q.amountBurning,
    ertCountRemaining: q.ertCountRemaining,
    ertCountBurning: q.ertCountBurning,
    isApproved: q.isApproved,
  }));

  return (
    <div className="p-6 md:p-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">کارکرد مهندسین</h1>
        <p className="text-[var(--text-muted)] mt-1 text-sm">
          {isAdmin ? "مدیریت کارکرد و سهمیه‌های مهندسین" : "کارکرد و پروژه‌های من"}
        </p>
      </div>

      <EngWorkTabs
        isAdmin={isAdmin}
        workRows={workRows}
        quotaRows={quotaRows}
        adminStats={adminStats}
        engineerStats={engineerStats}
      />
    </div>
  );
}
