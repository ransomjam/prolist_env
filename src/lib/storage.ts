import { Transaction, SmartShareHistory, User, TransactionStatus } from "@/types/transaction";
import { Post } from "@/types/listing";

const STORAGE_KEYS = {
  SESSION: "prolist_session",
  USERS: "prolist_users",
  TRANSACTIONS: "prolist_transactions",
  SMART_SHARE_HISTORY: "prolist_smart_share_history",
  POSTS: "prolist_posts",
  BUYER_TRANSACTIONS: "prolist_buyer_transactions",
  AI_HISTORY: "prolist_ai_history",
};

// Demo users - seeded on init
const DEMO_USERS: User[] = [
  {
    id: "seller-demo",
    name: "Abena Tech",
    email: "seller@demo.com",
    phone: "+237600000001",
    city: "Yaoundé",
    isVerified: true,
    verificationStatus: "VERIFIED",
    hasPin: true,
    pin: "1234",
    role: "BUYER_SELLER",
    createdAt: new Date().toISOString(),
  },
  {
    id: "buyer-demo",
    name: "Paul Buyer",
    email: "buyer@demo.com",
    phone: "+237600000002",
    city: "Douala",
    isVerified: false,
    verificationStatus: "UNVERIFIED",
    hasPin: true,
    pin: "1111",
    role: "BUYER_SELLER",
    createdAt: new Date().toISOString(),
  },
  {
    id: "admin-demo",
    name: "Admin Boss",
    email: "admin@demo.com",
    phone: "+237600000003",
    city: "Yaoundé",
    isVerified: true,
    verificationStatus: "VERIFIED",
    hasPin: true,
    pin: "admin",
    role: "ADMIN",
    createdAt: new Date().toISOString(),
  },
  {
    id: "agent-demo",
    name: "Kemi Agent",
    email: "agent@demo.com",
    phone: "+237600000004",
    city: "Bamenda",
    isVerified: true,
    verificationStatus: "VERIFIED",
    hasPin: true,
    pin: "1234",
    role: "AGENT",
    createdAt: new Date().toISOString(),
  },
];

// Demo posts for testing
const DEMO_POSTS: Post[] = [
  {
    id: "post-demo-1",
    sellerId: "seller-demo",
    sellerName: "Abena Tech",
    sellerPhone: "+237600000001",
    title: "iPhone 14 Pro Max 256GB",
    description: "Brand new, sealed in box. Original Apple warranty included.",
    price: 450000,
    category: "electronics",
    deliveryInfo: "Delivery available to all major cities",
    isPreOrder: false,
    isActive: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-demo-2",
    sellerId: "seller-demo",
    sellerName: "Abena Tech",
    sellerPhone: "+237600000001",
    title: "Samsung Galaxy S24 Ultra",
    description: "Latest model, 512GB storage, Titanium Black.",
    price: 520000,
    category: "electronics",
    deliveryInfo: "Free delivery in Yaoundé",
    isPreOrder: false,
    isActive: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Demo transactions for testing Admin/Agent workflow
const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-demo-1",
    postId: "post-demo-1",
    sellerId: "seller-demo",
    sellerName: "Abena Tech",
    sellerPhone: "+237600000001",
    buyerId: "buyer-demo",
    buyerName: "Paul Buyer",
    buyerPhone: "+237600000002",
    productName: "iPhone 14 Pro Max 256GB",
    price: 450000,
    deliveryFee: 5000,
    deliveryLocation: "Douala, Cameroon",
    deliveryArea: "Douala",
    status: "escrow_held",
    confirmationCode: "123456",
    paymentLink: "https://pay.prolist.cm/tx-demo-1",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isPreOrder: false,
  },
  {
    id: "tx-demo-2",
    postId: "post-demo-2",
    sellerId: "seller-demo",
    sellerName: "Abena Tech",
    sellerPhone: "+237600000001",
    buyerId: "buyer-demo",
    buyerName: "Paul Buyer",
    buyerPhone: "+237600000002",
    productName: "Samsung Galaxy S24 Ultra",
    price: 520000,
    deliveryFee: 5000,
    deliveryLocation: "Douala, Cameroon",
    deliveryArea: "Douala",
    status: "in_transit_to_hub",
    confirmationCode: "654321",
    paymentLink: "https://pay.prolist.cm/tx-demo-2",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    isPreOrder: false,
    logistics: {
      dropoffCompany: "DHL Express",
      dropoffCity: "Yaoundé",
      dropoffNote: "Tracking: CM12345678",
    },
  },
  {
    id: "tx-demo-3",
    postId: "post-demo-1",
    sellerId: "seller-demo",
    sellerName: "Abena Tech",
    sellerPhone: "+237600000001",
    buyerId: "buyer-demo",
    buyerName: "Paul Buyer",
    buyerPhone: "+237600000002",
    productName: "MacBook Air M2",
    price: 750000,
    deliveryFee: 8000,
    deliveryLocation: "Bamenda, Cameroon",
    deliveryArea: "Bamenda",
    status: "at_prolist_hub",
    confirmationCode: "789012",
    paymentLink: "https://pay.prolist.cm/tx-demo-3",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    isPreOrder: false,
    logistics: {
      dropoffCompany: "Campost",
      dropoffCity: "Yaoundé",
    },
  },
  {
    id: "tx-demo-4",
    postId: "post-demo-2",
    sellerId: "seller-demo",
    sellerName: "Abena Tech",
    sellerPhone: "+237600000001",
    buyerId: "buyer-demo",
    buyerName: "Paul Buyer",
    buyerPhone: "+237600000002",
    productName: "AirPods Pro 2nd Gen",
    price: 180000,
    deliveryFee: 3000,
    deliveryLocation: "Bamenda, Cameroon",
    deliveryArea: "Bamenda",
    status: "out_for_delivery",
    confirmationCode: "345678",
    paymentLink: "https://pay.prolist.cm/tx-demo-4",
    assignedAgentId: "agent-demo",
    assignedAgentName: "Kemi Agent",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    isPreOrder: false,
    logistics: {
      dropoffCompany: "Express Cargo",
      dropoffCity: "Yaoundé",
    },
  },
];

// Initialize demo users on first load
function initializeDemoUsers(): void {
  const users = getUsers();
  const demoIds = DEMO_USERS.map((u) => u.id);
  const hasAllDemo = demoIds.every((id) => users.some((u) => u.id === id));

  if (!hasAllDemo) {
    const merged = [...users.filter((u) => !demoIds.includes(u.id)), ...DEMO_USERS];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(merged));
  }
}

// Initialize demo posts
// Helper to get posts for initialization (before export is defined)
function getPostsInternal(): Post[] {
  const data = localStorage.getItem(STORAGE_KEYS.POSTS);
  return data ? JSON.parse(data) : [];
}

// Helper to get transactions for initialization (before export is defined)
function getTransactionsInternal(): Transaction[] {
  const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  return data ? JSON.parse(data) : [];
}

function initializeDemoPosts(): void {
  const posts = getPostsInternal();
  const demoIds = DEMO_POSTS.map((p) => p.id);
  const hasAllDemo = demoIds.every((id) => posts.some((p) => p.id === id));

  if (!hasAllDemo) {
    const merged = [...posts.filter((p) => !demoIds.includes(p.id)), ...DEMO_POSTS];
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(merged));
  }
}

// Initialize demo transactions
function initializeDemoTransactions(): void {
  const transactions = getTransactionsInternal();
  const demoIds = DEMO_TRANSACTIONS.map((t) => t.id);
  const hasAllDemo = demoIds.every((id) => transactions.some((t) => t.id === id));

  if (!hasAllDemo) {
    const merged = [...transactions.filter((t) => !demoIds.includes(t.id)), ...DEMO_TRANSACTIONS];
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(merged));
  }
}

// Call on module load
initializeDemoUsers();
initializeDemoPosts();
initializeDemoTransactions();

// User Management
export function getUsers(): User[] {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
}

export function getUserByEmail(email: string): User | null {
  const users = getUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export function getUserById(id: string): User | null {
  const users = getUsers();
  return users.find((u) => u.id === id) || null;
}

export function saveUser(user: User): void {
  const users = getUsers();
  const existingIndex = users.findIndex((u) => u.id === user.id);

  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }

  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

// Session Management
export function getSession(): User | null {
  const data = localStorage.getItem(STORAGE_KEYS.SESSION);
  return data ? JSON.parse(data) : null;
}

export function setSession(user: User): void {
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}

export function updateSession(updates: Partial<User>): void {
  const session = getSession();
  if (session) {
    const updated = { ...session, ...updates };
    setSession(updated);
    saveUser(updated);
  }
}

// Posts (formerly Listings)
export function getPosts(): Post[] {
  const data = localStorage.getItem(STORAGE_KEYS.POSTS);
  return data ? JSON.parse(data) : [];
}

export function getSellerPosts(sellerId: string): Post[] {
  return getPosts().filter((p) => p.sellerId === sellerId);
}

export function savePost(post: Post): void {
  const posts = getPosts();
  const existingIndex = posts.findIndex((p) => p.id === post.id);

  if (existingIndex >= 0) {
    posts[existingIndex] = post;
  } else {
    posts.unshift(post);
  }

  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
}

export function getPost(id: string): Post | null {
  const posts = getPosts();
  return posts.find((p) => p.id === id) || null;
}

export function deletePost(id: string): void {
  const posts = getPosts().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
}

// Backwards compatibility aliases
export const getListings = getPosts;
export const getSellerListings = getSellerPosts;
export const saveListing = savePost;
export const getListing = getPost;
export const deleteListing = deletePost;

// Transactions
export function getTransactions(): Transaction[] {
  const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  return data ? JSON.parse(data) : [];
}

export function getSellerTransactions(sellerId: string): Transaction[] {
  return getTransactions().filter((t) => t.sellerId === sellerId);
}

export function getBuyerTransactions(buyerId: string): Transaction[] {
  return getTransactions().filter((t) => t.buyerId === buyerId || t.buyerPhone === buyerId);
}

export function saveTransaction(transaction: Transaction): void {
  const transactions = getTransactions();
  const existingIndex = transactions.findIndex((t) => t.id === transaction.id);

  if (existingIndex >= 0) {
    transactions[existingIndex] = transaction;
  } else {
    transactions.unshift(transaction);
  }

  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

export function getTransaction(id: string): Transaction | null {
  const transactions = getTransactions();
  return transactions.find((t) => t.id === id) || null;
}

export function updateTransactionStatus(
  id: string,
  status: Transaction["status"],
  skipNotification = false
): void {
  const transactions = getTransactions();
  const index = transactions.findIndex((t) => t.id === id);

  if (index >= 0) {
    const transaction = transactions[index];
    transactions[index].status = status;
    transactions[index].updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    
    // Trigger notification (imported dynamically to avoid circular deps)
    if (!skipNotification) {
      import("./notifications").then(({ notifyStatusChange }) => {
        notifyStatusChange(transaction, status);
      });
    }
  }
}

// Buyer transaction tracking (for non-logged-in buyers)
export function saveBuyerTransaction(transactionId: string): void {
  const stored = localStorage.getItem(STORAGE_KEYS.BUYER_TRANSACTIONS);
  const ids: string[] = stored ? JSON.parse(stored) : [];
  if (!ids.includes(transactionId)) {
    ids.unshift(transactionId);
    localStorage.setItem(STORAGE_KEYS.BUYER_TRANSACTIONS, JSON.stringify(ids.slice(0, 50)));
  }
}

export function getBuyerTransactionIds(): string[] {
  const stored = localStorage.getItem(STORAGE_KEYS.BUYER_TRANSACTIONS);
  return stored ? JSON.parse(stored) : [];
}

// Smart Share History
export function getSmartShareHistory(): SmartShareHistory[] {
  const data = localStorage.getItem(STORAGE_KEYS.SMART_SHARE_HISTORY);
  return data ? JSON.parse(data) : [];
}

export function saveSmartShareHistory(entry: SmartShareHistory): void {
  const history = getSmartShareHistory();
  history.unshift(entry);
  const trimmed = history.slice(0, 20);
  localStorage.setItem(STORAGE_KEYS.SMART_SHARE_HISTORY, JSON.stringify(trimmed));
}

// AI Caption History
export interface AICaptionHistoryEntry {
  postId?: string;
  mode: string;
  originalText: string;
  generatedText: string;
  usedAt: string;
}

export function getAIHistory(): AICaptionHistoryEntry[] {
  const data = localStorage.getItem(STORAGE_KEYS.AI_HISTORY);
  return data ? JSON.parse(data) : [];
}

export function saveAIHistory(entry: AICaptionHistoryEntry): void {
  const history = getAIHistory();
  history.unshift(entry);
  const trimmed = history.slice(0, 50);
  localStorage.setItem(STORAGE_KEYS.AI_HISTORY, JSON.stringify(trimmed));
}

// Generate unique IDs
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Generate confirmation code
export function generateConfirmationCode(): string {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
}

// Generate OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Format price in XAF
export function formatPriceXAF(price: number): string {
  return new Intl.NumberFormat("fr-CM", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price) + " XAF";
}
