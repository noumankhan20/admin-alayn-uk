import type { ElementType } from "react";
import { LayoutDashboard, Store, TicketPercent, UserRound } from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: ElementType;
  /** Short line shown under the item name in the mobile menu. */
  hint: string;
}

export const mainNav: NavItem[] = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard, hint: "Key numbers at a glance" },
  { name: "Outlets", href: "/outlets", icon: Store, hint: "Restaurant brands & branches" },
  { name: "Coupons", href: "/coupons", icon: TicketPercent, hint: "Subscription discount codes" },
];

export const accountNav: NavItem[] = [
  { name: "My account", href: "/profile", icon: UserRound, hint: "Your administrator details" },
];

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function currentNavItem(pathname: string) {
  return [...mainNav, ...accountNav].find((i) => isActive(pathname, i.href));
}
