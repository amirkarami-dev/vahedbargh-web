import { getUsers } from "./actions";
import { UserManagementClient } from "./UserManagementClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "مدیریت کاربران",
};

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">مدیریت کاربران</h1>
          <p className="text-[var(--text-muted)] mt-1">افزودن و مدیریت کاربران سامانه</p>
        </div>
      </div>
      <UserManagementClient initialUsers={users} />
    </div>
  );
}
