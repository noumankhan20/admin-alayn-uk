"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, Trash2, X, Loader2, ShieldAlert } from "lucide-react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  entityName: string;
  entityType: "Brand" | "Branch";
  subWarning?: string;
  isDeleting?: boolean;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  entityName,
  entityType,
  subWarning,
  isDeleting = false,
}: ConfirmDeleteModalProps) {
  const [confirmationInput, setConfirmationInput] = useState("");

  useEffect(() => {
    if (isOpen) {
      setConfirmationInput("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isConfirmed = confirmationInput.trim().toLowerCase() === entityName.trim().toLowerCase();

  const handleConfirm = async () => {
    if (!isConfirmed || isDeleting) return;
    await onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={!isDeleting ? onClose : undefined}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200 text-left">
          {/* Close button */}
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon Header */}
          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-[#D3232A] shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1B2A4A] font-heading">
                {title}
              </h3>
              <p className="text-xs text-rose-600 font-semibold flex items-center gap-1 mt-0.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Permanent Database Deletion</span>
              </p>
            </div>
          </div>

          {/* Warning Message */}
          <div className="space-y-3 text-xs text-zinc-600">
            <p>
              Are you sure you want to permanently delete{" "}
              <strong className="text-zinc-900 font-bold bg-zinc-100 px-1.5 py-0.5 rounded">
                {entityName}
              </strong>
              ?
            </p>

            <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/60 text-rose-950 space-y-1.5 text-[11px] leading-relaxed">
              <p className="font-bold text-rose-800 uppercase tracking-wider text-[10px]">
                Immediate Database Cascade Impact:
              </p>
              {entityType === "Brand" ? (
                <ul className="list-disc pl-4 space-y-1 text-rose-900">
                  <li>Permanently erases all physical branch locations under this brand.</li>
                  <li>Wipes all POS orders, bills, KOTs, tables, and receipts.</li>
                  <li>Removes all menu categories, dishes, inventory, and suppliers.</li>
                  <li>Deletes staff records, shift assignments, and clock-in logs.</li>
                  <li>Cancels and purges active subscription records.</li>
                </ul>
              ) : (
                <ul className="list-disc pl-4 space-y-1 text-rose-900">
                  <li>Permanently erases this branch location from the database.</li>
                  <li>Wipes all tables, live tokens, orders, and sales receipts for this branch.</li>
                  <li>Removes branch staff assignments and attendance rosters.</li>
                  <li>Cancels the branch subscription ledger.</li>
                </ul>
              )}
              {subWarning && <p className="pt-1 font-semibold">{subWarning}</p>}
            </div>

            {/* Type confirmation requirement */}
            <div className="pt-2">
              <label className="block text-[11px] font-semibold text-zinc-700 mb-1.5">
                To confirm, type <span className="text-[#D3232A] font-bold font-mono">"{entityName}"</span> below:
              </label>
              <input
                type="text"
                value={confirmationInput}
                onChange={(e) => setConfirmationInput(e.target.value)}
                placeholder={entityName}
                disabled={isDeleting}
                className="input text-xs py-2 w-full font-medium"
                autoFocus
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="btn-ghost text-xs py-2 px-3.5"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!isConfirmed || isDeleting}
              className="btn-primary text-xs py-2 px-4 bg-[#D3232A] hover:bg-[#b01b22] border-[#D3232A] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Deleting from DB...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Permanently Delete</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
