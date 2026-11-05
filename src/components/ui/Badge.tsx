import React from "react";
import { cn } from "@/lib/utils";

export type Tone = "success" | "warning" | "danger" | "neutral" | "info" | "navy";

const tones: Record<Tone, { badge: string; dot: string }> = {
  success: { badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/20", dot: "bg-emerald-500" },
  warning: { badge: "bg-amber-50 text-amber-800 ring-amber-600/25", dot: "bg-amber-500" },
  danger: { badge: "bg-brand-50 text-brand-700 ring-brand-600/20", dot: "bg-brand-600" },
  neutral: { badge: "bg-slate-100 text-slate-600 ring-slate-500/15", dot: "bg-slate-400" },
  info: { badge: "bg-sky-50 text-sky-700 ring-sky-600/20", dot: "bg-sky-500" },
  navy: { badge: "bg-navy-50 text-navy-700 ring-navy-600/15", dot: "bg-navy-600" },
};

interface BadgeProps {
  tone?: Tone;
  dot?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ tone = "neutral", dot, icon, children, className }: BadgeProps) {
  const t = tones[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap [&_svg]:size-3.5",
        t.badge,
        className
      )}
    >
      {dot && <span className={cn("size-1.5 rounded-full", t.dot)} aria-hidden />}
      {icon}
      {children}
    </span>
  );
}
