import Link from "next/link";
import { getTodaySales, getLowStockProducts, getUnpaidTotal, getOpenInvoices } from "@/lib/queries";

export default async function HomePage() {
  const [todaySales, lowStock, unpaidTotal, openInvoices] = await Promise.all([
    getTodaySales(),
    getLowStockProducts(),
    getUnpaidTotal(),
    getOpenInvoices(),
  ]);

  return (
    <div className="space-y-6 md:space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>

      {/* Invoices Owed */}
      <div className="bg-card rounded-xl border border-border p-4 md:p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground text-lg">Outstanding Invoices</h2>
          <span className="text-xl font-bold text-danger">${unpaidTotal.toFixed(2)}</span>
        </div>
        {openInvoices.length === 0 ? (
          <p className="text-base text-muted">No open invoices</p>
        ) : (
          <div className="space-y-2">
            {openInvoices.slice(0, 5).map((inv) => (
              <Link
                key={inv.id}
                href={`/invoices/${inv.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted-bg transition-colors"
              >
                <span className="text-base font-medium">{inv.customer_name}</span>
                <div className="text-right">
                  <span className="text-base font-semibold text-danger">
                    ${(inv.total - inv.amount_paid).toFixed(2)}
                  </span>
                  <span className="text-sm text-muted block">
                    {new Date(inv.created_at).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
            {openInvoices.length > 5 && (
              <Link href="/invoices" className="text-sm text-primary font-medium hover:underline block text-center pt-1">
                View all {openInvoices.length} open invoices
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Low Stock */}
      <div className="bg-card rounded-xl border border-border p-4 md:p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground text-lg">Low Stock Alerts</h2>
          {lowStock.length > 0 && (
            <span className="text-sm font-medium text-white bg-danger rounded-full px-2.5 py-1">
              {lowStock.length} items
            </span>
          )}
        </div>
        {lowStock.length === 0 ? (
          <p className="text-base text-success font-medium">All stocked up!</p>
        ) : (
          <div className="space-y-2">
            {lowStock.map((product) => (
              <Link
                key={product.id}
                href={`/inventory/${product.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted-bg transition-colors"
              >
                <span className="text-base">{product.name}</span>
                <div className="text-right">
                  <span className={`text-base font-semibold ${product.stock === 0 ? "text-danger" : "text-yellow-600"}`}>
                    {product.stock} {product.unit}
                  </span>
                  <span className="text-sm text-muted block">
                    min: {product.low_stock_threshold}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/sales/new"
          className="flex items-center justify-center gap-2 bg-primary text-white rounded-xl py-6 font-semibold text-lg hover:bg-primary-light transition-colors"
        >
          <span className="text-2xl">+</span>
          New Sale
        </Link>
        <Link
          href="/expenses"
          className="flex items-center justify-center gap-2 bg-card border border-border rounded-xl py-6 font-semibold text-lg hover:bg-muted-bg transition-colors"
        >
          <span className="text-2xl">+</span>
          Add Expense
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colorClasses: Record<string, string> = {
    primary: "bg-primary-bg text-primary",
    success: "bg-success-bg text-success",
    danger: "bg-danger-bg text-danger",
    muted: "bg-muted-bg text-muted",
  };
  return (
    <div className={`rounded-xl p-4 ${colorClasses[color] || colorClasses.muted}`}>
      <p className="text-sm font-medium opacity-70">{label}</p>
      <p className="text-2xl font-bold mt-0.5">{value}</p>
    </div>
  );
}
