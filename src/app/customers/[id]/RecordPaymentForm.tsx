"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { settleInvoice } from "@/app/invoices/[id]/actions";
import { PAYMENT_METHODS, DEFAULT_PAYMENT_METHODS } from "@/lib/constants";
import { fetchPaymentMethods } from "@/app/sales/actions";

interface OpenInvoice {
  id: number;
  total: number;
  amount_paid: number;
  created_at: string;
}

export default function RecordPaymentForm({ openInvoices, customerId: _customerId }: { openInvoices: OpenInvoice[]; customerId: number }) {
  const [selectedId, setSelectedId] = useState<number>(openInvoices[0]?.id || 0);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [enabledMethods, setEnabledMethods] = useState<Record<string, boolean>>(DEFAULT_PAYMENT_METHODS);

  useEffect(() => {
    fetchPaymentMethods().then(setEnabledMethods);
  }, []);

  const selected = openInvoices.find((inv) => inv.id === selectedId);
  const balanceDue = selected ? selected.total - selected.amount_paid : 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId || !amount) return;
    const payAmount = Math.min(parseFloat(amount), balanceDue);
    startTransition(async () => {
      await settleInvoice(selectedId, payAmount, paymentMethod);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <select
        value={selectedId}
        onChange={(e) => setSelectedId(Number(e.target.value))}
        className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm"
      >
        {openInvoices.map((inv) => (
          <option key={inv.id} value={inv.id}>
            {new Date(inv.created_at).toLocaleDateString()} — ${(inv.total - inv.amount_paid).toFixed(2)} due
          </option>
        ))}
      </select>
      {selected && (
        <p className="text-xs text-muted">
          Balance due: <span className="font-semibold text-danger">${balanceDue.toFixed(2)}</span>
        </p>
      )}
      <div>
        <label className="text-xs text-muted block mb-1">Payment Method</label>
        <div className="flex flex-wrap gap-2">
          {PAYMENT_METHODS.map((m) => {
            if (!enabledMethods[m.value]) return null;
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => setPaymentMethod(m.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
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
        <input
          type="number"
          step="0.01"
          min="0"
          max={balanceDue}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Payment amount"
          className="flex-1 rounded-lg border border-border bg-card px-3 py-2.5 text-sm"
        />
        <button
          type="submit"
          disabled={isPending || !amount || !selectedId}
          className="px-4 py-2.5 bg-success text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending ? "..." : "Record"}
        </button>
      </div>
      <button
        type="button"
        onClick={() => setAmount(String(balanceDue))}
        className="text-xs text-primary font-medium hover:underline"
      >
        Pay full amount (${balanceDue.toFixed(2)})
      </button>
    </form>
  );
}
