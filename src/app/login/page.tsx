import { LoginForm } from "@/features/auth/LoginForm";
import { CircuitBackground } from "@/components/hero/CircuitBackground";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ورود به سامانه",
};

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0" style={{ background: "var(--page-hero-gradient)" }} />

      {/* Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px]" />
      </div>

      <CircuitBackground opacity={0.08} />

      <div className="relative z-10 w-full max-w-md px-4">
        <LoginForm />
      </div>
    </div>
  );
}
