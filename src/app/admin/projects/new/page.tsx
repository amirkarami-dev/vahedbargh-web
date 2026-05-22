import ProjectWizard from "../ProjectWizard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "پروژه جدید" };

export default function NewProjectPage() {
  return <ProjectWizard />;
}
