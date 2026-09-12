import { getIncomeVsExpenses, getTotalSales, getTotalExpenses, getExpensesByCategory, getSetting, getReceiptOptions } from "@/lib/queries";
import DateRangeSelector from "./DateRangeSelector";
import PrintButton from "@/components/PrintButton";

function getDateRange(range: string): { start: string; end: string } {
  const now = new Date();
  const end = now.toISOString().split("T")[0];
  let start: string;
  switch (range) {
    case "today":
      start = end;
      break;
    case "week": {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      start = d.toISOString().split("T")[0];
      break;
    }
    case "year": {
      const d = new Date(now);
      d.setFullYear(d.getFullYear() - 1);
      start = d.toISOString().split("T")[0];
      break;
    }
    case "all":
      start = "2000-01-01";
      break;
    default: {
      const d = new Date(now);
      d.setDate(1);
      start = d.toISOString().split("T")[0];
    }
  }
  return { start, end };
}

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ range?: string; start?: string; end?: string }> }) {
  const { range = "month", start: startParam, end: endParam } = await searchParams;
  const isCustom = !!(startParam && endParam);
  const { start, end } = isCustom
    ? { start: startParam, end: endParam }
    : getDateRange(range);
  const [data, totalSales, totalExpenses, expenseCategories, businessName, receipt] = await Promise.all([
    getIncomeVsExpenses(start, end),
    getTotalSales(start, end),
    getTotalExpenses(start, end),
    getExpensesByCategory(),
    getSetting("business_name"),
    getReceiptOptions(),
  ]);

  const profit = totalSales - totalExpenses;
  const margin = totalSales > 0 ? ((profit / totalSales) * 100) : 0;
  const maxIncome = Math.max(...data.map((d) => d.income), 1);

  const rangeLabels: Record<string, string> = {
    today: "Today",
    week: "Last 7 Days",
    month: "This Month",
    year: "This Year",
    all: "All Time",
  };
  const periodLabel = isCustom ? "Custom" : rangeLabels[range];

  return (
    <div
      className="space-y-6 md:space-y-8 print-receipt"
      style={{ "--receipt-font-size": `${receipt.font_size}px` } as React.CSSProperties}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl md:text-3xl font-bold">Reports</h1>
        <PrintButton />
      </div>

      {/* Print header - only visible when printing */}
      <div className="hidden print:block">
        <div className="flex items-start justify-between border-b-2 border-black pb-4 mb-6">
          <div>
            <p className="receipt-title font-bold">{businessName || "Skeen Eggs"}</p>
            <p className="receipt-sub">Profit &amp; Loss Statement</p>
          </div>
          <div className="text-right space-y-0.5">
            <p className="receipt-title font-bold">P&amp;L</p>
            <p className="receipt-sub">{periodLabel}</p>
            <p className="receipt-sub">{start} — {end}</p>
          </div>
        </div>

        <div className="space-y-1">
          <p className="font-bold mb-2">Income</p>
          <div className="flex justify-between">
            <span>Sales</span>
            <span>${totalSales.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold border-b border-black pb-2 mt-1">
            <span>Total Income</span>
            <span>${totalSales.toFixed(2)}</span>
          </div>

          <p className="font-bold mt-4 mb-2">Expenses</p>
          {expenseCategories.length === 0 ? (
            <div className="flex justify-between">
              <span>No expenses recorded</span>
              <span>$0.00</span>
            </div>
          ) : (
            expenseCategories.map((cat) => (
              <div key={cat.category} className="flex justify-between">
                <span className="capitalize">{cat.category.replace("_", " ")}</span>
                <span>${cat.total.toFixed(2)}</span>
              </div>
            ))
          )}
          <div className="flex justify-between font-bold border-b border-black pb-2 mt-1">
            <span>Total Expenses</span>
            <span>${totalExpenses.toFixed(2)}</span>
          </div>

          <div className="flex justify-between font-bold text-lg mt-4">
            <span>Net Profit</span>
            <span>${profit.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Profit Margin</span>
            <span>{margin.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <div className="print:hidden">
        <DateRangeSelector current={isCustom ? "custom" : range} start={start} end={end} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 print:hidden">
        <div className="bg-success-bg rounded-xl p-4 overflow-hidden">
          <p className="text-sm font-medium text-success opacity-70">Sales</p>
          <p className="text-lg font-bold text-success">${totalSales.toFixed(2)}</p>
        </div>
        <div className="bg-danger-bg rounded-xl p-4 overflow-hidden">
          <p className="text-sm font-medium text-danger opacity-70">Expenses</p>
          <p className="text-lg font-bold text-danger">${totalExpenses.toFixed(2)}</p>
        </div>
        <div className={`rounded-xl p-4 overflow-hidden ${profit >= 0 ? "bg-primary-bg" : "bg-danger-bg"}`}>
          <p className="text-sm font-medium opacity-70">Profit</p>
          <p className={`text-lg font-bold ${profit >= 0 ? "text-primary" : "text-danger"}`}>${profit.toFixed(2)}</p>
        </div>
        <div className="bg-muted-bg rounded-xl p-4 overflow-hidden">
          <p className="text-sm font-medium text-muted">Margin</p>
          <p className="text-lg font-bold text-muted">{margin.toFixed(1)}%</p>
        </div>
      </div>

      {/* Daily Breakdown */}
      <div className="bg-card rounded-xl border border-border p-4 print:hidden">
        <h2 className="font-semibold mb-3 text-lg">Daily Breakdown ({periodLabel})</h2>
        {data.length === 0 ? (
          <p className="text-base text-muted">No data for this period</p>
        ) : (
          <div className="space-y-2">
            {data.map((day) => (
              <div key={day.period} className="flex items-center gap-3">
                <span className="text-sm text-muted w-20 shrink-0">
                  {new Date(day.period + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 rounded bg-success/70"
                      style={{ width: `${(day.income / maxIncome) * 100}%`, minWidth: day.income > 0 ? "4px" : "0" }}
                    />
                    <span className="text-sm font-medium whitespace-nowrap">${day.income.toFixed(2)}</span>
                  </div>
                  {day.expenses > 0 && (
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 rounded bg-danger/50"
                        style={{ width: `${(day.expenses / maxIncome) * 100}%`, minWidth: "4px" }}
                      />
                      <span className="text-sm text-danger whitespace-nowrap">-${day.expenses.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expenses by Category */}
      {expenseCategories.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-4 print:hidden">
          <h2 className="font-semibold mb-3 text-lg">Expenses by Category</h2>
          <div className="space-y-2">
            {expenseCategories.map((cat) => {
              const maxCat = Math.max(...expenseCategories.map((c) => c.total), 1);
              return (
                <div key={cat.category} className="flex items-center gap-3">
                  <span className="text-sm text-muted w-24 shrink-0 capitalize">{cat.category.replace("_", " ")}</span>
                  <div className="flex-1">
                    <div
                      className="h-4 rounded bg-danger/40"
                      style={{ width: `${(cat.total / maxCat) * 100}%`, minWidth: "4px" }}
                    />
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap">${cat.total.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
