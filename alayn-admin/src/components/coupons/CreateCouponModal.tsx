"use client";

import React, { useState } from "react";
import { X, TicketPercent, Loader2, Calendar, Hash } from "lucide-react";
import { useCreateCouponMutation, CouponProduct } from "@/redux/slices/adminApiSlice";
import { showToast } from "@/lib/toast";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: CouponProduct;
  productLabel: string;
}

export function CreateCouponModal({ isOpen, onClose, product, productLabel }: ModalProps) {
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState<number | "">("");
  const [expiresAt, setExpiresAt] = useState("");
  const [usageLimit, setUsageLimit] = useState<number | "">("");
  const [freeDurationDays, setFreeDurationDays] = useState<number | "">("");
  const [isActive, setIsActive] = useState(true);

  const [createCoupon, { isLoading }] = useCreateCouponMutation();

  if (!isOpen) return null;

  // A 100% coupon gives free access for a period instead of a discount on a payment
  const isFreeCoupon = discountType === "PERCENTAGE" && Number(discountValue) >= 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedCode = code.trim().toUpperCase();
    if (!normalizedCode) {
      showToast.error("Validation Error", "Please provide a valid coupon code.");
      return;
    }

    if (discountValue === "" || Number(discountValue) <= 0) {
      showToast.error("Validation Error", "Discount value must be greater than zero.");
      return;
    }

    if (discountType === "PERCENTAGE" && Number(discountValue) > 100) {
      showToast.error("Validation Error", "Percentage discount cannot exceed 100%.");
      return;
    }

    try {
      await createCoupon({
        product,
        data: {
          code: normalizedCode,
          discountType,
          discountValue: Number(discountValue),
          isActive,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
          usageLimit: usageLimit !== "" ? Number(usageLimit) : null,
          freeDurationDays: isFreeCoupon && freeDurationDays !== "" ? Number(freeDurationDays) : null,
        },
      }).unwrap();

      showToast.success(
        "Coupon Created",
        isActive
          ? `Coupon "${normalizedCode}" is now active for ${productLabel}!`
          : `Coupon "${normalizedCode}" was created for ${productLabel} (disabled).`
      );
      // Reset form
      setCode("");
      setDiscountValue("");
      setExpiresAt("");
      setUsageLimit("");
      setFreeDurationDays("");
      setIsActive(true);
      onClose();
    } catch (err: any) {
      const msg =
        err?.data?.error?.message ||
        err?.data?.message ||
        (typeof err?.data?.error === "string" ? err?.data?.error : null) ||
        err?.message ||
        "Failed to create coupon code.";
      showToast.error("Creation Failed", msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-[#1B2A4A] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#D3232A] flex items-center justify-center text-white">
              <TicketPercent className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading text-white">
                Create Subscription Coupon
              </h3>
              <p className="text-[11px] text-white/60">
                Define promotional discounts for {productLabel} branch subscriptions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Code */}
          <div>
            <label className="field-label" htmlFor="coupon-code">
              Coupon Code
            </label>
            <input
              id="coupon-code"
              type="text"
              required
              placeholder="e.g. ALAYN20, FESTIVE50"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="input font-mono font-bold tracking-wider uppercase"
              autoFocus
            />
            <p className="text-[11px] text-zinc-400 mt-1">
              Alphanumeric characters, underscores, and hyphens only.
            </p>
          </div>

          {/* Discount Type & Value */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label" htmlFor="discount-type">
                Discount Type
              </label>
              <select
                id="discount-type"
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="input cursor-pointer"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED_AMOUNT">Fixed Amount (₹ INR)</option>
              </select>
            </div>

            <div>
              <label className="field-label" htmlFor="discount-val">
                {discountType === "PERCENTAGE" ? "Percentage Off (%)" : "Amount Off (₹ INR)"}
              </label>
              <input
                id="discount-val"
                type="number"
                required
                min={1}
                max={discountType === "PERCENTAGE" ? 100 : 100000}
                placeholder={discountType === "PERCENTAGE" ? "20" : "500"}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value === "" ? "" : Number(e.target.value))}
                className="input font-semibold"
              />
            </div>
          </div>

          {/* Expiry Date & Usage Limit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label" htmlFor="coupon-expiry">
                Expiry Date (Optional)
              </label>
              <input
                id="coupon-expiry"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="input"
              />
              <p className="text-[11px] text-zinc-400 mt-1">
                Last day the code can be redeemed. Leave empty for no expiration.
              </p>
            </div>

            <div>
              <label className="field-label" htmlFor="usage-limit">
                Usage Limit (Optional)
              </label>
              <input
                id="usage-limit"
                type="number"
                min={1}
                placeholder="e.g. 100 redemptions"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value === "" ? "" : Number(e.target.value))}
                className="input font-semibold"
              />
              <p className="text-[11px] text-zinc-400 mt-1">
                Max total redemptions. A business can redeem a 100% coupon only once.
              </p>
            </div>
          </div>

          {/* Free access duration, only meaningful for 100% coupons */}
          {isFreeCoupon && (
            <div>
              <label className="field-label" htmlFor="free-duration">
                Free Access Duration (Days)
              </label>
              <input
                id="free-duration"
                type="number"
                min={1}
                max={1095}
                placeholder="e.g. 90"
                value={freeDurationDays}
                onChange={(e) => setFreeDurationDays(e.target.value === "" ? "" : Number(e.target.value))}
                className="input font-semibold"
              />
              <p className="text-[11px] text-zinc-400 mt-1">
                How long the branch stays free, counted from the day it is redeemed. Leave empty to keep
                it free until the expiry date, or for 1 year when there is no expiry date.
              </p>
            </div>
          )}

          {/* Initial Status Toggle */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-[#D3232A] rounded border-zinc-300 focus:ring-[#D3232A]"
              />
              <span className="text-zinc-700 font-semibold">Enable immediately upon creation</span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="btn-ghost py-2 px-3 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary py-2 px-4 text-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Creating...
                </>
              ) : (
                "Publish Coupon"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
