import { jsPDF } from "jspdf";
import type { Receipt } from "./types";
import { formatDateTime } from "./format";

export function downloadReceiptPdf(receipt: Receipt): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();

  // Header band in Kova Forest Green
  doc.setFillColor(12, 67, 23);
  doc.rect(0, 0, pageW, 96, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("KOVA", 44, 46);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(150, 237, 196);
  doc.text("Kova Digital Market Limited · Official Payment Receipt", 44, 66);

  // Paid Badge
  doc.setFillColor(44, 155, 67);
  doc.roundedRect(pageW - 124, 32, 80, 28, 6, 6, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("PAID", pageW - 98, 50);

  // Receipt Metadata
  let y = 132;
  doc.setTextColor(45, 45, 45);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Receipt Number: ${receipt.receiptNumber}`, 44, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(110, 105, 129);
  doc.text(`Date: ${formatDateTime(receipt.paidAt)}`, pageW - 44, y, {
    align: "right",
  });

  y += 20;
  doc.text(`Transaction Ref: ${receipt.transactionReference}`, 44, y);
  doc.text(`Order Ref: ${receipt.orderReference}`, pageW - 44, y, {
    align: "right",
  });

  // Divider
  y += 18;
  doc.setDrawColor(225, 228, 232);
  doc.line(44, y, pageW - 44, y);

  // Customer & Vendor columns
  y += 28;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(110, 105, 129);
  doc.text("CUSTOMER & DELIVERY", 44, y);
  doc.text("VENDOR DETAILS", pageW / 2 + 12, y);

  y += 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(18, 18, 31);
  doc.text(receipt.customerName, 44, y);
  doc.text(receipt.vendorName, pageW / 2 + 12, y);

  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(61, 58, 77);
  doc.text(receipt.customerPhone, 44, y);
  doc.text(`@${receipt.vendorUsername}`, pageW / 2 + 12, y);

  y += 15;
  doc.text(receipt.customerEmail, 44, y);
  doc.text("Kova Verified Storefront", pageW / 2 + 12, y);

  if (receipt.currentLocation) {
    y += 15;
    doc.text(`Current Location: ${receipt.currentLocation}`, 44, y);
  }
  if (receipt.deliveryAddress) {
    y += 15;
    doc.text(`Delivery Address: ${receipt.deliveryAddress}`, 44, y);
  }

  // Itemization Table
  y += 32;
  doc.setFillColor(247, 248, 249);
  doc.rect(44, y, pageW - 88, 28, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(18, 18, 31);
  doc.text("ITEM", 54, y + 18);
  doc.text("QTY", pageW - 190, y + 18);
  doc.text("AMOUNT", pageW - 54, y + 18, { align: "right" });

  y += 46;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  const itemLabel =
    receipt.paymentLabel && receipt.paymentLabel !== "Product Payment"
      ? `${receipt.productName} — ${receipt.paymentLabel}`
      : receipt.productName;
  doc.text(itemLabel, 54, y);
  doc.setFont("helvetica", "normal");
  doc.text(String(receipt.quantity), pageW - 185, y);
  doc.text(
    `NGN ${(receipt.unitPrice * receipt.quantity).toLocaleString("en-NG")}`,
    pageW - 54,
    y,
    { align: "right" }
  );

  y += 16;
  doc.setFontSize(9);
  doc.setTextColor(110, 105, 129);
  doc.text(`Product ID: ${receipt.productId}`, 54, y);

  // Totals
  y += 28;
  doc.setDrawColor(225, 228, 232);
  doc.line(44, y, pageW - 44, y);

  y += 22;
  doc.setFontSize(10);
  doc.setTextColor(61, 58, 77);
  doc.text("Payment Method", 54, y);
  doc.text(receipt.paymentMethod, pageW - 54, y, { align: "right" });

  y += 18;
  doc.text("Payment Status", 54, y);
  doc.setTextColor(44, 155, 67);
  doc.setFont("helvetica", "bold");
  doc.text("Paid (Verified via Paystack)", pageW - 54, y, { align: "right" });

  y += 26;
  doc.setFillColor(232, 255, 232);
  doc.roundedRect(44, y, pageW - 88, 42, 8, 8, "F");
  doc.setTextColor(12, 67, 23);
  doc.setFontSize(13);
  doc.text("Total Amount Paid", 58, y + 26);
  doc.text(
    `NGN ${receipt.totalPaid.toLocaleString("en-NG")}`,
    pageW - 58,
    y + 26,
    { align: "right" }
  );

  // Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(110, 105, 129);
  doc.text(
    "Thank you for shopping on Kova. Keep this receipt for your records.",
    pageW / 2,
    780,
    { align: "center" }
  );
  doc.text("admin@kovadml.com · https://www.kovadml.com", pageW / 2, 795, {
    align: "center",
  });

  doc.save(`${receipt.receiptNumber}.pdf`);
}

