import fs from "fs";
import os from "os";
import path from "path";
import crypto from "crypto";
import {
  KovaDatabase,
  Vendor,
  Product,
  Order,
  Receipt,
  UserAccount,
  PaymentCategory,
  VendorRating,
  VendorNotification,
  ChatConversation,
  ChatMessage,
  CustomerInfo,
  VerificationStatus,
} from "./types";
import { calculateCommission } from "./format";
import {
  DEMO_SHOWROOM_VENDOR_ID,
  createDemoShowroomVendor,
  createDemoShowroomProducts,
} from "./demoShowroom";

const DATA_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), "kova-data")
  : path.join(process.cwd(), ".data");
const DB_PATH = path.join(DATA_DIR, "kova-db.json");
const RESERVATION_TTL_MS = 15 * 60 * 1000; // 15 minutes

const globalForDb = globalThis as unknown as {
  __kovaMemoryDb?: KovaDatabase;
};

function createSeedDatabase(): KovaDatabase {
  const now = new Date().toISOString();
  const vendors: Vendor[] = [
    {
      id: "vendor-micheal-01",
      username: "Micheal H.",
      fullName: "Edafe Jesugare",
      role: "Agent & Verified Vendor",
      categoryBadge: "Electronics & Homes",
      avatarUrl: "/listings/avatar-micheal.jpg",
      coverImage: "/listings/avatar-micheal.jpg",
      location: "Sabo, Auchi, Edo State, Nigeria",
      bio: "Verified property agent and marketplace vendor offering quality smartphones, electronics, home furniture, and modern apartments across Nigeria.",
      verificationStatus: "verified",
      eligible: true,
      rating: 4.6,
      ratingCount: 120,
      stats: {
        posts: 67,
        followers: 2000,
        deals: 500,
        views: 4800,
      },
      memberSince: "2024",
    },
  ];

  const products: Product[] = [
    {
      id: "prod-smartphone-01",
      vendorId: "vendor-micheal-01",
      name: "Smartphone",
      description:
        "Sleek modern flagship smartphone with vibrant OLED display, 5G connectivity, long-lasting battery, and crystal-clear camera system. Factory unlocked, sealed in box, and backed by full seller warranty.",
      price: 300000,
      deliveryFee: 0,
      waybillLabel: "Free waybill",
      options: ["128GB Black", "256GB Titanium"],
      condition: "New",
      category: "Electronics",
      location: "Ikeja, Lagos State, Nigeria",
      images: ["/listings/smartphone.jpg"],
      isVideo: true,
      quantity: 7,
      status: "approved",
      availability: "available",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prod-smart-tv-02",
      vendorId: "vendor-micheal-01",
      name: '2026 New LG 65" UHD Smart TV',
      description:
        "Ultra-crisp 65-inch 4K UHD Smart TV with HDR10 support, built-in streaming apps, slim bezel frame, and rich stereo sound. Lightly used for 3 months in spotless condition with original remote and power cable.",
      price: 378000,
      deliveryFee: 0,
      waybillLabel: "Available",
      options: ['65" TV Only', '65" TV + Wall Mount'],
      condition: "Fairly Used",
      category: "Electronics",
      location: "Lekki Peninsula II, Lagos State, Nigeria",
      images: ["/listings/smart-tv.jpg"],
      isVideo: false,
      quantity: 3,
      status: "approved",
      availability: "available",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prod-speaker-03",
      vendorId: "vendor-micheal-01",
      name: "JBL Charge 5 Portable Speaker",
      description:
        "Powerful waterproof portable Bluetooth speaker with bold bass, 20 hours of playtime, IP67 dust and water resistance, and built-in powerbank to charge your phone on the go.",
      price: 200000,
      deliveryFee: 0,
      waybillLabel: "Free waybill",
      options: ["Matte Black", "Deep Navy"],
      condition: "New",
      category: "Electronics",
      location: "Trans-Ekulu, Enugu State, Nigeria",
      images: ["/listings/speaker.jpg"],
      isVideo: false,
      quantity: 5,
      status: "approved",
      availability: "available",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prop-penthouse-05",
      vendorId: "vendor-micheal-01",
      name: "Penthouse",
      description:
        "Modern 3-bedroom apartment with POP ceiling, water heater, clean borehole water, spacious living room, fitted kitchen, and 24/7 security in a quiet, accessible neighborhood.",
      price: 1800000,
      pricePeriod: "Per year",
      deliveryFee: 0,
      waybillLabel: "Free inspection",
      inspectionFee: 10000,
      cautionFee: 0,
      agentFee: 180000,
      amenities: [
        "Electricity supply",
        "Running water",
        "Wardrobe",
        "24/7 Security",
      ],
      condition: "New",
      category: "Properties",
      location: "Owerri, Imo State, Nigeria",
      images: ["/listings/flat-exterior.jpg"],
      isVideo: true,
      quantity: 2,
      status: "approved",
      availability: "available",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prop-terrace-04",
      vendorId: "vendor-micheal-01",
      name: "Terrace Duplex",
      description:
        "Contemporary terrace duplex with modern exterior facade, interlocked compound driveway, spacious en-suite bedrooms, balcony view, reliable power lines, and constant water supply.",
      price: 5000000,
      pricePeriod: "year",
      deliveryFee: 0,
      waybillLabel: "Verified listing",
      inspectionFee: 10000,
      cautionFee: 0,
      agentFee: 250000,
      amenities: [
        "Electricity supply",
        "Running water",
        "Wardrobe",
        "Compound parking",
      ],
      condition: "New",
      category: "Properties",
      location: "Eziobodo, Ihiagwa, Imo State, Nigeria",
      images: ["/listings/terrace-duplex.jpg"],
      isVideo: false,
      quantity: 2,
      status: "approved",
      availability: "available",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prop-flat-rent-01",
      vendorId: "vendor-micheal-01",
      name: "Two bedroom flat, for rent",
      description:
        "Bright, spacious two bedroom flat in Sabo, Auchi, Edo State. Finished with modern ceilings, clean tiled flooring, constant water supply, and secure compound parking.",
      price: 120000,
      pricePeriod: "Per year",
      deliveryFee: 0,
      waybillLabel: "Free waybill",
      inspectionLabel: "₦5,000",
      inspectionFee: 5000,
      cautionFee: 0,
      agentFee: 17000,
      amenities: ["Electricity supply", "Running water", "Wardrobe"],
      options: ["Unfurnished", "Semi-Furnished"],
      condition: "New",
      category: "Properties",
      location: "Sabo, Auchi, Edo State, Nigeria",
      images: ["/listings/living-room-cozy.jpg"],
      isVideo: true,
      quantity: 2,
      status: "approved",
      availability: "available",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prod-desk-01",
      vendorId: "vendor-micheal-01",
      name: "Nordic Oak Study Desk & Chair",
      description:
        "Durable, stylish, and perfect for any bedroom or home office. Built with quality wood and a smooth finish to provide both comfort and elegance, paired with a supportive ergonomic chair.",
      price: 35000,
      deliveryFee: 0,
      waybillLabel: "Free waybill",
      options: ["Natural Oak", "Matte Walnut"],
      condition: "New",
      category: "Furniture",
      location: "Sabo, Auchi, Edo State, Nigeria",
      images: ["/listings/study-desk.jpg"],
      isVideo: false,
      quantity: 5,
      status: "approved",
      availability: "available",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "prop-bedroom-04",
      vendorId: "vendor-micheal-01",
      name: "Modern Luxury Living Flat",
      description:
        "Move-in ready modern apartment with warm recessed LED ceiling lighting, tiled floors, reliable water supply, and spacious lounge in a serene gated compound.",
      price: 120000,
      pricePeriod: "Per year",
      deliveryFee: 0,
      waybillLabel: "Free waybill",
      inspectionFee: 5000,
      cautionFee: 0,
      agentFee: 17000,
      amenities: ["Electricity supply", "Running water", "Wardrobe"],
      condition: "New",
      category: "Properties",
      location: "Sabo, Auchi, Edo State, Nigeria",
      images: ["/listings/living-room-luxury.jpg"],
      isVideo: false,
      quantity: 3,
      status: "approved",
      availability: "available",
      createdAt: now,
      updatedAt: now,
    },
  ];

  const ratings: VendorRating[] = [
    {
      id: "rat_seed_1",
      vendorId: "vendor-micheal-01",
      stars: 5,
      reviewerName: "Blessing O.",
      comment: "Very smooth delivery and transparent payment process. Exactly as pictured.",
      createdAt: now,
    },
    {
      id: "rat_seed_2",
      vendorId: "vendor-micheal-01",
      stars: 4,
      reviewerName: "Samuel E.",
      comment: "Fast response and genuine quality. Would definitely buy again on Kova.",
      createdAt: now,
    },
  ];

  const demoVendor = createDemoShowroomVendor();
  const demoProducts = createDemoShowroomProducts(now);

  return {
    vendors: [...vendors, demoVendor],
    products: [...products, ...demoProducts],
    users: [],
    ratings,
    reservations: [],
    orders: [],
    receipts: [],
    notifications: [],
    conversations: [],
    messages: [],
  };
}

function ensureDbFile(): KovaDatabase {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_PATH)) {
      const seed = globalForDb.__kovaMemoryDb ?? createSeedDatabase();
      globalForDb.__kovaMemoryDb = seed;
      fs.writeFileSync(DB_PATH, JSON.stringify(seed, null, 2), "utf8");
      return seed;
    }
    const raw = fs.readFileSync(DB_PATH, "utf8");
    const parsed = JSON.parse(raw) as KovaDatabase;
    if (!Array.isArray(parsed.users)) parsed.users = [];
    if (!Array.isArray(parsed.ratings)) parsed.ratings = [];
    for (const v of parsed.vendors ?? []) {
      if (v.stats && typeof v.stats.views !== "number") {
        v.stats.views = 4800;
      }
    }
    // Hydrate separate demo Showroom vendor & listings without modifying existing vendor data
    const nowHydrate = new Date().toISOString();
    const existingDemo = parsed.vendors.find(
      (v) => v.id === DEMO_SHOWROOM_VENDOR_ID
    );
    if (!existingDemo) {
      parsed.vendors.push(createDemoShowroomVendor());
    } else {
      existingDemo.fullName = "Zara Blue";
      existingDemo.username = "ZaraBlue";
    }
    const existingById = new Map(parsed.products.map((p) => [p.id, p]));
    for (const p of createDemoShowroomProducts(nowHydrate)) {
      const existingProd = existingById.get(p.id);
      if (!existingProd) {
        parsed.products.push(p);
      } else if (p.isVideo && p.videoUrl && !existingProd.videoUrl) {
        existingProd.isVideo = true;
        existingProd.videoUrl = p.videoUrl;
      }
    }
    globalForDb.__kovaMemoryDb = parsed;
    return parsed;
  } catch {
    if (!globalForDb.__kovaMemoryDb) {
      globalForDb.__kovaMemoryDb = createSeedDatabase();
    }
    return globalForDb.__kovaMemoryDb;
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
  globalForDb.__kovaMemoryDb = db;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tmpPath = `${DB_PATH}.${process.pid}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(db, null, 2), "utf8");
    fs.renameSync(tmpPath, DB_PATH);
  } catch {
    // Fallback safely to in-memory store on read-only serverless environments
  }
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

function hashPassword(password: string, salt?: string): string {
  const s = salt ?? crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, s, 32).toString("hex");
  return `${s}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 32).toString("hex");
  const a = Buffer.from(hash);
  const b = Buffer.from(candidate);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function registerBuyerAccount(params: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}): { error?: string; user?: UserAccount; verificationToken?: string } {
  const db = readDb();
  const normEmail = params.email.trim().toLowerCase();
  const normPhone = normalizePhone(params.phone);

  const existing = db.users.find(
    (u) => u.email.toLowerCase() === normEmail
  );
  if (existing && existing.passwordHash && existing.emailVerified !== false) {
    return {
      error:
        "An account with this email already exists. Please sign in instead.",
    };
  }

  const now = new Date().toISOString();
  const verificationToken = crypto.randomBytes(24).toString("hex");
  const verificationExpiresAt = new Date(
    Date.now() + VERIFICATION_TTL_MS
  ).toISOString();
  const cleanFirst = params.firstName.trim();
  const cleanLast = params.lastName.trim();
  const fullName = `${cleanFirst} ${cleanLast}`.trim();

  if (existing) {
    existing.firstName = cleanFirst;
    existing.lastName = cleanLast;
    existing.firstAndMiddleName = cleanFirst;
    existing.surname = cleanLast;
    existing.name = fullName;
    existing.usernameOrBusiness = fullName;
    existing.phone = normPhone;
    existing.role = "Buyer";
    existing.passwordHash = hashPassword(params.password);
    existing.emailVerified = false;
    existing.verificationToken = verificationToken;
    existing.verificationExpiresAt = verificationExpiresAt;
    existing.confirmationEmailSentAt = now;
    writeDb(db);
    return { user: existing, verificationToken };
  }

  const user: UserAccount = {
    id: `usr_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`,
    firstName: cleanFirst,
    lastName: cleanLast,
    firstAndMiddleName: cleanFirst,
    surname: cleanLast,
    name: fullName,
    usernameOrBusiness: fullName,
    phone: normPhone,
    email: normEmail,
    role: "Buyer",
    passwordHash: hashPassword(params.password),
    emailVerified: false,
    verificationToken,
    verificationExpiresAt,
    confirmationEmailSentAt: now,
    createdAt: now,
  };

  db.users.push(user);
  writeDb(db);
  return { user, verificationToken };
}

export function verifyUserEmailToken(token: string): {
  status: "verified" | "expired" | "invalid";
  user?: UserAccount;
  email?: string;
  error?: string;
} {
  const clean = token.trim();
  if (!clean) {
    return {
      status: "invalid",
      error: "This verification link is invalid or incomplete.",
    };
  }
  const db = readDb();
  const user = db.users.find((u) => u.verificationToken === clean);
  if (!user) {
    return {
      status: "invalid",
      error: "This verification link is invalid or has already been used.",
    };
  }
  if (
    user.verificationExpiresAt &&
    new Date(user.verificationExpiresAt).getTime() < Date.now()
  ) {
    return {
      status: "expired",
      email: user.email,
      error: "This verification link has expired. Please request a new one.",
    };
  }

  user.emailVerified = true;
  user.verificationToken = null;
  user.verificationExpiresAt = null;
  writeDb(db);
  return { status: "verified", user };
}

export function regenerateVerificationToken(email: string): {
  error?: string;
  user?: UserAccount;
  verificationToken?: string;
} {
  const db = readDb();
  const normEmail = email.trim().toLowerCase();
  const user = db.users.find((u) => u.email.toLowerCase() === normEmail);
  if (!user) {
    return { error: "No account found with that email address." };
  }
  if (user.emailVerified === true) {
    return { error: "This email address is already verified. You can sign in now." };
  }
  const verificationToken = crypto.randomBytes(24).toString("hex");
  user.verificationToken = verificationToken;
  user.verificationExpiresAt = new Date(
    Date.now() + VERIFICATION_TTL_MS
  ).toISOString();
  user.confirmationEmailSentAt = new Date().toISOString();
  writeDb(db);
  return { user, verificationToken };
}

export function authenticateBuyer(
  email: string,
  password: string
): { error?: string; needsVerification?: boolean; user?: UserAccount } {
  const db = readDb();
  const normEmail = email.trim().toLowerCase();
  const user = db.users.find((u) => u.email.toLowerCase() === normEmail);
  if (!user || !user.passwordHash) {
    return { error: "Invalid email address or password." };
  }
  if (!verifyPassword(password, user.passwordHash)) {
    return { error: "Invalid email address or password." };
  }
  if (user.emailVerified === false) {
    return {
      needsVerification: true,
      error: "Please verify your email address before signing in.",
    };
  }
  return { user };
}

export function getUserById(userId: string): UserAccount | null {
  const db = readDb();
  return db.users.find((u) => u.id === userId) ?? null;
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
    (u) =>
      u.email.toLowerCase() === normEmail &&
      normalizePhone(u.phone) === normPhone
  );
  if (!user) {
    const parts = params.name.trim().split(/\s+/);
    const lastName = parts.length > 1 ? parts[parts.length - 1] : "";
    const firstName =
      parts.length > 1 ? parts.slice(0, -1).join(" ") : params.name.trim();
    user = {
      id: `usr_${crypto.createHash("sha256").update(`${normEmail}|${normPhone}`).digest("hex").slice(0, 16)}`,
      firstName,
      lastName,
      firstAndMiddleName: firstName,
      surname: lastName,
      name: params.name.trim(),
      usernameOrBusiness: params.name.trim(),
      phone: normPhone,
      email: normEmail,
      role: "Buyer",
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
      v.id.toLowerCase() === decoded ||
      (v.id === DEMO_SHOWROOM_VENDOR_ID &&
        (slug === "zaraglow" || slug === "zarablue"))
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
  paymentCategory?: PaymentCategory;
  authenticatedUserId?: string | null;
  selectedOption?: string;
  customer: CustomerInfo;
}): { error?: string; order?: Order; reservationId?: string } {
  const existingAuthUser = params.authenticatedUserId
    ? getUserById(params.authenticatedUserId)
    : null;
  const user =
    existingAuthUser ??
    getOrCreateUserAccount({
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
    return { error: "This Showroom is currently unavailable." };
  }

  const paymentCategory: PaymentCategory = params.paymentCategory ?? "product";
  const qty =
    paymentCategory === "product" ? Math.max(1, Math.floor(params.quantity)) : 1;

  if (paymentCategory === "product") {
    const check = getEffectiveAvailability(db, product);
    if (!check.available || check.remaining < qty) {
      return {
        error:
          check.reason ||
          "Sorry, this product is currently unavailable in the requested quantity.",
      };
    }
  }

  let unitPrice = product.price;
  const deliveryFee = 0;
  let paymentLabel = "Product Payment";

  if (paymentCategory === "property_inspection") {
    unitPrice = product.inspectionFee && product.inspectionFee > 0 ? product.inspectionFee : 10000;
    paymentLabel = "Property Inspection Fee";
  } else if (paymentCategory === "property_agent") {
    unitPrice = product.agentFee && product.agentFee > 0 ? product.agentFee : 17000;
    paymentLabel = "Property Agent Fee";
  }

  const subtotal = unitPrice * qty;
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
    paymentCategory,
    paymentLabel,
    productId: product.id,
    productName: product.name,
    productImage: product.images[0] ?? "/listings/smartphone.jpg",
    selectedOption: params.selectedOption,
    vendorId: vendor.id,
    vendorName: vendor.fullName,
    vendorUsername: vendor.username,
    quantity: qty,
    unitPrice,
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

  let reservationId: string | undefined;
  if (paymentCategory === "product") {
    reservationId = `res_${crypto.randomUUID()}`;
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

  if (product && (!order.paymentCategory || order.paymentCategory === "product")) {
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
    vendorLocation: vendor?.location,
    vendorCategory: vendor?.categoryBadge || vendor?.role,
    productId: order.productId,
    productName: order.productName,
    productDescription: product?.description ?? "",
    productImage: order.productImage,
    paymentLabel: order.paymentLabel,
    selectedOption: order.selectedOption,
    quantity: order.quantity,
    unitPrice: order.unitPrice,
    deliveryFee: order.deliveryFee,
    applicableFees: order.kovaCommission,
    totalPaid: order.totalPaid,
    paymentMethod,
    paymentStatus: "Paid",
    paidAt: now,
    emailSent: false,
    emailSentAt: null,
    emailDeliveryProvider: null,
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

export function recordReceiptEmailStatus(
  receiptId: string,
  status: { sent: boolean; sentAt: string; provider: string }
): void {
  const db = readDb();
  const receipt = db.receipts.find((r) => r.id === receiptId);
  if (!receipt) return;
  receipt.emailSent = status.sent;
  receipt.emailSentAt = status.sentAt;
  receipt.emailDeliveryProvider = status.provider;
  writeDb(db);
}

export function getReceiptByIdAndToken(
  receiptId: string,
  token: string | null | undefined
): Receipt | null {
  const db = readDb();
  const receipt = db.receipts.find((r) => r.id === receiptId);
  if (!receipt || !token) return null;

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

export function getVendorRatings(vendorId: string): VendorRating[] {
  const db = readDb();
  return db.ratings
    .filter((r) => r.vendorId === vendorId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export function addVendorRating(params: {
  vendorId: string;
  stars: number;
  reviewerName: string;
  comment: string;
}): { rating: number; ratingCount: number; review: VendorRating } | null {
  const db = readDb();
  const vendor = db.vendors.find((v) => v.id === params.vendorId);
  if (!vendor) return null;

  const clamped = Math.min(5, Math.max(1, Math.round(params.stars)));
  const prevCount = vendor.ratingCount || 1;
  const totalScore = vendor.rating * prevCount + clamped;
  const nextCount = prevCount + 1;
  const nextAverage = Math.round((totalScore / nextCount) * 10) / 10;

  vendor.rating = nextAverage;
  vendor.ratingCount = nextCount;

  const review: VendorRating = {
    id: `rat_${crypto.randomUUID()}`,
    vendorId: vendor.id,
    stars: clamped,
    reviewerName: params.reviewerName.trim() || "Verified Visitor",
    comment: params.comment.trim(),
    createdAt: new Date().toISOString(),
  };

  db.ratings.unshift(review);
  writeDb(db);
  return { rating: vendor.rating, ratingCount: vendor.ratingCount, review };
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
