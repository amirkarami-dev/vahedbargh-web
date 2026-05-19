import AdminPageHeader from "@/components/admin/AdminPageHeader";
import MeetingForm from "../MeetingForm";
import { createMeeting } from "../actions";

export default function NewMeetingPage() {
  return (
    <div className="p-8">
      <AdminPageHeader
        title="جلسه جدید"
        backHref="/admin/meetings"
        backLabel="بازگشت به جلسات"
      />
      <MeetingForm action={createMeeting} submitLabel="ثبت جلسه" />
    </div>
  );
}
