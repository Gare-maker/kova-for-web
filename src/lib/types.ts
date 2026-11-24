export type VerificationStatus =
  | "verified"
  | "pending"
  | "unverified"
  | "rejected"
  | "suspended";

export type ProductStatus = "approved" | "pending_review" | "draft" | "unpublished";
export type ProductAvailability = "available" | "reserved" | "sold" | "unavailable";

export interface Vendor {
  id: string;
  username: string;
  fullName: string;
  role: string;
  categoryBadge?: string;
  avatarUrl: string | null;
  coverImage?: string | null;
  location: string;
  bio: string;
  verificationStatus: VerificationStatus;
  eligible: boolean;
  rating: number;
  ratingCount: number;
  stats: {
    posts: number;
    followers: number;
    deals: number;
  };
  memberSince: string;
}

export interface Product {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  price: number;
  pricePeriod?: string;
  deliveryFee: number;
  waybillLabel?: string;
  inspectionLabel?: string;
  inspectionFee?: number;
  cautionFee?: number;
  agentFee?: number;
  amenities?: string[];
  options?: string[];
  condition: "New" | "Fairly Used" | "Like New" | "Used - Good" | "Refurbished";
  category: string;
  location: string;
  images: string[];
  isVideo?: boolean;
  quantity: number;
  status: ProductStatus;
  availability: ProductAvailability;
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  id: string;
  productId: string;
  quantity: number;
  orderId: string;
  expiresAt: string;
  released: boolean;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  currentLocation: string;
  deliveryAddress: string;
  deliveryNotes?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  phone: string;
  email: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderReference: string;
  transactionReference: string;
  userId: string;
  productId: string;
  productName: string;
  productImage: string;
  selectedOption?: string;
  vendorId: string;
  vendorName: string;
  vendorUsername: string;
  quantity: number;
  unitPrice: number;
  deliveryFee: number;
  subtotal: number;
  commissionRate: number;
  kovaCommission: number;
  vendorBalance: number;
  totalPaid: number;
  customer: CustomerInfo;
  paymentStatus: "pending" | "paid" | "failed";
  paymentMethod: string;
  source: "public_website";
  receiptId: string | null;
  receiptToken: string | null;
  createdAt: string;
  paidAt: string | null;
}

export interface Receipt {
  id: string;
  accessToken: string;
  userId: string;
  orderId: string;
  receiptNumber: string;
  orderReference: string;
  transactionReference: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  currentLocation: string;
  deliveryAddress: string;
  deliveryNotes?: string;
  vendorName: string;
  vendorUsername: string;
  productId: string;
  productName: string;
  productDescription: string;
  productImage: string;
  selectedOption?: string;
  quantity: number;
  unitPrice: number;
  deliveryFee: number;
  applicableFees: number;
  totalPaid: number;
  paymentMethod: string;
  paymentStatus: "Paid";
  paidAt: string;
}

export interface VendorNotification {
  id: string;
  vendorId: string;
  type: "payment_received";
  title: string;
  message: string;
  orderId: string;
  orderReference: string;
  customerName: string;
  productName: string;
  amountPaid: number;
  paymentStatus: "Paid";
  createdAt: string;
  read: boolean;
}

export interface ChatConversation {
  id: string;
  vendorId: string;
  productId: string | null;
  productName: string | null;
  productPrice: number | null;
  productImage: string | null;
  guestSessionId: string;
  customerName: string;
  customerPhone: string;
  kovaUserId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderType: "customer" | "vendor";
  senderName: string;
  text: string;
  createdAt: string;
}

export interface VendorRating {
  id: string;
  vendorId: string;
  stars: number;
  reviewerName: string;
  comment: string;
  createdAt: string;
}

export interface KovaDatabase {
  vendors: Vendor[];
  products: Product[];
  users: UserAccount[];
  ratings: VendorRating[];
  reservations: Reservation[];
  orders: Order[];
  receipts: Receipt[];
  notifications: VendorNotification[];
  conversations: ChatConversation[];
  messages: ChatMessage[];
}
