import Link from "next/link";
import { getAllProducts, getLowStockProducts, getAllCategories, searchProducts, getQuickPullProducts } from "@/lib/queries";
import type { Product } from "@/lib/db";

function StockBadge({ product }: { product: Product }) {
  if (product.stock === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-sm font-medium text-white bg-danger rounded-full px-2 py-0.5">
        Out of stock
      </span>
    );
  }
  if (product.stock <= product.low_stock_threshold) {
    return (
      <span className="inline-flex items-center gap-1 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-full px-2 py-0.5">
        Low stock
      </span>
    );
  }
  return null;
}

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const allProducts = q ? await searchProducts(q) : await getAllProducts();
  const lowStockProducts = await getLowStockProducts();
  const categories = await getAllCategories();
  const quickPullProducts = await getQuickPullProducts();

  const grouped = categories.reduce(
    (acc, cat) => {
      const items = allProducts.filter((p) => p.category === cat.value);
      if (items.length > 0) acc[cat.value] = { label: cat.label, items };
      return acc;
    },
    {} as Record<string, { label: string; items: Product[] }>
  );

  const uncategorized = allProducts.filter(
    (p) => !categories.some((c) => c.value === p.category)
  );
  if (uncategorized.length > 0) {
    grouped["other"] = { label: "Other", items: uncategorized };
  }

  const activeCategory = category && grouped[category] ? grouped[category] : null;
  const showCategories = !category && !q;
  const showProducts = !!activeCategory || !!q;

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          {activeCategory ? (
            <div className="flex items-center gap-2">
              <Link
                href="/inventory"
                className="w-12 h-12 flex items-center justify-center rounded-lg border border-border hover:bg-muted-bg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold">{activeCategory.label}</h1>
            </div>
          ) : (
            <h1 className="text-2xl font-bold">Inventory</h1>
          )}
          <p className="text-base text-muted mt-1">
            {activeCategory ? activeCategory.items.length : allProducts.length} products
            {lowStockProducts.length > 0 && (
              <span className="ml-2 text-danger font-medium">
                · {lowStockProducts.length} low stock
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/inventory/categories"
            className="bg-muted-bg text-foreground border border-border rounded-lg px-5 py-3 text-base font-semibold hover:bg-border transition-colors"
          >
            Categories
          </Link>
          <Link
            href="/inventory/new"
            className="bg-primary text-white rounded-lg px-5 py-3 text-base font-semibold hover:bg-primary-light transition-colors"
          >
            + Add Product
          </Link>
        </div>
      </div>

      {/* Search */}
      <form>
        <div className="relative">
          <input
            type="text"
            name="q"
            placeholder="Search products..."
            defaultValue={q}
            className="w-full bg-card border border-border rounded-lg px-5 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          {q && (
            <Link
              href="/inventory"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground text-base"
            >
              Clear
            </Link>
          )}
        </div>
      </form>

      {/* Category grid */}
      {showCategories && (
        <>
          {Object.keys(grouped).length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <p className="text-muted text-base">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Object.entries(grouped).map(([slug, { label, items }]) => {
                const hasLowStock = items.some((p) => p.stock > 0 && p.stock <= p.low_stock_threshold);
                const outOfStock = items.filter((p) => p.stock === 0).length;
                return (
                  <Link
                    key={slug}
                    href={`/inventory?category=${slug}`}
                    className="p-5 border border-border rounded-lg hover:border-primary transition-colors bg-card"
                  >
                    <p className="font-medium text-base truncate">{label}</p>
                    <p className="text-primary font-bold text-xl">{items.length}</p>
                    <p className="text-sm text-muted">
                      {outOfStock > 0 ? (
                        <span className="text-danger">{outOfStock} out of stock</span>
                      ) : hasLowStock ? (
                        <span className="text-yellow-600">Low stock</span>
                      ) : (
                        "In stock"
                      )}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Product list (category selected or search active) */}
      {showProducts && (
        <>
          {Object.keys(grouped).length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <p className="text-muted text-base">No products found</p>
            </div>
          ) : (
            Object.entries(grouped).map(([catSlug, { label, items }]) => {
              if (activeCategory && catSlug !== category) return null;
              return (
                <div key={catSlug} className="space-y-2">
                  {!activeCategory && (
                    <h2 className="text-sm font-semibold text-muted uppercase tracking-wide px-1">
                      {label}
                    </h2>
                  )}
                  <div className="bg-card rounded-xl border border-border divide-y divide-border">
                    {items.map((product) => (
                      <Link
                        key={product.id}
                        href={`/inventory/${product.id}`}
                        className="flex items-center justify-between px-5 py-4 hover:bg-muted-bg transition-colors"
                      >
                        <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base font-medium truncate">
                              {product.name}
                            </span>
                            <StockBadge product={product} />
                          </div>
                          <span className="text-sm text-muted">
                            ${product.price.toFixed(2)} / {product.unit}
                          </span>
                        </div>
                        <div className="text-right ml-3">
                          <span
                            className={`text-base font-semibold ${
                              product.stock === 0
                                ? "text-danger"
                                : product.stock <= product.low_stock_threshold
                                  ? "text-yellow-600"
                                  : "text-success"
                            }`}
                          >
                            {product.stock}
                          </span>
                          <span className="text-sm text-muted block">{product.unit}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </>
      )}

      {/* Quick Pull */}
      {!q && quickPullProducts.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide px-1">
            Quick Pull
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {quickPullProducts.map((product) => (
              <Link
                key={product.id}
                href={`/inventory/${product.id}`}
                className="p-5 border border-border rounded-lg hover:border-primary transition-colors bg-card"
              >
                <p className="font-medium text-base truncate">{product.name}</p>
                <p className="text-primary font-bold text-xl">${product.price.toFixed(2)}</p>
                <p className={`text-sm ${
                  product.stock === 0 ? "text-danger" : product.stock <= product.low_stock_threshold ? "text-yellow-600" : "text-success"
                }`}>
                  {product.stock} {product.unit} left
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
