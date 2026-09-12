"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Invoice } from "@/lib/db";

export default function CombineInvoices({
  invoices,
}: {
  invoices: (Invoice & { customer_name?: string })[];
}) {
  const router = useRouter();
  const [combining, setCombining] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectable = invoices.filter((inv) => inv.status !== "paid");

  function toggle(id: number) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleCombine() {
    if (selected.length < 2) return;
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/combine-invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceIds: selected }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to combine invoices");
        return;
      }
      setCombining(false);
      setSelected([]);
      router.refresh();
    } catch {
      setError("Network error — try again");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-lg">Recent Invoices</h2>
        {selectable.length >= 2 && !combining && (
          <button
            onClick={() => setCombining(true)}
            className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted-bg transition-colors"
          >
            Combine Invoices
          </button>
        )}
        {combining && (
          <button
            onClick={() => {
              setCombining(false);
              setSelected([]);
            }}
            className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted-bg transition-colors"
          >
            Done
          </button>
        )}
      </div>

      {combining && selectable.length >= 2 && (
        <p className="text-sm text-muted mb-3">
          Select the unpaid invoices to combine into one. Their items, totals, and payments are merged; only the first
          invoice&apos;s number is kept.
        </p>
      )}

      {invoices.length === 0 ? (
        <p className="text-base text-muted">No invoices yet</p>
      ) : (
        <div className="space-y-2">
          {invoices.map((inv) => {
            const selectableRow = inv.status !== "paid";
            const checked = selected.includes(inv.id);
            const row = (
              <div
                className={`flex items-center justify-between bg-card rounded-xl border p-4 transition-colors ${
                  combining && selectableRow && checked ? "border-primary bg-primary-bg/40" : "border-border"
                }`}
              >
                <div className="min-w-0">
                  <p className="text-base font-medium">{inv.invoice_number || `#${inv.id}`}</p>
                  <p className="text-sm text-muted">{new Date(inv.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-semibold">${inv.total.toFixed(2)}</p>
                  <p className={`text-sm font-medium ${inv.status === "paid" ? "text-success" : "text-danger"}`}>
                    {inv.status === "paid" ? "Paid" : `${inv.status}`}
                  </p>
                </div>
              </div>
            );
            if (!combining) {
              return (
                <Link key={inv.id} href={`/invoices/${inv.id}`} className="block">
                  {row}
                </Link>
              );
            }
            return (
              <button
                key={inv.id}
                onClick={() => selectableRow && toggle(inv.id)}
                disabled={!selectableRow}
                className={`w-full text-left ${!selectableRow ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {row}
              </button>
            );
          })}
        </div>
      )}

      {combining && (
        <div className="mt-4">
          {error && <p className="text-sm text-danger mb-3">{error}</p>}
          {selected.length > 0 && (
            <button
              onClick={handleCombine}
              disabled={isSubmitting || selected.length < 2}
              className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg disabled:opacity-50 hover:bg-primary-light transition-colors"
            >
              {isSubmitting
                ? "Combining..."
                : `Combine ${selected.length} Invoice${selected.length === 1 ? "" : "s"}`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}