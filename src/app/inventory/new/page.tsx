import { getAllCategories } from "@/lib/queries";
import NewProductForm from "./NewProductForm";

export default async function NewProductPage() {
  const categories = await getAllCategories();
  return <NewProductForm categories={categories} />;
}
