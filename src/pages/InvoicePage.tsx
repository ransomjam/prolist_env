import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getTransaction } from "@/lib/storage";
import { attachInvoiceToTransaction, formatInvoiceDate } from "@/lib/invoice";
import { Transaction, Invoice } from "@/types/transaction";
import { toast } from "sonner";
import { Download, ArrowLeft, Shield, CheckCircle, Package, User, Store } from "lucide-react";

export default function InvoicePage() {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    if (!transactionId) {
      navigate("/payments");
      return;
    }

    const tx = getTransaction(transactionId);
    if (!tx) {
      toast.error("Transaction not found");
      navigate("/payments");
      return;
    }

    setTransaction(tx);

    // Generate or get existing invoice
    const inv = attachInvoiceToTransaction(transactionId);
    setInvoice(inv);
  }, [transactionId, navigate]);

  const handleDownload = () => {
    window.print();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-CM", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(price) + " XAF";
  };

  if (!transaction || !invoice) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .invoice-container, .invoice-container * {
            visibility: visible;
          }
          .invoice-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-background">
        {/* Header - Hidden in print */}
        <header className="no-print sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            
            <Button
              onClick={handleDownload}
              className="gap-2 rounded-xl bg-gradient-to-r from-teal to-ocean text-white hover:opacity-90"
            >
              <Download className="w-4 h-4" />
              Download Invoice (PDF)
            </Button>
          </div>
        </header>

        {/* Invoice Content */}
        <main className="invoice-container max-w-2xl mx-auto p-6">
          {/* Top Gradient Bar */}
          <div 
            className="h-3 rounded-t-2xl mb-0"
            style={{ background: "linear-gradient(90deg, #10b981, #0ea5e9)" }}
          />
          
          <div className="bg-card rounded-b-2xl shadow-lg border border-border/50 overflow-hidden">
            {/* Header Section */}
            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-ocean flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg md:text-xl font-bold text-foreground">
                      ProList Protect
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Secure Escrow Invoice
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Invoice No</p>
                  <p className="font-bold text-foreground">{invoice.invoiceNumber}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatInvoiceDate(invoice.issuedAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Parties Section */}
            <div className="grid md:grid-cols-2 gap-4 px-6 md:px-8 pb-6">
              {/* Seller */}
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <Store className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Seller
                  </span>
                </div>
                <p className="font-semibold text-foreground">{invoice.sellerName}</p>
                {invoice.sellerPhone && (
                  <p className="text-sm text-muted-foreground">{invoice.sellerPhone}</p>
                )}
                {invoice.sellerCity && (
                  <p className="text-sm text-muted-foreground">{invoice.sellerCity}</p>
                )}
              </div>

              {/* Buyer */}
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-ocean" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Buyer
                  </span>
                </div>
                <p className="font-semibold text-foreground">{invoice.buyerName}</p>
                {invoice.buyerPhone && (
                  <p className="text-sm text-muted-foreground">{invoice.buyerPhone}</p>
                )}
                {invoice.buyerCity && (
                  <p className="text-sm text-muted-foreground">{invoice.buyerCity}</p>
                )}
              </div>
            </div>

            {/* Item Details Table */}
            <div className="px-6 md:px-8 pb-6">
              <div className="rounded-2xl border border-border/50 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/30">
                      <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Item
                      </th>
                      <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border/30">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-ocean/10 flex items-center justify-center">
                            <Package className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{invoice.itemTitle}</p>
                            {invoice.isPreOrder && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-warning/10 text-warning font-medium">
                                Pre-order
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right font-mono font-medium text-foreground">
                        {formatPrice(invoice.itemPriceXAF)}
                      </td>
                    </tr>
                    {invoice.deliveryFeeXAF && invoice.deliveryFeeXAF > 0 && (
                      <tr className="border-t border-border/30">
                        <td className="p-4 text-muted-foreground">Delivery Fee</td>
                        <td className="p-4 text-right font-mono text-muted-foreground">
                          {formatPrice(invoice.deliveryFeeXAF)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border/50 bg-primary/5">
                      <td className="p-4 font-bold text-foreground text-lg">Total</td>
                      <td className="p-4 text-right font-mono font-bold text-xl text-primary">
                        {formatPrice(invoice.totalXAF)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Status Badge */}
            <div className="px-6 md:px-8 pb-6">
              <div className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-primary/5 border border-primary/20">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="font-semibold text-primary">
                  Payment Secured in Escrow
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 md:px-8 py-4 bg-muted/20 border-t border-border/30">
              <p className="text-xs text-center text-muted-foreground">
                Funds held securely until delivery confirmed. Transaction ID: {invoice.transactionId}
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
