"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function SearchBar() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSearch(formData: FormData) {
    const q = (formData.get("q") as string)?.trim();
    if (!q) return;
    startTransition(() => {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    });
  }

  return (
    <form action={handleSearch} className="flex gap-2">
      <input
        name="q"
        placeholder="Search products, customers..."
        className="flex-1 rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
      />
      <button
        type="submit"
        disabled={isPending}
        className="px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-light transition-colors disabled:opacity-50"
      >
        {isPending ? "..." : "Search"}
      </button>
    </form>
  );
}
