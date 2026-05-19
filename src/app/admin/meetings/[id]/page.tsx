import { notFound } from "next/navigation";
import { getMeetingService } from "@/services";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import MeetingForm from "../MeetingForm";
import { updateMeeting } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditMeetingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const svc = await getMeetingService();
  const meeting = await svc.getById(id);
  if (!meeting) notFound();

  const action = updateMeeting.bind(null, id);

  return (
    <div className="p-8">
      <AdminPageHeader
        title="ویرایش جلسه"
        description={meeting.subject}
        backHref="/admin/meetings"
        backLabel="بازگشت به جلسات"
      />
      <MeetingForm initial={meeting} action={action} submitLabel="ذخیره تغییرات" />
    </div>
  );
}
