export const KOVA_COMMISSION_RATE = 0.049; // 4.9%

export function formatNaira(amount: number): string {
  return `₦${Math.round(amount).toLocaleString("en-NG")}`;
}

export function calculateCommission(subtotal: number): {
  commissionRate: number;
  kovaCommission: number;
  vendorBalance: number;
} {
  const kovaCommission = Math.round(subtotal * KOVA_COMMISSION_RATE);
  const vendorBalance = subtotal - kovaCommission;
  return {
    commissionRate: KOVA_COMMISSION_RATE,
    kovaCommission,
    vendorBalance,
  };
}

export function formatDateTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Africa/Lagos",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "K";
}
