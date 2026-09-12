"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchFuelCharge, fetchCustomerFuelCharge, fetchPaymentMethods, fetchOpenInvoices, createSale } from "../actions";
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from "@/lib/constants";
import type { Invoice } from "@/lib/db";

type PaymentMethod = "cash" | "card" | "check" | "applepay" | "cashapp" | "ach" | "tab" | "open_invoice";

interface CartItem {
  product_id: number;
  quantity: number;
  unit_price: number;
  total: number;
  product_name: string;
  unit?: string;
  case_size?: number;
}

interface Props {
  cart: CartItem[];
  subtotal: number;
  customerId: number | null;
  customerName: string;
  notes: string;
  onBack: () => void;
}

export default function PaymentStep({ cart, subtotal, customerId, customerName, notes, onBack }: Props) {
  const router = useRouter();
  const [saleType, setSaleType] = useState<PaymentMethod>("cash");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fuelCharge, setFuelCharge] = useState(0);
  const [enabledMethods, setEnabledMethods] = useState<Record<string, boolean>>({
    cash: true,
    card: true,
    check: true,
    applepay: true,
    cashapp: true,
    ach: true,
    tab: true,
  });
  const [openInvoices, setOpenInvoices] = useState<
    (Invoice & { customer_name?: string })[]
  >([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      const [methods, fuel, openInvoicesData] = await Promise.all([
        fetchPaymentMethods(),
        customerId ? fetchCustomerFuelCharge(customerId) : fetchFuelCharge(),
        fetchOpenInvoices(),
      ]);
      setFuelCharge(fuel);
      setEnabledMethods(methods);
      setOpenInvoices(openInvoicesData);
      const enabled = PAYMENT_METHODS.map((m) => m.value).filter((m) => methods[m]);
      if (enabled.length === 1) setSaleType(enabled[0] as PaymentMethod);
      else if (!methods.cash && enabled.includes("card")) setSaleType("card");
    }
    fetchData();
  }, [customerId]);

  const customerOpenInvoices = openInvoices.filter((inv) => inv.customer_id === customerId);
  const total = subtotal + fuelCharge;

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      if (saleType === "open_invoice" && selectedInvoiceId) {
        const res = await fetch(`/api/invoices/${selectedInvoiceId}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: cart.map((item) => ({
              product_id: item.product_id,
              quantity: item.quantity,
            })),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to add items");
        }
        try { localStorage.removeItem("skeen_draft_sale"); } catch {}
        router.push(`/invoices/${selectedInvoiceId}`);
        return;
      }
      const methodLabel = PAYMENT_METHOD_LABELS[saleType];
      const methodNote = saleType === "tab" ? null : `Paid via ${methodLabel}`;
      const result = await createSale({
        customer_id: customerId ?? undefined,
        invoice_type: saleType === "tab" ? "tab" : "sale",
        notes: methodNote ? (notes ? `${methodNote} | ${notes}` : methodNote) : notes,
        items: cart,
      });
      if (result.success) {
        try { localStorage.removeItem("skeen_draft_sale"); } catch {}
        router.push(`/invoices/${result.invoiceId}`);
      }
    } catch (error) {
      console.error("Failed to complete order:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4 pb-32 md:pb-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-muted hover:text-foreground text-sm">Back</button>
        <span className="text-muted">/</span>
        <h1 className="text-2xl font-bold">Complete Sale</h1>
      </div>

      {/* Order Summary */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">Customer</span>
          <span className="text-sm font-medium min-w-0 truncate text-right">{customerName}</span>
        </div>
        <div className="space-y-1">
          {cart.map((item) => {
            const cases = item.case_size && item.case_size > 0 ? item.quantity / item.case_size : 0;
            return (
              <div key={item.product_id} className="flex items-center justify-between text-sm">
                <span>
                  {item.product_name} x {item.quantity}
                  {item.unit ? ` ${item.unit}` : ""}
                  {cases > 0 && <> ({cases.toFixed(2)} case{cases === 1 ? "" : "s"})</>}
                </span>
                <span>${item.total.toFixed(2)}</span>
              </div>
            );
          })}
        </div>
        <div className="border-t border-border pt-2 space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span>Items</span>
            <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {fuelCharge > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span>Fuel / Delivery</span>
              <span>${fuelCharge.toFixed(2)}</span>
            </div>
          )}
          <div className="flex items-center justify-between font-bold text-lg pt-1">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Type */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h2 className="font-semibold mb-3">Payment Type</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PAYMENT_METHODS.map((method) => {
            if (!enabledMethods[method.value]) return null;
            const disabled = method.value === "tab" && !customerId;
            return (
              <button
                key={method.value}
                onClick={() => setSaleType(method.value as PaymentMethod)}
                disabled={disabled}
                className={`py-3 rounded-lg font-semibold text-sm transition-colors ${
                  saleType === method.value
                    ? "bg-primary text-white"
                    : disabled
                      ? "bg-muted-bg text-muted cursor-not-allowed opacity-50"
                      : "bg-muted-bg text-foreground hover:bg-border"
                }`}
              >
                {method.label}
              </button>
            );
          })}
        </div>
        {saleType === "tab" && customerId && (
          <p className="text-xs text-muted mt-2">Charge to {customerName}&apos;s account (pay later)</p>
        )}

        {customerOpenInvoices.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <button
              onClick={() => setSaleType(saleType === "open_invoice" ? "cash" : "open_invoice")}
              className={`w-full py-3 rounded-lg font-semibold text-sm transition-colors ${
                saleType === "open_invoice"
                  ? "bg-primary text-white"
                  : "bg-muted-bg text-foreground hover:bg-border"
              }`}
            >
              Add to Existing Open Invoice
            </button>
            {saleType === "open_invoice" && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-muted">Choose the unpaid invoice to add these items to:</p>
                {customerOpenInvoices.map((inv) => (
                  <button
                    key={inv.id}
                    onClick={() => setSelectedInvoiceId(inv.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border text-sm font-medium transition-colors ${
                      selectedInvoiceId === inv.id
                        ? "border-primary bg-primary-bg/40"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    <span>{inv.invoice_number || `#${inv.id}`}</span>
                    <span className="text-muted">${(inv.total - inv.amount_paid).toFixed(2)} owed</span>
                  </button>
                ))}
                <p className="text-xs text-muted">
                  Items are added with today&apos;s date and the invoice stays unpaid.
                </p>
              </div>
            )}
          </div>
        )}
        {!customerId && (
          <p className="text-xs text-muted mt-3">
            Add to existing invoice is available once a customer is selected.
          </p>
        )}
      </div>

      {/* Submit */}
      <div className="sticky bottom-[110px] p-4 bg-card border-t border-border z-10 md:static md:bottom-auto md:bg-transparent md:border-0 md:p-0 md:z-auto safe-bottom">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || (saleType === "open_invoice" && !selectedInvoiceId)}
          className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg disabled:opacity-50 hover:bg-primary-light transition-colors"
        >
          {isSubmitting
            ? "Processing..."
            : saleType === "open_invoice"
              ? `Add Items to Invoice - $${total.toFixed(2)}`
              : `Complete Sale - $${total.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
}
