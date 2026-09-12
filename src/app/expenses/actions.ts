"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createExpense, updateExpense, deleteExpense } from "@/lib/queries";

export async function createExpenseAction(formData: FormData) {
  const description = (formData.get("description") as string)?.trim();
  const amount = parseFloat(formData.get("amount") as string);
  if (!description || isNaN(amount)) throw new Error("Description and amount required");
  await createExpense({
    description,
    amount,
    category: (formData.get("category") as string) || "general",
    date: (formData.get("date") as string) || new Date().toISOString().split("T")[0],
    notes: (formData.get("notes") as string) || "",
  });
  revalidatePath("/expenses");
  revalidatePath("/");
  redirect("/expenses");
}

export async function updateExpenseAction(id: number, formData: FormData) {
  const description = (formData.get("description") as string)?.trim();
  const amount = parseFloat(formData.get("amount") as string);
  if (!description || isNaN(amount)) throw new Error("Description and amount required");
  await updateExpense(id, {
    description,
    amount,
    category: (formData.get("category") as string) || "general",
    date: (formData.get("date") as string) || new Date().toISOString().split("T")[0],
    notes: (formData.get("notes") as string) || "",
  });
  revalidatePath("/expenses");
  revalidatePath("/");
  redirect("/expenses");
}

export async function deleteExpenseAction(id: number) {
  await deleteExpense(id);
  revalidatePath("/expenses");
  revalidatePath("/");
  redirect("/expenses");
}
