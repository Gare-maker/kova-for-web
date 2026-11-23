import type { Metadata } from "next";
import { Montserrat_Alternates, Nunito_Sans } from "next/font/google";
import "./globals.css";

const montserratAlternates = Montserrat_Alternates({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Kova Storefronts · Buy, Sell & Connect Directly",
    template: "%s · Kova",
  },
  description:
    "Discover verified Kova vendors, browse products, chat directly with sellers, and complete secure Paystack purchases in your browser.",
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
    <html
      lang="en-NG"
      className={`${montserratAlternates.variable} ${nunitoSans.variable}`}
    >
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
