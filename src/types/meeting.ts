export type MeetingStatus = "برگزار شده" | "در دستور کار" | "مصوبه صادر شد" | "در حال پیگیری";
export type MeetingType = "هیئت رئیسه" | "کمیته فنی" | "جلسه مشترک";

export interface Resolution {
  id: string;
  text: string;
  status: "اجرا شده" | "در دست اقدام" | "در انتظار";
}

export interface Meeting {
  id: string;
  sessionNumber: number;
  subject: string;
  jalaliDate: string;
  date: string;
  status: MeetingStatus;
  type: MeetingType;
  pdfUrl?: string;
  resolutions: Resolution[];
  attendees?: string[];
  notes?: string;
}

export interface MeetingFilters {
  type?: MeetingType;
  status?: MeetingStatus;
  year?: string;
}
