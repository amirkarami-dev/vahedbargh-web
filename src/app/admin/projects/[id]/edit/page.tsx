import { notFound } from "next/navigation";
import type { Metadata } from "next";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ProjectEditForm from "../../ProjectEditForm";
import { getProjectById } from "../../actions";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const project = await getProjectById(id);
  return {
    title: project
      ? `ویرایش — ${project.fileNumber ?? project.electRequestNumber ?? id}`
      : "ویرایش پروژه",
  };
}

export default async function EditProjectPage({ params }: PageProps) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  return (
    <div className="p-8">
      <AdminPageHeader
        title="ویرایش پروژه"
        description={project.fileNumber ?? project.electRequestNumber ?? id}
        backHref={`/admin/projects/${id}`}
        backLabel="بازگشت به پروژه"
      />
      <ProjectEditForm project={project} />
    </div>
  );
}
