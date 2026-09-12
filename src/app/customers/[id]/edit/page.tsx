import { getCustomerById } from "@/lib/queries";
import { toPlainOne } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import EditCustomerForm from "./EditCustomerForm";

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = toPlainOne(await getCustomerById(Number(id)));
  if (!customer) return notFound();

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/customers/${id}`} className="text-muted hover:text-foreground text-sm">Customer</Link>
        <span className="text-muted">/</span>
        <h1 className="text-2xl font-bold">Edit</h1>
      </div>
      <EditCustomerForm customer={customer} />
    </div>
  );
}
