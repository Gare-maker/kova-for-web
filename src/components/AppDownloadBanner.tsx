"use client";

import React from "react";
import { Smartphone, ArrowUpRight } from "lucide-react";
import { getAppStoreUrl } from "./KovaHeader";

export function AppDownloadBanner() {
  const handleDownload = () => {
    const url = getAppStoreUrl();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <aside className="app-banner" aria-label="Download Kova App">
      <div style={{ display: "flex", alignItems: "center", gap: "0.95rem" }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 11,
            background: "var(--brand-soft)",
            color: "var(--forest)",
            display: "grid",
            placeItems: "center",
            flex: "none",
          }}
        >
          <Smartphone size={22} />
        </div>
        <div>
          <p className="app-banner__title">
            Get the best experience on <span>Kova!</span>
          </p>
          <p className="app-banner__desc">
            Discover more products, connect with vendors and enjoy a better
            shopping experience through the Kova application.
          </p>
        </div>
      </div>

      <button
        type="button"
        className="btn btn--brand btn--sm"
        onClick={handleDownload}
      >
        Download Kova App
        <ArrowUpRight size={14} aria-hidden="true" />
      </button>
    </aside>
  );
}
