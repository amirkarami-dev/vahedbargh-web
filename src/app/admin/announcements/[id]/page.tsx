import { notFound } from "next/navigation";
import { getAnnouncementService } from "@/services";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AnnouncementForm from "../AnnouncementForm";
import { updateAnnouncement } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditAnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const svc = await getAnnouncementService();
  const announcement = await svc.getById(id);
  if (!announcement) notFound();

  const action = updateAnnouncement.bind(null, id);

  return (
    <div className="p-8">
      <AdminPageHeader
        title="ویرایش اطلاعیه"
        description={announcement.title}
        backHref="/admin/announcements"
        backLabel="بازگشت به اطلاعیه‌ها"
      />
      <AnnouncementForm initial={announcement} action={action} submitLabel="ذخیره تغییرات" />
    </div>
  );
}
