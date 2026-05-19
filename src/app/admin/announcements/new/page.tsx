import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AnnouncementForm from "../AnnouncementForm";
import { createAnnouncement } from "../actions";

export default function NewAnnouncementPage() {
  return (
    <div className="p-8">
      <AdminPageHeader
        title="اطلاعیه جدید"
        backHref="/admin/announcements"
        backLabel="بازگشت به اطلاعیه‌ها"
      />
      <AnnouncementForm action={createAnnouncement} submitLabel="انتشار اطلاعیه" />
    </div>
  );
}
