import { NextResponse } from "next/server";
import {
  readDb,
  writeDb,
  updateVendorVerification,
  toggleProductAvailability,
} from "@/lib/db";
import type { VerificationStatus, ProductAvailability } from "@/lib/types";

export async function GET() {
  const db = readDb();
  return NextResponse.json({
    vendors: db.vendors,
    products: db.products,
    orders: db.orders,
    notifications: db.notifications,
    conversations: db.conversations,
    messages: db.messages,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.action === "set_verification") {
      const vendor = updateVendorVerification(
        String(body.vendorId),
        body.status as VerificationStatus
      );
      if (!vendor) {
        return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
      }
      return NextResponse.json({ vendor });
    }

    if (body.action === "set_product_availability") {
      const product = toggleProductAvailability(
        String(body.productId),
        body.availability as ProductAvailability,
        typeof body.quantity === "number" ? body.quantity : undefined
      );
      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      return NextResponse.json({ product });
    }

    if (body.action === "mark_notifications_read") {
      const db = readDb();
      for (const n of db.notifications) {
        n.read = true;
      }
      writeDb(db);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown sync action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
