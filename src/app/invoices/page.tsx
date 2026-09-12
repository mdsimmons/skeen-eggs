import Link from "next/link";
import { getCustomersWithBalance, getOpenInvoices, getUnpaidTotal } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const [customersWithBalance, openInvoices, unpaidTotal] = await Promise.all([
    getCustomersWithBalance(),
    getOpenInvoices(),
    getUnpaidTotal(),
  ]);

  const invoiceCountByCustomer = new Map<number, number>();
  for (const inv of openInvoices) {
    invoiceCountByCustomer.set(inv.customer_id!, (invoiceCountByCustomer.get(inv.customer_id!) || 0) + 1);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl md:text-3xl font-bold">Invoices</h1>
        <Link href="/sales/new" className="bg-primary text-white rounded-lg px-5 py-3.5 text-lg font-medium hover:bg-primary-light transition-colors text-center">
          New Sale
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-danger-bg rounded-xl p-4">
          <p className="text-sm font-medium text-danger opacity-70">Total Outstanding</p>
          <p className="text-3xl font-bold text-danger">${unpaidTotal.toFixed(2)}</p>
        </div>
        <div className="bg-muted-bg rounded-xl p-4">
          <p className="text-sm font-medium text-muted">Customers w/ Invoices</p>
          <p className="text-3xl font-bold text-muted">{customersWithBalance.length}</p>
        </div>
      </div>

      {customersWithBalance.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <p className="text-muted text-base">No outstanding invoices</p>
        </div>
      ) : (
        <div className="space-y-2">
          {customersWithBalance.map((customer) => (
            <Link
              key={customer.id}
              href={`/customers/${customer.id}`}
              className="flex items-center justify-between bg-card rounded-xl border border-border p-4 hover:bg-muted-bg transition-colors"
            >
              <div>
                <p className="font-semibold text-base">{customer.name}</p>
                <p className="text-sm text-muted">{customer.phone || "No phone"}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-danger">${customer.balance.toFixed(2)}</p>
                <p className="text-sm text-muted">
                  {invoiceCountByCustomer.get(customer.id) || 0} open invoice{(invoiceCountByCustomer.get(customer.id) || 0) !== 1 ? "s" : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
