import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  getVendorByUsername,
  getVendorProducts,
  readDb,
  getEffectiveAvailability,
} from "@/lib/db";
import { StorefrontClient } from "@/components/StorefrontClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const vendor = getVendorByUsername(username);
  if (!vendor) {
    return {
      title: "Storefront Not Found",
    };
  }

  const products = getVendorProducts(vendor.id);
  const title = `${vendor.fullName} (@${vendor.username}) · Kova Storefront`;
  const description = `${vendor.bio} · ${products.length} active listings on Kova.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/store/${vendor.username}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "Kova",
      images: vendor.avatarUrl ? [{ url: vendor.avatarUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function VendorStorefrontPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const vendor = getVendorByUsername(username);
  if (!vendor) {
    notFound();
  }

  const db = readDb();
  const products = getVendorProducts(vendor.id).map((p) => {
    const avail = getEffectiveAvailability(db, p);
    return {
      ...p,
      effectiveAvailable: avail.available,
      effectiveRemaining: avail.remaining,
    };
  });

  return (
    <Suspense fallback={<div style={{ padding: "3rem", textAlign: "center" }}>Loading storefront...</div>}>
      <StorefrontClient vendor={vendor} products={products} />
    </Suspense>
  );
}
