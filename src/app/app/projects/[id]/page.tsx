import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Settings, Eye } from "lucide-react";
import { getProjectById } from "../actions";
import { getUserRoles, hasRole } from "@/lib/auth";
import {
  ProjectLevelLabel,
  PROJECT_LEVEL_COLORS,
  BuildingTypeLabel,
} from "@/services/mock/projects";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = await getProjectById(id);
  return {
    title: project
      ? `پروژه ${project.fileNumber ?? project.electRequestNumber ?? id}`
      : "پروژه",
  };
}

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

const ALL_STAGES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function Flag({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span
        className={`w-2 h-2 rounded-full flex-shrink-0 ${value ? "bg-emerald-500" : "bg-gray-500"}`}
      />
      <span className={value ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}>
        {label}
      </span>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6">
      <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4 pb-3 border-b border-[var(--border-primary)]">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div>
      <dt className="text-xs text-[var(--text-muted)] mb-0.5">{label}</dt>
      <dd className="text-sm text-[var(--text-primary)] font-medium">{value ?? "—"}</dd>
    </div>
  );
}

export default async function AppProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, roles] = await Promise.all([
    getProjectById(id),
    getUserRoles(),
  ]);

  if (!project) notFound();

  const currentLevel = project.projectLevel;

  const canManageProcess = hasRole(
    roles,
    "Administrator",
    "Employee",
    "Section",
    "ElectAdmin"
  );
  const isEngineer = hasRole(roles, "Engineer");

  return (
    <div className="p-6 sm:p-8" dir="rtl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link
            href="/app/projects"
            className="flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-2"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
            بازگشت به پروژه‌ها
          </Link>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {project.fileNumber ?? project.electRequestNumber ?? "جزئیات پروژه"}
          </h1>
          <p className="text-[var(--text-muted)] mt-1 text-sm">
            {BuildingTypeLabel[project.buildingType] ?? "—"} — {project.landlordName}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {canManageProcess && (
            <Link
              href={`/app/projects/${id}/process`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium hover:bg-[var(--accent-primary)]/90 transition-colors"
            >
              <Settings className="w-4 h-4" />
              مدیریت فرآیند
            </Link>
          )}
          {isEngineer && (
            <Link
              href={`/app/projects/${id}/eng`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-primary)] text-[var(--text-secondary)] text-sm font-medium hover:bg-[var(--bg-secondary)] transition-colors"
            >
              <Eye className="w-4 h-4" />
              مشاهده نظارتی
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content: 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Owner info */}
          <Card title="اطلاعات مالک">
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field label="نام مالک" value={project.landlordName} />
              <Field label="کد ملی" value={project.landlordNaCode} />
              <Field label="شماره تماس" value={project.landlordPhoneNumber} />
              {project.companyName && (
                <Field label="نام شرکت" value={project.companyName} />
              )}
              {project.licenseNumber && (
                <Field label="شماره پروانه" value={project.licenseNumber} />
              )}
            </dl>
          </Card>

          {/* Building info */}
          <Card title="اطلاعات ساختمان">
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
              <Field
                label="نوع ساختمان"
                value={BuildingTypeLabel[project.buildingType]}
              />
              <Field label="نوع انشعاب" value={BRANCHING_TYPE_LABEL[project.projectTypeRequest]} />
              <Field label="تعداد طبقات" value={project.numberOfFloor} />
              {project.desNumberOfFloor !== undefined && (
                <Field label="تعداد طبقات (مصوب)" value={project.desNumberOfFloor} />
              )}
            </dl>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-[var(--border-primary)]">
              <Flag label="سیستم ارت" value={project.isEarthSystem} />
              <Flag label="نیاز به تابلو" value={project.panelNeed} />
              <Flag label="آزمون ارت" value={project.isErtTest} />
              <Flag label="بازرسی ساختمان" value={project.isBuildingInspection} />
              <Flag label="تست و تحویل" value={project.isTestAndDelivery} />
              <Flag label="پروژه بزرگ" value={project.isBigProject} />
              <Flag label="دارای ناظر" value={project.hasSupervision} />
              <Flag label="مجوز مرتبط" value={project.hasRelatedPermit} />
              <Flag label="شبکه برق" value={project.needElectNetwork} />
              <Flag label="نیاز به EB" value={project.isNeedEb} />
            </div>
          </Card>

          {/* Location */}
          <Card title="موقعیت مکانی">
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field label="استان" value="کردستان" />
              <Field
                label="شهر"
                value={project.cityId ? KURDISTAN_CITIES[project.cityId] : undefined}
              />
              <Field label="بخش (ID)" value={project.sectionId} />
              <div className="col-span-2 sm:col-span-3">
                <Field label="آدرس" value={project.address} />
              </div>
              <Field label="کد پستی" value={project.postalCode} />
            </dl>
          </Card>

          {/* Description */}
          {project.description && (
            <Card title="توضیحات">
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {project.description}
              </p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status + timeline */}
          <Card title="وضعیت پروژه">
            <div className="mb-4 flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium text-white ${PROJECT_LEVEL_COLORS[currentLevel] ?? "bg-gray-500"}`}
              >
                {ProjectLevelLabel[currentLevel]}
              </span>
              {project.isStop && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-red-500/10 text-red-400">
                  متوقف
                </span>
              )}
              {project.isOk && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-500/10 text-emerald-400">
                  تأیید شده
                </span>
              )}
            </div>

            {/* Timeline */}
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

            {project.stopDes && (
              <div className="mt-4 p-3 rounded-xl bg-red-500/10 text-xs text-red-400">
                <strong>دلیل توقف:</strong> {project.stopDes}
              </div>
            )}
          </Card>

          {/* Supervisor info */}
          {project.hasSupervision && project.supervisorName && (
            <Card title="اطلاعات ناظر">
              <dl className="space-y-3">
                <Field label="نام ناظر" value={project.supervisorName} />
                <Field
                  label="شماره تماس ناظر"
                  value={project.supervisorPhoneNumber}
                />
              </dl>
            </Card>
          )}

          {/* Panel info */}
          {project.panelNeed && project.panelSerialNumber && (
            <Card title="اطلاعات تابلو">
              <Field label="سریال تابلو" value={project.panelSerialNumber} />
              <div className="mt-2">
                <Flag
                  label="تابلو تأیید شده توسط سازنده"
                  value={project.panelMakerSubmit}
                />
              </div>
            </Card>
          )}

          {/* Defect info */}
          {project.isDefectEng && (
            <Card title="نقص مهندسی">
              <Flag label="رفع نقص" value={project.solvedDefectEng} />
              {project.defectDes && (
                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  {project.defectDes}
                </p>
              )}
            </Card>
          )}

          {/* Date info */}
          <Card title="تاریخ‌ها">
            <dl className="space-y-3">
              {project.solarCreated && (
                <Field label="تاریخ ایجاد (شمسی)" value={project.solarCreated} />
              )}
              {project.createdAt && (
                <Field
                  label="تاریخ ثبت"
                  value={new Date(project.createdAt).toLocaleDateString("fa-IR")}
                />
              )}
              {project.updatedAt && (
                <Field
                  label="آخرین به‌روزرسانی"
                  value={new Date(project.updatedAt).toLocaleDateString("fa-IR")}
                />
              )}
            </dl>
          </Card>

          {/* CTA for process management */}
          {canManageProcess && (
            <Link
              href={`/app/projects/${id}/process`}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium hover:bg-[var(--accent-primary)]/90 transition-colors"
            >
              <Settings className="w-4 h-4" />
              مدیریت فرآیند پروژه
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
