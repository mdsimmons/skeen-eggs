"use server";

import { revalidatePath } from "next/cache";
import { settleInvoice as settleInvoiceQuery, deleteInvoice } from "@/lib/queries";

export async function settleInvoice(invoiceId: number, amount: number, paymentMethod?: string) {
  await settleInvoiceQuery(invoiceId, amount, paymentMethod);
  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/sales");
  revalidatePath("/");
  revalidatePath("/customers");

  return { success: true };
}

export async function deleteInvoiceAction(invoiceId: number) {
  await deleteInvoice(invoiceId);
  revalidatePath("/sales");
  revalidatePath("/");
  revalidatePath("/inventory");
  revalidatePath("/customers");

  return { success: true };
}
