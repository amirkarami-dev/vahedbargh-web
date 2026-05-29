import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserRoles, hasRole } from "@/lib/auth";
import { FolderPlus } from "lucide-react";
import NewProjectForm from "../new/NewProjectForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "ایجاد پرونده" };

export default async function CreateProjectPage() {
  const roles = await getUserRoles();
  if (!hasRole(roles, "Administrator", "Section")) {
    redirect("/app");
  }

  return (
    <div className="p-6 md:p-8" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center">
            <FolderPlus className="w-5 h-5 text-[var(--accent-primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">ایجاد پرونده</h1>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              ثبت پرونده ساختمانی جدید و اطلاعات مالک
            </p>
          </div>
        </div>
      </div>

      <NewProjectForm />
    </div>
  );
}
