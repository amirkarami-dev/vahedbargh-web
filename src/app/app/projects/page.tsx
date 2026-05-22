import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { getUserRoles, hasRole } from "@/lib/auth";
import type { Role } from "@/lib/auth";
import {
  BuildingTypeLabel,
  ProjectLevelLabel,
  PROJECT_LEVEL_COLORS,
} from "@/services/mock/projects";
import type { ElectProject } from "@/services/mock/projects";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "پروژه‌ها" };

const PAGE_SIZE = 20;

// ─── Status badge ────────────────────────────────────────────────────────────
// The instruction spec uses string statuses ("pending" / "in_progress" / …)
// but the actual DB column `elect_project_status` is a numeric enum (0‑3) and
// `isStop` is a separate boolean. We map both here.

type StatusStyle = { label: string; classes: string };

const NUMERIC_STATUS: Record<number, StatusStyle> = {
  0: { label: "ثبت اولیه",    classes: "bg-yellow-500/10 text-yellow-400" },
  1: { label: "در حال انجام",  classes: "bg-blue-500/10   text-blue-400"   },
  2: { label: "تکمیل شده",     classes: "bg-green-500/10  text-green-400"  },
  3: { label: "متوقف",         classes: "bg-red-500/10    text-red-400"    },
};

function StatusBadge({ project }: { project: ElectProject }) {
  if (project.isStop) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400">
        متوقف
      </span>
    );
  }
  const style = NUMERIC_STATUS[project.electProjectStatus] ?? {
    label: "نامشخص",
    classes: "bg-[var(--bg-secondary)] text-[var(--text-muted)]",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${style.classes}`}
    >
      {style.label}
    </span>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fa-IR");
  } catch {
    return iso;
  }
}

// ─── Role-aware data fetching ─────────────────────────────────────────────────

interface ProfileRow {
  section_id: number | null;
}

async function fetchProjects(
  role: Role,
  userId: string,
  userSectionId: number | null,
  search: string,
  page: number
): Promise<ElectProject[]> {
  const supabase = await createClient();

  let query = supabase
    .from("elect_projects")
    .select("*")
    .eq("is_delete", false)
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  // ── Role-based filters ─────────────────────────────────────────────────────
  if (role === "Engineer") {
    // Engineer sees only projects they are assigned to.
    // Projects store the linked engineer via `panel_maker_id` or a dedicated
    // column. The instructions say `engineer_id = user.id`.  The `elect_projects`
    // table has no `engineer_id` column in the current schema, but the old UI
    // links engineers through `user_id` on the project row.
    // We filter on `user_id` which is the closest available FK in the schema.
    query = query.eq("user_id", userId);
  } else if (role === "Section") {
    // Section role sees projects in their section.
    if (userSectionId !== null) {
      query = query.eq("section_id", userSectionId);
    }
  } else if (role === "PanelMaker") {
    // PanelMaker sees projects that need a panel.
    query = query.eq("panel_need", true);
  } else if (role === "Accountant") {
    // Accountant sees completed projects only.
    query = query.eq("elect_project_status", 2);
  }
  // Administrator / Employee / ElectAdmin see everything — no extra filter.

  // ── Text search ────────────────────────────────────────────────────────────
  if (search) {
    query = query.or(
      `file_number.ilike.%${search}%,landlord_name.ilike.%${search}%,elect_request_number.ilike.%${search}%`
    );
  }

  const { data, error } = await query;
  if (error) {
    console.error("fetchProjects error:", error.message);
    return [];
  }

  return (data ?? []).map(rowToProject);
}

// Minimal row→type mapping (mirrors the supabase service but inlined to avoid
// importing the service-layer createClient which uses a different key).
function rowToProject(row: Record<string, unknown>): ElectProject {
  return {
    id:                   row.id as string,
    clientId:             (row.client_id as string) ?? "",
    fileNumber:           row.file_number as string | undefined,
    electRequestNumber:   row.elect_request_number as string | undefined,
    userId:               row.user_id as string | undefined,
    sectionId:            row.section_id as number | undefined,
    cityId:               row.city_id as number | undefined,
    provinceId:           row.province_id as number | undefined,
    address:              row.address as string | undefined,
    postalCode:           row.postal_code as string | undefined,
    lat:                  row.lat as number | undefined,
    lng:                  row.lng as number | undefined,
    landlordName:         (row.landlord_name as string) ?? "",
    landlordNaCode:       (row.landlord_na_code as string) ?? "",
    landlordPhoneNumber:  (row.landlord_phone_number as string) ?? "",
    companyName:          row.company_name as string | undefined,
    licenseNumber:        row.license_number as string | undefined,
    description:          row.description as string | undefined,
    numberOfFloor:        (row.number_of_floor as number) ?? 1,
    desNumberOfFloor:     row.des_number_of_floor as number | undefined,
    projectCreatedType:   (row.project_created_type as number) ?? 0,
    projectTypeRequest:   (row.project_type_request as number) ?? 0,
    projectLevel:         (row.project_level as number) ?? 0,
    buildingType:         (row.building_type as number) ?? 0,
    electProjectStatus:   (row.elect_project_status as number) ?? 0,
    isOk:                 (row.is_ok as boolean) ?? false,
    isStop:               (row.is_stop as boolean) ?? false,
    isDelete:             (row.is_delete as boolean) ?? false,
    expired:              (row.expired as boolean) ?? false,
    panelNeed:            (row.panel_need as boolean) ?? false,
    panelMakerSubmit:     (row.panel_maker_submit as boolean) ?? false,
    isEarthSystem:        (row.is_earth_system as boolean) ?? false,
    isErtTest:            (row.is_ert_test as boolean) ?? false,
    isBuildingInspection: (row.is_building_inspection as boolean) ?? false,
    isTestAndDelivery:    (row.is_test_and_delivery as boolean) ?? false,
    needElectNetwork:     (row.need_elect_network as boolean) ?? false,
    isBigProject:         (row.is_big_project as boolean) ?? false,
    hasRelatedPermit:     (row.has_related_permit as boolean) ?? false,
    hasSupervision:       (row.has_supervision as boolean) ?? false,
    isNeedEb:             (row.is_need_eb as boolean) ?? false,
    amountPerArea:        row.amount_per_area as number | undefined,
    foundationElectrodeArea: row.foundation_electrode_area as number | undefined,
    areaAsBuilt:          row.area_as_built as number | undefined,
    defectDes:            row.defect_des as string | undefined,
    isDefectEng:          (row.is_defect_eng as boolean) ?? false,
    solvedDefectEng:      (row.solved_defect_eng as boolean) ?? false,
    supervisorName:       row.supervisor_name as string | undefined,
    supervisorPhoneNumber: row.supervisor_phone_number as string | undefined,
    panelSerialNumber:    row.panel_serial_number as string | undefined,
    stopDes:              row.stop_des as string | undefined,
    parentProjectId:      row.parent_project_id as string | undefined,
    buildingTariffId:     row.building_tariff_id as string | undefined,
    ertTariffId:          row.ert_tariff_id as string | undefined,
    panelMakerId:         row.panel_maker_id as string | undefined,
    solarCreated:         row.solar_created as string | undefined,
    julianCreated:        row.julian_created as string | undefined,
    createdAt:            (row.created_at as string) ?? "",
    updatedAt:            row.updated_at as string | undefined,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{ page?: string; q?: string }>;
}

export default async function AppProjectsPage({ searchParams }: PageProps) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  // ── Role ──────────────────────────────────────────────────────────────────
  const roles = await getUserRoles();

  const ALLOWED: Role[] = [
    "Administrator", "Engineer", "Employee", "Accountant",
    "PanelMaker", "ElectAdmin", "Section",
  ];
  if (!hasRole(roles, ...ALLOWED)) redirect("/admin/login");

  // Primary role (first match in priority order)
  const PRIORITY: Role[] = [
    "Administrator", "ElectAdmin", "Employee", "Accountant",
    "PanelMaker", "Section", "Engineer",
  ];
  const primaryRole: Role =
    PRIORITY.find((r) => roles.includes(r)) ?? "Employee";

  // For Section role — look up the user's section from their profile
  let userSectionId: number | null = null;
  if (primaryRole === "Section") {
    const { data: profileRow } = await supabase
      .from("profiles")
      .select("section_id")
      .eq("id", user.id)
      .single<ProfileRow>();
    userSectionId = profileRow?.section_id ?? null;
  }

  // ── Search params ─────────────────────────────────────────────────────────
  const sp = await searchParams;
  const page   = Math.max(1, Number(sp.page ?? 1));
  const search = (sp.q ?? "").trim();

  // ── Data ──────────────────────────────────────────────────────────────────
  const projects = await fetchProjects(primaryRole, user.id, userSectionId, search, page);

  // ── URL builder ───────────────────────────────────────────────────────────
  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const base: Record<string, string | undefined> = {
      q: search || undefined,
      page: String(page),
      ...overrides,
    };
    for (const [k, v] of Object.entries(base)) {
      if (v !== undefined && v !== "") params.set(k, v);
    }
    const qs = params.toString();
    return `/app/projects${qs ? `?${qs}` : ""}`;
  };

  // ── Derived booleans ─────────────────────────────────────────────────────
  const canCreateProject = primaryRole === "ElectAdmin";
  const showProcessLink  = hasRole(
    [primaryRole],
    "Administrator", "Employee", "Section", "ElectAdmin"
  );
  const showEngLink      = primaryRole === "Engineer";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-8" dir="rtl">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">پروژه‌ها</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            فهرست پروژه‌های نظارت برق
          </p>
        </div>

        {canCreateProject && (
          <Link
            href="/app/projects/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-primary)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-primary)]/90 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            ایجاد پروژه جدید
          </Link>
        )}
      </div>

      {/* Search bar */}
      <form method="GET" action="/app/projects" className="mb-6 flex flex-wrap items-center gap-3">
        <input
          type="text"
          name="q"
          defaultValue={search}
          placeholder="جستجو بر اساس شماره پرونده یا نام مالک..."
          className="min-w-[260px] rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-4 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
        />
        <button
          type="submit"
          className="rounded-xl bg-[var(--accent-primary)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--accent-primary)]/90 transition-colors"
        >
          جستجو
        </button>
        {search && (
          <Link
            href="/app/projects"
            className="rounded-xl border border-[var(--border-primary)] px-4 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            پاک کردن
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card)]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                <th className="px-6 py-4 text-right text-xs font-medium text-[var(--text-muted)]">
                  شماره پرونده
                </th>
                <th className="px-4 py-4 text-right text-xs font-medium text-[var(--text-muted)]">
                  نام مالک
                </th>
                <th className="hidden px-4 py-4 text-right text-xs font-medium text-[var(--text-muted)] md:table-cell">
                  آدرس
                </th>
                <th className="hidden px-4 py-4 text-right text-xs font-medium text-[var(--text-muted)] sm:table-cell">
                  نوع ساختمان
                </th>
                <th className="hidden px-4 py-4 text-right text-xs font-medium text-[var(--text-muted)] lg:table-cell">
                  مرحله
                </th>
                <th className="px-4 py-4 text-right text-xs font-medium text-[var(--text-muted)]">
                  وضعیت
                </th>
                <th className="hidden px-4 py-4 text-right text-xs font-medium text-[var(--text-muted)] xl:table-cell">
                  تاریخ ثبت
                </th>
                <th className="px-4 py-4" aria-label="عملیات" />
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--border-primary)]">
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="transition-colors hover:bg-[var(--bg-secondary)]/50"
                >
                  {/* File number */}
                  <td className="px-6 py-4">
                    <Link
                      href={`/app/projects/${project.id}`}
                      className="text-sm font-medium text-[var(--accent-primary)] hover:underline"
                    >
                      {project.fileNumber ?? project.electRequestNumber ?? "—"}
                    </Link>
                  </td>

                  {/* Owner name */}
                  <td className="px-4 py-4 text-sm text-[var(--text-primary)]">
                    {project.landlordName}
                  </td>

                  {/* Address */}
                  <td className="hidden max-w-[220px] truncate px-4 py-4 text-sm text-[var(--text-muted)] md:table-cell">
                    {project.address ?? "—"}
                  </td>

                  {/* Building type */}
                  <td className="hidden px-4 py-4 text-sm text-[var(--text-muted)] sm:table-cell">
                    {BuildingTypeLabel[project.buildingType] ?? "—"}
                  </td>

                  {/* Project level */}
                  <td className="hidden px-4 py-4 lg:table-cell">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium text-white ${PROJECT_LEVEL_COLORS[project.projectLevel] ?? "bg-gray-500"}`}
                    >
                      {ProjectLevelLabel[project.projectLevel] ?? "—"}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <StatusBadge project={project} />
                  </td>

                  {/* Created date */}
                  <td className="hidden px-4 py-4 text-sm text-[var(--text-muted)] xl:table-cell">
                    {project.solarCreated ?? formatDate(project.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3 justify-end">
                      <Link
                        href={`/app/projects/${project.id}`}
                        className="text-xs font-medium text-[var(--accent-primary)] hover:underline"
                      >
                        مشاهده
                      </Link>

                      {showEngLink && (
                        <Link
                          href={`/app/projects/${project.id}/eng`}
                          className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline"
                        >
                          مشاهده نظارتی
                        </Link>
                      )}

                      {showProcessLink && (
                        <Link
                          href={`/app/projects/${project.id}/process`}
                          className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline"
                        >
                          فرآیند
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {projects.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-14 text-center text-sm text-[var(--text-muted)]"
                  >
                    هیچ پروژه‌ای یافت نشد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {projects.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-[var(--text-muted)]">صفحه {page}</p>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Link
                href={buildUrl({ page: String(page - 1) })}
                className="rounded-xl border border-[var(--border-primary)] px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
              >
                قبلی
              </Link>
            )}
            {projects.length === PAGE_SIZE && (
              <Link
                href={buildUrl({ page: String(page + 1) })}
                className="rounded-xl border border-[var(--border-primary)] px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
              >
                بعدی
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
