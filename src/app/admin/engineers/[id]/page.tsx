import { notFound } from "next/navigation";
import type { Metadata } from "next";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import EngineerForm from "../EngineerForm";
import { getEngineerById } from "../actions";
import AddHistoryForm from "./AddHistoryForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const engineer = await getEngineerById(id);
  return { title: engineer ? engineer.fullName : "مهندس یافت نشد" };
}

async function getHistory(engineerId: string) {
  const provider = process.env.NEXT_PUBLIC_DATA_PROVIDER ?? "mock";
  if (provider === "supabase") {
    const mod = await import("@/services/supabase/engineers");
    return mod.default.getHistory(engineerId);
  }
  const mod = await import("@/services/mock/engineers");
  return mod.default.getHistory(engineerId);
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default async function EngineerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const engineer = await getEngineerById(id);

  if (!engineer) {
    notFound();
  }

  const histories = await getHistory(id);

  return (
    <div className="p-6 space-y-6">
      <AdminPageHeader
        title={engineer.fullName}
        description={`کد ملی: ${engineer.naCode ?? "—"} | تلفن: ${engineer.cellPhone ?? "—"}`}
        backHref="/admin/engineers"
        backLabel="بازگشت به فهرست"
      />

      <EngineerForm initial={engineer} />

      {/* History Section */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] border-b border-[var(--border-primary)] pb-4 mb-5">
          تاریخچه فعالیت
        </h2>

        {/* Add History Form */}
        <AddHistoryForm engineerId={id} />

        {/* History List */}
        <div className="mt-6 space-y-3">
          {histories.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] text-center py-6">
              هیچ یادداشتی ثبت نشده است
            </p>
          ) : (
            histories.map((h) => (
              <div
                key={h.id}
                className="flex gap-4 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)]"
              >
                <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--text-primary)]">{h.description}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{formatDate(h.createdAt)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
