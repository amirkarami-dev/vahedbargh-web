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

  if (!phone) redirect("/login");

  return (
    <OtpCard
      phone={phone}
      redirectTo={redirectTo}
      loginBase="/login"
      devMode={false}
    />
  );
}

export default function OtpPage(props: Props) {
  return (
    <Suspense>
      <OtpPageInner {...props} />
    </Suspense>
  );
}
