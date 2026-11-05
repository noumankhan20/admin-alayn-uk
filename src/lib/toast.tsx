import React from "react";
import { toast, ToastOptions } from "react-toastify";
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  title: string;
  message?: string;
  type: ToastType;
}

const defaultOptions: ToastOptions = {
  icon: false,
  hideProgressBar: true,
  closeOnClick: false,
  pauseOnHover: true,
};

const iconConfig: Record<ToastType, { Icon: React.ElementType; color: string }> = {
  success: { Icon: CheckCircle2, color: "text-emerald-600" },
  error: { Icon: AlertCircle, color: "text-brand-600" },
  info: { Icon: Info, color: "text-sky-600" },
  warning: { Icon: AlertTriangle, color: "text-amber-600" },
};

const ToastContent: React.FC<ToastProps> = ({ title, message, type }) => {
  const { Icon, color } = iconConfig[type];
  return (
    <div className="flex items-start gap-3 py-3.5 pl-4 pr-10">
      <Icon className={`mt-px size-5 shrink-0 ${color}`} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-5 text-slate-900">{title}</p>
        {message && <p className="mt-0.5 text-[13px] leading-snug text-slate-500 break-words">{message}</p>}
      </div>
    </div>
  );
};

function make(type: ToastType) {
  return (title: string, message?: string, options?: ToastOptions) =>
    toast[type](<ToastContent title={title} message={message} type={type} />, {
      toastId: options?.toastId || `${type}-${title}-${message || ""}`,
      autoClose: type === "error" ? 6000 : 3500,
      ...defaultOptions,
      ...options,
    });
}

export const showToast = {
  success: make("success"),
  error: make("error"),
  info: make("info"),
  warning: make("warning"),
};
