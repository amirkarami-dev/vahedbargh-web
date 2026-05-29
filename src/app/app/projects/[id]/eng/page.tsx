import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getUserRoles, hasRole } from "@/lib/auth";
import {
  ProjectLevelLabel,
  PROJECT_LEVEL_COLORS,
  BuildingTypeLabel,
} from "@/services/mock/projects";
import supabaseProjectsService from "@/services/supabase/projects";
import type { Metadata } from "next";
import EngNotesForm from "./EngNotesForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = await supabaseProjectsService.getById(id);
  return {
    title: project
      ? `نمای مهندس — ${project.fileNumber ?? project.electRequestNumber ?? id}`
      : "نمای مهندس",
  };
}

// ---- Helper components ----
const KURDISTAN_CITIES: Record<number, string> = {
  101: "سنندج",
  102: "مریوان",
  103: "سقز",
  104: "بانه",
  105: "کامیاران",
  106: "قروه",
  107: "بیجار",
  108: "دیواندره",
};

const BRANCHING_TYPE_LABEL: Record<number, string> = {
  0: "خانگی",
  1: "عمومی",
  2: "صنعتی",
  3: "سایر",
  4: "انشعاب موجود",
};

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6">
      <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4 pb-3 border-b border-[var(--border-primary)]">
        {title}
      </h2>
      {children}
    </div>
  );
}

function InfoField({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <dt className="text-xs text-[var(--text-muted)] mb-0.5">{label}</dt>
      <dd className="text-sm text-[var(--text-primary)] font-medium">{value ?? "—"}</dd>
    </div>
  );
}

function BoolBadge({ label, value }: { label: string; value: boolean }) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
        value
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          : "bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border-primary)]"
      }`}
    >
      <span>{value ? "✓" : "✗"}</span>
      {label}
    </div>
  );
}

// ---- Inspection checklist items derived from project flags ----
interface CheckItem {
  key: string;
  label: string;
  done: boolean;
}

function buildChecklist(project: {
  isEarthSystem: boolean;
  isErtTest: boolean;
  isBuildingInspection: boolean;
  isTestAndDelivery: boolean;
  panelNeed: boolean;
  panelMakerSubmit: boolean;
  hasSupervision: boolean;
  hasRelatedPermit: boolean;
  needElectNetwork: boolean;
  isNeedEb: boolean;
}): CheckItem[] {
  return [
    { key: "isBuildingInspection", label: "بازرسی ساختمان", done: project.isBuildingInspection },
    { key: "isEarthSystem", label: "سیستم ارت", done: project.isEarthSystem },
    { key: "isErtTest", label: "آزمون ارت (ERT)", done: project.isErtTest },
    { key: "panelNeed", label: "تابلو برق", done: project.panelNeed },
    { key: "panelMakerSubmit", label: "تأیید سریال تابلو توسط سازنده", done: project.panelMakerSubmit },
    { key: "isTestAndDelivery", label: "تست و تحویل", done: project.isTestAndDelivery },
    { key: "hasSupervision", label: "ناظر تعیین شده", done: project.hasSupervision },
    { key: "hasRelatedPermit", label: "مجوز مرتبط", done: project.hasRelatedPermit },
    { key: "needElectNetwork", label: "شبکه برق", done: project.needElectNetwork },
    { key: "isNeedEb", label: "EB مورد نیاز", done: project.isNeedEb },
  ];
}

const ALL_STAGES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

// ---- Page ----
export default async function EngProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const roles = await getUserRoles();
  if (!hasRole(roles, "Engineer", "Administrator", "SuperUser", "ElectAdmin")) {
    redirect(`/app/projects/${id}`);
  }

  const project = await supabaseProjectsService.getById(id);
  if (!project) notFound();

  const checklist = buildChecklist(project);
  const allChecksDone = checklist.every((item) => item.done);
  const currentLevel = project.projectLevel;

  const cityName = project.cityId ? KURDISTAN_CITIES[project.cityId] : undefined;

  return (
    <div className="p-6 md:p-8" dir="rtl">
      {/* ── Header ── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <Link
              href={`/app/projects/${id}`}
              className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors"
            >
              ← بازگشت به جزئیات
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {project.fileNumber ?? project.electRequestNumber ?? id}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {BuildingTypeLabel[project.buildingType] ?? "—"} — {project.landlordName}
          </p>
        </div>

        {/* Status badge */}
        <span
          className={`self-start sm:self-auto inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold text-white ${
            PROJECT_LEVEL_COLORS[currentLevel] ?? "bg-gray-500"
          }`}
        >
          {ProjectLevelLabel[currentLevel]}
        </span>
      </div>

      {project.isStop && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          <strong>پروژه متوقف است</strong>
          {project.stopDes ? ` — ${project.stopDes}` : ""}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main: 2 cols ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Project header info */}
          <Card title="اطلاعات پروژه">
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <InfoField label="نام مالک" value={project.landlordName} />
              <InfoField label="کد ملی" value={project.landlordNaCode} />
              <InfoField label="شماره تماس" value={project.landlordPhoneNumber} />
              <InfoField label="نوع ساختمان" value={BuildingTypeLabel[project.buildingType]} />
              <InfoField label="تعداد طبقات" value={project.numberOfFloor} />
              <InfoField label="نوع انشعاب" value={BRANCHING_TYPE_LABEL[project.projectTypeRequest] ?? "—"} />
              <InfoField label="شهر" value={cityName} />
              <InfoField label="آدرس" value={project.address} />
              <InfoField label="کد پستی" value={project.postalCode} />
              {project.companyName && (
                <InfoField label="نام شرکت" value={project.companyName} />
              )}
              {project.licenseNumber && (
                <InfoField label="شماره پروانه" value={project.licenseNumber} />
              )}
              {project.fileNumber && (
                <InfoField label="شماره پرونده" value={project.fileNumber} />
              )}
              {project.electRequestNumber && (
                <InfoField label="شماره درخواست" value={project.electRequestNumber} />
              )}
              {project.solarCreated && (
                <InfoField label="تاریخ ثبت" value={project.solarCreated} />
              )}
            </dl>
          </Card>

          {/* ── Inspection checklist ── */}
          <Card title="چک‌لیست نظارت">
            <p className="text-xs text-[var(--text-muted)] mb-4">
              موارد زیر باید توسط مهندس ناظر بررسی و تأیید شوند.
            </p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-primary)]">
                  <th className="text-right pb-2 text-xs font-medium text-[var(--text-muted)]">
                    مورد بازرسی
                  </th>
                  <th className="text-center pb-2 text-xs font-medium text-[var(--text-muted)] w-24">
                    وضعیت
                  </th>
                </tr>
              </thead>
              <tbody>
                {checklist.map((item) => (
                  <tr
                    key={item.key}
                    className="border-b border-[var(--border-primary)] last:border-0"
                  >
                    <td className="py-3 text-[var(--text-primary)]">{item.label}</td>
                    <td className="py-3 text-center">
                      {item.done ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-medium">
                          <span className="text-base leading-none">✓</span>
                          تأیید
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[var(--text-muted)] text-xs">
                          <span className="text-base leading-none">✗</span>
                          ندارد
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {allChecksDone && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 text-center">
                تمامی موارد نظارت تأیید شده‌اند
              </div>
            )}
          </Card>

          {/* ── ERT / Earth test info ── */}
          <Card title="اطلاعات آزمون ارت (ERT)">
            <div className="flex flex-wrap gap-3">
              <BoolBadge label="سیستم ارت" value={project.isEarthSystem} />
              <BoolBadge label="آزمون ارت" value={project.isErtTest} />
              <BoolBadge label="نیاز به EB" value={project.isNeedEb} />
            </div>
            {project.foundationElectrodeArea !== undefined &&
              project.foundationElectrodeArea !== null && (
                <dl className="mt-4 grid grid-cols-2 gap-4">
                  <InfoField
                    label="مساحت الکترود پی (m²)"
                    value={project.foundationElectrodeArea}
                  />
                  {project.amountPerArea !== undefined && project.amountPerArea !== null && (
                    <InfoField label="مقدار به ازای متر" value={project.amountPerArea} />
                  )}
                </dl>
              )}
            {!project.isErtTest && !project.isEarthSystem && (
              <p className="mt-3 text-xs text-[var(--text-muted)]">
                آزمون ارت برای این پروژه الزامی نیست.
              </p>
            )}
          </Card>

          {/* ── Engineer notes ── */}
          <EngNotesForm projectId={id} initialNotes={project.defectDes ?? ""} />
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-6">
          {/* Progress timeline */}
          <Card title="مراحل پروژه">
            <ol className="relative border-r border-[var(--border-primary)] mr-3 space-y-3">
              {ALL_STAGES.map((stageLevel) => {
                const isDone = stageLevel < currentLevel;
                const isCurrent = stageLevel === currentLevel;
                return (
                  <li key={stageLevel} className="mr-4">
                    <span
                      className={`absolute -right-2 flex items-center justify-center w-4 h-4 rounded-full border-2 ${
                        isDone
                          ? "bg-emerald-500 border-emerald-500"
                          : isCurrent
                          ? "bg-[var(--accent-primary)] border-[var(--accent-primary)]"
                          : "bg-[var(--bg-secondary)] border-[var(--border-primary)]"
                      }`}
                    />
                    <p
                      className={`text-xs pr-2 ${
                        isDone
                          ? "text-emerald-500"
                          : isCurrent
                          ? "text-[var(--text-primary)] font-semibold"
                          : "text-[var(--text-muted)]"
                      }`}
                    >
                      {ProjectLevelLabel[stageLevel]}
                    </p>
                  </li>
                );
              })}
            </ol>
          </Card>

          {/* Technical flags */}
          <Card title="مشخصات فنی">
            <div className="flex flex-wrap gap-2">
              <BoolBadge label="تابلو برق" value={project.panelNeed} />
              <BoolBadge label="تأیید تابلو" value={project.panelMakerSubmit} />
              <BoolBadge label="بازرسی ساختمان" value={project.isBuildingInspection} />
              <BoolBadge label="تست و تحویل" value={project.isTestAndDelivery} />
              <BoolBadge label="پروژه بزرگ" value={project.isBigProject} />
              <BoolBadge label="شبکه برق" value={project.needElectNetwork} />
              <BoolBadge label="مجوز مرتبط" value={project.hasRelatedPermit} />
            </div>
            {project.panelSerialNumber && (
              <dl className="mt-4">
                <InfoField label="سریال تابلو" value={project.panelSerialNumber} />
              </dl>
            )}
          </Card>

          {/* Supervisor */}
          {project.hasSupervision && project.supervisorName && (
            <Card title="اطلاعات ناظر">
              <dl className="space-y-3">
                <InfoField label="نام ناظر" value={project.supervisorName} />
                <InfoField label="شماره تماس ناظر" value={project.supervisorPhoneNumber} />
              </dl>
            </Card>
          )}

          {/* Defect status */}
          {project.isDefectEng && (
            <Card title="نقص مهندسی">
              <div className="flex flex-wrap gap-2 mb-3">
                <BoolBadge label="نقص ثبت شده" value={project.isDefectEng} />
                <BoolBadge label="نقص رفع شده" value={project.solvedDefectEng} />
              </div>
              {project.defectDes && (
                <p className="text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)] rounded-xl p-3">
                  {project.defectDes}
                </p>
              )}
            </Card>
          )}

          {/* Completion button */}
          {allChecksDone && currentLevel < 9 && (
            <div className="bg-[var(--bg-card)] border border-emerald-500/30 rounded-2xl p-6">
              <h2 className="text-base font-semibold text-emerald-400 mb-3">
                تأیید تکمیل نظارت
              </h2>
              <p className="text-xs text-[var(--text-muted)] mb-4">
                تمامی موارد چک‌لیست تأیید شده‌اند. پس از اطمینان از صحت اطلاعات، تکمیل نظارت را ثبت کنید.
              </p>
              <Link
                href={`/app/projects/${id}`}
                className="block w-full text-center px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
              >
                تأیید تکمیل نظارت
              </Link>
            </div>
          )}

          {/* Description */}
          {project.description && (
            <Card title="توضیحات">
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {project.description}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
