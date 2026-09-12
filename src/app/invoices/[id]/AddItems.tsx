"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { fetchProductsAndCustomers } from "@/app/sales/actions";
import type { Product } from "@/lib/db";

export default function AddItems({ invoiceId }: { invoiceId: number }) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [quantities, setQuantities] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProductsAndCustomers()
      .then((data) => setProducts(data.products))
      .catch(() => setError("Could not load products"));
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const selectedItems = filtered.filter((p) => (parseFloat(quantities[p.id]) || 0) > 0 && p.stock > 0);

  const total = selectedItems.reduce((sum, p) => {
    const qty = parseFloat(quantities[p.id]) || 0;
    return sum + p.price * qty;
  }, 0);

  async function handleSubmit() {
    if (selectedItems.length === 0) return;
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: selectedItems.map((p) => ({
            product_id: p.id,
            quantity: parseFloat(quantities[p.id]) || 0,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add items");
        return;
      }
      setQuantities({});
      router.refresh();
    } catch {
      setError("Network error — try again");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 print:hidden">
      <div>
        <h2 className="font-semibold text-lg">Add Items</h2>
        <p className="text-sm text-muted">New items are added to this invoice and get today&apos;s date.</p>
      </div>

      <input
        type="text"
        placeholder="Search products..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-4 py-3 border border-border rounded-lg text-base mb-3 mt-3"
      />

      <div className="max-h-72 overflow-y-auto space-y-2">
        {filtered.length === 0 && <p className="text-sm text-muted py-4 text-center">No products</p>}
        {filtered.map((product) => (
          <div key={product.id} className="flex items-center gap-3 border border-border rounded-lg p-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-base truncate">{product.name}</p>
              <p className="text-sm text-muted">
                ${product.price.toFixed(2)} / {product.unit} · {product.stock} in stock
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() =>
                  setQuantities((prev) => {
                    const qty = parseFloat(prev[product.id] || "0") || 0;
                    const next = qty - 1;
                    return { ...prev, [product.id]: next > 0 ? String(next) : "" };
                  })
                }
                className="h-12 w-12 flex items-center justify-center bg-muted-bg border border-border rounded-lg text-lg font-bold"
              >
                −
              </button>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={quantities[product.id] || ""}
                onChange={(e) => setQuantities((prev) => ({ ...prev, [product.id]: e.target.value }))}
                className="w-16 text-center text-lg font-medium bg-background border border-border rounded-lg py-3"
              />
              <button
                type="button"
                onClick={() =>
                  setQuantities((prev) => {
                    const qty = parseFloat(prev[product.id] || "0") || 0;
                    return { ...prev, [product.id]: String(Math.round((qty + 1) * 100) / 100) };
                  })
                }
                disabled={parseFloat(quantities[product.id] || "0") >= product.stock}
                className="h-12 w-12 flex items-center justify-center bg-muted-bg border border-border rounded-lg text-lg font-bold disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-danger mt-3">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={isSubmitting || selectedItems.length === 0}
        className="mt-4 w-full py-4 bg-primary text-white rounded-xl font-bold text-lg disabled:opacity-50 hover:bg-primary-light transition-colors"
      >
        {isSubmitting ? "Adding..." : `Add ${selectedItems.length} item${selectedItems.length === 1 ? "" : "s"} - $${total.toFixed(2)}`}
      </button>
    </div>
  );
}