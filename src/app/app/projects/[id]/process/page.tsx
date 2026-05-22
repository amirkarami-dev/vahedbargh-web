import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import ProcessClient from "./ProcessClient";
import { getProjectById, getEngineers } from "../../actions";
import { getUserRoles, hasRole } from "@/lib/auth";

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
      ? `فرآیند پروژه ${project.fileNumber ?? id}`
      : "فرآیند پروژه",
  };
}

export default async function AppProjectProcessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [project, engineers, roles] = await Promise.all([
    getProjectById(id),
    getEngineers(),
    getUserRoles(),
  ]);

  if (!project) notFound();

  const canEdit = hasRole(
    roles,
    "Administrator",
    "Employee",
    "Section",
    "ElectAdmin"
  );

  return (
    <div className="p-6 sm:p-8" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/app/projects/${id}`}
          className="flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-3"
        >
          <ChevronLeft className="w-4 h-4 rotate-180" />
          بازگشت به جزئیات پروژه
        </Link>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          مدیریت فرآیند
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          پروژه{" "}
          <span className="text-[var(--text-secondary)] font-medium">
            {project.fileNumber ?? project.electRequestNumber ?? id}
          </span>{" "}
          — {project.landlordName}
        </p>
      </div>

      <ProcessClient
        project={project}
        engineers={engineers}
        canEdit={canEdit}
      />
    </div>
  );
}
