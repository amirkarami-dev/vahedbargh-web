const store: Record<string, string> = {
  org_name: "سازمان نظام مهندسی ساختمان استان کردستان",
  org_address: "سنندج، میدان کوهنورد، ساختمان نظام مهندسی",
  phone: "087-33123456",
  email: "info@kurdnezambargh.ir",
  working_hours: "شنبه تا چهارشنبه ۸ صبح تا ۴ بعد از ظهر",
  site_title: "KURDNEZAM | سامانه یکپارچه دفتر اجرایی نظارت برق",
  site_description: "سامانه مدیریت نظارت برق ساختمان استان کردستان",
  footer_text: "کلیه حقوق این سایت متعلق به سازمان نظام مهندسی ساختمان استان کردستان می‌باشد.",
};

export const mockSettingsService = {
  async getAll(): Promise<Record<string, string>> {
    return { ...store };
  },
  async get(key: string): Promise<string | null> {
    return store[key] ?? null;
  },
  async setMany(values: Record<string, string>): Promise<void> {
    Object.assign(store, values);
  },
};

export default mockSettingsService;
