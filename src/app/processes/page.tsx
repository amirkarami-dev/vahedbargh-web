"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { processFlows } from "@/data/processes";
import ProcessFlowView from "@/components/processes/ProcessFlowView";
import Link from "next/link";
import {
  Search,
  Zap,
  FlaskConical,
  CheckSquare,
  ArrowRight,
} from "lucide-react";

const FLOW_ICONS = [Search, Zap, FlaskConical];

export default function ProcessesPage() {
  const [active, setActive] = useState(processFlows[0].id);

  const activeFlow = processFlows.find((f) => f.id === active)!;

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[var(--bg-elevated)] border-b border-[var(--border)]">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(var(--secondary) 1px, transparent 1px), linear-gradient(90deg, var(--secondary) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-raised)] border border-[var(--border)] text-[var(--text-secondary)] text-sm hover:text-[var(--text-primary)] hover:border-[var(--border-active)] transition-all mb-6"
            >
              <ArrowRight className="w-4 h-4" />
              بازگشت به صفحه اصلی
            </Link>
            <br />
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--secondary)]/10 border border-[var(--secondary)]/20 text-[var(--secondary)] text-sm font-medium mb-6">
              <CheckSquare className="w-4 h-4" />
              فرآیندهای اجرایی دفتر نظارت برق
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-gradient mb-5 leading-tight">
              راهنمای جامع فرآیندها
            </h1>
            <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto leading-relaxed">
              فرآیندهای رسمی دفتر اجرایی نظارت برق مطابق مبحث ۱۳ مقررات ملی ساختمان،
              استاندارد IEC 60364-6 و BS 7671
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Tab selector */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-col sm:flex-row gap-4 mb-12"
        >
          {processFlows.map((flow, i) => {
            const Icon = FLOW_ICONS[i];
            const isActive = flow.id === active;
            return (
              <button
                key={flow.id}
                onClick={() => setActive(flow.id)}
                className={`flex-1 relative group rounded-2xl p-5 text-right transition-all duration-300 border overflow-hidden ${
                  isActive
                    ? "border-transparent shadow-lg"
                    : "border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--border-active)]"
                }`}
                style={
                  isActive
                    ? {
                        background: `linear-gradient(135deg, ${flow.glowColor}, transparent)`,
                        borderColor: "transparent",
                        boxShadow: `0 0 30px ${flow.glowColor}`,
                      }
                    : {}
                }
              >
                {isActive && (
                  <div
                    className="absolute inset-0 rounded-2xl border-2"
                    style={{
                      borderColor: flow.glowColor.replace("0.25", "0.5"),
                      background: `linear-gradient(135deg, ${flow.glowColor}, rgba(0,0,0,0))`,
                    }}
                  />
                )}
                <div className="relative flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 bg-gradient-to-br ${flow.color}`}
                  >
                    {flow.icon}
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold text-base ${isActive ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}
                    >
                      {flow.title}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">
                      {flow.steps.length} مرحله
                    </p>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                      style={{ background: `linear-gradient(90deg, transparent, ${flow.glowColor.replace("0.25", "0.8")})` }}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </motion.div>

        {/* Flow description */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFlow.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
            className="mb-10"
          >
            <div
              className="rounded-2xl p-6 border"
              style={{
                background: `linear-gradient(135deg, ${activeFlow.glowColor}, transparent)`,
                borderColor: activeFlow.glowColor.replace("0.25", "0.3"),
              }}
            >
              <div className="flex items-center gap-4 mb-3">
                <span className="text-3xl">{activeFlow.icon}</span>
                <div>
                  <h2 className="text-xl font-black text-[var(--text-primary)]">{activeFlow.title}</h2>
                  <p className="text-sm text-[var(--text-muted)]">{activeFlow.subtitle}</p>
                </div>
              </div>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{activeFlow.description}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Process flow */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFlow.id + "-flow"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ProcessFlowView flow={activeFlow} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
