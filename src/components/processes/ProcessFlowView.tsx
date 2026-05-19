"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { ProcessFlow, ProcessStep } from "@/data/processes";
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  BookOpen,
  GitBranch,
  ArrowLeft,
  ChevronLeft,
} from "lucide-react";

interface Props {
  flow: ProcessFlow;
}

export default function ProcessFlowView({ flow }: Props) {
  return (
    <div className="relative">
      {/* Mobile: vertical list, Desktop: keep vertical with large cards */}
      <div className="space-y-0">
        {flow.steps.map((step, i) => (
          <StepCard
            key={step.id}
            step={step}
            flow={flow}
            isLast={i === flow.steps.length - 1}
            index={i}
          />
        ))}
      </div>

      {/* Summary badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="mt-8 flex justify-center"
      >
        <div
          className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl border text-sm font-medium"
          style={{
            background: `linear-gradient(135deg, ${flow.glowColor}, transparent)`,
            borderColor: flow.glowColor.replace("0.25", "0.4"),
            color: "var(--text-secondary)",
          }}
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>
            پایان فرآیند{" "}
            <strong className="text-[var(--text-primary)]">{flow.title}</strong> —{" "}
            {flow.steps.length} مرحله
          </span>
        </div>
      </motion.div>
    </div>
  );
}

function StepCard({
  step,
  flow,
  isLast,
  index,
}: {
  step: ProcessStep;
  flow: ProcessFlow;
  isLast: boolean;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });

  const isDecision = step.isDecision;

  return (
    <div ref={ref} className="relative flex gap-6 pb-0">
      {/* Left column: number + connector line */}
      <div className="flex flex-col items-center flex-shrink-0" style={{ width: 48 }}>
        {/* Step number circle */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: index * 0.06, type: "spring", stiffness: 200 }}
          className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-base flex-shrink-0 shadow-lg ${
            isDecision
              ? "bg-gradient-to-br from-amber-500 to-orange-600"
              : `bg-gradient-to-br ${flow.color}`
          }`}
          style={{
            boxShadow: inView ? `0 0 20px ${flow.glowColor}` : "none",
          }}
        >
          {isDecision ? (
            <GitBranch className="w-5 h-5" />
          ) : (
            step.number
          )}
        </motion.div>

        {/* Connector line */}
        {!isLast && (
          <div className="flex-1 w-0.5 my-1 overflow-hidden" style={{ minHeight: 32 }}>
            <motion.div
              className="w-full h-full"
              initial={{ scaleY: 0, originY: 0 }}
              animate={inView ? { scaleY: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.06 + 0.2 }}
              style={{
                background: `linear-gradient(to bottom, ${flow.glowColor.replace("0.25", "0.6")}, ${flow.glowColor.replace("0.25", "0.1")})`,
              }}
            />
          </div>
        )}
      </div>

      {/* Right column: card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.45, delay: index * 0.06 + 0.1 }}
        className={`flex-1 mb-6 rounded-2xl border overflow-hidden transition-shadow duration-300 hover:shadow-lg group ${
          isDecision
            ? "border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent"
            : "border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--border-active)]"
        }`}
        style={
          inView
            ? { boxShadow: `0 4px 24px ${flow.glowColor.replace("0.25", "0.08")}` }
            : {}
        }
      >
        {/* Card header */}
        <div className="px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {isDecision && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full mb-2">
                  <GitBranch className="w-3 h-3" />
                  نقطه تصمیم
                </span>
              )}
              <h3 className="text-base font-bold text-[var(--text-primary)] leading-snug group-hover:text-gradient transition-all">
                {step.title}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        </div>

        {/* Decision branches */}
        {isDecision && step.decision && (
          <div className="px-6 pb-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-xs text-emerald-400 font-medium">{step.decision.yes}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-xs text-red-400 font-medium">{step.decision.no}</span>
              </div>
            </div>
          </div>
        )}

        {/* Details, docs, tools */}
        {(step.details || step.requiredDocs || step.tools || step.note) && (
          <div className="border-t border-[var(--border)] px-6 py-4 space-y-3">
            {step.details && step.details.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[var(--text-muted)] mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  جزئیات اجرایی
                </p>
                <ul className="space-y-1">
                  {step.details.map((d, di) => (
                    <li key={di} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                      <ChevronLeft className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-[var(--text-muted)] rotate-180" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {step.requiredDocs && step.requiredDocs.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[var(--text-muted)] mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  مدارک مورد نیاز
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {step.requiredDocs.map((doc, di) => (
                    <span
                      key={di}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400"
                    >
                      <FileText className="w-2.5 h-2.5" />
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {step.tools && step.tools.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[var(--text-muted)] mb-2 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5" />
                  ابزار و تجهیزات
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {step.tools.map((tool, ti) => (
                    <span
                      key={ti}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-violet-500/10 border border-violet-500/20 text-violet-400"
                    >
                      <Wrench className="w-2.5 h-2.5" />
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {step.note && (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-500/8 border border-amber-500/20">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-400 leading-relaxed">{step.note}</p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
