"use client";

import React from "react";
import Link from "next/link";
import { X, MapPin, Calendar, Star, BadgeCheck, MessageCircle, Store } from "lucide-react";
import type { Vendor } from "@/lib/types";
import { getInitials } from "@/lib/format";
import { VerificationBadge } from "./VerificationBadge";

interface UserProfileModalProps {
  open: boolean;
  onClose: () => void;
  vendor: Vendor;
  rating?: number;
  listingsCount?: number;
  onStartChat?: () => void;
  onRateUser?: () => void;
}

export function UserProfileModal({
  open,
  onClose,
  vendor,
  rating,
  listingsCount,
  onStartChat,
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
          width: "min(480px, 100%)",
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
            top: "1rem",
            right: "1rem",
            background: "var(--paper-deep)",
            border: "none",
            borderRadius: "50%",
            width: 34,
            height: 34,
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            color: "var(--ink-strong)",
          }}
        >
          <X size={17} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ position: "relative", width: 72, height: 72, flex: "none" }}>
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
                fontSize: "1.3rem",
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
                  bottom: 0,
                  right: 0,
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "#1d9bf0",
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  border: "2px solid #fff",
                }}
              >
                <BadgeCheck size={14} />
              </span>
            )}
          </div>

          <div>
            <h2 className="display display--sm" style={{ color: "var(--ink-strong)" }}>
              @{vendor.username}
            </h2>
            <div style={{ color: "var(--muted)", fontWeight: 500, fontSize: "0.94rem" }}>
              {vendor.fullName} · {vendor.role}
            </div>
            <div style={{ marginTop: "0.4rem" }}>
              <VerificationBadge status={vendor.verificationStatus} />
            </div>
          </div>
        </div>

        <dl
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "0.5rem",
            textAlign: "center",
            padding: "0.9rem 0.5rem",
            background: "var(--paper-subtle)",
            borderRadius: 12,
            border: "1px solid var(--line)",
            marginBlock: "1.25rem",
          }}
        >
          <div>
            <dd style={{ margin: 0, fontWeight: 600, fontSize: "1.1rem" }}>
              {listingsCount ?? vendor.stats.posts}
            </dd>
            <dt style={{ fontSize: "0.78rem", color: "var(--muted)" }}>Posts</dt>
          </div>
          <div>
            <dd style={{ margin: 0, fontWeight: 600, fontSize: "1.1rem" }}>
              {vendor.stats.followers >= 1000
                ? `${(vendor.stats.followers / 1000).toFixed(0)}k`
                : vendor.stats.followers}
            </dd>
            <dt style={{ fontSize: "0.78rem", color: "var(--muted)" }}>Followers</dt>
          </div>
          <div>
            <dd style={{ margin: 0, fontWeight: 600, fontSize: "1.1rem" }}>
              {vendor.stats.deals}
            </dd>
            <dt style={{ fontSize: "0.78rem", color: "var(--muted)" }}>Deals</dt>
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
              title="Rate this user"
            >
              <dd
                style={{
                  margin: 0,
                  fontWeight: 600,
                  fontSize: "1.1rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                  color: "var(--ink-strong)",
                }}
              >
                {displayRating.toFixed(1)}
                <Star size={14} fill="#FACC15" color="#FACC15" />
              </dd>
              <dt style={{ fontSize: "0.78rem", color: "var(--brand)" }}>
                Rate
              </dt>
            </button>
          </div>
        </dl>

        <p style={{ color: "var(--ink-soft)", fontSize: "0.93rem", margin: "0 0 1rem" }}>
          {vendor.bio}
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.45rem",
            fontSize: "0.86rem",
            color: "var(--muted)",
            marginBottom: "1.25rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
            <MapPin size={15} />
            <span>{vendor.location}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
            <Calendar size={15} />
            <span>Kova Member since {vendor.memberSince}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          {onStartChat && (
            <button
              type="button"
              className="btn btn--brand btn--sm"
              style={{ flex: 1, fontWeight: 500 }}
              onClick={() => {
                onClose();
                onStartChat();
              }}
            >
              <MessageCircle size={15} />
              Message
            </button>
          )}
          {onRateUser && (
            <button
              type="button"
              className="btn btn--outline btn--sm"
              style={{ flex: 1, fontWeight: 500 }}
              onClick={() => {
                onClose();
                onRateUser();
              }}
            >
              <Star size={15} fill="#FACC15" color="#FACC15" />
              Rate User
            </button>
          )}
          <Link
            href="/"
            className="btn btn--outline btn--sm"
            style={{ width: "100%", fontWeight: 500 }}
            onClick={onClose}
          >
            <Store size={15} />
            View Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
