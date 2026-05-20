import { getSettingsService } from "@/services";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import SettingsForm from "./SettingsForm";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "تنظیمات سایت" };

export default async function AdminSettingsPage() {
  const svc = await getSettingsService();
  const settings = await svc.getAll();

  return (
    <div className="p-8">
      <AdminPageHeader
        title="تنظیمات سایت"
        description="مدیریت اطلاعات و تنظیمات کلی سامانه"
      />
      <SettingsForm initial={settings} />
    </div>
  );
}
