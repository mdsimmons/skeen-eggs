"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { updateCustomerAction } from "../../actions";
import type { Customer } from "@/lib/db";

export default function EditCustomerForm({ customer }: { customer: Customer }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      await updateCustomerAction(customer.id, form);
      router.push(`/customers/${customer.id}`);
    });
  }

  const cls = "w-full rounded-lg border border-border bg-card px-4 py-3 text-base outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className="block text-base font-medium mb-1">Name</label>
        <input id="name" name="name" defaultValue={customer.name} required className={cls} />
      </div>
      <div>
        <label htmlFor="phone" className="block text-base font-medium mb-1">Phone</label>
        <input id="phone" name="phone" type="tel" defaultValue={customer.phone} className={cls} />
      </div>
      <div>
        <label htmlFor="email" className="block text-base font-medium mb-1">Email</label>
        <input id="email" name="email" type="email" defaultValue={customer.email} className={cls} />
      </div>
      <div>
        <label htmlFor="address" className="block text-base font-medium mb-1">Address</label>
        <input id="address" name="address" defaultValue={customer.address} className={cls} />
      </div>
      <div>
        <label htmlFor="notes" className="block text-base font-medium mb-1">Notes</label>
        <textarea id="notes" name="notes" rows={3} defaultValue={customer.notes} className={cls} />
      </div>
      <div>
        <label htmlFor="receipt_width" className="block text-base font-medium mb-1">Receipt Print Size</label>
        <select id="receipt_width" name="receipt_width" defaultValue={customer.receipt_width || "standard"} className={cls}>
          <option value="standard">Letter (8.5&quot; x 11&quot;)</option>
          <option value="thermal">Thermal (3.25&quot; / 80mm)</option>
        </select>
      </div>
      <div>
        <label htmlFor="fuel_charge" className="block text-base font-medium mb-1">Fuel Charge ($)</label>
        <input id="fuel_charge" name="fuel_charge" type="number" step="0.01" min="0" defaultValue={customer.fuel_charge || 0} className={cls} placeholder="0.00" />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isPending} className="flex-1 bg-primary text-white rounded-lg py-3.5 text-base font-medium hover:bg-primary-light transition-colors disabled:opacity-50">
          {isPending ? "Saving..." : "Save Changes"}
        </button>
        <button type="button" onClick={() => router.back()} className="px-5 py-3.5 border border-border rounded-lg text-base font-medium hover:bg-muted-bg transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
