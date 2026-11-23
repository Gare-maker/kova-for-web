import React from "react";
import { BadgeCheck, Clock } from "lucide-react";
import type { VerificationStatus } from "@/lib/types";

export function VerificationBadge({
  status,
  variant = "pill",
}: {
  status: VerificationStatus;
  variant?: "pill" | "inline";
}) {
  // Never display a verified badge for unverified, rejected, or suspended vendors
  if (status === "verified") {
    return (
      <span
        className={
          variant === "pill" ? "vendor-pill vendor-pill--verified" : "vendor-pill vendor-pill--verified"
        }
        title="Verified Kova Vendor"
      >
        <BadgeCheck size={14} aria-hidden="true" />
        Verified Vendor
      </span>
    );
  }

  if (status === "pending") {
    return (
      <span
        className="vendor-pill vendor-pill--pending"
        title="Verification Pending"
      >
        <Clock size={14} aria-hidden="true" />
        Verification Pending
      </span>
    );
  }

  return null;
}
