import Link from "next/link";
import { getCustomerById, getInvoicesByCustomerId } from "@/lib/queries";
import { toPlainOne, toPlain } from "@/lib/db";
import { notFound } from "next/navigation";
import DeleteCustomerButton from "./DeleteCustomerButton";
import RecordPaymentForm from "./RecordPaymentForm";
import CombineInvoices from "./CombineInvoices";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customerId = Number(id);
  const [rawCustomer, rawInvoices] = await Promise.all([
    getCustomerById(customerId),
    getInvoicesByCustomerId(customerId),
  ]);
  const customer = toPlainOne(rawCustomer);
  const invoices = toPlain(rawInvoices);

  if (!customer) return notFound();

  const unpaidInvoices = invoices.filter((inv) => inv.status !== "paid");

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/customers" className="text-muted hover:text-foreground text-base">Customers</Link>
        <span className="text-muted">/</span>
        <h1 className="text-2xl md:text-3xl font-bold">{customer.name}</h1>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <InfoRow label="Phone" value={customer.phone} />
        <InfoRow label="Email" value={customer.email} />
        <InfoRow label="Address" value={customer.address} />
        <InfoRow label="Notes" value={customer.notes} />
        {customer.balance > 0 && (
          <div className="pt-3 border-t border-border">
            <p className="text-sm text-muted">Balance Owed</p>
            <p className="text-2xl font-bold text-danger">${customer.balance.toFixed(2)}</p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Link href={`/customers/${customerId}/edit`} className="px-5 py-3 border border-border rounded-lg text-base font-medium hover:bg-muted-bg transition-colors">
          Edit
        </Link>
        <DeleteCustomerButton customerId={customerId} />
      </div>

      {unpaidInvoices.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-semibold text-lg mb-3">Record Payment</h2>
          <RecordPaymentForm openInvoices={unpaidInvoices} customerId={customerId} />
        </div>
      )}

      <div>
        <CombineInvoices invoices={invoices} />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-sm text-muted">{label}</p>
      <p className="text-base">{value}</p>
    </div>
  );
}
