import Link from "next/link";
import { getAllExpenses, getExpensesTotalByMonth } from "@/lib/queries";
import { EXPENSE_CATEGORIES } from "@/lib/constants";

export default async function ExpensesPage() {
  const [expenses, monthlyTotal] = await Promise.all([
    getAllExpenses(),
    getExpensesTotalByMonth(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl md:text-3xl font-bold">Expenses</h1>
        <Link href="/expenses/new" className="bg-primary text-white rounded-lg px-5 py-3.5 text-lg font-medium hover:bg-primary-light transition-colors text-center">
          Add Expense
        </Link>
      </div>

      <div className="bg-muted-bg rounded-xl p-4">
        <p className="text-sm font-medium text-muted">This Month</p>
        <p className="text-3xl font-bold">${monthlyTotal.toFixed(2)}</p>
      </div>

      {expenses.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <p className="text-muted mb-2 text-base">No expenses recorded</p>
          <Link href="/expenses/new" className="text-primary text-base font-medium hover:underline">
            Add your first expense
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {expenses.map((expense) => {
            const cat = EXPENSE_CATEGORIES.find((c) => c.value === expense.category);
            return (
              <Link
                key={expense.id}
                href={`/expenses/${expense.id}/edit`}
                className="flex items-center justify-between bg-card rounded-xl border border-border p-4 hover:bg-muted-bg transition-colors"
              >
                <div>
                  <p className="text-base font-medium">{expense.description}</p>
                  <p className="text-sm text-muted">
                    {cat?.label || expense.category} · {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-base font-semibold">-${expense.amount.toFixed(2)}</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
