"use client";

import React from "react";
import { CheckCircle2, Smartphone, ExternalLink } from "lucide-react";
import { KOVA_PLAY_STORE_URL } from "@/lib/format";
import { KovaAppPreview } from "./KovaAppPreview";

interface KovaPromoCardProps {
  variant?: "register" | "success";
  emailEntered?: boolean;
}

export function KovaPromoCard({
  variant = "register",
  emailEntered = false,
}: KovaPromoCardProps) {
  if (variant === "success") {
    return (
      <div className="kova-promo-card kova-promo-card--compact">
        <div className="kova-promo-card__top">
          <div className="kova-promo-card__brand">
            <img
              src="/brand/kova-logo-main.svg"
              alt="Kova"
              width={66}
              height={17}
            />
            <span className="kova-promo-card__tag">Kova Mobile App</span>
          </div>
          <span className="kova-promo-card__subtag">Same Login Details</span>
        </div>

        <KovaAppPreview compact />

        <div className="kova-promo-download">
          <div className="kova-promo-download__copy">
            <strong>Explore more with Kova</strong>
            <span>Sign in on the Kova app with your new credentials.</span>
          </div>
          <a
            href={KOVA_PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="kova-download-btn"
          >
            <Smartphone size={14} aria-hidden="true" />
            <span>Download the Kova App</span>
            <ExternalLink size={12} aria-hidden="true" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <aside
      className={`kova-promo-card ${
        emailEntered ? "kova-promo-card--active" : ""
      }`}
      aria-label="About your Kova account"
    >
      <div className="kova-promo-card__top">
        <div className="kova-promo-card__brand">
          <img
            src="/brand/kova-logo-main.svg"
            alt="Kova"
            width={74}
            height={19}
          />
          <span className="kova-promo-card__tag">Powered by Kova</span>
        </div>
      </div>

      <h2 className="kova-promo-card__title">Your account is powered by Kova</h2>

      <p className="kova-promo-card__lead">
        Create your account once and enjoy more with Kova.
      </p>

      <p className="kova-promo-card__body">
        The account you are creating here is also your Kova account. Use the
        same email address and password to log in to the main Kova mobile app,
        discover other vendors, explore products and properties, and shop across
        the platform.
      </p>

      <p className="kova-promo-card__tagline">One account. More possibilities.</p>

      <ul className="kova-promo-list">
        <li>
          <CheckCircle2 size={14} aria-hidden="true" />
          <span>No need to create another account on the Kova app</span>
        </li>
        <li>
          <CheckCircle2 size={14} aria-hidden="true" />
          <span>Access saved receipts &amp; verified purchases everywhere</span>
        </li>
        <li>
          <CheckCircle2 size={14} aria-hidden="true" />
          <span>Discover trusted vendors, products &amp; properties</span>
        </li>
      </ul>

      {/* Lightweight Static Thumbnail + Click-to-Play Lazy Video Preview */}
      <div className="kova-promo-media">
        <KovaAppPreview />
      </div>

      {/* Secondary Download Action */}
      <div className="kova-promo-download">
        <div className="kova-promo-download__copy">
          <strong>Explore more with Kova</strong>
          <span>Available on Google Play Store</span>
        </div>
        <a
          href={KOVA_PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="kova-download-btn"
        >
          <Smartphone size={14} aria-hidden="true" />
          <span>Download the Kova App</span>
          <ExternalLink size={12} aria-hidden="true" />
        </a>
      </div>
    </aside>
  );
}

