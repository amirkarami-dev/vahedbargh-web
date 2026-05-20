"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronDown, LogIn, Bell } from "lucide-react";
import { CircuitBackground } from "./CircuitBackground";
import { HeroStats } from "./HeroStats";
import type { StatItem } from "@/types";

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export function HeroSection({ stats }: { stats: StatItem[] }) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Gradient bg */}
      <div className="absolute inset-0" style={{ background: "var(--page-hero-gradient)" }} />

      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-cyan-500/8 rounded-full blur-[80px] pointer-events-none" />

      {/* Circuit animation */}
      <CircuitBackground opacity={0.05} />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-6"
        >
          {/* Emblem */}
          <motion.div variants={item}>
            <div className="w-24 h-24 rounded-2xl bg-white flex items-center justify-center shadow-2xl shadow-blue-600/30 animate-float overflow-hidden p-1">
              <Image
                src="/logo.png"
                alt="سازمان نظام مهندسی ساختمان استان کردستان"
                width={88}
                height={88}
                className="object-contain"
                priority
              />
            </div>
          </motion.div>

          {/* Title */}
          <motion.div variants={item} className="space-y-2">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[var(--text-primary)] tracking-tight">
              دفتر اجرایی نظارت برق
            </h1>
            <p className="text-lg sm:text-xl text-[var(--text-secondary)]">
              سازمان نظام مهندسی ساختمان استان کردستان
            </p>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            variants={item}
            className="max-w-2xl text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed"
          >
            سامانه یکپارچه مدیریت، نظارت و هماهنگی پروژه‌های برق
          </motion.p>

          {/* Tagline */}
          <motion.p
            variants={item}
            className="text-sm tracking-[0.3em] text-[var(--text-muted)] font-medium"
          >
            نظارت  ·  ایمنی  ·  کیفیت
          </motion.p>

          {/* CTAs */}
          <motion.div variants={item} className="flex flex-col sm:flex-row items-center gap-4 mt-2">
            <Link
              href="/login"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all duration-200 hover:-translate-y-0.5"
            >
              <LogIn className="w-4 h-4" />
              ورود به سامانه
            </Link>
            <Link
              href="/announcements"
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[var(--border)] hover:border-[var(--border-active)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)] font-medium transition-all duration-200"
            >
              <Bell className="w-4 h-4" />
              مشاهده اطلاعیه‌ها
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div variants={item} className="w-full">
            <HeroStats stats={stats} />
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[var(--text-muted)]"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-xs">پایین بروید</span>
        <ChevronDown className="w-4 h-4" />
      </motion.div>
    </section>
  );
}
