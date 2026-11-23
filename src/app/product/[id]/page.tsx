import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  getProductWithVendor,
  readDb,
  getEffectiveAvailability,
} from "@/lib/db";
import { formatNaira } from "@/lib/format";
import { ProductDetailClient } from "@/components/ProductDetailClient";
import { KovaHeader } from "@/components/KovaHeader";
import { KovaFooter } from "@/components/KovaFooter";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const result = getProductWithVendor(id);
  if (!result) {
    return {
      title: "Product Not Found",
    };
  }

  const { product, vendor } = result;
  const title = `${product.name} · ${formatNaira(product.price)} · Kova`;
  const description = `${product.description.slice(0, 140)} Sold by ${vendor.fullName} (@${vendor.username}) on Kova.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/product/${product.id}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "Kova",
      images: product.images[0] ? [{ url: product.images[0] }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = getProductWithVendor(id);

  if (!result) {
    return (
      <>
        <KovaHeader />
        <main id="main" className="storefront-main">
          <div className="container">
            <div className="empty-state" style={{ maxWidth: 560, marginInline: "auto" }}>
              <h1 className="display display--sm">Product not found</h1>
              <p>The product you&apos;re looking for could not be found.</p>
              <Link href="/" className="btn btn--brand btn--sm">
                Browse Kova Storefronts
              </Link>
            </div>
          </div>
        </main>
        <KovaFooter />
      </>
    );
  }

  const db = readDb();
  const avail = getEffectiveAvailability(db, result.product);

  return (
    <Suspense fallback={<div style={{ padding: "3rem", textAlign: "center" }}>Loading product...</div>}>
      <ProductDetailClient
        product={result.product}
        vendor={result.vendor}
        effectiveAvailable={avail.available}
        effectiveRemaining={avail.remaining}
        unavailableReason={avail.reason ?? null}
      />
    </Suspense>
  );
}
