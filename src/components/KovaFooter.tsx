import React from "react";

export function KovaFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-minimal">
        <div className="footer-minimal__brand" aria-label="Powered by Kova">
          <span>Powered by</span>
          <img
            src="/brand/kova-logo-main.svg"
            alt="Kova"
            width={58}
            height={14}
            loading="lazy"
          />
        </div>
        <p className="footer-minimal__tagline">Buy, Sell, Lease, Discover</p>
        <p className="footer-minimal__desc">
          Student-focused marketplace and discovery platform for Nigerian
          universities.
        </p>
        <p className="footer-minimal__copy">
          &copy; Kova Digital Market Limited. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
