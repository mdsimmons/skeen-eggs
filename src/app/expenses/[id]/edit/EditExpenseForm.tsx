"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { updateExpenseAction } from "../../actions";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import type { Expense } from "@/lib/db";

export default function EditExpenseForm({ expense }: { expense: Expense }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      await updateExpenseAction(expense.id, form);
    });
  }

  const cls = "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
        <input id="description" name="description" defaultValue={expense.description} required className={cls} />
      </div>
      <div>
        <label htmlFor="amount" className="block text-sm font-medium mb-1">Amount ($)</label>
        <input id="amount" name="amount" type="number" step="0.01" min="0" defaultValue={expense.amount} required className={cls} />
      </div>
      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-1">Category</label>
        <select id="category" name="category" defaultValue={expense.category} className={cls}>
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="date" className="block text-sm font-medium mb-1">Date</label>
        <input id="date" name="date" type="date" defaultValue={expense.date} className={cls} />
      </div>
      <div>
        <label htmlFor="notes" className="block text-sm font-medium mb-1">Notes</label>
        <textarea id="notes" name="notes" rows={2} defaultValue={expense.notes} className={cls} />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isPending} className="flex-1 bg-primary text-white rounded-lg py-2.5 text-sm font-medium hover:bg-primary-light transition-colors disabled:opacity-50">
          {isPending ? "Saving..." : "Save Changes"}
        </button>
        <button type="button" onClick={() => router.back()} className="px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted-bg transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
