export const SITE_NAME = "دفتر اجرایی نظارت برق";
export const SITE_FULL_NAME = "سامانه یکپارچه دفتر اجرایی نظارت برق";
export const ORG_NAME = "سازمان نظام مهندسی ساختمان استان کردستان";
export const SITE_ABBREVIATION = "SEBNB";

export const NAV_ITEMS = [
  { label: "صفحه اصلی", href: "/" },
  { label: "اطلاعیه‌ها", href: "/announcements" },
  { label: "جلسات", href: "/meetings" },
  { label: "آرشیو", href: "/archive" },
  { label: "خدمات", href: "/services" },
  { label: "فرآیندها", href: "/processes" },
  { label: "درباره ما", href: "/about" },
  { label: "تماس با ما", href: "/contact" },
];

export const PRIORITY_LABELS: Record<string, string> = {
  urgent: "فوری",
  important: "مهم",
  info: "اطلاع‌رسانی",
};

export const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-red-600 text-white",
  important: "bg-amber-600 text-white",
  info: "bg-blue-600 text-white",
};

export const MEETING_STATUS_COLORS: Record<string, string> = {
  "برگزار شده": "bg-emerald-600/20 text-emerald-400 border-emerald-600/30",
  "مصوبه صادر شد": "bg-blue-600/20 text-blue-400 border-blue-600/30",
  "در دستور کار": "bg-amber-600/20 text-amber-400 border-amber-600/30",
  "در حال پیگیری": "bg-purple-600/20 text-purple-400 border-purple-600/30",
};
