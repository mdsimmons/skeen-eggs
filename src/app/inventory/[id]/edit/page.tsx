import { notFound } from "next/navigation";
import { getProductById, getAllCategories } from "@/lib/queries";
import { toPlainOne } from "@/lib/db";
import EditProductForm from "./EditProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = toPlainOne(await getProductById(parseInt(id)));
  const categories = await getAllCategories();

  if (!product) {
    notFound();
  }

  return <EditProductForm product={product} categories={categories} />;
}
