import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DocumentForm from "../DocumentForm";
import { createDocument } from "../actions";

export default function NewDocumentPage() {
  return (
    <div className="p-8">
      <AdminPageHeader
        title="سند جدید"
        backHref="/admin/documents"
        backLabel="بازگشت به اسناد"
      />
      <DocumentForm action={createDocument} submitLabel="ثبت سند" />
    </div>
  );
}
