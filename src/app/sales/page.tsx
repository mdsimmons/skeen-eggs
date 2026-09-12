import Link from "next/link";
import { getAllInvoices } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const invoices = await getAllInvoices();

  function getStatusColor(status: string) {
    switch (status) {
      case "paid":
        return "bg-success-bg text-success";
      case "unpaid":
        return "bg-danger-bg text-danger";
      case "partial":
        return "bg-primary-bg text-primary";
      default:
        return "bg-muted-bg text-muted";
    }
  }

  function getTypeColor(type: string) {
    return type === "tab"
      ? "bg-purple-100 text-purple-700"
      : "bg-muted-bg text-muted";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl md:text-3xl font-bold">Sales History</h1>
        <Link
          href="/sales/new"
          className="bg-primary text-white px-5 py-3.5 rounded-lg font-semibold text-lg hover:bg-primary-light transition-colors text-center"
        >
          + New Sale
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-12 text-muted">
          <p className="text-xl">No sales yet</p>
          <Link href="/sales/new" className="text-primary font-medium hover:underline mt-2 inline-block text-base">
            Create your first sale
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {invoices.map((invoice) => (
            <Link
              key={invoice.id}
              href={`/invoices/${invoice.id}`}
              className="block bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${getTypeColor(invoice.invoice_type)}`}>
                      {invoice.invoice_type === "tab" ? "Invoice" : "Sale"}
                    </span>
                    <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${getStatusColor(invoice.status)}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </div>
                  <p className="font-medium text-base">
                    {"customer_name" in invoice ? (invoice as { customer_name?: string }).customer_name || "Walk-up" : "Walk-up"}
                  </p>
                  <p className="text-sm text-muted">
                    {new Date(invoice.created_at).toLocaleDateString()} at{" "}
                    {new Date(invoice.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted">
                    {"invoice_number" in invoice && invoice.invoice_number
                      ? (invoice as { invoice_number?: string }).invoice_number
                      : `#${invoice.id}`}
                  </p>
                  <p className="text-xl font-bold">${invoice.total.toFixed(2)}</p>
                  {invoice.status !== "paid" && (
                    <p className="text-sm text-danger">
                      Owes: ${(invoice.total - invoice.amount_paid).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
