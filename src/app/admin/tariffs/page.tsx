"use client";

import { useState, useTransition } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import {
  getQuarterTariffs,
  getBuildingTariffs,
  saveQuarterTariff,
  saveBuildingTariff,
  deleteQuarterTariff,
  deleteBuildingTariff,
} from "./actions";
import type { QuarterTariff, BuildingTariff } from "@/services/mock/tariffs";
import { useEffect } from "react";

// ─── Label maps ────────────────────────────────────────────────────────────

const QuarterLabel: Record<number, string> = {
  1: "بهار",
  2: "تابستان",
  3: "پاییز",
  4: "زمستان",
};

const BuildingGroupLabel: Record<number, string> = {
  0: "مسکونی",
  1: "تجاری",
  2: "اداری",
  3: "صنعتی",
  4: "عمومی",
};

function toPersianDigits(str: string): string {
  return str.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

function formatToman(rial: number): string {
  const toman = Math.round(rial / 10);
  return toPersianDigits(toman.toLocaleString("en-US")) + " ت";
}

// ─── Types ──────────────────────────────────────────────────────────────────

type Tab = "quarter" | "building";

// ─── Quarter Tariff Form ────────────────────────────────────────────────────

function QuarterTariffForm({
  initial,
  onClose,
  onSaved,
}: {
  initial?: QuarterTariff;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await saveQuarterTariff(fd);
      if (res.ok) {
        onSaved();
        onClose();
      } else {
        setError(res.error ?? "خطا در ذخیره");
      }
    });
  }

  const inputCls =
    "w-full px-3 py-2 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-primary)] w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-primary)]">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">
            {initial ? "ویرایش تعرفه فصلی" : "تعرفه فصلی جدید"}
          </h3>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {initial && <input type="hidden" name="id" value={initial.id} />}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">فصل</label>
              <select name="quarterType" defaultValue={initial?.quarterType ?? 1} className={inputCls} required>
                {Object.entries(QuarterLabel).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">سال</label>
              <input name="year" type="number" defaultValue={initial?.year ?? 1403} className={inputCls} required />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">تعرفه (تومان)</label>
              <input name="fee" type="number" defaultValue={initial ? Math.round(initial.fee / 10) : ""} className={inputCls} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">تعرفه ERT</label>
              <input name="ertFee" type="number" defaultValue={initial ? Math.round(initial.ertFee / 10) : ""} className={inputCls} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">تعرفه آزمون</label>
              <input name="testAndDeliveryFee" type="number" defaultValue={initial ? Math.round(initial.testAndDeliveryFee / 10) : ""} className={inputCls} required />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">تعداد ERT</label>
              <input name="countErt" type="number" defaultValue={initial?.countErt ?? 0} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">تعداد آزمون</label>
              <input name="countTestDelivery" type="number" defaultValue={initial?.countTestDelivery ?? 0} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">درصد افزایش</label>
              <input name="percentIncrease" type="number" defaultValue={initial?.percentIncrease ?? 0} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">دوره (اختیاری)</label>
            <input name="period" type="text" defaultValue={initial?.period ?? ""} placeholder="مثال: ۱۴۰۳/۰۱/۰۱-۱۴۰۳/۰۳/۳۱" className={inputCls} />
          </div>
          <div className="flex items-center gap-2">
            <input name="isQuota" type="checkbox" value="true" defaultChecked={initial?.isQuota ?? false} className="rounded" />
            <label className="text-sm text-[var(--text-secondary)]">سهمیه‌دار</label>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium hover:bg-[var(--accent-primary)]/90 disabled:opacity-60 transition-colors"
            >
              {pending ? "در حال ذخیره…" : "ذخیره"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[var(--border-primary)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
            >
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Building Tariff Form ───────────────────────────────────────────────────

function BuildingTariffForm({
  initial,
  onClose,
  onSaved,
}: {
  initial?: BuildingTariff;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await saveBuildingTariff(fd);
      if (res.ok) {
        onSaved();
        onClose();
      } else {
        setError(res.error ?? "خطا در ذخیره");
      }
    });
  }

  const inputCls =
    "w-full px-3 py-2 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-primary)] w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-primary)]">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">
            {initial ? "ویرایش تعرفه ساختمانی" : "تعرفه ساختمانی جدید"}
          </h3>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {initial && <input type="hidden" name="id" value={initial.id} />}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">گروه ساختمانی</label>
              <select name="buildingGroupType" defaultValue={initial?.buildingGroupType ?? 0} className={inputCls} required>
                {Object.entries(BuildingGroupLabel).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">سال شمسی</label>
              <input name="solarYear" type="text" defaultValue={initial?.solarYear ?? "1403"} placeholder="۱۴۰۳" className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">تعرفه (تومان)</label>
              <input name="tariff" type="number" defaultValue={initial ? Math.round(initial.tariff / 10) : ""} className={inputCls} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">حداقل تعرفه</label>
              <input name="minTariff" type="number" defaultValue={initial ? Math.round(initial.minTariff / 10) : ""} className={inputCls} required />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">ضریب</label>
              <input name="factor" type="number" step="0.01" defaultValue={initial?.factor ?? 1} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">ضریب آزمون</label>
              <input name="testDeliveryFactor" type="number" step="0.01" defaultValue={initial?.testDeliveryFactor ?? 1} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">param</label>
              <input name="buildingGroupParam" type="number" defaultValue={initial?.buildingGroupParam ?? 0} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">تعرفه نظارت</label>
              <input name="supervisionTariff" type="number" defaultValue={initial ? Math.round(initial.supervisionTariff / 10) : "0"} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">حداقل نظارت</label>
              <input name="supervisionMinTariff" type="number" defaultValue={initial ? Math.round(initial.supervisionMinTariff / 10) : "0"} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">ضریب نظارت</label>
              <input name="supervisionFactor" type="number" step="0.01" defaultValue={initial?.supervisionFactor ?? 1} className={inputCls} />
            </div>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium hover:bg-[var(--accent-primary)]/90 disabled:opacity-60 transition-colors"
            >
              {pending ? "در حال ذخیره…" : "ذخیره"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[var(--border-primary)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
            >
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function TariffsPage() {
  const [tab, setTab] = useState<Tab>("quarter");
  const [quarterTariffs, setQuarterTariffs] = useState<QuarterTariff[]>([]);
  const [buildingTariffs, setBuildingTariffs] = useState<BuildingTariff[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingQuarter, setEditingQuarter] = useState<QuarterTariff | null | "new">(null);
  const [editingBuilding, setEditingBuilding] = useState<BuildingTariff | null | "new">(null);
  const [, startTransition] = useTransition();

  async function load() {
    setLoading(true);
    const [qt, bt] = await Promise.all([getQuarterTariffs(), getBuildingTariffs()]);
    setQuarterTariffs(qt);
    setBuildingTariffs(bt);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDeleteQuarter(id: string) {
    if (!confirm("آیا از حذف این تعرفه اطمینان دارید؟")) return;
    await deleteQuarterTariff(id);
    load();
  }

  async function handleDeleteBuilding(id: string) {
    if (!confirm("آیا از حذف این تعرفه اطمینان دارید؟")) return;
    await deleteBuildingTariff(id);
    load();
  }

  return (
    <div className="p-8">
      <AdminPageHeader
        title="تعرفه‌ها"
        description="مدیریت تعرفه‌های فصلی و ساختمانی"
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[var(--border-primary)]">
        {([["quarter", "تعرفه‌های فصلی"], ["building", "تعرفه‌های ساختمانی"]] as const).map(
          ([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                tab === key
                  ? "text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              {label}
            </button>
          )
        )}
      </div>

      {/* Quarter tariffs */}
      {tab === "quarter" && (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setEditingQuarter("new")}
              className="px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium hover:bg-[var(--accent-primary)]/90 transition-colors"
            >
              + تعرفه فصلی جدید
            </button>
          </div>
          <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                    <th className="text-right text-xs font-medium text-[var(--text-muted)] px-6 py-4">فصل / سال</th>
                    <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">تعرفه</th>
                    <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">ERT</th>
                    <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">آزمون</th>
                    <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">افزایش%</th>
                    <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">سهمیه</th>
                    <th className="px-4 py-4" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-primary)]">
                  {loading ? (
                    [...Array(3)].map((_, i) => (
                      <tr key={i}>
                        {[...Array(7)].map((_, j) => (
                          <td key={j} className="px-4 py-4">
                            <div className="h-4 bg-[var(--bg-secondary)] rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : quarterTariffs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-sm text-[var(--text-muted)]">هیچ تعرفه‌ای یافت نشد</td>
                    </tr>
                  ) : (
                    quarterTariffs.map((qt) => (
                      <tr key={qt.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-[var(--text-primary)]">
                          {QuarterLabel[qt.quarterType] ?? qt.quarterType} — {toPersianDigits(String(qt.year))}
                        </td>
                        <td className="px-4 py-4 text-sm tabular-nums text-[var(--text-primary)]">{formatToman(qt.fee)}</td>
                        <td className="px-4 py-4 text-sm tabular-nums text-[var(--text-secondary)]">{formatToman(qt.ertFee)}</td>
                        <td className="px-4 py-4 text-sm tabular-nums text-[var(--text-secondary)]">{formatToman(qt.testAndDeliveryFee)}</td>
                        <td className="px-4 py-4 text-sm tabular-nums text-[var(--text-secondary)]">
                          {toPersianDigits(String(qt.percentIncrease))}٪
                        </td>
                        <td className="px-4 py-4">
                          {qt.isQuota ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/15 text-green-400">بله</span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500/15 text-gray-400">خیر</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => setEditingQuarter(qt)}
                              className="text-xs text-[var(--accent-primary)] hover:underline"
                            >ویرایش</button>
                            <button
                              onClick={() => handleDeleteQuarter(qt.id)}
                              className="text-xs text-red-400 hover:underline"
                            >حذف</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Building tariffs */}
      {tab === "building" && (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setEditingBuilding("new")}
              className="px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium hover:bg-[var(--accent-primary)]/90 transition-colors"
            >
              + تعرفه ساختمانی جدید
            </button>
          </div>
          <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                    <th className="text-right text-xs font-medium text-[var(--text-muted)] px-6 py-4">گروه</th>
                    <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">سال</th>
                    <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">تعرفه</th>
                    <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">حداقل</th>
                    <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">ضریب</th>
                    <th className="text-right text-xs font-medium text-[var(--text-muted)] px-4 py-4">نظارت</th>
                    <th className="px-4 py-4" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-primary)]">
                  {loading ? (
                    [...Array(4)].map((_, i) => (
                      <tr key={i}>
                        {[...Array(7)].map((_, j) => (
                          <td key={j} className="px-4 py-4">
                            <div className="h-4 bg-[var(--bg-secondary)] rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : buildingTariffs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-sm text-[var(--text-muted)]">هیچ تعرفه‌ای یافت نشد</td>
                    </tr>
                  ) : (
                    buildingTariffs.map((bt) => (
                      <tr key={bt.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-[var(--text-primary)]">
                          {BuildingGroupLabel[bt.buildingGroupType] ?? bt.buildingGroupType}
                        </td>
                        <td className="px-4 py-4 text-sm text-[var(--text-muted)]">
                          {bt.solarYear ? toPersianDigits(bt.solarYear) : "—"}
                        </td>
                        <td className="px-4 py-4 text-sm tabular-nums text-[var(--text-primary)]">{formatToman(bt.tariff)}</td>
                        <td className="px-4 py-4 text-sm tabular-nums text-[var(--text-secondary)]">{formatToman(bt.minTariff)}</td>
                        <td className="px-4 py-4 text-sm tabular-nums text-[var(--text-secondary)]">
                          {toPersianDigits(String(bt.factor))}
                        </td>
                        <td className="px-4 py-4 text-sm tabular-nums text-[var(--text-secondary)]">{formatToman(bt.supervisionTariff)}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => setEditingBuilding(bt)}
                              className="text-xs text-[var(--accent-primary)] hover:underline"
                            >ویرایش</button>
                            <button
                              onClick={() => handleDeleteBuilding(bt.id)}
                              className="text-xs text-red-400 hover:underline"
                            >حذف</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      {editingQuarter !== null && (
        <QuarterTariffForm
          initial={editingQuarter === "new" ? undefined : editingQuarter}
          onClose={() => setEditingQuarter(null)}
          onSaved={load}
        />
      )}
      {editingBuilding !== null && (
        <BuildingTariffForm
          initial={editingBuilding === "new" ? undefined : editingBuilding}
          onClose={() => setEditingBuilding(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}
