import { Suspense } from "react";
import { redirect } from "next/navigation";
import { OtpCard } from "@/features/auth/OtpCard";

interface Props {
  searchParams: Promise<{ phone?: string; redirect?: string }>;
}

async function OtpPageInner({ searchParams }: Props) {
  const params = await searchParams;
  const phone = params.phone ?? "";
  const redirectTo = params.redirect ?? "/app";

  if (!phone) redirect("/app/login");

  return (
    <OtpCard
      phone={phone}
      redirectTo={redirectTo}
      loginBase="/app/login"
      devMode={false}
    />
  );
}

export default function AppOtpPage(props: Props) {
  return (
    <Suspense>
      <OtpPageInner {...props} />
    </Suspense>
  );
}
