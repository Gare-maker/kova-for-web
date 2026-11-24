import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Kova Showroom · Buy, Sell, Lease, Discover",
    template: "%s · Kova Showroom",
  },
  description:
    "Explore verified Kova Showrooms, browse available listings, complete secure Paystack payments, and download official receipts.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://kova.com"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={nunitoSans.variable}>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
