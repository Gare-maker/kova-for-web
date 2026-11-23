import fs from "fs";
import path from "path";
import crypto from "crypto";
import {
  KovaDatabase,
  Vendor,
  Product,
  Order,
  Receipt,
  UserAccount,
  VendorNotification,
  ChatConversation,
  ChatMessage,
  CustomerInfo,
  VerificationStatus,
} from "./types";
import { calculateCommission } from "./format";

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_PATH = path.join(DATA_DIR, "kova-db.json");
const RESERVATION_TTL_MS = 15 * 60 * 1000; // 15 minutes

function createSeedDatabase(): KovaDatabase {
  const now = new Date().toISOString();
  const vendors: Vendor[] = [
    {
      id: "vendor-micheal-01",
      username: "Micheal H.",
      fullName: "Edafe Jesugare",
      role: "Verified Agent & Vendor",
      avatarUrl: "/listings/avatar-micheal.jpg",
      location: "Sabo, Auchi, Edo State",
      bio: "Verified property agent and campus essentials vendor in Auchi, Edo State. Quality student apartments, furnished flats, and study furniture.",
      verificationStatus: "verified",
      eligible: true,
      rating: 4.5,
      stats: {
        posts: 67,
        followers: 2000,
        deals: 500,
      },
      memberSince: "2024",
    },
    {
      id: "01a1813d-0eaa-71a8-8991-4f84a10c2984",
      username: "Freddy",
      fullName: "Fred Kamsy",
      role: "Agent & Verified Vendor",
      avatarUrl:
        "https://minio.kovadml.com/media/images/01a1813d-0eaa-71a8-8991-4f84a10c2984/AVATAR/01a1813d-0eaa-71a8-8991-4f84a10c2984/01a1d0a5-e455-7219-a7ee-d55517ec3555",
      location: "Auchi, Edo State",
      bio: "Campus essentials, study furniture, apartments, and verified student housing items around Auchi.",
      verificationStatus: "verified",
      eligible: true,
      rating: 4.5,
      stats: {
        posts: 18,
        followers: 420,
        deals: 64,
      },
      memberSince: "2025",
    },
  ];

  const products: Product[] = [
    {
      id: "prop-flat-rent-01",
      vendorId: "vendor-micheal-01",
      name: "Two bedroom flat, for rent",
      description:
        "Bright, spacious two bedroom flat in Sabo, Auchi, Edo State. Finished with modern ceilings, clean tiled flooring, constant water supply, and secure compound parking. Ready for immediate move-in with free physical inspection.",
      price: 120000,
      pricePeriod: "Per year",
      deliveryFee: 0,
      waybillLabel: "Free waybill",
      inspectionLabel: "Free",
      agentFee: 17000,
      options: ["Unfurnished", "Semi-Furnished"],
      condition: "New",
      category: "Apartments",
      location: "Sabo, Auchi, Edo State",
      images: ["/listings/living-room-cozy.jpg"],
      isVideo: true,
      quantity: 2,
      status: "approved",
      availability: "available",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prop-flat-lux-02",
      vendorId: "vendor-micheal-01",
      name: "Two bedroom flat, for rent",
      description:
        "Luxury modern two bedroom apartment featuring warm LED tray ceilings, spacious living area, modern TV console, tiled floors, and reliable water supply in a quiet gated compound.",
      price: 120000,
      pricePeriod: "Per year",
      deliveryFee: 0,
      waybillLabel: "Free waybill",
      inspectionLabel: "Free",
      agentFee: 17000,
      options: ["Ground Floor", "Upstairs Unit"],
      condition: "New",
      category: "Apartments",
      location: "Sabo, Auchi, Edo State",
      images: ["/listings/living-room-luxury.jpg"],
      isVideo: false,
      quantity: 2,
      status: "approved",
      availability: "available",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prop-flat-sale-03",
      vendorId: "vendor-micheal-01",
      name: "2 bedroom flat, for sale",
      description:
        "Durable, stylish, and perfect for modern living. Built with quality materials and a smooth contemporary finish to provide both comfort and elegance. Features spacious rooms, paved courtyard, and modern lighting.",
      price: 120000,
      pricePeriod: "Per year",
      deliveryFee: 0,
      waybillLabel: "Free waybill",
      inspectionLabel: "Free",
      agentFee: 17000,
      options: ["Standard Unit", "Corner Unit"],
      condition: "New",
      category: "Apartments",
      location: "Sabo, Auchi, Edo State",
      images: ["/listings/flat-exterior.jpg"],
      isVideo: true,
      quantity: 3,
      status: "approved",
      availability: "available",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prop-bedroom-04",
      vendorId: "vendor-micheal-01",
      name: "Furnished studio apartment",
      description:
        "Clean, move-in ready furnished student apartment with wooden bed frame, wardrobe, compact mini-fridge, and bright daylight window close to campus.",
      price: 95000,
      pricePeriod: "Per year",
      deliveryFee: 0,
      waybillLabel: "Free waybill",
      inspectionLabel: "Free",
      agentFee: 12000,
      options: ["Furnished", "Standard"],
      condition: "Like New",
      category: "Apartments",
      location: "Sabo, Auchi, Edo State",
      images: ["/listings/bedroom-suite.jpg"],
      isVideo: false,
      quantity: 2,
      status: "approved",
      availability: "available",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prod-desk-01",
      vendorId: "vendor-micheal-01",
      name: "Nordic oak study desk and chair",
      description:
        "Durable, stylish, and perfect for any bedroom. Built with quality wood and a smooth finish to provide both comfort and elegance. Includes sturdy steel legs and ergonomic seating.",
      price: 35000,
      deliveryFee: 0,
      waybillLabel: "Free waybill",
      inspectionLabel: "Free",
      options: ["Natural Oak", "Matte Walnut"],
      condition: "New",
      category: "Furniture",
      location: "Sabo, Auchi, Edo State",
      images: ["/listings/study-desk.jpg"],
      isVideo: false,
      quantity: 5,
      status: "approved",
      availability: "available",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prop-flat-rent-05",
      vendorId: "vendor-micheal-01",
      name: "Modern two bedroom flat, for rent",
      description:
        "Well-ventilated two bedroom apartment in a peaceful neighborhood with paved driveway, reliable power lines, and generous room space.",
      price: 120000,
      pricePeriod: "Per year",
      deliveryFee: 0,
      waybillLabel: "Free waybill",
      inspectionLabel: "Free",
      agentFee: 17000,
      condition: "New",
      category: "Apartments",
      location: "Sabo, Auchi, Edo State",
      images: ["/listings/living-room-luxury.jpg"],
      isVideo: false,
      quantity: 2,
      status: "approved",
      availability: "available",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "freddy-flat-01",
      vendorId: "01a1813d-0eaa-71a8-8991-4f84a10c2984",
      name: "2 bedroom flat, for sale",
      description:
        "Durable, stylish, and perfect for any family or student group. Built with quality finishes, modern glass facade, and spacious compound parking in Auchi.",
      price: 120000,
      pricePeriod: "Per year",
      deliveryFee: 0,
      waybillLabel: "Free waybill",
      inspectionLabel: "Free",
      agentFee: 17000,
      condition: "New",
      category: "Apartments",
      location: "Sabo, Auchi, Edo State",
      images: ["/listings/flat-exterior.jpg"],
      isVideo: true,
      quantity: 2,
      status: "approved",
      availability: "available",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "freddy-desk-02",
      vendorId: "01a1813d-0eaa-71a8-8991-4f84a10c2984",
      name: "Nordic oak study desk (120cm)",
      description:
        "Durable, stylish, and perfect for any bedroom. Built with quality wood and a smooth finish to provide both comfort and elegance.",
      price: 35000,
      deliveryFee: 0,
      waybillLabel: "Free waybill",
      inspectionLabel: "Free",
      options: ["Natural Oak", "Walnut"],
      condition: "New",
      category: "Furniture",
      location: "Auchi, Edo State",
      images: ["/listings/study-desk.jpg"],
      isVideo: false,
      quantity: 4,
      status: "approved",
      availability: "available",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "freddy-living-03",
      vendorId: "01a1813d-0eaa-71a8-8991-4f84a10c2984",
      name: "Two bedroom flat, for rent",
      description:
        "Sunlit two bedroom apartment with wooden dining area, serene environment, and constant water supply.",
      price: 120000,
      pricePeriod: "Per year",
      deliveryFee: 0,
      waybillLabel: "Free waybill",
      inspectionLabel: "Free",
      agentFee: 17000,
      condition: "New",
      category: "Apartments",
      location: "Sabo, Auchi, Edo State",
      images: ["/listings/living-room-cozy.jpg"],
      isVideo: true,
      quantity: 2,
      status: "approved",
      availability: "available",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "freddy-bedroom-04",
      vendorId: "01a1813d-0eaa-71a8-8991-4f84a10c2984",
      name: "Furnished self-contained room",
      description:
        "Clean furnished self-contained apartment with bed frame, wardrobe, and study space near Auchi Polytechnic.",
      price: 85000,
      pricePeriod: "Per year",
      deliveryFee: 0,
      waybillLabel: "Free waybill",
      inspectionLabel: "Free",
      agentFee: 10000,
      condition: "Like New",
      category: "Apartments",
      location: "Auchi, Edo State",
      images: ["/listings/bedroom-suite.jpg"],
      isVideo: false,
      quantity: 3,
      status: "approved",
      availability: "available",
      createdAt: now,
      updatedAt: now,
    },
  ];

  return {
    vendors,
    products,
    users: [],
    reservations: [],
    orders: [],
    receipts: [],
    notifications: [],
    conversations: [],
    messages: [],
  };
}

function ensureDbFile(): KovaDatabase {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    const seed = createSeedDatabase();
    fs.writeFileSync(DB_PATH, JSON.stringify(seed, null, 2), "utf8");
    return seed;
  }
  try {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    const parsed = JSON.parse(raw) as KovaDatabase;
    if (!Array.isArray(parsed.users)) parsed.users = [];
    return parsed;
  } catch {
    const seed = createSeedDatabase();
    fs.writeFileSync(DB_PATH, JSON.stringify(seed, null, 2), "utf8");
    return seed;
  }
}

export function readDb(): KovaDatabase {
  const db = ensureDbFile();
  const changed = releaseExpiredReservationsInMemory(db);
  if (changed) {
    writeDb(db);
  }
  return db;
}

export function writeDb(db: KovaDatabase): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmpPath = `${DB_PATH}.${process.pid}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(db, null, 2), "utf8");
  fs.renameSync(tmpPath, DB_PATH);
}

function releaseExpiredReservationsInMemory(db: KovaDatabase): boolean {
  const nowMs = Date.now();
  let changed = false;
  for (const res of db.reservations) {
    if (!res.released && new Date(res.expiresAt).getTime() <= nowMs) {
      res.released = true;
      changed = true;
      const product = db.products.find((p) => p.id === res.productId);
      if (product && product.availability === "reserved") {
        product.availability = product.quantity > 0 ? "available" : "sold";
        product.updatedAt = new Date().toISOString();
      }
    }
  }
  return changed;
}

export function normalizePhone(phone: string): string {
  return phone.replace(/\s+/g, "").trim();
}

export function getOrCreateUserAccount(params: {
  name: string;
  phone: string;
  email: string;
}): UserAccount {
  const db = readDb();
  const normEmail = params.email.trim().toLowerCase();
  const normPhone = normalizePhone(params.phone);

  let user = db.users.find(
    (u) => u.email.toLowerCase() === normEmail && normalizePhone(u.phone) === normPhone
  );
  if (!user) {
    user = {
      id: `usr_${crypto.createHash("sha256").update(`${normEmail}|${normPhone}`).digest("hex").slice(0, 16)}`,
      name: params.name.trim(),
      phone: normPhone,
      email: normEmail,
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    writeDb(db);
  }
  return user;
}

export function findUserAccount(email: string, phone: string): UserAccount | null {
  const db = readDb();
  const normEmail = email.trim().toLowerCase();
  const normPhone = normalizePhone(phone);
  return (
    db.users.find(
      (u) =>
        u.email.toLowerCase() === normEmail &&
        normalizePhone(u.phone) === normPhone
    ) ?? null
  );
}

export function getReceiptsByUserId(userId: string): Receipt[] {
  const db = readDb();
  return db.receipts
    .filter((r) => r.userId === userId)
    .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());
}

function slugifyUsername(u: string): string {
  return u.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function getVendorByUsername(username: string): Vendor | null {
  const db = readDb();
  const decoded = decodeURIComponent(username).trim().toLowerCase();
  const slug = slugifyUsername(decoded);
  const vendor = db.vendors.find(
    (v) =>
      v.username.toLowerCase() === decoded ||
      slugifyUsername(v.username) === slug ||
      v.id.toLowerCase() === decoded
  );
  if (!vendor || !vendor.eligible) return null;
  return vendor;
}

export function getAllEligibleVendors(): Vendor[] {
  const db = readDb();
  return db.vendors.filter((v) => v.eligible);
}

export function getVendorProducts(vendorId: string): Product[] {
  const db = readDb();
  return db.products.filter(
    (p) => p.vendorId === vendorId && p.status === "approved"
  );
}

export function getProductWithVendor(productId: string): {
  product: Product;
  vendor: Vendor;
} | null {
  const db = readDb();
  const product = db.products.find((p) => p.id === productId);
  if (!product || product.status !== "approved") return null;
  const vendor = db.vendors.find((v) => v.id === product.vendorId);
  if (!vendor || !vendor.eligible) return null;
  return { product, vendor };
}

export function getEffectiveAvailability(
  db: KovaDatabase,
  product: Product
): { available: boolean; remaining: number; reason?: string } {
  if (product.status !== "approved") {
    return { available: false, remaining: 0, reason: "Product is not published." };
  }
  if (product.availability === "sold" || product.availability === "unavailable" || product.quantity <= 0) {
    return {
      available: false,
      remaining: 0,
      reason: "Sorry, this product is currently unavailable.",
    };
  }
  const activeReservedQty = db.reservations
    .filter((r) => r.productId === product.id && !r.released)
    .reduce((sum, r) => sum + r.quantity, 0);

  const remaining = Math.max(0, product.quantity - activeReservedQty);
  if (remaining <= 0) {
    return {
      available: false,
      remaining: 0,
      reason: "This item is currently reserved in another active checkout.",
    };
  }
  return { available: true, remaining };
}

export function createOrderAndReservation(params: {
  productId: string;
  quantity: number;
  selectedOption?: string;
  customer: CustomerInfo;
}): { error?: string; order?: Order; reservationId?: string } {
  const user = getOrCreateUserAccount({
    name: params.customer.name,
    phone: params.customer.phone,
    email: params.customer.email,
  });

  const db = readDb();
  const product = db.products.find((p) => p.id === params.productId);
  if (!product || product.status !== "approved") {
    return { error: "The product you're looking for could not be found." };
  }
  const vendor = db.vendors.find((v) => v.id === product.vendorId);
  if (!vendor || !vendor.eligible) {
    return { error: "This vendor storefront is currently unavailable." };
  }

  const qty = Math.max(1, Math.floor(params.quantity));
  const check = getEffectiveAvailability(db, product);
  if (!check.available || check.remaining < qty) {
    return {
      error:
        check.reason ||
        "Sorry, this product is currently unavailable in the requested quantity.",
    };
  }

  const subtotal = product.price * qty;
  const deliveryFee = product.deliveryFee;
  const totalPaid = subtotal + deliveryFee;
  const { commissionRate, kovaCommission, vendorBalance } =
    calculateCommission(subtotal);

  const now = new Date().toISOString();
  const shortHex = crypto.randomBytes(3).toString("hex").toUpperCase();
  const orderId = `ord_${crypto.randomUUID()}`;
  const orderReference = `KOVA-ORD-${shortHex}`;
  const transactionReference = `KOVA-PAY-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;

  const order: Order = {
    id: orderId,
    orderReference,
    transactionReference,
    userId: user.id,
    productId: product.id,
    productName: product.name,
    productImage: product.images[0] ?? "/products/desk.svg",
    selectedOption: params.selectedOption,
    vendorId: vendor.id,
    vendorName: vendor.fullName,
    vendorUsername: vendor.username,
    quantity: qty,
    unitPrice: product.price,
    deliveryFee,
    subtotal,
    commissionRate,
    kovaCommission,
    vendorBalance,
    totalPaid,
    customer: params.customer,
    paymentStatus: "pending",
    paymentMethod: "Paystack (Card / Bank Transfer)",
    source: "public_website",
    receiptId: null,
    receiptToken: null,
    createdAt: now,
    paidAt: null,
  };

  const reservationId = `res_${crypto.randomUUID()}`;
  db.reservations.push({
    id: reservationId,
    productId: product.id,
    quantity: qty,
    orderId,
    expiresAt: new Date(Date.now() + RESERVATION_TTL_MS).toISOString(),
    released: false,
  });

  if (product.quantity - qty <= 0) {
    product.availability = "reserved";
    product.updatedAt = now;
  }

  db.orders.push(order);
  writeDb(db);
  return { order, reservationId };
}

export function markOrderPaidAndGenerateReceipt(
  transactionReference: string,
  paymentMethod = "Paystack (Card / Bank Transfer)"
): { error?: string; order?: Order; receipt?: Receipt; alreadyProcessed?: boolean } {
  const db = readDb();
  const order = db.orders.find(
    (o) => o.transactionReference === transactionReference
  );
  if (!order) {
    return { error: "Transaction reference not found." };
  }

  if (order.paymentStatus === "paid" && order.receiptId) {
    const existingReceipt = db.receipts.find((r) => r.id === order.receiptId);
    return { order, receipt: existingReceipt, alreadyProcessed: true };
  }

  const product = db.products.find((p) => p.id === order.productId);
  const vendor = db.vendors.find((v) => v.id === order.vendorId);
  const now = new Date().toISOString();

  for (const res of db.reservations) {
    if (res.orderId === order.id && !res.released) {
      res.released = true;
    }
  }

  if (product) {
    product.quantity = Math.max(0, product.quantity - order.quantity);
    product.availability = product.quantity > 0 ? "available" : "sold";
    product.updatedAt = now;
  }

  if (vendor) {
    vendor.stats.deals += 1;
  }

  const receiptId = `rcp-${crypto.randomBytes(6).toString("hex")}`;
  const accessToken = crypto.randomBytes(24).toString("hex");
  const receiptNumber = `KOVA-RCP-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

  order.paymentStatus = "paid";
  order.paymentMethod = paymentMethod;
  order.paidAt = now;
  order.receiptId = receiptId;
  order.receiptToken = accessToken;

  const receipt: Receipt = {
    id: receiptId,
    accessToken,
    userId: order.userId,
    orderId: order.id,
    receiptNumber,
    orderReference: order.orderReference,
    transactionReference: order.transactionReference,
    customerName: order.customer.name,
    customerPhone: order.customer.phone,
    customerEmail: order.customer.email,
    currentLocation: order.customer.currentLocation,
    deliveryAddress: order.customer.deliveryAddress,
    deliveryNotes: order.customer.deliveryNotes,
    vendorName: order.vendorName,
    vendorUsername: order.vendorUsername,
    productId: order.productId,
    productName: order.productName,
    productDescription: product?.description ?? "",
    productImage: order.productImage,
    selectedOption: order.selectedOption,
    quantity: order.quantity,
    unitPrice: order.unitPrice,
    deliveryFee: order.deliveryFee,
    applicableFees: order.kovaCommission,
    totalPaid: order.totalPaid,
    paymentMethod,
    paymentStatus: "Paid",
    paidAt: now,
  };

  db.receipts.push(receipt);

  const notification: VendorNotification = {
    id: `notif_${crypto.randomUUID()}`,
    vendorId: order.vendorId,
    type: "payment_received",
    title: "Payment Received!",
    message: `Someone just purchased your ${order.productName}.`,
    orderId: order.id,
    orderReference: order.orderReference,
    customerName: order.customer.name,
    productName: order.productName,
    amountPaid: order.totalPaid,
    paymentStatus: "Paid",
    createdAt: now,
    read: false,
  };

  db.notifications.unshift(notification);
  writeDb(db);

  return { order, receipt, alreadyProcessed: false };
}

export function getReceiptByIdAndToken(
  receiptId: string,
  token: string | null | undefined,
  sessionUserId?: string | null
): Receipt | null {
  const db = readDb();
  const receipt = db.receipts.find((r) => r.id === receiptId);
  if (!receipt) return null;

  // Allow access if authenticated as the owning user OR via valid cryptographic token
  if (sessionUserId && receipt.userId === sessionUserId) {
    return receipt;
  }

  if (!token) return null;
  const a = Buffer.from(receipt.accessToken);
  const b = Buffer.from(token);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return null;
  }
  return receipt;
}

export function getOrCreateConversation(params: {
  vendorId: string;
  productId?: string | null;
  guestSessionId: string;
  customerName: string;
  customerPhone: string;
  kovaUserId?: string | null;
}): ChatConversation {
  const db = readDb();
  const normalizedPhone = params.customerPhone.trim();
  const targetProductId = params.productId ?? null;

  let conv = db.conversations.find(
    (c) =>
      c.vendorId === params.vendorId &&
      c.productId === targetProductId &&
      (c.guestSessionId === params.guestSessionId ||
        (normalizedPhone && c.customerPhone === normalizedPhone) ||
        (params.kovaUserId && c.kovaUserId === params.kovaUserId))
  );

  if (conv) {
    if (params.kovaUserId && !conv.kovaUserId) {
      conv.kovaUserId = params.kovaUserId;
      conv.updatedAt = new Date().toISOString();
      writeDb(db);
    }
    return conv;
  }

  const product = targetProductId
    ? db.products.find((p) => p.id === targetProductId)
    : null;
  const now = new Date().toISOString();
  conv = {
    id: `conv_${crypto.randomUUID()}`,
    vendorId: params.vendorId,
    productId: product?.id ?? null,
    productName: product?.name ?? null,
    productPrice: product?.price ?? null,
    productImage: product?.images[0] ?? null,
    guestSessionId: params.guestSessionId,
    customerName: params.customerName.trim(),
    customerPhone: normalizedPhone,
    kovaUserId: params.kovaUserId ?? null,
    createdAt: now,
    updatedAt: now,
  };

  db.conversations.unshift(conv);
  writeDb(db);
  return conv;
}

export function addChatMessage(params: {
  conversationId: string;
  senderType: "customer" | "vendor";
  senderName: string;
  text: string;
}): ChatMessage | null {
  const db = readDb();
  const conv = db.conversations.find((c) => c.id === params.conversationId);
  if (!conv) return null;

  const now = new Date().toISOString();
  const msg: ChatMessage = {
    id: `msg_${crypto.randomUUID()}`,
    conversationId: conv.id,
    senderType: params.senderType,
    senderName: params.senderName,
    text: params.text.trim(),
    createdAt: now,
  };

  conv.updatedAt = now;
  db.messages.push(msg);
  writeDb(db);
  return msg;
}

export function updateVendorVerification(
  vendorId: string,
  status: VerificationStatus
): Vendor | null {
  const db = readDb();
  const vendor = db.vendors.find((v) => v.id === vendorId);
  if (!vendor) return null;
  vendor.verificationStatus = status;
  writeDb(db);
  return vendor;
}

export function toggleProductAvailability(
  productId: string,
  availability: Product["availability"],
  quantity?: number
): Product | null {
  const db = readDb();
  const product = db.products.find((p) => p.id === productId);
  if (!product) return null;
  product.availability = availability;
  if (typeof quantity === "number") {
    product.quantity = Math.max(0, quantity);
  }
  product.updatedAt = new Date().toISOString();
  writeDb(db);
  return product;
}
