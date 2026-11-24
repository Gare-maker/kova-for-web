"use client";

import React, { useState, useEffect } from "react";
import { X, Star, CheckCircle2 } from "lucide-react";
import type { Vendor, VendorRating } from "@/lib/types";

interface RateVendorModalProps {
  open: boolean;
  onClose: () => void;
  vendor: Vendor;
  currentRating: number;
  currentRatingCount: number;
  onRated: (newRating: number, newCount: number) => void;
}

export function RateVendorModal({
  open,
  onClose,
  vendor,
  currentRating,
  currentRatingCount,
  onRated,
}: RateVendorModalProps) {
  const [stars, setStars] = useState(0);
  const [hoverStars, setHoverStars] = useState(0);
  const [reviewerName, setReviewerName] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentRatings, setRecentRatings] = useState<VendorRating[]>([]);

  useEffect(() => {
    if (!open) return;
    setSubmitted(false);
    setError(null);
    (async () => {
      try {
        const res = await fetch(
          `/api/vendors/${encodeURIComponent(vendor.username)}/rate`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const data = await res.json();
          setRecentRatings(data.ratings ?? []);
        }
      } catch {
        // ignore
      }
    })();
  }, [open, vendor.username]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stars < 1 || stars > 5) {
      setError("Please tap a star from 1 to 5 to rate this user.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/vendors/${encodeURIComponent(vendor.username)}/rate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stars,
            reviewerName: reviewerName.trim() || "Verified Visitor",
            comment: comment.trim(),
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to submit your rating.");
        return;
      }
      onRated(data.rating, data.ratingCount);
      setRecentRatings((prev) => [data.review, ...prev]);
      setSubmitted(true);
      setStars(0);
      setReviewerName("");
      setComment("");
    } catch {
      setError("Network error while submitting rating.");
    } finally {
      setSubmitting(false);
    }
  };

  const activeStars = hoverStars || stars;

  return (
    <div
      className="chat-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`Rate ${vendor.fullName}`}
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
          aria-label="Close rating modal"
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

        <h2
          className="display display--sm"
          style={{ color: "var(--ink-strong)", marginBottom: "0.2rem" }}
        >
          Rate @{vendor.username}
        </h2>
        <p style={{ color: "var(--muted)", fontSize: "0.8rem", margin: "0 0 0.85rem" }}>
          {vendor.fullName} · Average:{" "}
          <strong style={{ color: "var(--ink-strong)", fontWeight: 600 }}>
            {currentRating.toFixed(1)} ★
          </strong>{" "}
          ({currentRatingCount} ratings)
        </p>

        {submitted ? (
          <div
            style={{
              background: "var(--brand-soft)",
              color: "var(--forest)",
              borderRadius: 10,
              padding: "0.85rem",
              textAlign: "center",
              marginBottom: "0.85rem",
              fontSize: "0.82rem",
            }}
          >
            <CheckCircle2
              size={24}
              color="var(--brand)"
              style={{ margin: "0 auto 0.35rem" }}
            />
            <div style={{ fontWeight: 600 }}>Thank you for your rating!</div>
            <div style={{ fontSize: "0.78rem", marginTop: "0.15rem" }}>
              Your feedback helps keep Kova Showrooms trustworthy.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "0.35rem",
                marginBottom: "0.8rem",
              }}
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onMouseEnter={() => setHoverStars(value)}
                  onMouseLeave={() => setHoverStars(0)}
                  onClick={() => setStars(value)}
                  aria-label={`Rate ${value} out of 5 stars`}
                  style={{
                    background: "none",
                    border: "none",
                    padding: "0.2rem",
                    cursor: "pointer",
                    transform: activeStars >= value ? "scale(1.08)" : "scale(1)",
                    transition: "transform 0.14s ease",
                  }}
                >
                  <Star
                    size={26}
                    fill={activeStars >= value ? "#FACC15" : "none"}
                    color={activeStars >= value ? "#FACC15" : "#D1D5DB"}
                  />
                </button>
              ))}
            </div>

            {error && (
              <div
                style={{
                  background: "var(--danger-soft)",
                  color: "var(--danger)",
                  padding: "0.55rem 0.75rem",
                  borderRadius: 8,
                  fontSize: "0.78rem",
                  marginBottom: "0.7rem",
                }}
              >
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="rate-name">
                Your Name (Optional)
              </label>
              <input
                id="rate-name"
                className="form-input"
                placeholder="e.g. Chinedu O."
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="rate-comment">
                Review (Optional)
              </label>
              <textarea
                id="rate-comment"
                className="form-input"
                rows={2}
                placeholder="Share your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{ resize: "vertical" }}
              />
            </div>

            <button
              type="submit"
              className="ref-make-payment-btn"
              style={{ marginTop: "0.2rem" }}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Rating"}
            </button>
          </form>
        )}

        {recentRatings.length > 0 && (
          <div
            style={{
              marginTop: "0.95rem",
              paddingTop: "0.8rem",
              borderTop: "1px solid var(--line)",
            }}
          >
            <div
              style={{
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "var(--ink-strong)",
                marginBottom: "0.5rem",
              }}
            >
              Recent Ratings
            </div>
            <div style={{ display: "grid", gap: "0.45rem" }}>
              {recentRatings.slice(0, 3).map((r) => (
                <div
                  key={r.id}
                  style={{
                    background: "var(--paper-subtle)",
                    borderRadius: 8,
                    padding: "0.5rem 0.65rem",
                    fontSize: "0.78rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontWeight: 600, color: "var(--ink-strong)" }}>
                      {r.reviewerName}
                    </span>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 2,
                        color: "var(--ink-soft)",
                      }}
                    >
                      {r.stars}
                      <Star size={11} fill="#FACC15" color="#FACC15" />
                    </span>
                  </div>
                  {r.comment && (
                    <p
                      style={{
                        margin: "0.2rem 0 0",
                        color: "var(--muted)",
                        lineHeight: 1.4,
                      }}
                    >
                      {r.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
