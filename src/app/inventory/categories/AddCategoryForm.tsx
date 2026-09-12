"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

type State = { error?: string } | null;

export default function AddCategoryForm({
  action,
}: {
  action: (prev: State, formData: FormData) => Promise<State>;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, null);

  useEffect(() => {
    if (state && !state.error) {
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          name="label"
          required
          placeholder="New category name"
          className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
        <button
          type="submit"
          disabled={isPending}
          className="bg-primary text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-primary-light transition-colors disabled:opacity-50"
        >
          {isPending ? "Adding..." : "Add"}
        </button>
      </div>
      {state?.error && (
        <p className="text-sm text-danger">{state.error}</p>
      )}
    </form>
  );
}
