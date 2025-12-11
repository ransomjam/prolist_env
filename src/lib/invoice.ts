import { Transaction, Invoice } from "@/types/transaction";
import { saveTransaction, getTransaction } from "./storage";

// Generate invoice number: PL-YYYY-SEQ
let invoiceSequence = parseInt(localStorage.getItem("prolist_invoice_seq") || "0");

export function generateInvoiceNumber(): string {
  invoiceSequence++;
  localStorage.setItem("prolist_invoice_seq", String(invoiceSequence));
  const year = new Date().getFullYear();
  const seq = String(invoiceSequence).padStart(6, "0");
  return `PL-${year}-${seq}`;
}

export function generateInvoice(transaction: Transaction): Invoice {
  return {
    invoiceNumber: generateInvoiceNumber(),
    issuedAt: new Date().toISOString(),
    sellerName: transaction.sellerName,
    sellerPhone: transaction.sellerPhone,
    sellerCity: transaction.deliveryLocation,
    buyerName: transaction.buyerName || "Unknown Buyer",
    buyerPhone: transaction.buyerPhone || "",
    buyerCity: transaction.deliveryLocation,
    itemTitle: transaction.productName,
    itemPriceXAF: transaction.price,
    deliveryFeeXAF: transaction.deliveryFee,
    totalXAF: transaction.price + transaction.deliveryFee,
    transactionId: transaction.id,
    postId: transaction.postId || "",
    isPreOrder: transaction.isPreOrder,
  };
}

export function attachInvoiceToTransaction(transactionId: string): Invoice | null {
  const transaction = getTransaction(transactionId);
  if (!transaction) return null;

  // Don't regenerate if already exists
  if (transaction.invoice) return transaction.invoice;

  const invoice = generateInvoice(transaction);
  const updatedTransaction: Transaction = {
    ...transaction,
    invoice,
  };

  saveTransaction(updatedTransaction);
  return invoice;
}

export function formatInvoiceDate(dateString: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}
