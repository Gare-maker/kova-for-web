"use client";

import React from "react";
import Link from "next/link";
import { X, MapPin, Calendar, Star, BadgeCheck, Store } from "lucide-react";
import type { Vendor } from "@/lib/types";
import { getInitials } from "@/lib/format";
import { VerificationBadge } from "./VerificationBadge";

interface UserProfileModalProps {
  open: boolean;
  onClose: () => void;
  vendor: Vendor;
  rating?: number;
  listingsCount?: number;
  onRateUser?: () => void;
}

export function UserProfileModal({
  open,
  onClose,
  vendor,
  rating,
  listingsCount,
  onRateUser,
}: UserProfileModalProps) {
  if (!open) return null;

  const displayRating = rating ?? vendor.rating;

  return (
    <div
      className="chat-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`${vendor.fullName} profile details`}
      onClick={onClose}
      style={{ alignItems: "center", justifyContent: "center", padding: "1rem" }}
    >
      <div
        className="surface-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(410px, 100%)",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close profile details"
          style={{
            position: "absolute",
            top: "0.75rem",
            right: "0.75rem",
            background: "var(--paper-deep)",
            border: "none",
            borderRadius: "50%",
            width: 28,
            height: 28,
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            color: "var(--ink-strong)",
          }}
        >
          <X size={15} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ position: "relative", width: 54, height: 54, flex: "none" }}>
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                overflow: "hidden",
                background: "var(--forest)",
                color: "#fff",
                display: "grid",
                placeItems: "center",
                fontWeight: 600,
                fontSize: "1.05rem",
              }}
            >
              {vendor.avatarUrl ? (
                <img
                  src={vendor.avatarUrl}
                  alt={vendor.fullName}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                getInitials(vendor.fullName)
              )}
            </div>
            {vendor.verificationStatus === "verified" && (
              <span
                style={{
                  position: "absolute",
                  bottom: -1,
                  right: -1,
                  width: 19,
                  height: 19,
                  borderRadius: "50%",
                  background: "#1d9bf0",
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  border: "2px solid #fff",
                }}
              >
                <BadgeCheck size={11} />
              </span>
            )}
          </div>

          <div>
            <h2 className="display display--sm" style={{ color: "var(--ink-strong)" }}>
              @{vendor.username}
            </h2>
            <div style={{ color: "var(--muted)", fontWeight: 500, fontSize: "0.8rem" }}>
              {vendor.fullName} · {vendor.categoryBadge || vendor.role}
            </div>
            <div style={{ marginTop: "0.28rem" }}>
              <VerificationBadge status={vendor.verificationStatus} />
            </div>
          </div>
        </div>

        <dl
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "0.4rem",
            textAlign: "center",
            padding: "0.65rem 0.4rem",
            background: "var(--paper-subtle)",
            borderRadius: 10,
            border: "1px solid var(--line)",
            marginBlock: "0.85rem",
          }}
        >
          <div>
            <dd style={{ margin: 0, fontWeight: 600, fontSize: "0.94rem" }}>
              {listingsCount ?? vendor.stats.posts}
            </dd>
            <dt style={{ fontSize: "0.7rem", color: "var(--muted)" }}>Posts</dt>
          </div>
          <div>
            <dd style={{ margin: 0, fontWeight: 600, fontSize: "0.94rem" }}>
              {vendor.stats.followers >= 1000
                ? `${(vendor.stats.followers / 1000).toFixed(0)}k`
                : vendor.stats.followers}
            </dd>
            <dt style={{ fontSize: "0.7rem", color: "var(--muted)" }}>Followers</dt>
          </div>
          <div>
            <dd style={{ margin: 0, fontWeight: 600, fontSize: "0.94rem" }}>
              {vendor.stats.deals}
            </dd>
            <dt style={{ fontSize: "0.7rem", color: "var(--muted)" }}>Deals</dt>
          </div>
          <div>
            <button
              type="button"
              onClick={() => {
                if (onRateUser) {
                  onClose();
                  onRateUser();
                }
              }}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: onRateUser ? "pointer" : "default",
                width: "100%",
              }}
              title="Rate this business"
            >
              <dd
                style={{
                  margin: 0,
                  fontWeight: 600,
                  fontSize: "0.94rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 2,
                  color: "var(--ink-strong)",
                }}
              >
                {displayRating.toFixed(1)}
                <Star size={12} fill="#FACC15" color="#FACC15" />
              </dd>
              <dt style={{ fontSize: "0.7rem", color: "var(--brand)" }}>
                Rate
              </dt>
            </button>
          </div>
        </dl>

        <p style={{ color: "var(--ink-soft)", fontSize: "0.82rem", margin: "0 0 0.75rem" }}>
          {vendor.bio}
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.3rem",
            fontSize: "0.78rem",
            color: "var(--muted)",
            marginBottom: "0.95rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.38rem" }}>
            <MapPin size={13} />
            <span>{vendor.location}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.38rem" }}>
            <Calendar size={13} />
            <span>Kova Member since {vendor.memberSince}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          {onRateUser && (
            <button
              type="button"
              className="btn btn--outline btn--sm"
              style={{ flex: 1 }}
              onClick={() => {
                onClose();
                onRateUser();
              }}
            >
              <Star size={13} fill="#FACC15" color="#FACC15" />
              Rate User
            </button>
          )}
          <Link
            href="/"
            className="btn btn--brand btn--sm"
            style={{ flex: 1 }}
            onClick={onClose}
          >
            <Store size={13} />
            View Showroom
          </Link>
        </div>
      </div>
    </div>
  );
}
