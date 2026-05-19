import { notFound } from "next/navigation";
import { getDocumentService } from "@/services";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DocumentForm from "../DocumentForm";
import { updateDocument } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const svc = await getDocumentService();
  const document = await svc.getById(id);
  if (!document) notFound();

  const action = updateDocument.bind(null, id);

  return (
    <div className="p-8">
      <AdminPageHeader
        title="ویرایش سند"
        description={document.title}
        backHref="/admin/documents"
        backLabel="بازگشت به اسناد"
      />
      <DocumentForm initial={document} action={action} submitLabel="ذخیره تغییرات" />
    </div>
  );
}
