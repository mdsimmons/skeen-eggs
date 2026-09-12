import { getAllProducts, getAllCustomers } from "@/lib/queries";
import { toPlain } from "@/lib/db";
import NewSaleForm from "./NewSaleForm";

export default async function NewSalePage() {
  const [products, customers] = await Promise.all([getAllProducts(), getAllCustomers()]);

  return <NewSaleForm products={toPlain(products)} customers={toPlain(customers)} />;
}
