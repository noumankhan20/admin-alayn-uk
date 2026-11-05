"use client";

import React, { useState } from "react";
import { Shuffle, TicketPercent } from "lucide-react";
import { useCreateCouponMutation, CouponProduct } from "@/redux/slices/adminApiSlice";
import { showToast } from "@/lib/toast";
import { formatDate, cn } from "@/lib/utils";
import { formatDiscount } from "@/lib/coupons";
import { Modal } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { SegmentedControl, Switch } from "@/components/ui/Controls";
import { errorMessage } from "@/components/ui/Feedback";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: CouponProduct;
  productLabel: string;
}

type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";
type Errors = Partial<Record<"code" | "value" | "expires" | "limit" | "days", string>>;

const CODE_PATTERN = /^[A-Z0-9_-]+$/;
const PERCENT_PRESETS = [10, 20, 50, 100];
const DAY_PRESETS = [30, 90, 180, 365];

function randomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return `ALAYN-${out}`;
}

function todayISODate() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-7 rounded-full border px-3 text-[13px] font-medium transition-colors",
        active
          ? "border-navy-800 bg-navy-800 text-white"
          : "border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900"
      )}
    >
      {children}
    </button>
  );
}

function CouponForm({ onClose, product, productLabel }: Omit<ModalProps, "isOpen">) {
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [expiresOn, setExpiresOn] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [freeDays, setFreeDays] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const [createCoupon, { isLoading }] = useCreateCouponMutation();

  const value = Number(discountValue);
  const isFree = discountType === "PERCENTAGE" && value >= 100;
  const normalizedCode = code.trim().toUpperCase();

  function validate(): Errors {
    const e: Errors = {};
    if (!normalizedCode) e.code = "Enter a code, or generate one.";
    else if (!CODE_PATTERN.test(normalizedCode)) e.code = "Use only letters, numbers, hyphens (-) and underscores (_).";
    if (!discountValue || value <= 0) e.value = "Enter a discount greater than 0.";
    else if (discountType === "PERCENTAGE" && value > 100) e.value = "A percentage can't be more than 100.";
    if (expiresOn && expiresOn < todayISODate()) e.expires = "Pick today or a future date.";
    if (usageLimit && (!Number.isInteger(Number(usageLimit)) || Number(usageLimit) < 1))
      e.limit = "Enter a whole number of at least 1.";
    if (isFree && freeDays && (Number(freeDays) < 1 || Number(freeDays) > 1095))
      e.days = "Enter between 1 and 1095 days.";
    return e;
  }

  // Re-validate as the user types, but only after the first submit attempt.
  const shown: Errors = submitted ? validate() : {};

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSubmitted(true);
    if (Object.keys(validate()).length) return;

    // The coupon stays valid through the whole chosen day.
    const expiresAt = expiresOn ? new Date(`${expiresOn}T23:59:59`).toISOString() : null;

    try {
      await createCoupon({
        product,
        data: {
          code: normalizedCode,
          discountType,
          discountValue: value,
          isActive,
          expiresAt,
          usageLimit: usageLimit ? Number(usageLimit) : null,
          freeDurationDays: isFree && freeDays ? Number(freeDays) : null,
        },
      }).unwrap();
      showToast.success(
        "Coupon created",
        isActive ? `${normalizedCode} is live on ${productLabel}.` : `${normalizedCode} was saved but is turned off.`
      );
      onClose();
    } catch (err) {
      showToast.error("Couldn't create coupon", errorMessage(err, "Please try again."));
    }
  };

  const summary = (() => {
    if (!discountValue || value <= 0) return null;
    const parts: string[] = [];
    if (usageLimit) parts.push(`up to ${usageLimit} ${Number(usageLimit) === 1 ? "use" : "uses"}`);
    else parts.push("unlimited uses");
    parts.push(expiresOn ? `valid until ${formatDate(`${expiresOn}T23:59:59`)}` : "never expires");
    const what = isFree
      ? `free access${freeDays ? ` for ${freeDays} days` : expiresOn ? " until the expiry date" : " for 1 year"}`
      : formatDiscount(discountType, value);
    return { what, rest: parts.join(" · ") };
  })();

  return (
    <form id="create-coupon" onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Code */}
      <div>
        <label className="field-label" htmlFor="coupon-code">
          Coupon code
        </label>
        <div className="flex gap-2">
          <input
            id="coupon-code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s/g, ""))}
            placeholder="e.g. FESTIVE20"
            autoComplete="off"
            spellCheck={false}
            maxLength={40}
            aria-invalid={!!shown.code}
            aria-describedby="coupon-code-msg"
            className="input font-mono font-semibold tracking-wider"
          />
          <Button variant="secondary" onClick={() => setCode(randomCode())} className="h-10 shrink-0">
            <Shuffle /> Generate
          </Button>
        </div>
        <p id="coupon-code-msg" className={shown.code ? "field-error" : "field-hint"}>
          {shown.code ?? "Letters, numbers, hyphens and underscores. Customers type this at checkout."}
        </p>
      </div>

      {/* Discount */}
      <fieldset className="space-y-3">
        <legend className="field-label">Discount</legend>
        <SegmentedControl
          label="Discount type"
          value={discountType}
          onChange={(t) => {
            setDiscountType(t);
            setDiscountValue("");
          }}
          options={[
            { value: "PERCENTAGE", label: "Percentage" },
            { value: "FIXED_AMOUNT", label: "Fixed amount" },
          ]}
          className="w-full [&>button]:flex-1 [&>button]:justify-center"
        />
        <div className="relative">
          {discountType === "FIXED_AMOUNT" && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">₹</span>
          )}
          <input
            id="discount-value"
            type="number"
            inputMode="decimal"
            min={1}
            max={discountType === "PERCENTAGE" ? 100 : undefined}
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            placeholder={discountType === "PERCENTAGE" ? "20" : "500"}
            aria-label={discountType === "PERCENTAGE" ? "Percentage off" : "Amount off in rupees"}
            aria-invalid={!!shown.value}
            className={cn("input font-semibold tabular-nums", discountType === "FIXED_AMOUNT" ? "pl-7" : "pr-9")}
          />
          {discountType === "PERCENTAGE" && (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">%</span>
          )}
        </div>
        {discountType === "PERCENTAGE" && (
          <div className="flex flex-wrap gap-2">
            {PERCENT_PRESETS.map((p) => (
              <Chip key={p} active={value === p} onClick={() => setDiscountValue(String(p))}>
                {p === 100 ? "100% (free)" : `${p}%`}
              </Chip>
            ))}
          </div>
        )}
        {shown.value && <p className="field-error">{shown.value}</p>}
      </fieldset>

      {/* Free access length (100% coupons only) */}
      {isFree && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
          <label className="field-label" htmlFor="free-days">
            How long is it free?
          </label>
          <div className="mb-2.5 flex flex-wrap gap-2">
            {DAY_PRESETS.map((d) => (
              <Chip key={d} active={Number(freeDays) === d} onClick={() => setFreeDays(String(d))}>
                {d} days
              </Chip>
            ))}
          </div>
          <input
            id="free-days"
            type="number"
            inputMode="numeric"
            min={1}
            max={1095}
            value={freeDays}
            onChange={(e) => setFreeDays(e.target.value)}
            placeholder="Custom number of days"
            aria-invalid={!!shown.days}
            className="input bg-white"
          />
          <p className={shown.days ? "field-error" : "field-hint"}>
            {shown.days ??
              "Counted from the day a branch redeems it. Leave empty to keep it free until the expiry date (or 1 year if there isn't one)."}
          </p>
        </div>
      )}

      {/* Limits */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="coupon-expiry">
            Last day to redeem <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input
            id="coupon-expiry"
            type="date"
            min={todayISODate()}
            value={expiresOn}
            onChange={(e) => setExpiresOn(e.target.value)}
            aria-invalid={!!shown.expires}
            className="input"
          />
          <p className={shown.expires ? "field-error" : "field-hint"}>{shown.expires ?? "Empty = never expires"}</p>
        </div>
        <div>
          <label className="field-label" htmlFor="usage-limit">
            Max redemptions <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input
            id="usage-limit"
            type="number"
            inputMode="numeric"
            min={1}
            value={usageLimit}
            onChange={(e) => setUsageLimit(e.target.value)}
            placeholder="Unlimited"
            aria-invalid={!!shown.limit}
            className="input tabular-nums"
          />
          <p className={shown.limit ? "field-error" : "field-hint"}>
            {shown.limit ?? "Each business can use a free coupon once."}
          </p>
        </div>
      </div>

      {/* Turn on now */}
      <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">
        <div>
          <p className="text-sm font-medium text-slate-900">Turn on immediately</p>
          <p className="text-[13px] text-slate-500">Off = saved, but customers can&apos;t use it yet.</p>
        </div>
        <Switch checked={isActive} onChange={setIsActive} label="Turn on immediately" />
      </div>

      {/* Live summary */}
      {summary && normalizedCode && (
        <div className="rounded-xl bg-navy-800 p-4 text-sm text-navy-100" aria-live="polite">
          <p>
            Customers entering <span className="font-mono font-semibold text-white">{normalizedCode}</span> get{" "}
            <span className="font-semibold text-white">{summary.what}</span> on {productLabel}.
          </p>
          <p className="mt-1 text-[13px] text-navy-300">{summary.rest}</p>
        </div>
      )}

      <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" loading={isLoading}>
          {isLoading ? "Creating…" : "Create coupon"}
        </Button>
      </div>
    </form>
  );
}

export function CreateCouponModal({ isOpen, onClose, product, productLabel }: ModalProps) {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="New coupon"
      description={`Create a discount code for ${productLabel} subscriptions.`}
      icon={
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-700">
          <TicketPercent className="size-5" />
        </span>
      }
    >
      {/* Mounted only while open, so the form starts fresh every time. */}
      <CouponForm onClose={onClose} product={product} productLabel={productLabel} />
    </Modal>
  );
}
