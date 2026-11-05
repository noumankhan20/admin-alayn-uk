"use client";

import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Escape-to-close, body scroll lock, and focus restore shared by Modal and Sheet. */
function useOverlay(open: boolean, onClose: () => void, panelRef: React.RefObject<HTMLDivElement | null>) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    // Focus the first field (or the panel) so keyboard users land inside the dialog.
    const panel = panelRef.current;
    const autofocus = panel?.querySelector<HTMLElement>("[data-autofocus], input:not([type=hidden]):not(:disabled), textarea");
    (autofocus ?? panel)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Only the top-most overlay handles Escape.
        const layers = document.querySelectorAll("[data-overlay-layer]");
        if (layers[layers.length - 1] === panel?.closest("[data-overlay-layer]")) {
          e.stopPropagation();
          onCloseRef.current();
        }
      }
      if (e.key === "Tab" && panel) {
        const focusables = panel.querySelectorAll<HTMLElement>(
          'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, [open, panelRef]);
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  /** Block closing (e.g. while a request is in flight). */
  dismissible?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  icon,
  children,
  footer,
  size = "md",
  dismissible = true,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  const safeClose = () => dismissible && onClose();
  useOverlay(open, safeClose, panelRef);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div data-overlay-layer className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-[2px] animate-fade-in" onClick={safeClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cn(
          "relative w-full bg-white shadow-pop outline-none animate-scale-in flex flex-col",
          "max-h-[92vh] rounded-t-2xl sm:rounded-2xl",
          size === "sm" && "sm:max-w-md",
          size === "md" && "sm:max-w-lg",
          size === "lg" && "sm:max-w-2xl"
        )}
      >
        <div className="flex items-start gap-3.5 px-6 pt-6 pb-4">
          {icon}
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 id={titleId} className="text-lg font-bold leading-6">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-1 text-sm text-slate-500">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={safeClose}
            disabled={!dismissible}
            aria-label="Close"
            className="-mr-2 -mt-1 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors disabled:opacity-40"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 pb-6">{children}</div>
        {footer && (
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-6 py-4 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

interface SheetProps {
  open: boolean;
  onClose: () => void;
  /** Accessible name for the panel when the header is custom. */
  label: string;
  children: React.ReactNode;
  className?: string;
}

/** Right-side panel for inspecting a record without leaving the list. */
export function Sheet({ open, onClose, label, children, className }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useOverlay(open, onClose, panelRef);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div data-overlay-layer className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-navy-950/40 backdrop-blur-[2px] animate-fade-in" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col bg-slate-50 shadow-pop outline-none animate-slide-in-right",
          className
        )}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
