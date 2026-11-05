import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-md bg-slate-200/70", className)} />;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-14 text-center", className)}>
      {icon && (
        <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 [&_svg]:size-6">
          {icon}
        </div>
      )}
      <p className="text-[15px] font-semibold text-slate-900">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  retrying,
  className,
}: {
  title?: string;
  message?: React.ReactNode;
  onRetry?: () => void;
  retrying?: boolean;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-brand-200 bg-brand-50/60 p-4 sm:flex-row sm:items-center",
        className
      )}
    >
      <AlertTriangle className="size-5 shrink-0 text-brand-600" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-brand-800">{title}</p>
        {message && <p className="text-[13px] text-brand-700/90">{message}</p>}
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} loading={retrying}>
          {!retrying && <RefreshCw />}
          Try again
        </Button>
      )}
    </div>
  );
}

/** Pulls a human message out of an RTK Query / fetch error. */
export function errorMessage(err: unknown, fallback: string): string {
  const e = err as {
    status?: number | string;
    data?: { message?: string; error?: string | { message?: string } };
    message?: string;
  };
  if (e?.status === "FETCH_ERROR") return "Can't reach the server. Check your connection and try again.";
  const data = e?.data;
  if (data) {
    if (typeof data.error === "object" && data.error?.message) return data.error.message;
    if (data.message) return data.message;
    if (typeof data.error === "string") return data.error;
  }
  if (e?.message && e.message !== "Failed to fetch") return e.message;
  return fallback;
}
