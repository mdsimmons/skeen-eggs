import { getExpenseById } from "@/lib/queries";
import { toPlainOne } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import EditExpenseForm from "./EditExpenseForm";

export default async function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const expense = toPlainOne(await getExpenseById(Number(id)));
  if (!expense) return notFound();

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/expenses" className="text-muted hover:text-foreground text-sm">Expenses</Link>
        <span className="text-muted">/</span>
        <h1 className="text-2xl font-bold">Edit</h1>
      </div>
      <EditExpenseForm expense={expense} />
    </div>
  );
}
