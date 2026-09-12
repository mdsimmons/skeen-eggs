import Link from "next/link";
import { getAllCategories, countProductsByCategory } from "@/lib/queries";
import { createCategoryAction } from "./actions";
import AddCategoryForm from "./AddCategoryForm";
import DeleteCategoryButton from "./DeleteCategoryButton";

export default async function CategoriesPage() {
  const [categories, counts] = await Promise.all([
    getAllCategories(),
    countProductsByCategory(),
  ]);

  const countMap = new Map(counts.map((c) => [c.category, c.count]));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/inventory"
          className="text-muted hover:text-foreground transition-colors"
        >
          ← Back
        </Link>
        <h1 className="text-2xl font-bold">Categories</h1>
      </div>

      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <h2 className="text-sm font-semibold">Add Category</h2>
        <AddCategoryForm action={createCategoryAction} />
      </div>

      <div className="bg-card rounded-xl border border-border divide-y divide-border">
        {categories.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted text-center">
            No categories yet. Add one above.
          </p>
        ) : (
          categories.map((cat) => {
            const inUse = (countMap.get(cat.value) ?? 0) > 0;
            return (
              <div
                key={cat.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{cat.label}</span>
                  <span className="text-xs text-muted">
                    {countMap.get(cat.value) ?? 0} product(s)
                  </span>
                </div>
                <DeleteCategoryButton
                  id={cat.id}
                  label={cat.label}
                  inUse={inUse}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
