import Link from "next/link";
import { notFound } from "next/navigation";
import { getInvoiceById, getSetting, getReceiptOptions, getCustomerById } from "@/lib/queries";
import { toPlainOne } from "@/lib/db";
import SettleButton from "./SettleButton";
import PrintButton from "./PrintButton";
import AddItems from "./AddItems";

export const dynamic = "force-dynamic";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rawInvoice = await getInvoiceById(Number(id));
  const invoice = toPlainOne(rawInvoice);

  if (!invoice) {
    notFound();
  }

  const businessName = (await getSetting("business_name")) || "Skeen Eggs";
  const receipt = await getReceiptOptions();
  const balanceDue = invoice.total - invoice.amount_paid;

  const customer = invoice.customer_id ? await getCustomerById(invoice.customer_id) : null;
  const receiptWidth = customer?.receipt_width || receipt.width;
  const invoiceTime = new Date(invoice.created_at).getTime();

  const headerCls =
    receipt.style === "color" ? "bg-primary text-white" : "border-b-4 border-foreground";

  const receiptRootCls = [
    "space-y-5",
    "print-receipt",
    receiptWidth === "thermal" ? "print-receipt-thermal" : "",
  ].join(" ");

  function getStatusColor(status: string) {
    switch (status) {
      case "paid":
        return "bg-success-bg text-success";
      case "unpaid":
        return "bg-danger-bg text-danger";
      case "partial":
        return "bg-primary-bg text-primary";
      default:
        return "bg-muted-bg text-muted";
    }
  }

  function getTypeLabel(type: string) {
    return type === "tab" ? "Invoice" : "Sale";
  }

  return (
    <div
      className={receiptRootCls}
      style={{
        "--receipt-font-size": `${receipt.font_size}px`,
        "--receipt-item-font-size": `${receipt.item_font_size}px`,
        "--receipt-price-font-size": `${receipt.price_font_size}px`,
        "--receipt-total-font-size": `${receipt.total_font_size}px`,
      } as React.CSSProperties}
    >
      <div className="flex items-center justify-between print:hidden">
        <Link href="/sales" className="text-primary text-base font-medium hover:underline">
          &larr; Back to Sales
        </Link>
        <PrintButton />
      </div>

      {/* Print header - only visible when printing */}
      <div className="hidden print:block mb-6 rounded-lg overflow-hidden">
        <div className={`flex items-start justify-between px-5 py-6 ${headerCls}`}>
          <div className="space-y-0.5">
            {receipt.receipt_logo && (
              <img src={receipt.receipt_logo} alt="Logo" className="h-10 w-auto mb-2" />
            )}
            <p className="receipt-title font-bold">{businessName}</p>
            {receipt.tagline && <p className="receipt-sub opacity-80">{receipt.tagline}</p>}
            {receipt.address && <p className="receipt-sub opacity-80">{receipt.address}</p>}
            {receipt.phone && <p className="receipt-sub opacity-80">{receipt.phone}</p>}
          </div>
          <div className="text-right space-y-0.5">
            <p className="receipt-title font-bold">INVOICE</p>
            <p className="receipt-sub">{invoice.invoice_number || `#${invoice.id}`}</p>
            <p className="receipt-sub">{new Date(invoice.created_at).toLocaleDateString()}</p>
            {receipt.show_customer && invoice.customer_name && (
              <p className="receipt-sub">{invoice.customer_name}</p>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Header */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Invoice</h1>
            <p className="text-base text-muted">
              {invoice.invoice_number || `#${invoice.id}`} ·{" "}
              {new Date(invoice.created_at).toLocaleDateString()} at{" "}
              {new Date(invoice.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusColor(invoice.status)} print:hidden`}>
            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-base">
          <div>
            <p className="text-muted">Type</p>
            <p className="font-medium capitalize">{getTypeLabel(invoice.invoice_type)}</p>
          </div>
          <div className={receipt.show_customer ? "" : "print:hidden"}>
            <p className="text-muted">Customer</p>
            <p className="font-medium">{invoice.customer_name || "Walk-up"}</p>
          </div>
        </div>

        {receipt.show_notes && invoice.notes && (
          <div className="mt-4 p-3 bg-muted-bg rounded-lg">
            <p className="text-base text-muted">Notes</p>
            <p className="text-base">{invoice.notes}</p>
          </div>
        )}
      </div>

      {/* Line Items */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-semibold text-lg mb-3">Items</h2>
        <div className="space-y-2">
          {invoice.items.map((item) => {
            const addedLater =
              item.created_at && new Date(item.created_at).getTime() - invoiceTime > 60000;
            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 py-3 border-b border-border last:border-0"
              >
                <div className="min-w-0 receipt-item">
                  <p className="font-medium text-base">{item.product_name}</p>
                  {(receipt.show_qty || receipt.show_unit_price) && (
                    <p className="text-sm text-muted">
                      {receipt.show_qty && `${item.quantity} ${item.unit || "units"}`}
                      {receipt.show_qty && receipt.show_unit_price && " @ "}
                      {receipt.show_unit_price && `$${item.unit_price.toFixed(2)}`}
                    </p>
                  )}
                  {addedLater && (
                    <p className="text-xs text-primary print:hidden">
                      Added {new Date(item.created_at).toLocaleDateString()} at{" "}
                      {new Date(item.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
                {receipt.show_line_total && (
                  <p className="font-medium text-base whitespace-nowrap receipt-price">${item.total.toFixed(2)}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Totals */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="space-y-2">
          <div className="flex justify-between text-base">
            <span className="text-muted">Items</span>
            <span>{invoice.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
          </div>
          <div className="flex justify-between text-base">
            <span className="text-muted">Subtotal</span>
            <span>${invoice.subtotal.toFixed(2)}</span>
          </div>
          {invoice.tax > 0 && (
            <div className="flex justify-between text-base">
              <span className="text-muted">Tax</span>
              <span>${invoice.tax.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-xl pt-3 border-t border-border receipt-total">
            <span>Total</span>
            <span>${invoice.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base">
            <span className="text-muted">Amount Paid</span>
            <span className="text-success">${invoice.amount_paid.toFixed(2)}</span>
          </div>
          {balanceDue > 0 && (
            <div className="flex justify-between font-semibold text-danger text-lg">
              <span>Balance Due</span>
              <span>${balanceDue.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {balanceDue > 0 && (
        <div className="print:hidden space-y-5">
          <SettleButton invoiceId={invoice.id} balanceDue={balanceDue} />
        </div>
      )}
      {invoice.status !== "paid" && (
        <AddItems invoiceId={invoice.id} />
      )}

      {/* Print footer - only visible when printing */}
      {receipt.footer && (
        <div className="hidden print:block mt-10 pt-4 border-t-2 border-foreground text-center">
          <p className="text-base">{receipt.footer}</p>
        </div>
      )}
    </div>
  );
}
