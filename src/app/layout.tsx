import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/features/theme/ThemeProvider";
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  title: {
    default: "دفتر اجرایی نظارت برق — سازمان نظام مهندسی ساختمان استان کردستان",
    template: "%s | دفتر اجرایی نظارت برق کردستان",
  },
  description:
    "سامانه یکپارچه مدیریت، نظارت و هماهنگی پروژه‌های برق — سازمان نظام مهندسی ساختمان استان کردستان",
  keywords: ["نظام مهندسی کردستان", "دفتر نظارت برق", "پروانه برق", "الکترود زمین"],
  openGraph: {
    locale: "fa_IR",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head />
      <body className="min-h-screen flex flex-col antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:right-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-blue-600 focus:text-white"
        >
          رفتن به محتوای اصلی
        </a>
        <NextTopLoader
          color="#3B82F6"
          initialPosition={0.1}
          crawlSpeed={200}
          height={3}
          crawl
          showSpinner={false}
          easing="ease"
          speed={300}
          shadow="0 0 10px #3B82F6, 0 0 5px #3B82F6"
          zIndex={9999}
        />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
