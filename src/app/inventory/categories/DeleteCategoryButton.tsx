"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCategoryAction } from "./actions";

export default function DeleteCategoryButton({
  id,
  label,
  inUse,
}: {
  id: number;
  label: string;
  inUse: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Delete category "${label}"?`)) return;
    startTransition(async () => {
      const result = await deleteCategoryAction(id);
      if (result?.error) {
        alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      title={inUse ? "Move products out of this category before deleting" : "Delete category"}
      className="text-danger text-sm font-medium hover:underline disabled:opacity-50"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
