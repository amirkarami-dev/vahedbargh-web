import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = { title: "پنل مدیریت | SEBNB" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]" dir="rtl">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
