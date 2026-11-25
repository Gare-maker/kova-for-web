import React from "react";

export function KovaFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-bar">
        <div className="footer-powered" aria-label="Powered by Kova">
          <span>Powered by</span>
          <img
            src="/brand/kova-logo-main.svg"
            alt="Kova"
            width={52}
            height={13}
            loading="lazy"
          />
        </div>

        <p className="footer-copyright">
          &copy; Kova Digital Market Limited. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
