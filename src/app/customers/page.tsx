import Link from "next/link";
import { getAllCustomers } from "@/lib/queries";

export default async function CustomersPage() {
  const customers = await getAllCustomers();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl md:text-3xl font-bold">Customers</h1>
        <Link href="/customers/new" className="bg-primary text-white rounded-lg px-5 py-3.5 text-lg font-medium hover:bg-primary-light transition-colors text-center">
          Add Customer
        </Link>
      </div>

      {customers.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <p className="text-muted mb-2 text-base">No customers yet</p>
          <Link href="/customers/new" className="text-primary text-base font-medium hover:underline">
            Add your first customer
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {customers.map((customer) => (
            <Link
              key={customer.id}
              href={`/customers/${customer.id}`}
              className="flex items-center justify-between bg-card rounded-xl border border-border p-4 hover:bg-muted-bg transition-colors"
            >
              <div>
                <p className="font-semibold text-base">{customer.name}</p>
                <p className="text-sm text-muted">{customer.phone || "No phone"}</p>
              </div>
              {customer.balance > 0 && (
                <span className="text-base font-semibold text-danger">${customer.balance.toFixed(2)} owed</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
