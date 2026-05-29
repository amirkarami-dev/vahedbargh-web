import { Suspense } from "react";
import { redirect } from "next/navigation";
import { OtpCard } from "@/features/auth/OtpCard";

interface Props {
  searchParams: Promise<{ phone?: string; redirect?: string }>;
}

async function OtpPageInner({ searchParams }: Props) {
  const params = await searchParams;
  const phone = params.phone ?? "";
  const redirectTo = params.redirect ?? "/admin";

  if (!phone) redirect("/admin/login");

  return (
    <OtpCard
      phone={phone}
      redirectTo={redirectTo}
      loginBase="/admin/login"
      devMode={false}
    />
  );
}

export default function AdminOtpPage(props: Props) {
  return (
    <Suspense>
      <OtpPageInner {...props} />
    </Suspense>
  );
}
