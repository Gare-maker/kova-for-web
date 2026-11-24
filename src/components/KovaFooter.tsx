import React from "react";

export function KovaFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-bar">
        <div className="footer-powered-pill" aria-label="Powered by Kova">
          <span>Powered by</span>
          <img
            src="/brand/kova-logo-main.svg"
            alt="Kova"
            width={48}
            height={12}
            loading="lazy"
          />
        </div>

        <a
          href="https://www.kovadml.com"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-market-link"
        >
          See Kova Digital Market
        </a>
      </div>
    </footer>
  );
}
