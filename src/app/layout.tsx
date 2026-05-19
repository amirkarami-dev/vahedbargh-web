import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/features/theme/ThemeProvider";

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
      <head>
        <link rel="preconnect" href="https://cdn.fontcdn.ir" />
        <link
          href="https://cdn.fontcdn.ir/Font/Persian/Vazirmatn/Vazirmatn.css"
          rel="stylesheet"
        />
        <link
          href="https://cdn.fontcdn.ir/Font/Persian/Estedad/Estedad.css"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:right-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-blue-600 focus:text-white"
        >
          رفتن به محتوای اصلی
        </a>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
