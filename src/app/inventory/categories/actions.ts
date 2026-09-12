"use server";

import { revalidatePath } from "next/cache";
import {
  createCategory as dbCreateCategory,
  deleteCategory as dbDeleteCategory,
  getAllCategories,
  countProductsByCategory,
} from "@/lib/queries";

type State = { error?: string } | null;

export async function createCategoryAction(
  prev: State,
  formData: FormData
): Promise<State> {
  const label = ((formData.get("label") as string) || "").trim();
  if (!label) {
    return { error: "Category name is required" };
  }
  const value = slugify(label);

  try {
    await dbCreateCategory(value, label);
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message.includes("UNIQUE")) {
      return { error: `Category "${label}" already exists` };
    }
    return { error: "Could not create category" };
  }

  revalidatePath("/inventory");
  revalidatePath("/inventory/categories");
  return {};
}

export async function deleteCategoryAction(id: number): Promise<State> {
  const categories = await getAllCategories();
  const category = categories.find((c) => c.id === id);
  if (!category) {
    return { error: "Category not found" };
  }

  const counts = await countProductsByCategory();
  const inUse = counts.find((c) => c.category === category.value)?.count ?? 0;
  if (inUse > 0) {
    return { error: `Move ${inUse} product(s) out of "${category.label}" before deleting` };
  }

  await dbDeleteCategory(id);
  revalidatePath("/inventory");
  revalidatePath("/inventory/categories");
  return {};
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
