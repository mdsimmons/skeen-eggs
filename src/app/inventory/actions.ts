"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createProduct as dbCreateProduct,
  updateProduct as dbUpdateProduct,
  deleteProduct as dbDeleteProduct,
  adjustStock as dbAdjustStock,
} from "@/lib/queries";

export async function createProductAction(formData: FormData) {
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const unit = formData.get("unit") as string;
  const price = parseFloat(formData.get("price") as string) || 0;
  const cost = parseFloat(formData.get("cost") as string) || 0;
  const stock = parseInt(formData.get("stock") as string) || 0;
  const low_stock_threshold = parseInt(formData.get("low_stock_threshold") as string) || 5;
  const case_size = parseFloat(formData.get("case_size") as string) || 0;
  const notes = (formData.get("notes") as string) || "";
  const quick_pull = formData.get("quick_pull") === "on" ? 1 : 0;

  if (!name) {
    throw new Error("Product name is required");
  }

  await dbCreateProduct({
    name,
    category,
    unit,
    price,
    cost,
    stock,
    low_stock_threshold,
    active: 1,
    notes,
    image: "",
    quick_pull,
    case_size,
  });

  revalidatePath("/inventory");
  redirect("/inventory");
}

export async function updateProductAction(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const unit = formData.get("unit") as string;
  const price = parseFloat(formData.get("price") as string) || 0;
  const cost = parseFloat(formData.get("cost") as string) || 0;
  const stock = parseInt(formData.get("stock") as string) || 0;
  const low_stock_threshold = parseInt(formData.get("low_stock_threshold") as string) || 5;
  const case_size = parseFloat(formData.get("case_size") as string) || 0;
  const notes = (formData.get("notes") as string) || "";
  const quick_pull = formData.get("quick_pull") === "on" ? 1 : 0;

  if (!name) {
    throw new Error("Product name is required");
  }

  await dbUpdateProduct(id, {
    name,
    category,
    unit,
    price,
    cost,
    stock,
    low_stock_threshold,
    notes,
    quick_pull,
    case_size,
  });

  revalidatePath("/inventory");
  revalidatePath(`/inventory/${id}`);
  redirect(`/inventory/${id}`);
}

export async function updateProductDetailsAction(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const unit = formData.get("unit") as string;
  const price = parseFloat(formData.get("price") as string) || 0;
  const cost = parseFloat(formData.get("cost") as string) || 0;
  const low_stock_threshold = parseInt(formData.get("low_stock_threshold") as string) || 5;
  const case_size = parseFloat(formData.get("case_size") as string) || 0;
  const notes = (formData.get("notes") as string) || "";
  const quick_pull = formData.get("quick_pull") === "on" ? 1 : 0;

  if (!name) {
    throw new Error("Product name is required");
  }

  await dbUpdateProduct(id, {
    name,
    category,
    unit,
    price,
    cost,
    low_stock_threshold,
    notes,
    quick_pull,
    case_size,
  });

  revalidatePath("/inventory");
  revalidatePath(`/inventory/${id}`);
}

export async function deleteProductAction(id: number) {
  await dbDeleteProduct(id);
  revalidatePath("/inventory");
  redirect("/inventory");
}

export async function adjustStockAction(id: number, delta: number) {
  await dbAdjustStock(id, delta);
  revalidatePath("/inventory");
  revalidatePath(`/inventory/${id}`);
}
