"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { createCustomerAction } from "../actions";

export default function NewCustomerPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      await createCustomerAction(form);
      router.push("/customers");
    });
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">Add Customer</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Name" name="name" required />
        <Field label="Phone" name="phone" type="tel" />
        <Field label="Email" name="email" type="email" />
        <Field label="Address" name="address" />
        <Field label="Notes" name="notes" multiline />
        <ReceiptWidthField />
        <FuelChargeField />
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={isPending} className="flex-1 bg-primary text-white rounded-lg py-3.5 text-base font-medium hover:bg-primary-light transition-colors disabled:opacity-50">
            {isPending ? "Saving..." : "Save Customer"}
          </button>
          <button type="button" onClick={() => router.back()} className="px-5 py-3.5 border border-border rounded-lg text-base font-medium hover:bg-muted-bg transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, name, type = "text", required = false, multiline = false }: { label: string; name: string; type?: string; required?: boolean; multiline?: boolean }) {
  const cls = "w-full rounded-lg border border-border bg-card px-4 py-3 text-base outline-none focus:ring-2 focus:ring-primary/30";
  return (
    <div>
      <label htmlFor={name} className="block text-base font-medium mb-1">{label}</label>
      {multiline ? (
        <textarea id={name} name={name} rows={3} className={cls} />
      ) : (
        <input id={name} name={name} type={type} required={required} className={cls} />
      )}
    </div>
  );
}

function ReceiptWidthField() {
  const cls = "w-full rounded-lg border border-border bg-card px-4 py-3 text-base outline-none focus:ring-2 focus:ring-primary/30";
  return (
    <div>
      <label htmlFor="receipt_width" className="block text-base font-medium mb-1">Receipt Print Size</label>
      <select id="receipt_width" name="receipt_width" defaultValue="standard" className={cls}>
        <option value="standard">Letter (8.5&quot; x 11&quot;)</option>
        <option value="thermal">Thermal (3.25&quot; / 80mm)</option>
      </select>
    </div>
  );
}

function FuelChargeField() {
  const cls = "w-full rounded-lg border border-border bg-card px-4 py-3 text-base outline-none focus:ring-2 focus:ring-primary/30";
  return (
    <div>
      <label htmlFor="fuel_charge" className="block text-base font-medium mb-1">Fuel Charge ($)</label>
      <input id="fuel_charge" name="fuel_charge" type="number" step="0.01" min="0" defaultValue="0" className={cls} placeholder="0.00" />
    </div>
  );
}
