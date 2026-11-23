import { NextResponse } from "next/server";
import {
  getVendorByUsername,
  getVendorProducts,
  readDb,
  getEffectiveAvailability,
} from "@/lib/db";

export async function GET(
  _req: Request,
  context: { params: Promise<{ username: string }> }
) {
  const { username } = await context.params;
  const vendor = getVendorByUsername(username);
  if (!vendor) {
    return NextResponse.json(
      { error: "Storefront not found." },
      { status: 404 }
    );
  }

  const db = readDb();
  const products = getVendorProducts(vendor.id).map((product) => {
    const avail = getEffectiveAvailability(db, product);
    return {
      ...product,
      effectiveAvailable: avail.available,
      effectiveRemaining: avail.remaining,
    };
  });

  return NextResponse.json({
    vendor,
    products,
  });
}
