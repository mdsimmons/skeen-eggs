"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { settleInvoice } from "./actions";
import { PAYMENT_METHODS, DEFAULT_PAYMENT_METHODS } from "@/lib/constants";
import { fetchPaymentMethods } from "@/app/sales/actions";

export default function SettleButton({
  invoiceId,
  balanceDue,
}: {
  invoiceId: number;
  balanceDue: number;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState(balanceDue.toFixed(2));
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enabledMethods, setEnabledMethods] = useState<Record<string, boolean>>(DEFAULT_PAYMENT_METHODS);

  useEffect(() => {
    fetchPaymentMethods().then(setEnabledMethods);
  }, []);

  async function handleSettle() {
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) return;

    setIsSubmitting(true);
    try {
      await settleInvoice(invoiceId, paymentAmount, paymentMethod);
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to settle invoice:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isEditing) {
    return (
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-semibold mb-3">Record Payment</h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-muted block mb-1">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
              max={balanceDue}
              className="w-full px-3 py-2 border border-border rounded-lg text-lg font-bold"
            />
          </div>
          <div>
            <label className="text-sm text-muted block mb-1">Payment Method</label>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_METHODS.map((m) => {
                if (!enabledMethods[m.value]) return null;
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setPaymentMethod(m.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      paymentMethod === m.value
                        ? "bg-success text-white border-success"
                        : "bg-card border-border text-foreground hover:bg-muted-bg"
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsEditing(false);
                setAmount(balanceDue.toFixed(2));
              }}
              className="flex-1 py-2 border border-border rounded-lg font-medium text-sm hover:bg-muted-bg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSettle}
              disabled={isSubmitting}
              className="flex-1 py-2 bg-success text-white rounded-lg font-medium text-sm disabled:opacity-50 hover:bg-success/90 transition-colors"
            >
              {isSubmitting ? "Recording..." : "Record Payment"}
            </button>
          </div>
          <button
            onClick={() => {
              setAmount(balanceDue.toFixed(2));
              handleSettle();
            }}
            disabled={isSubmitting}
            className="w-full py-2 bg-success text-white rounded-lg font-medium text-sm disabled:opacity-50 hover:bg-success/90 transition-colors"
          >
            Pay Full Amount (${balanceDue.toFixed(2)})
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="w-full py-3 bg-success text-white rounded-xl font-semibold hover:bg-success/90 transition-colors"
    >
      Record Payment
    </button>
  );
}
