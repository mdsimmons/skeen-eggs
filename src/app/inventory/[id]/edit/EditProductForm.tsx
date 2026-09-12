"use client";

import Link from "next/link";
import { UNIT_OPTIONS } from "@/lib/constants";
import { updateProductAction } from "../../actions";
import type { Product, Category } from "@/lib/db";

export default function EditProductForm({
  product,
  categories,
}: {
  product: Product;
  categories: Category[];
}) {
  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex items-center gap-3">
        <Link
          href={`/inventory/${product.id}`}
          className="w-12 h-12 flex items-center justify-center rounded-lg border border-border hover:bg-muted-bg transition-colors text-base font-medium"
        >
          ← Back
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold">Edit Product</h1>
      </div>

      <form
        action={(formData) => updateProductAction(product.id, formData)}
        className="bg-card rounded-xl border border-border p-5 space-y-4"
      >
        <div>
          <label htmlFor="name" className="block text-base font-medium mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            defaultValue={product.name}
            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="category" className="block text-base font-medium mb-1">
              Category
            </label>
            <select
              id="category"
              name="category"
              defaultValue={product.category}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="unit" className="block text-base font-medium mb-1">
              Unit
            </label>
            <select
              id="unit"
              name="unit"
              defaultValue={product.unit}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            >
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
            <label htmlFor="price" className="block text-base font-medium mb-1">
              Price ($)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              step="0.01"
              min="0"
              defaultValue={product.price}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="cost" className="block text-base font-medium mb-1">
              Cost ($)
            </label>
            <input
              type="number"
              id="cost"
              name="cost"
              step="0.01"
              min="0"
              defaultValue={product.cost}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="stock" className="block text-base font-medium mb-1">
              Stock
            </label>
            <input
              type="number"
              id="stock"
              name="stock"
              min="0"
              defaultValue={product.stock}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          <div>
            <label
              htmlFor="low_stock_threshold"
              className="block text-base font-medium mb-1"
            >
              Low Stock Threshold
            </label>
            <input
              type="number"
              id="low_stock_threshold"
              name="low_stock_threshold"
              min="0"
              defaultValue={product.low_stock_threshold}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-base font-medium mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={product.notes}
            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="quick_pull"
            defaultChecked={product.quick_pull === 1}
            className="w-5 h-5 rounded border-border text-primary focus:ring-primary/30"
          />
          <span className="text-base font-medium">Quick Pull</span>
        </label>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-primary text-white rounded-lg py-3.5 text-base font-semibold hover:bg-primary-light transition-colors"
          >
            Save Changes
          </button>
          <Link
            href={`/inventory/${product.id}`}
            className="flex-1 bg-muted-bg text-foreground border border-border rounded-lg py-3.5 text-base font-semibold text-center hover:bg-border transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
