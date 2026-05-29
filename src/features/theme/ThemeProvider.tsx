"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";
import { useEffect } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const saved = localStorage.getItem("theme-color");
    if (saved) {
      document.documentElement.style.setProperty("--accent-primary", saved);
      document.documentElement.style.setProperty("--accent-secondary", saved);
    }
  }, []);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange={false}
      scriptProps={{ "data-cfasync": "false", suppressHydrationWarning: true }}
    >
      {children}
    </NextThemesProvider>
  );
}
