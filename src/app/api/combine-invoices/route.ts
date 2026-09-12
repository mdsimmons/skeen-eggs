import { NextResponse, type NextRequest } from "next/server";
import { combineInvoices } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { invoiceIds?: number[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const invoiceIds = (body.invoiceIds || []).filter((n) => typeof n === "number" && Number.isInteger(n) && n > 0);
  if (invoiceIds.length < 2) {
    return NextResponse.json({ error: "Select at least two invoices" }, { status: 400 });
  }
  try {
    const targetId = await combineInvoices(invoiceIds);
    return NextResponse.json({ ok: true, invoiceId: targetId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to combine invoices";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}