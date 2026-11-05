import type { CouponItem, CouponStatus } from "@/redux/slices/adminApiSlice";
import type { Tone } from "@/components/ui/Badge";

export function formatDiscount(type: "PERCENTAGE" | "FIXED_AMOUNT", value: number) {
  if (type === "PERCENTAGE") return value >= 100 ? "Free (100% off)" : `${value}% off`;
  return `₹${value.toLocaleString("en-IN")} off`;
}

/** For 100% coupons: how long the free access lasts. */
export function freeAccessLabel(coupon: Pick<CouponItem, "discountType" | "discountValue" | "freeDurationDays" | "expiresAt">) {
  if (coupon.discountType !== "PERCENTAGE" || coupon.discountValue < 100) return null;
  if (coupon.freeDurationDays) return `Free for ${coupon.freeDurationDays} days after redeeming`;
  return coupon.expiresAt ? "Free until the coupon's expiry date" : "Free for 1 year after redeeming";
}

export const COUPON_STATUS: Record<CouponStatus, { label: string; tone: Tone; hint: string }> = {
  ACTIVE: { label: "Active", tone: "success", hint: "Customers can redeem this code" },
  DISABLED: { label: "Paused", tone: "neutral", hint: "Turned off by an admin" },
  USED_UP: { label: "Used up", tone: "warning", hint: "Redemption limit reached" },
  EXPIRED: { label: "Expired", tone: "danger", hint: "Past its expiry date" },
};
