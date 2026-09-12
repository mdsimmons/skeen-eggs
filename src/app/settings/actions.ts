"use server";

import { setSetting } from "@/lib/queries";
import { revalidatePath } from "next/cache";

export async function saveSettings(formData: FormData) {
  const entries = formData.entries();
  for (const [key, value] of entries) {
    await setSetting(key, value as string);
  }
  revalidatePath("/settings");
  revalidatePath("/reports");
  revalidatePath("/");
  revalidatePath("/api/logo");
}
