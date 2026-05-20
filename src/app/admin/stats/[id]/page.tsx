import { notFound } from "next/navigation";
import { getStatsService } from "@/services";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import StatsForm from "../StatsForm";
import { updateStatAction } from "../actions";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const svc = await getStatsService();
  const stat = await svc.getById(id);
  return { title: stat ? `ویرایش: ${stat.label}` : "ویرایش آمار" };
}

export default async function EditStatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const svc = await getStatsService();
  const stat = await svc.getById(id);
  if (!stat) notFound();

  const action = updateStatAction.bind(null, id);

  return (
    <div className="p-8">
      <AdminPageHeader
        title="ویرایش آمار"
        description={stat.label}
        backHref="/admin/stats"
        backLabel="بازگشت به آمار"
      />
      <StatsForm initial={stat} action={action} submitLabel="ذخیره تغییرات" />
    </div>
  );
}
