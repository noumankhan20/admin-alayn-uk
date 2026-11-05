"use client";

import React, { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: React.ReactNode;
  /** Bullet list of what will be lost. */
  consequences?: string[];
  confirmLabel?: string;
  loading?: boolean;
  /**
   * For irreversible, high-impact actions: the user must type this text
   * (case-insensitive) before the confirm button unlocks.
   */
  requireText?: string;
}

function ConfirmBody({
  onConfirm,
  onClose,
  description,
  consequences,
  confirmLabel = "Delete",
  loading,
  requireText,
}: Omit<ConfirmDialogProps, "open" | "title">) {
  const [typed, setTyped] = useState("");
  const unlocked = !requireText || typed.trim().toLowerCase() === requireText.trim().toLowerCase();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (unlocked && !loading) onConfirm();
      }}
      className="space-y-4"
    >
      {description && <p className="text-sm leading-relaxed text-slate-600">{description}</p>}

      {consequences && consequences.length > 0 && (
        <div className="rounded-lg border border-brand-200 bg-brand-50/60 p-3.5">
          <p className="mb-1.5 text-[13px] font-semibold text-brand-800">This will permanently delete:</p>
          <ul className="list-disc space-y-0.5 pl-5 text-[13px] text-brand-800/90">
            {consequences.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {requireText && (
        <div>
          <label htmlFor="confirm-text" className="field-label">
            Type <span className="font-mono font-semibold text-slate-900">{requireText}</span> to confirm
          </label>
          <input
            id="confirm-text"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            disabled={loading}
            autoComplete="off"
            spellCheck={false}
            className="input"
          />
        </div>
      )}

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose} disabled={loading} data-autofocus={!requireText || undefined}>
          Cancel
        </Button>
        <Button type="submit" variant="danger" disabled={!unlocked} loading={loading}>
          {!loading && <Trash2 />}
          {loading ? "Deleting…" : confirmLabel}
        </Button>
      </div>
    </form>
  );
}

export function ConfirmDialog({ open, onClose, title, loading, ...rest }: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!loading}
      size="sm"
      title={title}
      icon={
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <AlertTriangle className="size-5" />
        </span>
      }
    >
      <ConfirmBody onClose={onClose} loading={loading} {...rest} />
    </Modal>
  );
}
