import type { Metadata } from "next";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import EngineerForm from "../EngineerForm";

export const metadata: Metadata = { title: "مهندس جدید" };

export default function NewEngineerPage() {
  return (
    <div className="p-6 space-y-6">
      <AdminPageHeader
        title="مهندس جدید"
        description="افزودن یک مهندس به سیستم"
      />
      <EngineerForm />
    </div>
  );
}
