"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  ChevronDown,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Loader2,
  UserCheck,
  BarChart3,
  List,
  FileText,
  X,
  Check,
} from "lucide-react";
import { assignEngineer, updateProjectLevel, stopProject, resumeProject } from "../../actions";
import type { ElectProject } from "@/services/mock/projects";
import type { Engineer } from "@/services/mock/engineers";
import { ProjectLevelLabel } from "@/services/mock/projects";

// ---- Process checklist items (static definition) ----
const CHECKLIST_ITEMS: { id: string; label: string; level: number }[] = [
  { id: "request-received", label: "ثبت درخواست توسط متقاضی", level: 0 },
  { id: "review-started", label: "شروع بررسی توسط کارشناس", level: 1 },
  { id: "engineer-assigned", label: "تخصیص مهندس ناظر", level: 1 },
  { id: "map-submitted", label: "ارسال نقشه برق", level: 2 },
  { id: "map-approved", label: "تأیید نقشه برق", level: 2 },
  { id: "site-test", label: "انجام آزمون سایت", level: 3 },
  { id: "ert-test", label: "آزمون ارت (مقاومت زمین)", level: 4 },
  { id: "panel-installed", label: "نصب تابلو برق", level: 5 },
  { id: "panel-serial", label: "ثبت سریال تابلو", level: 5 },
  { id: "building-inspection", label: "بازرسی ساختمان", level: 6 },
  { id: "test-delivery", label: "تست نهایی و تحویل", level: 7 },
  { id: "docs-complete", label: "تکمیل مدارک پرونده", level: 8 },
];

const FIELD_TYPE_LABEL: Record<number, string> = {
  0: "برق قدرت",
  1: "برق الکترونیک",
  2: "الکترومکانیک",
};

// ---- Tabs ----
type TabId = "engineer" | "level" | "checklist" | "stop";

interface ProcessClientProps {
  project: ElectProject;
  engineers: Engineer[];
  canEdit: boolean;
}

export default function ProcessClient({
  project,
  engineers,
  canEdit,
}: ProcessClientProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<TabId>("engineer");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Engineer assignment state
  const [selectedEngineerId, setSelectedEngineerId] = useState<string>(
    engineers.find(
      (e) => e.fullName === project.supervisorName
    )?.id ?? ""
  );

  // Level state
  const [selectedLevel, setSelectedLevel] = useState<number>(
    project.projectLevel
  );

  // Checklist state — derived from project level (items at or below current level are "done")
  const [checkedItems, setCheckedItems] = useState<Set<string>>(
    () =>
      new Set(
        CHECKLIST_ITEMS.filter((item) => item.level < project.projectLevel).map(
          (item) => item.id
        )
      )
  );

  // Stop form state
  const [stopReason, setStopReason] = useState("");
  const [showStopForm, setShowStopForm] = useState(false);

  function clearMessages() {
    setError("");
    setSuccessMsg("");
  }

  // ---- Assign engineer ----
  function handleAssignEngineer() {
    if (!selectedEngineerId) {
      setError("لطفاً یک مهندس انتخاب کنید.");
      return;
    }
    const eng = engineers.find((e) => e.id === selectedEngineerId);
    if (!eng) return;

    clearMessages();
    startTransition(async () => {
      const res = await assignEngineer(
        project.id,
        selectedEngineerId,
        eng.fullName,
        eng.cellPhone ?? ""
      );
      if (res.ok) {
        setSuccessMsg("مهندس با موفقیت انتساب یافت.");
        router.refresh();
      } else {
        setError(res.error ?? "خطا در انتساب مهندس");
      }
    });
  }

  // ---- Update level ----
  function handleUpdateLevel() {
    clearMessages();
    startTransition(async () => {
      const res = await updateProjectLevel(project.id, selectedLevel);
      if (res.ok) {
        setSuccessMsg("سطح پروژه به‌روزرسانی شد.");
        router.refresh();
      } else {
        setError(res.error ?? "خطا در به‌روزرسانی سطح");
      }
    });
  }

  // ---- Stop project ----
  function handleStop(e: React.FormEvent) {
    e.preventDefault();
    if (!stopReason.trim()) {
      setError("دلیل توقف اجباری است.");
      return;
    }
    clearMessages();
    startTransition(async () => {
      const res = await stopProject(project.id, stopReason);
      if (res.ok) {
        setSuccessMsg("پروژه متوقف شد.");
        setShowStopForm(false);
        setStopReason("");
        router.refresh();
      } else {
        setError(res.error ?? "خطا در توقف پروژه");
      }
    });
  }

  // ---- Resume project ----
  function handleResume() {
    clearMessages();
    startTransition(async () => {
      const res = await resumeProject(project.id);
      if (res.ok) {
        setSuccessMsg("پروژه از حالت توقف خارج شد.");
        router.refresh();
      } else {
        setError(res.error ?? "خطا در از سرگیری پروژه");
      }
    });
  }

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "engineer", label: "انتساب مهندس", icon: UserCheck },
    { id: "level", label: "سطح پروژه", icon: BarChart3 },
    { id: "checklist", label: "چک‌لیست", icon: List },
    { id: "stop", label: "توقف / از سرگیری", icon: AlertTriangle },
  ];

  return (
    <div dir="rtl">
      {/* Global messages */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
      {successMsg && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 flex items-center gap-2">
          <Check className="w-4 h-4 flex-shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Project status bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3 p-4 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl">
        <span className="text-sm text-[var(--text-muted)]">وضعیت فعلی:</span>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${getLevelColor(project.projectLevel)}`}
        >
          {ProjectLevelLabel[project.projectLevel] ?? "نامشخص"}
        </span>
        {project.isStop && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertTriangle className="w-3.5 h-3.5" />
            متوقف
          </span>
        )}
        {project.hasSupervision && project.supervisorName && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <User className="w-3.5 h-3.5" />
            {project.supervisorName}
          </span>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-[var(--bg-secondary)] rounded-xl mb-6 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              setActiveTab(id);
              clearMessages();
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-1 justify-center ${
              activeTab === id
                ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6">
        {activeTab === "engineer" && (
          <EngineerTab
            project={project}
            engineers={engineers}
            selectedEngineerId={selectedEngineerId}
            onSelectEngineer={setSelectedEngineerId}
            onAssign={handleAssignEngineer}
            canEdit={canEdit}
            pending={pending}
          />
        )}

        {activeTab === "level" && (
          <LevelTab
            currentLevel={project.projectLevel}
            selectedLevel={selectedLevel}
            onSelectLevel={setSelectedLevel}
            onSave={handleUpdateLevel}
            canEdit={canEdit}
            pending={pending}
          />
        )}

        {activeTab === "checklist" && (
          <ChecklistTab
            checkedItems={checkedItems}
            onToggle={(itemId) => {
              if (!canEdit) return;
              setCheckedItems((prev) => {
                const next = new Set(prev);
                if (next.has(itemId)) {
                  next.delete(itemId);
                } else {
                  next.add(itemId);
                }
                return next;
              });
            }}
            canEdit={canEdit}
            projectLevel={project.projectLevel}
          />
        )}

        {activeTab === "stop" && (
          <StopTab
            project={project}
            stopReason={stopReason}
            onStopReasonChange={setStopReason}
            showStopForm={showStopForm}
            onShowStopForm={setShowStopForm}
            onStop={handleStop}
            onResume={handleResume}
            canEdit={canEdit}
            pending={pending}
          />
        )}
      </div>
    </div>
  );
}

// ---- Helper ----
function getLevelColor(level: number): string {
  const colors: Record<number, string> = {
    0: "bg-gray-500",
    1: "bg-yellow-500",
    2: "bg-blue-500",
    3: "bg-purple-500",
    4: "bg-orange-500",
    5: "bg-teal-500",
    6: "bg-indigo-500",
    7: "bg-pink-500",
    8: "bg-green-500",
    9: "bg-emerald-600",
  };
  return colors[level] ?? "bg-gray-500";
}

// ---- Engineer Tab ----
function EngineerTab({
  project,
  engineers,
  selectedEngineerId,
  onSelectEngineer,
  onAssign,
  canEdit,
  pending,
}: {
  project: ElectProject;
  engineers: Engineer[];
  selectedEngineerId: string;
  onSelectEngineer: (id: string) => void;
  onAssign: () => void;
  canEdit: boolean;
  pending: boolean;
}) {
  return (
    <div>
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">
        انتساب مهندس ناظر
      </h3>

      {/* Current assignment */}
      {project.hasSupervision && project.supervisorName ? (
        <div className="mb-4 p-4 rounded-xl bg-blue-500/8 border border-blue-500/20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/15 flex items-center justify-center text-blue-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {project.supervisorName}
            </p>
            {project.supervisorPhoneNumber && (
              <p className="text-xs text-[var(--text-muted)]" dir="ltr">
                {project.supervisorPhoneNumber}
              </p>
            )}
          </div>
          <span className="mr-auto text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
            ناظر فعلی
          </span>
        </div>
      ) : (
        <div className="mb-4 p-4 rounded-xl bg-[var(--bg-secondary)] border border-dashed border-[var(--border-primary)] text-center">
          <User className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
          <p className="text-sm text-[var(--text-muted)]">
            هنوز مهندسی به این پروژه انتساب نیافته است
          </p>
        </div>
      )}

      {canEdit && (
        <>
          {/* Engineer list */}
          {engineers.length === 0 ? (
            <div className="text-sm text-[var(--text-muted)] text-center py-8">
              هیچ مهندس فعالی یافت نشد
            </div>
          ) : (
            <div className="space-y-2 mb-4 max-h-80 overflow-y-auto">
              {engineers.map((eng) => (
                <button
                  key={eng.id}
                  onClick={() => onSelectEngineer(eng.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-right transition-colors ${
                    selectedEngineerId === eng.id
                      ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/8"
                      : "border-[var(--border-primary)] hover:bg-[var(--bg-secondary)]"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      selectedEngineerId === eng.id
                        ? "bg-[var(--accent-primary)] text-white"
                        : "bg-[var(--bg-secondary)] text-[var(--text-muted)]"
                    }`}
                  >
                    {eng.fullName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {eng.fullName}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {FIELD_TYPE_LABEL[eng.fieldType] ?? "—"}
                      {eng.cellPhone && (
                        <span dir="ltr" className="mr-2">
                          {eng.cellPhone}
                        </span>
                      )}
                    </p>
                  </div>
                  {/* Certs */}
                  <div className="flex gap-1 flex-shrink-0">
                    {eng.certOfTest && (
                      <span className="px-1.5 py-0.5 text-[10px] rounded bg-purple-500/10 text-purple-400">
                        تست
                      </span>
                    )}
                    {eng.certOfEarth && (
                      <span className="px-1.5 py-0.5 text-[10px] rounded bg-teal-500/10 text-teal-400">
                        ارت
                      </span>
                    )}
                    {eng.certOfInspection && (
                      <span className="px-1.5 py-0.5 text-[10px] rounded bg-blue-500/10 text-blue-400">
                        بازرسی
                      </span>
                    )}
                  </div>
                  {selectedEngineerId === eng.id && (
                    <Check className="w-4 h-4 text-[var(--accent-primary)] flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={onAssign}
            disabled={pending || !selectedEngineerId}
            className="w-full py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium hover:bg-[var(--accent-primary)]/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {pending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserCheck className="w-4 h-4" />
            )}
            {pending ? "در حال ذخیره…" : "تأیید انتساب مهندس"}
          </button>
        </>
      )}

      {!canEdit && (
        <p className="text-sm text-[var(--text-muted)] text-center py-4">
          شما دسترسی لازم برای تغییر انتساب مهندس را ندارید.
        </p>
      )}
    </div>
  );
}

// ---- Level Tab ----
function LevelTab({
  currentLevel,
  selectedLevel,
  onSelectLevel,
  onSave,
  canEdit,
  pending,
}: {
  currentLevel: number;
  selectedLevel: number;
  onSelectLevel: (level: number) => void;
  onSave: () => void;
  canEdit: boolean;
  pending: boolean;
}) {
  const levels = Object.entries(ProjectLevelLabel).map(([key, label]) => ({
    value: Number(key),
    label,
  }));

  return (
    <div>
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">
        سطح پروژه
      </h3>
      <p className="text-sm text-[var(--text-muted)] mb-4">
        سطح فعلی:{" "}
        <strong className="text-[var(--text-secondary)]">
          {ProjectLevelLabel[currentLevel] ?? "نامشخص"}
        </strong>
      </p>

      {canEdit ? (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              انتخاب سطح جدید
            </label>
            <div className="relative">
              <select
                value={selectedLevel}
                onChange={(e) => onSelectLevel(Number(e.target.value))}
                className="w-full appearance-none px-4 py-3 pr-10 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 focus:border-[var(--accent-primary)] transition-colors"
              >
                {levels.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
            </div>
          </div>

          {/* Visual timeline */}
          <ol className="relative border-r-2 border-[var(--border-primary)] mr-3 space-y-3 mb-5">
            {levels.map(({ value, label }) => {
              const isBefore = value < selectedLevel;
              const isCurrent = value === selectedLevel;
              const isProjectCurrent = value === currentLevel;
              return (
                <li
                  key={value}
                  className="mr-5 cursor-pointer"
                  onClick={() => canEdit && onSelectLevel(value)}
                >
                  <span
                    className={`absolute -right-2.5 flex items-center justify-center w-5 h-5 rounded-full border-2 transition-colors ${
                      isBefore
                        ? "bg-emerald-500 border-emerald-500"
                        : isCurrent
                        ? "bg-[var(--accent-primary)] border-[var(--accent-primary)]"
                        : "bg-[var(--bg-secondary)] border-[var(--border-primary)]"
                    }`}
                  />
                  <p
                    className={`text-xs ${
                      isBefore
                        ? "text-emerald-500"
                        : isCurrent
                        ? "text-[var(--text-primary)] font-bold"
                        : "text-[var(--text-muted)]"
                    }`}
                  >
                    {label}
                    {isProjectCurrent && value !== selectedLevel && (
                      <span className="mr-2 text-[10px] text-yellow-400">(فعلی)</span>
                    )}
                  </p>
                </li>
              );
            })}
          </ol>

          <button
            onClick={onSave}
            disabled={pending || selectedLevel === currentLevel}
            className="w-full py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium hover:bg-[var(--accent-primary)]/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {pending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <BarChart3 className="w-4 h-4" />
            )}
            {pending ? "در حال ذخیره…" : "ذخیره سطح جدید"}
          </button>
        </>
      ) : (
        <div className="space-y-2">
          {levels.map(({ value, label }) => {
            const isDone = value < currentLevel;
            const isCurrent = value === currentLevel;
            return (
              <div
                key={value}
                className={`flex items-center gap-3 p-2.5 rounded-xl ${
                  isCurrent
                    ? "bg-[var(--accent-primary)]/8 border border-[var(--accent-primary)]/20"
                    : ""
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                ) : isCurrent ? (
                  <div className="w-4 h-4 rounded-full bg-[var(--accent-primary)] flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
                )}
                <span
                  className={`text-sm ${
                    isDone
                      ? "text-emerald-500"
                      : isCurrent
                      ? "text-[var(--text-primary)] font-semibold"
                      : "text-[var(--text-muted)]"
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---- Checklist Tab ----
function ChecklistTab({
  checkedItems,
  onToggle,
  canEdit,
  projectLevel,
}: {
  checkedItems: Set<string>;
  onToggle: (id: string) => void;
  canEdit: boolean;
  projectLevel: number;
}) {
  const total = CHECKLIST_ITEMS.length;
  const done = checkedItems.size;
  const percent = Math.round((done / total) * 100);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-[var(--text-primary)]">
          چک‌لیست فرآیند
        </h3>
        <span className="text-sm text-[var(--text-muted)]">
          {done} از {total} مورد
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--accent-primary)] rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-1 text-left" dir="ltr">
          {percent}%
        </p>
      </div>

      {/* Items grouped by level */}
      <div className="space-y-2">
        {CHECKLIST_ITEMS.map((item) => {
          const isChecked = checkedItems.has(item.id);
          const isRelevant = item.level <= projectLevel;
          return (
            <button
              key={item.id}
              onClick={() => onToggle(item.id)}
              disabled={!canEdit}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-right transition-colors ${
                isChecked
                  ? "border-emerald-500/30 bg-emerald-500/6"
                  : isRelevant
                  ? "border-[var(--border-primary)] hover:bg-[var(--bg-secondary)]"
                  : "border-dashed border-[var(--border-primary)] opacity-50"
              } ${!canEdit ? "cursor-default" : "cursor-pointer"}`}
            >
              {isChecked ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-[var(--text-muted)] flex-shrink-0" />
              )}
              <span
                className={`text-sm flex-1 ${
                  isChecked
                    ? "text-emerald-600 line-through decoration-emerald-500/40"
                    : "text-[var(--text-secondary)]"
                }`}
              >
                {item.label}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] bg-[var(--bg-secondary)] px-2 py-0.5 rounded-full flex-shrink-0">
                مرحله {item.level}
              </span>
            </button>
          );
        })}
      </div>

      {!canEdit && (
        <p className="text-xs text-[var(--text-muted)] text-center mt-4">
          این چک‌لیست فقط قابل مشاهده است
        </p>
      )}
    </div>
  );
}

// ---- Stop Tab ----
function StopTab({
  project,
  stopReason,
  onStopReasonChange,
  showStopForm,
  onShowStopForm,
  onStop,
  onResume,
  canEdit,
  pending,
}: {
  project: ElectProject;
  stopReason: string;
  onStopReasonChange: (v: string) => void;
  showStopForm: boolean;
  onShowStopForm: (v: boolean) => void;
  onStop: (e: React.FormEvent) => void;
  onResume: () => void;
  canEdit: boolean;
  pending: boolean;
}) {
  if (!canEdit) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3 opacity-40" />
        <p className="text-sm text-[var(--text-muted)]">
          شما دسترسی لازم برای توقف یا از سرگیری پروژه را ندارید.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">
        مدیریت توقف پروژه
      </h3>

      {project.isStop ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-red-500/8 border border-red-500/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-sm font-medium text-red-400">
                این پروژه در حال حاضر متوقف است
              </span>
            </div>
            {project.stopDes && (
              <p className="text-sm text-[var(--text-muted)]">
                دلیل: {project.stopDes}
              </p>
            )}
          </div>

          <button
            onClick={onResume}
            disabled={pending}
            className="w-full py-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 text-sm font-medium disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {pending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {pending ? "در حال پردازش…" : "از سرگیری پروژه"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-muted)]">
            با توقف پروژه، فرآیند متوقف شده و تا زمان تعیین دلیل رفع توقف، ادامه نخواهد یافت.
          </p>

          {!showStopForm ? (
            <button
              onClick={() => onShowStopForm(true)}
              disabled={project.projectLevel >= 9}
              className="w-full py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              توقف پروژه
            </button>
          ) : (
            <form onSubmit={onStop} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                  دلیل توقف پروژه
                </label>
                <textarea
                  value={stopReason}
                  onChange={(e) => onStopReasonChange(e.target.value)}
                  placeholder="دلیل توقف را به‌طور دقیق شرح دهید…"
                  rows={4}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400 transition-colors"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={pending}
                  className="flex-1 py-2.5 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25 text-sm font-medium disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  {pending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                  {pending ? "در حال پردازش…" : "تأیید توقف"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onShowStopForm(false);
                    onStopReasonChange("");
                  }}
                  className="px-4 py-2.5 rounded-xl border border-[var(--border-primary)] text-sm text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
