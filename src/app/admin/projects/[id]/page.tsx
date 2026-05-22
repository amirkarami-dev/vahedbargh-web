import { notFound } from "next/navigation";
import Link from "next/link";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { getProjectById } from "../actions";
import {
  ProjectLevelLabel,
  PROJECT_LEVEL_COLORS,
  BuildingTypeLabel,
} from "@/services/mock/projects";
import ProjectActions from "./ProjectActions";
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

const BUILDING_TYPE_FULL_LABEL: Record<number, string> = {
  0: "نامشخص",
  1: "مسکونی",
  2: "تجاری",
  3: "اداری",
  4: "صنعتی",
  5: "عمومی",
};

const BRANCHING_TYPE_LABEL: Record<number, string> = {
  0: "خانگی",
  1: "عمومی",
  2: "صنعتی",
  3: "سایر",
  4: "انشعاب موجود",
};

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

const ALL_STAGES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function Flag({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span
        className={`w-2 h-2 rounded-full ${value ? "bg-emerald-500" : "bg-gray-500"}`}
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

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <dt className="text-xs text-[var(--text-muted)] mb-0.5">{label}</dt>
      <dd className="text-sm text-[var(--text-primary)] font-medium">{value ?? "—"}</dd>
    </div>
  );
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  const currentLevel = project.projectLevel;

  return (
    <div className="p-8">
      <AdminPageHeader
        title={project.fileNumber ?? project.electRequestNumber ?? "جزئیات پروژه"}
        description={`${BuildingTypeLabel[project.buildingType] ?? ""} — ${project.landlordName}`}
        backHref="/admin/projects"
        backLabel="بازگشت به پروژه‌ها"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content: 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Owner info */}
          <Card title="اطلاعات مالک">
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field label="نام مالک" value={project.landlordName} />
              <Field label="کد ملی" value={project.landlordNaCode} />
              <Field label="شماره تماس" value={project.landlordPhoneNumber} />
              <Field label="نام شرکت" value={project.companyName} />
              <Field label="شماره پروانه" value={project.licenseNumber} />
            </dl>
          </Card>

          {/* Card 2: Building info */}
          <Card title="اطلاعات ساختمان">
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
              <Field
                label="نوع ساختمان"
                value={BUILDING_TYPE_FULL_LABEL[project.buildingType]}
              />
              <Field label="تعداد طبقات" value={project.numberOfFloor} />
              <Field label="تعداد طبقات (مصوب)" value={project.desNumberOfFloor} />
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

          {/* Card 3: Location */}
          <Card title="موقعیت">
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
              <Field label="عرض جغرافیایی" value={project.lat} />
              <Field label="طول جغرافیایی" value={project.lng} />
            </dl>
          </Card>

          {/* Card 5: Files */}
          <Card title="اسناد و مدارک">
            <div className="text-sm text-[var(--text-muted)] text-center py-6">
              هیچ سندی برای این پروژه بارگذاری نشده است
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Card 4: Status + timeline */}
          <Card title="وضعیت پروژه">
            <div className="mb-4">
              <span
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium text-white ${PROJECT_LEVEL_COLORS[currentLevel] ?? "bg-gray-500"}`}
              >
                {ProjectLevelLabel[currentLevel]}
              </span>
              {project.isStop && (
                <span className="mr-2 inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-red-500/10 text-red-400">
                  متوقف
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

          {/* Supervisor info if present */}
          {project.hasSupervision && project.supervisorName && (
            <Card title="اطلاعات ناظر">
              <dl className="space-y-3">
                <Field label="نام ناظر" value={project.supervisorName} />
                <Field label="شماره تماس ناظر" value={project.supervisorPhoneNumber} />
              </dl>
            </Card>
          )}

          {/* Panel info if present */}
          {project.panelNeed && project.panelSerialNumber && (
            <Card title="اطلاعات تابلو">
              <Field label="سریال تابلو" value={project.panelSerialNumber} />
              <div className="mt-2">
                <Flag label="تابلو تأیید شده توسط سازنده" value={project.panelMakerSubmit} />
              </div>
            </Card>
          )}

          {/* Actions */}
          <Card title="عملیات">
            <ProjectActions
              id={project.id}
              projectLevel={project.projectLevel}
              isStop={project.isStop}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
