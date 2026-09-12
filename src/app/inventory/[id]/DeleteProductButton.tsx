"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteProductAction } from "../actions";

export default function DeleteProductButton({ productId }: { productId: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (!confirm("Delete this product?")) return;
        startTransition(async () => {
          await deleteProductAction(productId);
          router.push("/inventory");
        });
      }}
      disabled={isPending}
      className="text-sm text-danger font-medium hover:underline disabled:opacity-50"
    >
      {isPending ? "Deleting..." : "Delete Product"}
    </button>
  );
}
