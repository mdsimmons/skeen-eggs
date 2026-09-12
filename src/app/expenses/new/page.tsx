"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { createExpenseAction } from "../actions";
import { EXPENSE_CATEGORIES } from "@/lib/constants";

export default function NewExpensePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      await createExpenseAction(form);
    });
  }

  const cls = "w-full rounded-lg border border-border bg-card px-4 py-3 text-base outline-none focus:ring-2 focus:ring-primary/30";
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">Add Expense</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="description" className="block text-base font-medium mb-1">Description</label>
          <input id="description" name="description" required className={cls} placeholder="e.g., Chicken feed" />
        </div>
        <div>
          <label htmlFor="amount" className="block text-base font-medium mb-1">Amount ($)</label>
          <input id="amount" name="amount" type="number" step="0.01" min="0" required className={cls} placeholder="0.00" />
        </div>
        <div>
          <label htmlFor="category" className="block text-base font-medium mb-1">Category</label>
          <select id="category" name="category" defaultValue="general" className={cls}>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="date" className="block text-base font-medium mb-1">Date</label>
          <input id="date" name="date" type="date" defaultValue={today} className={cls} />
        </div>
        <div>
          <label htmlFor="notes" className="block text-base font-medium mb-1">Notes</label>
          <textarea id="notes" name="notes" rows={2} className={cls} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={isPending} className="flex-1 bg-primary text-white rounded-lg py-3.5 text-base font-medium hover:bg-primary-light transition-colors disabled:opacity-50">
            {isPending ? "Saving..." : "Save Expense"}
          </button>
          <button type="button" onClick={() => router.back()} className="px-5 py-3.5 border border-border rounded-lg text-base font-medium hover:bg-muted-bg transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
