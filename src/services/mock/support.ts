interface Support {
  id: string;
  clientId: string;
  userId: string;
  toUserId?: string;
  ticketNumber?: string;
  userType: number;
  title: string;
  fileNumber?: string;
  rate?: number;
  isRead: boolean;
  closed: boolean;
  field1?: string;
  field2?: string;
  solarCreated?: string;
  createdAt: string;
  messageCount?: number;
}

interface SupportMessage {
  id: string;
  clientId: string;
  supportId: string;
  userId: string;
  message: string;
  createdAt: string;
  userName?: string;
}

interface SupportFile {
  id: string;
  clientId: string;
  supportId: string;
  storagePath: string;
  name?: string;
  createdAt: string;
}

const CLIENT_ID = "client-001";

const store: Support[] = [
  {
    id: "sup-001",
    clientId: CLIENT_ID,
    userId: "user-001",
    ticketNumber: "TK-1001",
    userType: 1,
    title: "مشکل در ثبت پروانه ساختمانی",
    fileNumber: "PN-4521",
    isRead: true,
    closed: false,
    solarCreated: "۱۴۰۳/۰۲/۱۵",
    createdAt: "2024-05-05T09:10:00Z",
    messageCount: 3,
  },
  {
    id: "sup-002",
    clientId: CLIENT_ID,
    userId: "user-002",
    ticketNumber: "TK-1002",
    userType: 2,
    title: "استعلام وضعیت پرونده بازرسی",
    fileNumber: "BZ-2230",
    isRead: false,
    closed: false,
    solarCreated: "۱۴۰۳/۰۳/۰۸",
    createdAt: "2024-05-28T11:30:00Z",
    messageCount: 2,
  },
  {
    id: "sup-003",
    clientId: CLIENT_ID,
    userId: "user-003",
    ticketNumber: "TK-1003",
    userType: 1,
    title: "درخواست تمدید مهلت ارائه مدارک",
    isRead: true,
    closed: true,
    solarCreated: "۱۴۰۳/۰۱/۲۰",
    createdAt: "2024-04-09T08:00:00Z",
    messageCount: 4,
  },
  {
    id: "sup-004",
    clientId: CLIENT_ID,
    userId: "user-004",
    ticketNumber: "TK-1004",
    userType: 3,
    title: "خطای سیستم در بارگذاری نقشه",
    isRead: false,
    closed: false,
    solarCreated: "۱۴۰۳/۰۳/۱۴",
    createdAt: "2024-06-03T14:45:00Z",
    messageCount: 1,
  },
  {
    id: "sup-005",
    clientId: CLIENT_ID,
    userId: "user-005",
    ticketNumber: "TK-1005",
    userType: 2,
    title: "اعتراض به نتیجه ارزیابی فنی",
    fileNumber: "EV-7801",
    isRead: true,
    closed: true,
    solarCreated: "۱۴۰۳/۰۲/۲۸",
    createdAt: "2024-05-17T10:20:00Z",
    messageCount: 5,
  },
];

const messages: SupportMessage[] = [
  // sup-001
  {
    id: "msg-001",
    clientId: CLIENT_ID,
    supportId: "sup-001",
    userId: "user-001",
    message: "سلام، در هنگام ثبت پروانه ساختمانی پیام خطای ۵۰۰ دریافت می‌کنم.",
    createdAt: "2024-05-05T09:10:00Z",
    userName: "سیوه حسینی",
  },
  {
    id: "msg-002",
    clientId: CLIENT_ID,
    supportId: "sup-001",
    userId: "admin-001",
    message: "با سلام، لطفاً شماره پرونده را ارسال فرمایید تا بررسی شود.",
    createdAt: "2024-05-05T10:30:00Z",
    userName: "پشتیبانی کردنظام",
  },
  {
    id: "msg-003",
    clientId: CLIENT_ID,
    supportId: "sup-001",
    userId: "user-001",
    message: "شماره پرونده: PN-4521. این مشکل از دیروز شروع شده.",
    createdAt: "2024-05-05T11:00:00Z",
    userName: "سیوه حسینی",
  },
  // sup-002
  {
    id: "msg-004",
    clientId: CLIENT_ID,
    supportId: "sup-002",
    userId: "user-002",
    message: "وضعیت پرونده بازرسی من چه زمانی اعلام می‌شود؟",
    createdAt: "2024-05-28T11:30:00Z",
    userName: "کامران رشیدی",
  },
  {
    id: "msg-005",
    clientId: CLIENT_ID,
    supportId: "sup-002",
    userId: "admin-001",
    message: "پرونده شما در صف بررسی است. حداکثر ظرف ۳ روز کاری نتیجه اعلام می‌شود.",
    createdAt: "2024-05-28T14:00:00Z",
    userName: "پشتیبانی کردنظام",
  },
  // sup-003
  {
    id: "msg-006",
    clientId: CLIENT_ID,
    supportId: "sup-003",
    userId: "user-003",
    message: "درخواست تمدید مهلت ارائه مدارک برای پرونده دارم.",
    createdAt: "2024-04-09T08:00:00Z",
    userName: "هاوار محمدی",
  },
  {
    id: "msg-007",
    clientId: CLIENT_ID,
    supportId: "sup-003",
    userId: "admin-001",
    message: "درخواست شما دریافت شد. مهلت یک هفته تمدید می‌شود.",
    createdAt: "2024-04-09T10:00:00Z",
    userName: "پشتیبانی کردنظام",
  },
  {
    id: "msg-008",
    clientId: CLIENT_ID,
    supportId: "sup-003",
    userId: "user-003",
    message: "ممنون از همراهی شما.",
    createdAt: "2024-04-10T08:30:00Z",
    userName: "هاوار محمدی",
  },
  {
    id: "msg-009",
    clientId: CLIENT_ID,
    supportId: "sup-003",
    userId: "admin-001",
    message: "خواهش می‌کنم. موفق باشید.",
    createdAt: "2024-04-10T09:00:00Z",
    userName: "پشتیبانی کردنظام",
  },
  // sup-004
  {
    id: "msg-010",
    clientId: CLIENT_ID,
    supportId: "sup-004",
    userId: "user-004",
    message: "هنگام بارگذاری نقشه سایت، صفحه سفید می‌شود و فایل آپلود نمی‌شود.",
    createdAt: "2024-06-03T14:45:00Z",
    userName: "برهان قادری",
  },
  // sup-005
  {
    id: "msg-011",
    clientId: CLIENT_ID,
    supportId: "sup-005",
    userId: "user-005",
    message: "با نتیجه ارزیابی فنی پرونده‌ام موافق نیستم، اعتراض رسمی دارم.",
    createdAt: "2024-05-17T10:20:00Z",
    userName: "شیرین کریمی",
  },
  {
    id: "msg-012",
    clientId: CLIENT_ID,
    supportId: "sup-005",
    userId: "admin-001",
    message: "اعتراض شما ثبت شد. پرونده جهت بررسی مجدد به کمیته فنی ارجاع داده می‌شود.",
    createdAt: "2024-05-17T12:00:00Z",
    userName: "پشتیبانی کردنظام",
  },
  {
    id: "msg-013",
    clientId: CLIENT_ID,
    supportId: "sup-005",
    userId: "user-005",
    message: "ممنون. آیا مدرک اضافه‌ای نیاز هست؟",
    createdAt: "2024-05-18T09:00:00Z",
    userName: "شیرین کریمی",
  },
  {
    id: "msg-014",
    clientId: CLIENT_ID,
    supportId: "sup-005",
    userId: "admin-001",
    message: "بله، لطفاً گزارش بازرسی اولیه را ارسال کنید.",
    createdAt: "2024-05-18T10:30:00Z",
    userName: "پشتیبانی کردنظام",
  },
  {
    id: "msg-015",
    clientId: CLIENT_ID,
    supportId: "sup-005",
    userId: "user-005",
    message: "مدارک ارسال شد. منتظر نتیجه هستم.",
    createdAt: "2024-05-19T08:00:00Z",
    userName: "شیرین کریمی",
  },
];

const files: SupportFile[] = [];

export interface SupportFilter {
  closed?: boolean;
  search?: string;
}

export interface SupportService {
  getAll(filter?: SupportFilter): Promise<Support[]>;
  getById(id: string): Promise<Support | null>;
  getMessages(supportId: string): Promise<SupportMessage[]>;
  addTicket(data: Omit<Support, "id" | "clientId" | "createdAt" | "messageCount">): Promise<Support>;
  addMessage(supportId: string, message: string, userId?: string, userName?: string): Promise<SupportMessage>;
  closeSupport(id: string): Promise<void>;
  getFiles(supportId: string): Promise<SupportFile[]>;
}

export const mockSupportService: SupportService = {
  async getAll(filter?: SupportFilter): Promise<Support[]> {
    let result = [...store];
    if (filter?.closed !== undefined) {
      result = result.filter((s) => s.closed === filter.closed);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.ticketNumber?.toLowerCase().includes(q) ||
          s.fileNumber?.toLowerCase().includes(q)
      );
    }
    return result.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async getById(id: string): Promise<Support | null> {
    return store.find((s) => s.id === id) ?? null;
  },

  async getMessages(supportId: string): Promise<SupportMessage[]> {
    return messages
      .filter((m) => m.supportId === supportId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  async addTicket(data): Promise<Support> {
    const item: Support = {
      ...data,
      id: `sup-${Date.now()}`,
      clientId: CLIENT_ID,
      createdAt: new Date().toISOString(),
      messageCount: 0,
    };
    store.push(item);
    return item;
  },

  async addMessage(supportId: string, message: string, userId = "user-current", userName = "کاربر"): Promise<SupportMessage> {
    const msg: SupportMessage = {
      id: `msg-${Date.now()}`,
      clientId: CLIENT_ID,
      supportId,
      userId,
      message,
      createdAt: new Date().toISOString(),
      userName,
    };
    messages.push(msg);
    const sup = store.find((s) => s.id === supportId);
    if (sup) sup.messageCount = (sup.messageCount ?? 0) + 1;
    return msg;
  },

  async closeSupport(id: string): Promise<void> {
    const sup = store.find((s) => s.id === id);
    if (sup) sup.closed = true;
  },

  async getFiles(supportId: string): Promise<SupportFile[]> {
    return files.filter((f) => f.supportId === supportId);
  },
};

export default mockSupportService;
