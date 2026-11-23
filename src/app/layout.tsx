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
    default: "Kova · Public Vendor Storefront & Commerce",
    template: "%s · Kova",
  },
  description:
    "Browse verified Kova vendors, explore listings, chat directly with sellers, and complete secure Paystack payments in your browser.",
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
