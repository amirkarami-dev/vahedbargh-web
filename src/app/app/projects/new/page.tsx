import { redirect } from "next/navigation";
import { getUserRoles, hasRole } from "@/lib/auth";
import NewProjectForm from "./NewProjectForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "پروژه جدید" };

export default async function NewProjectPage() {
  const roles = await getUserRoles();

  if (!hasRole(roles, "ElectAdmin", "Administrator", "SuperUser")) {
    redirect("/app/projects");
  }

  return (
    <div className="p-6 md:p-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">پروژه جدید</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          ثبت پرونده نظارت برق جدید
        </p>
      </div>
      <NewProjectForm />
    </div>
  );
}
