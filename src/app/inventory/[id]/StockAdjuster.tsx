"use client";

import { useState, useTransition } from "react";
import { adjustStockAction } from "../actions";

export default function StockAdjuster({
  productId,
  currentStock,
  lowStockThreshold,
}: {
  productId: number;
  currentStock: number;
  lowStockThreshold: number;
}) {
  const [stock, setStock] = useState(currentStock);
  const [manualValue, setManualValue] = useState("");
  const [isPending, startTransition] = useTransition();

  const isOut = stock === 0;
  const isLow = stock > 0 && stock <= lowStockThreshold;

  function handleAdjust(delta: number) {
    startTransition(async () => {
      await adjustStockAction(productId, delta);
      setStock(Math.max(0, stock + delta));
    });
  }

  function handleManualSet() {
    const val = parseInt(manualValue);
    if (isNaN(val) || val < 0) return;
    const delta = val - stock;
    if (delta === 0) return;
    startTransition(async () => {
      await adjustStockAction(productId, delta);
      setStock(val);
      setManualValue("");
    });
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Stock Level</h3>
        {isOut && (
          <span className="text-sm font-medium text-white bg-danger rounded-full px-2.5 py-0.5">
            Out of Stock
          </span>
        )}
        {isLow && (
          <span className="text-sm font-medium text-yellow-800 bg-yellow-100 rounded-full px-2.5 py-0.5">
            Low Stock
          </span>
        )}
      </div>

      <div
        className={`text-center py-5 rounded-lg ${
          isOut
            ? "bg-danger-bg"
            : isLow
              ? "bg-yellow-50"
              : "bg-success-bg"
        }`}
      >
        <span
          className={`text-5xl font-bold ${
            isOut
              ? "text-danger"
              : isLow
                ? "text-yellow-600"
                : "text-success"
          }`}
        >
          {stock}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => handleAdjust(-1)}
          disabled={isPending || stock === 0}
          className="flex-1 bg-danger-bg text-danger border border-danger/20 rounded-lg py-3.5 text-base font-semibold hover:bg-danger/10 transition-colors disabled:opacity-50"
        >
          − 1
        </button>
        <button
          onClick={() => handleAdjust(1)}
          disabled={isPending}
          className="flex-1 bg-success-bg text-success border border-success/20 rounded-lg py-3.5 text-base font-semibold hover:bg-success/10 transition-colors disabled:opacity-50"
        >
          + 1
        </button>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="number"
          min="0"
          value={manualValue}
          onChange={(e) => setManualValue(e.target.value)}
          placeholder="Set stock..."
          className="flex-1 bg-background border border-border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
        <button
          onClick={handleManualSet}
          disabled={isPending || !manualValue}
          className="bg-primary text-white rounded-lg px-5 py-3 text-base font-semibold hover:bg-primary-light transition-colors disabled:opacity-50"
        >
          Set
        </button>
      </div>
    </div>
  );
}
