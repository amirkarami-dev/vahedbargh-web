import AdminPageHeader from "@/components/admin/AdminPageHeader";
import StatsForm from "../StatsForm";
import { createStatAction } from "../actions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "آمار جدید" };

export default function NewStatPage() {
  return (
    <div className="p-8">
      <AdminPageHeader
        title="افزودن آمار جدید"
        description="یک شاخص آماری جدید به صفحه اصلی اضافه کنید"
        backHref="/admin/stats"
        backLabel="بازگشت به آمار"
      />
      <StatsForm action={createStatAction} submitLabel="ایجاد آمار" />
    </div>
  );
}
