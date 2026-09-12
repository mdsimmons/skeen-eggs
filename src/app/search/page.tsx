import Link from "next/link";
import { search } from "@/lib/queries";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const results = q ? await search(q) : [];

  const grouped = {
    product: results.filter((r) => r.type === "product"),
    customer: results.filter((r) => r.type === "customer"),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-muted hover:text-foreground text-sm">Home</Link>
        <span className="text-muted">/</span>
        <h1 className="text-2xl font-bold">Search</h1>
      </div>

      {!q ? (
        <p className="text-muted">Enter a search term</p>
      ) : results.length === 0 ? (
        <p className="text-muted">No results for &ldquo;{q}&rdquo;</p>
      ) : (
        <>
          {grouped.product.length > 0 && (
            <div>
              <h2 className="font-semibold text-sm text-muted mb-2">Products ({grouped.product.length})</h2>
              <div className="space-y-2">
                {grouped.product.map((r) => (
                  <Link
                    key={`product-${r.id}`}
                    href={`/inventory/${r.id}`}
                    className="flex items-center justify-between bg-card rounded-xl border border-border p-3 hover:bg-muted-bg transition-colors"
                  >
                    <p className="text-sm font-medium">{r.name}</p>
                    <p className="text-xs text-muted">{r.detail}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {grouped.customer.length > 0 && (
            <div>
              <h2 className="font-semibold text-sm text-muted mb-2">Customers ({grouped.customer.length})</h2>
              <div className="space-y-2">
                {grouped.customer.map((r) => (
                  <Link
                    key={`customer-${r.id}`}
                    href={`/customers/${r.id}`}
                    className="flex items-center justify-between bg-card rounded-xl border border-border p-3 hover:bg-muted-bg transition-colors"
                  >
                    <p className="text-sm font-medium">{r.name}</p>
                    <p className="text-xs text-muted">{r.detail}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
