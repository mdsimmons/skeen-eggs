import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById, getAllCategories } from "@/lib/queries";
import { toPlainOne } from "@/lib/db";
import StockAdjuster from "./StockAdjuster";
import EditProductDetails from "./EditProductDetails";
import DeleteProductButton from "./DeleteProductButton";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rawProduct = await getProductById(parseInt(id));
  const product = toPlainOne(rawProduct);
  const categories = await getAllCategories();

  if (!product) {
    notFound();
  }

  const margin =
    product.price > 0
      ? ((product.price - product.cost) / product.price) * 100
      : 0;

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex items-center gap-3">
        <Link
          href="/inventory"
          className="w-12 h-12 flex items-center justify-center rounded-lg border border-border hover:bg-muted-bg transition-colors text-base font-medium"
        >
          ← Back
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Product Info */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-semibold text-lg mb-4">Details</h2>
          <EditProductDetails product={product} categories={categories} />
        </div>

        {/* Stock & Profit */}
        <div className="space-y-5">
          <StockAdjuster
            productId={product.id}
            currentStock={product.stock}
            lowStockThreshold={product.low_stock_threshold}
          />

          {/* Profit Margin */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-base font-semibold mb-3">Profit Margin</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-base">
                <span className="text-muted">Margin per unit</span>
                <span className="font-medium">
                  ${(product.price - product.cost).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-muted">Margin %</span>
                <span
                  className={`font-medium ${
                    margin > 0 ? "text-success" : "text-danger"
                  }`}
                >
                  {margin.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete */}
      <div className="flex justify-end">
        <DeleteProductButton productId={product.id} />
      </div>
    </div>
  );
}
