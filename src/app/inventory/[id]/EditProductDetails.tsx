"use client";

import { UNIT_OPTIONS } from "@/lib/constants";
import { updateProductDetailsAction } from "../actions";
import type { Product, Category } from "@/lib/db";

export default function EditProductDetails({
  product,
  categories,
}: {
  product: Product;
  categories: Category[];
}) {
  const cls =
    "w-full bg-background border border-border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";

  return (
    <form action={(formData) => updateProductDetailsAction(product.id, formData)} className="space-y-4">
      <div>
        <label className="block text-base font-medium mb-1">Name</label>
        <input type="text" name="name" required defaultValue={product.name} className={cls} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-base font-medium mb-1">Category</label>
          <select name="category" defaultValue={product.category} className={cls}>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-base font-medium mb-1">Unit</label>
          <select name="unit" defaultValue={product.unit} className={cls}>
            {UNIT_OPTIONS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-base font-medium mb-1">Price ($)</label>
          <input type="number" name="price" step="0.01" min="0" defaultValue={product.price} className={cls} />
        </div>
        <div>
          <label className="block text-base font-medium mb-1">Cost ($)</label>
          <input type="number" name="cost" step="0.01" min="0" defaultValue={product.cost} className={cls} />
        </div>
      </div>

      <div>
        <label className="block text-base font-medium mb-1">Low Stock Alert</label>
        <input type="number" name="low_stock_threshold" min="0" defaultValue={product.low_stock_threshold} className={cls} />
      </div>

      <div>
        <label className="block text-base font-medium mb-1">Units per Case (0 = off)</label>
        <input type="number" name="case_size" min="0" step="0.5" defaultValue={product.case_size} className={cls} />
        <p className="text-xs text-muted mt-1">e.g. 30 dozen = 1 case. Shows case counts while building orders.</p>
      </div>

      <div>
        <label className="block text-base font-medium mb-1">Notes</label>
        <textarea name="notes" rows={3} defaultValue={product.notes} className={`${cls} resize-none`} />
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="quick_pull"
            defaultChecked={product.quick_pull === 1}
            className="w-5 h-5 rounded border-border text-primary focus:ring-primary/30"
          />
          <span className="text-base font-medium">Quick Pull</span>
        </label>
      </div>

      <button
        type="submit"
        className="w-full bg-primary text-white rounded-lg py-3.5 text-base font-semibold hover:bg-primary-light transition-colors"
      >
        Save Changes
      </button>
    </form>
  );
}
