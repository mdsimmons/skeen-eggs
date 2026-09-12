"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createCustomer, updateCustomer, deleteCustomer } from "@/lib/queries";

export async function createCustomerAction(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  if (!name) throw new Error("Name is required");
  await createCustomer({
    name,
    phone: (formData.get("phone") as string) || "",
    email: (formData.get("email") as string) || "",
    address: (formData.get("address") as string) || "",
    notes: (formData.get("notes") as string) || "",
    receipt_width: (formData.get("receipt_width") as string) || "standard",
    fuel_charge: parseFloat(formData.get("fuel_charge") as string) || 0,
  });
  revalidatePath("/customers");
  redirect("/customers");
}

export async function updateCustomerAction(id: number, formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  if (!name) throw new Error("Name is required");
  await updateCustomer(id, {
    name,
    phone: (formData.get("phone") as string) || "",
    email: (formData.get("email") as string) || "",
    address: (formData.get("address") as string) || "",
    notes: (formData.get("notes") as string) || "",
    receipt_width: (formData.get("receipt_width") as string) || "standard",
    fuel_charge: parseFloat(formData.get("fuel_charge") as string) || 0,
  });
  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  redirect(`/customers/${id}`);
}

export async function deleteCustomerAction(id: number) {
  await deleteCustomer(id);
  revalidatePath("/customers");
  redirect("/customers");
}
