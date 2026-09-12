"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteCustomerAction } from "../actions";

export default function DeleteCustomerButton({ customerId }: { customerId: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (!confirm("Delete this customer? Invoices will be kept.")) return;
        startTransition(async () => {
          await deleteCustomerAction(customerId);
          router.push("/customers");
        });
      }}
      disabled={isPending}
      className="px-4 py-2.5 border border-danger/30 text-danger rounded-lg text-sm font-medium hover:bg-danger-bg transition-colors disabled:opacity-50"
    >
      {isPending ? "..." : "Delete"}
    </button>
  );
}
